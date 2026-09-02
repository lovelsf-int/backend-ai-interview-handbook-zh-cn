---
title: InnoDB 索引、执行计划、分页与复制
description: 从聚簇索引与代价模型到 EXPLAIN ANALYZE、Seek Pagination、Hash Join 和 GTID 复制
status: verified
baseline: MySQL 8.4 official semantics with project validation required
last_verified: 2026-09-02
level: P8
source: mysql_07_08_000230.doc，经 MySQL 8.4 官方文档校准并去重
---

# InnoDB 索引、执行计划、分页与复制

## 先纠正四个基础误区

1. 数据库 B-Tree 不是“每个节点最多两个关键字”的二叉树。B-Tree/B+Tree 是高扇出的平衡搜索树，节点可容纳大量键。
2. InnoDB 不支持用户随意创建通用 Hash 索引。它可能维护内部 Adaptive Hash Index；MEMORY 引擎才支持显式 HASH 索引。
3. `NOT IN`、`<>`、范围条件不意味着“一定不走索引”。是否使用取决于语义、选择性、统计信息与代价模型。
4. `EXPLAIN` 出现全表扫描不等于一定有问题。返回表中大部分数据时，全表扫描可能比大量随机回表更便宜。

## 聚簇索引与二级索引

InnoDB 表数据按聚簇索引组织：

- 有主键时通常以主键作为聚簇索引。
- 没有合适主键时，InnoDB 会选择非空唯一索引，或生成隐藏聚簇键。
- 二级索引叶子记录包含二级索引列和聚簇索引键，因此通过二级索引查询非覆盖列时需要回到聚簇索引。

工程后果：

- 过宽或随机的主键会放大所有二级索引、增加页分裂与缓存压力。
- 覆盖索引可减少回表，但索引越多写放大越大。
- 索引设计必须同时考虑查询、排序、行宽、更新频率和存储成本。

## 联合索引不是“选择性最高永远放第一”

联合索引顺序从查询契约推导：

1. 哪些列是稳定的等值前缀；
2. 哪些列承担范围过滤；
3. 是否需要满足排序或分组；
4. 是否需要稳定分页的唯一 Tie-breaker；
5. 能否覆盖高频查询；
6. 写入与空间成本是否可接受。

例如用户订单时间线：

```sql
CREATE INDEX idx_order_user_created_id
ON orders(user_id, created_at DESC, id DESC);
```

它服务于“单用户、按时间与 ID 稳定倒序”的访问模式。若主要查询先按租户、品牌或状态隔离，索引前缀应随真实谓词调整，不能机械复制。

范围条件可能终止后续列用于索引范围定位，但后续列仍可能用于 Index Condition Pushdown、覆盖过滤或排序优化。必须看实际计划，不能背成“范围后的列完全没用”。

## 用代价模型理解全表扫描

优化器可能选择全表扫描，常见原因包括：

- 查询要返回表的大部分行；
- 索引基数低或统计信息认为过滤能力弱；
- 表很小；
- 二级索引随机回表成本高于顺序扫描；
- 可用索引不能同时满足过滤和排序。

修复前先验证估算与实际是否偏离。如果统计信息错误，重建统计或直方图可能比强制索引更合理；`FORCE INDEX` 应是有证据的临时或特定方案，不是默认答案。

## EXPLAIN 与 EXPLAIN ANALYZE

`EXPLAIN` 展示优化器估算和计划；`EXPLAIN ANALYZE` 会实际执行语句，并提供实际行数、时间和循环次数。生产使用时必须先评估语句副作用、数据量和负载。

P8 排查顺序：

1. 捕获完整 SQL 模板与代表性参数。
2. 查看访问表顺序、索引、估算行数、过滤比例和额外操作。
3. 在安全环境用 `EXPLAIN ANALYZE` 对比估算行数与实际行数。
4. 检查每个算子的 `loops`、实际行数和耗时，找出误差被放大的位置。
5. 用真实分布验证新索引或改写，不只比较 `type` 字段。

`const`、`ref`、`range`、`index`、`ALL` 可以帮助阅读访问方式，但不存在“所有 SQL 必须优化到 range 以上”的统一门槛。目标是满足业务 SLO，并控制资源成本和回归风险。

## 深分页：Offset 与 Seek

```sql
SELECT id, created_at, status
FROM orders
WHERE user_id = ?
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 1000000;
```

大 Offset 通常仍需扫描并丢弃大量前置记录。优先使用 Keyset/Seek Pagination：

```sql
SELECT id, created_at, status
FROM orders
WHERE user_id = ?
  AND (created_at < ? OR (created_at = ? AND id < ?))
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

设计要点：

- 排序键必须稳定，`id` 作为唯一 Tie-breaker 防止重复或漏行。
- 游标应携带排序键而不是数据库内部偏移。
- 需要“跳到任意页”时，应重新审视产品契约，或使用分段锚点/异步导出。
- 覆盖索引延迟关联可改善某些 Offset 查询，但不是无限分页的根治方案。
- 把全量 ID 放进缓存再分页会引入一致性、内存和失效难题，不应作为通用方案。

## ORDER BY 与临时结果

排序是否能利用索引，取决于过滤前缀、排序方向、列顺序和联接计划。看到 `Using filesort` 不等于一定写磁盘，也不等于一定需要建索引；它表示不能直接依赖索引顺序完成排序。

评估时同时看：

- 参与排序的行数和行宽；
- `LIMIT` 是否能提前截断；
- 是否因 `SELECT *` 增大排序负担；
- 新索引能否同时满足过滤与排序；
- 新索引对写入、缓存和存储的成本。

## MySQL 8.4 的 Join 口径

旧资料把 Block Nested-Loop 当成当前默认优化路径，这对 MySQL 8.4 已经过时。MySQL 8.4 在可用时采用 Hash Join，计划中可通过 `EXPLAIN` 或 `EXPLAIN ANALYZE` 识别。

这不意味着 Join 无需索引：

- 高选择性过滤仍依赖合适索引减少输入集。
- Nested Loop 类计划可能仍存在。
- Join 顺序、估算误差、内存与溢写成本仍需验证。
- 盲目调大 `join_buffer_size` 会乘以并发和连接，可能制造内存风险。

## 复制链路：不是主库主动把日志推给副本

经典异步复制可以按三个角色理解：

1. Replica receiver thread 连接 Source，读取 Source Binlog；
2. 接收线程把事件写入本地 Relay Log；
3. Applier thread 读取 Relay Log 并执行事务。

因此需要区分：已在 Source 提交、已被 Replica 接收、已写入并刷盘 Relay Log、已由 Applier 应用、读请求已可见。这些不是同一个时刻。

## 半同步复制的真实保证

半同步通常等待至少一个副本确认事件已接收并写入、刷入 Relay Log，然后 Source 返回提交结果。这个 ACK 不代表事务已经在副本执行完成，也不等于副本查询已经可见。

还要考虑：

- 超时后可能退化为异步复制；
- ACK 副本与将来被提升的副本可能不是同一个；
- 网络隔离和副本磁盘异常会影响提交延迟；
- 跨 Region RTT 会直接进入写延迟路径。

业务若要求 Read-Your-Writes，需要显式选择回主读、等待位点/GTID 或带一致性令牌的路由，而不是看到“半同步”就默认副本可读。

## GTID、切换与防脑裂

GTID 为事务提供全局标识，简化复制拓扑切换和缺失事务判断，但它不是自动高可用协议。完整切换还要解决：

- 谁拥有写入权；
- 如何 fencing 旧主；
- 候选副本是否包含承诺过的事务；
- 路由、连接池和 DNS 缓存何时刷新；
- 回切时如何处理分叉数据。

在跨 Region 订单系统中，应把 `active_region` 与单调递增 `epoch`/fencing token 放进写入契约。旧 Region 即使恢复网络，也不能凭过期 epoch 继续写。

## 一个可执行的慢 SQL Runbook

1. 从 APM 与 Performance Schema 找到总耗时贡献最大的 SQL，而不是只看单次最慢。
2. 保存 SQL 模板、参数分布、Schema、索引、统计信息和 MySQL 版本。
3. 对比估算与实际行数，定位基数误判、回表、排序、临时表或 Join 放大。
4. 设计至少两个候选方案：索引、SQL 改写、数据模型或产品访问契约调整。
5. 在代表性数据和并发下对比吞吐、P95/P99、CPU、I/O、Buffer Pool 与写放大。
6. 灰度发布，设置回滚阈值；上线后确认计划没有因参数或数据分布漂移。

## P8 连续追问

### 为什么索引越多反而越慢

每次写入要维护更多 B+Tree，增加 Redo、页分裂、Buffer Pool 污染和存储占用；优化一个查询可能拖慢整个写入面。

### 为什么 `LIMIT 1` 仍可能慢

如果过滤列无有效索引或满足条件的行位于扫描末端，数据库仍可能扫描大量记录；`LIMIT` 只限制结果数，不保证访问成本。

### 副本延迟为零为什么仍读不到

监控粒度、采样时点、事务可见性、连接路由与缓存都可能造成偏差。应使用具体 GTID/位点或业务版本验证，而不是只看一个延迟 Gauge。

## 官方依据

- [InnoDB Clustered and Secondary Indexes](https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html)
- [Avoiding Full Table Scans](https://dev.mysql.com/doc/refman/8.4/en/table-scan-avoidance.html)
- [EXPLAIN and EXPLAIN ANALYZE](https://dev.mysql.com/doc/refman/8.4/en/explain.html)
- [Hash Join Optimization](https://dev.mysql.com/doc/refman/8.4/en/hash-joins.html)
- [Relay Log and Replication Metadata](https://dev.mysql.com/doc/refman/8.4/en/replica-logs.html)
- [Semisynchronous Replication](https://dev.mysql.com/doc/refman/8.4/en/replication-semisync.html)
- [GTID Life Cycle](https://dev.mysql.com/doc/refman/8.4/en/replication-gtids-lifecycle.html)

