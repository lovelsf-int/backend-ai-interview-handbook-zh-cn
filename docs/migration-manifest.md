---
title: 内容迁移清单
description: 记录每份源资料的事实源角色、目标专题、去重策略和校准状态
status: reviewing
baseline: 2026-09-03 source inventory
last_verified: 2026-09-03
level: P7/P8
source: 18 份自有源资料与 1 张自有架构图清单
---

# 内容迁移清单

“完整迁移”指所有独有知识点都有可追溯目标，重复、错误旧口径和排版噪声不逐字保留。源附件不进入 Git 历史。

| 编号 | 源资料 | 角色 | 目标专题 | 迁移状态 |
|---:|---|---|---|---|
| 1 | `AI_Agent工程师_P7-P8完整面试手册_2026版_追问答案完整版(1).docx` | canonical | `ai-agent/` | migrated |
| 2 | `AI_Agent_面试题_资深级参考答案.md` | 辅助题库 | `ai-agent/appendix-scenario-question-bank.md` | merged |
| 3 | `Kafka核心知识点_P7P8面试强化版.docx` | canonical | `kafka/` | migrated |
| 4 | `Kafka 核心技术全解析(1).docx` | legacy 辅助 | `kafka/appendix-kafka-3x-legacy.md` | legacy |
| 5 | `Kafka Exactly-Once 精确一次语义完全解析.docx` | EOS 辅助 | `kafka/06-delivery-semantics-exactly-once.md` | merged |
| 6 | `redis.docx` | 原始辅助 | `redis/` | merged |
| 7 | `Redis P7 核心知识&面试终极手册（架构级·可直接背诵） (2).docx` | 主干手册 | `redis/` | migrated |
| 8 | `Elasticsearch_深度原理_生产调优_面试题完整版 (1).docx` | canonical | `elasticsearch/` | migrated |
| 9 | `P8金融支付_SOLID设计模式_完整面试资料_Java版(2).docx` | canonical | `finance-payment-ddd/` | migrated |
| 10 | `DDD支付订阅系统_高清架构评审版(1).docx` | 图示辅助 | `finance-payment-ddd/subscription-case/` | merged |
| 11 | `DDD支付订阅系统_架构设计面试版_架构图版(1).docx` | 结构辅助 | `finance-payment-ddd/subscription-case/` | merged |
| 12 | `金余概_资深Java_AI-Agent开发_定制面试手册_v5.0_全球数据库容灾回切深挖版.docx` | 后端与项目综合源 | `java/`、`jvm/`、`mysql/`、`system-design/` | superseded |
| 13 | `Elasticsearch_P7_P8_完整面试手册_SOC_800到900万条_Primary150GB_事件告警分层版_v2.4.docx` | SOC 项目 canonical | `elasticsearch/17-soc-event-alert-capacity.md`、`18-soc-pressure-interview.md` | migrated |
| 14 | `Java虚拟线程生产实践指南_JDK21-25.docx` | Java 虚拟线程 canonical | `java/virtual-threads-*.md` | migrated |
| 15 | `Elasticsearch_P7_P8_完整面试手册_SOC告警场景.docx` | ES legacy 辅助 | ES 项目页中的通用检查清单 | legacy |
| 16 | `金余概_资深Java_AI-Agent开发_定制面试手册_v5.4_全量未答题补全版.docx` | v5.4 增量源 | `java/design-patterns-production-scenarios.md`、`system-design/pressure-interview-playbook.md` | merged |
| 17 | `日本台湾双活订单系统架构图.png` | 自有架构图 | `system-design/overseas-payment.md` | migrated |
| 18 | `mysql_07_08_000230.doc` | MySQL 混合版本审计源（实际为 OOXML） | `mysql/` 三篇 MySQL 8.4 深入页 | migrated |
| 19 | `b3578300-1921-4593-afa0-074e9920360b.pdf` | 2019 Java 并发 legacy 审计源 | `java/concurrency-locks-aqs-cas.md`、`thread-pool-production-guide.md`、`jmm-volatile-threadlocal.md` | merged |

## 状态说明

- `planned`：目标已确定，正文尚未落盘。
- `migrated`：独有知识点已经进入目标页面。
- `merged`：内容已合并到 canonical 页面，重复正文不保留。
- `legacy`：只在历史版本页面中保留。
- `superseded`：内容已由新版本继承，旧版页面仍保留但不再继续扩写。
- `in progress`：已完成来源审计，目标页面正在实施。

## 本轮结果

19 份来源均已完成迁移、合并或 legacy/superseded 归档。2026-09-03 新增的 2019 Java 并发资料已按现代 JDK 语义审计为三篇 P8 专题；并发总览保留 SOC 场景摘要，锁、线程池、JMM 与虚拟线程的深层机制分别以独立页面为 canonical，页面间通过链接衔接而不重复长篇正文。此前 v5.4 未重复发布 v5.0 已覆盖正文，ES 旧 100 万条容量口径未进入当前项目主干，MySQL 混合版本内容统一按 8.4 官方语义校准。

## 校准原则

Kafka 以强化版为主干；Redis 默认保持 `reviewing`；Elasticsearch 容量数字必须注明工作负载；Java 并发区分语言规范、JVM 实现细节和历史版本；虚拟线程区分 JDK 版本事实与项目实践；支付领域先定义业务不变量，再讨论中间件和设计模式。
