---
title: "来源、许可与修改说明"
description: "JavaGuide Apache-2.0 正文归属、固定提交与学习增补说明"
status: "reviewing"
baseline: "JavaGuide source snapshot d76264cb4e000416c4adca06770ce014bd309150"
last_verified: "2026-09-09"
level: "学习 / 复习 / P7 / P8"
source: "JavaGuide Apache-2.0 许可正文；本手册独立学习卡"
---

# 来源、许可与修改说明

## JavaGuide 来源

正文与六篇导览来自 [Snailclimb/JavaGuide](https://github.com/Snailclimb/JavaGuide/tree/d76264cb4e000416c4adca06770ce014bd309150/docs/ai)，固定提交 `d76264cb4e000416c4adca06770ce014bd309150`。原作者及贡献者归属保留为 JavaGuide / Guide 与对应贡献者；逐页提供原文和固定源码链接。

[Apache License 2.0 全文](/licenses/javaguide-apache-2.0.txt) 随网站分发；仓库 `LICENSES/JavaGuide-Apache-2.0.txt` 保留相同全文，`THIRD_PARTY_NOTICES.md` 记录归属与修改。该许可说明只针对相应第三方内容，不把整个本站或其他资料一律改成该许可证。

## 本次修改

新增学习卡、自测、实践任务、学习路线和工程章节关联；补充来源 Front Matter，适配 VitePress 标题、容器和链接。原文正文不是摘要替代。外部托管图片没有批量复制或作为自有图发布，在正文内直接引用展示，同时保留可点击原图链接；源文中的 Mermaid 源码保留。公开站点 include 片段未展开。少量附件引用回到其原文页，避免把外部附件变成本站主阅读入口。

## 官方与论文延伸

以下用于边界核对与进一步学习，不表示所有上游段落都完成了官方交叉核验。

- [Anthropic：Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Spring AI：Tool Calling](https://docs.spring.io/spring-ai/reference/api/tools.html)
- [论文：Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [论文：Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)
- [MCP 官方架构文档（2026-07-28）](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture)
- [Agent Skills 规范](https://agentskills.io/specification)
- [Anthropic：Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [LangGraph：Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- [Elastic：Hybrid search](https://www.elastic.co/docs/solutions/search/hybrid-search)
- [Microsoft GraphRAG 文档](https://microsoft.github.io/graphrag/)
- [OpenTelemetry：GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- [OWASP：AI Agent Security](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html)

## 维护方式

本次是固定版本收录，不是自动追踪上游的后台订阅。需要更新时修改固定来源清单、审阅新旧差异、重新测试后发布。生成目录中的手工改动应先合并回整理数据或记录为补丁，不能未经比较直接覆盖。
