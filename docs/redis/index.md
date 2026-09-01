---
title: Redis 原理、架构与面试手册
description: 从事件循环、数据结构到持久化、高可用、缓存一致性和分布式锁
status: reviewing
baseline: Redis mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 两份 Redis 自有资料的主题合并
---

# Redis 原理、架构与面试手册

> 本专题包含多个 Redis 版本口径，首轮迁移统一标记为 `reviewing`。读者必须结合目标版本官方文档复核内部编码、默认值和客户端行为。

## 阅读顺序

1. [线程模型与事件循环](./01-thread-model-event-loop.md)
2. [数据结构与版本差异](./02-data-structures-version-differences.md)
3. [过期删除、内存淘汰与 Rehash](./03-expiration-eviction.md)
4. [RDB、AOF 与恢复](./04-rdb-aof-recovery.md)
5. [缓存一致性与二级缓存](./05-cache-consistency.md)
6. [缓存穿透、击穿与雪崩](./06-penetration-breakdown-avalanche.md)
7. [主从复制与 Sentinel](./07-replication-sentinel.md)
8. [Redis Cluster 与哈希槽](./08-cluster.md)
9. [事务、Lua 与 Functions](./09-transactions-lua-functions.md)
10. [Redisson、分布式锁与 Fencing Token](./10-redisson-fencing-token.md)
11. [BigKey、HotKey 与阻塞事件](./11-bigkey-hotkey-incidents.md)
12. [面试速答与故障排查](./12-interview-troubleshooting.md)

## 迁移策略

架构级手册提供章节主线，旧笔记只补充事件循环、复制、Cluster 和阻塞机制中的独有解释。重复章节不重复发布，绝对化表述改为带版本和故障边界的说明。
