---
title: Producer 可靠性与顺序
description: 分区、批量、压缩、acks、幂等和重试顺序
status: reviewing
baseline: Kafka KRaft-oriented source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Kafka P7/P8 面试强化版（canonical）
---

# Producer 可靠性与顺序

## 第四章：Producer 原理、可靠性与顺序

### 4.1 Producer 客户端链路

send() 的典型链路是：Interceptor → Serializer → Partitioner → RecordAccumulator → Sender → Broker。

send() 默认异步返回 Future。可靠业务应处理 Callback 或 Future 中的异常，不能“调用成功就认为消息成功”。

### 4.2 分区策略

优先级如下：

38. 显式指定 Partition：直接使用指定分区。

39. 有 Key：基于 Key 哈希选择分区，保证相同 Key 在分区数不变时稳定路由。

40. 无 Key：使用 Sticky 分区累积批次，达到批次条件后切换，提高 Batch 利用率。

41. 特殊业务：实现自定义 Partitioner，但要处理热点、扩容兼容和客户端一致升级。

热点分区常见原因：Key 分布倾斜、单大客户、时间戳/常量 Key、自定义路由错误。解决方式包括业务 Key 打散、二级分桶、拆 Topic、独立大客户以及消费端按业务键重新聚合。

### 4.3 批量、延迟与压缩

- batch.size：单分区批次目标大小，不是“攒够才一定发送”的硬门槛。

- linger.ms：允许等待更多记录组成批次，以少量延迟换吞吐。

- buffer.memory：Producer 总缓冲区；耗尽后发送线程可能在 max.block.ms 内阻塞。

- compression.type：常见为 lz4、snappy、gzip、zstd；选型要压测 CPU、压缩率和端到端延迟。

- delivery.timeout.ms：一条记录从发送到成功或最终失败的总时间上限，需与重试、请求超时、linger 等协调。

### 4.4 \`acks\` 的准确含义

| **配置** | **确认条件**                             | **优点**         | **主要风险**                                  |
|----------|------------------------------------------|------------------|-----------------------------------------------|
| acks=0   | 不等待 Broker 响应                       | 最低延迟         | 客户端无法确认失败，可能丢失，重试难以生效    |
| acks=1   | Leader 本地追加后响应                    | 延迟与可靠性折中 | Follower 复制前 Leader 故障可能丢失已确认消息 |
| acks=all | 当前 ISR 满足复制确认，且受最小 ISR 约束 | 最强生产确认     | ISR 不足时拒写，可用性降低，延迟更高          |

推荐生产基线通常是：副本因子 3、acks=all、min.insync.replicas=2、幂等开启。具体仍要按故障容忍、成本和 SLA 压测。

### 4.5 幂等生产者

幂等生产者通过 Producer ID、Producer Epoch 和每分区 Sequence Number 识别重试批次，避免客户端重试在日志中形成重复记录。

关键边界：

- 可同时向多个分区幂等写入，但不同分区之间没有原子性。

- 只保证 Kafka Producer 到 Kafka Broker 的重试去重，不保证下游业务只处理一次。

- 当前客户端通常默认启用幂等，但冲突配置可能导致禁用或启动失败。

- 幂等要求 acks=all、重试开启，并限制单连接未确认请求数量。

### 4.6 重试与顺序

不开幂等时，如果允许多个请求并发在途，第一个批次失败重试而后续批次成功，可能造成重排。开启幂等后，Broker 使用序列号检测重复与乱序。

业务仍需关注：

- 超过 Producer 生命周期或由不同 Producer 重放的业务重复。

- 上游 HTTP 重试导致同一业务事件被再次创建。

- Topic 扩分区导致 Key 路由变化。

因此应在消息中携带稳定 event_id、aggregate_id 和业务版本号，下游以业务幂等兜底。
