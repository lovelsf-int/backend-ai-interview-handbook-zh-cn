---
title: Elasticsearch 生产命令与模板
description: 集群、分片、节点、索引、快照和慢日志速查
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# Elasticsearch 生产命令与模板

## 源章节：生产命令速查与模板

> 执行边界：示例命令必须先在同版本测试环境验证，并在生产执行前确认索引、集群与权限范围。

### 15.1 生产索引模板

**Index Template**

> PUT \_index_template/orders_template
>
> {
>
> "index_patterns": \["orders-\*"\],
>
> "priority": 100,
>
> "template": {
>
> "settings": {
>
> "number_of_shards": 6,
>
> "number_of_replicas": 1,
>
> "refresh_interval": "5s",
>
> "index.max_result_window": 10000
>
> },
>
> "mappings": {
>
> "dynamic": "strict",
>
> "properties": {
>
> "order_id": { "type": "keyword" },
>
> "tenant_id": { "type": "keyword" },
>
> "buyer_id": { "type": "keyword" },
>
> "buyer_name": {
>
> "type": "text",
>
> "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } }
>
> },
>
> "status": { "type": "keyword" },
>
> "amount_cent": { "type": "long" },
>
> "created_at": { "type": "date" },
>
> "updated_at": { "type": "date" },
>
> "is_deleted": { "type": "boolean" }
>
> }
>
> },
>
> "aliases": {
>
> "orders_read": {}
>
> }
>
> }
>
> }

### 15.2 ILM 模板

**ILM Policy**

> PUT \_ilm/policy/logs_policy
>
> {
>
> "policy": {
>
> "phases": {
>
> "hot": {
>
> "actions": {
>
> "rollover": {
>
> "max_primary_shard_size": "50gb",
>
> "max_age": "1d"
>
> }
>
> }
>
> },
>
> "warm": {
>
> "min_age": "7d",
>
> "actions": {
>
> "shrink": { "number_of_shards": 1 },
>
> "forcemerge": { "max_num_segments": 1 }
>
> }
>
> },
>
> "delete": {
>
> "min_age": "90d",
>
> "actions": { "delete": {} }
>
> }
>
> }
>
> }
>
> }

### 15.3 常用排查命令分类

| **目标** | **命令**                                                                                     |
|----------|----------------------------------------------------------------------------------------------|
| 健康     | GET \_cluster/health?pretty                                                                  |
| 节点     | GET \_cat/nodes?v&h=ip,name,heap.percent,ram.percent,cpu,load_1m,node.role,disk.used_percent |
| 索引     | GET \_cat/indices?v&s=store.size:desc                                                        |
| 分片     | GET \_cat/shards?v&s=state,index                                                             |
| 分配原因 | GET \_cluster/allocation/explain                                                             |
| 线程池   | GET \_cat/thread_pool?v&s=rejected:desc                                                      |
| 热点线程 | GET \_nodes/hot_threads                                                                      |
| 任务     | GET \_tasks?detailed=true                                                                    |
| JVM      | GET \_nodes/stats/jvm                                                                        |
| 熔断     | GET \_nodes/stats/breaker                                                                    |
| 恢复     | GET \_cat/recovery?v&active_only=true                                                        |
| ILM      | GET index-name/\_ilm/explain                                                                 |

### 15.4 慢查询治理模板

**慢查询治理**

> 治理流程：
>
> 1\. 慢日志确认 query/fetch 哪个阶段慢。
>
> 2\. profile API 找到具体 query/agg 消耗。
>
> 3\. 看 shard 扇出、时间范围、返回字段、排序字段、聚合基数。
>
> 4\. 优化 mapping：text/keyword、doc_values、nested/flattened。
>
> 5\. 优化 DSL：filter、range、source filtering、search_after。
>
> 6\. 必要时预聚合、异步导出、限流或拆索引。
>
> 7\. 固化 API 白名单和压测基线。

### 15.5 事故复盘模板

| **模块** | **要回答的问题**                           |
|----------|--------------------------------------------|
| 影响面   | 影响哪些业务、持续多久、错误率和延迟是多少 |
| 时间线   | 首次告警、人工介入、止血、恢复、复盘       |
| 直接原因 | 例如磁盘水位、慢聚合、mapping 冲突、GC     |
| 根因     | 为什么监控/流程/架构没有提前拦住           |
| 止血措施 | 限流、回滚、扩容、关闭重查询、恢复快照     |
| 长期改进 | 容量治理、模板准入、压测、巡检、演练       |
