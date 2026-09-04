---
title: Bean 作用域与线程安全
description: singleton、prototype、Web scope、作用域代理、状态设计与 ThreadLocal 风险
status: reviewing
baseline: Spring Framework core architecture and Spring Boot application model
last_verified: 2026-09-04
level: P7/P8
source: Spring 官方参考文档、核心源码与资深 Java 面试整理
---

# Bean 作用域与线程安全

## singleton 的真实含义

Spring singleton 表示同一个 ApplicationContext 中，同一 Bean 名称通常共享一个实例。它不是 JVM 全局单例，也不自动线程安全。是否安全取决于对象是否持有并修改跨请求共享状态。

推荐 Service 设计为无状态：方法变量留在调用栈，依赖对象本身也遵循线程安全契约。不要把当前用户、请求参数、临时集合或可变结果放在 singleton 成员字段。

## 常见作用域

- **singleton**：每容器共享实例，默认作用域。
- **prototype**：每次容器获取时创建新实例，后续完整生命周期通常由使用方负责。
- **request**：每个 HTTP 请求一个实例。
- **session**：每个会话一个实例。
- **application**：ServletContext 范围。
- **websocket**：WebSocket 会话范围。
- **自定义 scope**：需要定义创建、获取、销毁和上下文边界。

## 长生命周期 Bean 注入短生命周期 Bean

singleton 在创建时直接注入 prototype，只会得到当时创建的一个实例，之后不会自动每次刷新。需要按调用获取时可以使用 `ObjectProvider`、查找方法或作用域代理，但应明确性能和生命周期。

作用域代理让 singleton 持有代理，实际调用时再从当前作用域解析目标。若在线程没有对应 request/session 上下文时调用，会失败。

## ThreadLocal

ThreadLocal 适合受控保存线程上下文，但在线程池中必须在 finally 清理，否则后续复用线程可能读到前一请求数据并导致内存保留。上下文跨线程不会自动传递，盲目使用 InheritableThreadLocal 也无法正确覆盖通用线程池复用。

虚拟线程通常生命周期短，可降低复用污染风险，但 ThreadLocal 数量与大对象仍会带来内存成本；上下文传播、取消和资源池限制仍需显式设计。

## 并发安全策略

1. 优先无状态和不可变对象。
2. 必须共享的状态使用线程安全结构或清晰锁边界。
3. 不在 Bean 字段保存请求级对象。
4. 将外部资源并发受限于连接池、信号量或 bulkhead。
5. 对计数和缓存考虑原子性、可见性与复合操作。
6. 用并发测试和生产指标验证，而不是看到 singleton 就下结论。

## 高频面试题

### Q1. singleton Bean 一定线程安全吗？

不一定。scope 只描述实例数量，不提供同步。无状态 Bean 通常可安全共享，含可变成员状态则需额外并发设计。

### Q2. prototype Bean 一定线程安全吗？

也不一定。如果同一个 prototype 实例被多个线程共享，仍会有竞争；其依赖的外部资源也可能不安全。实例创建频率不是线程安全证明。

### Q3. Request scope 能否传入 Async 线程？

不能默认可以。异步线程可能没有原请求上下文，作用域代理解析目标会失败。应在提交任务前提取必要的不可变数据，避免把整个 request 对象传播出去。

### Q4. 为什么不建议在 singleton 中缓存一个可变 HashMap？

HashMap 不是并发容器，复合读写也没有业务原子性。即使替换成 ConcurrentHashMap，还要处理容量、过期、加载风暴和跨实例一致性。

## 项目化回答

> 我们的 Service 保持无状态，请求信息通过参数和显式上下文对象传递。LLM/HTTP 调用并发不由线程数量决定，而通过每下游信号量和连接池限制。MDC 在拦截器入口设置并在 finally 清理；异步任务只复制 traceId、tenantId 等白名单字段，任务结束统一清理。对虚拟线程同样限制数据库和模型并发，避免把廉价线程误当成无限资源。
