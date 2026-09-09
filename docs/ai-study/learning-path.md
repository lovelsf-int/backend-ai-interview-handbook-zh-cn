---
title: "AI 学习路线：从理解到复习"
description: "六阶段系统学习、14 个学习单元和可调整的复习安排"
status: "reviewing"
baseline: "JavaGuide source snapshot d76264cb4e000416c4adca06770ce014bd309150"
last_verified: "2026-09-09"
level: "学习 / 复习 / P7 / P8"
source: "JavaGuide Apache-2.0 许可正文；本手册独立学习卡"
---

# AI 学习路线：从理解到复习

## 使用方式

第一遍先读学习卡建立问题，再看正文和原图；第二遍合上正文回答自测；第三遍选一个练习并说明失败时会怎样。P7/P8 是加深层，不要求第一遍就全部答出。

## 14 个学习单元

单元不等于一天，按自己的精力拆分。每次至少留下一个自己写出的链路或反例，而不是只做阅读打卡。

| 单元 | 学习主题 | 本站正文 |
| --- | --- | --- |
| 01 | 概念地图 | [AI 核心概念总览](./java-guide/ai-core-concepts.md) |
| 02 | 模型怎样运行 | [LLM 运行机制](./java-guide/llm-basis/llm-operation-mechanism.md) |
| 03 | API 与结构化契约 | [大模型 API 调用工程](./java-guide/llm-basis/llm-api-engineering.md)、[结构化输出与 Function Calling](./java-guide/llm-basis/structured-output-function-calling.md) |
| 04 | 先建立评测意识 | [AI 应用评测](./java-guide/llm-basis/llm-evaluation.md) |
| 05 | Agent 与流程边界 | [Agent 核心机制](./java-guide/agent/agent-basis.md)、[Workflow、Graph 与 Loop](./java-guide/agent/workflow-graph-loop.md) |
| 06 | Prompt 与上下文 | [Prompt 工程](./java-guide/agent/prompt-engineering.md)、[Context Engineering](./java-guide/agent/context-engineering.md) |
| 07 | 记忆、Harness 与循环 | [Agent 记忆系统](./java-guide/agent/agent-memory.md)、[Harness Engineering](./java-guide/agent/harness-engineering.md)、[Loop Engineering](./java-guide/agent/loop-engineering.md) |
| 08 | MCP、Skills 与协作 | [MCP 协议](./java-guide/agent/mcp.md)、[Agent Skills](./java-guide/agent/skills.md)、[Multi-Agent](./java-guide/agent/multi-agent.md) |
| 09 | RAG 与文档处理 | [RAG 基础](./java-guide/rag/rag-basis.md)、[RAG 文档处理与切分](./java-guide/rag/rag-document-processing.md) |
| 10 | 索引与检索优化 | [向量索引与数据库](./java-guide/rag/rag-vector-store.md)、[RAG 检索优化](./java-guide/rag/rag-optimization.md) |
| 11 | 更新与 GraphRAG | [RAG 知识更新](./java-guide/rag/rag-knowledge-update.md)、[GraphRAG](./java-guide/rag/graphrag.md) |
| 12 | 架构、网关与观测 | [AI 应用架构](./java-guide/system-design/ai-application-architecture.md)、[大模型网关](./java-guide/system-design/llm-gateway.md)、[AI 可观测性](./java-guide/system-design/ai-observability.md) |
| 13 | 语音与安全边界 | [实时语音 AI](./java-guide/system-design/ai-voice.md)、[LLM 与 Agent 安全](./java-guide/system-design/llm-security.md) |
| 14 | 综合复习与事实核验 | [AI 应用综合复习](./java-guide/interview-questions/ai-interview-guide.md)、[LLM 基础自测题库](./java-guide/interview-questions/llm-interview-questions.md)、[Agent 自测题库](./java-guide/interview-questions/agent-interview-questions.md)、[RAG 自测题库](./java-guide/interview-questions/rag-interview-questions.md)、[AI 系统设计自测](./java-guide/interview-questions/ai-system-design-interview-questions.md)、[Agent 项目讲述与复盘](./java-guide/interview-questions/agent-project-interview-guide.md) |

## 复习与错题记录

可尝试在学后第 1、3、7、14 天闭卷复述，间隔自行调整；这是安排建议，不是效果保证。把错误分成概念错、机制断、边界漏、验证缺四类，下一次只针对仍不会的部分重练。

建议在私人笔记记录：主题、自己的原回答、错因、反例、修正答案、需要补的证据、下次复习日期。本仓库是公开学习站，不要把真实告警、密钥、客户信息和公司内部材料写入页面。

## 三条贯穿练习

用合成资料搭建只读知识问答；再加入受控工具调用；最后加入异步状态、超时对账与安全验收。每次只增加一类复杂度，先写验收条件，再实现。练习不要求购买付费模型，可先用模拟接口验证确定性逻辑。
