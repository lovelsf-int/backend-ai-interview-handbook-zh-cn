---
title: MySQL 原理与架构面试
description: 面向交易与高并发场景的 InnoDB、事务、锁、索引、复制、分片和迁移专题
status: verified
baseline: MySQL 8.4 official semantics with project-specific validation required
last_verified: 2026-09-02
level: P7/P8
source: 资深 Java / AI Agent 定制面试手册自有资料
---

# MySQL 原理与架构面试

## 阅读入口

- [事务、锁、索引与分片总览](./transactions-locks-indexes.md)
- [InnoDB 写入、MVCC 与事务一致性](./innodb-write-mvcc-transactions.md)
- [InnoDB 锁、死锁与生产排障](./locks-deadlocks-production-runbook.md)
- [InnoDB 索引、执行计划、分页与复制](./index-explain-pagination-replication.md)
- [金融支付：幂等与一致性](../finance-payment-ddd/05-idempotency-consistency.md)
- [全球订阅与跨区数据库容灾](../system-design/global-subscription.md)

生产问题必须结合目标 MySQL 版本、隔离级别、表结构、数据分布、执行计划和故障模型验证。
