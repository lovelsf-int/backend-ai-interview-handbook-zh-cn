---
title: AI Coding：从辅助编程到工程交付
description: 面向 Java 后端与 P7/P8 的 AI Coding：从辅助编程到工程交付
status: reviewing
baseline: AI Coding engineering practice v1
last_verified: 2026-09-09
level: P7/P8
source: 原创工程教学与官方文档，选题参考 JavaGuide
---

# AI Coding：从辅助编程到工程交付

## 这个模块解决什么问题

AI Coding 是用模型参与读代码、设计、实现、测试和审查的开发方式。学习目标是交付可验证的变更，并能解释设计取舍、失败恢复和团队收益。适用于 Java 后端工程师与 P7/P8 面试准备。

| 顺序 | 专题 | 学完应交付的证据 |
| --- | --- | --- |
| 1 | [工具选型与开发闭环](./tools-workflow.md) | 一个限定范围、可回滚的变更 |
| 2 | [Prompt、上下文与仓库规则](./context-spec.md) | 一份任务规格及验收用例 |
| 3 | [Skills、MCP、Hooks 与多 Agent](./skills-mcp-agents.md) | 工具权限表和任务依赖关系 |
| 4 | [Java 后端 AI 编程实战](./java-backend-practice.md) | 并发、超时、迁移三类反例 |
| 5 | [质量、安全与团队效能](./quality-governance.md) | PR 证据包和试点评估方案 |
| 6 | [P7/P8 面试题与追问](./interview.md) | 能回答失败分支的项目叙述 |

## 与现有模块如何配合

[AI 学习](../ai-study/index.md)理解模型与应用基础；[AI Agent](../ai-agent/index.md)讨论运行在业务里的智能体；本模块讨论开发软件时如何使用智能体。[Spec-driven AI Coding 项目](../system-design/spec-driven-ai-coding.md)用于项目深挖，[架构质量总纲](../system-design/project-quality-attributes.md)用于把高性能、高可靠和扩展性写成验收要求。

## 一周练习路线

1. 第一天：选一个小缺陷，记录人工基线和复现步骤。
2. 第二天：让 AI 定位调用链，核对每条关键结论的文件依据。
3. 第三天：先写业务不变量、失败用例和变更范围，再实现。
4. 第四天：检查事务边界、并发竞争、超时取消与兼容性。
5. 第五天：演练迁移和回滚，记录无法在本机验证的部分。
6. 第六天：人工审查 diff，将测试证据与提交版本绑定。
7. 第七天：用面试题复盘，并计算包含审查与返工的总耗时。

这些是练习安排，不是已执行的性能测试或个人履历数据。

## 参考与维护边界

模块选题参考用户提供的 [JavaGuide AI 编程专题](https://javaguide.cn/ai-coding/)，正文按本手册的 Java 后端和 P7/P8 场景原创组织。工具行为应以对应版本官方文档为准，不将模型排行榜、价格或临时命令作为长期知识点。
