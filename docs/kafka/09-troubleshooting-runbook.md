---
title: Kafka 生产故障排查
description: Lag、重复、丢失、ISR、磁盘与 Rebalance 风暴排查
status: reviewing
baseline: Kafka KRaft-oriented source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Kafka P7/P8 面试强化版（canonical）
---

# Kafka 生产故障排查

## 第十章：生产故障排查题

### 10.1 Consumer Lag 持续增长

回答框架：

49. 看总生产速率与总消费速率，确认是突发还是持续容量不足。

50. 看分区级 Lag，判断热点分区。

51. 看 Rebalance、Poll 间隔、GC 和线程池。

52. 看下游数据库、接口、连接池和限流。

53. 临时止血：扩消费者、降级非核心逻辑、批处理、暂停低优先级流量。

54. 根治：调整 Key、分区、批量、下游容量和背压机制。

### 10.2 消息重复

排查：

- Producer 是否未启幂等或上游业务重复创建事件。

- ACK 超时重试是否形成重复。

- Consumer 是否处理成功但 Offset 未提交。

- Rebalance 是否发生在处理与提交之间。

- 重试/DLQ 回放是否没有复用原 event_id。

处理：开启 Producer 幂等；消费端唯一键/Inbox 去重；状态机校验；记录原 Topic/Partition/Offset 和事件 ID；回放工具默认幂等。

### 10.3 消息疑似丢失

不要立刻断言 Kafka 丢消息，应沿链路核对：

55. Producer Callback 是否成功，是否最终超时。

56. Topic、Partition、Key 和 ACL 是否正确。

57. Broker 是否发生 ISR 不足、非安全选主或磁盘故障。

58. 消费组 Offset 是否被错误推进或重置。

59. 消费者是否过滤、反序列化失败、进入 DLQ。

60. 外部系统写入是否失败但日志误报成功。

### 10.4 ISR 频繁收缩

检查 Follower Fetch 延迟、Broker GC、磁盘 IO、网络抖动、跨可用区带宽、超大批次和故障 Broker。先判断单 Broker、单磁盘还是全局问题，再决定限流、迁移 Leader、扩容或下线节点。

### 10.5 磁盘即将写满

止血：限制非核心 Producer、缩短非关键 Topic 保留期、扩盘或迁移分区。不要直接手工删除 Kafka 日志文件。

根治：容量预测、磁盘水位告警、Topic 配额、合理 Retention、Tiered Storage、分区均衡和大消息治理。

### 10.6 Rebalance 风暴

检查成员频繁重启、max.poll.interval.ms、Session Timeout、心跳、长 GC、单批处理过慢、订阅 Topic/Partition 变化。使用静态成员、Cooperative 或新版 Consumer Protocol，减少单次 Poll 工作量并优化下游。
