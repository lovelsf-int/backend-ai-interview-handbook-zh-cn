---
title: 分片、路由与容量规划
description: 分片代价、路由、副本、热点、Rollover 和容量估算
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# 分片、路由与容量规划

## 源章节：分片、副本、路由与容量规划

> 容量边界：分片大小、分片数、磁盘余量和副本数都是压测起点，不是脱离数据模型、查询复杂度、硬件和恢复目标的固定答案。

## SOC 项目入口

每日 800～900 万 Event + Alert、Primary 合计约 150GB 的项目推导见
[SOC 事件、告警分层与容量设计](./17-soc-event-alert-capacity.md)。本页保留通用分片原理，项目页负责数据口径、逐流估算与 Rollover 验收，避免维护两套容量答案。

### 7.1 Shard 本质与代价

一个 shard 是一个 Lucene index。Shard 是 ES 分布式并行的基础，但不是越多越好。每个 shard 都有文件句柄、segment、缓存、线程调度和 cluster state 开销。过多小 shard 是生产集群最常见的性能问题之一。

### 7.2 分片大小经验

源资料将 10GB～50GB 和 2 亿文档作为初始估算范围；它们不是与版本、硬件和工作负载无关的统一上限。更大的 shard 恢复慢、查询慢；太小的 shard 管理开销高。

| **场景**     | **建议**                                                   | **原因**                       |
|--------------|------------------------------------------------------------|--------------------------------|
| 日志/时序    | data stream + ILM rollover，按 max_primary_shard_size 控制 | 自动滚动，避免日索引过大或过小 |
| 订单/商品    | 按总数据量和增长周期规划主分片                             | 兼顾查询并发和恢复时间         |
| 小业务索引   | 少分片，甚至 1 primary                                     | 避免大量小 shard               |
| 超大历史数据 | 冷热分层，冷数据降低副本或用 searchable snapshot           | 降低成本                       |

### 7.3 分片数估算公式

**容量估算**

> 预估主分片数 = 目标周期内主数据总量 / 目标单主分片大小
>
> 示例：
>
> 每天订单索引预计 600GB，目标单主分片 40GB：
>
> primary_shards = 600 / 40 = 15
>
> 如果每个主分片 1 副本，实际磁盘约 600GB \* 2 + segment/merge/水位冗余。
>
> 注意：
>
> 1\. number_of_primary_shards 创建后不能直接修改，只能 split/shrink/reindex。
>
> 2\. 副本数可以动态调整。
>
> 3\. 容量规划要预留 20%~30% 磁盘水位和 merge 临时空间。

### 7.4 副本设计

- 副本提供高可用：主分片丢失时副本可提升为主分片。

- 副本提升读吞吐：搜索可以在主分片或副本上执行。

- 副本增加写入成本：写入需要复制到副本；初次大批量导入可临时设置 replicas=0。

- 副本数应由可用性、恢复时间和成本目标决定；选择 0 副本时必须验证快照与恢复流程。

### 7.5 热点 Shard

热点 shard 来自数据倾斜、routing 不均、时间索引写入集中、少数租户流量过大、聚合字段高基数等。热点 shard 会导致某些节点 CPU/IO 高，而集群整体资源看似还有余量。

**热点排查命令**

> \# 查看 shard 分布和大小
>
> GET \_cat/shards?v=true&h=index,shard,prirep,state,docs,store,node&s=store:desc
>
> \# 查看节点资源
>
> GET \_cat/nodes?v&h=ip,name,heap.percent,ram.percent,cpu,load_1m,node.role,disk.used_percent,master
>
> \# 查看每个节点 shard 数
>
> GET \_cat/allocation?v

### 7.6 Rollover、Split、Shrink

| **能力** | **用途**                           | **典型场景**              |
|----------|------------------------------------|---------------------------|
| Rollover | 达到大小/文档数/时间后创建新写索引 | 日志、指标、订单流水      |
| Split    | 把索引拆成更多主分片               | 初始分片偏少且需要扩展    |
| Shrink   | 把索引缩成更少主分片               | 热索引转冷后减少 shard 数 |
| Reindex  | 重建索引并改变 mapping/settings    | 字段类型错误、分词变更    |
