---
title: Elasticsearch 写入链路
description: Primary、Replica、Translog、Refresh、Flush 与 Merge
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# Elasticsearch 写入链路

## 源章节：写入链路：Primary/Replica、Translog、Refresh、Flush、Merge

### 4.1 单文档写入流程

客户端写入可以打到任意节点。收到请求的节点成为 coordinating node，根据 routing 计算目标 primary shard，把请求转发给主分片。主分片写入成功后并行/顺序复制到副本，达到等待条件后返回客户端。

**写入链路**

> Client
>
> -\> Coordinating Node
>
> -\> routing hash(\_routing or \_id) % number_of_primary_shards
>
> -\> Primary Shard
>
> -\> Lucene indexing buffer
>
> -\> Translog append + fsync policy
>
> -\> Replica Shards
>
> -\> ack to coordinator
>
> -\> response to client

### 4.2 Routing 规则

默认 routing 使用 \_id。自定义 routing 可以把同一用户、同一租户、同一订单域的数据放到固定 shard 上，减少查询扇出。但 routing 值低基数会导致热点 shard，必须保证足够分散。

| **策略**          | **优点**                   | **风险**                     |
|-------------------|----------------------------|------------------------------|
| 默认 \_id         | 均匀、简单                 | 按用户查询可能扇出所有 shard |
| user_id routing   | 用户维度查询只查一个 shard | 大客户可能形成热点           |
| tenant_id routing | 多租户隔离更好             | 租户规模差异大时不均衡       |
| 复合 routing      | 兼顾分散和局部性           | 实现复杂，需要全链路统一     |

### 4.3 Translog

Lucene commit 代价较高，不能每次写入都提交。ES 会把写操作写入 translog。节点崩溃后，最近已确认但尚未包含在 Lucene commit 中的操作可以通过 translog 重放恢复。默认 request durability 下，请求只有在主分片和已分配副本的 translog fsync/commit 后才返回成功。

**Translog 要点**

> 写入成功条件（默认 durability=request）：
>
> 1\. Primary Lucene 内部处理完成
>
> 2\. Primary translog fsync/commit
>
> 3\. Replica 执行并按策略确认
>
> 4\. Coordinator 返回成功
>
> 如果 durability=async：吞吐更高，但崩溃前最近一小段写入可能丢失。

### 4.4 Refresh、Flush、Merge 区别

| **动作** | **做什么**                                      | **是否让数据可搜索** | **是否持久化到 Lucene commit** | **生产影响**                    |
|----------|-------------------------------------------------|----------------------|--------------------------------|---------------------------------|
| Refresh  | 把内存 buffer 生成新的 searchable segment       | 是                   | 不是完整持久化                 | 频繁会产生小 segment，降低写入  |
| Flush    | 执行 Lucene commit 并开启新 translog generation | 通常已经可搜索       | 是                             | 降低恢复重放成本                |
| Merge    | 合并多个 segment，清理删除文档                  | 不改变逻辑可见性     | 生成新 segment                 | 消耗 CPU/IO，可能影响写入和查询 |

### 4.5 Refresh Interval 调优

refresh 是近实时搜索的关键。写入密集场景，调大 refresh_interval 可以显著提升写入吞吐；批量导入时可以临时设置为 -1，导入完成后恢复。代价是新写入数据在搜索中可见的延迟变大。

**写入优化设置**

> PUT /my-index/\_settings
>
> {
>
> "index": {
>
> "refresh_interval": "30s"
>
> }
>
> }
>
> \# 大批量离线导入：临时关闭 refresh
>
> PUT /my-index/\_settings
>
> {
>
> "index": {
>
> "refresh_interval": "-1",
>
> "number_of_replicas": 0
>
> }
>
> }
>
> \# 导入完成后恢复
>
> PUT /my-index/\_settings
>
> {
>
> "index": {
>
> "refresh_interval": "5s",
>
> "number_of_replicas": 1
>
> }
>
> }
>
> POST /my-index/\_refresh

### 4.6 Bulk 写入最佳实践

- 通过压测找到合适 bulk size。常见起点是 5MB 到 15MB 或 1000 到 5000 条，但最终以响应时间、拒绝率和节点资源为准。

- 客户端并发要逐步增加，观察 thread_pool.write/bulk rejected、CPU、IO wait、merge time、GC。

- bulk 请求过小吞吐低，过大会导致协调节点内存压力、网络包过大、失败重试成本高。

- 失败重试要区分 429/503 可重试、400 mapping 错误不可盲目重试。

### 4.7 Update 与 Delete

ES 的 update 不是原地修改倒排索引，而是读取旧文档、合并局部字段、删除旧版本、写入新版本。高频局部更新会产生大量 deleted docs 和 merge 压力。计数器、余额、库存等高频强一致数据不适合作为唯一源存 ES。

> **生产经验**
>
> 写多读少的热数据，不要每秒更新同一批文档。可以先写 Kafka/数据库，聚合后批量刷新 ES；或者把高频变动字段拆分到 Redis/DB，在查询服务层融合。
