---
title: RDB、AOF 与恢复
description: 快照、AOF 刷盘、重写、混合持久化与数据丢失窗口
status: reviewing
baseline: Redis mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 两份 Redis 自有资料的持久化内容合并
---

# RDB、AOF 与恢复

> “最多丢多少数据”取决于刷盘策略、操作系统和故障类型，不能只凭一个固定秒数作绝对承诺。

## 第四章 Redis 持久化机制（RDB / AOF / 混合持久化）

### 4.1 RDB 快照持久化

核心：定时生成**全量内存快照**，二进制文件，恢复速度快。

**触发方式**

手动：bgsave、save

自动：save m n 配置（m秒n次修改触发）

**优缺点**

优点：文件小、恢复快、适合冷备

缺点：存在数据丢失窗口、无法实时持久化

### 4.2 AOF 日志持久化

核心：记录每一条**写命令日志**，重启回放日志恢复数据。

**刷盘策略**

`always`：每批追加写入后执行 fsync，再向客户端确认，耐久性更强、刷盘开销更大；仍依赖存储正确实现持久化，不能承诺所有故障下零丢失。

`everysec`：通常每秒 fsync，常见故障窗口约一秒；磁盘阻塞、刷盘配置与故障类型会影响实际窗口，不是无条件的一秒上限。

`no`：由操作系统决定刷盘时机，通常有更大的数据丢失窗口。

**AOF 重写机制**

合并冗余命令、删除无效命令，压缩AOF文件体积，避免日志无限膨胀。

<a id="_4-3-混合持久化-redis4-0-生产推荐"></a>

### 4.3 混合持久化（Redis 4.0+）

启用 `aof-use-rdb-preamble` 后，AOF 重写可用 **RDB 格式的基线 + 后续 AOF 增量**。它属于 AOF 的组织方式，不是将独立的定时 `dump.rdb` 与任意 AOF 拼接恢复。

- Redis 4.x–6.x：同一 AOF 文件前部可为 RDB，后部追加命令日志。
- Redis 7.0+：多段 AOF，由 manifest 管理一个基线文件与增量文件；基线可为 RDB 或 AOF 格式。
- 常规启动同时启用 RDB/AOF 时，优先从 AOF 恢复；混合格式先加载 AOF 基线，再按顺序回放其增量。

混合格式改善体积与恢复速度，耐久性仍取决于 AOF 刷盘和存储。应按恢复演练、可接受丢失窗口与资源成本选型。

### 4.4 机器掉电数据丢失分析

先确认哪些写入已向客户端成功确认、采用何种刷盘策略，以及磁盘是否可靠完成 fsync；不能把 `everysec` 或 `always` 当成跨所有故障类型的零丢失保证。刷盘边界见 [AOF 日志持久化](#_4-2-aof-日志持久化)。

## 版本与来源

本轮定向校准：2026-10-09，仅核对 AOF 刷盘和混合格式边界。

- [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- [Redis 7.2 配置：aof-use-rdb-preamble](https://github.com/redis/redis/blob/7.2/redis.conf)
