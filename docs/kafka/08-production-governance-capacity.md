---
title: 生产治理与容量规划
description: Topic、Partition、Schema、安全、监控、扩容和多集群
status: reviewing
baseline: Kafka KRaft-oriented source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Kafka P7/P8 面试强化版（canonical）
---

# 生产治理与容量规划

## 第九章：生产工程与治理

### 9.1 Topic 与 Partition 设计

Topic 拆分维度：业务语义、数据敏感级别、SLA、保留期、流量、消费群体和故障隔离。

分区数估算可以从吞吐开始：

**\[text\]
**分区数 \>= max(目标生产吞吐 / 单分区生产能力,
目标消费吞吐 / 单消费者单分区处理能力)

再校验：Broker 数量、Leader 分布、文件句柄、Controller 元数据规模、扩容空间和单 Key 顺序要求。

### 9.2 Schema 治理

- 推荐 Avro、Protobuf 或 JSON Schema 配合 Schema Registry。

- 明确兼容策略：Backward、Forward、Full。

- 新增可选字段通常安全；删除字段、改类型、改变默认值需谨慎。

- 消费者要能忽略未知字段，Producer 不应无治理地改变语义。

- Schema ID、事件版本和业务事件类型应可追踪。

### 9.3 安全

- TLS/SSL：链路加密与证书认证。

- SASL：支持 SCRAM、GSSAPI、OAUTHBEARER 等认证机制。

- ACL：按 Topic、Group、Transactional ID 等资源最小授权。

- Controller、Broker 与客户端网络分区隔离。

- 密钥轮换、审计日志和敏感字段治理。

- 多租户使用 Client Quota 限制生产、消费字节率与请求资源，防止单租户拖垮集群。

### 9.4 核心监控指标

集群：

- Active Controller、Offline Partition。

- Under Replicated Partition、Under Min ISR、ISR Shrink/Expand。

- Broker 磁盘利用率、磁盘 IO、网络、CPU、GC。

- Request Queue、请求延迟、网络处理线程和请求线程空闲率。

- Leader/Partition 分布是否均衡。

Producer：

- Record Send Rate、Error Rate、Retry Rate。

- Request Latency、Record Queue Time、Batch Size、Compression Rate。

- Buffer Available、等待线程和最终投递超时。

Consumer：

- Records Lag Max、消费速率、Fetch Rate。

- Commit Latency/Failure。

- Poll 间隔、Rebalance 次数与分区分配耗时。

- 单分区 Lag 分布，而不是只看 Group 总 Lag。

事务：

- Transaction Abort/Commit Rate。

- Transaction Coordinator 错误和状态加载时间。

- 长事务导致的 LSO 延迟。

### 9.5 扩容与分区重分配

增加 Broker 不会自动均匀搬迁旧数据，需要执行 Partition Reassignment。

生产重分配原则：

- 先评估磁盘、网络和复制流量。

- 设置复制限速，避免迁移压垮在线请求。

- 按批次迁移并监控 ISR、Lag 和磁盘水位。

- 完成后移除限速配置。

- 必要时执行 Preferred Leader Election，使 Leader 分布恢复均衡。

增加分区前评估 Key 顺序、下游状态分区和路由变化；分区通常不能直接缩减。

### 9.6 多集群与容灾

MirrorMaker 2 可用于跨集群复制 Topic、配置和 Consumer Offset Checkpoint，但“有复制”不等于自动无损切换。

容灾设计需明确：

- RPO：允许丢失多少数据。

- RTO：多久完成切换。

- Active-Passive 还是双向复制。

- Topic 命名、Offset 翻译和消费组切换。

- 防止双写冲突与回切数据环路。

- 定期演练，而不是只验证链路连通。
