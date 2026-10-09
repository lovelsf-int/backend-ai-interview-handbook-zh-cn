---
title: 知识主入口：一个问题，一份主读
description: 按知识点查唯一主入口，综合总览与题库只作补充
status: reviewing
baseline: curated reading map 2026-10-09
last_verified: 2026-10-09
level: P7/P8
source: 现有专题、项目资料与阅读去重审计
---

# 知识主入口：一个问题，一份主读

这是查找表，不是必读顺序。每行只指定一个主入口；点进去只读诊断卡住的部分。需要路线先回[短路线](./learning-path.md)，需要业务证据去[项目](./projects.md)。

## Java、JVM 与并发

| 知识点 | 主读 |
|---|---|
| 对象方法与相等性 | [Object 方法](../java/object-methods-interview.md) |
| 集合、HashMap、泛型 | [集合与泛型](../java/collections-generics-interview-guide.md) |
| JDK 特性差异 | [JDK 版本演进](../java/jdk-version-evolution.md) |
| 类加载与对象生命周期 | [类加载](../jvm/class-loading-object-lifecycle.md) |
| GC 与诊断证据 | [JVM 诊断](../jvm/diagnostics-gc.md) |
| 线上故障排查 | [故障 Runbook](../jvm/production-incident-troubleshooting.md) |
| JMM、volatile、ThreadLocal | [内存模型](../java/jmm-volatile-threadlocal.md) |
| CAS、AQS、锁与同步器 | [并发原语](../java/concurrency-locks-aqs-cas.md) |
| 线程池资源治理 | [线程池](../java/thread-pool-production-guide.md) |
| 虚拟线程版本 / pinning | [虚拟线程版本](../java/virtual-threads-jdk21-25.md) |
| 虚拟线程资源隔离 | [虚拟线程生产模式](../java/virtual-threads-production-patterns.md) |
| 虚拟线程观测与迁移 | [迁移验证](../java/virtual-threads-observability-migration.md) |
| IO、网络事件与 Netty | [IO / NIO / Netty](../java/io-nio-netty-interview-guide.md) |
| 通用设计模式 | [设计模式的生产场景](../java/design-patterns-production-scenarios.md) |

并发综合页只查项目例子；历史 PDF、旧综合手册不另读一遍。

## Spring 与 MySQL

| 知识点 | 主读 |
|---|---|
| IoC / DI 与容器 | [IoC 容器](../spring/02-ioc-di-container.md) |
| Bean 生命周期与扩展点 | [Bean 生命周期](../spring/03-bean-lifecycle-extension-points.md) |
| 循环依赖 | [依赖注入](../spring/04-dependency-injection-circular-reference.md) |
| AOP 与代理 | [AOP 调用链](../spring/05-aop-proxy-interceptor.md) |
| Spring 事务 | [声明式事务](../spring/06-transaction-principles.md) |
| MVC 请求链路 | [MVC](../spring/07-spring-mvc-request-flow.md) |
| Boot 启动与自动配置 | [Boot](../spring/08-spring-boot-startup-auto-configuration.md) |
| 事件、缓存与异步 | [注解边界](../spring/09-annotations-events-cache-async.md) |
| Bean 作用域与线程安全 | [作用域](../spring/10-scope-thread-safety.md) |
| Spring 生产故障 | [排障](../spring/12-production-troubleshooting.md) |
| InnoDB 写入、MVCC、隔离级别 | [事务与 MVCC](../mysql/innodb-write-mvcc-transactions.md) |
| MySQL 锁与死锁 | [锁与排障](../mysql/locks-deadlocks-production-runbook.md) |
| 索引、分页、复制 | [索引与复制](../mysql/index-explain-pagination-replication.md) |
| 性能归因、DDL 与发布 | [变更治理](../mysql/performance-schema-change-governance.md) |

## Redis 与 Kafka

| 知识点 | 主读 |
|---|---|
| Redis 线程 / 事件模型 | [线程模型](../redis/01-thread-model-event-loop.md) |
| Redis 数据结构与编码 | [数据结构](../redis/02-data-structures-version-differences.md) |
| 过期与淘汰 | [过期策略](../redis/03-expiration-eviction.md) |
| RDB / AOF 与恢复 | [持久化](../redis/04-rdb-aof-recovery.md) |
| 缓存一致性 | [一致性边界](../redis/05-cache-consistency.md) |
| 穿透、击穿与雪崩 | [缓存故障](../redis/06-penetration-breakdown-avalanche.md) |
| 复制与 Sentinel | [高可用](../redis/07-replication-sentinel.md) |
| Redis Cluster 与 slot | [Cluster](../redis/08-cluster.md) |
| 事务、Lua、Functions | [脚本原子性边界](../redis/09-transactions-lua-functions.md) |
| 分布式锁与 fencing | [Redisson 与 fencing](../redis/10-redisson-fencing-token.md) |
| Kafka 模型与 KRaft | [核心模型](../kafka/01-core-model-and-kraft.md) |
| 日志与存储 | [存储链路](../kafka/02-log-storage-and-performance.md) |
| Producer 可靠性与顺序 | [生产者](../kafka/03-producer-reliability-ordering.md) |
| 消费位点与 Rebalance | [消费者](../kafka/04-consumer-offset-rebalance.md) |
| Kafka 复制与故障 | [复制恢复](../kafka/05-replication-failure-recovery.md) |
| Kafka 事务 / EOS | [精确一次的范围](../kafka/06-delivery-semantics-exactly-once.md) |
| 重试、DLQ 与业务一致性 | [失败处理](../kafka/07-retry-dlq-business-consistency.md) |

## Elasticsearch

| 知识点 | 主读 |
|---|---|
| Lucene 索引机制 | [索引内部](../elasticsearch/03-lucene-index-internals.md) |
| 写入、refresh、flush、translog | [写入链路](../elasticsearch/04-write-path.md) |
| 查询与分布式搜索 | [搜索链路](../elasticsearch/05-search-path.md) |
| Mapping 与分词 | [字段与分词](../elasticsearch/06-mapping-analyzers.md) |
| 分片、路由与容量方法 | [容量方法](../elasticsearch/07-shards-routing-capacity.md) |
| DSL、分页与聚合 | [查询实践](../elasticsearch/08-dsl-pagination-aggregation.md) |
| Reindex、增量、切换与回滚 | [在线重建](../elasticsearch/12-reindex-consistency.md) |
| Data Stream / rollover 与 SOC 数字 | [SOC 容量和写入边界](../elasticsearch/17-soc-event-alert-capacity.md) |

通用容量方法与 SOC 实际口径是两种用途；不用把题库和项目压力面再当一套原理。

## AI Agent 与 AI Coding

| 知识点 | 主读 |
|---|---|
| LLM 与 Agent 基础 | [基础概念](../ai-agent/01-llm-agent-basics.md) |
| Workflow、编排与架构 | [编排](../ai-agent/02-architecture-orchestration.md) |
| Prompt 与上下文 | [上下文工程](../ai-agent/03-prompt-context-engineering.md) |
| Tool、MCP、A2A | [工具与协议](../ai-agent/04-tools-mcp-a2a.md) |
| RAG 切分、检索、过滤、RRF、重排 | [RAG 工程主线](../ai-agent/05-rag-knowledge-engineering.md) |
| 规划、执行、超时与恢复 | [执行恢复](../ai-agent/06-planning-execution-recovery.md) |
| Memory 与会话 | [记忆](../ai-agent/07-memory-session-personalization.md) |
| Multi-Agent | [多 Agent](../ai-agent/08-multi-agent.md) |
| 可靠性与成本 | [生产治理](../ai-agent/09-production-reliability-cost.md) |
| 评估与观测 | [评估](../ai-agent/10-evaluation-observability.md) |
| 权限、提示注入与执行安全 | [安全实战](../ai-agent/14-llm-agent-security-practice.md) |
| AI Coding 工具与开发闭环 | [开发工作流](../ai-coding/tools-workflow.md) |
| AI Coding 上下文与规范 | [上下文与规范](../ai-coding/context-spec.md) |
| AI Coding 质量与团队治理 | [质量门禁](../ai-coding/quality-governance.md) |

[AI 学习专区](../ai-study/)仅按需补基础、看图或自测；许可副本保留原文来源和历史版本，不与工程手册竞争当前生产语义的主入口。

## 支付与系统设计

| 知识点 | 主读 |
|---|---|
| DDD 边界与聚合 | [领域建模](../finance-payment-ddd/04-domain-modeling.md) |
| 业务幂等与一致性 | [幂等](../finance-payment-ddd/05-idempotency-consistency.md) |
| 支付状态与 UNKNOWN | [状态机](../finance-payment-ddd/06-state-machine-unknown.md) |
| 账务与对账 | [账务](../finance-payment-ddd/07-ledger-reconciliation.md) |
| Outbox / Inbox | [事件与消息](../finance-payment-ddd/08-events-outbox-inbox.md) |
| 支付安全与合规边界 | [安全与合规](../finance-payment-ddd/09-risk-security-compliance.md) |
| 支付容量与可靠性 | [容量与可靠性](../finance-payment-ddd/10-capacity-reliability.md) |
| 架构方案取舍 | [架构决策实战](../system-design/p7-p8-architecture-decision-workshop.md) |

算法与手写代码在[练习](./practice.md)；个人项目和跨区容灾事实在[项目案例](./projects.md)；通用系统设计题仍链接独立案例库。网络、安全、RAG 等知识已有覆盖，分散与证据未补齐不等于完全缺失。

## 还找不到？

使用站内搜索或左侧专题目录查独有细节；这张表覆盖常用知识单元，不声称每个小节都已逐段审计。新增解释优先回填主读页，其他页面只保留差异和链接。
