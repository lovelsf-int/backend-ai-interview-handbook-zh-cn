---
title: Elasticsearch 企业级架构案例
description: 订单、商品、日志和风控检索场景的建模与取舍
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# Elasticsearch 企业级架构案例

## 源章节：企业级架构案例：订单搜索、商品搜索、日志平台、风控查询

### 11.1 亿级订单搜索系统

订单搜索的核心是以数据库为主数据源，ES 作为搜索读模型。架构要解决同步延迟、幂等、回放、索引版本、字段脱敏、权限过滤和深分页导出。

**订单搜索架构**

> MySQL Order DB
>
> -\> Binlog / Canal / Debezium
>
> -\> Kafka topic: order_cdc
>
> -\> Indexer Consumer Group
>
> -\> Transform / Enrich / Deduplicate
>
> -\> Elasticsearch order_v3 (write alias: order_write)
>
> -\> Search API (read alias: order_read)
>
> -\> User / Admin / BI

| **设计点** | **推荐方案**                                               |
|------------|------------------------------------------------------------|
| 索引拆分   | 按业务域 + 时间周期拆分，例如 order-2026.07 或 data stream |
| 主键       | 使用订单 ID 作为 \_id，保证幂等覆盖                        |
| 路由       | 按 tenant_id 或 buyer_id 评估，避免热点                    |
| 一致性     | DB 为准；ES 异步最终一致；提供补偿重放和定时校验           |
| 权限       | tenant_id、org_id、user_scope 放 filter，不在前端拼接      |
| 重建       | 新索引 order_v4，双写/回放，alias 原子切换                 |

### 11.2 商品搜索系统

商品搜索比订单搜索更关注召回和排序。通常会有多路召回：关键词、类目、品牌、同义词、拼音、向量召回；再进行过滤、排序、重排和个性化。

- 字段：title、subtitle、brand、category、attrs、price、sales、stock、shop_id、status。

- 召回：match/multi_match、synonym、search_as_you_type、completion suggester、向量召回。

- 过滤：上架状态、库存、价格区间、类目、店铺、地域。

- 排序：相关性 + 销量 + 转化率 + 新鲜度 + 商业规则。

- 运营：同义词词库、黑白名单、类目权重、搜索日志分析。

**商品搜索 DSL**

> GET /product_read/\_search
>
> {
>
> "query": {
>
> "bool": {
>
> "must": \[
>
> {
>
> "multi_match": {
>
> "query": "苹果手机 256G",
>
> "fields": \["title^5", "subtitle^2", "brand^3", "attrs.value"\]
>
> }
>
> }
>
> \],
>
> "filter": \[
>
> { "term": { "status": "ON_SALE" } },
>
> { "range": { "stock": { "gt": 0 } } }
>
> \]
>
> }
>
> },
>
> "sort": \["\_score", {"sales_30d": "desc"}, {"product_id": "desc"}\],
>
> "size": 20
>
> }

### 11.3 日志检索平台

日志场景的特点是写入大、时间范围查询、保留周期明确、字段半结构化。推荐 data stream + index template + ILM，通过 hot/warm/cold/frozen 分层平衡成本和性能。

**日志平台架构**

> App / Nginx / JVM Logs
>
> -\> Beats / Fluent Bit / Logstash / Vector
>
> -\> Kafka Buffer (optional)
>
> -\> Ingest Pipeline
>
> -\> Data Stream: logs-app-prod
>
> -\> Hot tier: 0~7 days
>
> -\> Warm tier: 7~30 days
>
> -\> Cold tier: 30~180 days
>
> -\> Delete after retention

### 11.4 实时风控查询

风控查询通常要求低延迟、多条件过滤、最近行为聚合。ES 适合做多维检索和近实时画像查询，但强一致计数和交易决策仍应由专门风控状态存储、流处理或数据库配合完成。

- 近期事件写入 ES，用 user_id/device_id/ip/card_hash 等字段过滤。

- 高频特征由 Flink/Redis/HBase/ClickHouse 预聚合，ES 做检索补充。

- 查询必须设置 timeout 和 terminate_after，避免风控链路被慢查询拖垮。

- 敏感字段加密/脱敏；审计搜索日志。
