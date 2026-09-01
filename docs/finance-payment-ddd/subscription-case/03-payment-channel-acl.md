---
title: 支付渠道防腐层
description: 验签、解析、状态与金额归一、错误翻译和渠道能力抽象
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 两份 DDD 支付订阅系统自有资料的结构合并与 Mermaid 重绘
---

# 支付渠道防腐层

## 防腐职责

1. 验签、解密与来源校验。
2. 渠道报文解析与审计留存。
3. 渠道状态映射为统一的 PaymentStatus。
4. 元、分、cents 和币种精度归一为 Money。
5. 错误码翻译为可重试、待查询、明确失败等领域语义。
6. 提取幂等键、渠道流水并描述渠道能力。

```mermaid
flowchart LR
  DOMAIN["支付领域"] --> PORT["PaymentGatewayPort"]
  ACL["ACL：验签 / 翻译 / 归一"] --> PORT
  A["渠道 A"] --> ACL
  B["渠道 B"] --> ACL
  C["渠道 C"] --> ACL
```

trade_status、result_code、prepay_id、transaction_id、PaymentIntent 等外部字段只能进入适配器或审计记录，不能成为核心聚合的语言。
