---
title: 零停机重建索引与数据一致性
description: Alias、Reindex、双写、CDC、校验和回滚
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# 零停机重建索引与数据一致性

## 源章节：零停机重建索引、数据一致性与同步链路

### 12.1 为什么需要重建索引

Mapping 字段类型、分词器、主分片数量等关键设置通常不能直接原地修改。生产中一旦需要修改这些内容，就要创建新索引并 reindex，然后通过 alias 原子切换。

### 12.2 Alias 零停机切换

**Alias 切换**

> \# 当前：order_read/order_write -\> order_v1
>
> \# 目标：构建 order_v2 后原子切换 alias
>
> POST /\_aliases
>
> {
>
> "actions": \[
>
> { "remove": { "index": "order_v1", "alias": "order_read" } },
>
> { "remove": { "index": "order_v1", "alias": "order_write" } },
>
> { "add": { "index": "order_v2", "alias": "order_read" } },
>
> { "add": { "index": "order_v2", "alias": "order_write", "is_write_index": true } }
>
> \]
>
> }

### 12.3 Reindex 标准流程

31. 冻结旧索引 mapping 变更，确认新 mapping/settings/template。

32. 创建新索引 v2，设置合理 refresh_interval 和 replicas。

33. 从 DB 或旧 ES 全量回灌，记录 checkpoint。

34. 消费增量 CDC，保证 \_id 幂等写入。

35. 做一致性校验：文档数、抽样字段、业务聚合校验。

36. 灰度读流量到 v2，观察慢查询、错误率、召回差异。

37. 通过 alias 原子切换；保留旧索引一段时间以便回滚。

### 12.4 数据一致性策略

| **问题**  | **方案**                                                |
|-----------|---------------------------------------------------------|
| 消息重复  | \_id 使用业务主键；写入幂等；版本字段控制新旧事件       |
| 消息乱序  | 使用 update_time/version/seq 字段，旧事件不覆盖新事件   |
| 消息丢失  | Kafka 持久化、消费者 checkpoint、定时 DB-\>ES 校验补偿  |
| ES 写失败 | 失败队列 DLQ，按错误类型重试或人工修复                  |
| 删除同步  | 软删除字段 is_deleted 或 delete event；查询 filter 排除 |

### 12.5 双写为什么危险

业务代码同时写 DB 和 ES 容易出现部分成功、顺序错乱、重试不一致。更可靠的方式是 DB 事务提交后通过 binlog/CDC 产生事件，ES 由异步消费者构建读模型。

> **面试回答**
>
> 如果问“如何保证 MySQL 与 ES 一致”，不要承诺强一致。标准答案是：DB 是事实源，ES 是异步读模型；通过 CDC/Kafka、幂等 \_id、版本控制、失败重试、DLQ、定时校验和补偿，将不一致窗口控制在业务可接受范围内。
