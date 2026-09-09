---
title: "AI 系统学习与复习"
description: "32 篇完整正文、6 篇导览、96 道附加自测与 32 个实践练习"
status: "reviewing"
baseline: "JavaGuide source snapshot d76264cb4e000416c4adca06770ce014bd309150"
last_verified: "2026-09-09"
level: "学习 / 复习 / P7 / P8"
source: "JavaGuide Apache-2.0 许可正文；本手册独立学习卡"
---

# AI 系统学习与复习

> 学习目标：能解释原理、走通链路、识别反例，并把知识迁移到自己的问题中。不是只背一段面试答案。

**本次固定快照：32/32 篇正文、6/6 篇原始导览。** 每篇正文前有独立学习卡：速记、链路、易错点、基础/P7/P8 三层自测和实践任务；答案默认折叠。

[从学习路线开始](./learning-path.md) · [闭卷复习工作台](./review.md) · [38 页覆盖清单](./coverage.md) · [版本校准](./version-notes.md) · [来源与许可证](./sources.md)

原有 [AI Agent 工程手册](/ai-agent/) 与面试复盘完整保留。这里用来系统学习，原手册用来做生产深挖；各篇学习卡已连到对应工程章节。

::: warning 阅读边界
正文是 JavaGuide 固定提交的许可学习副本，不是对所有技术细节逐项认证。原文的“当前”、版本、价格、性能数字和第一人称项目经历均属于其写作上下文；不要当作自己的经历或现行默认值。源文中的外部图只保留原图链接，Mermaid 图表源码保留。
:::

## 入门总览

| 正文 | 本篇首先弄懂 |
| --- | --- |
| [AI 核心概念总览](./java-guide/ai-core-concepts.md) | 先把模型、知识、工具与执行器放回各自的位置：LLM 生成候选输出，RAG 提供检索证据，工具产生外部效果，Agent 应用负责多步控制。 |

## 大模型基础

[原始分类导览](./java-guide/llm-basis/index.md)

| 正文 | 本篇首先弄懂 |
| --- | --- |
| [LLM 运行机制](./java-guide/llm-basis/llm-operation-mechanism.md) | 把 Token 化、上下文处理和逐步生成串成链路，再理解采样参数。参数名不是业务正确性的保证。 |
| [大模型 API 调用工程](./java-guide/llm-basis/llm-api-engineering.md) | 一次模型请求要放进完整的超时、限流、取消、重试和业务幂等链路，而不是只写一个 HTTP POST。 |
| [结构化输出与 Function Calling](./java-guide/llm-basis/structured-output-function-calling.md) | 区分返回格式、工具调用意图和实际执行。Schema 可以限制结构，不能代替资源权限、业务规则和副作用控制。 |
| [AI 应用评测](./java-guide/llm-basis/llm-evaluation.md) | 先定义任务成功与失败代价，再建立数据集、分层指标和回归门禁。评审模型是辅助测量工具，不是真值来源。 |

## Agent 工程

[原始分类导览](./java-guide/agent/index.md)

| 正文 | 本篇首先弄懂 |
| --- | --- |
| [Agent 核心机制](./java-guide/agent/agent-basis.md) | Agent 的重点是依据观察进行多步选择；工程实现必须控制状态、权限、预算与终止，不能只写一个无限 while 循环。 |
| [Agent 记忆系统](./java-guide/agent/agent-memory.md) | 记忆是有来源、用途、作用域和生命周期的数据。对话记录、摘要、任务状态和长期知识不能混用一套写入规则。 |
| [Prompt 工程](./java-guide/agent/prompt-engineering.md) | 提示词是可版本化的任务说明与输入组织方式。好提示词需要明确目标、约束、资料和输出要求，并接受测试而不是凭感觉调。 |
| [Context Engineering](./java-guide/agent/context-engineering.md) | 上下文工程决定这一轮模型应该看到哪些信息，以及怎样排序、压缩、更新与隔离。不是把历史消息全部拼起来。 |
| [MCP 协议](./java-guide/agent/mcp.md) | MCP 规范应用与外部能力之间的发现和调用，不替模型做判断，也不替业务系统做资源授权。阅读前先区分协议修订版。 |
| [Agent Skills](./java-guide/agent/skills.md) | Skill 把可复用流程、说明和配套资源组织成可发现的能力包；它与工具接入协议不同，也不是自动获得执行权限的授权书。 |
| [Harness Engineering](./java-guide/agent/harness-engineering.md) | Harness 是围绕模型的执行与反馈环境：它管理工具、上下文、状态、验证和恢复，使长任务不只依赖一次模型回答。 |
| [Workflow、Graph 与 Loop](./java-guide/agent/workflow-graph-loop.md) | Workflow 描述可控制的步骤，Graph 表达节点和状态转移，Loop 表达重复决策。选型首先由业务可预测性和恢复要求决定。 |
| [Loop Engineering](./java-guide/agent/loop-engineering.md) | 循环工程的价值不在循环本身，而在每一轮输入、验证、进展和停止条件都可解释、可控制。 |
| [Multi-Agent](./java-guide/agent/multi-agent.md) | 多 Agent 用职责与上下文分离处理可拆任务，但会增加通信、调度、冲突和成本。先证明单 Agent 或普通并行工具不够。 |

## RAG 知识工程

[原始分类导览](./java-guide/rag/index.md)

| 正文 | 本篇首先弄懂 |
| --- | --- |
| [RAG 基础](./java-guide/rag/rag-basis.md) | RAG 在生成前检索外部证据，改进知识获取与可追溯性；它并不会自动消除错误检索、证据冲突和幻觉。 |
| [RAG 文档处理与切分](./java-guide/rag/rag-document-processing.md) | 切分首先服务语义完整和证据定位，再讨论长度与重叠。文档类型、标题结构、表格及权限必须进入设计。 |
| [向量索引与数据库](./java-guide/rag/rag-vector-store.md) | 向量存储不等于 ANN 检索能力。索引选择要同时考虑召回、过滤、延迟、更新、内存和运维，而不只看条数。 |
| [RAG 检索优化](./java-guide/rag/rag-optimization.md) | 按召回、融合、重排和上下文逐层定位问题。每增加一个优化步骤，都要证明质量收益值得它的延迟与成本。 |
| [RAG 知识更新](./java-guide/rag/rag-knowledge-update.md) | 知识更新是原文、切片、向量、权限、缓存和引用之间的一致性问题。需要版本、幂等、失败恢复与删除传播。 |
| [GraphRAG](./java-guide/rag/graphrag.md) | 先明确问题是否需要关系和跨文档聚合，再评估图抽取、检索及摘要。GraphRAG 不是把向量库替换成图库那么简单。 |

## AI 系统设计

[原始分类导览](./java-guide/system-design/index.md)

| 正文 | 本篇首先弄懂 |
| --- | --- |
| [AI 应用架构](./java-guide/system-design/ai-application-architecture.md) | 把概率生成放进有身份、状态、预算和恢复能力的后端系统。架构设计应先明确质量、延迟与错误代价，再选择框架。 |
| [大模型网关](./java-guide/system-design/llm-gateway.md) | 模型网关集中处理接入、路由、配额和观测，但不能凭接口名称相同就假设所有模型行为一致。 |
| [AI 可观测性](./java-guide/system-design/ai-observability.md) | 可观测性帮助回答哪里慢、哪里贵、哪里错；质量评测回答是否完成任务。两者互补，但不能用 Trace 数量代替质量证据。 |
| [实时语音 AI](./java-guide/system-design/ai-voice.md) | 实时语音需要联合管理识别、生成、合成、播放与打断状态。低延迟不只是换一个更快的语言模型。 |
| [LLM 与 Agent 安全](./java-guide/system-design/llm-security.md) | 安全目标是即使模型被误导，也不能突破外部身份、数据和执行权限。检测器与 Prompt 约束只是防御中的一部分。 |

## 面试与项目复习

[原始分类导览](./java-guide/interview-questions/index.md)

| 正文 | 本篇首先弄懂 |
| --- | --- |
| [AI 应用综合复习](./java-guide/interview-questions/ai-interview-guide.md) | 把复习从名词记忆转为请求链路复述：每个组件解决什么问题，失败时谁负责，怎样用证据验证。 |
| [LLM 基础自测题库](./java-guide/interview-questions/llm-interview-questions.md) | 围绕输入预算、生成过程、结构化契约与评测做自测，把参数知识还原为可观察的行为。 |
| [Agent 自测题库](./java-guide/interview-questions/agent-interview-questions.md) | Agent 面试的分水岭在状态、授权、停止和恢复，不能停留在规划—调用—反思的术语循环。 |
| [RAG 自测题库](./java-guide/interview-questions/rag-interview-questions.md) | 先讲离线索引和在线查询，再解释切分、混合检索、重排、更新与评测。每个优化都要能给出反例。 |
| [AI 系统设计自测](./java-guide/interview-questions/ai-system-design-interview-questions.md) | 系统设计的答案是约束下的取舍，不是画满组件。把质量、容量、成本、安全和一致性一起讨论。 |
| [Agent 项目讲述与复盘](./java-guide/interview-questions/agent-project-interview-guide.md) | 项目表达以可核实事实为骨架：背景、个人职责、关键决策、异常处理、结果证据和不足。参考案例只用来学结构。 |

## 学完怎样判断掌握

不看答案，讲清定义、链路、反例和验证方法。能复述但不能解释异常路径时，回到该篇学习卡和工程章节；能解释之后，再完成合成数据练习。这里只提供自测材料，不自动记录个人成绩。
