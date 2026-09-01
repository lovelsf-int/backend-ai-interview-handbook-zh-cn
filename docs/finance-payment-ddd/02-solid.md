---
title: SOLID 在支付系统中的应用
description: 用职责、契约、能力接口和依赖方向约束支付系统演进
status: reviewing
baseline: finance and payment source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 金融支付 canonical 第 3 章
---

# SOLID 在支付系统中的应用

## SOLID 在金融与支付系统中的深度应用

### 3.1 SRP：单一职责原则

#### 3.1.1 定义

一个模块应该只有一个主要变化原因。SRP 讨论的是**变化轴和责任边界**，不是“一个类只能有一个方法”。

#### 3.1.2 反例：万能 PaymentService

    public final class PaymentService {
        public PaymentResponse pay(PaymentRequest request) {
            // 参数校验
            // 商户权限
            // 风险决策
            // 渠道路由
            // 调用渠道 SDK
            // 更新支付状态
            // 生成账务分录
            // 发布消息
            // 商户通知
            // 审计与对账
            return null;
        }
    }

它同时受到渠道、路由、风控、账务、通知、合规和状态机变化影响。任何一个团队修改都可能破坏主流程。

#### 3.1.3 推荐边界

| **模块**                           | **主要变化原因**           |
|------------------------------------|----------------------------|
| `PaymentIntent` / `PaymentAttempt` | 支付领域状态与不变量变化   |
| `PaymentRouter`                    | 路由规则与渠道健康变化     |
| `RiskDecisionPort`                 | 风控协议和决策变化         |
| `GatewayAdapter`                   | 渠道协议、认证和错误码变化 |
| `LedgerPostingService`             | 会计规则和科目映射变化     |
| `OutboxPublisher`                  | 事件投递机制变化           |
| `ReconciliationService`            | 数据匹配和差错流程变化     |

#### 3.1.4 P8 层面的 SRP

P8 需要同时讨论四种边界：

- **类边界**：代码可维护性。
- **聚合/事务边界**：哪些不变量必须原子维护。
- **服务边界**：数据所有权和独立演进。
- **团队边界**：谁定义契约、谁承担值班和事故责任。

这些边界不必完全相同。账务可以是独立领域，但初期未必必须拆成独立微服务；过早拆服务可能把本地一致性问题变成分布式一致性问题。

#### 3.1.5 追问：Payment、Ledger、Reconciliation 为什么不能一个服务？

优秀回答应包含：

- 三者事实来源和生命周期不同；
- 支付服务强调实时执行和用户体验；
- 账务强调不可变、平衡和审计；
- 对账强调批量接入、匹配与差错工作流；
- 可以先模块化单体，但需要独立数据模型和明确依赖方向；
- 拆服务时以数据所有权、发布节奏、容量和组织边界为依据，而不是为了“微服务化”。

### 3.2 OCP：开闭原则

#### 3.2.1 定义

对扩展开放，对修改关闭。实际含义是：在高频变化点提供稳定扩展协议，而不是给所有代码都加接口。

#### 3.2.2 支付渠道扩展示例

    public interface AuthorizationGateway {
        AuthorizationResult authorize(AuthorizationRequest request);
    }

    public interface RefundGateway {
        RefundResult refund(RefundRequest request);
    }

渠道适配器通过注册表或依赖注入加入：

    public final class GatewayRegistry {
        private final Map<Provider, AuthorizationGateway> authGateways;

        public AuthorizationGateway authorizationGateway(Provider provider) {
            AuthorizationGateway gateway = authGateways.get(provider);
            if (gateway == null) {
                throw new UnsupportedProviderException(provider);
            }
            return gateway;
        }
    }

#### 3.2.3 什么应该稳定，什么应该可扩展

- **稳定核心**：金额、币种、幂等、合法状态迁移、账务平衡。
- **扩展点**：渠道适配器、路由评分、风险规则、费率策略、通知方式。
- **受治理扩展**：账务规则、合规规则。它们可以配置化，但不能由任意插件绕过核心不变量。

#### 3.2.4 OCP 的过度使用

以下信号说明抽象可能过早：

- 永远只有一个实现，却有五层接口和工厂；
- 扩展点没有契约测试，插件可以破坏核心状态；
- 业务逻辑散落在配置、脚本和动态规则中，无法追踪；
- 为了不改旧代码，不断叠加特殊处理，反而失去清晰模型。

**P8 回答方式**

我不会追求“核心代码永远不修改”。真正目标是让新增渠道主要发生在防腐层和注册配置中，同时允许核心领域在业务不变量变化时被有计划地修改、版本化和迁移。

### 3.3 LSP：里氏替换原则

#### 3.3.1 支付系统中的契约不仅是方法签名

子类型可替换父类型，要求统一：

- 前置条件；
- 后置条件；
- 金额和精度；
- 状态语义；
- 错误与超时语义；
- 幂等保证；
- 性能和异步约定。

坏接口：

    interface PaymentGateway {
        AuthorizationResult authorize(...);
        CaptureResult capture(...);
        RefundResult refund(...);
        TokenResult tokenize(...);
    }

某些渠道不支持请款或 Tokenize，只能抛 `UnsupportedOperationException`。这不是“实现不完整”，而是抽象把不兼容能力强行合并了。

#### 3.3.2 能力型接口

    interface Authorizable {
        AuthorizationResult authorize(AuthorizationRequest request);
    }

    interface Capturable {
        CaptureResult capture(CaptureRequest request);
    }

    interface Refundable {
        RefundResult refund(RefundRequest request);
    }

    interface Queryable {
        QueryResult query(QueryRequest request);
    }

#### 3.3.3 统一结果语义

    public enum GatewayOutcome {
        APPROVED,
        DECLINED,
        PENDING,
        UNKNOWN
    }

- `DECLINED`：明确业务失败。
- `PENDING`：渠道明确受理，仍在处理中。
- `UNKNOWN`：不知道请求是否执行，不能盲目重试或切换渠道。

#### 3.3.4 LSP 高频追问

**问：渠道 A 的 SUCCESS 表示已授权，渠道 B 的 SUCCESS 表示已受理，能否实现同一接口？**

答：可以复用传输层接口，但不能把两个结果都映射成同一领域终态。Adapter 必须把供应商状态转换为统一领域语义，例如 APPROVED 与 PENDING；否则调用方会错误地触发发货、记账或通知，违反后置条件。

### 3.4 ISP：接口隔离原则

#### 3.4.1 为什么大接口危险

    interface UniversalPaymentGateway {
        authorize();
        capture();
        voidAuthorization();
        refund();
        tokenize();
        query();
        dispute();
        payout();
    }

银行卡、钱包、银行转账和出款的能力模型差异很大。客户端只应依赖自身需要的最小接口。

#### 3.4.2 能力过滤先于评分

路由流程推荐分两层：

1.  通过能力接口和元数据进行硬过滤：币种、国家、支付方式、请款、退款、商户账户、风险限制。
2.  对剩余候选渠道按成功率、成本、延迟、容量和商户偏好评分。

先选择渠道、再在执行时抛“不支持”会把设计错误暴露给线上交易。

### 3.5 DIP：依赖倒置原则

#### 3.5.1 领域层定义 Port

    public interface AuthorizationGateway {
        AuthorizationResult authorize(AuthorizationRequest request);
    }

    public interface PaymentRepository {
        PaymentIntent lock(String paymentId);
        void save(PaymentIntent payment);
    }

    public interface Clock {
        Instant now();
    }

基础设施层实现渠道 SDK、数据库和消息系统的 Adapter。核心应用服务只依赖稳定领域协议。

#### 3.5.2 DIP 的价值不只是测试

- 隔离供应商 SDK 升级；
- 统一错误、金额和状态语义；
- 支持模拟渠道、影子流量和故障注入；
- 允许渠道团队与支付核心团队独立发布；
- 明确接口所有者和契约责任。

#### 3.5.3 何时不要为了 DIP 增加空洞接口

如果一个类是纯领域值对象、不会被替换，也没有外部依赖，例如 `Money`，无需为它再定义 `MoneyInterface`。依赖倒置针对的是**高层策略不应依赖低层易变细节**，不是所有类都必须有接口。

### 3.6 SOLID 综合面试题

1.  一个类有十个方法是否必然违反 SRP？为什么？
2.  支付渠道 Switch 什么时候可以接受，什么时候必须重构？
3.  如何通过契约测试验证 LSP，而不是只看编译通过？
4.  能力型接口会不会导致接口过多？如何治理？
5.  领域 Port 应该由调用方还是实现方拥有？
6.  服务拆分是否等同于 SRP？
7.  开闭原则和“拒绝修改旧代码”有什么区别？
8.  如何避免策略插件绕过资金不变量？
9.  新增一种支付方式时，哪些地方应扩展，哪些地方必须评审修改？
10. 如何向团队解释“抽象的成本”？
