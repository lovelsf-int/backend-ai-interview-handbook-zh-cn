---
title: 支付架构设计模式
description: 策略、适配器、工厂、命令、责任链、规格、仓储和 CQRS 的取舍
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 金融支付 canonical 第 4 章（状态机与事件专题分流）
---

# 支付架构设计模式

跨支付、Agent 与 RAG 的变化点选择和过度设计边界，见
[Java 设计模式的生产场景与边界](../java/design-patterns-production-scenarios.md)。

## 模式选择地图

| **变化或问题**       | **首选模式**              | **支付示例**               |
|----------------------|---------------------------|----------------------------|
| 多种算法可替换       | Strategy                  | 渠道路由、费率、风控评分   |
| 外部协议不统一       | Adapter / ACL             | 收单行、钱包、银行接口     |
| 对象生命周期行为变化 | State                     | 支付、退款、争议状态机     |
| 将操作封装并可追踪   | Command                   | 支付、退款、冲正、人工修复 |
| 多个校验依次执行     | Chain of Responsibility   | 风控、准入、合规检查       |
| 可组合布尔业务条件   | Specification             | 国家、币种、商户资格       |
| 固定骨架、步骤可替换 | Template Method           | 渠道调用流程               |
| 横切能力叠加         | Decorator / Proxy         | 指标、审计、限流、熔断     |
| 可靠异步解耦         | Domain Event + Outbox     | 支付成功触发账务和通知     |
| 跨服务长事务         | Saga                      | 支付、订单、权益、退款补偿 |
| 持久化隔离           | Repository / Unit of Work | 聚合加载与保存             |
| 读写模型差异大       | CQRS                      | 交易写入与运营查询         |

## Strategy：策略模式

### 4.2.1 适用场景

同一个目标有多个可替换算法，调用方只关心结果。例如：

- 成功率优先路由；
- 成本优先路由；
- 商户定制路由；
- 动态汇率报价；
- 分期费率计算；
- 风险评分组合。

<!-- -->

    public interface RoutingStrategy {
        RoutingDecision route(
            RoutingContext context,
            List<GatewayCandidate> candidates
        );
    }

### 4.2.2 两阶段路由

**硬过滤**：能力、国家、币种、商户配置、合规、渠道开关。

**软评分**：成功率、成本、延迟、容量、近期健康度、商户偏好。

    score =
        w1 * normalizedSuccessRate
      - w2 * normalizedCost
      - w3 * normalizedLatency
      - healthPenalty
      + merchantPreference

### 4.2.3 P8 深挖：实时成功率路由的风险

- 小样本噪声和辛普森悖论；
- 成功率与国家、卡段、支付方式强相关；
- 所有流量涌向当前最优渠道造成震荡；
- 备用渠道没有探索流量，指标会失真；
- 模型决策必须可解释、可回放和可快速回滚；
- 路由结果应记录候选集、硬过滤原因、各项得分和规则版本。

### 4.2.4 不使用 Strategy 的情况

只有一种稳定算法，短期没有变化预期时，一个清晰函数通常比接口层次更好。先发现真实变化，再抽象。

## Adapter 与 Anti-Corruption Layer

### 4.3.1 Adapter 的职责

不是简单做 JSON 映射，而是把渠道世界转换成公司统一领域语言：

- 金额单位和精度；
- 币种和时区；
- 授权、请款、退款能力；
- 状态与错误分类；
- 认证、签名、证书；
- 幂等和渠道请求号；
- 敏感字段脱敏；
- 渠道级指标和追踪。

<!-- -->

    public record GatewayError(
        ErrorCategory category,
        boolean retryable,
        boolean resultUnknown,
        String providerCode,
        String sanitizedMessage
    ) {}

领域层不应直接判断 `HTTP 502` 或 `ERR_10027`，而应判断 `TEMPORARY_UNAVAILABLE`、`BUSINESS_DECLINE` 或 `RESULT_UNKNOWN`。

### 4.3.2 Adapter 与 ACL 的区别

Adapter 通常针对一个接口或供应商；Anti-Corruption Layer 是更完整的边界，可能包含模型转换、状态映射、数据同步和工作流，防止遗留系统或供应商模型污染核心领域。

## Factory 与 Abstract Factory

### 4.4.1 Factory 的合适用途

- 根据商户、地区和凭证创建渠道客户端；
- 创建一组配套对象，例如 Authorize/Refund/Query Adapter；
- 管理证书、连接池和客户端缓存生命周期；
- 隐藏复杂构造和供应商 SDK 细节。

普通无状态服务通常交给 DI 容器，不需要手写工厂。

### 4.4.2 Abstract Factory 场景

同一渠道的一组能力实现必须使用一致配置和版本：

    interface GatewayCapabilityFactory {
        AuthorizationGateway authorization();
        RefundGateway refund();
        PaymentQueryGateway query();
    }

风险是工厂族越来越大。仍需与 ISP 配合，只暴露真正支持的能力。

## Command：命令模式

支付、退款、撤销、冲正和人工修复天然适合命令：

    public record RefundCommand(
        String merchantId,
        String paymentId,
        Money amount,
        String idempotencyKey,
        String reason
    ) {}

Command 的价值：

- 明确意图；
- 携带幂等键和审计上下文；
- 便于排队、重试和权限控制；
- 与 Query 分离，避免“一个接口既读又改”。

不要把 Command 理解为所有方法都要包成对象。它适用于重要、可审计、可重放或异步执行的业务操作。

## Chain of Responsibility：责任链

典型用于：

- 参数与商户准入；
- 风控规则；
- 合规与交易限制；
- 渠道候选过滤；
- 对账匹配阶梯。

结果不应只有 Boolean：

    public enum DecisionAction {
        CONTINUE,
        ALLOW,
        DENY,
        REVIEW,
        CHALLENGE
    }

需要定义短路规则、优先级、超时、降级、规则版本和命中原因。大量动态规则可能需要规则引擎，但规则引擎会增加调试、治理和可观测成本。

## Specification：规格模式

规格用于可组合的业务断言：

    Specification<PaymentContext> eligible =
        currencySupported
            .and(countryAllowed)
            .and(merchantEnabled)
            .and(riskNotBlocked);

适合“是否满足条件”，不适合承载有大量副作用的流程。规格结果最好能返回失败原因，而不是只有 true/false。

## Template Method：模板方法

渠道调用常有共同骨架：

    校验 -> 构造请求 -> 签名 -> 调用 -> 验签 -> 映射结果 -> 记录指标

继承式 Template Method 能复用骨架，但容易形成深继承和脆弱基类。现代 Java 中通常优先使用组合：把签名、调用、映射和监控作为协作者注入，由一个 Pipeline 组织。

## Decorator 与 Proxy

### 4.10.1 Decorator

在不改变核心对象的情况下叠加横切能力：

    MetricsGateway(
      TracingGateway(
        RateLimitedGateway(
          RawProviderGateway
        )
      )
    )

### 4.10.2 Proxy

控制访问或远程调用，例如：

- 渠道客户端代理；
- 缓存代理；
- 权限代理；
- 熔断和超时代理。

P8 需要警惕装饰层过多导致调用链不可见。应统一顺序、错误语义和指标命名，并提供链路追踪。

## Repository 与 Unit of Work

Repository 应围绕聚合语义，而不是暴露任意 SQL：

    interface PaymentRepository {
        Optional<PaymentIntent> find(String paymentId);
        PaymentIntent lock(String paymentId);
        void save(PaymentIntent payment);
    }

Unit of Work 负责在一个本地事务中统一提交聚合、幂等记录和 Outbox。不要让领域对象依赖 ORM Session。

## CQRS 与 Event Sourcing

### 4.14.1 CQRS 适合

- 写模型强调状态和不变量；
- 读模型需要商户、渠道、时间、状态多维查询；
- 运营报表和检索压力远高于写入。

CQRS 不要求分成两个服务，也不要求 Event Sourcing。可以先用同库不同模型，再根据规模异步构建读模型。

### 4.14.2 Event Sourcing 谨慎使用

优点是完整历史和可回放；成本包括事件版本、重放时外部副作用、调试认知、隐私删除和投影一致性。金融审计不等同于必须使用 Event Sourcing。不可变账务分录、状态历史和审计日志往往已经满足需求。
