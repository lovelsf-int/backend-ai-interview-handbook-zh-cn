---
title: 01 算法基础、复杂度与 Java 模板
description: 选型线索、排序、位运算、复杂度与可运行 Java 示例
status: reviewed
baseline: Java 8-compatible examples; LeetCode public problem contracts
last_verified: 2026-09-08
level: 基础到 P7/P8 追问
source: LeetCode 原题链接、Java 官方文档与本站原创推导
---

# 01 算法基础、复杂度与 Java 模板

先判断约束，再选择数据结构，最后证明循环不变量。复杂度必须与实际代码一致：复制数组、递归栈、输出集合不能凭空消失。

## 常见算法如何选

| 线索 | 优先考虑 | 前提与边界 |
| --- | --- | --- |
| 查找补数、频次、去重 | HashMap / HashSet | 通常讨论期望复杂度，不能宣称所有输入最坏 O(1) |
| 有序数组、单调可行性 | 二分 | 说明搜索区间与单调性 |
| 连续区间且窗口可单向维护 | 滑动窗口 | 含负数的目标和问题不能直接套正数窗口 |
| 连续子数组和 | 前缀和 + 哈希 | 查询旧前缀，再记录当前前缀 |
| 最近更大/更小、窗口最值 | 单调栈 / 单调队列 | 保存下标，明确相等元素和过期规则 |
| Top K、动态极值 | 堆 | 区分第 K 大与第 K 个不同值 |
| 连通性、依赖、无权最短路 | DFS / BFS / 并查集 / 拓扑排序 | 有权最短路不能直接用普通 BFS |
| 枚举所有方案 | 回溯 | 区分树层去重、路径去重、可否重复选 |
| 求最优值或计数，存在重叠子问题 | 动态规划 | 先说状态含义，再推转移与顺序 |
| 局部决策可证明不损害全局 | 贪心 | 必须给交换论证、不变式或反例分析 |

## 复杂度表达与排序比较

`O(n)` 不等于“只有一个 for”；单调栈双层循环仍可用每元素最多入栈/出栈一次证明总计 O(n)。递归不是自动 O(log n)，链状树深度可以达到 n。输出全部子集至少要产生 2^n 个结果。

| 算法 | 时间 | 辅助空间 | 稳定性与适用性 |
| --- | --- | --- | --- |
| 插入排序 | 最坏 O(n²)，已有序时 O(n) | O(1) | 常规实现稳定，小规模或接近有序 |
| 归并排序 | O(n log n) | 数组版 O(n) | 合并相等值先取左侧时稳定 |
| 快速排序 | 平均 O(n log n)，最坏 O(n²) | 递归栈平均 O(log n)，最坏 O(n) | 常规原地实现不稳定；随机枢轴降低退化概率 |
| 堆排序 | O(n log n) | 原地版 O(1) | 不稳定，可给最坏时间界 |
| 计数排序 | O(n + U) | O(U)，稳定输出版另需 O(n) | 键域 U 可控才适合；不是比较排序 |

## Java 手写约定与本地复现

示例源码集中在仓库 `examples/algorithms/InterviewAlgorithms.java`，页面直接引用对应代码区域。每题方法可放入 `class Solution`，同时复制该区域内的辅助方法。链表和树题在 LeetCode 使用平台给定的节点类，不要重复声明；LRU 提交时去掉外层包装并将 `public static class LRUCache` 改为 `class LRUCache`。

统一导入 `java.util.*`；零钱兑换计数版另导入 `java.math.BigInteger`。`static` 是本仓库测试组织方式，不是算法要求。默认输入满足原题约束；多数方法不接受 null。链表操作会修改节点连接，数组排序/区间合并示例使用副本，岛屿示例保留原网格。

<<< @/../examples/algorithms/InterviewAlgorithms.java#nodes

```bash
# 在仓库根目录执行；使用 JDK 9+ 的 --release 检查 Java 8 API 兼容性。
mkdir -p /tmp/algorithm-classes
javac --release 8 -encoding UTF-8 -d /tmp/algorithm-classes examples/algorithms/*.java
java -cp /tmp/algorithm-classes InterviewAlgorithmsTest
# 站点测试会重复编译并运行上述测试。
node --test tests/algorithms.test.mjs
```

`ArrayDeque` 不允许放入 null，适合非并发栈/队列；`PriorityQueue` 默认最小堆，遍历顺序不代表整体排序。比较器使用 `Integer.compare(a, b)`，避免 `a - b` 溢出。数组与字符串索引默认 int，累计和按需要提升为 long；字符串 char 是 UTF-16 代码单元，不等于所有 Unicode 字符或用户感知字符。[ArrayDeque 官方说明](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayDeque.html)与[PriorityQueue 官方说明](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/PriorityQueue.html)。

## LC 912 排序数组 {#lc-912}

[原题与约束](https://leetcode.com/problems/sort-an-array/) · 本节为本站原创题意概括与解法。

**题意与思路：**将数组分成左右两半，分别排序后线性合并。实现返回副本，不改变输入。

**为什么正确：**合并前左右区间分别有序，每次取两个区间剩余首元素的较小值，已输出前缀始终有序且是剩余元素的最小集合。

**手推例子：**[5,2,-1,2] 分治合并后得到 [-1,2,2,5]；相等时先拿左侧以保持稳定。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#mergeSort

**复杂度：**时间 O(n log n)；辅助空间 O(n)，另有 O(log n) 调用栈，合计仍为 O(n)。

**易错点：**递归使用 [left,right)，终止条件是长度不超过 1；分治不能每层遗漏最后一个元素。

**面试追问与回答：**为什么不用快速排序？快速排序也可行，但要解释枢轴选择与最坏 O(n²)；本例选择容易证明且最坏 O(n log n) 的归并。

## LC 136 只出现一次的数字 {#lc-136}

[原题与约束](https://leetcode.com/problems/single-number/) · 本节为本站原创题意概括与解法。

**题意与思路：**其余每个数恰好出现两次，只有一个数出现一次；将所有数异或。

**为什么正确：**异或满足交换律、结合律，x XOR x = 0，0 XOR y = y；成对元素抵消。

**手推例子：**[-1,2,-1] 的两个 -1 抵消，留下 2。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#singleNumber

**复杂度：**时间 O(n)，额外空间 O(1)。

**易错点：**这里依赖“其余数恰好两次”；其余数出现三次时不能直接套用。

**面试追问与回答：**两个数各出现一次怎么办？先得到二者异或，再按某个为 1 的位分成两组，各组单独异或。
