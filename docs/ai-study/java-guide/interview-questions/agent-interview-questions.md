---
title: "AI Agent 面试题总结 · 学习版"
description: "Agent 自测题库：许可正文与个人复习"
status: "reviewing"
baseline: "JavaGuide source snapshot d76264cb4e000416c4adca06770ce014bd309150"
last_verified: "2026-09-09"
level: "学习 / 复习 / P7 / P8"
source: "JavaGuide Apache-2.0 许可正文；本手册独立学习卡"
source_commit: "d76264cb4e000416c4adca06770ce014bd309150"
source_blob: "0c9f7f7a135ad45273d80ac90b672f73fef098e1"
source_url: "https://javaguide.cn/ai/interview-questions/agent-interview-questions.html"
---

# AI Agent 面试题总结

> 来源：JavaGuide / Guide 与原贡献者。[原文](https://javaguide.cn/ai/interview-questions/agent-interview-questions.html) · [固定源码](https://github.com/Snailclimb/JavaGuide/blob/d76264cb4e000416c4adca06770ce014bd309150/docs/ai/interview-questions/agent-interview-questions.md) · [Apache-2.0 与修改说明](/ai-study/sources.md)。本站于 2026-09-09 增加学习卡并适配排版、链接与媒体引用。

[学习首页](/ai-study/) · [闭卷复习](/ai-study/review.md) · [版本校准](/ai-study/version-notes.md)

::: warning 固定快照，不等于现行规范认证
正文版本、数字和第一人称案例保留其写作上下文。代码示例未逐一运行，外部图片直接显示在正文内，仍可通过原图入口查看细节；正文中的原站 include 片段未展开。个人学习与复习时请区分原作者案例、本站设计练习和自己的真实经历。
:::

## 学习与复习卡片 {#study-card}

### 30 秒速记

Agent 面试的分水岭在状态、授权、停止和恢复，不能停留在规划—调用—反思的术语循环。

### 在脑中走一遍链路

目标与任务状态 → 受控决策 → 工具意图 → 执行与结果 → 验证 → 继续/恢复/停止。

### 容易记错的边界

模型重新规划不代表可以绕过之前被拒绝的动作；换工具名称也不应改变资源权限。

### 闭卷自测：先回答，再展开

<details>
<summary>基础｜Agent 与 MCP、Skills 分别处在哪层？</summary>

Agent 管理任务控制，MCP 规范能力接入，Skills 组织可复用流程和资源。三者协作但没有一个自动提供完整业务可靠性。

</details>

<details>
<summary>P7｜工具超时后 Agent 应该相信什么？</summary>

相信持久化动作与下游查询到的状态，而不是从超时文本推断失败；有副作用的动作进入未知状态处理，不能另造动作重复执行。

</details>

<details>
<summary>P8｜多 Agent 重新分工会破坏什么约束？</summary>

可能重置预算、丢失授权范围、重复副作用或污染共享记忆。需要继承可验证的父任务范围、动作关联与累计预算。

</details>

### 动手或纸上推演

连续追问自己三次：为什么需要 Agent、出错怎么办、凭什么证明已完成。把答案落实到具体状态和接口。

深入对照：[本站 P7/P8 工程章节](/ai-agent/06-planning-execution-recovery.md)。官方/论文延伸：[LangGraph：Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)。

学习卡是本手册的概念整理与设计练习；练习数字不代表生产指标，练习也不代表已经执行通过。

## JavaGuide 正文学习 {#source-body}

Agent 接到任务后，需要读取上下文、决定下一步动作、调用工具、观察结果，再判断继续、结束还是交给人工。AI Agent 面试题基本沿着这条执行链路展开，Memory、MCP、Skills、Harness 和 Workflow 都可以放回链路中理解。

题目按 JavaGuide AI Agent 专题的章节分组。每组都附有详细文章，这里只整理考点和问题，不重复展开答案。

## Agent 基础

相关内容：[《AI Agent 核心概念：Agent Loop、Plan-and-Execute、A2A、Agentic Workflows、Tools 注册》](/ai-study/java-guide/agent/agent-basis.md)、[《多 Agent 协作系统设计：任务拆分、状态共享、冲突处理与失败恢复》](/ai-study/java-guide/agent/multi-agent.md)

这部分通常从 Agent 的定义开始，随后追问运行循环和编排方式。准备时要能分清 Chatbot、Workflow 与 Agent 在任务路径、状态和工具使用上的差别。

常见面试题：

- AI Agent 是什么？和普通 Chatbot 有什么区别？
- Agent = LLM + Planning + Memory + Tools 这条公式怎么理解？
- Agent Loop 的完整流程是什么？
- Agent 和传统编程、Workflow 的核心区别是什么？
- ReAct、Plan-and-Execute、Reflection、Multi-Agent 分别适合什么场景？
- Tools 注册时，工具 description 为什么很关键？
- 什么时候用纯 Agent，什么时候用 Workflow 或 Agentic Workflow？
- Multi-Agent 协作的主要问题是什么？为什么生产里不能盲目上多 Agent？

[原图：AI Agent 核心架构](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-core-arch.png)

[原图：Agent Loop 工作流程](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-loop-flow.png)

## Agent Memory

相关内容：[《AI Agent 记忆系统：短期记忆、长期记忆与记忆演化机制》](/ai-study/java-guide/agent/agent-memory.md)

Memory 题会追到信息从哪里来、保存多久、什么时候读取，以及出现过期或冲突后怎么处理。聊天记录、当前任务状态和跨会话记忆需要分别讨论。

常见面试题：

- Agent 的短期记忆和长期记忆有什么区别？
- Agent 记忆系统要解决哪些核心问题？
- 向量记忆和 Markdown 记忆分别适合什么场景？
- Auto Memory 是什么？它为什么不能无限自动写入？
- 哪些团队共享记忆适合走 Git 和 Code Review，哪些更适合数据库？
- 记忆压缩、记忆过期、记忆冲突应该怎么处理？
- 如何避免长期记忆污染上下文？
- 面试里怎么讲“有记忆”不是简单保存聊天记录？

[原图：Agent 记忆分类全景图](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-memory-taxonomy.svg)

## Prompt 与 Context Engineering

相关内容：[《大模型提示词工程（Prompt Engineering）是什么？提示词技巧有哪些？》](/ai-study/java-guide/agent/prompt-engineering.md)、[《上下文工程(Context Engineering) 是什么？和 Prompt Engineering 有什么区别？》](/ai-study/java-guide/agent/context-engineering.md)

Prompt 题关注指令如何表达，Context 题还会涉及历史状态、工具结果、检索证据和任务计划的装载。长任务中的裁剪、压缩和隔离也是常见追问。

常见面试题：

- Prompt Engineering 和 Context Engineering 有什么区别？
- Prompt 四要素 Role、Task、Context、Format 分别解决什么问题？
- Few-Shot、CoT、任务分解、结构化输出分别适合什么场景？
- Prompt 注入攻击是什么？常见防护方式有哪些？
- 为什么 Agent 场景下只优化 Prompt 不够？
- Context Engineering 要解决哪些问题？
- 静态规则、动态信息、工具结果、记忆应该如何进入上下文？
- 长任务上下文溢出时，Compaction、结构化笔记、Sub-agent 分别怎么用？

[原图：Prompt engineering vs. context engineering](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-vs-prompt-engineering.png)

## MCP 与 Agent Skills

相关内容：[《什么是 Model Context Protocol (MCP)？和 Function Calling、Agent 什么关系？》](/ai-study/java-guide/agent/mcp.md)、[《Agent Skills 是什么？和 Prompt、MCP 到底差在哪？》](/ai-study/java-guide/agent/skills.md)

Function Calling、MCP 和 Skills 位于不同环节：模型需要表达调用意图，宿主需要接入工具，Agent 还要加载完成任务所需的流程与资料。这组题经常继续追问权限、参数校验、超时和审计。

常见面试题：

- MCP 解决什么问题？为什么常被类比成 AI 领域的 USB-C？
- MCP Client、MCP Server、Host 分别是什么？
- MCP 的 Tools、Resources、Prompts 分别解决什么问题？
- MCP 和 Function Calling 有什么区别？
- 生产级 MCP Server 要做哪些安全治理？
- Agent Skills 是什么？它和 Prompt、MCP、Function Calling 的边界是什么？
- Skills 为什么要延迟加载？
- Skill 路由怎么做？为什么它和 RAG 相似但目标不同？
- 写一个 `SKILL.md` 最容易踩哪些坑？

## Harness Engineering

相关内容：[《Harness Engineering：六层检查框架、上下文管理与工程实践》](/ai-study/java-guide/agent/harness-engineering.md)

Harness Engineering 把注意力放到模型外部的执行环境，包括任务管理、上下文供给、工具反馈、验证和错误恢复。相关问题通常要求把这些抽象概念落到具体组件。

常见面试题：

- Harness Engineering 是什么？它和 Prompt Engineering、Context Engineering 有什么关系？
- 为什么说 Agent = Model + Harness？
- JavaGuide AI Agent 专题归纳的 Harness 六层检查框架分别解决什么问题？
- 模型能力升级后，Harness 里的某些机制为什么需要重新验证？
- 上下文污染、代码熵积累、工具调用可靠性分别怎么治理？
- Agent 工程里为什么需要评测器、验证器和任务状态管理？
- 一线团队做 Agent 工程化时，共同遇到的难点是什么？

[原图：Harness 和 Prompt/Context Engineering 的关系](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-engineering-layers-arch.png)

## Workflow、Graph 与 Loop

相关内容：[《AI 工作流中的 Workflow、Graph 与 Loop：从概念到实现》](/ai-study/java-guide/agent/workflow-graph-loop.md)

工作流题主要检查流程结构、状态保存和循环控制。除了解释 Node、Edge、State，还要准备中断恢复、并行更新和停止条件等工程问题。

常见面试题：

- 为什么 AI 系统需要工作流？
- Workflow、Graph、Loop 三者是什么关系？
- Graph Loop 和 Agent Loop 有什么区别？
- Loop 如何防止死循环？
- State 的更新策略怎么选？Replace、Append、Reducer 分别适合什么字段？
- 条件边和动态路由有什么区别？
- 工具调用失败时，哪些错误适合重试？认证失败和非幂等写操作怎么处理？
- 工作流中断后怎么恢复？
- 工作流有哪些特有的安全风险？

## 综合设计题

项目面试除了考概念，还会继续追问架构、选型依据、效果证据和线上失败。完整的回答组织方法可以参考 [《Agent 项目面试怎么讲？从系统架构、技术选型到 Badcase 复盘》](/ai-study/java-guide/interview-questions/agent-project-interview-guide.md)。

综合题会把前面的组件放进同一个任务里，重点检查选型和故障处理：

- 如果让 Agent 完成一次需要调用多个工具的长任务，你会如何拆分执行步骤？
- 哪些节点适合交给模型判断，哪些节点应该由规则或代码控制？
- Agent 的计划、工具结果和中间状态如何保存？中断后怎样恢复？
- 工具包含写操作时，权限、参数校验、二次确认和审计怎么设计？
- 什么情况下需要 Multi-Agent？如何控制通信成本和状态一致性？
- 你会记录哪些 Trace，并用哪些指标评估任务完成率、工具调用和执行轨迹？
