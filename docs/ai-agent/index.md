---
title: AI Agent 工程化手册
description: 从模型基础、架构编排到 RAG、工具、记忆、评估、安全和生产项目
status: reviewing
baseline: AI Agent source snapshot 2026
last_verified: 2026-09-04
level: P7/P8
source: 两份 AI Agent 自有面试资料的 canonical 合并
---

# AI Agent 工程化手册

## 专题定位

本专题把模型的概率决策与确定性工程约束分开讨论。重点不是“会调用模型”，而是能设计可恢复、可观测、可评估、受权限与预算约束的生产系统。

## 基础与编排

1. [LLM 与 Agent 基础](./01-llm-agent-basics.md)
2. [Agent 架构与编排模式](./02-architecture-orchestration.md)
3. [Prompt 与 Context Engineering](./03-prompt-context-engineering.md)
4. [Tool Calling、MCP 与 A2A](./04-tools-mcp-a2a.md)
5. [Planning、Execution 与可恢复编排](./06-planning-execution-recovery.md)

## RAG、记忆与多智能体

1. [RAG 与企业知识工程](./05-rag-knowledge-engineering.md)
2. [Memory、Session 与个性化](./07-memory-session-personalization.md)
3. [Multi-Agent 与协作机制](./08-multi-agent.md)

## 生产可靠性与治理

1. [生产工程、可靠性与成本](./09-production-reliability-cost.md)
2. [Evaluation 与 Observability](./10-evaluation-observability.md)
3. [Security、Guardrail 与治理](./11-security-guardrails-governance.md)
4. [2026-09-04 正式面试复盘：LLM 平台治理与多租户稳定性](./13-mock-interview-review-2026-09-04.md)

## 系统设计与题库

1. [系统设计与项目深挖](./12-system-design-project-deep-dive.md)
2. [场景题、模拟面试与准备附录](./appendix-scenario-question-bank.md)

## 内容状态

正文已经按 canonical 模块完成结构迁移。页面默认保持 `reviewing`，后续依据官方资料和项目证据逐章提升为 `verified`。旧题库只补充业务场景、开放问题、项目追问和系统设计题，基础概念不重复发布。
