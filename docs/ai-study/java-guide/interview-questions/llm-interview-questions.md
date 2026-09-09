---
title: "大模型基础面试题总结 · 学习版"
description: "LLM 基础自测题库：许可正文与个人复习"
status: "reviewing"
baseline: "JavaGuide source snapshot d76264cb4e000416c4adca06770ce014bd309150"
last_verified: "2026-09-09"
level: "学习 / 复习 / P7 / P8"
source: "JavaGuide Apache-2.0 许可正文；本手册独立学习卡"
source_commit: "d76264cb4e000416c4adca06770ce014bd309150"
source_blob: "0b7836f81b2d170ae1986bc08e6f92a67a5af754"
source_url: "https://javaguide.cn/ai/interview-questions/llm-interview-questions.html"
---

# 大模型基础面试题总结

> 来源：JavaGuide / Guide 与原贡献者。[原文](https://javaguide.cn/ai/interview-questions/llm-interview-questions.html) · [固定源码](https://github.com/Snailclimb/JavaGuide/blob/d76264cb4e000416c4adca06770ce014bd309150/docs/ai/interview-questions/llm-interview-questions.md) · [Apache-2.0 与修改说明](/ai-study/sources.md)。本站于 2026-09-09 增加学习卡并适配排版、链接与媒体引用。

[学习首页](/ai-study/) · [闭卷复习](/ai-study/review.md) · [版本校准](/ai-study/version-notes.md)

::: warning 固定快照，不等于现行规范认证
正文版本、数字和第一人称案例保留其写作上下文。代码示例未逐一运行，外部图片直接显示在正文内，仍可通过原图入口查看细节；正文中的原站 include 片段未展开。个人学习与复习时请区分原作者案例、本站设计练习和自己的真实经历。
:::

## 学习与复习卡片 {#study-card}

### 30 秒速记

围绕输入预算、生成过程、结构化契约与评测做自测，把参数知识还原为可观察的行为。

### 在脑中走一遍链路

解释参数 → 判断失败类型 → 设计最小实验 → 解释结果 → 给出有条件的工程策略。

### 容易记错的边界

不要承诺只调一个采样参数就没有幻觉；也不要把 API 成功率当答案准确率。

### 闭卷自测：先回答，再展开

<details>
<summary>基础｜结构化输出成功说明什么，不说明什么？</summary>

说明输出满足了相应格式约束，不说明字段事实正确、引用充分或操作已获授权；仍需业务验证。

</details>

<details>
<summary>P7｜长输入返回被截断，如何分析？</summary>

核算系统指令、历史、工具描述、检索资料与输出预留，查看提供方的终止或错误状态，再按任务优先级压缩，而不是盲目加输出长度。

</details>

<details>
<summary>P8｜模型升级只跑几个例子够吗？</summary>

需要版本化回归集，覆盖格式、事实、工具、安全、成本和尾延迟，保留对照与回滚路径；少量成功例子不能代表整个业务分布。

</details>

### 动手或纸上推演

闭卷回答本篇后，把错误分为概念错误、边界遗漏和缺少验证三类，每类至少找一个最小例子。

深入对照：[本站 P7/P8 工程章节](/ai-agent/01-llm-agent-basics.md)。官方/论文延伸：[Spring AI：Tool Calling](https://docs.spring.io/spring-ai/reference/api/tools.html)。

学习卡是本手册的概念整理与设计练习；练习数字不代表生产指标，练习也不代表已经执行通过。

## JavaGuide 正文学习 {#source-body}

一次大模型调用从 Token 化开始，经过上下文组装和采样生成，再由后端处理流式返回、限流、重试、结构化解析和日志。基础面试题会沿着这条调用链路追问成本、延迟、稳定性和安全问题。

题目按 JavaGuide 大模型基础专题的章节分组，详细原理和工程示例放在对应文章中。这里保留考点和问题，方便集中复习。

## LLM 运行机制

相关内容：[《LLM 运行机制：Token、上下文窗口与采样参数怎么影响输出》](/ai-study/java-guide/llm-basis/llm-operation-mechanism.md)

Token、上下文窗口和采样参数共同影响一次调用能放入多少信息、花费多少资源，以及输出会有多大波动。这组题经常结合长对话、RAG 证据和结构化输出继续追问。

常见面试题：

- Token 是什么？为什么中文、英文、代码消耗的 Token 不一样？
- 上下文窗口是什么？上下文窗口越大，效果一定越好吗？
- 什么是 Lost in the Middle 问题？长上下文场景下怎么缓解？
- Temperature、Top-P、Top-K 分别控制什么？生产环境怎么设置更稳？
- 为什么 Temperature 设置为 0，模型输出仍然可能不完全一致？
- 大模型为什么会产生幻觉？常见缓解方案有哪些？
- Token 预算怎么估算？输入、输出、历史消息、RAG 证据如何取舍？
- 长上下文窗口会不会取代 RAG？二者分别适合什么场景？

[原图：Token 化过程示例](https://oss.javaguide.cn/github/javaguide/ai/llm/llm-token-process.png)

## API 调用工程

相关内容：[《大模型 API 调用工程实践：流式输出、重试、限流与结构化返回》](/ai-study/java-guide/llm-basis/llm-api-engineering.md)

模型 API 的响应时间、计费方式和错误类型都与普通业务接口有所不同。面试中通常会把 Streaming、重试、幂等、限流和模型网关放在一条调用链里考察。

常见面试题：

- 大模型 API 调用的完整链路是什么？
- Streaming 为什么能改善用户体验？它能减少总耗时和 Token 成本吗？
- SSE、WebSocket、HTTP Chunked 在流式输出场景下怎么选？
- 哪些大模型 API 错误可以重试？哪些错误不能重试？
- 为什么大模型调用必须做幂等？
- 大模型限流为什么不能只按 QPS 做？
- 模型网关通常要承担哪些能力？
- AI 应用的调用日志里至少要记录哪些字段？

## 结构化输出与工具调用

相关内容：[《大模型结构化输出：从 JSON 契约到 Function Calling 落地》](/ai-study/java-guide/llm-basis/structured-output-function-calling.md)

模型输出只要进入业务系统，就要处理格式校验、字段约束和执行权限。这里容易混淆 JSON Mode、Structured Outputs、Function Calling、MCP Tool 与普通 HTTP API。

常见面试题：

- 为什么只写“请返回 JSON”不可靠？
- JSON Mode 和 Structured Outputs 有什么区别？
- JSON Schema 在大模型应用里解决什么问题？
- Function Calling 的完整链路是什么？
- Function Calling 和 MCP 有什么区别？
- MCP Tool 和普通 HTTP API 有什么关系？
- Agent Skill 和 Function Calling 是一回事吗？
- 结构化输出失败后怎么处理？
- 工具调用为什么必须做安全治理？
- 面试里怎么一句话概括结构化输出？

## AI 应用评测

相关内容：[《AI 应用评测体系：从 Golden Set 构建到线上灰度闭环》](/ai-study/java-guide/llm-basis/llm-evaluation.md)

评测题关注如何证明一次模型、Prompt 或系统改动确实带来了改善。Golden Set、LLM-as-Judge、Trace 回放和线上灰度分别覆盖不同阶段，不能只看公开榜单或少量演示样例。

常见面试题：

- 为什么不能只靠公开 benchmark 评估 AI 应用质量？
- Golden Set 应该怎么构建？冷启动阶段没有生产日志怎么办？
- LLM-as-Judge 有哪些主要偏差？怎么缓解？
- RAG 评测为什么必须分检索和生成两段？
- Agent 评测为什么比普通问答和 RAG 更复杂？
- 离线评测、Trace 回放、线上灰度分别解决什么问题？
- CI 里的 AI 评测如何平衡速度和覆盖度？
- 如果 LLM-as-Judge 和人工评测结果不一致，应该怎么处理？

## 综合场景题

- 客服机器人历史会话持续增长时，如何分配 Token 预算并保留关键业务状态？
- 流式响应中途断开后，服务端如何处理重试、续传和重复计费问题？
- 上游模型触发 RPM 或 TPM 限制时，模型网关如何排队、降级或切换模型？
- 模型生成退款工具的调用参数后，业务系统还需要执行哪些校验？
- 更换模型或修改 Prompt 后，如何用离线评测、Trace 回放和线上灰度验证效果？
