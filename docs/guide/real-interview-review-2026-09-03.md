---
title: 2026-09-03 真实面试复盘与补强路线
description: 基于 54 分 23 秒真实面试记录，按 Java 并发、线上排障、MySQL、分布式事务、Spring、SOC Agent 与 AI Coding 逐题复盘
status: verified
baseline: 2026-09-03 完整真实面试记录与本站 canonical 专题
last_verified: 2026-09-04
level: P7/P8
source: 用户提供的完整面试记录与逐题复盘
---

# 2026-09-03 真实面试复盘与补强路线

> 这页不是泛化题库，而是把一次完整真实面试暴露出的薄弱点映射回本站对应专题。核心结论：**项目工程能力强于 Java 基础原理表达；P0 应先修 Spring、MySQL/线上排障、Java 并发，再继续强化分布式事务与 Agent。**

## 1. 总体诊断

| 模块 | 表现 | 结论 |
| --- | --- | --- |
| SOC / Agent 项目 | 8/10 | 项目真实性和生产意识较强 |
| AI Coding | 8/10 | Spec、任务拆分、门禁、Review 思路完整 |
| 分布式事务 | 7/10 | 工程经验有，但 2PC/TCC/Saga/Outbox 术语需标准化 |
| Java 并发 | 6.5/10 | 基础能答，CAS/JMM/AQS 深度需要补 |
| 线上排障 | 6/10 | 缺少固定故障树，容易先猜 SQL/网络 |
| MySQL | 5.5~6/10 | 索引选择性、锁等待、资源竞争反应偏慢 |
| Spring | 5/10 | 本场最明显短板 |

## 2. 真实面试 P0 问题

### 2.1 `count++` 为什么可能得到 1？

`count++` 是 read-modify-write 复合操作，不具备原子性。两个线程可能同时读取旧值 0，各自计算 1，再分别写回，发生 Lost Update。`volatile` 不能把复合操作变成原子操作；可以使用 `synchronized`、`ReentrantLock` 或 `AtomicInteger`。

对应复习：[锁、CAS、AQS 与同步器](/java/concurrency-locks-aqs-cas.md)；[JMM、volatile 与 ThreadLocal](/java/jmm-volatile-threadlocal.md)。

### 2.2 `synchronized` 方法到底锁谁？

实例同步方法锁当前 `this`；两个不同实例不是同一把锁。`static synchronized` 锁对应 `Class` 对象。同步代码块锁表达式结果。面试不要只说“给方法加锁”，必须指出 Monitor 身份。

### 2.3 本地 100ms，线上 3s，怎么排？

不要先猜 SQL。先把端到端耗时切段：

1. Gateway / Network；
2. JVM、GC、线程池、锁；
3. DB、连接池、慢 SQL、长事务与锁等待；
4. Redis / RPC / HTTP 下游；
5. CPU、磁盘 IO、容器限额；
6. 发布、定时任务、批处理、其他业务负载。

固定方法：**Metrics 定位异常组件 → Trace 定位慢阶段 → Logs / DB 现场定位根因**。

对应复习：[JVM 生产事故排查](/jvm/production-incident-troubleshooting.md)；[Spring 生产故障排查](/spring/12-production-troubleshooting.md)。

### 2.4 为什么“走了索引”仍扫描大量数据？

索引被使用不代表过滤效果好。性别等低基数字段选择性很低，即使使用索引也可能命中大量记录。排查不能只看 `key`，还要看 cardinality/selectivity、`rows`、`filtered`，并结合真实数据分布和代价模型。

对应复习：[InnoDB 索引、执行计划、分页与复制](/mysql/index-explain-pagination-replication.md)。

### 2.5 数据量相近，为什么生产 SQL 仍慢？

当 SQL、表结构、索引和目标表数据量相近时，要主动扩展到运行环境：长事务与锁等待、CPU/IO 争用、连接池、Buffer Pool、其他业务/定时任务、统计信息与执行计划漂移、网络和磁盘。不要继续只围绕索引猜原因。

对应复习：[MySQL 锁、死锁与生产排障](/mysql/locks-deadlocks-production-runbook.md)。

### 2.6 库存成功、订单失败，怎么保证一致？

先定性为跨服务最终一致问题。常见方案是 Saga：每一步独立本地事务，持久化状态；失败触发业务补偿；所有副作用操作幂等；超时/响应丢失进入 `UNKNOWN`，先按 requestId/token 查下游真实状态，再决定推进、重试或补偿。持续失败进入 DLQ/人工。

对应复习：[状态机与 UNKNOWN](/finance-payment-ddd/06-state-machine-unknown.md)；[Outbox 与 Inbox](/finance-payment-ddd/08-events-outbox-inbox.md)。

### 2.7 MQ 不是“把事务表搬过去”

典型链路是：业务数据与 Transactional Outbox 在同一个 DB 本地事务提交，再由 Worker/CDC 可靠投递 MQ。消费者通常是 at-least-once，因此必须幂等。失败链路是 Retry → Backoff → DLQ → 人工。

### 2.8 2PC / XA、TCC、Saga 必须区分

- **2PC / XA**：两阶段协调，偏强一致，资源锁定和协调成本较高。
- **TCC**：Try / Confirm / Cancel，由业务显式预留、确认和释放资源，侵入高。
- **Saga**：长事务拆成本地事务 + 补偿，追求最终一致，不是“强事务工具”。

## 3. Spring：本场最高优先级补强

### 3.1 Bean 有哪些注册方式？

面试至少回答五类：

1. `@Component` / `@Service` / `@Repository` / `@Controller` 组件扫描；
2. `@Configuration + @Bean`；
3. `@Import`；
4. `ImportSelector` / `ImportBeanDefinitionRegistrar`；
5. `BeanDefinitionRegistry` 等程序化注册；
6. 兼容场景还包括 XML；Spring Boot 还有 AutoConfiguration / Starter。

### 3.2 `Controller / Service / Repository / Component` 能换着用吗？

不能简单回答“绝对不能”。它们本质都是 `@Component` stereotype，Bean 注册层面都可以被组件扫描发现；区别主要是架构语义和框架附加行为。`@Repository` 有持久层异常转换语义，`@Controller` 具有 MVC Web 语义，`@Service` 主要表达业务层。

### 3.3 Java SPI 与 Spring 扩展机制

Java SPI 典型是 `ServiceLoader + META-INF/services`。Spring 容器级扩展更常见的是 BeanDefinition、`@Import`、`ImportSelector`、`ImportBeanDefinitionRegistrar`、后置处理器和 Boot AutoConfiguration。不要把“自动注入”回答成“Bean 声明方式”。

### 3.4 下一层必须扛住的追问

- IoC 与 DI；
- BeanDefinition；
- Bean 生命周期；
- BeanFactory 与 ApplicationContext；
- AOP 代理链；
- JDK Proxy 与类代理；
- `@Transactional` self-invocation；
- 循环依赖；
- Spring Boot 自动配置。

对应复习：[Spring 专题首页](/spring/)；[100 道核心面试题](/spring/13-interview-question-bank.md)。

## 4. SOC Agent：保留优势，但回答要收敛

### 4.1 3 分钟主线

业务背景 → Kafka 接入与削峰 → 统一安全事件模型 → RAG → LLM 研判 → Planner / Executor → Tool 权限与高危审批 → 人工反馈闭环。

RAG 主线固定为：

`Metadata Filter → BM25 + Dense Vector → RRF → Rerank → TopK`

评估固定为：Retrieval 看 `Recall@K`；Ranking 看 `MRR/NDCG`；线上看人工复核通过率、误报/漏报和处置采纳率。正确证据没进 TopK 是 Retrieval 问题；进了候选但排序掉是 Ranking 问题；进入最终 Context 仍答错才优先看 LLM/Prompt。

### 4.2 Agent 安全边界

Planner 只负责规划，不直接持有生产权限；Executor 负责 Tool Registry、Schema Validation、RBAC/ABAC、租户/资源边界、风险等级和审批。高危动作 Human-in-the-loop。

### 4.3 模型只有 200 QPS 怎么办？

不是无限加消费者。先通过规则、聚合、去重和风险分级压缩真正进入 LLM 的任务；Kafka 缓冲；Agent 设置全局并发上限和 RateLimiter；高危优先，中低风险延迟；必要时降级。**虚拟线程降低线程等待成本，但不会提高模型容量。**

对应复习：[RAG 与知识工程](/ai-agent/05-rag-knowledge-engineering.md)；[规划、执行与恢复](/ai-agent/06-planning-execution-recovery.md)；[可靠性与成本](/ai-agent/09-production-reliability-cost.md)。

## 5. AI Coding：加分项的标准口径

推荐表达：

`Spec / Architecture → Plan → Small Tasks → Limited Change Scope → Test/Lint/Security → AI Review → Human Review → Merge`

“80% AI Coding”必须限定为**实现性编码工作量**，不是 80% 的工程责任。需求澄清、架构、验收、安全和上线责任仍由工程师承担。收益应看 PR Lead Time、交付周期、人工编码时长、Review 时间、返工率和缺陷逃逸率，而不是代码行数。

对应复习：[Spec-driven AI Coding](/system-design/spec-driven-ai-coding.md)。

## 6. 7 天修复顺序

1. Spring：Bean 注册、IoC、Bean 生命周期、AOP、事务失效；
2. MySQL：Explain/Analyze、索引选择性、锁/长事务、慢 SQL；
3. Java 并发：JMM、volatile、CAS、AQS、synchronized、Lock；
4. 分布式事务：2PC/XA/TCC/Saga/Outbox/UNKNOWN；
5. Troubleshooting：本地快线上慢、SQL 突然慢、线程池满、下游超时、CPU 飙高；
6. SOC Agent：3 分钟项目介绍 + RAG/Agent/容量连续追问；
7. 60 分钟压力面：每题先给结论和结构，不在中途请求答案。

## 7. 下一场面试回答纪律

统一使用：**结论 → 3 个关键点 → 项目例子 → 异常/权衡**。

遇到不确定细节，不要直接放弃。先说：`我先讲确定的核心机制，再补边界。` 资深岗位不只考“是否知道一个术语”，更考能否在追问下保持结构、边界和工程判断。
