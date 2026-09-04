---
title: Spring Boot 启动与自动配置
description: SpringApplication 启动、条件装配、Starter、配置绑定与自动配置排障
status: reviewing
baseline: Spring Framework core architecture and Spring Boot application model
last_verified: 2026-09-04
level: P7/P8
source: Spring 官方参考文档、核心源码与资深 Java 面试整理
---

# Spring Boot 启动与自动配置

## Boot 与 Framework 的关系

Spring Boot 不替代 Spring Framework。它组织依赖与默认配置，创建并刷新合适的 ApplicationContext，再通过条件化自动配置注册 Framework Bean。核心 IoC、AOP、事务和 MVC 机制仍由 Framework 提供。

## SpringApplication 启动主线

```text
SpringApplication.run
  -> 创建并准备 Bootstrap/Environment
  -> 绑定外部配置与 Profile
  -> 创建 ApplicationContext
  -> 准备 Context 与 BeanDefinition 来源
  -> refresh Context
  -> 执行 Runner
  -> 发布 ready 事件
```

启动监听器和事件贯穿各阶段。排障时要区分“环境准备前失败”“BeanDefinition 注册失败”“Bean 创建失败”和“Runner 执行失败”。

## 自动配置原理

自动配置类通过导入机制进入候选集合，再由条件注解决定是否生效。常见条件包括：

- classpath 是否存在某类。
- 是否已有用户自定义 Bean。
- 配置属性是否开启。
- 是否为 Web 应用或特定资源类型。
- 某个配置类是否生效。

自动配置通常遵循 back-off：用户已提供明确 Bean 时，默认配置退让。但条件可能受 Bean 名称、搜索策略、注册时机影响，所以“我定义了一个类似对象”不代表一定覆盖。

## Starter 的作用

Starter 主要负责依赖聚合与推荐组合，不等同于自动配置。一个完整集成通常包括：

```text
starter 依赖入口
+ autoconfigure 模块
+ 配置属性类
+ 条件化 Bean 注册
+ 元数据与文档
+ 集成测试
```

## 配置绑定

结构化配置优先使用 `@ConfigurationProperties`，集中描述前缀、类型、默认值和校验。`@Value` 适合少量简单值，但大量散落会降低可发现性和测试性。

敏感配置不能打印到日志或无保护端点；配置来源冲突要能追踪最终值来自哪里。环境变量命名、Profile、命令行和配置中心叠加时尤其要做启动诊断。

## `@SpringBootApplication`

它组合了配置声明、自动配置开启和组件扫描语义。扫描边界通常从启动类包向下，因此启动类位置不合理会导致 Bean 未发现或扫描过宽。

## 高频面试题

### Q1. 自动配置是在运行时每次请求动态判断吗？

不是。条件主要在容器构建和 BeanDefinition 注册阶段评估，决定本次应用上下文有哪些配置与 Bean。请求执行时使用的是已经构建好的对象图。

### Q2. 自定义 Bean 为什么没有覆盖默认 Bean？

检查自动配置条件是否按类型、名称或当前上下文搜索，用户 Bean 注册时机是否足够早，以及是否存在多个上下文。用条件评估报告和 Bean 定义来源定位，不要猜。

### Q3. Starter 与自动配置有什么区别？

Starter 是依赖组织；自动配置是条件化注册 Bean 的代码。两者常一起发布，但职责不同。

### Q4. Runner 适合做数据库大批量初始化吗？

Runner 在上下文刷新后执行，但仍影响应用就绪。重任务应具备幂等、锁、超时、失败恢复和独立迁移治理；不能因为“Bean 都好了”就把高风险操作直接塞进去。

### Q5. 如何排查 Boot 启动慢？

按阶段度量：类路径与配置解析、BeanDefinition 数量、单例初始化、数据库迁移、网络初始化和 Runner。结合启动事件、日志、JFR/线程转储和 Bean 初始化指标，不要只看总时长。

## 自定义自动配置设计原则

1. 配置前缀稳定且有校验。
2. 条件清晰、可解释，并允许用户覆盖。
3. Bean 名称与类型不冲突。
4. 不在创建 Bean 时执行不可控远程调用。
5. 暴露健康、指标和脱敏诊断。
6. 用 ApplicationContext 测试覆盖条件成立、不成立和用户覆盖三类场景。
