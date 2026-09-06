---
title: P7/P8 面试冲刺与能力缺口地图
description: 根据现有手册覆盖度和真实面试复盘生成的优先级、七天冲刺路线与上场检查单
status: verified
baseline: 2026-09-06 repository coverage audit and interview reviews
last_verified: 2026-09-06
level: P7/P8
source: 本站内容覆盖度审计、真实面试复盘与正式模拟面试复盘
---

# P7/P8 面试冲刺与能力缺口地图

> 当前最优策略不是继续平均扩充题库，而是先补 Java/JVM/MySQL 基础表达，再把已经较强的 ES、RAG、Agent、Kafka 和支付能力练成稳定的项目主线。

## 当前能力地图

| 领域 | 当前覆盖 | 面试判断 | 下一步动作 |
|---|---|---|---|
| Elasticsearch / SOC | 原理、写入、查询、分片、容量、故障、压力面较完整 | 强项，但项目数字必须统一口径 | 练 3 分钟主线和三轮容量追问 |
| RAG / Agent | RAG、Tool、MCP、规划恢复、评估、安全较完整 | 强项，注意从概念收敛到指标和状态机 | 固定检索链路、失败分类和权限边界 |
| Kafka / Redis | 原理、可靠性、重试、集群和排障已成体系 | 可支撑资深面试 | 强化部分成功、顺序、DLQ 和业务一致性 |
| Spring | 已有独立核心模块和 100 道题库 | 内容够用，表达仍需高频复述 | 优先练 Bean、AOP、事务失效和循环依赖 |
| Java 基础 | 并发、IO、虚拟线程较强，集合和泛型原先偏薄 | P0 短板 | 先补集合选型、HashMap、泛型擦除 |
| JVM | 生产排障有内容，类加载和对象生命周期原先偏薄 | P0 短板 | 串起加载、链接、初始化、分配、回收 |
| MySQL | 事务、MVCC、索引、锁已覆盖，变更治理与全局性能归因偏薄 | P0 短板 | 练执行计划漂移、资源瓶颈和 Online DDL |
| 分布式系统 / 网络 / Linux | 分散在案例和故障手册中，尚未形成独立专题 | P1 缺口 | 后续补 RPC、注册发现、限流、网络与 OS |
| 算法与手写代码 | 尚无独立模块 | P1 缺口 | 单独训练 DP、链表、树、滑窗和并发手写 |

## P0：上场前必须补齐

### Java 基础表达

- [集合、Map 与泛型高频面试](../java/collections-generics-interview-guide.md)
- [锁、CAS、AQS 与同步器](../java/concurrency-locks-aqs-cas.md)
- [JMM、volatile 与 ThreadLocal](../java/jmm-volatile-threadlocal.md)
- [Spring 核心原理与面试手册](../spring/)

达标标准：不依赖提示，90 秒说清 `HashMap`、`ConcurrentHashMap`、`equals/hashCode`、泛型擦除、`volatile` 与 `synchronized` 的边界。

### JVM 原理与排障

- [类加载、对象生命周期与内存边界](../jvm/class-loading-object-lifecycle.md)
- [JVM 诊断、内存与 GC](../jvm/diagnostics-gc.md)
- [生产故障定位 Runbook](../jvm/production-incident-troubleshooting.md)

达标标准：从现象出发给出 Metrics → Trace → Logs/JFR/Dump 的证据链，并能解释“类已加载”和“类已初始化”为什么不是一回事。

### MySQL 原理与生产治理

- [写入、MVCC 与事务一致性](../mysql/innodb-write-mvcc-transactions.md)
- [索引、执行计划、分页与复制](../mysql/index-explain-pagination-replication.md)
- [锁、死锁与生产排障](../mysql/locks-deadlocks-production-runbook.md)
- [性能归因、Online DDL 与发布治理](../mysql/performance-schema-change-governance.md)

达标标准：面对“测试环境快、生产慢”，先按 SQL、锁、资源、连接、复制和变更建立故障树，不把“走索引”当作性能结论。

## P1：项目连续追问

优先练习 [P7/P8 架构决策实战](../system-design/p7-p8-architecture-decision-workshop.md)：八道场景题，包含两种回答深度、容量计算、失败恢复和跨团队治理。

### SOC Agent 主线

固定顺序：业务问题 → Kafka 接入与压缩 → 统一事件模型 → 规则预处理 → 双域 RAG → 模型研判 → Planner/Executor → Tool 权限 → 人工闭环。

推荐复习：

- [SOC AI Agent 项目深挖](../system-design/soc-agent.md)
- [RAG 与企业知识工程](../ai-agent/05-rag-knowledge-engineering.md)
- [规划、执行与恢复](../ai-agent/06-planning-execution-recovery.md)
- [SOC 容量规划](../elasticsearch/17-soc-event-alert-capacity.md)
- [SOC 压力面](../elasticsearch/18-soc-pressure-interview.md)

### 海外支付与跨区容灾

固定顺序：业务不变量 → 状态机 → 幂等键 → Outbox/Inbox → 回调 UNKNOWN → 对账补偿 → 单主与 Fencing → 故障切换和回切。

推荐复习：

- [海外游戏支付](../system-design/overseas-payment.md)
- [全球订阅与跨区容灾](../system-design/global-subscription.md)
- [状态机与 UNKNOWN](../finance-payment-ddd/06-state-machine-unknown.md)
- [账务与对账](../finance-payment-ddd/07-ledger-reconciliation.md)

## 历次复盘统一入口

| 时间 | 主题 | 暴露的主要问题 |
|---|---|---|
| 2026-09-03 | [真实面试完整复盘](./real-interview-review-2026-09-03.md) | Spring、MySQL、并发和线上排障 |
| 2026-09-04 | [AI Agent 平台治理复盘](../ai-agent/13-mock-interview-review-2026-09-04.md) | 成本归因、多租户隔离、限流和恢复 |
| 2026-09-04 | [Elasticsearch 正式面试复盘](../elasticsearch/14-mock-interview-review-2026-09-04.md) | 分片、Bulk 部分成功、Offset 推进和业务一致性 |
| 2026-09-04 | [虚拟线程正式面试复盘](../java/virtual-thread-mock-interview-review-2026-09-04.md) | 下游容量、并发门禁、Pinning 和迁移验证 |

后续每一轮复盘都应至少包含：原回答、问题诊断、可口述标准答案、简历事实校验、待补数据和下一轮训练计划；专题知识继续回填到对应模块，本页只维护优先级和入口。

## 七天冲刺安排

| 天 | 主任务 | 必须输出 |
|---|---|---|
| D1 | Java 集合、泛型、JMM、锁 | 10 道题，每题 90 秒录音 |
| D2 | Spring IoC、Bean、AOP、事务 | 一张调用链图 + 20 道快问快答 |
| D3 | JVM 类加载、GC、线上排障 | 两个故障案例的证据链 |
| D4 | MySQL 事务、索引、锁、DDL | 三套慢 SQL / 锁等待推演 |
| D5 | Kafka、Redis、分布式一致性 | Offset、DLQ、Outbox、Fencing 对比 |
| D6 | SOC Agent、RAG、ES | 3 分钟项目介绍 + 三轮压力追问 |
| D7 | 支付双活、行为面、综合压力面 | 60 分钟完整模拟 + 复盘回填 |

## 面试回答统一模板

每道技术题先控制在四段：

1. **结论：**一句话回答问题，不先铺背景。
2. **关键机制：**只讲最相关的三个点。
3. **项目落地：**说明使用条件、规模和个人职责。
4. **异常与取舍：**补失败路径、指标和回退。

项目数字必须分成三类：已核验事实、按现有数据推导的估算、尚待确认的口径。没有证据时给计算方法，不编造精确值。

## 上场前十分钟检查

- 能否在 3 分钟内讲完自我介绍和代表项目？
- SOC 日数据量、Primary/Replica、索引数、分片数和单分片大小是否口径一致？
- 能否区分“虚拟线程能承载等待”与“下游容量变大”？
- 能否解释 Bulk 部分成功时 Offset 何时推进？
- 能否解释回调超时为什么是 `UNKNOWN`，不能直接重试？
- 能否从生产 SQL 变慢推导到锁、资源、统计信息和计划漂移？
- 每个项目指标是否知道采集位置、时间窗口和计算口径？
- 每个高危 Agent Tool 是否有权限、审批、审计、幂等和补偿？

只要其中一项答不稳，就回到对应专题做一次“90 秒回答 + 两轮追问”，不要继续无差别刷题。
