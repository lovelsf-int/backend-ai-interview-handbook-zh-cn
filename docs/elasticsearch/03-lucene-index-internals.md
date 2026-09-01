---
title: Lucene 索引底层原理
description: 倒排索引、FST、Segment、Doc Values、BKD Tree 与评分
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# Lucene 索引底层原理

## 源章节：Lucene 底层数据结构：倒排索引、FST、Segment、Doc Values

### 3.1 倒排索引

倒排索引的核心思想是从“文档 -\> 词”反转成“词 -\> 文档列表”。关系型数据库的 B+Tree 更适合前缀、范围、精确匹配；全文检索需要先分词，再快速定位包含某个 term 的文档集合。

**倒排索引示意**

> 原始文档：
>
> Doc1: I love Elasticsearch
>
> Doc2: I love Kafka
>
> Doc3: Kafka and Elasticsearch
>
> 倒排索引：
>
> I -\> Doc1, Doc2
>
> love -\> Doc1, Doc2
>
> Kafka -\> Doc2, Doc3
>
> Elasticsearch -\> Doc1, Doc3

### 3.2 Term Dictionary、Posting List、Skip List

一个倒排索引通常包含 term dictionary 和 posting list。term dictionary 负责找到 term，posting list 保存命中文档 ID、词频、位置、offset 等信息。为了提升跳跃查找效率，posting list 中会有跳表或块级跳跃结构。

| **结构**        | **作用**                        | **面试关键词**                |
|-----------------|---------------------------------|-------------------------------|
| Term Dictionary | 保存所有词项并支持快速查找      | 有序词典、FST、压缩           |
| Posting List    | 保存包含该 term 的 docID 列表   | docID、freq、position、offset |
| Skip Data       | 快速跳过不可能命中的 docID 范围 | 交集、并集、短路              |
| Stored Fields   | 存储 \_source 或存储字段        | Fetch phase 读取              |
| Norms           | 存储字段长度等评分因子          | BM25 相关性                   |

### 3.3 FST 为什么重要

FST（Finite State Transducer）可以把大量 term 以前缀共享的方式压缩存储，既节省内存，又支持快速查找。面试中不需要手写 FST，但要能解释为什么 term dictionary 可以高效定位词项。

**FST 思想**

> Term: elastic, elasticsearch, elk, kafka
>
> 普通存储：每个字符串独立保存
>
> FST 思想：共享公共前缀，构建有限状态转移图
>
> 优势：
>
> 1\. 前缀共享，压缩率高
>
> 2\. 有序查找，适合 term seek
>
> 3\. 结合 block/posting 可快速找到倒排链

### 3.4 Segment 不可变

Lucene 的索引由多个 segment 组成。segment 一旦生成，主体内容不可修改。新增文档会写入新的 segment；删除是写删除标记；更新本质是删除旧文档再写入新文档。后台 merge 会把多个小 segment 合并成大 segment，并清理被删除文档。

- 优点：不可变结构便于缓存；并发读无需复杂锁；顺序写入友好；故障恢复逻辑清晰。

- 代价：频繁刷新会产生很多小 segment；merge 会消耗 CPU、IO；删除文档在 merge 前仍占空间。

- 生产含义：写入高峰不要 refresh 太频繁；不要随意 force merge 热索引；关注 merge backlog 和磁盘 IO。

**Segment 生命周期**

> Shard
>
> ├─ Segment_1 已提交，可搜索
>
> ├─ Segment_2 已提交，可搜索
>
> ├─ Segment_3 新 refresh 产生
>
> └─ Delete markers + Merge policy
>
> update(doc): delete old doc + index new doc

### 3.5 doc_values：排序与聚合的核心

倒排索引适合从 term 找 doc；排序、聚合、脚本访问字段值需要从 doc 找 field value。doc_values 是索引时构建的磁盘列式结构，适合排序、聚合和脚本读取。text 字段通常不支持 doc_values，精确匹配、排序、聚合应使用 keyword 或数值/date 等字段。

| **场景**      | **主要结构**               | **字段建议**                    |
|---------------|----------------------------|---------------------------------|
| 全文检索      | 倒排索引                   | text + analyzer                 |
| 精确过滤      | 倒排索引/doc_values        | keyword、integer、date、boolean |
| 排序          | doc_values                 | keyword、date、numeric          |
| 聚合          | doc_values/global ordinals | keyword、date、numeric          |
| 返回原始 JSON | \_source/stored fields     | 控制 \_source 大小              |

### 3.6 BKD Tree、地理检索与向量检索

数值、日期、IP、geo_point 等字段的范围查询不完全依赖传统字符串倒排，而是使用适合多维点查询的数据结构，例如 Lucene 的 BKD Tree。向量检索则通常依赖 HNSW 等近似最近邻结构。面试时可以把它们归为“不同字段类型背后有不同索引结构，不是所有字段都只有倒排”。

### 3.7 BM25 评分

BM25 是 ES 默认相关性评分模型的基础。它综合考虑词频 TF、逆文档频率 IDF、字段长度归一化等因素。关键词越稀有、文档中出现越多、字段越短，通常得分越高。

> **面试标准回答：为什么 ES 快？**
>
> 1\. 倒排索引把全文检索从全表扫描变成 term -\> postings 定位。
>
> 2\. Segment 不可变，读路径稳定，容易利用文件系统缓存。
>
> 3\. doc_values 让排序、聚合走列式结构，避免把大量字段值放入 heap。
>
> 4\. 分片让查询和聚合可以并行执行。
>
> 5\. FST、跳表、压缩、缓存等 Lucene 优化降低 IO 和 CPU 成本。
