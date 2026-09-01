---
title: Kafka 核心模型与 KRaft
description: Topic、Partition、顺序性、KRaft 元数据与三类 Leader
status: reviewing
baseline: Kafka KRaft-oriented source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Kafka P7/P8 面试强化版（canonical）
---

# Kafka 核心模型与 KRaft

## 第一章：Kafka 核心模型

### 1.1 一句话定位

Kafka 是一个以分区提交日志为核心的分布式事件流平台，擅长高吞吐持久化、异步解耦、流式处理和历史事件重放。

它适合：

- 业务事件总线、日志与埋点采集、CDC、异步任务、实时计算。

- 需要削峰、解耦、重放、多个消费者独立订阅的链路。

- Kafka-in / Kafka-out 的流式处理和状态计算。

它不适合直接替代：

- 低延迟同步 RPC。

- 需要按任意条件随机查询的数据库。

- 资金账本、库存最终状态等强事务唯一事实源。

- 要求整个 Topic 全局严格有序且同时需要高吞吐的场景。

### 1.2 核心概念

- Producer：向 Topic 写入 Record 的客户端。

- Consumer：从分区拉取 Record 的客户端。

- Broker：存储分区副本并处理 Produce、Fetch 等请求的服务节点。

- Topic：事件的逻辑分类；不是一个单机队列。

- Partition：并行、顺序、复制和存储的基本单位。同一分区内 Offset 单调递增。

- Record：通常由 Key、Value、Timestamp、Headers 等组成。

- Offset：记录在分区内的逻辑位置；不同分区的 Offset 不能直接比较。

- Consumer Group：一组协作消费者；一个分区同一时刻最多分配给组内一个成员。

- Replica：分区副本。Leader 对外服务，Follower 从 Leader 拉取数据。

- Controller：管理集群元数据、Broker 注册、分区状态和 Leader 选举的控制角色。

### 1.3 Kafka 的顺序性

Kafka 只保证单分区内的追加顺序。若同一订单、用户或设备的事件必须有序，应使用稳定业务 Key 让相关记录落入同一分区。

要同时说明三个边界：

18. Topic 增加分区后，Key 到分区的映射可能变化，跨扩容前后无法天然保持完整顺序。

19. 多线程并行处理可能破坏完成顺序，即使拉取顺序正确。

20. 失败重试如果进入独立重试 Topic，也会改变原始时间顺序。

面试结论：严格顺序、吞吐和故障隔离之间存在取舍。真正需要顺序的是业务实体，而不是整个 Topic。

### 1.4 一分钟回答

Kafka 的核心不是“一个大队列”，而是把 Topic 拆成多个分区提交日志。分区提供水平扩展和单分区顺序，副本提供容灾，Consumer Group 提供消费并行度，Offset 提供重放能力。Kafka 用批量、压缩、顺序追加、Page Cache 和高效网络传输获得高吞吐；通过 ISR、acks、幂等生产者和事务提供不同等级的可靠性。它适合事件流和异步解耦，但核心业务最终状态仍应由事务数据库等事实源承载。

## 第二章：KRaft 架构与元数据管理

### 2.1 从 ZooKeeper 到 KRaft

Kafka 3.x 曾同时存在 ZooKeeper 和 KRaft 两套模式。Kafka 4.0 起完全移除 ZooKeeper，因此新面试答案应以 KRaft 为主，ZooKeeper 仅用于解释旧集群迁移历史。

KRaft 的核心变化：

- 集群元数据写入 Kafka 自己的 Metadata Log。

- 多个 Controller 组成 Raft Quorum，其中一个是 Active Controller。

- Broker 从控制平面获取并应用元数据更新。

- 避免 ZooKeeper 元数据与 Controller 内存状态双重管理。

- Controller 可与 Broker 合并部署，但关键生产环境通常分离部署，便于隔离故障和独立扩容。

容错口径：若要容忍 N 个 Controller 同时故障，需要 2N+1 个 Controller。典型生产配置是 3 个 Controller，可容忍 1 个故障。

### 2.2 三类“Leader”不要混淆

- Active Controller：控制平面的领导者，管理元数据变更。

- Partition Leader：数据平面的分区主副本，处理该分区读写。

- Consumer Group Leader：Classic Group 协议下负责客户端侧分配计算的组成员；新版 Consumer Protocol 将更多分配逻辑移到服务端。

面试时不要说“Broker 都是 Controller，Broker 之间选一个 Leader”。KRaft 下应明确 Controller Quorum 与 Broker 数据节点的角色边界。

### 2.3 Produce 写入主流程

21. Producer 通过 bootstrap.servers 连接任一可用 Broker。

22. 客户端获取 Topic、Partition、Leader、Leader Epoch 等元数据。

23. 序列化 Record，根据显式分区、Key 或 Sticky 策略选择分区。

24. Record 进入 RecordAccumulator，按分区组成 Batch。

25. Sender 将批次发送给目标 Partition Leader。

26. Leader 追加本地日志，Follower 通过 Fetch 请求复制。

27. Broker 按 acks 和 ISR 状态返回结果。

28. Producer 根据错误类型决定刷新元数据、重试或失败。

注意：bootstrap.servers 只负责引导，不要求列出所有 Broker；客户端会通过元数据发现集群节点。

### 2.4 Fetch 读取主流程

29. Consumer 加入 Group 并获得分区分配。

30. Consumer 根据元数据找到读取副本，通常是 Leader；配置机架感知副本选择时可从合适副本读取。

31. Consumer 从当前位置发送 Fetch 请求，不是每次都读取已提交 Offset。

32. Broker 根据 Offset 定位 Segment 和稀疏索引，再读取 Record Batch。

33. Consumer 反序列化并交给业务处理。

34. Consumer 按业务语义提交“下一条待消费记录”的 Offset。
