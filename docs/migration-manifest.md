---
title: 内容迁移清单
description: 记录每份源资料的事实源角色、目标专题、去重策略和校准状态
status: reviewing
baseline: 2026-09-01 source inventory
last_verified: 2026-09-01
level: P7/P8
source: 12 份自有源资料清单
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
| 12 | `金余概_资深Java_AI-Agent开发_定制面试手册_v5.0_全球数据库容灾回切深挖版.docx` | 后端与项目综合源 | `java/`、`jvm/`、`mysql/`、`system-design/` | migrated |

## 状态说明

- `planned`：目标已确定，正文尚未落盘。
- `migrated`：独有知识点已经进入目标页面。
- `merged`：内容已合并到 canonical 页面，重复正文不保留。
- `legacy`：只在历史版本页面中保留。

## 本轮结果

12 份批准源资料均已完成迁移或合并。正文不链接 DOCX/PDF 源附件，不引用 Pandoc 导出的 `media/` 图片；重复主题改为 canonical 页面链接，旧版本材料单独标识为 `legacy`，需要继续核验的混合版本内容保持 `reviewing`。

## 校准原则

Kafka 以强化版为主干；Redis 默认保持 `reviewing`；Elasticsearch 容量数字必须注明工作负载；支付领域先定义业务不变量，再讨论中间件和设计模式。
