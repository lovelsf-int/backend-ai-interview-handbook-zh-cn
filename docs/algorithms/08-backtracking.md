---
title: 08 回溯、排列、组合与剪枝
description: 全排列、子集与括号生成，解释去重与恢复现场
status: reviewed
baseline: Java 8-compatible examples; LeetCode public problem contracts
last_verified: 2026-09-08
level: 基础到 P7/P8 追问
source: LeetCode 原题链接、Java 官方文档与本站原创推导
---

# 08 回溯、排列、组合与剪枝

回溯的统一结构是：定义路径与可选集合，选择，递归，撤销选择。复杂度要把答案复制计入；“枚举所有答案”通常无法通过所谓剪枝降成多项式时间。

## LC 46 全排列 {#lc-46}

[原题与约束](https://leetcode.com/problems/permutations/) · 本节为本站原创题意概括与解法。

**题意与思路：**输入值互不相同，每层选择一个未使用下标，长度达到 n 时复制路径作为一个排列。

**为什么正确：**每条根到叶路径对应一组独特的下标排列；used 保证路径内不重复使用元素，并且每个未使用元素都被枚举。

**手推例子：**[1,2,3] 有 6 条完整路径，例如 1→2→3 和 1→3→2。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#permute

**复杂度：**含复制结果的时间 O(n×n!)，输出空间同阶，额外递归路径与 used 为 O(n)。

**易错点：**必须复制 path，不能把同一个可变列表多次加入结果；回溯后同时撤销 path 与 used。

**面试追问与回答：**输入含重复值怎么办？排序后，同层遇到相同值且前一个相同值尚未被路径使用时跳过，避免等价分支重复枚举。

## LC 78 子集 {#lc-78}

[原题与约束](https://leetcode.com/problems/subsets/) · 本节为本站原创题意概括与解法。

**题意与思路：**输入值互不相同，递归时只从 start 之后选元素，每到一个状态都记录当前路径。

**为什么正确：**选择下标严格递增，任意集合只会按一种下标顺序生成；每个元素选或不选的组合全部覆盖。

**手推例子：**[1,2] 产生 []、[1]、[1,2]、[2]，空集也必须包含。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#subsets

**复杂度：**含结果复制的时间和输出空间 O(n×2^n)，辅助路径与栈 O(n)。

**易错点：**子集是组合，不应从下标 0 重新排列已选元素；每个递归节点都记录，不只是叶节点。

**面试追问与回答：**组合总和如何调整？允许同一个候选重复使用时，递归下一层仍从当前 i 开始；只能使用一次时从 i+1 开始。

## LC 22 括号生成 {#lc-22}

[原题与约束](https://leetcode.com/problems/generate-parentheses/) · 本节为本站原创题意概括与解法。

**题意与思路：**生成 n 对合法括号。只在 open<n 时加左括号，在 close<open 时加右括号。

**为什么正确：**每个前缀右括号数不超过左括号数，且总左括号不超过 n；到 close=n 时自然得到合法完整序列。

**手推例子：**n=2 只产生 (()) 与 ()()，不会先生成 ))(( 再过滤。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#generateParenthesis

**复杂度：**结果数为 Catalan 数 Cn，时间与输出规模 O(n×Cn)，辅助路径与栈 O(n)。

**易错点：**约束应在递归前剪枝；StringBuilder 每条分支结束要恢复长度。

**面试追问与回答：**校验括号与生成括号有什么区别？校验只判断给定序列，生成要枚举所有合法选择；不能用一次线性扫描替代指数级输出。
