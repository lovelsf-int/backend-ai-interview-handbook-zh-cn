---
title: 日志存储与高性能基础
description: Segment、稀疏索引、Page Cache、顺序写与日志保留
status: reviewing
baseline: Kafka KRaft-oriented source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Kafka P7/P8 面试强化版（canonical）
---

# 日志存储与高性能基础

## 第三章：日志存储与高性能基础

### 3.1 Partition、Segment 与文件

每个分区对应一个日志目录，日志由多个 Segment 组成。常见文件包括：

- .log：Record Batch 数据。

- .index：相对 Offset 到物理位置的稀疏索引。

- .timeindex：时间戳到 Offset 的稀疏索引。

- Leader Epoch Checkpoint：记录 Leader Epoch 与起始 Offset，辅助副本截断和一致性恢复。

Segment 文件名通常使用该 Segment 的 Base Offset。索引项保存相对 Offset，而不是为每条消息建立完整索引。

### 3.2 为什么使用稀疏索引

Kafka 的查询主要是按 Offset 或时间定位，不需要数据库式任意条件查询。稀疏索引的查找过程通常是：

35. 根据 Base Offset 找到目标 Segment。

36. 在 .index 中二分查找不大于目标 Offset 的最近索引项。

37. 从对应物理位置顺序扫描少量记录。

优势是索引小、适合内存映射、写入维护成本低；代价是定位后还需要短距离顺序扫描。

### 3.3 为什么 Kafka 快

Kafka 的高吞吐来自一组协同设计，不是单一“顺序写”：

- Producer 按分区批量发送，减少请求数和系统调用。

- Record Batch 端到端压缩，降低网络和磁盘流量。

- 分区日志顺序追加，减少随机寻址。

- 依赖操作系统 Page Cache，避免把海量日志放进 JVM Heap。

- 稀疏索引减少索引空间和维护成本。

- Broker 使用 Reactor 风格网络层和请求处理线程池。

- Fetch 响应在适用路径使用 sendfile 等零拷贝能力，减少用户态复制。

- 分区提供并行度，可在 Broker 间水平扩展。

边界：启用 TLS、消息格式转换、远程存储或某些处理链路时，零拷贝路径可能不同。不要把“零拷贝”说成所有请求都完全没有内存复制。

### 3.4 Page Cache 与持久性

Kafka 写日志通常先进入操作系统 Page Cache，之后由操作系统刷盘。Producer 收到 ACK 的核心依据是复制协议和 ISR 状态，而不是简单等价于每个副本都执行了物理 fsync。

可靠性主要依靠：

- 多副本复制。

- acks=all。

- 合理的 min.insync.replicas。

- 禁止非同步副本参与正常 Leader 选举。

- Broker、机架和可用区故障域隔离。

### 3.5 保留、删除与日志压缩

- cleanup.policy=delete：按 retention.ms 或 retention.bytes 删除旧 Segment。

- cleanup.policy=compact：按 Key 保留较新的值，适合状态变更日志；不保证只剩一个物理版本，也不是立即完成。

- delete,compact：可组合两种策略。

- Tombstone：Key 非空、Value 为空的记录可表达删除语义。

- Tiered Storage：将完成的旧 Segment 下沉到远端存储，减少 Broker 本地盘压力，但增加远端读取延迟和运维复杂度。
