---
title: JVM 原理与生产排障
description: 从内存、GC 到 CPU、泄漏、直接内存和虚拟线程问题定位
status: reviewing
baseline: candidate-provided project and backend source snapshot
last_verified: 2026-09-04
level: P7/P8
source: 资深 Java / AI Agent 定制面试手册自有资料
---

# JVM 原理与生产排障

## 内存、GC 与诊断

- [JVM 诊断、内存与 GC](./diagnostics-gc.md)

重点掌握运行时数据区、对象分配、GC 算法、收集器选择、日志分析、内存泄漏和直接内存问题。

## 生产故障与排障

- [生产故障定位 Runbook](./production-incident-troubleshooting.md)

不要从“调大堆”或“重启”开始。先定义现象与影响，建立时间线，定位资源与热点，控制风险，再验证根因和长期修复。生产故障涉及 JVM、容器、依赖和业务数据时，优先按 Runbook 建立跨层因果链。

## 关联专题

- [Java 并发与虚拟线程](../java/concurrency-virtual-threads.md)

并发量、线程模型和虚拟线程问题必须与连接池、下游容量、锁竞争和 GC 行为一起分析，不能只从 JVM 参数单点解释。

## 回答框架

面试回答按照“现象与影响—关键指标—定位命令—证据链—止血—根因—长期治理”展开。涉及版本差异时，以实际 JDK、收集器、容器限制和启动参数为准。
