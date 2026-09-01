---
title: 副本复制与故障恢复
description: ISR、HW、LSO、Leader Epoch、故障选举与不丢消息边界
status: reviewing
baseline: Kafka KRaft-oriented source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Kafka P7/P8 面试强化版（canonical）
---

# 副本复制与故障恢复

## 第六章：副本复制与故障恢复

### 6.1 AR、ISR、OSR

- AR：分区被分配的全部副本。

- ISR：与 Leader 保持足够同步、具备正常 Leader 选举资格的副本集合，包含 Leader。

- OSR：落后超过阈值、暂不在 ISR 的 Follower。

ISR 是动态集合。Follower 复制滞后会被移出 ISR；追平后可以重新加入。

### 6.2 LEO、HW、LSO 与 Leader Epoch

- LEO：副本日志末端位置。

- HW：高水位，表示已复制到 ISR 安全边界的 Offset；普通消费者只能看到 HW 之前的记录。

- LSO：Last Stable Offset。存在未完成事务时，read_committed 最多读取到 LSO。

- Leader Epoch：标识某一任 Leader 的任期，帮助副本在 Leader 切换后判断截断位置，避免只依赖旧 HW 的缺陷。

不要把 HW 直接说成“ISR 中最小 LEO”的永恒实现公式；面试更稳妥的说法是它代表分区已提交、对普通消费可见的复制安全边界。

### 6.3 Leader 故障

正常情况下从 ISR 中选择新 Leader。新 Leader 确立后，其他副本按 Leader Epoch 和日志边界截断不一致尾部并继续复制。

若开启 Unclean Leader Election，可能从非 ISR 副本选主，提高可用性但存在数据丢失风险。核心业务通常关闭该能力，宁可短暂不可用也不接受已确认数据回退。

### 6.4 “Kafka 如何保证不丢消息”的完整回答

不能只回答一个 acks=all，要覆盖三端：

Producer：

- 使用 Callback/Future 检查结果。

- 开启幂等、有限重试与合理总投递超时。

- acks=all。

- 对最终失败记录落补偿表或告警，不能无限重试。

Broker：

- 副本因子通常至少 3。

- min.insync.replicas 通常至少 2。

- 副本跨 Broker、机架或可用区分布。

- 关闭不安全 Leader 选举。

- 监控 Under Replicated、Under Min ISR、Offline Partition 和磁盘水位。

Consumer：

- 业务完成后再提交 Offset。

- 消费逻辑具备幂等性。

- 失败进入可控重试或死信，不静默跳过。

- 记录消费结果、失败原因和补偿状态。

结论：Kafka 能降低丢失概率并提供明确保证，但“绝对零丢失”仍依赖配置、故障模型、客户端处理和业务补偿闭环。
