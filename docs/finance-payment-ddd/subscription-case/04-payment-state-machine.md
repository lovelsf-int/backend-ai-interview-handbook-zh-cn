---
title: 订阅支付状态机
description: 成功不可回退、重复回调、乱序结果、金额校验与 UNKNOWN 收敛
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 两份 DDD 支付订阅系统自有资料的结构合并与 Mermaid 重绘
---

# 订阅支付状态机

## 状态与不变量

```mermaid
stateDiagram-v2
  [*] --> CREATED
  CREATED --> PROCESSING
  PROCESSING --> SUCCESS
  PROCESSING --> FAILED
  PROCESSING --> UNKNOWN
  UNKNOWN --> SUCCESS: 查询或回调确认
  UNKNOWN --> FAILED: 明确失败
```

- SUCCESS 不因迟到失败通知而回退。
- 同一渠道流水唯一，重复回调幂等。
- 回调先验签，再校验商户、订单、金额、币种和渠道流水。
- 同步返回、查询与回调并发时，通过版本、条件更新和状态优先级裁决。
- UNKNOWN 不能盲目重试扣款，必须由查询、回调、对账和人工补偿收敛。
