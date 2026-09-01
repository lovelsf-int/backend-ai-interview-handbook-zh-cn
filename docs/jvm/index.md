---
title: JVM 原理与生产排障
description: 从内存、GC 到 CPU、泄漏、直接内存和虚拟线程问题定位
status: reviewing
baseline: candidate-provided project and backend source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 资深 Java / AI Agent 定制面试手册自有资料
---

# JVM 原理与生产排障

## 阅读入口

- [JVM 诊断、内存与 GC](./diagnostics-gc.md)
- [Java 并发与虚拟线程](../java/concurrency-virtual-threads.md)

## 回答框架

不要从“调大堆”或“重启”开始。先定义现象与影响，建立时间线，定位资源与热点，控制风险，再验证根因和长期修复。
