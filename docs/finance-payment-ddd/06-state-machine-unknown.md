---
title: 支付状态机与 UNKNOWN
description: 显式状态转换、同步/回调竞争、未知结果和安全恢复顺序
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 金融支付 canonical 第 4、6、10 章的状态专题
---

# 支付状态机与 UNKNOWN

> 支付超时只说明调用方没有得到确定答案，不能直接等价为渠道失败。UNKNOWN 必须通过查询、回调、对账和人工审计收敛。

## State：状态模式

### 4.5.1 为什么支付系统需要显式状态机

状态机提供：

- 合法迁移；
- 终态保护；
- 并发更新条件；
- 事件产生规则；
- 审计和故障恢复依据。

<!-- -->

    public final class PaymentAttempt {
        private AttemptStatus status;

        public void markApproved(String providerTxnId) {
            requireStatus(SENT, PENDING, UNKNOWN);
            this.status = APPROVED;
            this.providerTransactionId = providerTxnId;
        }

        public void markUnknown() {
            requireStatus(SENT);
            this.status = UNKNOWN;
        }
    }

### 4.5.2 不必机械地“每个状态一个类”

当状态数量有限、行为简单时，聚合中的显式迁移方法和状态表已足够。只有状态行为复杂、分支持续增长时，才值得使用完整 GoF State 对象层次。

### 4.5.3 状态机设计检查表

- 初态、终态和中间态是否清晰；
- 哪些迁移由同步响应、回调、查询和人工操作触发；
- 迟到事件如何处理；
- 同一事件重复到达是否无副作用；
- 状态迁移是否与领域事件在同一事务提交；
- 是否记录迁移前后状态、原因、操作者和版本。

## UNKNOWN：支付系统的分水岭

渠道调用结果至少要分为四类：

| **结果** | **含义**             | **是否可直接换渠道**       |
|----------|----------------------|----------------------------|
| APPROVED | 明确成功             | 否，已完成                 |
| DECLINED | 明确业务拒绝         | 可按业务规则决定是否换渠道 |
| PENDING  | 渠道明确受理并处理中 | 否，等待回调或查询         |
| UNKNOWN  | 不知道请求是否已执行 | 否，必须先恢复原交易       |

超时、连接重置、客户端读超时等情况可能发生在渠道已经处理之后。直接重试或切换渠道会产生双扣。

### 6.5.1 安全恢复顺序

    UNKNOWN
    -> 用同一个 provider_request_id 查询
    -> 收到渠道回调
    -> 定时重查并指数退避
    -> 通过渠道交易文件或结算文件对账
    -> 必要时进入人工差错工作流

当渠道没有查询接口时，需要提高调用前的连接健康判断、使用渠道幂等能力、依赖回调/文件，并为不确定交易保留人工核实路径。

渠道失败后的安全决策

## 同步响应、回调和查询并发

同一 Attempt 可能同时收到：

- 同步成功响应；
- 渠道回调；
- 定时查询结果；
- 对账修复；
- 人工操作。

处理原则：

1.  所有输入先映射为统一领域结果。
2.  锁定聚合或使用版本条件更新。
3.  状态机验证迁移是否合法。
4.  若已到兼容终态，返回幂等成功。
5.  若事件冲突，记录异常，不静默覆盖。
6.  领域事件只在首次有效迁移时产生。

### 6.6.1 乐观锁示例

    UPDATE payment_attempt
    SET status = :new_status,
        provider_txn_id = :provider_txn_id,
        version = version + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE attempt_id = :attempt_id
      AND version = :expected_version
      AND status IN ('SENT', 'PENDING', 'UNKNOWN');

更新行数为 0 时重新读取并判断是重复完成还是冲突，而不是无限重试。

## 主流程

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

## 回调处理

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
