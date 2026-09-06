---
title: MySQL 性能归因、Online DDL 与发布治理
description: 从 Performance Schema、执行计划漂移和资源瓶颈到 Online DDL、元数据锁与灰度回滚
status: verified
baseline: MySQL 8.4 Reference Manual with workload-specific validation required
last_verified: 2026-09-06
level: P7/P8
source: MySQL 8.4 官方文档与生产故障治理实践
---

# MySQL 性能归因、Online DDL 与发布治理

> “SQL 变慢”和“在线 DDL”都不是只看一条语句的问题。P7/P8 回答要把执行计划、锁、缓存、日志、I/O、连接、复制和变更时间线串成证据链，再给止血、验证与回滚方案。

## 90 秒性能排查回答

我先确认影响范围、开始时间和最近变更，再把延迟拆到应用连接池、MySQL 排队、锁等待、SQL 执行、存储 I/O 和副本读取。SQL 层对比慢日志、Digest、真实参数、执行计划估算与实际行数；并发层看活跃连接、长事务、行锁和元数据锁；资源层看 CPU、磁盘延迟、Buffer Pool 命中与脏页、Redo Checkpoint 压力；复制层区分接收延迟和应用延迟。

止血可能是回滚发布、限流、终止确认无害的阻塞会话、切回稳定计划或暂停 DDL。根因修复后，要在相同数据分布和并发下验证 P95/P99、扫描行数、锁等待、磁盘延迟和复制延迟，而不是只看单条 SQL 执行一次变快。

## 六层性能故障树

| 层次 | 关键问题 | 证据 |
|---|---|---|
| 流量与变更 | 流量、参数、发布、批任务是否变化 | QPS、变更记录、时间线、Trace |
| 连接与线程 | 连接池是否耗尽，MySQL 是否排队 | Active/Idle/Wait、Threads、连接错误 |
| SQL 与计划 | 计划是否漂移，估算与实际是否偏离 | Digest、慢日志、EXPLAIN ANALYZE |
| 事务与锁 | 是否有长事务、热点行、MDL 阻塞 | 锁等待图、事务年龄、阻塞会话 |
| 缓存与日志 | 工作集是否失配，刷脏与 Redo 是否追不上 | Buffer Pool、脏页、LSN、Checkpoint |
| I/O 与复制 | 存储延迟或副本应用是否成为瓶颈 | fsync/读写延迟、Relay/Applier 状态 |

不要在看到 `Using index`、高 CPU 或 Buffer Pool 命中率后就停止。单一指标只能缩小范围，不能直接证明根因。

## Performance Schema 与 sys 怎么分工

Performance Schema 提供服务器运行时事件与汇总表，包括语句、阶段、等待、事务、锁、内存和复制线程信息。`sys` Schema 在其上提供更易读的视图和诊断入口。

常用调查方向：

- `events_statements_summary_by_digest`：按归一化 SQL 聚合次数、总耗时、扫描行数等；
- `events_statements_history_long`：查看近期语句样本和时间；
- `events_waits_*`、`file_summary_*`：分析锁和文件 I/O 等等待；
- `data_lock_waits`、`metadata_locks`：建立行锁或元数据锁阻塞关系；
- `memory_summary_*`：观察服务器内部内存归因；
- `replication_applier_status*`：查看复制应用线程状态。

采集并非没有成本。生产环境应明确开启了哪些 Instrument/Consumer、历史表容量和保留窗口；临时加深观测后要评估成本并恢复治理配置。

## 执行计划为什么会漂移

相同 SQL 可能因为以下变化选择不同计划：

- 数据量和分布发生变化；
- 持久化统计信息或直方图不再代表当前数据；
- 参数值差异导致选择性不同；
- 索引增加、删除或变为不可见；
- MySQL 版本、优化器开关或代价参数变化；
- Join 输入规模和临时表成本变化；
- 缓存热度、并发和资源压力使真实成本改变。

排查流程：

1. 保存慢 SQL 的完整模板、真实参数和时间窗口；
2. 对比历史与当前执行计划；
3. 使用安全环境的 `EXPLAIN ANALYZE` 对比估算/实际行数与循环次数；
4. 检查统计信息更新时间、直方图和数据偏斜；
5. 用不可见索引、候选索引或 SQL 改写做可回退实验；
6. 在代表性并发下验证，不以单次低延迟作为结论。

`ANALYZE TABLE` 也不是无风险的“刷新按钮”。执行前要评估目标版本、表规模、元数据锁、资源消耗和计划改变风险。

## Buffer Pool 命中高为什么仍可能慢

高命中率只能说明多数页访问未走物理读，仍可能存在：

- 热点页和内部 Latch 竞争；
- 扫描行数过多，CPU 消耗高；
- 脏页比例高，后台刷盘追不上；
- Redo 空间与 Checkpoint 推进形成前台压力；
- 锁等待或长事务与缓存命中无关；
- 临时表、排序、网络传输和返回行过大；
- 命中率是全局平均，掩盖某个表或时间窗口的冷读。

回答容量问题时要同时报告吞吐、延迟分位数、工作集、读写比、并发、存储延迟和持久化参数。

## Online DDL 的三种算法

| 算法 | 高层含义 | 主要风险 |
|---|---|---|
| `INSTANT` | 主要修改数据字典/元数据，不重写现有行 | 仅部分操作支持，仍有元数据锁和版本限制 |
| `INPLACE` | 避免完整旧表到新表复制，但可能重建表或索引 | 资源消耗、日志空间、短暂锁和复制压力 |
| `COPY` | 创建新表、复制数据后切换 | 时间长、额外空间大、并发 DML 受限 |

MySQL 8.4 对部分加列、删列操作默认可使用 `INSTANT`，但这不等于“所有 ALTER 都瞬时”。改变数据类型等操作仍可能需要 `COPY`；某些 `INPLACE` 操作虽然允许 `LOCK=NONE`，仍会大量重组数据。

生产 DDL 应显式声明期望的 `ALGORITHM` 和 `LOCK`，让不支持的操作尽早失败，避免服务器静默采用比预期更重的路径。具体支持矩阵必须按目标 MySQL 版本、表特性和 DDL 类型查询官方文档。

## LOCK=NONE 也不等于零阻塞

任何 DDL 都需要在生命周期的某些阶段取得元数据锁。长事务持有表的元数据锁时，DDL 可能等待；等待中的独占 DDL 又可能让后续请求排队，形成看似突然的业务雪崩。

上线前至少检查：

- 是否存在长事务或未提交会话；
- `metadata_locks` 是否已有等待；
- 目标表是否被高频访问或被外键关联；
- DDL 需要的算法、锁级别、额外磁盘空间和预计时长；
- 副本能否承受日志和应用压力；
- 超时后是安全退出、继续后台执行，还是进入未知状态。

终止客户端不应被默认视为 DDL 已停止，必须查询服务器实际线程和表状态。

## 大表变更发布 Runbook

### 变更前

1. 固定 Schema、MySQL 版本、表大小、增长速度和峰值 QPS。
2. 在同版本、近似数据分布环境验证算法和耗时。
3. 检查长事务、MDL、磁盘余量、Redo/Binlog 和副本延迟。
4. 定义硬护栏：P99、错误率、MDL 等待、磁盘延迟、复制延迟。
5. 准备停止条件和回退方案；删除列等不可逆动作采用 Expand/Contract。

### 变更中

1. 低峰执行并限制同类高风险操作并发。
2. 持续监控业务延迟、锁、I/O、Redo、Binlog 和副本应用。
3. 先在一组副本或小流量环境验证，再逐步推进。
4. 达到护栏立即停止放量，并确认停止动作本身是否安全。
5. 保留完整审计：操作者、SQL、开始时间、算法、锁级别与结果。

### 变更后

1. 校验 Schema、一致性和关键查询计划。
2. 对比 P50/P95/P99、扫描行数、锁等待和副本延迟。
3. Expand/Contract 模式先完成代码双读/双写或兼容迁移，再在后续版本清理旧列。
4. 复盘估算误差、护栏和自动化能力。

## 无法直接回滚的 DDL 怎么办

数据库结构变更的回滚成本往往高于代码回滚。稳妥策略是向前兼容：

- 先 Additive Change，不立即删除或改名；
- 新旧应用版本同时兼容；
- 必要时回填数据并做双写/校验；
- 灰度读取新字段；
- 稳定后停止旧写入；
- 最后清理旧字段和索引。

索引新增可通过不可见索引或受控实验降低计划风险，但是否支持、是否影响写入成本和复制压力仍需在目标版本验证。

## 复制延迟要拆成哪几段

“Seconds Behind” 类单值不能解释全部原因。至少区分：

1. Source 提交到 Binlog 可发送；
2. Replica 接收并写入 Relay Log；
3. Applier 调度和执行事务；
4. 副本提交后查询可见；
5. 业务路由是否真的读到该副本。

网络、Source 生成日志速度、单个大事务、写热点、表缺索引、并行复制配置、磁盘延迟和副本并发读都可能影响不同阶段。恢复后还要确认积压清零和 Read-Your-Writes 语义，而不是只看线程重新运行。

## P7/P8 连续追问

### 生产 SQL 慢但测试环境数据量相近，下一步看什么

数据量相近不等于数据分布、缓存热度、并发、锁、统计信息、存储、网络和连接池相同。先用同一 SQL Digest 和真实参数对齐计划，再按时间线排查长事务、资源竞争和环境差异。

### DDL 卡住，直接 kill 行不行

先确认它在等待 MDL、扫描/重建，还是进入提交切换阶段，并评估终止产生的回滚和资源成本。找到阻塞链后，优先处理业务上可安全终止的长事务；不能只看到 DDL 线程就盲目 kill。

### 为什么加索引会把副本拖慢

DDL 会消耗 CPU、I/O 和临时空间，并产生需要传输和应用的日志或在副本执行相应变更；同时业务写入仍在竞争资源。副本延迟可能扩大并影响读流量或故障切换安全性。

### 优化后平均延迟下降但 P99 上升，算成功吗

不能直接算。高分位可能受锁等待、Checkpoint、缓存失效或周期任务影响。验收应预先定义平均值与尾延迟护栏，并检查错误率、资源和业务超时；对关键交易通常 P99 恶化就是阻断项。

## 官方依据

- [MySQL 8.4 Online DDL Operations](https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl-operations.html)
- [MySQL 8.4 Metadata Locking](https://dev.mysql.com/doc/refman/8.4/en/metadata-locking.html)
- [MySQL 8.4 Query Profiling Using Performance Schema](https://dev.mysql.com/doc/refman/8.4/en/performance-schema-query-profiling.html)
- [MySQL 8.4 sys Schema](https://dev.mysql.com/doc/refman/8.4/en/sys-schema.html)
- [MySQL 8.4 Persistent Optimizer Statistics](https://dev.mysql.com/doc/refman/8.4/en/innodb-persistent-stats.html)
- [MySQL 8.4 Monitoring Replication Main Threads](https://dev.mysql.com/doc/refman/8.4/en/replication-threads-monitor-main.html)
