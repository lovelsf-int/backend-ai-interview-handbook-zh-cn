---
title: Elasticsearch 高频面试题
description: P7/P8 原理、调优、架构与事故处理追问
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# Elasticsearch 高频面试题

## 源章节：P7/P8 高频面试题 150 题带标准答案

本章答案采用面试口述风格：先结论，再原理，再生产实践。实际面试中可根据业务经验展开。

## SOC 专项题入口

本题库保留通用 Elasticsearch 问答；800～900 万 Event + Alert、150GB Primary、分层索引和 AI 研判一致性的项目连续追问见
[SOC Elasticsearch P8 压力面试](./18-soc-pressure-interview.md)。

### 14.1 基础原理题

#### Q1. Elasticsearch 是什么？

关键词：Lucene、分布式、NRT

答案：ES 是基于 Lucene 的分布式搜索和分析引擎，核心能力是全文检索、结构化过滤、聚合分析和近实时搜索。它常作为数据库之外的搜索读模型，而不是事务数据库替代品。

#### Q2. ES 为什么查询快？

关键词：倒排索引、Segment、doc_values

答案：主要因为倒排索引能从 term 直接定位文档，Segment 不可变便于缓存，doc_values 支持列式排序聚合，分片可以并行查询，同时 Lucene 使用 FST、跳表、压缩等优化。

#### Q3. 倒排索引是什么？

关键词：term、posting list

答案：倒排索引是 term 到文档列表的映射。传统正排是 doc -\> terms，搜索要扫描文档；倒排是 term -\> docIDs，搜索时先找到词，再找到包含该词的文档。

#### Q4. ES 为什么不用 B+Tree 做全文检索？

关键词：B+Tree、倒排

答案：B+Tree 适合范围和精确查找，但全文检索需要对文本分词并按 term 找文档集合。倒排索引更适合 term 级召回、布尔组合和相关性评分。

#### Q5. Index、Shard、Segment 的关系？

关键词：Index、Shard、Segment

答案：Index 是逻辑索引，分为多个 shard；每个 shard 是一个 Lucene index；Lucene index 由多个不可变 segment 组成。

#### Q6. Primary Shard 和 Replica Shard 有什么区别？

关键词：主分片、副本

答案：Primary 负责接收写入并复制到 replica；replica 提供高可用和读扩展。primary 丢失时 replica 可以提升为新的 primary。

#### Q7. number_of_shards 可以修改吗？

关键词：主分片、reindex

答案：主分片数量创建后不能直接改。可以通过 split、shrink 或 reindex 到新索引改变；副本数 number_of_replicas 可以动态调整。

#### Q8. Refresh 是什么？

关键词：NRT、segment

答案：Refresh 把内存中的变更生成新的可搜索 segment，使数据对搜索可见。它不是完整持久化提交，频繁 refresh 会增加小 segment 和写入开销。

#### Q9. Flush 是什么？

关键词：Lucene commit、translog

答案：Flush 执行 Lucene commit，并开启新的 translog generation，减少恢复时需要重放的 translog。它比 refresh 更偏持久化和恢复成本控制。

#### Q10. Merge 是什么？

关键词：segment merge

答案：Merge 是把多个小 segment 合并成较大 segment，并清理删除文档。它能提升查询效率和释放空间，但会消耗 CPU 和 IO。

#### Q11. Translog 作用是什么？

关键词：事务日志、恢复

答案：Translog 是事务日志，记录尚未安全进入 Lucene commit 的写操作。节点异常后可以通过 translog 重放恢复已确认写入。

#### Q12. request durability 和 async durability 区别？

关键词：fsync、安全性

答案：request 是默认更安全策略，请求返回前 translog 已 fsync/commit；async 周期性 fsync，吞吐更高但崩溃时可能丢最近一段数据。

#### Q13. text 和 keyword 区别？

关键词：mapping

答案：text 会分词，适合全文检索；keyword 保留原始值，适合 term 过滤、排序、聚合。一个业务字段常用 multi-fields 同时存 text 和 keyword。

#### Q14. match 和 term 区别？

关键词：Query DSL

答案：match 会对查询文本进行分析后匹配，适合 text；term 不分析输入，按精确 term 匹配，适合 keyword、数值、状态等字段。

#### Q15. Query 和 Filter 区别？

关键词：score、cache

答案：query context 计算 score；filter context 只判断匹配与否，通常可缓存，适合精确条件、权限、状态、时间范围。

#### Q16. doc_values 是什么？

关键词：列式、聚合

答案：doc_values 是索引时生成的磁盘列式结构，适合排序、聚合和脚本读取字段值。它避免把大量字段值加载到 heap。

#### Q17. fielddata 是什么？为什么危险？

关键词：OOM

答案：fielddata 通常指为了在 text 字段上排序/聚合而构建的堆内内存结构，容易占用大量 heap 导致 OOM。应优先使用 keyword/doc_values。

#### Q18. \_source 作用是什么？

关键词：fetch

答案：\_source 保存原始 JSON，用于 fetch、reindex、update、调试。大字段会增加存储和 fetch 成本，可以通过 source filtering 控制返回。

#### Q19. Analyzer 包含哪些组件？

关键词：分词

答案：Analyzer 通常由 char filter、tokenizer、token filter 构成。索引和搜索可以使用不同 analyzer。

#### Q20. 中文搜索为什么要分词器？

关键词：中文分词

答案：中文没有天然空格分隔，标准分词效果有限。商品、订单、日志等场景需要结合业务词库、同义词、停用词、拼音等优化召回。

#### Q21. object 和 nested 区别？

关键词：nested

答案：object 会把对象数组扁平化，可能丢失数组元素内部关系；nested 会把每个对象作为隐藏子文档，保证同一对象内匹配，但查询成本更高。

#### Q22. 什么是 dynamic mapping？

关键词：mapping

答案：ES 根据首次写入的字段值自动推断类型。生产不建议完全依赖 dynamic，因为类型推断错误后难以修改，需要 reindex。

#### Q23. 为什么字段类型不能随便改？

关键词：索引结构

答案：字段类型决定底层索引结构，例如 text/keyword/numeric 的索引方式不同。已写入 segment 无法原地改变结构，通常要新建索引并 reindex。

#### Q24. 什么是 alias？

关键词：别名

答案：alias 是索引别名，可把读写流量指向具体索引。常用于零停机重建索引、版本切换和多索引查询。

#### Q25. 什么是 data stream？

关键词：时序

答案：data stream 适合日志、指标等追加写时序数据，由多个 backing indices 组成，配合 ILM/生命周期进行 rollover 和保留管理。

#### Q26. ES 的近实时是什么意思？

关键词：NRT

答案：写入成功后不是立即可搜索，而是在 refresh 后对搜索可见，默认常见为秒级。因此 ES 是 NRT，而不是强实时搜索。

#### Q27. 为什么 update 本质是 delete + index？

关键词：更新

答案：倒排索引和 segment 不可变，无法高效原地修改。因此 ES 会标记旧文档删除，再写入新文档，merge 时清理旧版本。

#### Q28. 为什么删除数据后磁盘不马上下降？

关键词：delete、merge

答案：delete 只是写删除标记，旧文档仍在 segment 中。只有 merge 后旧数据才会被清理并释放磁盘空间。

#### Q29. 什么是 routing？

关键词：路由

答案：routing 决定文档写入哪个 primary shard。默认基于 \_id，自定义 routing 可减少查询扇出，但可能导致热点。

#### Q30. 为什么 shard 不是越多越好？

关键词：容量规划

答案：每个 shard 有管理、文件、缓存和搜索调度开销。过多小 shard 会放大 cluster state、heap、查询归并和恢复成本。

#### Q31. 单 shard 多大合适？

关键词：10-50GB

答案：多数场景建议 10GB 到 50GB，并控制单 shard 文档数。具体要结合恢复时间、查询延迟、硬件和业务 SLA 压测。

#### Q32. ES 查询的两个阶段是什么？

关键词：query/fetch

答案：Query phase 在各 shard 计算 topN docID/score/sort；fetch phase 根据全局 topN 拉取 \_source 或字段值并返回。

#### Q33. 协调节点做什么？

关键词：coordinating

答案：协调节点接收请求、转发到相关 shard、归并结果、执行 fetch、返回客户端。大查询/聚合场景协调节点压力很大。

#### Q34. 什么是 search_after？

关键词：深分页

答案：search_after 使用上一页最后一条 sort values 获取下一页，适合深分页和无限滚动。通常配合 PIT 获得稳定视图。

#### Q35. 为什么 from/size 深分页慢？

关键词：深分页

答案：每个 shard 都要加载并排序 from+size 条候选结果，协调节点还要全局归并。页越深，内存和 CPU 成本越高。

#### Q36. Scroll 适合什么？

关键词：scroll

答案：Scroll 适合离线批处理、重建索引、导出大量数据，不适合实时用户翻页。现代深分页更推荐 search_after + PIT。

#### Q37. terms aggregation 有什么坑？

关键词：聚合

答案：分布式 top buckets 存在误差和 shard_size 问题；高基数字段会消耗大量内存和 CPU；全量 buckets 应用 composite 分页。

#### Q38. cardinality 是精确的吗？

关键词：去重

答案：cardinality 聚合通常是近似去重，基于 HyperLogLog++ 思路，precision_threshold 越高越准确但成本越高。

#### Q39. 什么是 request cache？

关键词：缓存

答案：request cache 缓存某些搜索请求结果，尤其 size=0 的聚合看板。索引 refresh 后相关缓存会失效。

#### Q40. 什么是 query cache？

关键词：filter cache

答案：query cache 缓存 filter 的结果位图，适合重复过滤条件。高变更或低复用查询收益有限。

#### Q41. 为什么 Heap 不能给太大？

关键词：JVM

答案：Heap 太大可能失去 compressed oops，并导致更长 GC；同时会挤压 OS page cache，而 ES 查询高度依赖文件系统缓存。

#### Q42. ES 为什么需要 Page Cache？

关键词：文件系统缓存

答案：Lucene segment 文件主要在磁盘，OS page cache 能缓存热点文件页，减少磁盘 IO。给 OS 留内存通常比无限增大 heap 更重要。

#### Q43. 什么是 ILM？

关键词：生命周期

答案：Index Lifecycle Management 用于按年龄、大小、文档数等自动 rollover，并在不同阶段执行 shrink、force merge、delete 等动作。

#### Q44. 什么是 hot/warm/cold/frozen？

关键词：冷热分层

答案：数据层按访问频率和性能成本分层。hot 承载写入和高频查询，warm/cold/frozen 承载较低频历史数据，降低成本。

#### Q45. Red 和 Yellow 的区别？

关键词：集群健康

答案：Red 表示至少一个 primary shard 不可用；Yellow 表示 primary 可用但 replica 不完整。Red 影响数据可用性，优先级更高。

#### Q46. 如何看集群健康？

关键词：排障

答案：GET \_cluster/health 看总体状态；\_cat/shards 看未分配分片；\_cluster/allocation/explain 看具体原因。

#### Q47. 什么是 disk watermark？

关键词：磁盘

答案：磁盘水位控制分片分配。达到高水位会迁移/阻止分配，达到 flood stage 可能把索引设为只读保护磁盘。

#### Q48. 什么是 circuit breaker？

关键词：内存保护

答案：熔断器用于预估请求或数据结构的内存占用，超过阈值则拒绝，避免节点 OOM。

#### Q49. 为什么要快照？

关键词：snapshot

答案：副本不是备份。快照可防止误删、逻辑错误、集群级故障，并支持迁移和恢复演练。

#### Q50. ES 适合做强一致库存吗？

关键词：场景边界

答案：不适合。ES 是搜索读模型，写入近实时且更新成本较高；库存等强一致高频更新应以数据库/缓存/事务系统为准。

### 14.2 高级原理与调优题

#### Q51. 一次写请求完整经历什么？

关键词：写入链路

答案：客户端请求到协调节点后，根据 routing 定位 primary shard；primary 执行写入 Lucene 内部结构并追加 translog；随后复制到 replica；满足等待条件后返回。后续 refresh 让文档可搜索，flush 做 Lucene commit，merge 合并 segment。

#### Q52. 写入成功但查不到，为什么？

关键词：refresh

答案：通常是还没 refresh。写入成功代表写入链路确认，不代表搜索可见。可以等待 refresh_interval、手动 refresh 或写入时 refresh=wait_for，但会影响吞吐。

#### Q53. refresh=wait_for 和 true 区别？

关键词：refresh 策略

答案：wait_for 等待下一次 refresh 让数据可见，不强制立即 refresh；true 会请求后刷新相关分片，实时性更强但成本更高。高吞吐写入不要滥用。

#### Q54. 如何提升大批量导入速度？

关键词：写入调优

答案：使用 bulk、增加 refresh_interval 或临时 -1、初始导入时 replicas=0、显式 mapping、合理客户端并发、使用 SSD、避免高频 update，并监控 rejected/merge/GC。

#### Q55. 为什么副本会降低写入吞吐？

关键词：replica

答案：每次写入除了 primary 还要复制到 replica，副本也要分析、写 segment/translog。副本越多写入总工作量越大。

#### Q56. 为什么副本能提升查询吞吐？

关键词：读扩展

答案：搜索请求可以在 primary 或 replica shard 上执行，副本增加了可服务的 shard copy 数量，因此读压力可被分摊。

#### Q57. 如何设计 10 亿订单索引？

关键词：架构设计

答案：先估算数据量和保留周期，按 10~50GB shard 规划 primary；使用 alias/data stream/ILM；订单 ID 做 \_id；tenant/user 权限字段 filter；CDC/Kafka 同步；慢查询和一致性校验。

#### Q58. 如何处理 ES 与 MySQL 数据不一致？

关键词：一致性

答案：DB 是事实源，ES 异步最终一致。用 CDC/Kafka、幂等 \_id、版本号防乱序、失败重试、DLQ、定期全量/抽样校验和补偿修复。

#### Q59. 为什么不建议业务代码双写 DB 和 ES？

关键词：双写问题

答案：双写会出现 DB 成功 ES 失败、顺序错乱、重试重复、事务边界不一致。CDC 从 DB 提交日志构建 ES 读模型更可靠。

#### Q60. 如何零停机修改 mapping？

关键词：reindex

答案：创建新索引 v2，设置新 mapping；全量 reindex；增量同步；校验；通过 alias 原子切换读写；保留旧索引用于回滚。

#### Q61. 如何选择 nested？

关键词：nested

答案：当对象数组中多个字段必须保持同一对象内部匹配关系时用 nested。否则 object 更轻量。nested 会增加隐藏文档数量和查询成本。

#### Q62. 如何避免 mapping explosion？

关键词：mapping

答案：限制 dynamic，使用 dynamic_templates，未知 key 用 flattened，控制字段准入和 total_fields.limit，并在采集入口清洗字段。

#### Q63. 高基数字段聚合慢怎么办？

关键词：聚合

答案：缩小查询范围；使用 doc_values keyword；调整 shard_size；用 composite 分页；预聚合；必要时用 rollup/downsampling 或专门 OLAP 引擎。

#### Q64. 如何优化 wildcard 查询？

关键词：wildcard

答案：避免 leading wildcard；使用 keyword normalizer、edge_ngram、search_as_you_type、wildcard 字段或专门前缀字段；把模糊需求前置建模。

#### Q65. 如何优化模糊搜索？

关键词：fuzzy

答案：控制 fuzziness、prefix_length、max_expansions；限制字段和候选集；对拼音/纠错使用专门召回通道，避免全字段 fuzzy。

#### Q66. 如何优化高亮？

关键词：highlight

答案：减少高亮字段和片段数量，先用 filter 缩小候选集，避免大字段高亮；评估 unified/fvh，并对字段做 term_vector 配置。

#### Q67. 为什么脚本查询慢？

关键词：script

答案：脚本需要对候选文档逐个执行，难以利用普通索引结构。应先用 filter 缩小候选集，或把脚本结果预计算成字段。

#### Q68. track_total_hits 为什么影响性能？

关键词：total hits

答案：精确统计总命中数可能需要遍历大量匹配文档。对普通分页可以关闭或设置上限，减少查询成本。

#### Q69. DFS Query Then Fetch 是什么？

关键词：评分

答案：普通查询每个 shard 本地计算 IDF，分片数据不均时评分可能偏差。DFS 会先收集全局词频再查询，评分更准但多一次往返，成本更高。

#### Q70. 为什么搜索同分结果顺序不稳定？

关键词：排序稳定

答案：Lucene 内部 docID 可在副本和 merge 后不同。分页要使用稳定排序字段和 tie breaker，深分页推荐 PIT + search_after。

#### Q71. 如何设计租户隔离？

关键词：多租户

答案：小租户共享索引并用 tenant_id filter；大租户可独立索引或路由；避免每个小租户一个索引导致 shard 爆炸。

#### Q72. 自定义 routing 的风险？

关键词：routing

答案：低基数或大客户会导致热点 shard；routing 一旦使用，读写和更新必须一致传入；跨 routing 查询会变复杂。

#### Q73. 如何发现热点 shard？

关键词：热点

答案：看 \_cat/shards 的 store/docs/node 分布，结合节点 CPU/IO/hot_threads/search stats，定位是否某些 shard 查询或写入远高于其他。

#### Q74. 如何处理热点 shard？

关键词：热点治理

答案：优化 routing、拆大租户、增加副本分担读、reindex 调整分片、rollover 分散写入，必要时应用层限流。

#### Q75. 为什么 shard 太大会有风险？

关键词：恢复

答案：查询更慢、恢复时间更长、节点故障后迁移成本高、merge 更重。通常控制在可接受恢复时间内，而不是只看存储大小。

#### Q76. 为什么 shard 太小也有风险？

关键词：小分片

答案：每个 shard 固定开销不小，小 shard 多会导致 cluster state 大、线程调度多、查询扇出多、heap 和文件句柄开销高。

#### Q77. 如何处理 Yellow？

关键词：yellow

答案：先确认是否单节点副本无法分配，再看 allocation explain。常见处理是增加节点、释放磁盘、修正 allocation 规则或临时降低副本。

#### Q78. 如何处理 Red？

关键词：red

答案：优先恢复丢失节点；若无法恢复，用快照恢复。无快照时才考虑 allocate_stale_primary/empty_primary，并明确可能丢数据。

#### Q79. 如何排查 OOM？

关键词：OOM

答案：看 heap dump/GC 日志/nodes stats/breaker/fielddata/search slowlog，重点查大聚合、text fielddata、bulk 过大、shard 过多、mapping 爆炸。

#### Q80. 如何排查 GC 飙升？

关键词：GC

答案：看 old GC 频率和耗时、heap 使用率、fielddata/cache、聚合和脚本请求、cluster state 大小。先限流止血，再优化查询和数据模型。

#### Q81. 如何排查写入 rejected？

关键词：rejected

答案：看 thread_pool.write/bulk rejected、CPU、IO wait、merge、refresh、bulk 大小和客户端并发。客户端应指数退避重试。

#### Q82. 如何排查慢查询？

关键词：慢查询

答案：开启 slowlog，使用 profile API，查看 hot_threads 和 tasks；从 query、sort、agg、fetch、shard 扇出、数据量几个维度定位。

#### Q83. 如何排查磁盘满？

关键词：磁盘

答案：看 \_cat/allocation、\_cat/indices、\_cat/shards、watermark 设置。释放空间、扩容、删除过期索引、恢复索引写权限。

#### Q84. 为什么索引变成只读？

关键词：只读

答案：达到 flood-stage disk watermark 后 ES 会给索引设置 read_only_allow_delete，保护节点不被写满。释放磁盘后需手动解除。

#### Q85. 如何设计日志平台保留策略？

关键词：日志

答案：data stream + ILM：热层写入和近 7 天查询，warm/cold 保存历史，达到保留期 delete。按 shard size rollover。

#### Q86. Force merge 什么时候用？

关键词：force merge

答案：适合只读冷索引，减少 segment 提升查询并释放删除空间。热索引不要频繁 force merge，因为非常消耗 IO/CPU。

#### Q87. 为什么 refresh 会影响写入？

关键词：refresh

答案：refresh 会频繁生成新 segment，增加小 segment 数、打开 reader、后续 merge 压力，因此写入密集场景调大 refresh_interval。

#### Q88. Merge backlog 怎么处理？

关键词：merge

答案：降低写入并发、调大 refresh_interval、升级磁盘、减少 update/delete、检查 merge throttle；不要盲目 force merge 热索引。

#### Q89. 如何减少 fetch 阶段开销？

关键词：fetch

答案：使用 \_source filtering，只返回必要字段；大字段拆分；使用 docvalue_fields；避免返回超大 size。

#### Q90. 如何优化排序？

关键词：sort

答案：排序字段用 doc_values；先过滤缩小候选集；避免 script sort；固定排序可评估 index sorting。

#### Q91. 如何优化权限过滤？

关键词：权限

答案：权限字段建 keyword/numeric，放 filter；避免超大 terms 列表，必要时用角色索引、预计算权限集合或应用层裁剪。

#### Q92. 如何做搜索降级？

关键词：降级

答案：设置 timeout、terminate_after、取消高亮/聚合、限制时间范围、返回缓存/推荐结果、对重查询限流。

#### Q93. 如何保证搜索接口稳定？

关键词：SLA

答案：限流、超时、熔断、慢查询治理、读写隔离、协调节点隔离、监控 P95/P99 和 rejected，核心查询做压测。

#### Q94. 如何评估 ES 容量？

关键词：容量

答案：估算原始数据、索引膨胀系数、副本、保留期、增长率、merge 临时空间和水位冗余；再按 shard 大小和节点资源规划。

#### Q95. 索引膨胀来自哪里？

关键词：存储

答案：倒排索引、doc_values、\_source、stored fields、副本、segment 合并临时空间、分词多字段都会增加磁盘。

#### Q96. 如何设计 index template？

关键词：模板

答案：将通用 settings、mapping、aliases、ILM 写入模板，按 index_patterns 自动应用，避免业务手动创建不一致。

#### Q97. component template 有什么价值？

关键词：模板

答案：把 settings、mappings、aliases 拆成可复用组件，多类索引复用，减少模板重复和变更风险。

#### Q98. 如何做跨集群灾备？

关键词：灾备

答案：用 snapshot 做备份恢复；对低 RPO 需求可使用 CCR 或应用层双写/双消费，结合演练和切流方案。

#### Q99. 为什么副本不是备份？

关键词：备份

答案：副本会同步逻辑删除和错误写入，不能恢复误删或历史版本。快照才是备份。

#### Q100. 如何做版本升级？

关键词：升级

答案：阅读 breaking changes，快照备份，测试环境验证，滚动升级，升级后观察健康、GC、慢查询和客户端兼容。

#### Q101. ES 安全怎么做？

关键词：安全

答案：开启认证、TLS、最小权限、网络隔离、审计日志、敏感字段脱敏，禁止公网裸奔。

#### Q102. 什么情况下不用 ES？

关键词：边界

答案：强事务、复杂 JOIN、频繁小范围强一致更新、低延迟 KV、海量离线复杂分析可能更适合 DB/Redis/OLAP/数仓。

#### Q103. copy_to 有什么用？

关键词：mapping

答案：copy_to 可把多个字段的内容复制到一个组合字段中，便于统一检索，例如 title、brand、category 复制到 all_text。但会增加索引体积。

#### Q104. normalizer 和 analyzer 区别？

关键词：mapping

答案：normalizer 用于 keyword 字段，只产生单个 token，常用于小写化、字符归一；analyzer 用于 text 分词，可能产生多个 token。

#### Q105. ignore_above 有什么用？

关键词：keyword

答案：keyword 字段超过 ignore_above 长度时不进入索引，避免超长字符串占用过多索引资源，但 \_source 仍保留原值。

#### Q106. null_value 有什么用？

关键词：mapping

答案：可把 null 映射为指定值参与索引，便于查询缺失业务值。但要避免和真实值混淆。

#### Q107. exists 查询查什么？

关键词：DSL

答案：exists 查询字段是否存在索引值。字段为 null、空数组或被 ignore_above 忽略时可能不算存在。

#### Q108. minimum_should_match 怎么用？

关键词：相关性

答案：用于 bool should 或 match 查询，控制至少匹配多少子句，平衡召回和精度。

#### Q109. function_score 常见用法？

关键词：排序

答案：在文本相关性基础上叠加销量、时间衰减、等级、库存等业务权重，适合商品搜索排序。

#### Q110. rescore 有什么用？

关键词：排序

答案：先用主查询召回 top window，再对小候选集用更复杂逻辑二次评分，降低全量复杂评分成本。

### 14.3 生产事故与架构设计题

#### Q111. search timeout 能保证停止吗？

关键词：稳定性

答案：timeout 是尽力而为，超时后返回已收集结果并标记 timed_out。它不是强杀所有底层计算的绝对保证。

#### Q112. terminate_after 有什么用？

关键词：降级

答案：每个 shard 收集到指定数量文档后提前终止，适合只关心是否存在或快速近似结果的场景。

#### Q113. preference 参数有什么用？

关键词：查询

答案：preference 可控制请求落到相同 shard copy，提升缓存命中和分页稳定性；也可用于隔离某些用户查询。

#### Q114. pre_filter_shard_size 是什么？

关键词：查询优化

答案：当查询涉及很多 shard 时，ES 可先执行 can_match 预过滤，减少真正查询的 shard 数。

#### Q115. search_type 还有哪些？

关键词：搜索类型

答案：常见默认 query_then_fetch；dfs_query_then_fetch 可提升全局评分准确性但成本更高。

#### Q116. terms query 传入超大列表怎么办？

关键词：权限过滤

答案：超大 terms 会增加内存和解析成本。应限制数量，或改用 terms lookup、权限预计算、反向建模。

#### Q117. 为什么 date_histogram 看板慢？

关键词：聚合

答案：时间范围大、shard 多、子聚合复杂或字段未优化。应限制范围、预聚合、用 rollup/downsampling。

#### Q118. global ordinals 是什么？

关键词：聚合

答案：keyword 等字段为加速 terms agg 会构建全局序号映射。高基数字段构建成本高，可使用 eager_global_ordinals 提前构建但会增加 refresh 成本。

#### Q119. eager_global_ordinals 何时用？

关键词：聚合调优

答案：高频聚合且可接受 refresh 变慢时可开启，让 refresh 阶段预构建 ordinals，降低首次聚合延迟。

#### Q120. index sorting 何时用？

关键词：排序

答案：当查询经常按固定字段过滤/排序时，索引排序可提升查询效率，但会增加写入和 merge 成本，需创建索引前评估。

#### Q121. refresh_interval 调大有什么副作用？

关键词：写入调优

答案：搜索可见延迟增加；缓存失效频率降低可能利好查询；写入吞吐提升。业务必须接受 NRT 延迟。

#### Q122. replicas=0 有什么风险？

关键词：高可用

答案：节点丢失会导致数据不可用甚至丢失。只适合初始导入且源数据可重放，完成后必须恢复副本。

#### Q123. 如何看 segment 数是否异常？

关键词：segment

答案：用 \_cat/segments 查看每 shard segment 数和大小。小 segment 过多通常来自 refresh 过频或写入模式不合理。

#### Q124. 如何处理 unassigned shard？

关键词：分配

答案：用 allocation explain 查看原因：磁盘、水位、过滤、版本、同节点限制、损坏等，再针对处理。不要盲目 reroute。

#### Q125. allocation filtering 常见坑？

关键词：分配

答案：节点属性或索引 require/include/exclude 设置错误会导致 shard 无法分配。迁移冷热层时尤其常见。

#### Q126. cluster.routing.allocation.enable 能乱改吗？

关键词：运维

答案：不能。关闭分配可用于维护，但忘记恢复会导致副本/恢复停滞。变更必须有时间窗口和回滚检查。

#### Q127. 如何安全下线节点？

关键词：运维

答案：先排除该节点分片分配，让 shard 迁走；确认无分片后停机。避免直接 kill 导致大量恢复。

#### Q128. 如何处理 pending tasks 多？

关键词：master

答案：查看任务类型，常见是 mapping 更新、shard 分配、索引创建删除。减少小索引/字段爆炸，稳定 master 资源。

#### Q129. master 节点可以做数据节点吗？

关键词：节点角色

答案：小测试环境可以，生产大集群建议专用 master，避免查询/写入/GC 影响集群状态管理。

#### Q130. 协调节点需要多大 heap？

关键词：coordinating

答案：取决于查询并发、聚合归并、fetch 大小。大聚合和深分页会给协调节点很大内存压力，需要单独压测。

#### Q131. 为什么要限制用户直接传 DSL？

关键词：稳定性

答案：原始 DSL 可能包含昂贵查询、脚本、深分页、全索引聚合，导致集群被打爆。应通过 API 模板和白名单控制。

#### Q132. 搜索接口怎么做限流？

关键词：限流

答案：按租户/用户/API key 维度限流；对聚合、导出、模糊搜索单独配额；超限返回降级或异步任务。

#### Q133. 如何看任务并取消慢任务？

关键词：tasks

答案：GET \_tasks?detailed=true&actions=\*search 查看任务，POST \_tasks/{taskId}/\_cancel 取消可取消任务。

#### Q134. reindex 时怎么不中断线上？

关键词：reindex

答案：新索引导入，源索引继续服务；增量同步追平；灰度验证；alias 原子切换；失败回滚 alias。

#### Q135. reindex 性能怎么优化？

关键词：reindex

答案：使用 slices 并行、bulk 调优、临时增大 refresh_interval/replicas=0、限制 source 字段、避开高峰。

#### Q136. delete_by_query 有什么风险？

关键词：删除

答案：会扫描并批量删除，产生 deleted docs 和 merge 压力；大范围删除建议按索引周期删除整个索引。

#### Q137. update_by_query 有什么风险？

关键词：更新

答案：会读取并重写大量文档，成本接近批量更新，易造成 merge 和写入压力，必须限速和分批。

#### Q138. 如何做同义词？

关键词：搜索相关性

答案：同义词可索引时展开或搜索时展开。索引时查询快但变更需重建；搜索时灵活但查询成本高。要有词库版本和评估。

#### Q139. 拼音搜索如何设计？

关键词：中文搜索

答案：独立 pinyin 字段或召回通道，结合权重和精确字段，避免拼音误召回影响主相关性。

#### Q140. suggest 怎么做？

关键词：自动补全

答案：completion suggester 或 search_as_you_type/edge_ngram。completion 快但内存和更新成本需评估；ngram 灵活但索引膨胀。

#### Q141. 向量检索和传统检索如何结合？

关键词：向量搜索

答案：向量召回语义相似，传统倒排保证关键词和过滤。常见做法是多路召回后融合排序，并用业务 filter 控制候选。

#### Q142. dense_vector 有什么成本？

关键词：向量搜索

答案：向量索引占内存/磁盘，构建和查询 HNSW 有 CPU 成本；维度、M、ef 参数影响召回、延迟和成本。

#### Q143. ES 和 ClickHouse 怎么选？

关键词：技术选型

答案：ES 强在全文检索和低延迟多条件搜索；ClickHouse 强在大规模列式分析和复杂聚合。日志平台常二者配合。

#### Q144. ES 和 Redis 怎么选？

关键词：技术选型

答案：Redis 是内存 KV/数据结构，适合超低延迟状态；ES 是搜索分析引擎，适合全文和多条件检索。

#### Q145. ES 和 MySQL 怎么配合？

关键词：架构

答案：MySQL 做事务事实源，ES 做搜索读模型。通过 CDC 异步同步，查询详情可按需回源数据库。

#### Q146. 如何做查询回源？

关键词：架构

答案：ES 返回 ID 和摘要，详情从 DB/服务查。适合减少 ES \_source 大字段和保证部分字段强一致，但会增加后端复杂度。

#### Q147. 如何避免搜索结果脏读？

关键词：一致性

答案：对强一致页面可写入后 refresh=wait_for 或查 DB；普通搜索接受 NRT；重要状态字段可查询时回源校验。

#### Q148. ES 事务怎么做？

关键词：事务

答案：ES 不提供跨文档 ACID 事务。需要事务一致的逻辑放 DB，ES 作为异步读模型。

#### Q149. seq_no 和 primary_term 有什么用？

关键词：并发控制

答案：用于乐观并发控制，确保更新基于预期版本，避免旧写覆盖新写。

#### Q150. version 字段和外部版本怎么用？

关键词：版本控制

答案：可用外部版本控制 CDC 事件顺序，旧版本事件写入被拒绝，防止乱序覆盖。具体实现要结合 ES 版本和客户端。

### 14.4 加分扩展题

#### Q151. refresh、flush、fsync 三者怎么区分？

关键词：基础原理

答案：refresh 让数据可搜索；flush 做 Lucene commit 并滚动 translog；fsync 是把 translog/文件同步到磁盘的系统调用。

#### Q152. 为什么 force merge 后快照可能更大或更慢？

关键词：快照

答案：force merge 会生成新大 segment，旧快照的增量复用减少。快照依赖 segment 级不可变文件，策略需综合评估。

#### Q153. searchable snapshot 是什么？

关键词：冷数据

答案：可直接搜索快照中的索引数据，常用于冷/冻结层降低本地存储成本，但查询延迟和能力需按场景评估。

#### Q154. CCR 适合什么？

关键词：灾备

答案：跨集群复制适合跨地域读、灾备、迁移等。要关注版本兼容、延迟、带宽和故障切换策略。

#### Q155. 如何回答“ES 能承载多少 QPS”？

关键词：面试表达

答案：不能脱离条件。要说明数据量、shard、查询类型、聚合、硬件、缓存命中、返回字段、SLA，并通过压测给结论。

#### Q156. 如何回答“一个 shard 最大多少”？

关键词：面试表达

答案：理论上 Lucene 有文档数上限，但生产按恢复时间和性能规划。官方经验多数场景 10~50GB、文档数低于 2 亿更稳。

#### Q157. 如何回答“ES 如何保证高可用”？

关键词：高可用

答案：副本、主副切换、master 选举、分片分配、快照恢复、跨 AZ 部署、监控告警和限流降级共同保证。

#### Q158. 如何回答“ES 如何扩容”？

关键词：扩容

答案：增加 data 节点后 shard rebalance；如果主分片不足则新索引/reindex/split；读压力可加副本；协调压力可加协调节点。

#### Q159. 如何回答“ES 如何降本”？

关键词：成本

答案：生命周期删除、冷热分层、减少副本、优化 mapping、合并小 shard、控制 \_source、大聚合下沉 OLAP。

#### Q160. 如何回答“为什么 ES 会丢数据”？

关键词：可靠性

答案：可能来自 replicas=0 节点丢失、translog async 崩溃窗口、误删、无快照、存储损坏或错误恢复 stale primary。生产要靠副本、request durability、快照和源数据重放。

#### Q161. 如何回答“ES 如何做权限”？

关键词：安全

答案：认证授权控制索引/API 访问；业务数据权限通过 tenant/org/user scope 字段 filter；敏感字段脱敏；禁止前端直接 DSL。

#### Q162. 如何回答“ES 如何监控”？

关键词：监控

答案：健康、节点资源、heap/GC、磁盘水位、shard、thread pool rejected、refresh/merge/index/search latency、slowlog、pending tasks、snapshot/ILM。

#### Q163. 如何回答“ES 查询链路瓶颈在哪里”？

关键词：性能

答案：可能在 shard 扇出、倒排扫描、排序、聚合、脚本、fetch \_source、协调节点归并、网络。用 slowlog/profile/hot_threads 定位。

#### Q164. 设计淘宝商品搜索，你怎么讲？

关键词：系统设计

答案：从数据同步、mapping/analyzer、召回、过滤、排序、聚合、个性化、缓存、降级、监控和重建索引展开。重点讲 text/keyword 多字段、同义词、类目过滤、库存状态、function_score 和搜索日志反馈。

#### Q165. 设计支付宝订单搜索，你怎么讲？

关键词：系统设计

答案：DB 为事实源，CDC-\>Kafka-\>Indexer-\>ES；订单 ID 幂等；按时间/租户拆索引；tenant/user 权限 filter；PIT+search_after 导出；alias 重建；定期校验补偿。

#### Q166. 设计 ELK 日志平台，你怎么讲？

关键词：系统设计

答案：采集端 Beats/FluentBit/Logstash，Kafka 缓冲，Ingest Pipeline 清洗，data stream 写入，ILM 热温冷删除，Kibana 看板，字段爆炸治理和多租户权限。

#### Q167. 100TB 日志保留半年怎么做？

关键词：容量

答案：按日/rollover data stream，冷热分层，热层 SSD 保存近期，冷层对象存储/searchable snapshot，控制 shard 10~50GB，ILM 删除过期，查询默认限制时间范围。

#### Q168. 用户要导出 500 万条搜索结果怎么办？

关键词：导出

答案：不要 from/size 深分页；使用 PIT+search_after 或离线 scroll/任务化导出；限制字段；异步生成文件；限流和超时；导出走专用集群或低峰执行。

#### Q169. 线上商品搜索突然无结果怎么办？

关键词：排障

答案：先看是否查询 DSL/分词/同义词变更，再看索引写入、alias 指向、mapping、refresh、集群 health、分片状态。用样本商品 ID 做 term 查询确认数据是否存在。

#### Q170. 新字段写入失败怎么办？

关键词：mapping

答案：看 bulk item 错误和 mapping；如果 dynamic strict 拒绝，走字段上线流程；如果类型冲突，修上游并 reindex 新索引。

#### Q171. 如何处理大客户租户热点？

关键词：多租户

答案：识别租户流量和 shard 分布；大客户独立索引或复合 routing；增加副本；查询限流；必要时按时间/业务拆分。

#### Q172. 如何做搜索结果排序 AB 实验？

关键词：搜索工程

答案：排序参数配置化，记录 query/session/exposure/click/order 日志，按实验桶路由，离线评估和在线指标结合，避免直接改全量排序。

#### Q173. 如何减少 ES 成本？

关键词：成本

答案：ILM 删除过期；冷热分层；减少副本；优化 mapping 去掉无用 index/doc_values；压缩 \_source；合并小索引；下沉离线分析到数仓。

#### Q174. 如何从 3 节点扩到 20 节点？

关键词：扩容

答案：先确保专用 master，规划数据层和 shard 分布；调整副本和 allocation；滚动扩容；观察 rebalance、恢复速度、磁盘水位和查询延迟。

#### Q175. 如何处理 ES 查询影响写入？

关键词：隔离

答案：读写资源混用时会争 CPU/IO/heap。可拆协调节点、冷热分层、读写隔离索引、增加副本、限制重查询和聚合。

#### Q176. 如何做数据删除合规？

关键词：合规

答案：源系统记录删除事件，ES 同步 delete 或软删除；快照保留需符合法规；对敏感字段可加密/脱敏；审计删除任务。

#### Q177. 如何设计搜索 API？

关键词：API 设计

答案：参数白名单，DSL 模板化，禁止用户直接传原始 DSL；默认时间范围和 size 上限；超时、限流、审计、慢查询日志。

#### Q178. 如何让面试官相信你有生产经验？

关键词：面试表达

答案：回答时说清楚数据量、QPS、shard 大小、refresh、bulk、慢查询、GC、事故处理和监控指标，而不是只背概念。
