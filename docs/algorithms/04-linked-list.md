---
title: 04 链表与快慢指针
description: 反转、判环、合并与删除倒数节点
status: reviewed
baseline: Java 8-compatible examples; LeetCode public problem contracts
last_verified: 2026-09-08
level: 基础到 P7/P8 追问
source: LeetCode 原题链接、Java 官方文档与本站原创推导
---

# 04 链表与快慢指针

链表手写要先画连接关系，再改指针。dummy 哨兵节点让删除头节点与删除中间节点复用同一逻辑。本章默认无环链表，判环题除外；合并题默认两条输入链表不共享节点。

## LC 206 反转链表 {#lc-206}

[原题与约束](https://leetcode.com/problems/reverse-linked-list/) · 本节为本站原创题意概括与解法。

**题意与思路：**用 prev 表示已反转部分，curr 表示尚未处理的首节点。保存 next，再反转 curr.next。

**为什么正确：**每轮结束时，prev 指向恰好处理过的反向链表，curr 指向剩余原顺序链表；保存 next 保证不会丢失未处理节点。

**手推例子：**1→2→3：三轮后 prev 依次指向 1、2→1、3→2→1。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#reverseList

**复杂度：**时间 O(n)，空间 O(1)。

**易错点：**先修改 next 再读取原 next 会断链；返回 prev 而不是已经变成 null 的 curr。

**面试追问与回答：**递归版空间是多少？O(n) 调用栈，不是 O(1)；长链表还要考虑栈溢出。

## LC 141 环形链表 {#lc-141}

[原题与约束](https://leetcode.com/problems/linked-list-cycle/) · 本节为本站原创题意概括与解法。

**题意与思路：**slow 每次走一步，fast 每次走两步；两者按节点身份相等则有环。

**为什么正确：**进入环后，快慢指针的相对距离每轮按模环长变化一，必然相遇；无环则 fast 到达末尾。

**手推例子：**两节点互连时，快慢指针最终落到同一个节点；两个相同值但不同对象的节点不表示成环。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#hasCycle

**复杂度：**时间 O(n)，空间 O(1)。

**易错点：**判断 fast 与 fast.next 非空后才能走两步；不能用 val 比较是否相遇。

**面试追问与回答：**如何找入环点？相遇后让一个指针回到头，另一个留在相遇点，再同速一步前进，首次相遇处就是入口。

## LC 21 合并两个有序链表 {#lc-21}

[原题与约束](https://leetcode.com/problems/merge-two-sorted-lists/) · 本节为本站原创题意概括与解法。

**题意与思路：**两个升序链表不断选较小首节点接到结果尾部，最后接上剩余链表。

**为什么正确：**结果前缀始终有序，且其中每个节点都不大于两条链表尚未处理的首节点；因此贪心选较小者安全。

**手推例子：**1→3 与 1→2 合并为 1→1→2→3；相等时先取第一条链表。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#mergeTwoLists

**复杂度：**时间 O(m+n)，辅助空间 O(1)，复用输入节点。

**易错点：**每接一个节点都要推进 tail 和相应输入指针；这不是保留原链表结构的只读算法。

**面试追问与回答：**合并 K 条怎么办？用大小不超过 K 的最小堆存各链表当前首节点，N 个总节点耗时 O(N log K)。

## LC 19 删除链表的倒数第 N 个结点 {#lc-19}

[原题与约束](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) · 本节为本站原创题意概括与解法。

**题意与思路：**从 dummy 起步，让 fast 先走 n 步，再令快慢指针同步前进直到 fast 位于尾节点。

**为什么正确：**快慢之间始终相隔 n 条边；fast 到尾时，slow 恰好是待删节点的前驱。

**手推例子：**1→2→3 删除倒数第 2 个：slow 最后在 1，令 1.next 指向 3。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#removeNth

**复杂度：**时间 O(n)，空间 O(1)。

**易错点：**删除头节点时 dummy 保持统一入口；示例对 n<=0 或 n 超过长度显式抛出异常。

**面试追问与回答：**只给待删节点能否删除？非尾节点可复制后继的值并跳过后继，但会改变节点身份语义，也无法处理尾节点。
