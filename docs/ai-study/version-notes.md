---
title: "版本校准与阅读边界"
description: "区分上游写作基线、官方更新与本站审核状态"
status: "reviewing"
baseline: "JavaGuide source snapshot d76264cb4e000416c4adca06770ce014bd309150"
last_verified: "2026-09-09"
level: "学习 / 复习 / P7 / P8"
source: "JavaGuide Apache-2.0 许可正文；本手册独立学习卡"
---

# 版本校准与阅读边界

## MCP 的两版流程不要混用

上游 MCP 正文以 2025-11-25 revision 为基线，本文保留该历史叙述用于学习。2026-09-09 核验的官方 2026-07-28 文档使用无状态请求元数据与 `server/discover`，并将 sampling 标为弃用。旧版初始化、能力协商等描述不能直接拼进新版请求示例。

[官方 2026-07-28 架构](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture) · [本站 MCP 学习页](./java-guide/agent/mcp.md)

接入时同时记录 Host、Client、Server、SDK 与协议版本，只使用共同支持的能力；文档的最新版本不表示所有客户端已经升级。

## 其他内容怎么读

SDK 接口、模型价格与配额、数据库能力和产品默认值可能变化；原文的数字保留为其写作上下文，不作为今天的购买或生产配置建议。代码示例为学习材料，未逐个在具体依赖组合中运行。Prompt 中的约束不等于服务端权限。项目第一人称属于原作者，本站案例增补明确是设计练习。

## 审核状态

`reviewing` 表示已做来源、结构、导航与构建检查，但没有宣称逐段技术审计完成。页面的 `last_verified` 是本次整理校验日期；具体规范核验以本页记录为准。发现冲突时优先查对应版本官方文档，再修订学习卡，不为统一措辞而抹掉历史基线。
