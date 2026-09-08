---
title: 13 LeetCode 80 题分类题单
description: 36 道完整 Java 题解与 44 道延伸练习，明确区分交付范围
status: reviewed
baseline: Java 8-compatible examples; LeetCode public problem contracts
last_verified: 2026-09-08
level: 基础到 P7/P8 追问
source: LeetCode 原题链接、Java 官方文档与本站原创推导
---

# 13 LeetCode 80 题分类题单

本页是**80 道分类训练题单，其中 36 道有本站完整推导、Java 实现、复杂度、易错点和追问答案，其余 44 道为延伸练习与解题方向**。不把“题单链接”冒充“完整题解”。

选题参考 [LeetCode Top 100 Liked](https://leetcode.com/studyplan/top-100-liked/) 与 [Top Interview 150](https://leetcode.com/studyplan/top-interview-150/) 的主题覆盖，并补充背包、图与排序训练。它不是某公司的官方面试频率排名，也不表示完整复刻任何官方题单。题意和约束以每题原题页面为准。

## 36 道完整题解

建议先完成这一组：能脱稿说明不变量、写出代码并跑通边界，再进入后面的变式。站内链接直接定位到该题，页面中均保留原题入口。

| 题号 | 题目 | 本站完整题解 |
| --- | --- | --- |
| 912 | 排序数组 | [推导、Java 与追问](./01-foundations.md#lc-912) |
| 136 | 只出现一次的数字 | [推导、Java 与追问](./01-foundations.md#lc-136) |
| 1 | 两数之和 | [推导、Java 与追问](./02-array-hash-window.md#lc-1) |
| 3 | 无重复字符的最长子串 | [推导、Java 与追问](./02-array-hash-window.md#lc-3) |
| 15 | 三数之和 | [推导、Java 与追问](./02-array-hash-window.md#lc-15) |
| 560 | 和为 K 的子数组 | [推导、Java 与追问](./02-array-hash-window.md#lc-560) |
| 704 | 二分查找 | [推导、Java 与追问](./03-binary-search.md#lc-704) |
| 34 | 在排序数组中查找元素的第一个和最后一个位置 | [推导、Java 与追问](./03-binary-search.md#lc-34) |
| 206 | 反转链表 | [推导、Java 与追问](./04-linked-list.md#lc-206) |
| 141 | 环形链表 | [推导、Java 与追问](./04-linked-list.md#lc-141) |
| 21 | 合并两个有序链表 | [推导、Java 与追问](./04-linked-list.md#lc-21) |
| 19 | 删除链表的倒数第 N 个结点 | [推导、Java 与追问](./04-linked-list.md#lc-19) |
| 20 | 有效的括号 | [推导、Java 与追问](./05-stack-heap.md#lc-20) |
| 739 | 每日温度 | [推导、Java 与追问](./05-stack-heap.md#lc-739) |
| 239 | 滑动窗口最大值 | [推导、Java 与追问](./05-stack-heap.md#lc-239) |
| 215 | 数组中的第 K 个最大元素 | [推导、Java 与追问](./05-stack-heap.md#lc-215) |
| 102 | 二叉树的层序遍历 | [推导、Java 与追问](./06-tree.md#lc-102) |
| 104 | 二叉树的最大深度 | [推导、Java 与追问](./06-tree.md#lc-104) |
| 98 | 验证二叉搜索树 | [推导、Java 与追问](./06-tree.md#lc-98) |
| 236 | 二叉树的最近公共祖先 | [推导、Java 与追问](./06-tree.md#lc-236) |
| 200 | 岛屿数量 | [推导、Java 与追问](./07-graph.md#lc-200) |
| 207 | 课程表 | [推导、Java 与追问](./07-graph.md#lc-207) |
| 547 | 省份数量 | [推导、Java 与追问](./07-graph.md#lc-547) |
| 46 | 全排列 | [推导、Java 与追问](./08-backtracking.md#lc-46) |
| 78 | 子集 | [推导、Java 与追问](./08-backtracking.md#lc-78) |
| 22 | 括号生成 | [推导、Java 与追问](./08-backtracking.md#lc-22) |
| 56 | 合并区间 | [推导、Java 与追问](./09-greedy-interval.md#lc-56) |
| 55 | 跳跃游戏 | [推导、Java 与追问](./09-greedy-interval.md#lc-55) |
| 121 | 买卖股票的最佳时机 | [推导、Java 与追问](./09-greedy-interval.md#lc-121) |
| 53 | 最大子数组和 | [推导、Java 与追问](./10-dynamic-programming.md#lc-53) |
| 198 | 打家劫舍 | [推导、Java 与追问](./10-dynamic-programming.md#lc-198) |
| 300 | 最长递增子序列 | [推导、Java 与追问](./10-dynamic-programming.md#lc-300) |
| 1143 | 最长公共子序列 | [推导、Java 与追问](./10-dynamic-programming.md#lc-1143) |
| 322 | 零钱兑换 | [推导、Java 与追问](./11-coin-change.md#lc-322) |
| 518 | 零钱兑换 II | [推导、Java 与追问](./11-coin-change.md#lc-518) |
| 146 | LRU 缓存 | [推导、Java 与追问](./12-design-lru.md#lc-146) |

## 44 道延伸练习

以下题目提供原题链接和切入点，尚未提供本站完整 Java 题解。遇到卡点，先回到对应的核心模板题对照约束变化。

| 题号 | 题目 | 题型 | 解题方向与重点 |
| --- | --- | --- | --- |
| 49 | [字母异位词分组](https://leetcode.com/problems/group-anagrams/) | 哈希 | 字符排序或计数签名；不要把不同字符串的简单哈希和当成无碰撞签名 |
| 128 | [最长连续序列](https://leetcode.com/problems/longest-consecutive-sequence/) | 哈希 | 只从不存在前驱的数字开始扩展，避免每个元素重复扫整段 |
| 238 | [除自身以外数组的乘积](https://leetcode.com/problems/product-of-array-except-self/) | 数组 | 前缀乘积乘后缀乘积；考虑零值，不能默认使用除法 |
| 283 | [移动零](https://leetcode.com/problems/move-zeroes/) | 双指针 | 维护非零前缀，稳定地移动元素，然后补零 |
| 11 | [盛最多水的容器](https://leetcode.com/problems/container-with-most-water/) | 双指针 | 移动较短的一侧；证明移动较长侧不可能在宽度缩小时改善短板 |
| 42 | [接雨水](https://leetcode.com/problems/trapping-rain-water/) | 双指针 | 左右最大高度决定水位；区分单柱存水与全局面积 |
| 76 | [最小覆盖子串](https://leetcode.com/problems/minimum-window-substring/) | 窗口 | 目标频次与满足度；覆盖后持续收缩，记录最短合法窗口 |
| 438 | [找到字符串中所有字母异位词](https://leetcode.com/problems/find-all-anagrams-in-a-string/) | 窗口 | 定长窗口维护频次，左右增减必须对称 |
| 209 | [长度最小的子数组](https://leetcode.com/problems/minimum-size-subarray-sum/) | 窗口 | 正数条件保证扩张/收缩与和的单调关系 |
| 33 | [搜索旋转排序数组](https://leetcode.com/problems/search-in-rotated-sorted-array/) | 二分 | 每轮识别有序半边，再判断目标是否在该半边范围内 |
| 153 | [寻找旋转排序数组中的最小值](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) | 二分 | 与右边界比较识别最小值所在半边；重复值版本会改变复杂度 |
| 875 | [爱吃香蕉的珂珂](https://leetcode.com/problems/koko-eating-bananas/) | 答案二分 | 速度单调可行；总耗时用向上取整并注意累计溢出 |
| 162 | [寻找峰值](https://leetcode.com/problems/find-peak-element/) | 二分 | 依据坡度保留保证存在峰值的一侧，不要求数组整体有序 |
| 4 | [寻找两个正序数组的中位数](https://leetcode.com/problems/median-of-two-sorted-arrays/) | 二分 | 在较短数组上二分分割位置，满足左右分区大小与有序约束 |
| 142 | [环形链表 II](https://leetcode.com/problems/linked-list-cycle-ii/) | 链表 | 先相遇，再一指针回头并同速前进找入口 |
| 160 | [相交链表](https://leetcode.com/problems/intersection-of-two-linked-lists/) | 链表 | 交换遍历链表以抵消长度差；判断的是节点身份而非值 |
| 23 | [合并 K 个升序链表](https://leetcode.com/problems/merge-k-sorted-lists/) | 链表与堆 | 小顶堆保存每条链表的当前首节点，O(N log K) |
| 25 | [K 个一组翻转链表](https://leetcode.com/problems/reverse-nodes-in-k-group/) | 链表 | 先确认完整 k 个节点，再翻转并连接前后区间 |
| 138 | [随机链表的复制](https://leetcode.com/problems/copy-list-with-random-pointer/) | 链表 | 建立原节点到新节点映射，或交织复制后拆分恢复原链表 |
| 155 | [最小栈](https://leetcode.com/problems/min-stack/) | 栈 | 每层同步保存当前最小值，重复最小值不能提前丢失 |
| 84 | [柱状图中最大的矩形](https://leetcode.com/problems/largest-rectangle-in-histogram/) | 单调栈 | 确定每根柱子的左右更小边界；宽度与哨兵是关键 |
| 347 | [前 K 个高频元素](https://leetcode.com/problems/top-k-frequent-elements/) | 堆与计数 | 先聚合精确频次，再用堆或桶选 K 个最高频键 |
| 295 | [数据流的中位数](https://leetcode.com/problems/find-median-from-data-stream/) | 双堆 | 大顶堆保存较小半边，小顶堆保存较大半边并保持大小平衡 |
| 94 | [二叉树的中序遍历](https://leetcode.com/problems/binary-tree-inorder-traversal/) | 树 | 显式栈模拟先左、当前、再右的递归过程 |
| 226 | [翻转二叉树](https://leetcode.com/problems/invert-binary-tree/) | 树 | 交换左右子树并递归；明确是否允许修改原树 |
| 105 | [从前序与中序遍历序列构造二叉树](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) | 树 | 前序确定根，中序确定左右子树边界；利用索引表避免反复搜索 |
| 124 | [二叉树中的最大路径和](https://leetcode.com/problems/binary-tree-maximum-path-sum/) | 树形 DP | 向父节点只返回单边收益，全局答案可以同时连接左右两边 |
| 297 | [二叉树的序列化与反序列化](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) | 树 | 编码必须包含结构信息或空节点标记，不能只保存一组节点值 |
| 994 | [腐烂的橘子](https://leetcode.com/problems/rotting-oranges/) | BFS | 多源 BFS 同时扩散，按层统计时间并检查剩余不可达节点 |
| 210 | [课程表 II](https://leetcode.com/problems/course-schedule-ii/) | 拓扑排序 | 保存入度零节点出队顺序；有环时不能返回部分结果当完整顺序 |
| 208 | [实现 Trie](https://leetcode.com/problems/implement-trie-prefix-tree/) | 字典树 | 区分路径存在与完整单词结束标记；共享公共前缀 |
| 743 | [网络延迟时间](https://leetcode.com/problems/network-delay-time/) | 最短路 | 非负权图可用 Dijkstra；普通 BFS 不能表达不同边代价 |
| 39 | [组合总和](https://leetcode.com/problems/combination-sum/) | 回溯 | 同一候选可以重复用，递归保持当前下标；所有面额为正才便于剪枝 |
| 47 | [全排列 II](https://leetcode.com/problems/permutations-ii/) | 回溯 | 排序与同层去重；不要把路径去重误当成值去重 |
| 79 | [单词搜索](https://leetcode.com/problems/word-search/) | 回溯 | 路径内格子不能重复使用，回退必须恢复访问标记 |
| 45 | [跳跃游戏 II](https://leetcode.com/problems/jump-game-ii/) | 贪心 | 按当前跳数可覆盖区间分层，扩展下一层边界 |
| 435 | [无重叠区间](https://leetcode.com/problems/non-overlapping-intervals/) | 区间贪心 | 优先保留结束最早的区间，最少删除数等于总数减最多保留数 |
| 763 | [划分字母区间](https://leetcode.com/problems/partition-labels/) | 贪心 | 预计算字符最后位置，当前段右边界不断扩展至覆盖出现字符 |
| 70 | [爬楼梯](https://leetcode.com/problems/climbing-stairs/) | DP | 最后一步是一阶或两阶；初始化与 n 的定义一致 |
| 62 | [不同路径](https://leetcode.com/problems/unique-paths/) | DP | 到达每格来自上方或左方，边界路径数为一 |
| 416 | [分割等和子集](https://leetcode.com/problems/partition-equal-subset-sum/) | 0/1 背包 | 总和偶数才可行，容量逆序避免重复使用同一元素 |
| 139 | [单词拆分](https://leetcode.com/problems/word-break/) | DP | 可达前缀加字典单词形成新可达前缀，不要把局部最长匹配当全局正确 |
| 72 | [编辑距离](https://leetcode.com/problems/edit-distance/) | 二维 DP | 插入、删除、替换三类转移；首行首列分别表示空串转换 |
| 377 | [组合总和 IV](https://leetcode.com/problems/combination-sum-iv/) | 计数 DP | 实际区分顺序，金额外层枚举最后一个元素，与 518 对照 |

## 复习记录不要只记“AC”

为每题记录：第一次能否独立识别模型、实现用了多久、首次失败用例、复杂度是否准确、隔日能否脱稿、变式是否仍会做。通过在线评测只能证明给定测试集下的表现，不能替代面试中的解释与工程边界说明。
