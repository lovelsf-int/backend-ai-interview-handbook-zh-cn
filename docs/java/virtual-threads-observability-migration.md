---
title: 虚拟线程观测、压测与迁移
description: JFR、线程转储、调度指标、容量压测、灰度发布与回滚
status: verified
baseline: JDK 21–25 observability model
last_verified: 2026-09-02
level: P7/P8
source: 自有生产实践材料与 Oracle JDK 官方文档
---

# 虚拟线程观测、压测与迁移

本页给出从基线、诊断到灰度发布和回滚的完整方法。先读
[JDK 21–25 虚拟线程版本演进](./virtual-threads-jdk21-25.md) 与
[虚拟线程生产架构模式](./virtual-threads-production-patterns.md)。

## 可观测目标不是“线程有多少”

虚拟线程数量大通常是正常现象。真正要回答的是：任务在 CPU、调度器、业务锁、数据库连接、HTTP 连接、下游配额还是超时重试中等待。

| 层级 | 核心指标 | 解释 |
|---|---|---|
| 业务 | Inflight、吞吐、P50/P95/P99、超时、取消 | 是否满足 SLO |
| 调度器 | Parallelism、Pool Size、Mounted、Queued | Carrier 是否饱和或任务待调度 |
| 舱壁 | 可用许可、等待数/时长、拒绝 | 哪个下游容量不足 |
| 连接池 | Active、Idle、Pending、获取超时 | DB/HTTP 连接是否成为瓶颈 |
| JVM | CPU、Heap、GC、对象分配、native 内存 | 等待任务是否放大资源 |
| 下游 | 延迟、429/5xx、队列、配额 | 是否把压力转嫁给依赖 |

## JFR 事件

Oracle JDK 提供的虚拟线程相关 JFR 事件包括：

- `jdk.VirtualThreadStart` / `jdk.VirtualThreadEnd`：生命周期事件，通常只在专项分析时开启，避免海量短任务产生过多数据；
- `jdk.VirtualThreadPinned`：定位无法 Unmount 的阻塞栈，JDK 21–23 尤其重要；
- `jdk.VirtualThreadSubmitFailed`：调度提交失败。

JDK 24 的 JEP 491 消除了普通 Monitor 导致的 Pinning 后，`Pinned` 下降不代表系统没有锁竞争。必须结合 Trace、锁等待、Queued 和业务 P99 判断。

## 线程转储

面向虚拟线程的文本转储可以使用：

```bash
jcmd <pid> Thread.dump_to_file -format=text /tmp/threads.txt
```

JSON 格式便于工具解析：

```bash
jcmd <pid> Thread.dump_to_file -format=json /tmp/threads.json
```

生产采集前应确认文件路径、磁盘容量、权限与敏感字段。线程转储是时间点证据，需与同一时间窗口的指标和 Trace 对齐。

## JDK 24+ 调度器 MXBean

`jdk.management.VirtualThreadSchedulerMXBean` 自 JDK 24 提供以下观测：

- `getParallelism()`：目标并行度；
- `getPoolSize()`：调度器已启动且未终止的平台线程数；
- `getMountedVirtualThreadCount()`：当前 Mounted 虚拟线程估算；
- `getQueuedVirtualThreadCount()`：等待开始或继续执行的虚拟线程估算。

这些值可能是估算，不能单独作为扩容依据。`setParallelism` 虽可动态调整，但调大 Carrier 只对调度瓶颈有意义；下游容量或全局锁造成的排队不会因此消失。

## 症状—根因矩阵

| 症状 | 候选根因 | 证据 | 首选动作 |
|---|---|---|---|
| Queued 高、CPU 高 | CPU 工作占满 Carrier | CPU Profile、热点栈 | 隔离 CPU 池、降并发 |
| Queued 高、Pinned 高 | JDK 21 锁内 I/O 或 native 阻塞 | JFR Pinning 栈 | 移出锁内 I/O、升级验证 |
| P99 高、Queued 低、DB Pending 高 | 连接池/慢 SQL | 连接等待、执行计划 | 缩短事务、优化 SQL、舱壁 |
| P99 高、锁等待高 | 业务 Contention | JFR/数据库锁图 | 分段、缩小临界区 |
| Heap 上升、GC 增多 | 等待任务保留大对象/ThreadLocal | Heap Histogram、JFR | 有界 Inflight、流式处理 |
| 下游 429 增多 | 并发超过配额 | 舱壁等待、429、QPS | 降低许可、限流、退避 |
| 停机超时 | 入口未摘除或任务不响应取消 | Task 状态、线程转储 | Drain、传播取消、持久化任务 |

## 压测不是把线程数调大

先建立平台线程基线，再切换虚拟线程；每次只改变一个变量。矩阵至少覆盖：

| 维度 | 样本 |
|---|---|
| JDK | 21、目标 JDK 25 |
| 承载模型 | 平台线程池、虚拟线程 |
| 负载 | I/O 80%、混合、CPU 80% |
| 下游延迟 | 正常、P99 放大、超时、429 |
| 数据库 | 正常、连接池饱和、锁冲突 |
| 流量 | 稳态、突发、积压恢复 |
| 故障 | 单下游失败、网络抖动、实例停机 |

每组同时记录吞吐、端到端延迟、错误率、取消成功率、资源利用率与业务正确性。只报告“能创建 100 万线程”没有生产意义。

## 用 Little's Law 校验并发

稳定状态近似：

$$
L = \lambda W
$$

例如 2,000 QPS、平均 300ms，平均 Inflight 约 600。还应以 P95/P99 与突发系数设计入口上限，但上限不能超过下游可持续吞吐。若到达率长期高于处理率，任何线程模型都会无限积压。

## 上线前基线

至少保留 7 天代表性生产指标：

- 按接口和下游拆分的吞吐、P50/P95/P99；
- 平台线程池 Active/Queue/Reject；
- DB/HTTP 连接池 Pending 与获取时长；
- CPU、Heap、GC 暂停、对象分配和 native 内存；
- 超时、429、重试、取消、业务重复和漏处理；
- 优雅停机耗时与未完成任务数。

没有基线就无法证明虚拟线程带来了收益，也无法判断回滚阈值。

## 分阶段迁移

1. **离线验证**：依赖兼容、锁内 I/O、ThreadLocal、事务与取消测试。
2. **影子/压测**：复制代表性流量，不产生外部副作用。
3. **1% 实例**：只承载低风险请求，验证监控与回退开关。
4. **5% → 20% → 50%**：每阶段覆盖一个业务高峰和故障演练。
5. **100%**：仍保留至少一个发布周期的快速回退能力。

流量比例按实例或请求路由选一种，确保会话、消息分区和幂等语义不会被切分破坏。

## Go / No-Go 门禁

| 维度 | Go | No-Go |
|---|---|---|
| 正确性 | 重复、漏处理、状态机与基线一致 | 出现不可解释业务差异 |
| 延迟 | P95/P99 达标且无新长尾 | 只提升均值但 P99 恶化 |
| 下游 | Pending、429、锁等待不恶化 | 压力转嫁到 DB/模型 |
| JVM | Heap/GC/native 内存稳定 | 大量等待任务导致内存爬升 |
| 诊断 | JFR、Dump、Trace 能关联 | 故障时无法回答等待位置 |
| 回滚 | 开关、路由和旧实例已演练 | 回滚依赖重新发版或人工猜测 |

## 自动回滚条件

阈值必须绑定现网 SLO，可按连续窗口触发，例如：

- P99 比基线恶化超过约定比例并持续多个窗口；
- 错误率、下游 429 或连接获取超时突破预算；
- Queued 持续增长且到达率已下降；
- Heap、GC 或 native 内存呈不可恢复增长；
- 业务重复、漏处理或状态异常超过零容忍阈值。

回滚不仅切回平台线程，还要停止新任务、Drain 或取消旧虚拟线程任务，避免两套执行面同时产生副作用。

## 故障演练

- 模型服务 P99 从 2 秒升到 20 秒：验证总 Deadline、舱壁和取消。
- DB 连接池耗尽：验证入口拒绝而不是无限积压。
- JDK 21 锁内阻塞：确认 JFR 能定位 Pinning 栈。
- Kafka Rebalance：确认未完成消息不会越过 Offset。
- Pod 终止：确认摘流、Drain、最大等待和任务接管。
- Trace 后端不可用：确认观测失败不会阻塞主业务。

## 复盘模板

1. 目标和基线是什么？
2. 哪个等待被消除，哪个资源成为新瓶颈？
3. 收益发生在吞吐、排队还是代码复杂度？
4. P99、错误率和业务正确性是否同步改善？
5. 哪个假设被证伪，如何形成自动化门禁？
6. 继续扩量、维持现状还是回滚，证据是什么？

## 官方资料

- [Oracle JDK 25 Virtual Threads](https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html)
- [VirtualThreadSchedulerMXBean](https://docs.oracle.com/en/java/javase/25/docs/api/jdk.management/jdk/management/VirtualThreadSchedulerMXBean.html)
- [OpenJDK JEP 491](https://openjdk.org/jeps/491)
