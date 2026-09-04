---
title: Kafka 原理、生产与面试手册
description: 从 KRaft、日志存储到可靠性、Exactly-Once、治理和故障排查
status: reviewing
baseline: Kafka KRaft-oriented source snapshot
last_verified: 2026-09-04
level: P7/P8
source: 三份 Kafka 自有资料的 canonical 合并
---

# Kafka 原理、生产与面试手册

## 核心原理

1. [Kafka 核心模型与 KRaft](./01-core-model-and-kraft.md)
2. [日志存储与高性能基础](./02-log-storage-and-performance.md)
3. [Consumer、Offset 与 Rebalance](./04-consumer-offset-rebalance.md)
4. [副本复制与故障恢复](./05-replication-failure-recovery.md)

## 生产可靠性

1. [Producer 可靠性与顺序](./03-producer-reliability-ordering.md)
2. [投递语义与 Exactly-Once](./06-delivery-semantics-exactly-once.md)
3. [重试、死信与业务一致性](./07-retry-dlq-business-consistency.md)

## 治理与故障排查

1. [生产治理与容量规划](./08-production-governance-capacity.md)
2. [Kafka 生产故障排查](./09-troubleshooting-runbook.md)

## 题库与历史资料

1. [Kafka 高频面试追问](./10-interview-follow-ups.md)
2. [Kafka 3.x 历史材料与迁移说明](./appendix-kafka-3x-legacy.md)

## 回答边界

Kafka 内部事务不能自动覆盖外部数据库副作用；手动提交 Offset 也不等于 Exactly-Once。生产回答必须同时交代投递语义、业务幂等、重试补偿和可观测指标。

## 内容状态

强化版作为 canonical 主干，Kafka 3.x 文档降级为 `legacy`，专用 EOS 文档只合并配置思路和经过纠正的边界。页面在完成官方版本复核前保持 `reviewing`。
