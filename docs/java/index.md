---
title: Java 工程与场景题
description: 面向资深后端的并发、虚拟线程、Spring 事务和服务治理专题
status: reviewing
baseline: candidate-provided project and backend source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 资深 Java / AI Agent 定制面试手册自有资料
---

# Java 工程与场景题

## 专题入口

1. [Java 并发与虚拟线程](./concurrency-virtual-threads.md)
2. [JDK 21–25 虚拟线程版本演进](./virtual-threads-jdk21-25.md)
3. [虚拟线程生产架构模式](./virtual-threads-production-patterns.md)
4. [虚拟线程观测、压测与迁移](./virtual-threads-observability-migration.md)
5. [Spring 核心原理与面试手册](../spring/)
6. [Spring 事务与服务治理（兼容入口）](./spring-transactions-service-governance.md)
7. [JVM 诊断与 GC](../jvm/diagnostics-gc.md)
8. [MySQL 事务、锁与索引](../mysql/transactions-locks-indexes.md)
9. [Java 设计模式的生产场景与边界](./design-patterns-production-scenarios.md)

## 学习原则

回答并发题时先区分线程承载能力与下游资源配额；回答事务题时先明确本地事务边界与外部副作用；回答排障题时给出指标、命令、时间线和验证证据。
