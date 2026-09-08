---
title: 06 二叉树、BST 与公共祖先
description: 层序遍历、递归返回值、BST 全局约束与 LCA
status: reviewed
baseline: Java 8-compatible examples; LeetCode public problem contracts
last_verified: 2026-09-08
level: 基础到 P7/P8 追问
source: LeetCode 原题链接、Java 官方文档与本站原创推导
---

# 06 二叉树、BST 与公共祖先

树题先定义“函数返回什么”，再决定前序、中序或后序。统计子树结果常用后序；BST 顺序性质常用中序；按层组织结果使用 BFS。

## LC 102 二叉树的层序遍历 {#lc-102}

[原题与约束](https://leetcode.com/problems/binary-tree-level-order-traversal/) · 本节为本站原创题意概括与解法。

**题意与思路：**用队列逐层访问节点，每轮开始固定当前队列长度，恰好处理这一层。

**为什么正确：**新加入的都是下一层节点，不应计入本轮处理次数；固定 size 将层间边界明确隔开。

**手推例子：**根 2、左右孩子 1 和 3，返回 [[2],[1,3]]；空树返回空列表。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#levelOrder

**复杂度：**时间 O(n)，队列 O(w)，w 为最大层宽；输出另需 O(n)。

**易错点：**不要把 null 存入 ArrayDeque；循环条件不能使用不断增长的 queue.size()。

**面试追问与回答：**右视图怎么改？每层只收集最后处理的节点，或先右后左 DFS，首次到达每一深度时记录。

## LC 104 二叉树的最大深度 {#lc-104}

[原题与约束](https://leetcode.com/problems/maximum-depth-of-binary-tree/) · 本节为本站原创题意概括与解法。

**题意与思路：**空树深度为 0，非空树深度为左右子树最大深度加 1。

**为什么正确：**根到最深叶子的路径必然经过左右子树之一；归纳求出两边后选择更深的一边。

**手推例子：**单节点深度 1，三节点完全树深度 2，链状 n 节点深度 n。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#maxDepth

**复杂度：**时间 O(n)，递归栈 O(h)，最坏 O(n)。

**易错点：**不能把最小深度也直接写成 min(left,right)+1：单侧为空时要特殊处理。

**面试追问与回答：**线上节点数量巨大怎么办？改为显式栈或 BFS，并评估树宽/树高带来的内存需求。

## LC 98 验证二叉搜索树 {#lc-98}

[原题与约束](https://leetcode.com/problems/validate-binary-search-tree/) · 本节为本站原创题意概括与解法。

**题意与思路：**迭代中序遍历，检查访问值是否严格递增。

**为什么正确：**合法 BST 的整棵左子树都小于根、右子树都大于根，这等价于中序序列严格递增，而不是只比较父子关系。

**手推例子：**根 2、右孩子 3、3 的左孩子 0：父子局部看似部分合理，但中序出现 2→0，必须判错。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#validBST

**复杂度：**时间 O(n)，栈 O(h)，最坏 O(n)。

**易错点：**相等值在本题不允许；前驱初始化用 long 最小值，避免节点等于 Integer.MIN_VALUE 时误判。

**面试追问与回答：**允许重复值时怎么办？先明确重复值能出现在哪侧，再按边界的开闭性判断；简单非降序检查不一定表达指定放置规则。

## LC 236 二叉树的最近公共祖先 {#lc-236}

[原题与约束](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/) · 本节为本站原创题意概括与解法。

**题意与思路：**递归查找 p 与 q：两侧都找到则当前根是祖先，只有一侧找到则向上传递该侧。

**为什么正确：**若两目标分居左右子树，它们能首次汇合的位置就是当前节点；若同处一侧，答案也只能在该侧或其内部。

**手推例子：**在根 2 的两侧分别找到 1、3，返回根 2；若 p 就是根，直接返回 p。

### Java 实现

<<< @/../examples/algorithms/InterviewAlgorithms.java#lca

**复杂度：**时间 O(n)，调用栈 O(h)。

**易错点：**本实现依原题保证 p、q 都存在，并按节点身份比较；若有节点不存在，需要增加存在性校验。

**面试追问与回答：**BST 上如何优化？利用两目标值与根的大小关系向一侧走，单次查询 O(h)；大量静态树查询可进一步考虑倍增。
