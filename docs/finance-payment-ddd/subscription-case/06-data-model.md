---
title: 订阅支付核心数据模型
description: 订阅、账单、支付、退款、协议、Outbox 与 Inbox 的关键关系
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 两份 DDD 支付订阅系统自有资料的结构合并与 Mermaid 重绘
---

# 订阅支付核心数据模型

## 核心实体关系

```mermaid
erDiagram
  SUBSCRIPTION ||--o{ BILL : generates
  BILL ||--o{ PAYMENT_ORDER : collected_by
  PAYMENT_ORDER ||--o{ PAYMENT_ATTEMPT : retries
  PAYMENT_ORDER ||--o{ REFUND_ORDER : refunds
  SUBSCRIPTION }o--|| PAYMENT_AGREEMENT : renews_with
  PAYMENT_ORDER ||--o{ OUTBOX_EVENT : emits
  INBOX_MESSAGE }o--|| SUBSCRIPTION : applies_to
```

## 建模检查点

- 金额使用带币种与舍入规则的 Money/Decimal，不用浮点数。
- PaymentOrder、Bill 和 Subscription 分别拥有状态与版本字段。
- channelTxnId、幂等键、事件 ID、消费消息 ID 建立适当唯一约束。
- 原始渠道报文进入受控审计存储，敏感字段最小化并设置保留策略。
- 表结构只是聚合持久化方式，不能反向决定不合理的聚合边界。
