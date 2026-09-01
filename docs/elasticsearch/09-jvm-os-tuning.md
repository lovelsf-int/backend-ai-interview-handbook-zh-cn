---
title: JVM、OS 与硬件调优
description: 堆内存、Page Cache、GC、磁盘、线程池和参数治理
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# JVM、OS 与硬件调优

## 源章节：JVM、OS、硬件与集群参数调优

> 参数边界：JVM、GC、堆大小、Page Cache 和线程池配置必须以目标版本、容器限制、硬件与基准测试为准。

### 9.1 调优总原则

ES 调优不是单个参数魔法，而是围绕业务目标做平衡：写入吞吐、查询延迟、搜索实时性、成本、可靠性。先做容量规划和数据模型，再调参数。

### 9.2 JVM Heap

Heap 不宜设置过大。官方文档强调堆大小应不超过 compressed ordinary object pointers 阈值，26GB 在多数系统较安全，有些系统可到 30GB；同时总内存的 50% 只是上限，给文件系统缓存留足空间通常更重要。

| **机器内存** | **推荐 Heap 起点** | **说明**                              |
|--------------|--------------------|---------------------------------------|
| 16GB         | 6GB~8GB            | 小集群或协调节点                      |
| 32GB         | 12GB~16GB          | 常见数据节点                          |
| 64GB         | 24GB~30GB          | 注意 compressed oops，留足 page cache |
| 128GB+       | 仍通常不超过 30GB  | 更多内存给 OS cache，不是都给 heap    |

**Heap 设置**

> \# jvm.options.d/heap.options
>
> -Xms16g
>
> -Xmx16g
>
> \# 验证 compressed oops
>
> GET \_nodes/\_all/jvm?filter_path=nodes.\*.jvm.using_compressed_ordinary_object_pointers

### 9.3 GC 与内存问题

- 长期 heap 使用率高并伴随频繁 old GC，优先排查聚合、fielddata、shard 过多、bulk 过大、脚本、mapping 爆炸。

- ES 新版本默认 JVM/GC 配置通常已经较合理，不建议随意复制旧版 CMS 参数。

- OOM 前常见信号：circuit breaker 触发、GC overhead、search/bulk rejected、节点掉线。

### 9.4 OS 与硬件

| **项**           | **建议**                    | **原因**                           |
|------------------|-----------------------------|------------------------------------|
| 磁盘             | 热数据 SSD/NVMe，本地盘优先 | merge、flush、fetch 对 IO 敏感     |
| 内存             | Heap + Page Cache 均衡      | segment 文件依赖 OS cache          |
| CPU              | 高查询/聚合需要更多核心     | BM25、聚合、压缩解压、脚本消耗 CPU |
| 网络             | 节点间低延迟高带宽          | 副本复制、查询归并、恢复都走网络   |
| Swap             | 关闭或避免 swap             | JVM 被换出会导致长时间停顿         |
| 文件句柄         | 提高 ulimit                 | segment 文件多，连接多             |
| vm.max_map_count | Linux 调高到 262144 或更高  | mmap segment 文件需要              |

### 9.5 写入调优清单

17. 使用 Bulk，并压测 bulk size 与客户端并发。

18. 可接受搜索延迟时调大 refresh_interval；离线导入可临时 -1。

19. 初始大批量导入且源数据可重放时，可临时 replicas=0，完成后恢复副本。

20. 显式 mapping，避免动态字段和类型冲突。

21. 减少不必要字段的 index/doc_values；大文本不要聚合。

22. 避免高频 update，同一文档频繁更新会制造 deleted docs 和 merge 压力。

23. 监控 indexing_pressure、bulk rejected、merge time、translog size、refresh time。

### 9.6 查询调优清单

24. 建立准确 mapping：text 用于全文，keyword/numeric/date 用于过滤、排序、聚合。

25. 精确条件放 filter，避免无意义 score。

26. 限制时间范围和租户范围，减少查询扇出。

27. 避免深分页，使用 search_after + PIT。

28. 控制 \_source，必要时只返回 fields/docvalue_fields。

29. 对固定看板聚合启用/利用 request cache。

30. 使用 profile API 找到最耗时 query/agg，而不是盲调参数。

### 9.7 集群级治理

- 控制 shard 总数，避免每个业务随意创建索引。

- 通过 index template/component template 统一 settings/mapping/ILM。

- 用 ILM 自动 rollover、shrink、force merge、delete。

- 慢查询、慢写入、GC、磁盘水位、线程池拒绝、pending tasks 必须纳入监控。
