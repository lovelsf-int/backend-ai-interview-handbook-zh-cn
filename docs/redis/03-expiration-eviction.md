---
title: 过期删除、内存淘汰与 Rehash
description: 惰性/定期删除、淘汰策略和渐进式 Rehash 的执行边界
status: reviewing
baseline: Redis mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Redis P7 手册全局机制章节
---

# 过期删除、内存淘汰与 Rehash

## 第三章 Redis 全局核心机制（过期、内存淘汰、渐进式Rehash）

### 3.1 Key 过期删除策略（必考）

Redis 采用 **惰性删除 + 定期删除** 双策略，不使用定时删除。

#### 3.1.1 惰性删除

访问Key时校验TTL，过期直接删除。优点：零CPU损耗；缺点：过期冷门Key长期占用内存。

#### 3.1.2 定期删除

每100ms随机抽取部分带TTL的Key清理，控制单次执行时长，避免阻塞主线程。平衡CPU与内存使用率。

### 3.2 内存淘汰策略（8大策略·P7重点）

过期策略无法清理全部无效Key，内存打满时触发**内存淘汰机制**。

#### 3.2.1 策略分类

**1、只淘汰带TTL的Key（volatile系列）**

volatile-lru：淘汰过期Key中最少使用（生产常用）

volatile-lfu：淘汰过期Key中使用频次最低

volatile-ttl：淘汰剩余存活时间最短

volatile-random：随机淘汰过期Key

**2、淘汰全部Key（allkeys系列）**

allkeys-lru：全局最少使用（通用推荐）

allkeys-lfu：全局最低频次

allkeys-random：全局随机淘汰

**3、禁止淘汰**

noeviction：内存满直接报错，不删除任何数据（默认策略，生产不推荐）

### 3.3 渐进式 Rehash 原理

Redis哈希表扩容/缩容不一次性迁移数据，避免阻塞主线程，采用**渐进式Rehash**。

同时保留新旧两张哈希表，新表扩容分配空间

每次增删改查，迁移当前索引位置数据

逐步迁移，分批分摊压力

全部迁移完成后，释放旧哈希表

核心价值：避免一次性大数据迁移导致主线程卡顿、服务不可用。
