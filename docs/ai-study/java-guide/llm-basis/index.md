---
title: "大模型基础专题：运行机制、API 调用、结构化输出与评测 · 学习版"
description: "大模型基础导览：许可正文与个人复习"
status: "reviewing"
baseline: "JavaGuide source snapshot d76264cb4e000416c4adca06770ce014bd309150"
last_verified: "2026-09-09"
level: "学习 / 复习 / P7 / P8"
source: "JavaGuide Apache-2.0 许可正文；本手册独立学习卡"
source_commit: "d76264cb4e000416c4adca06770ce014bd309150"
source_blob: "af88a4727a0c4c50d5ad35483e539ba5239220f4"
source_url: "https://javaguide.cn/ai/llm-basis/"
---

# 大模型基础专题：运行机制、API 调用、结构化输出与评测

> 来源：JavaGuide / Guide 与原贡献者。[原文](https://javaguide.cn/ai/llm-basis/) · [固定源码](https://github.com/Snailclimb/JavaGuide/blob/d76264cb4e000416c4adca06770ce014bd309150/docs/ai/llm-basis/README.md) · [Apache-2.0 与修改说明](/ai-study/sources.md)。本站于 2026-09-09 增加学习卡并适配排版、链接与媒体引用。

[学习首页](/ai-study/) · [闭卷复习](/ai-study/review.md) · [版本校准](/ai-study/version-notes.md)

::: warning 固定快照，不等于现行规范认证
正文版本、数字和第一人称案例保留其写作上下文。代码示例未逐一运行，外部图片直接显示在正文内，仍可通过原图入口查看细节；正文中的原站 include 片段未展开。个人学习与复习时请区分原作者案例、本站设计练习和自己的真实经历。
:::

## JavaGuide 正文学习 {#source-body}

> 原站公共补充片段未展开；需要时请通过本页原文链接阅读。


大模型 API 看起来只是一段请求和一段返回，实际落地时问题都藏在细节里：Token 怎么花掉、上下文为什么塞不下、采样参数会不会让答案飘、结构化输出为什么偶发失败、上线前怎么证明效果真的变好了。

这份 **大模型基础专题** 面向 AI 应用开发入门和工程落地，先把这些基础问题讲清楚，再进入 Agent、RAG 和系统设计会顺很多。

## 适合谁看

- 正在学习 LLM 基础概念和大模型 API 调用的开发者。
- 做过 Prompt Demo，但对生产级调用链路、结构化输出和评测不熟的工程师。
- 准备大模型基础、Function Calling、Tool Calling、AI 应用评测相关面试题的同学。

## 学习重点

- Token、上下文窗口、Temperature、Top P、停止词等参数如何影响模型输出。
- 生产级大模型 API 调用需要处理流式响应、超时、重试、限流、fallback、日志和审计。
- 结构化输出不能只靠 Prompt，还要结合 JSON Schema、Function Calling、Tool Calling 和服务端校验；即便这样，也要准备失败兜底。
- AI 应用评测要区分离线 Golden Set、LLM-as-Judge、线上灰度、Trace 回放和持续回归。

## 建议阅读顺序

1. [LLM 运行机制：Token、上下文窗口与采样参数怎么影响输出](/ai-study/java-guide/llm-basis/llm-operation-mechanism.md)：先理解 Token、上下文窗口和采样参数。
2. [大模型 API 调用工程实践](/ai-study/java-guide/llm-basis/llm-api-engineering.md)：再看大模型调用如何接入真实后端链路。
3. [大模型结构化输出详解](/ai-study/java-guide/llm-basis/structured-output-function-calling.md)：补齐结构化返回和工具调用基础。
4. [AI 应用评测体系](/ai-study/java-guide/llm-basis/llm-evaluation.md)：最后建立质量评估和上线回归方法。

## 核心文章

- [LLM 运行机制：Token、上下文窗口与采样参数怎么影响输出](/ai-study/java-guide/llm-basis/llm-operation-mechanism.md)：把 Token、上下文窗口、Temperature 等概念还原为可观察、可调试的工程参数。
- [大模型 API 调用工程实践](/ai-study/java-guide/llm-basis/llm-api-engineering.md)：拆解 AI 应用调用大模型 API 的生产链路，覆盖流式输出、重试、限流、结构化返回与后端工程落地。
- [大模型结构化输出详解](/ai-study/java-guide/llm-basis/structured-output-function-calling.md)：讲清 JSON Schema、Function Calling、Tool Calling 与 MCP 在一次工具调用里分别负责什么。
- [AI 应用评测体系](/ai-study/java-guide/llm-basis/llm-evaluation.md)：从 Golden Set、LLM-as-Judge、RAG/Agent 指标、Trace 回放到 CI 回归，说明 AI 应用该怎么验收。

## 高频问题

- 为什么同一个 Prompt 每次输出不一样？
- 上下文窗口变大是不是就一定更好？
- 为什么结构化输出会偶发失败？如何做兜底和校验？
- Function Calling、Tool Calling、MCP 分别解决什么问题？
- AI 应用上线前如何证明“效果变好了”而不是只凭感觉？

## 相关专题

- [AI 应用开发知识体系](https://javaguide.cn/ai)
- [AI Agent 专题](https://javaguide.cn/ai/agent)
- [RAG 专题](https://javaguide.cn/ai/rag)
- [AI 应用开发面试题专题](https://javaguide.cn/ai/interview-questions)


> 原站公共补充片段未展开；需要时请通过本页原文链接阅读。
