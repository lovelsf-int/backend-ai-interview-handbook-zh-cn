---
title: 支付系统 Java 实现与代码题
description: Money、能力接口、状态机、幂等执行器、路由、回调和 Outbox Relay
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 金融支付 canonical 第 14 章
---

# 支付系统 Java 实现与代码题

## Java 编码与面向对象设计题

### 14.1 面试官如何评分

P8 代码题不一定要求写出最复杂算法，通常观察：

- 领域命名是否准确；
- 不变量是否被对象保护；
- 错误和状态语义是否清晰；
- 并发、幂等和外部失败是否被考虑；
- 接口是否围绕能力和变化轴；
- 是否容易测试和观测；
- 是否避免不必要的框架和模式。

### 14.2 题一：Money 值对象

#### 14.2.1 要求

支持加减、比较、币种校验、溢出保护和明确舍入边界。

    public record Money(long minorUnits, Currency currency)
            implements Comparable<Money> {

        public Money {
            Objects.requireNonNull(currency, "currency");
        }

        public static Money zero(Currency currency) {
            return new Money(0L, currency);
        }

        public Money add(Money other) {
            requireSameCurrency(other);
            return new Money(
                Math.addExact(minorUnits, other.minorUnits),
                currency
            );
        }

        public Money subtract(Money other) {
            requireSameCurrency(other);
            return new Money(
                Math.subtractExact(minorUnits, other.minorUnits),
                currency
            );
        }

        @Override
        public int compareTo(Money other) {
            requireSameCurrency(other);
            return Long.compare(minorUnits, other.minorUnits);
        }

        private void requireSameCurrency(Money other) {
            Objects.requireNonNull(other, "other");
            if (!currency.equals(other.currency)) {
                throw new CurrencyMismatchException(currency, other.currency);
            }
        }
    }

#### 14.2.2 深挖

- 通用 Money 是否允许负数？由具体业务语义决定。
- 零位、两位、三位小数货币如何处理？Currency 元数据统一管理。
- 换汇为何不能只用这个类？需要汇率、精度、来源、时间和舍入上下文。
- 数据库存整数还是 decimal？支付原始金额常用最小单位整数；财务换汇可能用受控 decimal。

#### 14.2.3 必测用例

1.  同币种加减；
2.  不同币种拒绝；
3.  long 溢出；
4.  零金额和负金额边界；
5.  序列化和数据库映射一致。

### 14.3 题二：能力型渠道接口

    public interface Authorizable {
        AuthorizationResult authorize(AuthorizationRequest request);
    }

    public interface Refundable {
        RefundResult refund(RefundRequest request);
    }

    public interface Queryable<T> {
        T queryByRequestId(String providerRequestId);
    }

    public record GatewayCapabilities(
        boolean authorize,
        boolean capture,
        boolean partialCapture,
        boolean refund,
        boolean partialRefund,
        boolean query
    ) {}

#### 14.3.1 设计说明

能力元数据用于路由前过滤；能力接口用于编译期和依赖隔离。两者可以并存。不要让调用方通过 `instanceof` 到处探测能力，应由 Registry 提供结构化查询。

### 14.4 题三：PaymentAttempt 状态机

    public final class PaymentAttempt {
        private final String attemptId;
        private AttemptStatus status;
        private String providerTransactionId;
        private int version;

        public void markSent() {
            transitionTo(AttemptStatus.SENT, AttemptStatus.INITIATED);
        }

        public void markApproved(String providerTransactionId) {
            Objects.requireNonNull(providerTransactionId);
            transitionTo(
                AttemptStatus.APPROVED,
                AttemptStatus.SENT,
                AttemptStatus.PENDING,
                AttemptStatus.UNKNOWN
            );
            this.providerTransactionId = providerTransactionId;
        }

        public void markDeclined(String reason) {
            transitionTo(
                AttemptStatus.DECLINED,
                AttemptStatus.SENT,
                AttemptStatus.PENDING
            );
        }

        public void markUnknown() {
            transitionTo(AttemptStatus.UNKNOWN, AttemptStatus.SENT);
        }

        private void transitionTo(
            AttemptStatus target,
            AttemptStatus... allowedSources
        ) {
            boolean allowed = Arrays.stream(allowedSources)
                .anyMatch(source -> source == status);

            if (!allowed) {
                throw new IllegalStateTransitionException(status, target);
            }
            status = target;
            version++;
        }
    }

#### 14.4.1 讨论点

- `UNKNOWN -> APPROVED` 合法；`APPROVED -> DECLINED` 不应直接合法。
- 重复 APPROVED 是异常还是幂等成功？应用服务可先识别相同终态并返回，不一定让领域对象重复迁移。
- 是否允许人工强制状态？使用独立管理命令、审批和审计，不给普通 Setter。

### 14.5 题四：幂等执行器

    public final class IdempotentExecutor {
        private final IdempotencyRepository repository;
        private final TransactionOperations transactions;

        public <T> T execute(
            IdempotencyScope scope,
            String key,
            String fingerprint,
            Supplier<T> operation,
            Function<T, String> serializer,
            Function<String, T> deserializer
        ) {
            ClaimResult claim = transactions.execute(
                () -> repository.claim(scope, key, fingerprint)
            );

            if (claim.completed()) {
                return deserializer.apply(claim.responsePayload());
            }
            if (!claim.owner()) {
                throw new OperationInProgressException(scope, key);
            }

            // 对外部支付调用，不能把所有逻辑藏在这个通用方法里。
            // 需要稳定 operationId、UNKNOWN 状态和恢复流程。
            T result = operation.get();

            return transactions.execute(() -> {
                repository.complete(scope, key, serializer.apply(result));
                return result;
            });
        }
    }

#### 14.5.1 P8 评价

这个通用执行器适合纯本地或可安全重试操作，但对外部支付仍不完整：`operation.get()` 成功后进程可能在 complete 前宕机。因此支付需要显式 Operation/Attempt 记录和恢复，而不是把所有幂等都抽象成一个黑盒工具。

### 14.6 题五：可解释路由策略

    public final class WeightedRoutingStrategy
            implements RoutingStrategy {

        @Override
        public RoutingDecision route(
            RoutingContext context,
            List<GatewayCandidate> candidates
        ) {
            List<ScoredCandidate> scored = candidates.stream()
                .filter(c -> c.capabilities().supports(context.operation()))
                .filter(c -> c.supports(context.currency(), context.country()))
                .filter(c -> c.health().acceptingTraffic())
                .map(c -> score(context, c))
                .sorted(Comparator.comparingDouble(
                    ScoredCandidate::score
                ).reversed())
                .toList();

            if (scored.isEmpty()) {
                throw new NoEligibleGatewayException(context);
            }

            ScoredCandidate winner = scored.getFirst();
            return new RoutingDecision(
                winner.provider(),
                winner.score(),
                scored,
                context.ruleVersion()
            );
        }
    }

#### 14.6.1 追问

- 评分数据过期怎么办？设置 freshness 和降级规则。
- 并列如何选？稳定哈希或受控随机，避免抖动。
- 如何测试？黄金样例、属性测试、历史回放、Shadow 对比。
- 如何防止模型导致全量事故？份额上限、灰度、自动回滚和人工 Kill Switch。

### 14.7 题六：渠道错误映射

    public final class ProviderErrorMapper {
        public GatewayResult map(
            ProviderResponse response,
            Throwable transportError
        ) {
            if (response != null) {
                return switch (response.code()) {
                    case "APPROVED" -> GatewayResult.approved(
                        response.transactionId()
                    );
                    case "INSUFFICIENT_FUNDS" ->
                        GatewayResult.declined("INSUFFICIENT_FUNDS");
                    case "ACCEPTED" -> GatewayResult.pending();
                    default -> GatewayResult.providerError(response.code());
                };
            }

            if (transportError instanceof ConnectException) {
                return GatewayResult.retryableBeforeSend();
            }

            return GatewayResult.unknown(
                transportError.getClass().getSimpleName()
            );
        }
    }

实际中不能仅凭异常类判断请求是否发送。HTTP 客户端和连接层需要提供更精确的阶段信息，或保守映射为 UNKNOWN。

### 14.8 题七：回调处理器

    public CallbackResponse handle(
        Provider provider,
        Headers headers,
        byte[] rawBody
    ) {
        signatureVerifier.verify(provider, headers, rawBody);
        ProviderEvent event = parser.parse(provider, rawBody);

        return transactions.execute(() -> {
            if (!callbackInbox.tryInsert(
                    provider, event.eventId(), hash(rawBody))) {
                return CallbackResponse.accepted();
            }

            PaymentAttempt attempt = repository.lockByProviderReference(
                provider,
                event.providerRequestId(),
                event.providerTransactionId()
            );

            GatewayResult result = eventMapper.map(event);
            applyIdempotently(attempt, result);
            repository.save(attempt);
            outbox.append(attempt.pullEvents());
            callbackInbox.markProcessed(provider, event.eventId());
            return CallbackResponse.accepted();
        });
    }

#### 14.8.1 必须讨论

- 验签应在解析业务字段前；
- 回调响应尽快，重任务异步；
- Inbox 插入和业务更新在同一事务；
- 无法定位交易的事件进入隔离区；
- 原始 Payload 的保留和敏感数据策略。

### 14.9 题八：Outbox Relay

    public void publishBatch() {
        List<OutboxEvent> events = repository.lockNextBatch(100);

        for (OutboxEvent event : events) {
            try {
                broker.publish(
                    event.topic(),
                    event.aggregateId(),
                    event.payload()
                );
                repository.markPublished(event.id());
            } catch (Exception e) {
                repository.recordFailure(event.id(), sanitize(e));
            }
        }
    }

#### 14.9.1 代码评审

这段代码还要考虑：

- 发布成功、标记前宕机会重复投递；消费者必须幂等；
- 事件锁定方式和多实例并发；
- 失败退避、死信和人工重放；
- 同一聚合事件顺序；
- Payload 版本和大小；
- Relay 自身积压指标。

### 14.10 题九：退款额度预占

    public Refund createRefund(RefundCommand command) {
        return transactions.execute(() -> {
            PaymentRefundBalance balance =
                balanceRepository.lock(command.paymentId());

            balance.reserve(command.amount());
            Refund refund = Refund.create(
                ids.nextRefundId(),
                command.paymentId(),
                command.amount(),
                command.idempotencyKey()
            );

            balanceRepository.save(balance);
            refundRepository.save(refund);
            outbox.append(refund.createdEvent());
            return refund;
        });
    }

退款失败时释放预占；退款成功时把预占转换为已退款金额。所有转换都必须幂等，并处理渠道 UNKNOWN。

### 14.11 题十：契约测试

每个 Gateway Adapter 运行统一测试套件：

    abstract class AuthorizationGatewayContract {
        protected abstract AuthorizationGateway gateway();

        @Test
        void sameProviderRequestIdMustNotCreateTwoCharges() {}

        @Test
        void explicitDeclineMapsToDeclined() {}

        @Test
        void readTimeoutMapsToUnknownUnlessNotSentIsProven() {}

        @Test
        void amountAndCurrencyArePreserved() {}

        @Test
        void sensitiveDataIsNotExposedInErrors() {}
    }

Adapter 还需要供应商沙箱测试、录制回放、签名黄金样例和兼容性验证。契约测试是 OCP/LSP 能真正落地的关键。

### 14.12 代码题自查清单

- 是否使用了业务含义清楚的类型，而不是到处 String/long？
- 不变量是否在对象内部保护？
- 是否区分明确失败和未知？
- 是否存在“先查再改”的并发窗口？
- 是否有数据库唯一约束作为最终防线？
- 外部调用是否占用长事务？
- 状态变化与事件是否原子？
- 日志是否会泄露敏感数据？
- 是否能用 Fake/Stub 做确定性测试？
- 抽象是否真的对应变化轴，而不是为了展示模式？
