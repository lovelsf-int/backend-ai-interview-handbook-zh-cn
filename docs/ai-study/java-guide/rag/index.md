---
title: "RAG 专题：文档处理、向量数据库、GraphRAG、检索优化与知识库更新 · 学习版"
description: "RAG 导览：许可正文与个人复习"
status: "reviewing"
baseline: "JavaGuide source snapshot d76264cb4e000416c4adca06770ce014bd309150"
last_verified: "2026-09-09"
level: "学习 / 复习 / P7 / P8"
source: "JavaGuide Apache-2.0 许可正文；本手册独立学习卡"
source_commit: "d76264cb4e000416c4adca06770ce014bd309150"
source_blob: "aca2d67eec16ac5f41cf9762b162e5352e1367f6"
source_url: "https://javaguide.cn/ai/rag/"
---

# RAG 专题：文档处理、向量数据库、GraphRAG、检索优化与知识库更新

> 来源：JavaGuide / Guide 与原贡献者。[原文](https://javaguide.cn/ai/rag/) · [固定源码](https://github.com/Snailclimb/JavaGuide/blob/d76264cb4e000416c4adca06770ce014bd309150/docs/ai/rag/README.md) · [Apache-2.0 与修改说明](/ai-study/sources.md)。本站于 2026-09-09 增加学习卡并适配排版、链接与媒体引用。

[学习首页](/ai-study/) · [闭卷复习](/ai-study/review.md) · [版本校准](/ai-study/version-notes.md)

::: warning 固定快照，不等于现行规范认证
正文版本、数字和第一人称案例保留其写作上下文。代码示例未逐一运行，外部图片请点原图链接查看；正文中的原站 include 片段未展开。个人学习与复习时请区分原作者案例、本站设计练习和自己的真实经历。
:::

## JavaGuide 正文学习 {#source-body}

> 原站公共补充片段未展开；需要时请通过本页原文链接阅读。


RAG 不只有“文档切块 + 向量检索”。解析、权限、排序、生成、更新和评测都会影响最终答案。

这份 **RAG 专题** 面向企业知识库问答、智能客服、文档助手和内部搜索等场景，按文档进入系统后的真实链路展开：解析、清洗、切分、向量化、索引、召回、重排、生成、更新和评测。

## 适合谁看

- 正在学习或落地 RAG 知识库问答的开发者。
- 做过“文档切块 + 向量检索”Demo，但对召回质量、文档更新、一致性和评测不熟的工程师。
- 准备 RAG、向量数据库、GraphRAG、企业知识库相关面试题的同学。

## 学习重点

- RAG 的效果问题要分段排查：文档处理、Chunk、Embedding、召回、Rerank、上下文压缩和生成。
- 向量数据库选型要结合数据规模、过滤条件、更新频率、延迟要求和运维成本。
- GraphRAG 更适合实体关系强、全局问题多、需要跨文档推理的场景。
- 知识库更新不是简单覆盖文件，还要考虑版本、去重、增量索引、回滚和灰度。
- RAG 评测要同时看检索指标和生成指标，不能只凭最终回答是否“像那么回事”来判断。

## 建议阅读顺序

1. [RAG 基础概念：检索、生成与工程取舍](/ai-study/java-guide/rag/rag-basis.md)：先理解 RAG 的核心流程、优势和局限。
2. [RAG 文档处理与切分策略](/ai-study/java-guide/rag/rag-document-processing.md)：理解文档进入索引前的处理链路。
3. [RAG 向量索引算法和向量数据库](/ai-study/java-guide/rag/rag-vector-store.md)：补齐向量索引和数据库选型基础。
4. [RAG 优化：从召回、重排到上下文工程](/ai-study/java-guide/rag/rag-optimization.md)：掌握召回、重排、改写和上下文压缩。
5. [GraphRAG：用图结构补充向量检索](/ai-study/java-guide/rag/graphrag.md)、[RAG 知识库文档更新策略](/ai-study/java-guide/rag/rag-knowledge-update.md)：进一步理解复杂知识组织和持续更新。

## 核心文章

- [RAG 基础概念：检索、生成与工程取舍](/ai-study/java-guide/rag/rag-basis.md)：理解 RAG 的工作流程、适用场景和局限性。
- [RAG 文档处理与切分策略](/ai-study/java-guide/rag/rag-document-processing.md)：涵盖文件解析、清洗、结构化、Chunking 策略与多模态内容处理。
- [RAG 向量索引算法和向量数据库](/ai-study/java-guide/rag/rag-vector-store.md)：掌握 HNSW、IVFFLAT 等索引算法原理，学会选择合适的向量数据库。
- [RAG 优化：从召回、重排到上下文工程](/ai-study/java-guide/rag/rag-optimization.md)：围绕 Chunk 策略、Hybrid Search、Query Rewrite、Rerank、上下文压缩排查召回问题。
- [GraphRAG：用图结构补充向量检索](/ai-study/java-guide/rag/graphrag.md)：理解知识图谱驱动的 RAG，掌握实体、关系、社区发现、全局检索与局部检索。
- [RAG 知识库文档更新策略](/ai-study/java-guide/rag/rag-knowledge-update.md)：涵盖增量更新、版本回滚、去重与灰度发布。

## 高频问题

- RAG 为什么还会幻觉？应该从哪些环节排查？
- Chunk 切大还是切小？如何处理标题、表格、代码块和多模态内容？
- 向量检索、关键词检索、混合检索分别适合什么场景？
- Rerank 的作用是什么？什么时候值得引入？
- GraphRAG 和普通 RAG 有什么区别？
- 知识库更新如何保证一致性、可回滚和不停机？
- RAG 应用如何评测召回质量和最终回答质量？

## 相关专题

- [AI 应用开发知识体系](https://javaguide.cn/ai)
- [大模型基础专题](https://javaguide.cn/ai/llm-basis)
- [AI Agent 专题](https://javaguide.cn/ai/agent)
- [AI 应用开发面试题专题](https://javaguide.cn/ai/interview-questions)


> 原站公共补充片段未展开；需要时请通过本页原文链接阅读。
