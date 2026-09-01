---
title: 支付领域建模与架构边界
description: 限界上下文、聚合、值对象、服务边界、API 和事件契约
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 金融支付 canonical 第 5 章
---

# 支付领域建模与架构边界

## 领域建模、DDD 与架构边界

### 5.1 建议的限界上下文

| **上下文**     | **拥有的数据**          | **主要不变量**             |
|----------------|-------------------------|----------------------------|
| Merchant       | 商户、权限、产品配置    | 商户资格和配置版本         |
| Payment        | Intent、Attempt、Refund | 幂等、状态、金额上限       |
| Routing        | 候选渠道、规则、得分    | 选择可解释、规则版本可追踪 |
| Risk           | 风险特征与决策          | 决策版本、证据和审计       |
| Ledger         | 账户、事务、分录        | 借贷平衡、不可变、幂等入账 |
| Settlement     | 批次、应收应付、出款    | 批次完整性、净额计算       |
| Reconciliation | 外部数据、匹配、差错    | 数据不重不漏、处理可审计   |
| Notification   | Webhook、重试、订阅     | 签名、去重、投递策略       |

### 5.2 实体、值对象和聚合

#### 5.2.1 值对象

`Money`、`Currency`、`MerchantId`、`ProviderRequestId`、`IdempotencyKey` 应不可变，并在构造时保护格式和范围。

    public record Money(long minorUnits, Currency currency) {
        public Money {
            Objects.requireNonNull(currency);
        }

        public Money add(Money other) {
            requireSameCurrency(other);
            return new Money(
                Math.addExact(minorUnits, other.minorUnits),
                currency
            );
        }
    }

是否允许负数要看语义。通用 `Money` 可以允许负数；支付请求金额可用 `PositiveMoney` 或命令校验限制。不要为了复用一个类型而隐藏业务含义。

#### 5.2.2 聚合边界

聚合应围绕必须强一致维护的不变量。例如 Payment 聚合需要保证：

- 一次 Attempt 的状态合法；
- 累计请款或退款不超过上限；
- 终态不可随意回退；
- 对同一操作只产生一次领域事件。

不要把商户、支付、账本、结算全部放进一个巨大聚合。跨上下文一致性通过命令、事件、幂等和对账实现。

### 5.3 服务边界的判断标准

按以下顺序判断，而不是先问“要不要微服务”：

1.  数据和不变量是否独立；
2.  发布节奏和责任团队是否不同；
3.  容量、可用性和延迟是否不同；
4.  合规、访问控制和数据保留是否不同；
5.  拆分带来的分布式一致性成本是否可接受。

### 5.4 API 契约原则

- 客户端提供业务幂等键；
- 资源 ID 与商户订单号分离；
- 金额使用整数最小单位或明确 decimal 规则；
- 响应允许 `PROCESSING`；
- 错误区分业务拒绝、请求错误、系统暂时失败和结果未知；
- 查询接口返回当前事实，不承诺事件绝对实时；
- 版本兼容优先使用增加字段，谨慎改变字段含义。

#### 5.4.1 示例 API

    POST /v1/payments
    Idempotency-Key: 8f5a...

    {
      "merchant_order_id": "O20260001",
      "amount": 10000,
      "currency": "CNY",
      "payment_method": { "type": "CARD_TOKEN", "token": "tok_xxx" }
    }
    {
      "payment_id": "pay_xxx",
      "status": "PROCESSING",
      "next_action": {
        "type": "REDIRECT",
        "url": "https://..."
      }
    }

### 5.5 事件契约原则

事件表示已发生事实，名称使用过去式：`PaymentSucceeded`、`RefundFailed`。事件至少包含：

- `event_id`；
- `event_type` 和版本；
- `aggregate_id`；
- `occurred_at`；
- 业务关联 ID；
- 最少必要数据；
- trace / causation / correlation 信息。

避免在事件中复制完整敏感对象。下游需要更多数据时，应通过受控查询接口获得。
