---
title: 幂等、并发与分布式一致性
description: 业务幂等、三段式外部调用、并发退款和一致性方案选择
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 金融支付 canonical 第 6 章（事件与 UNKNOWN 专题分流）
---

# 幂等、并发与分布式一致性

## 幂等的业务定义

幂等不是“接口可以重试”这句口号，而是：同一个业务意图被重复提交、并发提交、超时重试或消息重投时，最终只产生一次允许的业务效果，并且重复调用能获得与第一次兼容的响应。

推荐范围：

    merchant_id + operation_type + idempotency_key

同一个 key 还必须绑定请求指纹。相同 key、不同金额或订单应返回冲突，不能默默复用第一次结果。

### 6.1.1 幂等记录模型

    CREATE TABLE idempotency_record (
        merchant_id          VARCHAR(64)  NOT NULL,
        operation_type       VARCHAR(32)  NOT NULL,
        idempotency_key      VARCHAR(128) NOT NULL,
        request_fingerprint  VARCHAR(128) NOT NULL,
        execution_status     VARCHAR(32)  NOT NULL,
        resource_id          VARCHAR(64),
        response_payload     TEXT,
        expires_at           TIMESTAMP,
        created_at           TIMESTAMP    NOT NULL,
        updated_at           TIMESTAMP    NOT NULL,
        UNIQUE (merchant_id, operation_type, idempotency_key)
    );

### 6.1.2 正确处理流程

1.  在数据库中尝试插入幂等记录。
2.  插入成功者成为执行者；冲突者读取已有记录。
3.  比较请求指纹，不同则返回 `IDEMPOTENCY_CONFLICT`。
4.  已完成则返回第一次业务响应。
5.  执行中可返回 `PROCESSING`，或在有限时间内等待结果。
6.  创建稳定的内部操作 ID 和渠道请求号。
7.  业务状态、Outbox 和幂等完成记录在本地事务中一致提交。
8.  崩溃后由恢复任务继续，而不是重新创建一笔交易。

端到端幂等与 UNKNOWN 恢复

## 三层幂等

| **层级** | **防护对象**                 | **典型唯一键**                         |
|----------|------------------------------|----------------------------------------|
| API 幂等 | 客户端重试、双击、网关超时   | merchant + operation + idempotency key |
| 渠道幂等 | 内部重试、进程崩溃、网络重连 | provider + provider request id         |
| 消费幂等 | MQ 重投、消费者重启          | consumer + event id 或业务唯一键       |

只做其中一层无法覆盖端到端风险。例如 API 层防重成功，但每次内部恢复都生成新渠道请求号，仍可能重复扣款。

## 为什么 Redis 锁不够

Redis 锁可以降低并发，但不是最终事实约束：

- 锁可能过期；
- 进程暂停超过租约；
- 网络分区导致锁所有权不确定；
- 锁释放与数据库提交不是原子操作；
- 数据恢复或跨区域时可能绕过锁。

资金不变量应由数据库唯一约束、条件更新和状态机兜底。分布式锁可以作为性能优化，而不是唯一正确性机制。

## 外部调用与本地事务

不建议把慢速渠道调用放进数据库事务：

    @Transactional
    public PaymentResponse pay(PaymentCommand command) {
        repository.save(...);
        GatewayResult result = gateway.authorize(...); // 外部网络调用
        repository.update(...);
        return ...;
    }

问题包括长事务、连接与锁占用，以及“本地事务回滚并不能回滚渠道交易”。

### 6.4.1 推荐的三段式执行

    事务 A：幂等认领、创建 Payment/Attempt、生成稳定渠道请求号
    事务外：调用渠道
    事务 B：锁定聚合、应用结果、写 Outbox、保存幂等响应

### 6.4.2 Java 骨架

    public PaymentResponse authorize(AuthorizeCommand command) {
        ExecutionPlan plan = transactions.execute(
            () -> prepare(command)
        );

        if (plan.alreadyCompleted()) {
            return plan.completedResponse();
        }

        GatewayResult result;
        try {
            result = gatewayRegistry
                .authorization(plan.provider())
                .authorize(plan.request());
        } catch (GatewayBusinessDecline e) {
            result = GatewayResult.declined(e.code());
        } catch (Exception e) {
            // 网络错误不代表交易未执行
            result = GatewayResult.unknown(e.getClass().getSimpleName());
        }

        return transactions.execute(
            () -> complete(plan, result)
        );
    }

## 部分退款并发控制

不变量：

    successful_refund_amount + in_flight_reserved_amount <= captured_amount

两种常见实现：

### 6.7.1 聚合锁

锁定 Payment 或 RefundBalance 记录，在事务内检查并预占额度。简单可靠，但热点支付的并发受限，通常可接受。

### 6.7.2 原子条件更新

    UPDATE payment_refund_balance
    SET reserved_minor = reserved_minor + :amount,
        version = version + 1
    WHERE payment_id = :payment_id
      AND captured_minor - refunded_minor - reserved_minor >= :amount;

更新成功后创建退款；失败表示额度不足或并发竞争。退款终态后把 reserved 转为 refunded，失败则释放预占。

## 一致性方案选择表

| **场景**       | **推荐方案**                | **不推荐**                 |
|----------------|-----------------------------|----------------------------|
| 单库内多个表   | 本地事务 + 约束             | 为简单场景上分布式事务     |
| 业务状态与事件 | Outbox                      | 先提交再裸发 MQ            |
| 跨服务流程     | Saga + 幂等 + 补偿          | 假设全局事务能覆盖外部渠道 |
| 外部支付结果   | 稳定请求号 + 查询/回调/对账 | 超时即失败并换渠道         |
| 消费副作用     | Inbox + 业务唯一键          | 只依赖消费者不重启         |
| 余额或额度竞争 | 聚合锁/原子条件更新         | 先查再改且无条件约束       |
