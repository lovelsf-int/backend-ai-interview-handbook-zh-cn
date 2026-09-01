---
title: DSL、分页、聚合与排序优化
description: 查询模板、深分页、聚合内存和排序优化
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# DSL、分页、聚合与排序优化

## 源章节：查询 DSL、分页、聚合与排序优化

### 8.1 Query DSL 使用原则

- 能用 term/filter 的精确条件，不要用 match。

- 能减少候选集的过滤条件尽量前置到 filter。

- 避免对高基数字段做无边界 terms 聚合。

- 避免 leading wildcard，例如 \*abc。

- 避免脚本在全量文档上运行。

- 控制 \_source 返回字段，减少 fetch 和网络成本。

### 8.2 常见 DSL 模板

**订单搜索模板**

> GET /orders/\_search
>
> {
>
> "track_total_hits": false,
>
> "\_source": \["order_id", "user_id", "status", "amount", "created_at"\],
>
> "query": {
>
> "bool": {
>
> "must": \[
>
> { "match": { "buyer_name": "张三" } }
>
> \],
>
> "filter": \[
>
> { "term": { "tenant_id": "t1" } },
>
> { "terms": { "status": \["PAID", "SHIPPED"\] } },
>
> { "range": { "created_at": { "gte": "now-90d" } } }
>
> \],
>
> "must_not": \[
>
> { "term": { "is_deleted": true } }
>
> \]
>
> }
>
> },
>
> "sort": \[
>
> { "created_at": "desc" },
>
> { "order_id": "desc" }
>
> \],
>
> "size": 20
>
> }

### 8.3 深分页

from + size 的深分页会让每个 shard 加载前面所有页的候选结果。例如 from=100000,size=20，多个 shard 都要维护 100020 个排序结果，协调节点还要全局归并，CPU 和内存成本很高。默认 max_result_window 为 10000 是保护机制。

| **方式**           | **适合场景**         | **不适合**         |
|--------------------|----------------------|--------------------|
| from/size          | 浅分页、用户翻几页   | 深分页、导出全部   |
| search_after       | 实时下一页、无限滚动 | 随机跳页           |
| PIT + search_after | 稳定视图的深分页     | 长时间持有大量 PIT |
| scroll             | 离线批处理、重建索引 | 实时用户分页       |

**深分页推荐**

> \# PIT + search_after 示例
>
> POST /orders/\_pit?keep_alive=1m
>
> GET /\_search
>
> {
>
> "pit": { "id": "PIT_ID", "keep_alive": "1m" },
>
> "size": 100,
>
> "sort": \[
>
> { "created_at": "asc" },
>
> { "order_id": "asc" }
>
> \],
>
> "search_after": \["2026-07-01T00:00:00Z", "o_10001"\],
>
> "query": { "term": { "tenant_id": "t1" } }
>
> }

### 8.4 聚合优化

- terms aggregation 默认只返回 top buckets，分布式场景要理解 shard_size 和误差。

- 高基数精确去重成本高，cardinality 是近似算法，precision_threshold 越高越耗内存。

- 全量导出所有 bucket 用 composite aggregation 分页，不要把 size 调到极大。

- 聚合字段应使用 keyword/numeric/date 等 doc_values 字段。

- 看板类查询可以使用 request cache，但索引 refresh 会使缓存失效。

**聚合示例**

> GET /orders/\_search
>
> {
>
> "size": 0,
>
> "query": {
>
> "range": { "created_at": { "gte": "now-30d" } }
>
> },
>
> "aggs": {
>
> "by_status": {
>
> "terms": { "field": "status", "size": 10 }
>
> },
>
> "gmv_by_day": {
>
> "date_histogram": {
>
> "field": "created_at",
>
> "calendar_interval": "day"
>
> },
>
> "aggs": {
>
> "gmv": { "sum": { "field": "amount_cent" } }
>
> }
>
> }
>
> }
>
> }

### 8.5 排序优化

- 排序字段必须有 doc_values；keyword/date/numeric 是常见选择。

- 尽量让过滤条件先缩小候选集，再排序。

- 业务热榜可以预计算分数，避免每次 script_score 全量计算。

- index sorting 可以提升某些固定排序/过滤场景，但会增加写入成本，创建索引前要评估。
