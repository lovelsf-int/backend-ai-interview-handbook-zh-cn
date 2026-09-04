---
title: IoC、DI 与容器
description: BeanDefinition、BeanFactory、ApplicationContext、依赖解析与容器层次
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

## BeanDefinition 注册来源

```text
@Component 扫描
@Configuration + @Bean
@Import / ImportSelector / ImportBeanDefinitionRegistrar
XML
编程式 BeanDefinitionRegistry
Spring Boot 自动配置导入
```

不同来源最终都要形成 BeanDefinition 并进入注册表。面试回答要从“注解”上升到“统一元数据模型”。

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

`@Component` 让类本身成为扫描候选；`@Bean` 由配置方法显式提供对象，适合第三方类或需要自定义构造过程。轻量配置不应依赖配置方法互调，应通过方法参数声明依赖。

### Q4. `FactoryBean` 和 BeanFactory 有何区别？

`BeanFactory` 是容器；`FactoryBean<T>` 是由容器管理的特殊工厂 Bean，普通名称获取的是它生产的对象，使用 `&beanName` 才获取工厂本身。

### Q5. 为什么不建议到处调用 `ApplicationContext.getBean()`？

这会把依赖查找重新带回业务代码，隐藏依赖并增加容器耦合。框架适配层可以受控使用，领域和服务代码应优先显式注入。

## 生产实践

- 多实现策略使用业务明确的 qualifier，而不是“默认实现”泛滥。
- 大量可选依赖通常意味着模块边界不清，应先检查设计。
- 启动失败时查看条件评估和 Bean 定义来源，定位谁注册、谁覆盖、谁注入。
- 测试切片与完整上下文的 Bean 集合不同，不能用单元测试通过证明生产装配一定正确。
