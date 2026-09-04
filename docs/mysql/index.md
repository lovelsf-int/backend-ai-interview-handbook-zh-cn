---
title: MySQL 原理与架构面试
description: 面向交易与高并发场景的 InnoDB、事务、锁、索引、复制、分片和迁移专题
status: verified
baseline: MySQL 8.4 official semantics with project-specific validation required
last_verified: 2026-09-04
level: P7/P8
source: 资深 Java / AI Agent 定制面试手册自有资料
---

# MySQL 原理与架构面试

## 事务与存储

- [事务、锁、索引与分片总览](./transactions-locks-indexes.md)
- [InnoDB 写入、MVCC 与事务一致性](./innodb-write-mvcc-transactions.md)
- [金融支付：幂等与一致性](../finance-payment-ddd/05-idempotency-consistency.md)
- [全球订阅与跨区数据库容灾](../system-design/global-subscription.md)

先讲清 redo log、undo log、binlog、MVCC、隔离级别与提交顺序，再讨论分库分表、跨区同步和外部系统一致性。

## 索引与查询

- [InnoDB 索引、执行计划、分页与复制](./index-explain-pagination-replication.md)

回答索引题时要结合数据分布、选择性、回表、覆盖索引、排序、分页、执行计划和复制延迟，不能只背最左匹配原则。

## 锁与故障排查

- [InnoDB 锁、死锁与生产排障](./locks-deadlocks-production-runbook.md)

排查时先明确事务边界和隔离级别，再看锁等待、死锁日志、慢 SQL、执行计划和应用重试。止血措施与长期索引、事务和访问顺序治理要分开说明。

生产问题必须结合目标 MySQL 版本、隔离级别、表结构、数据分布、执行计划和故障模型验证。
