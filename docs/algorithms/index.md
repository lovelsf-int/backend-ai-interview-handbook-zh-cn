---
title: 算法面试：LeetCode 高频题与常见算法
description: 16 页算法手册：80 题、36 道 Java 完整题解、20 个追问与训练路线
status: reviewed
baseline: Java 8-compatible examples; LeetCode public problem contracts
last_verified: 2026-09-08
level: 基础到 P7/P8 追问
source: LeetCode 原题链接、Java 官方文档与本站原创推导
---

# 算法面试：LeetCode 高频题与常见算法

面向 Java 后端面试的算法训练模块：不仅会写代码，还要说清楚状态、正确性、复杂度、边界和变式。

## 本模块包含什么

本版共 **16 个页面、80 道分类训练题、36 道完整 Java 题解和 20 个常见追问**。完整题解包含题意概括、解题思路、不变量或正确性推导、手推例子、Java 实现、复杂度、易错点及追问答案。其余 44 道明确标记为延伸练习，提供原题链接与解题方向。

题单参考 LeetCode 官方学习计划的主题覆盖，并非任何公司的官方高频排行榜。所有题意均概括表达，原题约束通过链接查阅；推导与代码为本站原创组织，不复制整套官方题解。

## 先从哪里开始

基础重建：先读算法基础，再按数组 → 二分 → 链表 → 栈与树 → 图 → 回溯 → 贪心 → DP 推进。

面试冲刺：先完成 36 道完整题解，再用 44 道变式检查迁移能力。每道题至少做到：先说模型，再写代码，最后用反例验证边界。

零钱兑换容易混淆时，直接进入[322/518 与 dp[0] 专项](./11-coin-change.md)，把最少枚数、组合数与排列数放在一起推导。

## 分类目录

| 专题 | 主要内容 |
| --- | --- |
| [算法基础、排序与 Java 模板](./01-foundations.md) | 复杂度、归并排序、位运算、运行说明 |
| [数组、哈希、双指针与窗口](./02-array-hash-window.md) | 两数之和、三数之和、无重复子串、前缀和 |
| [二分查找与边界](./03-binary-search.md) | 精确查找、左右边界、答案二分 |
| [链表与快慢指针](./04-linked-list.md) | 反转、判环、合并、删除倒数节点 |
| [栈、单调队列、堆与 Top K](./05-stack-heap.md) | 括号、每日温度、窗口最大值、第 K 大 |
| [二叉树、BST 与公共祖先](./06-tree.md) | 层序、最大深度、BST、LCA |
| [图与连通性](./07-graph.md) | 岛屿、拓扑排序、并查集 |
| [回溯、排列、组合与剪枝](./08-backtracking.md) | 全排列、子集、括号生成 |
| [贪心、区间与股票](./09-greedy-interval.md) | 区间合并、跳跃、一次交易、反例 |
| [动态规划与子序列](./10-dynamic-programming.md) | 最大子数组、打家劫舍、LIS、LCS |
| [零钱兑换与背包专项](./11-coin-change.md) | 322/518/377 对照，dp[0]、组合排列与循环顺序 |
| [LRU 手写与工程追问](./12-design-lru.md) | 哈希表加双向链表、并发、容量、TTL 边界 |
| [LeetCode 80 题分类题单](./13-question-bank.md) | 36 道完整题解 + 44 道延伸练习 |
| [面试问答与训练计划](./14-interview-playbook.md) | 20 个追问、14 天路线、10 分评分表 |
| [进阶算法与大数据选型](./15-advanced-patterns.md) | Trie、KMP、快速选择、最短路与流式问题 |

## 代码与验证方式

页面代码直接引用仓库 `examples/algorithms/InterviewAlgorithms.java` 中的区域，避免“文档代码与被测代码是两份”。依赖仅为 Java 标准库；按 Java 8 API 兼容方式编译，在 JDK 21 本地验证。

测试覆盖示例、边界与固定种子随机对照，包括二分左右边界、单调队列、LIS、前缀和、零钱兑换、LRU 淘汰等。详细运行命令见[基础与 Java 模板](./01-foundations.md)。这些是本站回归测试，不等于已经替你逐题提交 LeetCode 在线评测。

## 资料与关联学习

官方学习入口：[Top 100 Liked](https://leetcode.com/studyplan/top-100-liked/)、[Top Interview 150](https://leetcode.com/studyplan/top-interview-150/)。每道题均有原题入口，以其当前题意与约束为准。

需要衔接工程表达时，结合[Java 专题](/java/)、[系统设计](/system-design/)与[面试冲刺](/guide/interview-sprint-gap-map.md)，把单机算法、并发组件和分布式系统的保证分开回答。
