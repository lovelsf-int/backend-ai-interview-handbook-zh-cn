---
title: Elasticsearch 查询链路
description: Query/Fetch 阶段、评分、缓存、排序和分布式误差
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# Elasticsearch 查询链路

## 源章节：查询链路：Query Phase、Fetch Phase、相关性评分、缓存

### 5.1 查询总流程

一次搜索请求打到 coordinating node 后，会被路由到相关 shard。每个 shard 本地执行查询，返回 top N 的 docID 和 score/sort 值；协调节点归并后，再向命中的 shard 拉取 \_source 或字段值。

**查询链路**

> Client
>
> -\> Coordinating Node
>
> -\> can_match / shard routing / fan-out
>
> -\> Query Phase: 每个 shard 计算 topN docID + score/sort
>
> -\> Reduce: coordinator 合并全局 topN
>
> -\> Fetch Phase: 根据 docID 拉取 \_source/stored fields/docvalue_fields
>
> -\> Response

### 5.2 Query Phase 与 Fetch Phase

| **阶段**    | **输入**                | **输出**                  | **性能瓶颈**                     |
|-------------|-------------------------|---------------------------|----------------------------------|
| Query Phase | query DSL、filter、sort | docID、score、sort values | 倒排扫描、排序、聚合、CPU        |
| Fetch Phase | 全局 top hits 的 docID  | \_source/highlight/fields | 随机 IO、\_source 解压、网络传输 |

### 5.3 Query Context vs Filter Context

Query context 会计算相关性评分；filter context 只判断是否匹配，适合缓存和位图优化。精确条件、枚举状态、时间范围、租户权限等通常应放 filter。

**Query 与 Filter 搭配**

> GET /orders/\_search
>
> {
>
> "query": {
>
> "bool": {
>
> "must": \[
>
> { "match": { "title": "iphone 15" }}
>
> \],
>
> "filter": \[
>
> { "term": { "status": "PAID" }},
>
> { "range": { "created_at": { "gte": "now-30d" }}},
>
> { "term": { "tenant_id": "t1001" }}
>
> \]
>
> }
>
> }
>
> }

### 5.4 缓存体系

| **缓存**              | **缓存内容**      | **适用场景**       | **注意**                            |
|-----------------------|-------------------|--------------------|-------------------------------------|
| Filesystem Page Cache | segment 文件页    | 几乎所有搜索       | Heap 不要占满机器内存，给 OS 留缓存 |
| Query Cache           | filter 结果位图   | 重复过滤条件       | 高频低选择性 filter 更容易受益      |
| Request Cache         | size=0 聚合结果等 | 日志看板、重复聚合 | 数据刷新会失效                      |
| Fielddata Cache       | text 字段内存结构 | 少用               | 容易 OOM，优先 keyword/doc_values   |
| Global Ordinals       | keyword ordinals  | terms agg、join    | 高基数字段构建成本高                |

### 5.5 相关性评分与排序

- 相关性排序依赖 BM25 等评分模型，适合全文搜索。

- 业务排序通常要结合 function_score、script_score、rank_feature、field_value_factor 或二次排序。

- 按字段排序依赖 doc_values；不要对 text 字段排序。

- script sort 或 script_score 成本高，必须限制候选集合。

### 5.6 慢查询定位

**慢查询工具**

> \# 开启搜索慢日志，按索引设置
>
> PUT /orders/\_settings
>
> {
>
> "index.search.slowlog.threshold.query.warn": "2s",
>
> "index.search.slowlog.threshold.fetch.warn": "1s",
>
> "index.search.slowlog.threshold.query.info": "500ms",
>
> "index.search.slowlog.threshold.fetch.info": "300ms"
>
> }
>
> \# 查看查询 profile
>
> GET /orders/\_search
>
> {
>
> "profile": true,
>
> "query": { "match": { "title": "phone" } }
>
> }
