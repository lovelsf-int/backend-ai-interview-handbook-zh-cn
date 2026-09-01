---
title: Elasticsearch 生产故障手册
description: 集群状态、OOM、Rejected、慢查询、磁盘水位和恢复
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# Elasticsearch 生产故障手册

## 源章节：生产常见问题与故障排查手册

本章按“现象 -\> 可能原因 -\> 排查命令 -\> 处理方案 -\> 预防措施”组织。线上事故要先止血，再定位根因，最后固化治理。

### 10.1 集群 Red

| **项**   | **内容**                                                                                                                                       |
|----------|------------------------------------------------------------------------------------------------------------------------------------------------|
| 现象     | 部分 primary shard 未分配，业务读写报错或部分索引不可用。                                                                                      |
| 常见原因 | 节点丢失、磁盘损坏、分片分配失败、索引损坏、误删数据目录。                                                                                     |
| 排查命令 | GET \_cluster/health; GET \_cat/shards?v; GET \_cluster/allocation/explain                                                                     |
| 处理方案 | 先恢复丢失节点；检查磁盘水位和 allocation rules；有快照则 restore；无副本且无快照时只能谨慎 allocate_stale_primary 或 allocate_empty_primary。 |

### 10.2 集群 Yellow

| **项**   | **内容**                                                           |
|----------|--------------------------------------------------------------------|
| 现象     | primary 正常但 replica 未分配。                                    |
| 常见原因 | 节点数不足、磁盘水位、allocation filtering、同一主副不能在同节点。 |
| 排查命令 | GET \_cat/shards?v; GET \_cluster/allocation/explain               |
| 处理方案 | 补节点或释放磁盘；修正 allocation 配置；降低副本数作为临时止血。   |

### 10.3 写入突然变慢

| **项**   | **内容**                                                                                          |
|----------|---------------------------------------------------------------------------------------------------|
| 现象     | bulk 响应时间升高，吞吐下降。                                                                     |
| 常见原因 | refresh 过频、merge backlog、磁盘 IO、bulk 过大、replica 慢、mapping 动态更新。                   |
| 排查命令 | GET \_nodes/stats/indices,thread_pool,fs,jvm; GET \_cat/thread_pool/write?v; GET \_cat/segments?v |
| 处理方案 | 调大 refresh_interval；降低客户端并发；扩容热节点；修复 mapping；排查磁盘。                       |

### 10.4 bulk rejected

| **项**   | **内容**                                                     |
|----------|--------------------------------------------------------------|
| 现象     | 客户端收到 429 或 rejected。                                 |
| 常见原因 | 写线程池队列满、节点 CPU/IO 饱和、客户端并发过高。           |
| 排查命令 | GET \_cat/thread_pool/write?v; GET \_nodes/hot_threads       |
| 处理方案 | 客户端指数退避重试；降低并发；增加数据节点；优化 bulk size。 |

### 10.5 查询慢

| **项**   | **内容**                                                                |
|----------|-------------------------------------------------------------------------|
| 现象     | P95/P99 延迟升高。                                                      |
| 常见原因 | 深分页、wildcard、脚本、聚合大、query 扇出过多、fetch \_source 大。     |
| 排查命令 | 慢日志; profile API; GET \_nodes/hot_threads; GET \_tasks?detailed=true |
| 处理方案 | 优化 DSL；限制分页；增加过滤；控制返回字段；拆分冷热索引。              |

### 10.6 OOM

| **项**   | **内容**                                                                             |
|----------|--------------------------------------------------------------------------------------|
| 现象     | 节点被杀或日志出现 OutOfMemoryError。                                                |
| 常见原因 | fielddata、大聚合、bulk 过大、shard 过多、mapping 爆炸。                             |
| 排查命令 | GET \_nodes/stats/jvm,breaker,indices/fielddata; GC 日志                             |
| 处理方案 | 禁用 text fielddata；改 keyword/doc_values；限制聚合；减少 shard；调整 heap 和查询。 |

### 10.7 GC 飙升

| **项**   | **内容**                                                           |
|----------|--------------------------------------------------------------------|
| 现象     | old GC 频繁，节点离线或 master 认为节点失联。                      |
| 常见原因 | heap 压力大、缓存膨胀、聚合、脚本、cluster state 大。              |
| 排查命令 | GET \_nodes/stats/jvm; hot_threads; GC logs                        |
| 处理方案 | 降低查询/聚合压力；清理 fielddata；减少 shard/字段；扩容或拆角色。 |

### 10.8 磁盘水位触发

| **项**   | **内容**                                                                                  |
|----------|-------------------------------------------------------------------------------------------|
| 现象     | 分片不再分配，索引可能只读。                                                              |
| 常见原因 | 磁盘达到 low/high/flood stage watermark。                                                 |
| 排查命令 | GET \_cat/allocation?v; GET \_cluster/settings?include_defaults=true; GET \_cat/indices?v |
| 处理方案 | 扩容/删数据/快照后删除；解除 read_only_allow_delete；调整 ILM。                           |

### 10.9 mapping conflict

| **项**   | **内容**                                                   |
|----------|------------------------------------------------------------|
| 现象     | 写入报 mapper_parsing_exception。                          |
| 常见原因 | 同名字段不同类型；动态 mapping 推断错误。                  |
| 排查命令 | 查看错误 bulk item; GET index/\_mapping                    |
| 处理方案 | 修复上游类型；新建正确 mapping 索引；reindex；alias 切换。 |

### 10.10 mapping explosion

| **项**   | **内容**                                                        |
|----------|-----------------------------------------------------------------|
| 现象     | master 压力大，mapping 巨大。                                   |
| 常见原因 | 动态字段过多、用户自定义 key 无限制。                           |
| 排查命令 | GET \_cluster/state/metadata; GET index/\_mapping               |
| 处理方案 | dynamic: strict/false；flattened；dynamic_templates；字段准入。 |

### 10.11 search queue rejected

| **项**   | **内容**                                              |
|----------|-------------------------------------------------------|
| 现象     | 搜索被拒绝。                                          |
| 常见原因 | 并发查询过高、慢查询占满线程、聚合过重。              |
| 排查命令 | GET \_cat/thread_pool/search?v; tasks API             |
| 处理方案 | 限流、超时、取消慢任务、优化查询、扩容协调/数据节点。 |

### 10.12 主节点不稳定

| **项**   | **内容**                                                           |
|----------|--------------------------------------------------------------------|
| 现象     | 频繁 master election。                                             |
| 常见原因 | master 节点资源不足、GC、网络抖动、cluster state 过大。            |
| 排查命令 | master 日志; pending_tasks; nodes stats                            |
| 处理方案 | 专用 master；降低 cluster state；修复网络；避免重任务打到 master。 |

### 10.13 副本恢复很慢

| **项**   | **内容**                                                    |
|----------|-------------------------------------------------------------|
| 现象     | 节点重启后 recovery 长时间进行。                            |
| 常见原因 | shard 太大、网络慢、磁盘慢、并发恢复限制。                  |
| 排查命令 | GET \_cat/recovery?v; GET \_nodes/stats/fs,transport        |
| 处理方案 | 控制 shard 10~50GB；扩容带宽/磁盘；合理调整 recovery 参数。 |

### 10.14 删除数据后磁盘不降

| **项**   | **内容**                                                         |
|----------|------------------------------------------------------------------|
| 现象     | delete_by_query 后空间仍高。                                     |
| 常见原因 | 删除只是标记，merge 后才释放。                                   |
| 排查命令 | GET \_cat/segments?v                                             |
| 处理方案 | 等待 merge；冷只读索引谨慎 force merge；不要对热索引频繁大删除。 |

### 10.15 ILM 卡住

| **项**   | **内容**                                                           |
|----------|--------------------------------------------------------------------|
| 现象     | 索引未 rollover/delete。                                           |
| 常见原因 | 条件不满足、alias 错、policy 错、分片分配失败。                    |
| 排查命令 | GET index/\_ilm/explain                                            |
| 处理方案 | 修正 rollover alias/data stream；处理 allocation；retry ILM step。 |

### 10.16 快照失败

| **项**   | **内容**                                                  |
|----------|-----------------------------------------------------------|
| 现象     | snapshot partial/failed。                                 |
| 常见原因 | 仓库权限、网络、分片不可用、存储异常。                    |
| 排查命令 | GET \_snapshot/repo/snap; GET \_cat/snapshots/repo?v      |
| 处理方案 | 修复 repository；恢复 red shard；重试；定期演练 restore。 |

### 10.17 慢聚合

| **项**   | **内容**                                                          |
|----------|-------------------------------------------------------------------|
| 现象     | terms/date_histogram 很慢。                                       |
| 常见原因 | 高基数、时间范围大、字段无 doc_values、shard 多。                 |
| 排查命令 | profile; slowlog; nodes stats breaker                             |
| 处理方案 | 缩小范围；composite 分页；预聚合；rollup/downsampling；优化字段。 |

### 10.18 热点节点

| **项**   | **内容**                                                  |
|----------|-----------------------------------------------------------|
| 现象     | 个别节点 CPU/IO 远高于其他节点。                          |
| 常见原因 | shard 分布不均、热点 routing、单大租户、查询偏斜。        |
| 排查命令 | \_cat/shards; \_cat/allocation; hot_threads               |
| 处理方案 | reroute/rebalance；拆租户；调整 routing；增加副本分摊读。 |

### 10.19 索引只读

| **项**   | **内容**                                                               |
|----------|------------------------------------------------------------------------|
| 现象     | 写入返回 cluster_block_exception。                                     |
| 常见原因 | 磁盘 flood-stage 后自动加 read_only_allow_delete。                     |
| 排查命令 | GET index/\_settings?filter_path=\*.settings.index.blocks              |
| 处理方案 | 释放磁盘后 PUT index/\_settings {blocks.read_only_allow_delete:null}。 |

### 10.20 高亮很慢

| **项**   | **内容**                                         |
|----------|--------------------------------------------------|
| 现象     | highlight 查询延迟高。                           |
| 常见原因 | 大字段、命中文档多、需要重新分析。               |
| 排查命令 | profile; slowlog                                 |
| 处理方案 | 限制高亮字段和片段；用 unified/fvh；减少候选集。 |

### 10.21 通用排障命令包

**一线排障命令**

> GET \_cluster/health?pretty
>
> GET \_cat/nodes?v&h=ip,name,heap.percent,ram.percent,cpu,load_1m,node.role,disk.used_percent,master
>
> GET \_cat/indices?v&s=store.size:desc
>
> GET \_cat/shards?v&h=index,shard,prirep,state,docs,store,node,unassigned.reason&s=state,index
>
> GET \_cluster/allocation/explain
>
> GET \_cat/thread_pool?v&s=rejected:desc
>
> GET \_nodes/stats/jvm,fs,indices,thread_pool,breaker,os,process
>
> GET \_nodes/hot_threads?threads=3
>
> GET \_tasks?detailed=true&actions=\*search
>
> GET \_cat/segments?v&s=size:desc
>
> GET \_cat/recovery?v&active_only=true
>
> GET \_cat/pending_tasks?v
>
> GET \_cluster/settings?include_defaults=true
