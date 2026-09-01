---
title: Kafka 高频面试追问
description: 核心原理、可靠性、性能、事务和容量的速答与配置附录
status: reviewing
baseline: Kafka KRaft-oriented source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Kafka P7/P8 面试强化版（canonical）
---

# Kafka 高频面试追问

## 第十一章：高频面试题速答

### 11.1 Kafka 为什么高吞吐？

批量、压缩、顺序追加、Page Cache、稀疏索引、分区并行、Reactor 网络模型和适用路径的零拷贝共同作用。不能只回答“顺序写”。

### 11.2 为什么 Kafka 用 Pull 而不是 Push？

Pull 让 Consumer 按自身能力控制速率，支持批量和重放；Broker 可通过 Fetch 等待参数避免空轮询。代价是消费者需要自己管理 Poll、Lag 和背压。

### 11.3 为什么分区数不是越多越好？

分区增加并行度，也增加文件句柄、内存元数据、复制流量、Leader 选举、Rebalance、Controller 压力和故障恢复时间。

### 11.4 如何保证顺序？

同一业务 Key 固定分区、分区内串行或 Key 级有序处理、幂等重试、版本校验；扩分区和重试 Topic 会破坏原顺序，需要提前设计。

### 11.5 Kafka 如何保证高可用？

多 Broker、多副本、ISR、Controller Quorum、Leader 选举、跨故障域部署和客户端元数据刷新。高可用与强耐久存在取舍，例如 ISR 不足时拒写。

### 11.6 \`acks=all\` 为什么仍可能失败？

ISR 小于 min.insync.replicas 时 Broker 会拒写；网络超时可能让客户端不知道实际结果；外部业务也可能失败。因此需要幂等、重试上限和业务补偿。

### 11.7 幂等 Producer 与事务的区别？

幂等解决 Producer 重试重复；事务提供跨分区原子性、Producer Fencing，以及输出记录与消费 Offset 原子提交。

### 11.8 手动提交为什么仍会重复？

业务完成到 Offset 提交之间存在故障窗口。重启后会从旧 Offset 重新消费，因此仍需业务幂等。

### 11.9 \`read_committed\` 为什么可能增加延迟？

它只能读取到 LSO。前面存在未完成长事务时，后续记录即使已经写入也暂时不可见。

### 11.10 如何处理消费失败？

先分类错误，再选择有限立即重试、延迟重试、DLQ 或业务拒绝；保留原始位置、事件 ID、错误码和重放审计。

### 11.11 为什么 Kafka 不适合直接做任务队列的所有场景？

Kafka 的并行度受分区约束，失败重试、单消息确认、优先级和任意消费者竞争语义需要额外设计。它擅长事件日志和流，不等于所有传统队列能力都天然最优。

### 11.12 为什么数据库和 Kafka 双写困难？

两个独立系统不存在天然原子提交。数据库成功 Kafka 失败或反过来都会不一致，常用 Outbox + CDC、事务消息思想或幂等补偿解决。

### 11.13 如何设计支付事件链路？

MySQL 保存订单事实；本地事务写订单与 Outbox；CDC 发布 Kafka；下游按 event_id/order_id 幂等消费；失败进入重试/DLQ；通过订单、支付渠道和账户流水对账补偿。

### 11.14 如何估算分区数？

从生产吞吐和消费吞吐分别估算最小分区数，取较大值，再结合 Broker、故障恢复、未来增长和 Key 顺序校验，最后压测。

### 11.15 如何判断 Kafka 性能瓶颈？

分 Producer、网络、Broker 请求线程、磁盘/Page Cache、复制、Consumer 和下游七层看指标；不要只看 CPU 或 Consumer Lag。

### 11.16 Kafka 的“一页纸记忆主线”

**\[text\]
**数据模型：Topic → Partition → Segment → Record Batch → Offset
控制面：KRaft Controller Quorum → Metadata Log → Active Controller
写入：Serialize → Partition → Batch → Leader → ISR → ACK
消费：Group → Assignment → Poll → Process → Commit Offset
可靠性：RF + ISR + minISR + acks + Idempotence + Transaction
性能：Batch + Compression + Sequential Append + Page Cache + Zero Copy
故障：Lag / Hot Partition / Rebalance / ISR Shrink / Disk Full
治理：Schema + ACL + Quota + Monitoring + Retry/DLQ + DR

## 附录 A：推荐配置口径

### A.1 高可靠 Producer 示例

**\[properties\]
**bootstrap.servers=kafka-1:9092,kafka-2:9092,kafka-3:9092
acks=all
enable.idempotence=true
retries=2147483647
delivery.timeout.ms=120000
request.timeout.ms=30000
linger.ms=5
batch.size=65536
compression.type=zstd

这些值只是讨论起点，必须结合消息大小、吞吐、延迟和 Broker 配置压测，不能作为所有系统的固定最佳实践。

### A.2 At-Least-Once Consumer 示例

**\[properties\]
**enable.auto.commit=false
auto.offset.reset=earliest
max.poll.records=500
max.poll.interval.ms=300000

业务处理成功后提交 Offset，并使用业务唯一键保证幂等。

### A.3 Kafka 事务 Producer 关键配置

**\[properties\]
**transactional.id=order-stream-instance-01
acks=all
enable.idempotence=true

事务代码必须包含 initTransactions()、beginTransaction()、sendOffsetsToTransaction()、commitTransaction()，异常时调用 abortTransaction()。

### A.4 Broker/Topic 高可靠讨论基线

**\[properties\]
**default.replication.factor=3
min.insync.replicas=2
unclean.leader.election.enable=false

要同时考虑 Broker 数、故障域、维护窗口和 ISR 不足时的可用性。

## 附录 B：参考资料

- 用户语雀总结：https://www.yuque.com/u12571272/sbdr89/nnipnd6mgeu2her2

- 用户专题文档：Kafka Exactly-Once 精确一次语义完全解析.docx

- Apache Kafka 4.3 文档：https://kafka.apache.org/43/

- Kafka Producer 配置：https://kafka.apache.org/43/generated/producer_config.html

- Kafka Consumer 配置：https://kafka.apache.org/43/generated/consumer_config.html

- Kafka KRaft：https://kafka.apache.org/43/operations/kraft/

- Consumer Rebalance Protocol：https://kafka.apache.org/42/operations/consumer-rebalance-protocol/

- Kafka Streams 配置：https://kafka.apache.org/43/streams/developer-guide/config-streams/

- Kafka 监控：https://kafka.apache.org/43/operations/monitoring/

- Kafka 安全：https://kafka.apache.org/43/security/

- Tiered Storage：https://kafka.apache.org/43/operations/tiered-storage/

**— END —**
