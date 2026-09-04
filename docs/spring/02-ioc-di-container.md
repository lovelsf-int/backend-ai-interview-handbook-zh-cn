---
title: IoC、DI 与容器
description: BeanDefinition、BeanFactory、ApplicationContext、Bean 注册与实例化、依赖解析及容器层次
status: reviewing
baseline: Spring Framework core architecture and Spring Boot application model
last_verified: 2026-09-04
level: P7/P8
source: Spring 官方参考文档、核心源码与资深 Java 面试整理
---

# IoC、DI 与容器

## IoC 与 DI 的关系

IoC 是控制权反转的设计思想：对象的创建、依赖获取和生命周期不再由业务对象主动控制。DI 是 IoC 的主要实现方式：对象声明需要什么，容器在创建对象时解析并注入依赖。

推荐构造器注入，因为依赖显式、可使用 `final`、测试简单，并能在对象创建时保证必要依赖完整。Setter 注入适合可选或可重配置依赖；字段注入隐藏依赖，不利于纯单元测试和不可变设计。

## 面试先区分注册与实例化

“Spring 有哪些方式创建 Bean”有两个回答口径：

1. **开发者如何把 Bean 注册到容器。**例如组件扫描、`@Bean`、`@Import`、XML 和编程式注册。
2. **容器拿到 BeanDefinition 后如何实例化对象。**例如构造器、静态工厂方法、实例工厂方法、`Supplier` 和 `FactoryBean#getObject()`。

高分回答不能只列注解。上层入口最终大多转换为 `BeanDefinition`，再由 `BeanFactory` 完成实例化、属性填充、初始化和代理增强。

## 注册 Bean 的常见方式

### 1. 组件扫描

```java
@Service
public class OrderService {

    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }
}
```

`@Component`、`@Service`、`@Repository` 和 `@Controller` 都可以成为扫描候选。典型链路是：

```text
@ComponentScan
  -> ClassPathBeanDefinitionScanner
  -> 扫描候选类并读取注解元数据
  -> 生成 ScannedGenericBeanDefinition
  -> BeanDefinitionRegistry.registerBeanDefinition
```

适合自己编写的 Controller、Service、Repository、Handler 和 Strategy。扫描范围应由应用边界控制，避免把测试类、内部配置或不应启用的实现意外注册。

### 2. `@Configuration` 与 `@Bean`

```java
@Configuration
public class PaymentConfiguration {

    @Bean
    public PaymentClient paymentClient(PaymentProperties properties) {
        return new PaymentClient(
                properties.baseUrl(),
                properties.apiKey()
        );
    }
}
```

`@Bean` 方法的返回值由容器管理，默认 Bean 名称是方法名。它适合第三方类、复杂构造、按配置创建客户端以及需要显式声明依赖的对象。

面试要说明：`@Bean` 方法先被解析为带有工厂方法信息的 `BeanDefinition`，真正创建对象时会进入工厂方法实例化分支。配置类之间优先通过方法参数表达依赖，不要依赖隐式的方法互调。

### 3. `@Import`

`@Import` 有三类常见用法：

```java
@Configuration
@Import(PaymentConfiguration.class)
public class ApplicationConfiguration {
}
```

- 直接导入普通类或配置类。
- 实现 `ImportSelector`，根据元数据返回需要导入的配置类名称。
- 实现 `ImportBeanDefinitionRegistrar`，直接向注册表写入 BeanDefinition。

框架中的 `@EnableAsync`、`@EnableCaching`、Mapper 扫描和部分 RPC 客户端注册，经常通过 `@Import` 体系引入基础设施。

### 4. XML

```xml
<bean id="orderService"
      class="com.example.order.OrderService">
    <constructor-arg ref="orderRepository"/>
</bean>
```

XML 仍会被解析为 `BeanDefinition`。现代 Spring Boot 项目较少使用，但老系统迁移、基础设施集成和源码面试仍可能涉及。

### 5. `FactoryBean`

`FactoryBean<T>` 是容器中的特殊工厂 Bean，适合创建动态代理或构造过程复杂的产品对象：

```java
@Component("modelClient")
public class ModelClientFactoryBean
        implements FactoryBean<ModelClient> {

    @Override
    public ModelClient getObject() {
        return new ModelClient("deepseek");
    }

    @Override
    public Class<?> getObjectType() {
        return ModelClient.class;
    }

    @Override
    public boolean isSingleton() {
        return true;
    }
}
```

```java
context.getBean("modelClient");   // 获取 ModelClient
context.getBean("&modelClient");  // 获取 FactoryBean 本身
```

必须区分：Spring 先按普通 Bean 流程创建 `FactoryBean`，然后在取产品对象时调用 `getObject()`。它与 `BeanFactory` 不是同一个概念，也不等同于普通静态工厂方法。

### 6. 编程式注册

```java
GenericApplicationContext context = new GenericApplicationContext();

context.registerBean(
        "orderService",
        OrderService.class,
        () -> new OrderService(new OrderRepository())
);

context.refresh();
```

也可以直接构造 `RootBeanDefinition`，调用：

```java
registry.registerBeanDefinition("orderService", definition);
```

适合插件系统、测试夹具、动态租户组件、RPC 代理和 Agent Tool 注册。业务代码不应随意动态改容器；框架层需要明确注册时机、命名冲突和销毁责任。

### 7. `BeanDefinitionRegistryPostProcessor`

```java
public class ToolRegistryPostProcessor
        implements BeanDefinitionRegistryPostProcessor {

    @Override
    public void postProcessBeanDefinitionRegistry(
            BeanDefinitionRegistry registry) {

        RootBeanDefinition definition =
                new RootBeanDefinition(BlockIpTool.class);

        registry.registerBeanDefinition("blockIpTool", definition);
    }

    @Override
    public void postProcessBeanFactory(
            ConfigurableListableBeanFactory beanFactory) {
    }
}
```

它在普通 Bean 创建前继续注册或修改 BeanDefinition，适合批量扫描接口并生成代理。MyBatis Mapper、Feign/RPC 客户端、动态数据源和工具注册器都可能采用类似模式。

### 8. Spring Boot 自动配置

```java
@AutoConfiguration
@ConditionalOnClass(ModelClient.class)
public class ModelAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public ModelClient modelClient() {
        return new ModelClient("default");
    }
}
```

Spring Boot 自动配置并不是新的实例化机制。它本质上是：

```text
导入自动配置候选
  -> 条件评估
  -> 解析配置类和 @Bean
  -> 注册 BeanDefinition
  -> 由 BeanFactory 创建 Bean
```

`@ConditionalOnMissingBean` 表示默认实现可以退让，但是否匹配仍受类型、名称、搜索范围和注册时机影响。

## 注册方式对比

| 方式 | 适合场景 | 核心产物 |
| --- | --- | --- |
| 组件扫描 | 自有业务类 | 扫描得到 BeanDefinition |
| `@Bean` | 第三方类、复杂构造 | 带工厂方法信息的 BeanDefinition |
| `@Import` | 模块启用、框架扩展 | 导入类或动态注册 BeanDefinition |
| XML | 老系统、外部化配置 | XML 解析得到 BeanDefinition |
| `FactoryBean` | 代理和复杂产品对象 | 工厂 Bean 加产品对象 |
| 编程式注册 | 插件、测试、动态组件 | 手工写入 BeanDefinition |
| Registry 后置处理器 | 批量扫描和代理生成 | 容器刷新早期追加定义 |
| Boot 自动配置 | Starter 默认装配 | 条件化 BeanDefinition |

## 底层实例化 Bean 的方式

### 1. 构造器实例化

最常见的方式包括无参构造器和构造器注入。`createBeanInstance()` 会结合显式构造参数、自动装配模式、候选构造器和缓存结果，最终选择合适构造器。

```text
createBeanInstance
  -> determineConstructorsFromBeanPostProcessors
  -> autowireConstructor 或 instantiateBean
  -> ConstructorResolver / InstantiationStrategy
```

### 2. 静态工厂方法

```java
public final class ClientFactory {

    public static PaymentClient create() {
        return new PaymentClient();
    }
}
```

对应 BeanDefinition 会记录工厂方法名，Spring 通过 `instantiateUsingFactoryMethod()` 调用静态方法，而不是直接调用目标类构造器。

### 3. 实例工厂方法

```java
public class ClientFactory {

    public PaymentClient create() {
        return new PaymentClient();
    }
}
```

容器先取得工厂 Bean，再调用它的实例方法创建产品。`@Bean` 方法也属于工厂方法模型，只是工厂对象通常是配置类 Bean。

### 4. `Supplier`

```java
context.registerBean(
        PaymentClient.class,
        () -> new PaymentClient("custom")
);
```

BeanDefinition 可以保存 `instanceSupplier`。创建时走 `obtainFromSupplier()`，适合函数式注册和需要自定义构造逻辑的场景。

### 5. `FactoryBean` 产品对象

`FactoryBean` 本身先经过普通 Bean 生命周期；调用方获取普通 Bean 名称时，容器再走：

```text
getObjectForBeanInstance
  -> getObjectFromFactoryBean
  -> FactoryBean.getObject
  -> 可选的产品对象后置处理与缓存
```

因此它是“工厂 Bean 的创建”和“产品对象的取得”两个阶段，不能与普通构造器实例化混为一谈。

## 从配置到可用 Bean 的统一链路

```text
注解 / 配置类 / XML / Import / 自动配置 / 编程式 API
  -> BeanDefinition
  -> BeanDefinitionRegistry
  -> BeanFactory.getBean
  -> createBean / doCreateBean
  -> createBeanInstance
  -> populateBean
  -> initializeBean
  -> BeanPostProcessor 与可能的 AOP 代理
  -> singletonObjects 或对应 Scope
```

这条链路解释了为什么“注册了 Bean”不等于“已经创建实例”，也解释了为什么同一个对象在初始化后可能被代理对象替换。

## getBean 主链路

```text
AbstractBeanFactory.getBean
  -> doGetBean
  -> 转换 Bean 名称并检查单例缓存
  -> 获取或合并 BeanDefinition
  -> 处理 dependsOn
  -> 按 singleton / prototype / custom scope 创建
  -> 类型转换并返回
```

创建单例时会进入 `DefaultSingletonBeanRegistry.getSingleton`，再调用 `AbstractAutowireCapableBeanFactory.createBean` 与 `doCreateBean`。

## 依赖解析

`DefaultListableBeanFactory.resolveDependency` 是按类型依赖解析的重要入口。候选筛选通常考虑：

1. 类型是否匹配。
2. 是否为 autowire candidate。
3. `@Qualifier` 等限定符。
4. `@Primary`。
5. 参数名或 Bean 名称回退匹配。
6. 优先级与唯一性。

集合、数组、`Map<String, T>` 和 `ObjectProvider<T>` 可以接收多个或延迟解析候选。`ObjectProvider` 适合可选、延迟或流式获取，但不应掩盖架构上的强依赖。

## ApplicationContext 层次

父子容器中，子容器通常可以查找父容器 Bean，父容器不能反向看到子容器。层次结构常见于 Web 容器历史架构或需要隔离模块的场景。重复定义与代理基础设施分布在不同上下文时容易产生“拿到的不是预期 Bean”问题。

## 高频面试题

### Q1. `@Autowired` 如何工作？

容器注册 `AutowiredAnnotationBeanPostProcessor`。它在 Bean 创建期间解析构造器、字段和方法上的注入元数据，再委托 BeanFactory 按类型解析候选并完成注入。注解本身不创建对象。

### Q2. 同一接口有两个实现怎么办？

使用 `@Qualifier` 明确业务语义，或在真正有默认实现时使用 `@Primary`。集合注入适合策略链。不要依赖偶然的类名或扫描顺序。

### Q3. `@Bean` 方法和 `@Component` 有何区别？

`@Component` 让类本身成为扫描候选；`@Bean` 由配置方法显式提供对象，适合第三方类或需要自定义构造过程。两者最终都会形成 BeanDefinition，但来源、控制粒度和实例化路径不同。

### Q4. `FactoryBean` 和 BeanFactory 有何区别？

`BeanFactory` 是容器；`FactoryBean<T>` 是由容器管理的特殊工厂 Bean，普通名称获取的是它生产的对象，使用 `&beanName` 才获取工厂本身。

### Q5. 为什么不建议到处调用 `ApplicationContext.getBean()`？

这会把依赖查找重新带回业务代码，隐藏依赖并增加容器耦合。框架适配层可以受控使用，领域和服务代码应优先显式注入。

### Q6. Spring 创建 Bean 有哪些方式？

先分两个维度回答。注册入口包括组件扫描、`@Bean`、`@Import`、XML、`FactoryBean`、编程式 BeanDefinitionRegistry、`BeanDefinitionRegistryPostProcessor` 和 Spring Boot 自动配置；底层实例化包括构造器、静态工厂方法、实例工厂方法、`Supplier` 以及 `FactoryBean#getObject()`。这些方式最终大多统一到 BeanDefinition 和 BeanFactory 创建流程。

### Q7. 注册 BeanDefinition 后会立即创建对象吗？

不一定。非懒加载 singleton 通常在容器刷新后期预实例化；lazy singleton 首次使用时创建；prototype 通常每次获取时创建；自定义 Scope 由对应 Scope 实现决定。

### Q8. `@Bean` 工厂方法与 `FactoryBean` 有什么区别？

`@Bean` 是配置类上的工厂方法，方法返回值直接成为 Bean；`FactoryBean` 本身先是一个 Bean，普通名称获取的是其 `getObject()` 生产的产品。两者都有工厂语义，但生命周期、查找规则和扩展模型不同。

## 90 秒标准回答

> Spring 创建 Bean 要分注册和实例化两个口径。注册层最常见的是组件扫描和 `@Bean`，框架开发还会用 `@Import`、`ImportSelector`、`ImportBeanDefinitionRegistrar`、XML、`FactoryBean`、编程式 BeanDefinitionRegistry、Registry 后置处理器以及 Boot 自动配置。它们最终大多形成 BeanDefinition 并注册到 BeanFactory。
>
> 实例化层主要有构造器、静态工厂方法、实例工厂方法和 Supplier；`FactoryBean` 则是在工厂 Bean 创建完成后，通过 `getObject()` 再提供产品对象。随后 Spring 还会完成依赖注入、Aware 回调、初始化、BeanPostProcessor 和 AOP 代理。因此注册 BeanDefinition、创建原始实例和最终对外暴露的 Bean，可能是三个不同阶段。

## 生产实践

- 自有业务类优先使用组件扫描，第三方 SDK 和复杂客户端优先使用显式 `@Bean`。
- 框架级动态注册必须处理 Bean 名称、覆盖策略、条件顺序、ClassLoader 和销毁回调。
- 不要为了“高级”而使用 Registry 后置处理器；普通业务装配用构造器注入和配置类更清晰。
- 排查 Bean 冲突时记录 BeanDefinition 来源、Resource、工厂方法和条件评估，而不是只看最终类名。
- 注册动态代理或 `FactoryBean` 产品时，同时验证运行期类型、Advisor、作用域和关闭时资源释放。
- 测试切片与完整上下文的 Bean 集合不同，不能用单元测试通过证明生产装配一定正确。
