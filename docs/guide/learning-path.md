---
title: 学习路线：先诊断，再跳读
description: 用三个问题选一条短路线，按薄弱点回到主入口
status: reviewing
baseline: curated reading map 2026-10-09
last_verified: 2026-10-09
level: P7/P8
source: 现有专题、项目资料与阅读去重审计
---

# 学习路线：先诊断，再跳读 {#学习路线}

## 先做诊断

对今天的主题闭卷回答：①机制如何工作？②在哪个失败窗口不成立？③用什么观测或实验证明？三问都能说清，就跳过原理正文，直接去[练习](./practice.md)或[项目](./projects.md)。

历史面试复盘只能提示候选弱点，不能替代今天的自测。下面三条路线选一条，不要求全走。

## 今天只选一条短路线

| 目标 | 第一篇 | 卡住了再读 | 结束条件 |
|---|---|---|---|
| Java 后端基础表达 | [集合与泛型](../java/collections-generics-interview-guide.md) | [Spring 事务](../spring/06-transaction-principles.md)或[MySQL MVCC](../mysql/innodb-write-mvcc-transactions.md)，只选答不出的 | 90 秒回答 + 一个失效反例 |
| AI / SOC 工程 | [RAG 主线](../ai-agent/05-rag-knowledge-engineering.md) | [执行与恢复](../ai-agent/06-planning-execution-recovery.md) | 画出召回、权限、重排链路，并解释超时后的状态 |
| 支付 / 系统设计 | [状态机与 UNKNOWN](../finance-payment-ddd/06-state-machine-unknown.md) | [Outbox/Inbox](../finance-payment-ddd/08-events-outbox-inbox.md) | 区分支付与履约，推演成功但 ACK 丢失 |

零基础看不懂 AI 术语时，再选 [AI 学习路线](../ai-study/learning-path.md)的对应单元补课；它不是每个人都必须额外完成的前置任务。

## 第一阶段：建立回答骨架

只补诊断失败的一个知识点，在[知识主入口](./topic-map.md)找到唯一主读；已经会的跳过，不重刷整专题。

## 第二阶段：进入生产工程

给刚学的知识补一个失败窗口：重复消息、超时、主从切换或迟到旧写入。先解释不变量，再选机制。

## 第三阶段：AI Agent 工程化

选择 AI 岗位时继续上面的 AI 短路线；已有经验可直接做[安全验收场景](../ai-agent/14-llm-agent-security-practice.md)。

## 第四阶段：项目连续追问

在[项目案例](./projects.md)只选一个代表项目。通用原理链接回主入口，不另背一套长答案；未核验指标留空或明确标注。

## 第五阶段：模拟面试

去[练习与复盘](./practice.md)。错题记录只留自己的原回答、错因、修正依据、下次验证，不抄整章。

## 第六阶段：架构决策与技术治理

只有需要架构决策深度时，选 [P7/P8 架构决策实战](../system-design/p7-p8-architecture-decision-workshop.md)的一题，写出至少一个被拒方案及推翻当前方案的证据。

## 距离面试只有一周

[七天冲刺模板](./interview-sprint-gap-map.md)按当前诊断结果取舍；不是新增必读清单。每天保留一次口述和一次反例推演即可。
