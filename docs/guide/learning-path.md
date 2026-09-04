---
title: 学习路线
description: 面向 P7/P8 Java 与 AI Agent 岗位的分阶段复习顺序
status: reviewing
baseline: full migration plan v1
last_verified: 2026-09-01
level: P7/P8
source: 12 份面试资料的结构化路线
---

# 学习路线

## 第一阶段：建立回答骨架

先掌握 Java 并发、JVM 排障、Spring IoC/AOP/事务、MySQL 事务与锁、Kafka 可靠性、Redis 缓存一致性和 Elasticsearch 读写链路。目标是能够在 90 秒内给出有边界的核心回答。Spring 部分按 [核心架构与 IoC 主线](../spring/) 复习，再进入事务和生产排障。

## 第二阶段：进入生产工程

学习幂等、Outbox/Inbox、状态机、容量规划、监控、降级、重试与补偿。每个结论都要能回答“失败会怎样”和“如何证明有效”。

## 第三阶段：AI Agent 工程化

按照架构编排、Prompt/Context、Tool/MCP、RAG、Memory、Multi-Agent、评估、安全和可靠性的顺序学习。模型决策与确定性工程约束要分层描述。

## 第四阶段：项目连续追问

重点准备 SOC 智能研判、全球订阅、海外支付和道路运输平台。回答时明确个人职责、真实数据、关键取舍、事故路径和下一步优化。

## 第五阶段：模拟面试

每个专题使用“结论—原理—方案—异常—指标—取舍—演进”七段式回答，连续追问至少三轮，并记录无法量化或需要补证的部分。
