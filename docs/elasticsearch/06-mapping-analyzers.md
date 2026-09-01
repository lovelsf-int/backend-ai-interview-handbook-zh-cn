---
title: Mapping、Analyzer 与中文检索
description: 字段建模、动态映射、分词链和中文搜索设计
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# Mapping、Analyzer 与中文检索

## 源章节：Mapping、Analyzer 与中文检索设计

### 6.1 Mapping 是什么

Mapping 类似数据库 schema，但更直接决定索引结构、查询方式和性能。字段类型一旦确定，很多属性无法原地修改；生产上应显式 mapping，避免 dynamic mapping 把字段推断错。

| **字段类型**             | **适合场景**                   | **常见坑**                            |
|--------------------------|--------------------------------|---------------------------------------|
| text                     | 全文检索、分词                 | 不能直接排序/聚合；fielddata 容易 OOM |
| keyword                  | 精确匹配、过滤、排序、聚合     | 超长字符串需要 ignore_above           |
| date                     | 时间范围、排序、date_histogram | 时区、格式、毫秒/秒混淆               |
| long/double/scaled_float | 数值过滤、排序、聚合           | 金额建议 scaled_float 或整型分单位    |
| object                   | 普通 JSON 对象                 | 数组对象会扁平化，关系可能丢失        |
| nested                   | 对象数组保持内部关系           | 查询和聚合成本更高                    |
| flattened                | 动态 key 的大对象              | 适合日志标签，查询能力比明确字段弱    |
| geo_point                | 地理距离、范围                 | 经纬度顺序和格式要统一                |

### 6.2 text vs keyword

text 会经过 analyzer 分词，适合 match 查询；keyword 保留原值，适合 term 查询、过滤、排序和聚合。生产中常用 multi-fields 同时保留 text 和 keyword。

**Mapping 示例**

> PUT /product_v1
>
> {
>
> "mappings": {
>
> "dynamic": "strict",
>
> "properties": {
>
> "title": {
>
> "type": "text",
>
> "analyzer": "ik_max_word",
>
> "search_analyzer": "ik_smart",
>
> "fields": {
>
> "keyword": { "type": "keyword", "ignore_above": 256 }
>
> }
>
> },
>
> "brand": { "type": "keyword" },
>
> "price_cent": { "type": "long" },
>
> "created_at": { "type": "date" }
>
> }
>
> }
>
> }

### 6.3 Analyzer 链路

Analyzer 由 char filter、tokenizer、token filter 组成。索引时 analyzer 决定写入哪些 term，搜索时 analyzer 决定查询词如何被拆分。索引 analyzer 和搜索 analyzer 可以不同。

**Analyzer 链路**

> Text: “Apple iPhone 15 Pro Max 256G”
>
> Analyzer:
>
> Char Filter -\> 字符清洗，如 HTML、同义符号归一
>
> Tokenizer -\> 切词，如 standard、ik_max_word
>
> Token Filter -\> 小写、停用词、同义词、拼音、词干化
>
> Output Terms:
>
> apple, iphone, 15, pro, max, 256g, ...

### 6.4 中文检索设计

- 中文需要合适分词器，例如 IK、jieba、自研词典、搜索平台词库。标准分词器对中文通常不够好。

- 商品搜索一般索引时细粒度分词，搜索时相对粗粒度，减少噪声。

- 同义词要有版本治理；热更新词库要验证召回和误召回。

- 拼音、前缀、纠错、suggest 不要全部塞进一个字段，建议多字段或独立召回通道。

### 6.5 object vs nested 坑

普通 object 数组会被扁平化，数组对象之间的字段关系会丢失。需要保持对象内部关系时必须使用 nested。

**object 扁平化示例**

> \# 原始数据
>
> {
>
> "items": \[
>
> {"sku": "A", "price": 100},
>
> {"sku": "B", "price": 200}
>
> \]
>
> }
>
> \# object 扁平化后近似为：
>
> items.sku: \["A", "B"\]
>
> items.price: \[100, 200\]
>
> \# 查询 sku=A AND price=200 可能误命中。
>
> \# 需要 nested query 保证同一个数组元素内匹配。

### 6.6 Mapping 爆炸

日志和埋点场景常见字段爆炸：每个动态 key 都变成 mapping 字段，导致 cluster state 变大、master 压力上升、查询和写入变慢。

- 设置 index.mapping.total_fields.limit，但不要只靠调大限制。

- 对动态标签使用 flattened 或把 key/value 建模为 nested。

- 对未知字段使用 dynamic_templates 控制类型。

- 入口处清洗字段名，禁止用户输入直接成为字段名。

**dynamic_templates 示例**

> PUT \_index_template/log_template
>
> {
>
> "index_patterns": \["app-log-\*"\],
>
> "template": {
>
> "mappings": {
>
> "dynamic_templates": \[
>
> {
>
> "strings_as_keywords": {
>
> "match_mapping_type": "string",
>
> "mapping": { "type": "keyword", "ignore_above": 256 }
>
> }
>
> }
>
> \],
>
> "properties": {
>
> "labels": { "type": "flattened" },
>
> "message": { "type": "text" },
>
> "timestamp": { "type": "date" }
>
> }
>
> }
>
> }
>
> }
