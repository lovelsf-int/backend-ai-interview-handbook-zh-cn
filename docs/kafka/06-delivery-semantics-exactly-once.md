---
title: 投递语义与 Exactly-Once
description: 幂等 Producer、事务、read_committed、Streams EOS 与外部数据库边界
status: reviewing
baseline: Kafka KRaft-oriented source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Kafka P7/P8 面试强化版（canonical）
---

# 投递语义与 Exactly-Once

## 第七章：投递语义与 Exactly-Once

### 7.1 三种处理语义

- At-Most-Once：可能丢失，不重复处理。典型做法是处理前提交或失败不重试。

- At-Least-Once：不轻易丢失，但可能重复处理。典型做法是处理成功后提交并允许重试。

- Exactly-Once：在明确边界内，每条输入对最终可观察结果只产生一次效果。

“投递一次”和“处理效果一次”不是一回事。网络重试可能发生多次，但只要最终日志或业务状态只有一次效果，仍可实现效果层面的 Exactly-Once。

### 7.2 幂等生产者解决什么

幂等生产者解决 Producer 重试向 Kafka 写入重复 Record Batch 的问题。Broker 结合 PID、Epoch 和每分区 Sequence Number 判断重复或乱序。

准确边界：

- 一个 Producer 可幂等写多个分区。

- 幂等不提供多个分区的原子性。

- 幂等不把消费 Offset 与输出记录绑定。

- 幂等不保证 MySQL、Redis、ES 等外部副作用只发生一次。

### 7.3 Kafka 事务解决什么

Kafka 事务提供：

- 多 Topic、多 Partition 写入的原子提交或终止。

- transactional.id 对应的 Producer 恢复与旧实例 fencing。

- 消费位点与输出消息原子提交。

- Kafka Streams Exactly-Once 的底层基础。

核心对象：

- Transaction Coordinator：协调事务状态。

- \_\_transaction_state：持久化事务元数据。

- transactional.id：稳定标识一个逻辑 Producer 实例。

- PID / Producer Epoch：识别实例并隔离僵尸 Producer。

- Commit/Abort Marker：写入相关分区，标识事务结果。

终止事务不会像数据库回滚一样立刻物理删除记录。read_committed Consumer 根据事务标记跳过终止事务记录。

### 7.4 Consume-Transform-Produce 的正确 EOS 流程

以下为“一次 poll 的输入由一个事务处理”的成功路径示意；异常处理见下文，不能统一 catch 后 abort。

```text
initTransactions()
循环：
  records = poll()
  保存各分区本批输入起点 batchStartOffsets
  beginTransaction()
  处理本批全部输入，并 send() 输出记录
  sendOffsetsToTransaction(nextOffsets, consumer.groupMetadata())
  commitTransaction()
```

`nextOffsets` 是各分区已完成输入之后的下一消费位置，不能越过尚未处理的记录。

#### 提交失败要区分结果未知、可中止与致命错误

按 Kafka Java Client 4.1 API 口径：

- `commitTransaction()` 等待超时或被中断，并不证明提交失败，Broker 可能已经提交。可在同一 Producer 上重试同一 `commitTransaction()`；若不再重试则关闭 Producer，不能切换成 `abortTransaction()` 或立即重放输入。
- 明确的可中止错误（例如 `sendOffsetsToTransaction()` 抛出 `CommitFailedException`）才走 `abortTransaction()`。中止本身超时/被中断时，只能重试同一中止操作或关闭 Producer，不能在结果未知时继续新事务。
- `ProducerFencedException` 等致命错误应停止使用并关闭该 Producer，不能继续发送或依赖一次 abort 修复；按具体异常和客户端版本恢复。
- 关闭后恢复时，先通过正确的 `transactional.id` 和 `initTransactions()` 完成前一事务的收尾，再依据已提交消费位点恢复，不能把未知提交当作确定失败。

#### 中止后必须恢复消费位置

`poll()` 已推进 Consumer 的本地 position；成功 `abortTransaction()` 不会让它自动回退。若要在同一 Consumer 重放，须将仍归自己所有的相关分区 `seek()` 回 `batchStartOffsets`（或按明确恢复策略回到已提交位点）后再 poll。发生 Rebalance 时按新的 assignment 和已提交位点恢复，不要对已失去的分区继续处理或 seek。

若遗漏回退，下一批可能越过被中止的输入，之后再提交更靠后的 offset，造成业务漏处理。重试同一提交与中止后重新处理，是两条不同路径。

关键点：

- Consumer 设置 enable.auto.commit=false。

- 不再单独调用普通 Offset Commit。

- 输出记录和下一消费位点属于同一事务。

- 读取事务 Topic 的输入和下游 Consumer 均设置 `isolation.level=read_committed`。

- transactional.id 必须在并行实例间唯一且重启后稳定。

### 7.5 \`read_committed\` 与 LSO

read_uncommitted 是默认模式，可读取未提交或最终终止事务的记录。

read_committed 只返回非事务记录和已提交事务记录。若前面存在尚未结束的事务，即使后面某些记录已写入，Consumer 也只能读取到 LSO，因此长事务会增加可见延迟。

### 7.6 Kafka Streams EOS

当前版本使用：

**\[properties\]
**processing.guarantee=exactly_once_v2

Kafka Streams 会协调内部 Producer 事务、State Store Changelog、输出 Topic 和消费位点。生产环境仍应保证事务内部 Topic 的副本与最小 ISR 配置，并监控事务错误、处理延迟和状态恢复。

### 7.7 外部数据库边界

Kafka 事务不能自动把 MySQL、Redis、Elasticsearch 或 HTTP 调用纳入同一原子事务。常见方案：

#### 方案 A：消费端业务幂等

- 消息携带稳定 event_id。

- MySQL 使用唯一索引或 Inbox 表。

- 在同一本地事务中写去重记录和业务状态。

- 处理成功后提交 Kafka Offset。

优点是简单可靠；代价是可能重复到达，但效果只发生一次。

#### 方案 B：Transactional Outbox + CDC

- 业务数据与 Outbox 事件在同一本地数据库事务中提交。

- CDC/Connector 将 Outbox 可靠发布到 Kafka。

- 发布成功后异步清理或归档 Outbox。

解决“数据库提交成功但 Kafka 发送失败”的双写问题。

#### 方案 C：业务状态与 Offset 同库事务

- 将消费进度和业务结果写入同一数据库事务。

- 消费者恢复时依据数据库状态定位和去重。

适合强控制场景，但需要自定义消费进度和分区迁移治理。

面试结论：对外部系统通常追求“至少一次投递 + 幂等效果 + 对账补偿”，而不是宣称 Kafka 事务天然覆盖全链路。

### 7.8 Exactly-Once 常见误区

- 误区：手动提交 Offset 就是 EOS。纠正：通常只是 At-Least-Once。

- 误区：幂等 Producer 只能单分区。纠正：可多分区幂等，但不保证跨分区原子性。

- 误区：事务消息提交前完全不可见。纠正：取决于 Consumer 的隔离级别。

- 误区：EOS 等于零故障、零重复投递。纠正：它关注定义边界内的最终可见效果。

- 误区：EOS 性能固定损失 5%-15%。纠正：开销与事务大小、提交频率、分区数、硬件和负载有关，必须压测。

## 专用 EOS 旧材料的校准结论

另一份 Exactly-Once 专题材料提供了幂等、事务、`read_committed` 和配置示例，但其中部分绝对化说法不进入主干：

- 幂等 Producer 会针对每个分区维护序列号，不应简化成“只能对一个分区去重”。
- 手动提交 Offset 仍然通常是 At-Least-Once，不能单独形成端到端 EOS。
- Kafka 事务适合 Kafka-in/Kafka-out 原子处理；MySQL、Redis、Elasticsearch 等外部副作用仍需业务幂等、Outbox/Inbox 或同库事务边界。
- Kafka Streams 当前配置口径必须按版本核对，旧资料中的 `exactly_once` 仅作为历史说明；主干采用 `exactly_once_v2` 的校准方向。
- 未提供压测条件的固定性能损耗比例不进入主干。

## 版本与来源

本轮定向校准：2026-10-09，仅核对事务异常与消费位置恢复。不同客户端版本应复核各方法的异常契约。

- [Kafka 4.1 KafkaProducer：commitTransaction / abortTransaction](https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/producer/KafkaProducer.html)
- [Kafka 4.1 KafkaConsumer：position / committed / seek](https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html)
