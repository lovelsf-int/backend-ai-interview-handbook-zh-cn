---
title: Java 工程与场景题
description: 面向资深后端的 JDK 版本演进、并发、IO/NIO、虚拟线程、Spring 事务和服务治理专题
status: reviewing
baseline: candidate-provided project and backend source snapshot
last_verified: 2026-09-04
level: P7/P8
source: 资深 Java / AI Agent 定制面试手册自有资料
---

# Java 工程与场景题

## Java 基础与版本

- [JDK 8–26 版本特性与面试演进](./jdk-version-evolution.md)
- [Java IO、NIO、Reactor 与 Netty 面试手册](./io-nio-netty-interview-guide.md)

## 并发基础

- [Java 并发与虚拟线程总览](./concurrency-virtual-threads.md)
- [synchronized、CAS、AQS 与并发工具](./concurrency-locks-aqs-cas.md)
- [Java 线程池生产实践](./thread-pool-production-guide.md)
- [JMM、volatile 与 ThreadLocal](./jmm-volatile-threadlocal.md)

## 虚拟线程

- [JDK 21–25 虚拟线程版本演进](./virtual-threads-jdk21-25.md)
- [虚拟线程生产架构模式](./virtual-threads-production-patterns.md)
- [虚拟线程观测、压测与迁移](./virtual-threads-observability-migration.md)

## 设计模式与框架

- [Java 设计模式的生产场景与边界](./design-patterns-production-scenarios.md)
- [Spring 核心原理与面试手册](../spring/)
- [Spring 事务与服务治理（兼容入口）](./spring-transactions-service-governance.md)
- [JVM 诊断与 GC](../jvm/diagnostics-gc.md)
- [MySQL 事务、锁与索引](../mysql/transactions-locks-indexes.md)

## JDK 版本复习建议

不要只背 LTS 版本号。面试重点是能讲清几条演进主线：

- 语言：Lambda → Records → Sealed → Pattern Matching；
- 并发：CompletableFuture → Virtual Threads → Scoped Values → Structured Concurrency；
- JVM/GC：Metaspace → G1 → ZGC/Shenandoah → Generational GC → Compact Object Headers / AOT；
- Native：JNI/Unsafe → FFM；
- 可观测性：JFR → Event Streaming → CPU/Method Profiling。

优先背 JDK 8、11、17、21、25，再补 9、22、24、26 的关键变化。

## 学习原则

回答 JDK 版本题时不要只报特性名称，要说明“这个特性解决了什么生产问题、在哪个版本 Preview/Final、项目里是否真正使用”；回答并发题时先区分线程承载能力与下游资源配额；回答 IO 题时先区分阻塞/非阻塞、同步/异步，再串起 Selector、Reactor、Netty 与零拷贝；回答事务题时先明确本地事务边界与外部副作用；回答排障题时给出指标、命令、时间线和验证证据。
