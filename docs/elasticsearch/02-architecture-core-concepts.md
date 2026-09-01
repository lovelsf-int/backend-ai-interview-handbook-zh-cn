---
title: Elasticsearch 架构与核心概念
description: 集群、节点、索引、分片、节点角色和集群状态
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# Elasticsearch 架构与核心概念

## 源章节：Elasticsearch 总体架构与核心概念

> 角色与拓扑需要结合目标 Elasticsearch 版本和部署形态复核；不要把单一规模下的节点拆分方案当成通用规则。

### 2.1 集群、节点、索引、分片

ES 的基本部署单位是 cluster。一个 cluster 由多个 node 组成。一个 index 被拆分为多个 primary shard，每个 primary shard 可以有 0 个或多个 replica shard。每个 shard 本质上是一个 Lucene index。

**集群逻辑结构**

> Cluster
>
> ├─ Node A: master-eligible / data_hot / ingest
>
> ├─ Node B: data_hot
>
> ├─ Node C: data_hot
>
> └─ Index: order_v1
>
> ├─ Primary Shard 0 -\> Replica Shard 0
>
> ├─ Primary Shard 1 -\> Replica Shard 1
>
> └─ Primary Shard 2 -\> Replica Shard 2

| **概念** | **本质**        | **生产关注点**                                 |
|----------|-----------------|------------------------------------------------|
| Cluster  | 一个 ES 集群    | 版本一致、节点角色、主节点稳定性、集群状态大小 |
| Node     | 一个 ES 进程    | 角色、Heap、磁盘、CPU、网络、GC                |
| Index    | 逻辑索引        | mapping、settings、template、alias、ILM        |
| Shard    | Lucene 索引实例 | 大小、数量、分布、恢复时间、查询并发           |
| Document | JSON 文档       | \_id、routing、版本、字段设计                  |

### 2.2 节点角色

现代 ES 节点角色更加细化。节点角色是否拆分取决于集群规模、负载隔离和故障域；大集群通常需要更明确的角色隔离。

| **角色**          | **职责**                           | **生产建议**                              |
|-------------------|------------------------------------|-------------------------------------------|
| master-eligible   | 参与主节点选举，维护 cluster state | 按选举容错目标部署奇数个 master-eligible 节点；大型集群避免承载重查询和重写入 |
| data_hot          | 热数据，写入和高频查询             | SSD、本地盘、较强 CPU/IO                  |
| data_warm         | 较少写入、较多历史查询             | 容量优先，性能中等                        |
| data_cold/frozen  | 低频历史数据                       | 成本优先，结合 searchable snapshot        |
| ingest            | pipeline 预处理                    | 日志解析、字段清洗、geoip 等放到独立节点  |
| coordinating-only | 请求路由与结果归并                 | 大查询、大聚合场景可独立部署              |
| ml/transform      | 机器学习、转换任务                 | 按功能单独规划资源                        |

### 2.3 Cluster State

Cluster State 保存索引元数据、mapping、settings、shard 分配、节点信息等。它由 master 管理并发布给各节点。Cluster State 过大通常来自索引过多、shard 过多、mapping 字段爆炸、模板混乱。

- 症状：master CPU 高、pending tasks 堆积、创建索引慢、节点加入慢、集群状态发布超时。

- 治理：控制索引数量与 shard 数量；限制 dynamic mapping；用 ILM 合理 rollover；删除无用索引；避免每个租户一个小索引。

- 排查：GET \_cluster/state/metadata?filter_path=metadata.indices.\*.mappings；GET \_cat/pending_tasks?v；GET \_cluster/stats。

### 2.4 健康状态 Green / Yellow / Red

| **状态** | **含义**                          | **影响**         | **优先动作**                              |
|----------|-----------------------------------|------------------|-------------------------------------------|
| Green    | 所有 primary 和 replica 正常分配  | 正常             | 持续监控                                  |
| Yellow   | primary 正常，部分 replica 未分配 | 可读写但冗余不足 | 看 allocation explain、磁盘水位、节点数量 |
| Red      | 至少一个 primary 未分配           | 部分数据不可用   | 优先恢复 primary、快照恢复或分配空主分片  |

### 2.5 ES 与数据库的区别

| **维度** | **关系型数据库**     | **Elasticsearch**               |
|----------|----------------------|---------------------------------|
| 数据结构 | 行存储、B+Tree、事务 | 文档、倒排索引、列式 doc_values |
| 核心能力 | 事务一致性、复杂关系 | 全文检索、过滤、聚合分析        |
| 查询方式 | SQL、JOIN            | Query DSL、倒排检索、聚合       |
| 一致性   | 强事务模型           | 近实时搜索、分布式复制          |
| 最佳实践 | 源数据系统           | 搜索/分析派生视图               |

> **面试提醒**
>
> 不要把 ES 讲成数据库替代品。更准确的说法是：ES 适合做搜索和分析型读模型，源数据仍应以数据库、日志、对象存储或消息系统为准。
