---
title: 金融支付与 DDD 架构手册
description: 从支付不变量、账务与一致性到系统设计和订阅案例
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 三份金融支付与 DDD 自有资料的主题合并
---

# 金融支付与 DDD 架构手册

> 正确性优先：先定义业务不变量、失败状态和账务事实，再选择中间件、模式与部署拓扑。

## 金融支付主线

1. [金融支付领域基础](./01-domain-foundations.md)
2. [SOLID 在支付系统中的应用](./02-solid.md)
3. [支付架构设计模式](./03-design-patterns.md)
4. [支付领域建模与架构边界](./04-domain-modeling.md)
5. [幂等、并发与分布式一致性](./05-idempotency-consistency.md)
6. [支付状态机与 UNKNOWN](./06-state-machine-unknown.md)
7. [账务、清结算与对账](./07-ledger-reconciliation.md)
8. [领域事件、Outbox、Inbox 与补偿](./08-events-outbox-inbox.md)
9. [支付风险、安全与合规边界](./09-risk-security-compliance.md)
10. [支付容量、可靠性与可观测性](./10-capacity-reliability.md)
11. [支付系统 Java 实现与代码题](./11-java-implementation.md)
12. [支付系统设计案例](./12-system-design-cases.md)
13. [支付架构面试题库与训练计划](./13-interview-question-bank.md)

## DDD 支付订阅案例

从 [限界上下文与整体架构](./subscription-case/01-bounded-contexts.md) 开始，依次查看聚合、ACL、状态机、Outbox、数据模型、续费调度、演进路线和评审追问。

## 资料边界

本专题用于技术架构学习和面试训练，不代替财务、法律、安全或合规审查。所有容量参数、恢复目标和控制项都要结合实际交易规模、渠道契约、辖区和演练证据确定。
