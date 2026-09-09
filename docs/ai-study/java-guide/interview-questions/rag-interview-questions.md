---
title: "RAG 面试题总结 · 学习版"
description: "RAG 自测题库：许可正文与个人复习"
status: "reviewing"
baseline: "JavaGuide source snapshot d76264cb4e000416c4adca06770ce014bd309150"
last_verified: "2026-09-09"
level: "学习 / 复习 / P7 / P8"
source: "JavaGuide Apache-2.0 许可正文；本手册独立学习卡"
source_commit: "d76264cb4e000416c4adca06770ce014bd309150"
source_blob: "79ca032795a7b87bb1e419eb95b805d3b76acedd"
source_url: "https://javaguide.cn/ai/interview-questions/rag-interview-questions.html"
---

# RAG 面试题总结

> 来源：JavaGuide / Guide 与原贡献者。[原文](https://javaguide.cn/ai/interview-questions/rag-interview-questions.html) · [固定源码](https://github.com/Snailclimb/JavaGuide/blob/d76264cb4e000416c4adca06770ce014bd309150/docs/ai/interview-questions/rag-interview-questions.md) · [Apache-2.0 与修改说明](/ai-study/sources.md)。本站于 2026-09-09 增加学习卡并适配排版、链接与媒体引用。

[学习首页](/ai-study/) · [闭卷复习](/ai-study/review.md) · [版本校准](/ai-study/version-notes.md)

::: warning 固定快照，不等于现行规范认证
正文版本、数字和第一人称案例保留其写作上下文。代码示例未逐一运行，外部图片直接显示在正文内，仍可通过原图入口查看细节；正文中的原站 include 片段未展开。个人学习与复习时请区分原作者案例、本站设计练习和自己的真实经历。
:::

## 学习与复习卡片 {#study-card}

### 30 秒速记

先讲离线索引和在线查询，再解释切分、混合检索、重排、更新与评测。每个优化都要能给出反例。

### 在脑中走一遍链路

原始文档与权限 → 索引版本 → 查询与过滤 → 候选与排序 → 证据上下文 → 回答和引用 → 反馈。

### 容易记错的边界

向量相似度不是事实置信度；检索 Recall 高也不证明最终答案正确。

### 闭卷自测：先回答，再展开

<details>
<summary>基础｜新的短告警要不要先切成多个 Chunk？</summary>

通常先作为结构化查询与检索条件；知识文档才按长度和语义切分。告警附带长日志或附件时，可单独处理这些材料。

</details>

<details>
<summary>P7｜用户反馈引用了旧制度，怎么排查？</summary>

核对源文档版本、生效时间、索引任务、切片版本、查询过滤、答案缓存与引用详情接口，找出旧版本在哪一层继续可见。

</details>

<details>
<summary>P8｜混合检索如何兼顾质量与租户隔离？</summary>

各召回分支都受权限限制，融合和重排前不泄露越权内容；缓存、引用与评测集也按作用域隔离。不能用先全量召回后输出删掉来替代访问控制。

</details>

### 动手或纸上推演

给一次 RAG 错答保存一份定位单：正确证据、实际候选、排序、最终上下文、模型输出、索引和 Prompt 版本。

深入对照：[本站 P7/P8 工程章节](/ai-agent/05-rag-knowledge-engineering.md)。官方/论文延伸：[Elastic：Hybrid search](https://www.elastic.co/docs/solutions/search/hybrid-search)。

学习卡是本手册的概念整理与设计练习；练习数字不代表生产指标，练习也不代表已经执行通过。

## JavaGuide 正文学习 {#source-body}

一条 RAG 链路要处理文档解析、Chunk、Embedding、索引、召回、重排、上下文组装和生成。系统运行一段时间后，还会遇到文档版本、权限变化、索引重建和效果评测等问题。题目按 JavaGuide RAG 专题的章节分组，每组都附有详细文章。

## RAG 基础

相关内容：[《RAG 基础概念：检索、生成与工程取舍》](/ai-study/java-guide/rag/rag-basis.md)

基础题围绕 RAG 的工作流程和适用场景展开，也会与传统搜索、微调和长上下文做比较。幻觉、引用和拒答通常会作为后续追问。

常见面试题：

- 什么是 RAG？为什么需要 RAG？
- RAG 和传统搜索引擎有什么区别？
- RAG 和微调怎么选？什么时候用 RAG，什么时候微调，什么时候两者结合？
- RAG 系统中 Embedding 模型怎么选？为什么？
- 余弦相似度、内积和欧氏距离有什么区别？
- RAG 的幻觉问题怎么解决？RAG 一定不会产生幻觉吗？
- 什么是 Lost in the Middle 问题？怎么应对？
- 长上下文窗口是否会取代 RAG？
- RAG 系统的评估指标有哪些？
- RAG 的优势和局限性是什么？
- 什么场景适合用 RAG？什么场景不适合？

## 向量数据库与索引

相关内容：[《RAG 向量索引算法和向量数据库》](/ai-study/java-guide/rag/rag-vector-store.md)

向量检索题会从 Embedding 和距离度量问到 ANN 索引，再落到数据规模、查询延迟、过滤条件和运维成本。只记产品名称很难应对后续的选型追问。

常见面试题：

- 什么是 Embedding？为什么需要把文本转成向量？
- RAG 场景为什么需要向量数据库？
- ANN 算法为什么可以接受不是 100% 精确的结果？
- 有哪些向量索引算法？各自优缺点是什么？
- Flat、HNSW、IVFFLAT、IVF-PQ 分别适合什么场景？
- HNSW 和 IVFFLAT 有什么区别？
- HNSW 的 `ef_search` 参数怎么调？调大和调小分别会怎样？
- 向量数据库和传统数据库最核心的区别是什么？
- 如果向量数据从 100 万增长到 1 亿，架构上需要做什么调整？
- 为什么选择 PostgreSQL + pgvector？什么时候应该换专业向量数据库？

## 文档处理与 Chunk 策略

相关内容：[《RAG 文档处理与切分策略：从解析、清洗、Chunking 到多模态内容处理》](/ai-study/java-guide/rag/rag-document-processing.md)

文档进入索引前要经过解析、清洗、结构化、切分和元数据补全。Chunk 的大小只是其中一个参数，标题层级、表格、代码、页码、版本和权限同样会影响后面的召回。

常见面试题：

- RAG 文档处理管线通常包含哪些步骤？
- 文档解析、清洗、结构化分别解决什么问题？
- Chunk 切分为什么不能只按固定长度切？
- Chunk 大小、Overlap、语义边界应该怎么取舍？
- 表格、代码块、图片、多模态内容进入 RAG 前怎么处理？
- 文档处理阶段如何保留标题层级、页码、来源和权限元数据？
- Chunk 质量差会带来哪些召回和生成问题？
- 如何从零搭建一套企业级文档处理管线？

## RAG 检索优化

相关内容：[《RAG 优化：从召回、重排到上下文工程》](/ai-study/java-guide/rag/rag-optimization.md)

检索优化题要先区分召回、排序、上下文和生成问题。Hybrid Search、Query Rewrite、Rerank 和上下文压缩处理的故障位置不同，不能用同一个手段解决所有失败样本。

常见面试题：

- RAG 召回率低应该怎么排查？
- Chunk 策略、Metadata、Hybrid Search、Query Rewrite、Rerank 分别解决什么问题？
- Hybrid Search 是什么？BM25 和向量检索怎么融合？
- Query Rewrite、HyDE、Self-Query 分别适合什么场景？
- Rerank 解决什么问题？为什么不能只依赖向量相似度排序？
- 上下文压缩有什么价值？什么时候会伤害答案质量？
- RAG 优化为什么必须先建立失败样本集？
- 线上 RAG 出现“答非所问”，应该按什么路径定位？

## GraphRAG

相关内容：[《GraphRAG：用图结构补充向量检索》](/ai-study/java-guide/rag/graphrag.md)

GraphRAG 题集中在实体关系、多跳推理和全局问题，也会追问实体关系如何抽取、社区摘要如何生成、权限如何过滤，以及后续更新需要多少成本。选型时还要对照业务问题和现有检索链路。

常见面试题：

- GraphRAG 解决什么问题？和标准向量 RAG 有什么区别？
- 为什么说 Chunk 是信息孤岛？
- 向量相似度为什么不擅长多跳推理？
- GraphRAG 中实体、关系、社区发现分别是什么？
- 全局检索和局部检索有什么区别？
- GraphRAG 的社区摘要有什么价值？它的成本在哪里？
- GraphRAG 如何做权限过滤？
- 什么场景适合 GraphRAG？什么场景不适合？
- 成熟系统为什么会组合关键词检索、向量检索、多向量检索和图检索？

## 知识库更新与评测

相关内容：[《RAG 知识库文档如何更新：增量更新、版本控制、去重与全量重建》](/ai-study/java-guide/rag/rag-knowledge-update.md)、[《AI 应用评测体系：从 Golden Set 构建到线上灰度闭环》](/ai-study/java-guide/llm-basis/llm-evaluation.md)

知识库上线后，文档、权限、Embedding 模型和 Chunk 策略都会变化。更新题关注数据与索引如何保持一致，评测题则要求把检索质量和生成质量分开观察。

常见面试题：

- RAG 知识库为什么不能只新增不删除？
- 增量更新和全量重建怎么选？
- Embedding 模型升级后，为什么通常需要重建索引？
- Chunk 策略变更会影响哪些历史数据？
- 如何避免同一文档多个版本同时被召回？
- 知识库更新如何做灰度、回滚和审计？
- RAG 评测为什么要分检索质量和生成质量？
- MRR、NDCG、Recall@K、Context Precision、Faithfulness 分别衡量什么？

## 综合排查题

- 原始文档已经入库，但相关问题始终召回不到正确 Chunk，你会从哪些环节开始检查？
- 正确文档进入了候选池，却总是排在 TopK 之外，应该调整召回还是引入 Rerank？
- 检索结果正确，模型仍然引用了错误片段，如何检查上下文顺序、截断和指令约束？
- 同一份文档的新旧版本被同时召回，数据和索引更新链路可能出了什么问题？
- 只有最终答案好坏的评分时，如何判断问题出在检索还是生成？
- 某类问题需要跨多篇文档查关系，如何判断应该优化向量 RAG，还是引入 GraphRAG？
