---
title: 练习与复盘：答不出再回正文
description: 独立的练习入口，避免把题库作为第二套理论书
status: reviewing
baseline: curated reading map 2026-10-09
last_verified: 2026-10-09
level: P7/P8
source: 现有专题、项目资料与阅读去重审计
---

# 练习与复盘：答不出再回正文

先闭卷答，再点开答案。每次选一题，记录机制、边界或证据中具体卡住的部分；已有答案只是反馈，不再背成第二套主教材。

| 今天想练什么 | 入口 | 最小产出 |
|---|---|---|
| Java 手写与并发 | [多线程编程](../java/thread-programming/) | 一段可运行代码，覆盖退出、中断和边界 |
| 算法 | [算法与 LeetCode](../algorithms/) | 一题代码 + 复杂度 + 边界用例 |
| Spring 表达 | [核心题库](../spring/13-interview-question-bank.md) | 90 秒回答 + 一轮机制追问 |
| 消息一致性 | [Kafka 追问](../kafka/10-interview-follow-ups.md) | 推演提交超时、消费重放和外部副作用 |
| 缓存与锁 | [Redis 排障题](../redis/12-interview-troubleshooting.md) | 画一个无法保证一致性的并发时序 |
| 检索与容量 | [SOC 压力面](../elasticsearch/18-soc-pressure-interview.md) | 验算一组容量；说明 rollover 后的重复边界 |
| AI 基础 | [闭卷复习工作台](../ai-study/review.md) | 自测失败才补对应学习卡 |
| Agent 生产安全 | [安全实战验收](../ai-agent/14-llm-agent-security-practice.md) | 选一个场景写输入、预期和观测点 |
| 架构取舍 | [架构决策实战](../system-design/p7-p8-architecture-decision-workshop.md) | 一份带否决理由和退出条件的决策记录 |

## 三个跨章节实验

这些是建议练习，不是本仓库已经执行的生产验证。

1. **滚动索引重放**：写成功但 ACK 丢失后 rollover，再重放同一事件；对比业务唯一记录与 ES 文档数。原理只读 [SOC 数据写入](../elasticsearch/17-soc-event-alert-capacity.md)。
2. **RAG 权限与候选数**：同租户不同 ACL、过期政策和不相关案例；记录各层候选 ID、返回数量与引用。原理只读 [RAG](../ai-agent/05-rag-knowledge-engineering.md)，项目示例在 [SOC](../system-design/soc-agent.md)。
3. **重建与回滚**：旧快照与新增量乱序、删除后迟到写入、切换后继续写再回滚；记录 checkpoint 与最终哈希。原理只读 [在线 Reindex](../elasticsearch/12-reindex-consistency.md)。

## 历次复盘

复盘保留当时问题和证据，技术结论以当前专题及其版本为准。入口集中在[历次复盘清单](./interview-sprint-gap-map.md#历次复盘统一入口)；不要把所有历史答案重新当必读材料。

需要短期节奏时使用[冲刺模板](./interview-sprint-gap-map.md)，按今天的诊断删减。
