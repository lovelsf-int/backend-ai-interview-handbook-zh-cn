---
title: 金融支付与 DDD 架构手册
description: 从支付不变量、账务与一致性到系统设计和订阅案例
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-04
level: P7/P8
source: 三份金融支付与 DDD 自有资料的主题合并
---

# 金融支付与 DDD 架构手册

> 正确性优先：先定义业务不变量、失败状态和账务事实，再选择中间件、模式与部署拓扑。

## DDD 与设计基础

1. [金融支付领域基础](./01-domain-foundations.md)
2. [SOLID 在支付系统中的应用](./02-solid.md)
3. [支付架构设计模式](./03-design-patterns.md)
4. [支付领域建模与架构边界](./04-domain-modeling.md)

## 一致性、状态机与账务

1. [幂等、并发与分布式一致性](./05-idempotency-consistency.md)
2. [支付状态机与 UNKNOWN](./06-state-machine-unknown.md)
3. [账务、清结算与对账](./07-ledger-reconciliation.md)
4. [领域事件、Outbox、Inbox 与补偿](./08-events-outbox-inbox.md)

## 安全、容量与实现

1. [支付风险、安全与合规边界](./09-risk-security-compliance.md)
2. [支付容量、可靠性与可观测性](./10-capacity-reliability.md)
3. [支付系统 Java 实现与代码题](./11-java-implementation.md)

## 系统设计与题库

1. [支付系统设计案例](./12-system-design-cases.md)
2. [支付架构面试题库与训练计划](./13-interview-question-bank.md)

## DDD 支付订阅案例

1. [限界上下文与整体架构](./subscription-case/01-bounded-contexts.md)
2. [聚合与一致性](./subscription-case/02-aggregates-consistency.md)
3. [支付渠道 ACL](./subscription-case/03-payment-channel-acl.md)
4. [支付状态机](./subscription-case/04-payment-state-machine.md)
5. [Outbox 与 Inbox](./subscription-case/05-outbox-inbox.md)
6. [数据模型](./subscription-case/06-data-model.md)
7. [续费调度](./subscription-case/07-renewal-scheduling.md)
8. [演进路线](./subscription-case/08-evolution-roadmap.md)
9. [评审追问](./subscription-case/09-interview-follow-ups.md)

## 资料边界

本专题用于技术架构学习和面试训练，不代替财务、法律、安全或合规审查。所有容量参数、恢复目标和控制项都要结合实际交易规模、渠道契约、辖区和演练证据确定。
