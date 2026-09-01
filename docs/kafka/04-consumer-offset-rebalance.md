---
title: Consumer、Offset 与 Rebalance
description: 消费组、Offset、提交语义、Rebalance 演进与 Lag
status: reviewing
baseline: Kafka KRaft-oriented source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Kafka P7/P8 面试强化版（canonical）
---

# Consumer、Offset 与 Rebalance

## 第五章：Consumer、Offset 与 Rebalance

### 5.1 Pull 模型

Consumer 主动 Poll，使消费速率由消费者控制，并可通过 fetch.min.bytes、fetch.max.wait.ms 和批量大小在延迟与吞吐间取舍。

不要把 Poll 理解成“无数据就忙循环”。Broker 可等待达到字节门槛或等待时间后再返回。

### 5.2 Group 与并行度

- 一个分区在同一 Group 内同一时刻只分配给一个成员。

- 消费者少于分区数：一个消费者处理多个分区。

- 消费者多于分区数：多出的消费者没有分区。

- 最大有效并行度受分区数限制，但增加分区也会增加元数据、文件、复制和重平衡成本。

### 5.3 Offset、Position 与 Commit

- Position：当前 Consumer 下一次 Poll 的读取位置。

- Committed Offset：Consumer Group 恢复时使用的已提交位置。

- 提交值应是“下一条待处理记录”的 Offset，而不是最后处理记录本身。

现代 Group Offset 存储在 \_\_consumer_offsets。Offset 提交不是业务处理事务，除非使用 Kafka Transaction 将 Offset 与输出记录原子提交。

### 5.4 自动提交与手动提交

- 自动提交简单，但提交发生时业务可能尚未真正处理完成。

- 处理前提交：故障可能丢处理。

- 处理后提交：故障窗口可能重复处理，形成 At-Least-Once。

- commitSync() 易处理错误但会阻塞。

- commitAsync() 吞吐较好，但回调、提交顺序和失败处理更复杂。

稳妥口径：大多数外部副作用场景使用处理后提交 + 业务幂等，而不是声称手动提交就能 Exactly-Once。

### 5.5 Rebalance 演进

Classic Group 的典型触发条件：成员变化、订阅 Topic 变化、分区数变化、成员心跳或 Poll 超时。

常见策略：

- Range：按 Topic 分配，多个 Topic 时可能让前几个消费者承担更多分区。

- RoundRobin：跨 Topic 轮询分配，要求订阅结构相对一致。

- Sticky：尽量均衡并减少分区移动。

- Cooperative Sticky：增量撤销和转移，减少 Eager Rebalance 全停顿。

Kafka 4.0 起新版 Consumer Rebalance Protocol 已 GA：

- 使用 group.protocol=consumer 开启。

- 分配计算更多在服务端完成。

- 使用完全增量设计，减少全局同步屏障和停顿。

- 心跳和 Session Timeout 由服务端 Group 配置控制。

面试中应区分 Classic、Cooperative 和新 Consumer Protocol，不要统一说“Rebalance 一定让整个 Group 完全停止”。

### 5.6 避免频繁 Rebalance

- 控制单批处理时间，确保不超过 max.poll.interval.ms。

- 使用 max.poll.records 控制单次记录数。

- 耗时任务拆分 Poll 与工作线程，但要按分区管理顺序、暂停/恢复和 Offset 水位。

- 使用静态成员 group.instance.id 减少短暂重启引发的成员抖动。

- 选择 Cooperative 或新版 Consumer Protocol。

- 不在 Rebalance 回调中执行长耗时操作。

### 5.7 Lag 的诊断

Lag 增长不等于“消费者数量不足”。应分层检查：

42. 生产速率是否突然增加。

43. 是否只有少数分区 Lag，判断 Key 倾斜或热点。

44. Consumer 处理耗时、GC、线程池、连接池是否异常。

45. MySQL、ES、HTTP 等下游是否变慢。

46. 是否发生频繁 Rebalance。

47. Fetch 参数或单条消息大小是否异常。

48. 消费能力是否已经达到分区并行上限。

扩容消费者前先确认分区数和瓶颈位置；下游已经饱和时继续增加消费者只会放大故障。
