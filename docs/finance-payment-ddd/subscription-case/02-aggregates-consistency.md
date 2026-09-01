---
title: 订阅聚合与一致性边界
description: Subscription、PaymentOrder、Bill、RefundOrder 的聚合职责与事务边界
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 两份 DDD 支付订阅系统自有资料的结构合并与 Mermaid 重绘
---

# 订阅聚合与一致性边界

## 聚合模型

- Subscription 是订阅生命周期入口，包含周期与变更，使用 Money、Period、PlanSnapshot 等值对象。
- PaymentOrder 表达支付事实与尝试，保证金额、状态和渠道流水的一致性。
- Bill 表达应收、实收与账务状态，不与一次 PaymentAttempt 合并。
- RefundOrder 独立表达退款生命周期和额度约束。

## 一致性规则

一个聚合内部使用本地事务保护不变量；跨聚合通过领域事件和可恢复流程最终收敛。支付成功时先稳定 PaymentOrder 和 Outbox，再驱动 Bill、Subscription、Finance 与 Notification。

把 PaymentOrder 和 Subscription 合成一个聚合会混淆生命周期、并发热点、事务边界和失败补偿，且把外部支付时延带入订阅一致性边界。
