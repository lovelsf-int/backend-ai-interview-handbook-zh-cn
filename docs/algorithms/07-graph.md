---
title: 07 图、BFS、拓扑排序与并查集
description: 岛屿、课程依赖与连通分量的 Java 手写
status: reviewed
baseline: Java 8-compatible examples; LeetCode public problem contracts
last_verified: 2026-09-08
level: 基础到 P7/P8 追问
source: LeetCode 原题链接、Java 官方文档与本站原创推导
---

# 07 图、BFS、拓扑排序与并查集

先确认有向/无向、是否带权、能否重复访问。BFS 解决等权边下的最短步数；DFS/BFS 可找连通块；并查集回答连通性；拓扑排序针对有向无环图依赖。

## LC 200 岛屿数量 {#lc-200}

[原题与约束](https://leetcode.com/problems/number-of-islands/) · 本节为本站原创题意概括与解法。

**题意与思路：**按四方向相邻定义陆地连通块。扫描网格，每遇到未访问陆地就增加一个岛屿并 BFS 标记整块。

**为什么正确：**一次 BFS 恰好覆盖起点所在连通块；后续扫描不会重复计数，任何未覆盖陆地都会成为新的起点。

**手推例子：**网格 110/001/101 中，左上、右侧、左下共 3 块；对角接触不算相连。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#islands

**复杂度：**时间 O(rows×cols)，额外 visited 和队列最坏 O(rows×cols)。

**易错点：**入队时就标记 visited，否则同一格可能反复入队；本例保留网格内容，重复调用结果不变。

**面试追问与回答：**允许直接改网格能省到 O(1) 吗？可以省 visited 数组，但 BFS 队列或 DFS 栈最坏仍可能占 O(rows×cols)，不能忽略。

## LC 207 课程表 {#lc-207}

[原题与约束](https://leetcode.com/problems/course-schedule/) · 本节为本站原创题意概括与解法。

**题意与思路：**先修关系 [a,b] 表示 b→a。统计入度，从入度零的课程开始处理并删除出边。

**为什么正确：**无环依赖中必有入度为零的节点；如果仍有未处理节点但不存在入度零节点，剩余子图含有环。

**手推例子：**[[1,0]] 可以按 0、1 完成；再加 [0,1] 形成环，两节点都无法起步。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#courses

**复杂度：**时间 O(V+E)，邻接表、入度与队列空间 O(V+E)。

**易错点：**边方向别写反；所有节点都要纳入统计，包括没有任何边的独立课程。

**面试追问与回答：**需要给出具体课程顺序怎么办？保存出队序列，若长度等于 V 则是一个合法拓扑序，否则返回失败。

## LC 547 省份数量 {#lc-547}

[原题与约束](https://leetcode.com/problems/number-of-provinces/) · 本节为本站原创题意概括与解法。

**题意与思路：**输入无向连通矩阵，初始每个节点各属一个集合，遍历连接并合并不同集合，统计剩余集合数。

**为什么正确：**并查集维护可达关系的等价类；每次合并两个不同根，连通分量数恰好减一，已有同根连接不会重复减。

**手推例子：**节点 0 与 1 相连、节点 2 独立，从 3 个集合合并一次后得到 2。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#provinces

**复杂度：**扫描 O(n²)，并查集操作带路径压缩及按大小合并，总界 O(n² α(n))；辅助空间 O(n)。

**易错点：**只有根不同才减计数；无向对称矩阵只需扫描上三角。本题不是有向强连通分量问题。

**面试追问与回答：**可以支持删除边吗？普通并查集不擅长拆分集合；需根据场景考虑离线回滚并查集或其他动态连通性结构。
