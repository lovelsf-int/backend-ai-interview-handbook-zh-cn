---
title: 02 数组、哈希、双指针与滑动窗口
description: 两数之和、三数之和、最长无重复子串与前缀和
status: reviewed
baseline: Java 8-compatible examples; LeetCode public problem contracts
last_verified: 2026-09-08
level: 基础到 P7/P8 追问
source: LeetCode 原题链接、Java 官方文档与本站原创推导
---

# 02 数组、哈希、双指针与滑动窗口

数组题先分清“子数组连续”“子序列不要求连续”“集合组合不关心原始相邻关系”。滑动窗口并不是所有连续区间问题的万能解法。

## 90 秒回答框架

先报暴力复杂度，再说明维护什么状态、为什么左右边界只向前移动。哈希表能省掉反复查找；排序后的双指针利用有序性缩小候选集合；前缀和把一个区间和改写成两个前缀的差。

## LC 1 两数之和 {#lc-1}

[原题与约束](https://leetcode.com/problems/two-sum/) · 本节为本站原创题意概括与解法。

**题意与思路：**找两个不同下标，使对应值之和为 target。遍历时查询此前见过的补数，找到就返回。

**为什么正确：**处理下标 i 时，哈希表只包含更早的位置，因此匹配不会重复使用 i，且每一对都会在较晚的位置被检查。

**手推例子：**[3,3]、target=6：先保存第一个 3；第二个 3 查询到下标 0，返回 [0,1]。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#twoSum

**复杂度：**期望时间 O(n)，空间 O(n)。

**易错点：**先 put 再查可能把同一元素使用两次；补数先提升 long，避免 int 边界误匹配。

**面试追问与回答：**输入有序怎么办？用首尾双指针可做到 O(n) 时间、O(1) 辅助空间，但要确认返回的是哪一组下标。

## LC 3 无重复字符的最长子串 {#lc-3}

[原题与约束](https://leetcode.com/problems/longest-substring-without-repeating-characters/) · 本节为本站原创题意概括与解法。

**题意与思路：**求不含重复字符的最长连续区间。保存字符最后出现的位置，必要时将 left 移到该位置之后。

**为什么正确：**窗口 [left,right] 始终无重复。遇到旧字符时，left 只能取原 left 与 old+1 的较大者，否则会倒退并重新包含重复字符。

**手推例子：**abba：读第二个 b 后 left=2；最后读 a 时旧位置 0 不在窗口中，left 仍为 2，答案为 2。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#longestSubstring

**复杂度：**期望时间 O(n)，空间 O(min(n,Σ))；Σ 为所处理字符集合大小。

**易错点：**不能写成 left=old+1 而不取 max；本实现按 Java char 计数，完整 Unicode 码点语义需要先转 codePoints。

**面试追问与回答：**最小覆盖子串怎么改？维护目标频次和满足度，窗口满足覆盖后反复收缩，直到再次不满足。

## LC 15 三数之和 {#lc-15}

[原题与约束](https://leetcode.com/problems/3sum/) · 本节为本站原创题意概括与解法。

**题意与思路：**返回值之和为零的不重复三元组。先排序副本，固定第一个元素，再对右侧使用首尾双指针。

**为什么正确：**固定 i 后，和偏小只能通过增大左值改善，偏大则缩小右值；排序使这两个动作不会跳过有效候选。

**手推例子：**[-1,0,1,2,-1,-4] 排序后得到 [-4,-1,-1,0,1,2]，答案为 [-1,-1,2] 与 [-1,0,1]。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#threeSum

**复杂度：**时间 O(n²)；辅助空间 O(n)，因为代码复制输入；输出最坏另需 O(n²)。

**易错点：**三处去重分别处理固定元素、左指针、右指针；三个 int 的求和先转 long。

**面试追问与回答：**四数之和怎么做？再固定一层，剩余二数仍用双指针，排序与去重原则不变，常规时间 O(n³)。

## LC 560 和为 K 的子数组 {#lc-560}

[原题与约束](https://leetcode.com/problems/subarray-sum-equals-k/) · 本节为本站原创题意概括与解法。

**题意与思路：**统计连续子数组和等于 k 的数量。当前前缀和为 s，查询此前有多少个前缀和为 s-k。

**为什么正确：**prefix[j]-prefix[i]=k 等价于 prefix[i]=prefix[j]-k。记录前缀频次而非仅是否存在，才不会漏掉不同起点。

**手推例子：**[1,-1,0]、k=0：初始 0 前缀一次，三个位置分别贡献 0、1、2，合计 3。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#subarraySum

**复杂度：**期望时间 O(n)，空间 O(n)；前缀值用 long，返回值依原题规模使用 int。

**易错点：**必须先 count.put(0L,1)，才能统计从下标 0 开始的区间；查询后再登记当前前缀，避免计入空区间。

**面试追问与回答：**为什么不能直接滑动窗口？出现负数时，扩张不保证和变大，收缩不保证和变小，正数窗口所依赖的单调性消失。
