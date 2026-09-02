---
title: MySQL 事务、锁、索引与分片总览
description: InnoDB 事务、锁、索引、分页、复制与分片的 P7/P8 学习地图
status: verified
baseline: MySQL 8.4 official semantics with project-specific validation required
last_verified: 2026-09-02
level: P7/P8
source: 综合手册与 mysql_07_08_000230.doc，经官方资料校准并去重
---

# MySQL 事务、锁、索引与分片总览

这页只保留答题框架，完整机制和生产 Runbook 分到三篇 canonical 深入页：

1. [InnoDB 写入、MVCC 与事务一致性](./innodb-write-mvcc-transactions.md)
2. [InnoDB 锁、死锁与生产排障](./locks-deadlocks-production-runbook.md)
3. [InnoDB 索引、执行计划、分页与复制](./index-explain-pagination-replication.md)

## P8 回答结构

面对 MySQL 问题，不从名词定义开始堆砌，而按以下顺序展开：

1. **业务不变量**：不能重复扣款、状态只能单向演进，还是只要求最终一致。
2. **版本与前提**：MySQL 版本、隔离级别、持久化参数、复制模式。
3. **数据与访问模式**：Schema、索引、数据分布、热点、SQL 与事务边界。
4. **内部机制**：访问路径、锁、MVCC、日志、代价模型和复制状态。
5. **故障路径**：死锁、超时、崩溃、主从延迟、切换和回切。
6. **观测证据**：执行计划、锁等待图、事务与日志指标、业务对账。
7. **方案权衡**：吞吐、P99、一致性、恢复目标、复杂度和回滚方案。

## 高频专题地图

| 主题 | 必须讲清 | 常见错误 |
|---|---|---|
| 写入链路 | Buffer Pool、Undo、Redo、Binlog、Checkpoint | 提交等于数据页已刷盘 |
| MVCC | Undo 版本链、Read View、快照读/当前读 | MVCC 等于乐观锁 |
| 隔离级别 | RC 每次一致性读新快照；RR 首次一致性读建快照 | RR 快照必在 `BEGIN` 创建 |
| 锁 | 访问路径决定 Record/Gap/Next-Key 范围 | 无索引就升级成表锁 |
| 索引 | 聚簇/二级、回表、覆盖、写放大 | B-Tree 是二叉树 |
| 执行计划 | 估算与实际行数、成本和循环次数 | 所有 SQL 必须达到 `range` |
| 分页 | 稳定排序键与 Seek Pagination | 缓存全量 ID 是通用解 |
| 复制 | Receiver、Relay Log、Applier、GTID | 半同步 ACK 等于已应用 |
| 分片 | 路由、扩容、回填、校验、切换状态机 | 一致性哈希自动解决迁移 |

## 三个代表性场景

### 用户最近 100 条订单

典型索引可从 `(user_id, created_at, id)` 起步，使用 `created_at + id` 作为稳定游标。是否加入租户、品牌或状态，要由真实查询频率、数据分布和排序契约决定。

### 支付状态更新

用唯一幂等键和带旧状态/版本号的条件更新保护不变量；检查影响行数。外部支付调用不放进长事务，使用状态机、Outbox 和对账修复跨系统不确定性。

### 分库分表扩容

扩容是可暂停、可校验、可回滚的数据迁移状态机：新旧路由版本、单写 + CDC 或受控双写、历史回填、增量追平、校验、灰度切读、停止旧写和清理。跨分片分页与聚合成本必须进入接口设计。

## 回答边界

- 固定硬件配置不能推出通用 TPS；容量结论必须绑定 Schema、事务脚本、数据分布、持久化参数和 SLO。
- MyISAM 不是“读多就选”的现代默认方案；事务、一致性、崩溃恢复与运维能力通常使 InnoDB 成为主流选择。
- MVCC 不会自动保护支付状态机、额度扣减或外部副作用。
- 索引不是越多越好；读收益要与写放大、空间和缓存成本一起验证。
- GTID 与半同步降低切换风险，但不替代写入权 fencing、数据校验和回切流程。

## 延伸阅读

- [金融支付：幂等与一致性](../finance-payment-ddd/05-idempotency-consistency.md)
- [全球订阅与跨区数据库容灾](../system-design/global-subscription.md)
- [日本—台湾双活支付架构](../system-design/overseas-payment.md)
