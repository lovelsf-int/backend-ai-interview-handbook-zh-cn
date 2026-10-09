---
title: 主从复制与 Sentinel
description: 全量/增量复制、复制积压、下线判断、选主和故障转移
status: reviewing
baseline: Redis mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 两份 Redis 自有资料的复制与 Sentinel 内容合并
---

# 主从复制与 Sentinel

## 主从复制辅助材料

主库处理写入，副本通过**异步复制**追赶；读副本可能读到旧值。副本默认只读，单独配置主从复制不会在主库故障后自动晋升，自动故障转移由 Sentinel 等机制负责。

**建立复制与全量/部分同步**

用 `REPLICAOF` 建立复制关系（Redis 5.0 前命令名为 `SLAVEOF`）。现代复制使用 `PSYNC`，旧 `SYNC` 仅作兼容背景，不能代表当前重连流程。

1. 副本连接主库，报告已知的 replication ID 与复制 offset；首次同步没有可续接的历史，通常需要全量同步。
2. 若历史匹配，且主库 replication backlog 仍覆盖副本缺少的区间，则只发送缺失的复制流，完成部分重同步；历史不匹配或积压区间已被覆盖时，转为全量同步。
3. 全量同步传输 RDB 基线，主库同时缓冲期间新增的写入。副本加载基线后继续应用缓冲增量，再进入持续复制。RDB 可先落盘，也可由子进程直接通过网络传输，取决于磁盘/无盘复制配置。

**复制延迟怎么排查**

网络抖动、主从处理阻塞与资源不足都可能拉大复制差距。用 `INFO replication` / `ROLE` 检查连接、同一复制历史下的 offset 差距和全量同步情况；按写入速率与可容忍断连时间规划 backlog，并监控其覆盖窗口。网络改善与扩容只能降低延迟，不能把异步复制变成强一致。

**过期键：区分历史行为与当前语义**

Redis 3.2 起，副本已增加逻辑过期判断；对 `GET` 等适用的只读路径，即使尚未收到主库的删除命令，也可把已逻辑过期的 Key 视为不存在。因此，旧版“从库未物理删除就一定能读出过期值”的叙述不能用于当前版本。

正常复制模式下，主库负责驱动过期删除并传播 `DEL`，副本据此保持数据集一致；晋升后才独立承担主库的过期处理。内存仍占用、键是否逻辑可读、复制是否有延迟，是三个不同问题。

`EXPIREAT` / `PEXPIREAT` 只表达绝对过期时间，不能消除复制延迟；仍应使用可靠的时钟同步并监控漂移，不能把更换过期命令当成一致性修复。

**配置边界与安全**

- `protected-mode` 是访问保护，不能仅凭 yes/no 判断所有部署中的远程可达性；需结合版本、监听地址与认证配置。不要把 `protected-mode=no` 当作连通性修复方案，应核对网络隔离、最小权限认证以及 Redis/Sentinel 各自的访问配置。
- Sentinel 的故障判定参数是 `down-after-milliseconds`；`cluster-node-timeout` 属于 [Redis Cluster](./08-cluster.md)，不能混用，也不能未经故障演练就把“统一调大到某个秒数”当成通用方案。

### Sentinel 故障判断与选举

**1. 主观下线 SDOWN**

每个 Sentinel 周期性发送 PING；在 `down-after-milliseconds` 窗口内持续没有收到有效响应时，作出本地 SDOWN 判断。单个 Sentinel 的判断不足以触发自动故障转移。

**2. 客观下线 ODOWN**

Sentinel 向其他 Sentinel 询问；在规定时间窗口内，认为主库不可达的数量达到配置的 `quorum`（包含自身）时，将主库标记为 ODOWN。这里是“大于等于 quorum”，不是“超过 quorum”。

ODOWN 仅适用于主库。从库与其他 Sentinel 可被单个 Sentinel 判断为 SDOWN，但不走主库的 ODOWN/自动故障转移流程。主库达到 ODOWN 后，仍须获得故障转移授权。

**3. Sentinel Leader 授权**

候选 Sentinel 在主库满足故障转移条件后请求授权；每个 Sentinel 在同一选举 epoch 中至多投给一个候选者，不能把“最先发现 SDOWN”直接等同于当选。

执行故障转移需要同时达到 `quorum` 与所有已知 Sentinel 的严格多数，即 `max(quorum, floor(N/2)+1)` 票。5 个 Sentinel、quorum=2 时，2 个即可判 ODOWN，但至少 3 票才可授权故障转移。

**4. 选择新主库**

获授权的 Sentinel 从可用副本中按以下顺序挑选：

1. 过滤不可用、与旧主断连时间过长以及 `replica-priority=0` 的从库；0 表示永不晋升。
2. 按 `replica-priority` 数值从小到大选择（旧名 `slave-priority`）；数值越小越优先。
3. 优先级相同时，选复制偏移量更大的从库。
4. 再相同时，选 run ID 字典序更小的从库。

这不是“永远选数据最新的从库”：配置优先级先于偏移量，也不消除异步复制的数据丢失窗口。

### Sentinel 自动发现与通知

- **发现其他 Sentinel**：在被监控的主库与副本上，通过 `__sentinel__:hello` Pub/Sub 频道发布自身地址和拓扑信息、订阅其他 Sentinel 的消息，再建立相互通信。该内部频道应受权限保护。
- **发现副本**：向主库查询 `INFO`，获得副本地址及状态，随后直接监控这些副本；无需逐个手工配置副本列表。
- **客户端通知与重新发现**：Sentinel 提供切换等 Pub/Sub 事件和当前主库地址查询。客户端需要支持 Sentinel 协议，断线重连时重新查询拓扑，不能把通知当成可靠消息队列或假设它会替业务自动修改外部配置中心。

## 第八章 Redis 高可用架构：哨兵机制

### 8.1 哨兵核心作用

Sentinel 负责监控、授权故障转移、重配副本并向客户端提供拓扑；旧主恢复后也会被重配为副本。常见部署是一主二从、至少三个跨故障域 Sentinel，可提高可用性，但不保证零数据丢失。具体门槛统一见 [故障判断与选举](#sentinel-故障判断与选举)。

### 8.2 故障检测机制

#### 8.2.1 主观下线 SDOWN

单个 Sentinel 的本地不可达判断，不能独自触发自动切换，见 [完整流程](#sentinel-故障判断与选举)。

#### 8.2.2 客观下线 ODOWN

达到 quorum 即可判定主库 ODOWN；真正执行故障转移还需授权。参见 [完整规则](#sentinel-故障判断与选举)。

<a id="_8-3-哨兵leader选举-raft算法"></a>

### 8.3 哨兵 Leader 选举

在同一 epoch 内投票，授权票数须同时达到 quorum 与严格多数；失败后重试。具体门槛和示例统一见 [Sentinel 故障判断与选举](#sentinel-故障判断与选举)。

### 8.4 新主节点挑选规则

先过滤，再按非零 `replica-priority` 数值升序、偏移量降序、run ID 字典序升序选择；完整条件见 [选举流程](#sentinel-故障判断与选举)。

## min-replicas 的保护边界

`min-replicas-to-write` 与 `min-replicas-max-lag` 联合限制：只有足够数量的副本保持连接且确认延迟在阈值内，主库才接受写入。它检查的是副本近期状态，不是等待当前每条写入同步完成。因此可缩小网络分区下的写入/丢失窗口，但不能证明当前写入已复制、不能消除脑裂，也不提供锁的 fencing。

## 版本与来源

本轮定向校准：2026-10-09，范围为复制恢复、过期读取、配置安全、Sentinel 发现/选举和写入限制。

- [Redis Sentinel：quorum 与 replica selection](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/)
- [Redis replication：全量/部分重同步、过期键和最小副本写入限制](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)
- [PSYNC 命令与版本](https://redis.io/docs/latest/commands/psync/)
- [Redis 3.2 发布记录：副本逻辑过期](https://github.com/redis/redis/blob/3.2/00-RELEASENOTES)
- [Redis security：网络隔离、protected mode 与认证](https://redis.io/docs/latest/operate/oss_and_stack/management/security/)
