---
title: 数据结构与版本差异
description: SDS、Hash、List、Set、ZSet、编码切换与版本演进
status: reviewing
baseline: Redis mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Redis P7 手册数据结构章节
---

# 数据结构与版本差异

> 版本边界：ziplist、listpack、quicklist 等内部编码持续演进。本文保留源资料解释，但具体编码阈值和默认值必须按目标 Redis 版本复核。

## 第二章 Redis 五大核心数据结构（底层原理）

### 2.1 String & SDS 动态字符串

#### 2.1.1 SDS 结构体

Plain Text
struct sdshdr{
int len; // 已使用长度，O(1)获取字符串长度
int free; // 未使用冗余空间
char buf[]; // 实际存储数据
}

#### 2.1.2 SDS 四大优势（对比C字符串）

O(1) 获取长度，C字符串为O(n)

二进制安全，支持存储任意数据（不截断\0）

内存预分配、惰性释放，大幅减少内存扩容次数

杜绝缓冲区溢出问题

### 2.2 Hash 结构

适用场景：存储结构化对象、用户信息、商品信息，可单独修改单个字段。

底层自适应切换：数据量小、字段短使用 **ziplist压缩列表**；数据量大自动转为**dict哈希表**。

### 2.3 List 结构

底层：QuickList（双向链表+ziplist），3.2版本后统一替代老式结构。

适用场景：简单消息队列、有序列表、分页查询。

使用方式：LPUSH生产、BRPOP阻塞消费。

### 2.4 Set 结构

底层哈希表实现，天然去重，支持交集、并集、差集。

适用场景：签到统计、用户关注、去重业务。

### 2.5 Zset 有序集合（面试重点）

底层双结构：**dict + skiplist跳表**

dict：存放成员与分值映射，单点查询O(1)

skiplist：负责排序、范围查询、分页

小数据量使用ziplist节省内存，大数据量自动切换跳表。

#### 2.5.1 为什么Zset用跳表不用红黑树？

跳表范围查询、分页遍历更简单高效

无复杂旋转逻辑，CPU开销更低

内存占用更小，实现轻量化

#### 2.5.2 跳表原理

多层级有序链表，随机生成层级，通过高层快速跳跃检索，平均复杂度O(logN)，平衡树稳定性、链表遍历优势。
