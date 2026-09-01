---
title: 支付系统设计案例
description: 多渠道支付编排、实时双式账本、对账平台和智能路由
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 金融支付 canonical 第 10～13 章
---

# 支付系统设计案例

## 系统设计案例一：多渠道支付编排平台

### 10.1 题目

设计一个面向多个商户的支付编排平台，支持银行卡、钱包和银行转账；支持支付、授权、请款、撤销、退款；支持多渠道路由、异步回调、渠道降级、账务事件和对账。

### 10.2 第一步：澄清问题

面试开场建议询问：

- 平台只服务内部业务，还是对外部商户开放？
- 峰值 TPS、日交易量和金额规模？
- 是否跨国家、币种和法律实体？
- 是否有授权/请款分离、部分请款和部分退款？
- 哪些支付方式天然异步？
- “支付成功”是授权成功、请款成功还是结算成功？
- 账务和结算是否在本题范围？
- 可用性、延迟、资金差错和成本的优先级？

如果面试官不给数字，可以声明假设并继续。例如：峰值 10 万 TPS、支付写入强一致、查询高于写入 5 倍、交易历史保留多年，但热数据只保留最近若干月。

### 10.3 核心不变量

1.  同一商户幂等键只创建一次业务操作。
2.  一个 Attempt 对应一个稳定渠道请求号。
3.  UNKNOWN 不自动切换渠道。
4.  同一支付累计 Capture/Refund 不超上限。
5.  合法状态迁移和终态保护。
6.  状态变化与 Outbox 同事务。
7.  回调、同步响应和查询可并发但业务效果一次。
8.  所有交易最终可通过查询、回调和对账收敛。

### 10.4 总体架构

多渠道支付编排平台

#### 10.4.1 组件职责

| **组件**                    | **职责**                             |
|-----------------------------|--------------------------------------|
| API Gateway                 | 认证、限流、请求大小、协议版本       |
| Payment Application Service | 幂等、编排、事务边界、聚合调用       |
| Risk Engine                 | 风险决策和规则版本                   |
| Routing Engine              | 硬过滤、评分、路由解释               |
| Gateway Adapter Layer       | 渠道防腐、错误映射、签名认证         |
| Payment DB                  | Intent、Attempt、Refund、Idempotency |
| Callback Inbox              | 验签、去重、原始事件留存             |
| Recovery Scheduler          | 查询 PENDING/UNKNOWN、超时补偿       |
| Outbox/Event Bus            | 可靠发布支付事实                     |
| Ledger/Reconciliation       | 入账、结算和差错收敛                 |

### 10.5 API 设计

#### 10.5.1 创建支付

    POST /v1/payments
    Idempotency-Key: idem-2026-001
    {
      "merchant_order_id": "order-1001",
      "amount": 10500,
      "currency": "CNY",
      "capture_method": "AUTOMATIC",
      "payment_method": {
        "type": "CARD_TOKEN",
        "token": "tok_abc"
      },
      "return_url": "https://merchant.example/return"
    }

响应：

    {
      "payment_id": "pay_01",
      "status": "PROCESSING",
      "amount": 10500,
      "currency": "CNY",
      "next_action": {
        "type": "REDIRECT",
        "url": "https://challenge.example/..."
      }
    }

#### 10.5.2 查询支付

    GET /v1/payments/{payment_id}

#### 10.5.3 创建退款

    POST /v1/payments/{payment_id}/refunds
    Idempotency-Key: refund-idem-001
    {
      "amount": 3000,
      "reason": "CUSTOMER_REQUEST"
    }

### 10.6 数据模型

#### 10.6.1 PaymentIntent

    payment_id
    merchant_id
    merchant_order_id
    amount_minor
    currency
    payment_method_type
    capture_method
    status
    successful_attempt_id
    version
    created_at / updated_at

唯一约束：

    UNIQUE (merchant_id, merchant_order_id)  // 仅当产品语义要求订单唯一

不要用商户订单号替代平台 Payment ID，因为一个订单可能有多次支付意图。

#### 10.6.2 PaymentAttempt

    attempt_id
    payment_id
    provider
    provider_account_id
    provider_request_id
    provider_transaction_id
    status
    outcome
    error_category
    routing_rule_version
    request_sent_at
    completed_at
    version

唯一约束：

    UNIQUE (provider, provider_request_id)
    UNIQUE (provider, provider_transaction_id) WHERE provider_transaction_id IS NOT NULL

#### 10.6.3 Refund

    refund_id
    payment_id
    amount_minor
    currency
    status
    provider_request_id
    provider_refund_id
    idempotency_key
    version

#### 10.6.4 CallbackEvent

    provider
    provider_event_id
    payload_hash
    signature_status
    processing_status
    received_at
    processed_at

### 10.7 主流程

1.  网关认证商户、限流和协议校验。
2.  Payment Service 计算请求指纹并认领幂等键。
3.  创建 PaymentIntent，执行准入和风控。
4.  Routing Engine 先硬过滤、再评分，返回路由解释。
5.  创建 PaymentAttempt 和稳定 `provider_request_id`，提交事务 A。
6.  事务外调用渠道 Adapter。
7.  把渠道响应映射为 APPROVED/DECLINED/PENDING/UNKNOWN。
8.  事务 B 锁定 Attempt，执行合法状态迁移。
9.  更新 PaymentIntent，插入 Outbox，保存幂等响应。
10. PENDING/UNKNOWN 进入回调和恢复查询。
11. Outbox 驱动账务、通知和数据分析。
12. 对账在 T+N 或近实时场景中验证最终一致性。

### 10.8 回调处理

    验签
    -> 按 provider_event_id 去重
    -> 解析并映射统一结果
    -> 定位 Attempt
    -> 锁定/版本检查
    -> 状态机应用
    -> Payment 状态聚合
    -> Outbox
    -> CallbackEvent 标记完成

回调无法定位交易时，不应直接丢弃。进入孤儿事件队列，尝试按渠道交易号、请求号和商户账户关联，并告警。

### 10.9 路由设计

#### 10.9.1 硬过滤

- 商户是否开通；
- 国家、币种、支付方式；
- 卡组织或银行；
- 交易类型能力；
- 单笔/日限额；
- 合规和风险限制；
- 渠道开关和维护窗口。

#### 10.9.2 评分

- 细分维度成功率；
- 成本和费率；
- P95 延迟；
- 实时错误和容量；
- 商户偏好；
- 探索流量和最小份额。

#### 10.9.3 稳定性控制

- 指标窗口平滑；
- 最小样本量；
- 单次调整幅度限制；
- 路由版本和快速回滚；
- Shadow 评估；
- 保护 UNKNOWN 交易不被二次路由。

### 10.10 容量与分片

#### 10.10.1 分片键

常见选择 `merchant_id`，优点是商户查询和限流局部性好；缺点是大商户热点。可对超大商户再按 `hash(payment_id)` 二级分片。

`payment_id` 必须可路由到分片，例如包含分片信息或通过全局路由表查询。不要依赖跨分片事务维护普通流程。

#### 10.10.2 热点与存储

- Intent/Attempt 写入采用主键散列，避免自增尾部热点；
- 幂等表按商户和 key 分片；
- 回调按 provider + event ID 去重；
- 历史交易归档到冷存储，热库保留近期可操作数据；
- 运营检索使用异步索引，不在主交易库做复杂模糊查询。

### 10.11 高可用设计

- 渠道独立连接池和并发舱壁；
- 路由、风控有明确超时和降级政策；
- Outbox 积压不阻塞支付本地提交，但必须告警；
- Recovery 与在线流量隔离；
- 区域故障切换确保每笔 Payment 有唯一主写区域；
- 所有关键人工操作命令化和审计化。

### 10.12 关键监控

    payment_success_rate{merchant, provider, method, country}
    provider_unknown_rate{provider}
    provider_technical_error_rate{provider}
    idempotency_conflict_total
    callback_lag_seconds
    recovery_oldest_age_seconds
    outbox_oldest_unpublished_age_seconds
    refund_reserved_amount
    reconciliation_unexplained_amount

### 10.13 P8 级追问与答案要点

#### 10.13.1 1. 渠道成功后、事务 B 提交前进程宕机怎么办？

Attempt 保持 SENT；稳定渠道请求号已在事务 A 保存。Recovery 按请求号查询渠道或等待回调，重新执行幂等完成事务。禁止重新生成请求号发起新扣款。

#### 10.13.2 2. 同步响应说成功，回调随后说失败怎么办？

先验证渠道事件语义和时间。终态冲突不静默覆盖，记录冲突事件并查询渠道权威接口/对账。可能是撤销、冲正或供应商状态映射错误，需要独立状态表达，而不是简单把 SUCCEEDED 改成 FAILED。

#### 10.13.3 3. 账务服务不可用，支付是否返回成功？

取决于产品和风险策略。常见做法是支付渠道结果和本地 Payment 状态先可靠提交 Outbox，账务异步入账；短时账务不可用不影响用户支付结果。但需设置积压阈值、资金敞口和停止交易的保护线。若业务要求实时余额扣减，则账务/额度预占可能在支付前强依赖。

#### 10.13.4 4. 如何避免一个超级 Payment 服务？

保持领域模块和数据所有权清晰；支付核心只拥有 Intent/Attempt/Refund。路由、账务、对账等通过 Port/事件协作。先模块化，再根据容量和组织边界拆服务，避免同步依赖链无限增长。

#### 10.13.5 5. 如何证明没有重复扣款？

从 API 幂等记录、渠道请求号唯一约束、渠道查询/交易文件、PaymentAttempt 和账务 Journal 多源核对；建立重复候选检测和对账规则。仅看 payment 表无法证明。

## 系统设计案例二：实时双式账本

### 11.1 题目与目标

设计一个支持多币种、商户余额、冻结、手续费、退款、拒付和出款的账务系统。要求高审计性、幂等入账、余额查询和可重建。

### 11.2 先定义边界

账本不负责决定支付是否成功；它接收已经定义清楚的账务命令。它也不直接等同于总账系统，可作为业务子账，再与财务总账对接。

### 11.3 核心模型

    LedgerAccount(account_id, owner, account_type, currency, status)
    JournalTransaction(journal_id, business_type, business_id, state, rule_version)
    Posting(posting_id, journal_id, account_id, side, amount_minor)
    Balance(account_id, currency, debit_total, credit_total, version)
    Reservation(reservation_id, account_id, amount, state, expires_at)

### 11.4 写入流程

1.  验证命令、币种和规则版本。
2.  以 `business_type + business_id` 认领幂等。
3.  解析账务规则，生成完整 Posting 集合。
4.  在内存验证借贷平衡和账户状态。
5.  同一事务插入 Journal、Postings、更新 Balance/Reservation。
6.  插入 Outbox，通知下游账务事实。
7.  重复命令返回原 Journal；内容不一致则拒绝并告警。

### 11.5 表结构示例

    CREATE TABLE ledger_journal (
        journal_id       VARCHAR(64) PRIMARY KEY,
        business_type    VARCHAR(64) NOT NULL,
        business_id      VARCHAR(128) NOT NULL,
        currency         CHAR(3) NOT NULL,
        rule_version     VARCHAR(32) NOT NULL,
        state            VARCHAR(16) NOT NULL,
        created_at       TIMESTAMP NOT NULL,
        UNIQUE (business_type, business_id)
    );

    CREATE TABLE ledger_posting (
        posting_id       VARCHAR(64) PRIMARY KEY,
        journal_id       VARCHAR(64) NOT NULL,
        account_id       VARCHAR(64) NOT NULL,
        side             VARCHAR(8) NOT NULL,
        amount_minor     BIGINT NOT NULL,
        created_at       TIMESTAMP NOT NULL
    );

借贷平衡不能只靠应用层。可在提交前聚合校验，并通过数据库过程/约束审计任务做第二层保护。

### 11.6 查询与重建

- 实时余额读 Balance Projection；
- 对账和审计可按 Posting 重算；
- 定期验证投影与事实分录一致；
- 投影损坏时按分区重建，不修改原 Journal；
- 大规模重建使用快照 + 增量分录。

### 11.7 热点账户

平台汇总账户可能成为热点。方案包括：

- 细分到渠道、币种、法律实体和日期子账户；
- 单账户顺序日志；
- Journal 追加与 Balance 异步投影（若业务允许读延迟）；
- 批量聚合；
- 不把所有商户余额压在一个全局行上。

### 11.8 灾难恢复

- Journal 和 Posting 是核心事实；
- 备份需支持时间点恢复；
- RPO 目标与同步复制策略一致；
- 恢复后先进行分录完整性和平衡校验，再开放写入；
- 对外部业务事件做重放时，依赖业务唯一键防止重复入账。

### 11.9 账本设计追问

#### 11.9.1 余额表与分录不一致怎么办？

暂停受影响账户高风险操作，按 Journal 重算投影，定位首次偏差；修复投影不需要修改历史分录。若 Journal 本身错误，则创建调整/冲正分录并保留审批链。

#### 11.9.2 支付事件顺序乱了怎么办？

账务命令应表达业务事实和前置关系。可以按 Payment 聚合序列校验，或让退款命令引用原 Capture Journal。缺少原交易时进入待处理，不盲目入账。

#### 11.9.3 是否对账本使用最终一致性？

一个 Journal 内必须本地强一致和借贷平衡；账本与支付、银行之间通常最终一致，通过 Outbox、幂等和对账收敛。不要把“最终一致”扩展成单个 Journal 可以暂时不平。

## 系统设计案例三：渠道与银行对账平台

### 12.1 目标

每天或近实时接入多个渠道、银行和内部系统数据，完成自动匹配、差错分类、资金敞口、自动/人工修复和审计。

### 12.2 架构分层

    Source Connector
    -> Raw Landing Zone
    -> Schema Validation / Normalization
    -> Canonical Transaction Store
    -> Match Engine
    -> Exception Workflow
    -> Repair Command / Audit
    -> Reporting and Risk Exposure

### 12.3 数据模型

    ReconciliationBatch
      source, business_date, file_version, checksum, state

    CanonicalRecord
      source_record_id, transaction_id, request_id,
      amount, currency, fee, status, event_time

    MatchGroup
      internal_record_ids, external_record_ids,
      rule_id, confidence, result

    ReconciliationException
      type, amount_exposure, owner, age, resolution_state

### 12.4 批次幂等与重发

唯一键可包含：

    source + business_date + file_type + file_version

同名文件内容不同必须作为异常；渠道明确标记更正版时，保留旧版本并重新计算受影响 Match，而不是覆盖原始文件。

### 12.5 匹配引擎设计

- 规则按版本配置；
- 高置信规则优先；
- 每条记录最多进入一个已确认 MatchGroup；
- 规则运行结果可回放；
- 大批量按业务日期、渠道和币种分区；
- 近似匹配不能直接触发高风险资金动作。

### 12.6 修复方式

- 补写支付状态；
- 触发渠道查询；
- 补发账务命令；
- 创建冲正/调整分录；
- 发起退款或追款；
- 标记渠道责任并生成应收；
- 人工确认并附证据。

修复命令必须自身幂等，并回写关联的差错项和审批记录。

### 12.7 运营视角

P8 方案应包含工作台，而不只是批处理 Job：

- 按金额风险和账龄排序；
- 展示内外记录和匹配证据；
- 权限、审批和批量操作限制；
- SLA、负责人和升级路径；
- 修复结果自动回查；
- 所有人工动作可审计。

## 系统设计案例四：智能支付路由

### 13.1 目标与限制

在满足合规、能力和商户合同的前提下，提高支付成功率、降低成本和延迟，并控制渠道容量与风险。

### 13.2 决策流程

    候选渠道加载
    -> 硬约束过滤
    -> 实时健康过滤
    -> 特征提取
    -> 评分/策略决策
    -> 配额与流量约束
    -> 选择渠道
    -> 记录解释与版本

### 13.3 特征设计

- 商户、国家、币种、支付方式；
- 卡段、发卡行、卡组织；
- 金额区间；
- 渠道过去 5/30 分钟技术健康；
- 细分成功率和样本量；
- 费率、固定费用、汇兑成本；
- P95/P99 延迟；
- 渠道配额和余额；
- 商户合同和偏好。

敏感或受限制特征需要合规评审。模型不能使用无法解释或造成不公平结果的数据。

### 13.4 决策可解释性

每次路由存储：

    candidate providers
    filter reasons
    feature snapshot / feature version
    strategy or model version
    score breakdown
    selected provider
    exploration flag
    fallback reason

这样才能复盘“为什么选了渠道 A”，并做离线回放、A/B 测试和事故回滚。

### 13.5 防震荡与探索

- 指标平滑和置信区间；
- 最小样本阈值；
- 每个渠道最小/最大份额；
- 单次权重变更限制；
- 探索流量与商户白名单；
- 变更自动回滚阈值；
- 渠道恢复后渐进升流。

### 13.6 成功率与成本冲突

不要给出一个永久固定权重。应按商户产品定义目标：

- 高价值交易更重成功率；
- 低毛利场景更重成本；
- 高风险支付先满足风险和合规；
- 可建立多目标约束优化，而不是简单加权；
- 业务指标应看净收益、转化和拒付损失，而不只看授权成功率。
