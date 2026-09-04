---
title: Spring 核心原理与面试手册
description: 从 IoC、Bean 生命周期、AOP、事务到 MVC、Boot 与生产排障的 P7/P8 面试体系
status: reviewing
baseline: Spring Framework core architecture and Spring Boot application model
last_verified: 2026-09-04
level: P7/P8
source: Spring 官方参考文档、核心源码与资深 Java 面试整理
---

# Spring 核心原理与面试手册

## 核心容器与 Bean

1. [Spring 核心架构](./01-core-architecture.md)
2. [IoC、DI 与容器](./02-ioc-di-container.md)
3. [Bean 生命周期与扩展点](./03-bean-lifecycle-extension-points.md)
4. [依赖注入与循环依赖](./04-dependency-injection-circular-reference.md)

## AOP、事务与 Web

1. [AOP、代理与拦截器链](./05-aop-proxy-interceptor.md)
2. [声明式事务原理](./06-transaction-principles.md)
3. [Spring MVC 请求链路](./07-spring-mvc-request-flow.md)

## Boot 与应用能力

1. [Spring Boot 启动与自动配置](./08-spring-boot-startup-auto-configuration.md)
2. [注解、事件、缓存与异步](./09-annotations-events-cache-async.md)
3. [作用域与线程安全](./10-scope-thread-safety.md)

## 源码与生产排障

1. [核心源码调用链](./11-source-code-flows.md)
2. [生产故障排查](./12-production-troubleshooting.md)

## 分类题库

- [100 道核心面试题](./13-interview-question-bank.md)

## 建议复习顺序

先用核心架构建立全局视图，再沿着“容器启动—Bean 创建—代理增强—事务与 Web”主线学习。源码题不要孤立背方法名，要说明入口、关键扩展点、最终产物和失败边界。最后用分类题库做快速自测，并把答案替换成自己的项目事实。

## P7/P8 答题框架

每道题按“结论—核心对象—调用链—边界—生产实践”回答：先用一句话给结论，再说关键接口和源码入口，然后说明什么场景会失效，最后结合事务一致性、线程池、连接池、可观测与发布治理落地。

## 核心边界

Spring 主要解决对象管理和企业应用基础设施编排，不自动解决分布式一致性、业务幂等和容量治理。代理注解只有在调用经过对应基础设施时才生效；本地事务也不能天然覆盖 Kafka、Elasticsearch、HTTP 等外部副作用。
