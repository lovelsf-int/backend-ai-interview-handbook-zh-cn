---
title: 03 二分查找与边界
description: 二分区间不变量、左右边界与答案二分
status: reviewed
baseline: Java 8-compatible examples; LeetCode public problem contracts
last_verified: 2026-09-08
level: 基础到 P7/P8 追问
source: LeetCode 原题链接、Java 官方文档与本站原创推导
---

# 03 二分查找与边界

二分的核心是“每次丢弃一段不可能的答案”，而不是背诵 while 条件。先选闭区间还是半开区间，再保持更新规则一致。

## 半开区间模板与答案二分

本章统一使用 [left,right)。循环条件为 left < right，中点为 left+(right-left)/2；保留左半部分时 right=mid，丢弃中点及左半部分时 left=mid+1。

数组不一定要显式有序才能二分，但必须能构造单调判定。例如最小可行速度：速度越大越容易在限时内完成，可以二分“最早为 true”的位置。每次判定若 O(n)，总时间是 O(n log U)，而非 O(log n)。

## LC 704 二分查找 {#lc-704}

[原题与约束](https://leetcode.com/problems/binary-search/) · 本节为本站原创题意概括与解法。

**题意与思路：**在升序数组中查找 target，下标不存在返回 -1。

**为什么正确：**如果中点值偏小，则中点及其左侧不可能等于 target；偏大时答案只能在中点左侧。候选区间持续缩短直至为空。

**手推例子：**[-2,4,9] 查 4：中点直接命中；空数组起始区间为空，返回 -1。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#binarySearch

**复杂度：**时间 O(log n)，空间 O(1)。

**易错点：**把 right 初始化为 n，却使用 left<=right，会读越界；本代码不保证重复值时返回第一个位置。

**面试追问与回答：**如何证明不会死循环？每次迭代 right 减小为 mid，或 left 增大为 mid+1，非空区间的长度严格减小。

## LC 34 在排序数组中查找元素的第一个和最后一个位置 {#lc-34}

[原题与约束](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) · 本节为本站原创题意概括与解法。

**题意与思路：**用两次 lowerBound：第一次找 >=target，第二次找 >=target+1，后者减一就是右端点。

**为什么正确：**lowerBound 保持 left 左侧均小于目标、right 右侧均不小于目标；终止时二者相等即分界线。

**手推例子：**[2,2,3] 查 2：lowerBound(2)=0，lowerBound(3)=2，结果 [0,1]。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#searchRange

**复杂度：**时间 O(log n)，空间 O(1)。

**易错点：**target+1 可能超过 int；先转 long。第一次查到数组末尾或值不相等时，直接返回 [-1,-1]。

**面试追问与回答：**能否查到一个 target 后线性向两边找？可以，但全数组相同时退化 O(n)，不满足稳定对数时间要求。
