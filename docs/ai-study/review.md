---
title: "AI 闭卷复习工作台"
description: "32 个主题的 96 道基础、P7 与 P8 闭卷自测题"
status: "reviewing"
baseline: "JavaGuide source snapshot d76264cb4e000416c4adca06770ce014bd309150"
last_verified: "2026-09-09"
level: "学习 / 复习 / P7 / P8"
source: "JavaGuide Apache-2.0 许可正文；本手册独立学习卡"
---

# AI 闭卷复习工作台

先只看问题，回答后再点对应正文的学习卡展开答案。自评建议：0 分不会；1 分能讲概念但没有边界；2 分能讲机制、反例和验证。分数仅供自用，不代表职级评定。

## 01 AI 核心概念总览

1. 基础｜RAG、微调和工具调用分别解决什么问题？
2. P7｜SOC 研判为什么不能从一开始就做全自动 Agent？
3. P8｜怎么证明加 Agent 比固定流程值得？

[展开参考答案与练习](./java-guide/ai-core-concepts.md#study-card) · [工程深挖](/ai-agent/01-llm-agent-basics.md)

## 02 LLM 运行机制

1. 基础｜Token 数和中文字符数为什么不能画等号？
2. P7｜首字慢和完整回答慢如何区分？
3. P8｜怎样给长上下文收益定边界？

[展开参考答案与练习](./java-guide/llm-basis/llm-operation-mechanism.md#study-card) · [工程深挖](/ai-agent/01-llm-agent-basics.md)

## 03 大模型 API 调用工程

1. 基础｜流式返回的 delta 能直接当完整 JSON 解析吗？
2. P7｜429、超时和参数错误怎么重试？
3. P8｜多层 SDK 都重试会怎样？

[展开参考答案与练习](./java-guide/llm-basis/llm-api-engineering.md#study-card) · [工程深挖](/ai-agent/09-production-reliability-cost.md)

## 04 结构化输出与 Function Calling

1. 基础｜Function Calling 与普通 JSON 输出有何不同？
2. P7｜模型给出的资产 ID 不属于当前租户怎么办？
3. P8｜换模型后工具调用兼容性如何验证？

[展开参考答案与练习](./java-guide/llm-basis/structured-output-function-calling.md#study-card) · [工程深挖](/ai-agent/04-tools-mcp-a2a.md)

## 05 AI 应用评测

1. 基础｜Golden Set 应该包含哪些样本？
2. P7｜RAG 改善后答案仍然差，怎么定位？
3. P8｜LLM-as-Judge 如何避免自证循环？

[展开参考答案与练习](./java-guide/llm-basis/llm-evaluation.md#study-card) · [工程深挖](/ai-agent/10-evaluation-observability.md)

## 06 Agent 核心机制

1. 基础｜Workflow 与 Agent 的主要区别是什么？
2. P7｜Agent 一直调用同一个工具怎么办？
3. P8｜如何定义可审计的完成状态？

[展开参考答案与练习](./java-guide/agent/agent-basis.md#study-card) · [工程深挖](/ai-agent/02-architecture-orchestration.md)

## 07 Agent 记忆系统

1. 基础｜短期上下文和长期记忆差别在哪里？
2. P7｜用户说之前记错了，如何纠正？
3. P8｜多租户共享记忆服务如何避免污染？

[展开参考答案与练习](./java-guide/agent/agent-memory.md#study-card) · [工程深挖](/ai-agent/07-memory-session-personalization.md)

## 08 Prompt 工程

1. 基础｜Few-shot 示例应优先教什么？
2. P7｜修好一类问题却损坏另一类，怎么处理？
3. P8｜Prompt 平台需要哪些治理能力？

[展开参考答案与练习](./java-guide/agent/prompt-engineering.md#study-card) · [工程深挖](/ai-agent/03-prompt-context-engineering.md)

## 09 Context Engineering

1. 基础｜Prompt 工程与上下文工程如何区分？
2. P7｜上下文快满时先删什么？
3. P8｜如何评估压缩器是否安全？

[展开参考答案与练习](./java-guide/agent/context-engineering.md#study-card) · [工程深挖](/ai-agent/03-prompt-context-engineering.md)

## 10 MCP 协议

1. 基础｜模型究竟在哪里调用了 MCP？
2. P7｜MCP 工具接通但调用被拒绝，查什么？
3. P8｜升级 MCP 时如何避免知识和实现混乱？

[展开参考答案与练习](./java-guide/agent/mcp.md#study-card) · [工程深挖](/ai-agent/04-tools-mcp-a2a.md)

## 11 Agent Skills

1. 基础｜Skill 与 MCP 的区别是什么？
2. P7｜为什么采用渐进式加载？
3. P8｜第三方 Skill 升级怎样治理？

[展开参考答案与练习](./java-guide/agent/skills.md#study-card) · [工程深挖](/ai-agent/04-tools-mcp-a2a.md)

## 12 Harness Engineering

1. 基础｜Harness 与模型能力是什么关系？
2. P7｜上下文换新后如何接续任务？
3. P8｜怎么衡量 Harness 改进？

[展开参考答案与练习](./java-guide/agent/harness-engineering.md#study-card) · [工程深挖](/ai-agent/06-planning-execution-recovery.md)

## 13 Workflow、Graph 与 Loop

1. 基础｜Graph 一定比顺序代码更高级吗？
2. P7｜并行节点如何合并状态？
3. P8｜检查点与下游调用如何形成恢复契约？

[展开参考答案与练习](./java-guide/agent/workflow-graph-loop.md#study-card) · [工程深挖](/ai-agent/02-architecture-orchestration.md)

## 14 Loop Engineering

1. 基础｜一个可靠循环至少需要什么？
2. P7｜连续几轮无进展怎么判定？
3. P8｜多任务循环如何避免预算失控？

[展开参考答案与练习](./java-guide/agent/loop-engineering.md#study-card) · [工程深挖](/ai-agent/06-planning-execution-recovery.md)

## 15 Multi-Agent

1. 基础｜什么任务适合拆给多个 Agent？
2. P7｜子 Agent 输出冲突怎么办？
3. P8｜多 Agent 的收益如何归因？

[展开参考答案与练习](./java-guide/agent/multi-agent.md#study-card) · [工程深挖](/ai-agent/08-multi-agent.md)

## 16 RAG 基础

1. 基础｜RAG 和模型直接回答最大的边界差别是什么？
2. P7｜制度库与案例库为什么要区别对待？
3. P8｜RAG 链路怎么建立完整质量指标？

[展开参考答案与练习](./java-guide/rag/rag-basis.md#study-card) · [工程深挖](/ai-agent/05-rag-knowledge-engineering.md)

## 17 RAG 文档处理与切分

1. 基础｜每个 Chunk 至少带哪些信息？
2. P7｜制度、FAQ 和案例怎么分别切？
3. P8｜如何证明换切分策略有效？

[展开参考答案与练习](./java-guide/rag/rag-document-processing.md#study-card) · [工程深挖](/ai-agent/05-rag-knowledge-engineering.md)

## 18 向量索引与数据库

1. 基础｜HNSW 为什么是近似检索？
2. P7｜过滤后 Top K 不足怎么办？
3. P8｜已有 ES 还要不要引入专用向量库？

[展开参考答案与练习](./java-guide/rag/rag-vector-store.md#study-card) · [工程深挖](/ai-agent/05-rag-knowledge-engineering.md)

## 19 RAG 检索优化

1. 基础｜为什么 BM25 和向量检索可以互补？
2. P7｜Recall@K 很高但答案不好怎么办？
3. P8｜怎样给 Query Rewrite 和 Rerank 做消融？

[展开参考答案与练习](./java-guide/rag/rag-optimization.md#study-card) · [工程深挖](/ai-agent/05-rag-knowledge-engineering.md)

## 20 RAG 知识更新

1. 基础｜怎样判断文档是否需要重新向量化？
2. P7｜新版本导入到一半失败怎么办？
3. P8｜更换 Embedding 模型如何迁移？

[展开参考答案与练习](./java-guide/rag/rag-knowledge-update.md#study-card) · [工程深挖](/ai-agent/05-rag-knowledge-engineering.md)

## 21 GraphRAG

1. 基础｜什么问题更值得尝试 GraphRAG？
2. P7｜SOC 实体同名或 IP 复用怎么处理？
3. P8｜如何验证图方案的增量价值？

[展开参考答案与练习](./java-guide/rag/graphrag.md#study-card) · [工程深挖](/ai-agent/05-rag-knowledge-engineering.md)

## 22 AI 应用架构

1. 基础｜AI 应用比普通 API 服务新增了哪些关注点？
2. P7｜同步接口与异步任务怎样划分？
3. P8｜如何避免 AI 平台成为巨大共享故障域？

[展开参考答案与练习](./java-guide/system-design/ai-application-architecture.md#study-card) · [工程深挖](/ai-agent/12-system-design-project-deep-dive.md)

## 23 大模型网关

1. 基础｜模型路由除了价格还要看什么？
2. P7｜并发请求如何避免预算超扣？
3. P8｜怎样设计安全的 fallback？

[展开参考答案与练习](./java-guide/system-design/llm-gateway.md#study-card) · [工程深挖](/ai-agent/09-production-reliability-cost.md)

## 24 AI 可观测性

1. 基础｜一个 Agent Trace 要关联哪些版本？
2. P7｜P99 突然上升，如何分段定位？
3. P8｜如何在隐私限制下支持问题复现？

[展开参考答案与练习](./java-guide/system-design/ai-observability.md#study-card) · [工程深挖](/ai-agent/10-evaluation-observability.md)

## 25 实时语音 AI

1. 基础｜级联 ASR/LLM/TTS 与端到端音频如何取舍？
2. P7｜如何处理 barge-in 打断？
3. P8｜语音系统的质量门禁如何设计？

[展开参考答案与练习](./java-guide/system-design/ai-voice.md#study-card) · [工程深挖](/ai-agent/12-system-design-project-deep-dive.md)

## 26 LLM 与 Agent 安全

1. 基础｜直接和间接提示注入有什么差别？
2. P7｜审批后资产或参数被改了怎么办？
3. P8｜怎么验证防线不只是一句提示词？

[展开参考答案与练习](./java-guide/system-design/llm-security.md#study-card) · [工程深挖](/ai-agent/14-llm-agent-security-practice.md)

## 27 AI 应用综合复习

1. 基础｜怎样检查自己是否真学懂一个概念？
2. P7｜回答生产设计题如何组织？
3. P8｜如何避免方案只有组件没有决策？

[展开参考答案与练习](./java-guide/interview-questions/ai-interview-guide.md#study-card) · [工程深挖](/ai-agent/appendix-scenario-question-bank.md)

## 28 LLM 基础自测题库

1. 基础｜结构化输出成功说明什么，不说明什么？
2. P7｜长输入返回被截断，如何分析？
3. P8｜模型升级只跑几个例子够吗？

[展开参考答案与练习](./java-guide/interview-questions/llm-interview-questions.md#study-card) · [工程深挖](/ai-agent/01-llm-agent-basics.md)

## 29 Agent 自测题库

1. 基础｜Agent 与 MCP、Skills 分别处在哪层？
2. P7｜工具超时后 Agent 应该相信什么？
3. P8｜多 Agent 重新分工会破坏什么约束？

[展开参考答案与练习](./java-guide/interview-questions/agent-interview-questions.md#study-card) · [工程深挖](/ai-agent/06-planning-execution-recovery.md)

## 30 RAG 自测题库

1. 基础｜新的短告警要不要先切成多个 Chunk？
2. P7｜用户反馈引用了旧制度，怎么排查？
3. P8｜混合检索如何兼顾质量与租户隔离？

[展开参考答案与练习](./java-guide/interview-questions/rag-interview-questions.md#study-card) · [工程深挖](/ai-agent/05-rag-knowledge-engineering.md)

## 31 AI 系统设计自测

1. 基础｜如何区分控制流成功和业务成功？
2. P7｜大量租户同时调用模型，首先控制什么？
3. P8｜关键依赖故障时如何定义降级？

[展开参考答案与练习](./java-guide/interview-questions/ai-system-design-interview-questions.md#study-card) · [工程深挖](/ai-agent/12-system-design-project-deep-dive.md)

## 32 Agent 项目讲述与复盘

1. 基础｜三分钟项目介绍最少讲哪些点？
2. P7｜面试官追问数据口径，怎样回答？
3. P8｜怎样讲清个人贡献与团队成果？

[展开参考答案与练习](./java-guide/interview-questions/agent-project-interview-guide.md#study-card) · [工程深挖](/ai-agent/12-system-design-project-deep-dive.md)
