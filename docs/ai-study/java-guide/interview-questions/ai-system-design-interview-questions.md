---
title: "AI 系统设计面试题总结 · 学习版"
description: "AI 系统设计自测：许可正文与个人复习"
status: "reviewing"
baseline: "JavaGuide source snapshot d76264cb4e000416c4adca06770ce014bd309150"
last_verified: "2026-09-09"
level: "学习 / 复习 / P7 / P8"
source: "JavaGuide Apache-2.0 许可正文；本手册独立学习卡"
source_commit: "d76264cb4e000416c4adca06770ce014bd309150"
source_blob: "7f136f07144c7ab6d5bb6b439174028e32eee9f2"
source_url: "https://javaguide.cn/ai/interview-questions/ai-system-design-interview-questions.html"
---

# AI 系统设计面试题总结

> 来源：JavaGuide / Guide 与原贡献者。[原文](https://javaguide.cn/ai/interview-questions/ai-system-design-interview-questions.html) · [固定源码](https://github.com/Snailclimb/JavaGuide/blob/d76264cb4e000416c4adca06770ce014bd309150/docs/ai/interview-questions/ai-system-design-interview-questions.md) · [Apache-2.0 与修改说明](/ai-study/sources.md)。本站于 2026-09-09 增加学习卡并适配排版、链接与媒体引用。

[学习首页](/ai-study/) · [闭卷复习](/ai-study/review.md) · [版本校准](/ai-study/version-notes.md)

::: warning 固定快照，不等于现行规范认证
正文版本、数字和第一人称案例保留其写作上下文。代码示例未逐一运行，外部图片请点原图链接查看；正文中的原站 include 片段未展开。个人学习与复习时请区分原作者案例、本站设计练习和自己的真实经历。
:::

## 学习与复习卡片 {#study-card}

### 30 秒速记

系统设计的答案是约束下的取舍，不是画满组件。把质量、容量、成本、安全和一致性一起讨论。

### 在脑中走一遍链路

澄清目标 → 量化假设 → 主链路 → 关键状态 → 失败路径 → 指标与验证 → 演进条件。

### 容易记错的边界

没有实测数据时要标成假设或压测起点；不能把设计目标当作已有生产成绩。

### 闭卷自测：先回答，再展开

<details>
<summary>基础｜如何区分控制流成功和业务成功？</summary>

控制流成功说明步骤运行到预定位置；业务成功需要满足目标的后置条件，例如下游状态已确认。两者用不同状态和指标记录。

</details>

<details>
<summary>P7｜大量租户同时调用模型，首先控制什么？</summary>

入口配额、并发、队列长度、请求截止时间与累计预算，并区分租户优先级和下游容量。不要只依赖更大线程池。

</details>

<details>
<summary>P8｜关键依赖故障时如何定义降级？</summary>

按任务风险区分可返回的部分结果、可用替代模型和必须暂停的动作；权限与审批不能因可用性故障而放松，恢复后要对账。

</details>

### 动手或纸上推演

用一页纸回答 SOC 研判服务设计题，强制包含一个容量估算、一个故障时间线和一个被否决的替代方案。

深入对照：[本站 P7/P8 工程章节](/ai-agent/12-system-design-project-deep-dive.md)。官方/论文延伸：[Anthropic：Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)。

学习卡是本手册的概念整理与设计练习；练习数字不代表生产指标，练习也不代表已经执行通过。

## JavaGuide 正文学习 {#source-body}

AI 系统设计题通常从一个具体场景开始，例如企业知识库、智能客服、Agent 平台或实时语音助手。随着问题展开，面试官会继续追问模型调用、上下文、检索、工具、安全、成本和评测如何放进同一条生产链路。

题目按 JavaGuide AI 系统设计专题的内容分组。每组都附有详细文章，这里只整理常见问题，具体方案和实现细节放在对应原文中。

## 生产级 AI 应用架构

相关内容：[《AI 应用系统设计：从 Prompt Demo 到生产级架构》](/ai-study/java-guide/system-design/ai-application-architecture.md)

架构题会从一次请求的完整链路问起，随后检查各个模块的职责，以及同步、流式和异步任务应该如何选择。Prompt、RAG、Memory 和 Tool 也需要放在各自负责的环节中讨论。

常见面试题：

- Prompt Demo 到生产系统之间有哪些工程差距？
- 如何设计一个生产级 AI 应用的整体架构？
- 一次 AI 请求从接入到返回结果，会经过哪些模块？
- 入口层、编排层、Prompt/Context、RAG/Memory/Tool、模型网关和评测观测分别负责什么？
- 同步返回、流式返回和异步任务分别适合什么场景？
- Prompt 为什么要做版本管理？模板、变量和模型版本应该如何关联？
- RAG、Memory 和 Tool 分别管理什么信息？为什么要分开治理？
- 长任务的中间状态如何保存？服务重启后怎么恢复？
- 为了支持问题回放，一次请求至少要记录哪些数据？

## 模型网关与调用治理

相关内容：[《大模型网关详解：统一接入、模型路由、限流配额与成本治理》](/ai-study/java-guide/system-design/llm-gateway.md)、[《大模型 API 调用工程实践：流式输出、重试、限流与结构化返回》](/ai-study/java-guide/llm-basis/llm-api-engineering.md)

模型网关题主要检查多供应商接入、模型路由和故障处理。限流除了请求数，还会涉及 Token、并发、租户预算和上游配额。

常见面试题：

- 为什么生产环境需要 LLM Gateway？业务服务直接调用模型 API 有哪些问题？
- LLM Gateway 和 LLM Router 有什么区别？
- 模型网关通常要承担哪些能力？
- 多个模型供应商的请求参数、响应格式和错误码如何统一？
- 模型路由可以参考哪些信息？如何避免把请求分配给不合适的模型？
- 大模型限流为什么要同时看 RPM、TPM、并发数和租户预算？
- 哪些模型调用错误适合重试？哪些错误应该直接失败？
- 如何设计模型 fallback？哪些任务不能自动降级？
- Token 成本如何归因到租户、用户、功能、模型和 Prompt 版本？
- 模型网关会增加多少延迟？哪些处理适合放在网关中？
- 语义缓存适合哪些请求？如何处理数据时效和权限隔离？
- 如果让你设计一个生产级 LLM Gateway，你会如何拆分模块？

## 安全、权限与审计

相关内容：[《LLM/Agent 安全实战：从 Prompt Injection、工具越权到沙箱隔离》](/ai-study/java-guide/system-design/llm-security.md)、[《AI 应用系统设计：从 Prompt Demo 到生产级架构》](/ai-study/java-guide/system-design/ai-application-architecture.md)、[《大模型结构化输出：从 JSON 契约到 Function Calling 落地》](/ai-study/java-guide/llm-basis/structured-output-function-calling.md)

模型可以生成工具调用意图和参数，真正的业务操作仍由后端执行。这组题会继续追问身份、资源、参数、操作风险和审计记录应该在哪里校验。

常见面试题：

- Tool Calling 的安全边界在哪里？
- 为什么工具 description 和 Prompt 不能替代后端权限校验？
- 高风险工具调用为什么需要二次确认？
- 写操作如何处理幂等、超时和结果不确定的问题？
- Prompt 注入攻击在系统设计层面怎么防？
- RAG 检索如何避免召回当前用户无权查看的内容？
- PII 脱敏应该放在输入、日志、模型调用还是输出环节？
- 工具调用审计日志应该记录哪些字段？
- 模型生成的结构化参数通过 Schema 校验后，为什么还不能直接执行？

## 可观测、评测与发布

相关内容：[《AI 应用评测体系：从 Golden Set 构建到线上灰度闭环》](/ai-study/java-guide/llm-basis/llm-evaluation.md)、[《AI 应用系统设计：从 Prompt Demo 到生产级架构》](/ai-study/java-guide/system-design/ai-application-architecture.md)

AI 应用的发布检查除了接口是否成功，还要覆盖答案质量、检索结果、工具轨迹和结构化输出。模型、Prompt、检索配置和代码发生变化时，都需要能够比较和回滚。

常见面试题：

- AI 应用的可观测指标应该包括哪些内容？
- 为什么没有评测集就很难判断一次改动是否有效？
- Golden Set 如何覆盖正常路径、边缘场景、对抗样本和高风险失败？
- 离线评测、Trace 回放和线上灰度分别解决什么问题？
- RAG、Agent 和结构化输出为什么不能共用一套评测指标？
- LLM-as-Judge 有哪些偏差？如何用人工抽样和规则校验进行校准？
- CI 中的 AI 评测如何控制成本和运行时间？
- 评测记录为什么要绑定模型、Prompt、检索配置和代码版本？
- 线上质量下降时，如何区分模型、Prompt、检索、工具和数据分布问题？
- AI 应用如何设计灰度、回滚和失败样本回流？

## 实时语音 Agent

相关内容：[《AI 语音技术详解：从 ASR、TTS 到实时语音 Agent 的工程化落地》](/ai-study/java-guide/system-design/ai-voice.md)

实时语音系统把音频采集、VAD、ASR、LLM、工具调用、TTS 和播放串在一起。相关问题主要集中在端到端延迟、打断处理、状态管理和端云选型。

常见面试题：

- 如何设计一个实时语音 Agent？
- ASR、LLM、TTS 和 VAD 在语音系统中分别负责什么？
- 实时语音 Agent 的端到端延迟主要来自哪些环节？
- 用户打断时，系统如何取消播放、停止生成并更新上下文？
- `listening`、`thinking`、`speaking`、`interrupted` 等状态如何管理？
- 级联式 ASR + LLM + TTS 和原生 Speech-to-Speech 模型各有什么优缺点？
- 云端 API、本地模型和端云混合方案怎么选？
- 浏览器端音频前处理会影响哪些指标？
- 语音 Agent 的可观测数据应该包括哪些内容？

## 综合设计题

- 如何设计一个多 Agent 系统，让它支持任务拆分、并行执行、状态共享、冲突处理和失败恢复？参考：[《多 Agent 协作系统设计：任务拆分、状态共享、冲突处理与失败恢复》](/ai-study/java-guide/agent/multi-agent.md)
- 如何设计一个带权限控制、引用溯源和知识库更新能力的企业 RAG 系统？
- 如何设计一个支持长任务、工具调用、中断恢复和人工接管的 Agent 平台？
- 智能客服流量突然增加，同时模型供应商开始限流，系统应该如何排队、降级和保护核心请求？
- 模型或 Prompt 升级后，结构化输出成功率和答案质量下降，如何定位并回滚？
- Agent 可以查询订单并发起退款时，权限、参数校验、二次确认、幂等和审计怎么设计？
- 如何设计一个支持实时打断、低延迟和故障降级的语音客服系统？
