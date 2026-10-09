---
title: 项目案例：只讲有证据的经历
description: 把项目事实与通用知识分开，选择一个代表项目深入
status: reviewing
baseline: curated reading map 2026-10-09
last_verified: 2026-10-09
level: P7/P8
source: 现有专题、项目资料与阅读去重审计
---

# 项目案例：只讲有证据的经历

每次只选一个项目。原理不懂时回到[知识主入口](./topic-map.md)，这里重点准备背景、个人职责、约束、取舍和证据。

| 项目 | 主入口 | 只在对应追问时打开 |
|---|---|---|
| SOC 智能研判 | [SOC Agent](../system-design/soc-agent.md) | [当前容量口径](../elasticsearch/17-soc-event-alert-capacity.md)；[压力面](../elasticsearch/18-soc-pressure-interview.md) |
| 海外游戏支付 | [海外支付](../system-design/overseas-payment.md) | [全球订阅与跨区容灾](../system-design/global-subscription.md) |
| 订阅领域建模 | [支付与 DDD](../finance-payment-ddd/index.md) | [订阅案例的边界划分](../finance-payment-ddd/subscription-case/01-bounded-contexts.md) |
| 道路运输 | [运输安全平台](../system-design/transport-safety.md) | 按正文中的业务流程追问 |
| AI Coding | [Spec-driven 实践](../system-design/spec-driven-ai-coding.md) | [AI Coding 质量治理](../ai-coding/quality-governance.md) |

## 每个项目只准备一张证据卡

- 业务问题和不变量是什么？个人负责哪一段？
- 保留哪个方案，否决了什么替代方案，依据是什么？
- 数字的单位、分母、时间窗口、采集位置和基线是什么？
- 哪些是已核验事实，哪些是估算、目标或教学假设？
- 最难的失败窗口如何恢复，有没有可展示的验证记录？

没有证据时写“待补”，不要把教程示例或第三方经历转成自己的成果。生产容量、准确率与容灾演练尤其要分清范围。通用验收方法见[项目质量属性](../system-design/project-quality-attributes.md)。

## 通用系统设计题不等于项目经历

[系统设计笔记案例库](https://github.com/lovelsf-int/system-design-notes-zh-cn)保留在独立仓库，按需要选支付、消息或监控等案例练习；本站不复制整套正文，也不要求先读完案例库。
