# DOCX 增量内容合并设计

- 目标仓库：`lovelsf-int/backend-ai-interview-handbook-zh-cn`
- 功能分支：`feat/docx-incremental-merge`
- 设计日期：2026-09-02
- 状态：用户已批准实施

## 1. 目标

把四份自有 DOCX、一份扩展名为 `.doc` 的 OOXML 文档与一张自有架构图增量整合到现有 VitePress 站点，保持现有 canonical 页面可用，并把 Elasticsearch、Java 虚拟线程、MySQL 和系统设计内容提升到 P7/P8 的项目推导、故障路径和压力面深度。

本轮资料：

1. `Elasticsearch_P7_P8_完整面试手册_SOC_800到900万条_Primary150GB_事件告警分层版_v2.4.docx`
2. `Java虚拟线程生产实践指南_JDK21-25.docx`
3. `Elasticsearch_P7_P8_完整面试手册_SOC告警场景.docx`
4. `金余概_资深Java_AI-Agent开发_定制面试手册_v5.4_全量未答题补全版.docx`
5. `日本台湾双活订单系统架构图.png`
6. `mysql_07_08_000230.doc`（文件内容实际为 Word 2007+ OOXML）

源 DOCX 不进入 Git 历史。架构图由用户提供，可以作为站点图片发布，但必须使用 ASCII 路径、Alt Text 和正文解释。

## 2. 审计结论与事实优先级

- v5.4 中 1,213 个有效长段落有 875 个与站点正文完全重复；它是 v5.0 的增量版本，不建立第二套综合手册。
- ES v2.4 是当前 SOC 项目事实源：每日 800～900 万条是 Event 与 Alert 的业务记录总量；相关 Data Stream 的 Primary 总量约 150GB/日；`number_of_replicas: 1` 后物理存储起点约 300GB/日，不含水位、段合并、快照与安全余量。
- `SOC告警场景.docx` 使用每日 100 万条的旧容量示例，只作为 legacy 辅助。其容量与分片结论不得覆盖 v2.4，只吸收未重复的通用模型、检查清单和命令。
- 虚拟线程的版本事实以 JDK 21、24、25 官方资料为准：JDK 21 的 JEP 444；JDK 24 的 JEP 491；JDK 25 的 Scoped Values；JDK 25 Structured Concurrency 仍是 Preview。
- 日本—台湾系统级双活采用“业务分片级单写”：`home_region`、`active_region`、`epoch`/fencing 决定写主；故障恢复不引入应用双写。

## 3. 去重与冲突处理

去重顺序固定为：

1. 完全重复段落删除，不保留换标题的副本。
2. 语义重复时保留现有 canonical 原理页，新页面只写项目事实、推导过程、异常路径和差异边界。
3. 参数冲突时以当前用户确认的 v2.4 项目事实为准；旧 100 万条口径只在迁移清单中标记 legacy，不在推荐正文重复。
4. v5.4 的 AI、Kafka、Redis、MySQL、ES 通用题只链接对应 canonical 页面，不复制整段答案。
5. 项目量化指标必须标记“候选人提供，面试前本人核验”；官方机制和项目经验分开标注。

## 4. 信息架构

### 4.1 Elasticsearch

新增两页：

- `docs/elasticsearch/17-soc-event-alert-capacity.md`
  - Event、Alert、Raw、Normalized、AI Result 的数据边界。
  - 800～900 万业务记录、150GB Primary 与约 300GB 含副本存储的换算。
  - 按 Data Stream 分别计算主分片，不使用“全局固定 4 shard”。
  - `max_primary_shard_size` 35～40GB 是本项目压测起点，`max_age` 是兜底；低流量 Alert/AI 流避免每天制造微小分片。
  - Raw 与 Normalize 双流水线的一致性、幂等、DLQ 和重放边界。
- `docs/elasticsearch/18-soc-pressure-interview.md`
  - 搜索、Routing、热点、Merge、Bulk/429、聚合、生命周期、重建索引。
  - DB/ES 事实边界、AI 研判结果幂等、Hybrid Search。
  - 五轮项目压力面和排障命令清单。

现有 `07-shards-routing-capacity.md`、`10-production-runbook.md`、`14-interview-question-bank.md` 只增加指向项目页的入口，不重复正文。

### 4.2 Java 虚拟线程

保留 `concurrency-virtual-threads.md` 作为并发总览，新增：

- `docs/java/virtual-threads-jdk21-25.md`：调度模型、吞吐与延迟、JDK 21/24/25 差异、Pinning、Scoped Values、Structured Concurrency Preview。
- `docs/java/virtual-threads-production-patterns.md`：一任务一线程、Semaphore 舱壁、总 Deadline、CPU 岛、Spring/Tomcat/事务边界和完整代码范式。
- `docs/java/virtual-threads-observability-migration.md`：JFR、`jcmd`、调度器指标、压测矩阵、容量规划、灰度与回滚、Go/No-Go 清单。

三个页面不能把虚拟线程描述为“更快的线程”，也不能用固定大小的虚拟线程池承担限流职责。

### 4.3 v5.4 增量

新增：

- `docs/java/design-patterns-production-scenarios.md`：支付、Agent、RAG 中的 Strategy、Adapter、Factory、Registry、State Machine、Chain、Command、Decorator/Proxy、Composite、Facade，以及不用模式的判断。
- `docs/system-design/pressure-interview-playbook.md`：先讲不变量、事实边界、七段式回答、支付幂等、双活切换、事故与弱项防守。

现有 `finance-payment-ddd/03-design-patterns.md` 保留为概念 canonical；Java 新页只讲跨领域落地和模式边界。现有 `system-design/interview-strategy.md` 保留完整题库，新页只提供压力面压缩框架和交叉链接。

### 4.4 日本—台湾双活架构图

- 发布路径：`docs/public/images/system-design/japan-taiwan-active-active-order.png`。
- 在 `docs/system-design/overseas-payment.md` 中展示，并解释控制面、路由表、epoch/fencing、Outbox/Kafka、接管与恢复。
- `docs/system-design/global-subscription.md` 增加交叉链接，不复制图文。

### 4.5 MySQL 8.4 校准增量

保留 `transactions-locks-indexes.md` 作为总览，新增三篇 canonical 深入页：

- `docs/mysql/innodb-write-mvcc-transactions.md`：写入链路、Redo/Undo/Binlog、组提交、两阶段提交、Read View、快照读与当前读。
- `docs/mysql/locks-deadlocks-production-runbook.md`：记录锁、Gap/Next-Key、意向锁、MDL、访问路径决定锁范围，以及 Performance Schema 排障与幂等重试。
- `docs/mysql/index-explain-pagination-replication.md`：聚簇/二级索引、联合索引、`EXPLAIN ANALYZE`、Seek Pagination、Hash Join、GTID、Relay Log 与半同步边界。

原文的固定 TPS、B-Tree 二叉树、InnoDB 用户 Hash 索引、无索引等于表锁、半同步等于已应用、Redo 刷盘后删除、`NOT IN`/`<>` 必然不走索引、BNL 为 MySQL 8.4 默认等口径不得进入正文。机制以 MySQL 8.4 官方手册为准；硬件吞吐只保留可复现实验方法，不保留脱离 Schema、SQL、数据分布和持久化参数的固定结论。

## 5. 导航与治理

- 更新 Java、Elasticsearch、系统设计侧边栏及对应专题首页。
- `docs/migration-manifest.md` 保留 v5.0 来源并标记 `superseded`，新增四份 DOCX 与架构图的迁移记录。
- `tests/content-inventory.test.mjs` 先加入新来源、目标页与图片清单并验证 RED，再实现页面使其 GREEN。
- 不引入新运行时依赖；继续使用现有 VitePress、Mermaid、Node 测试与 Markdown 校验。

## 6. 内容质量与引用

- 所有新增页面使用现有 Front Matter，状态为 `verified` 或项目事实明确的 `reviewing`。
- JDK 版本结论引用 OpenJDK JEP 或 Oracle JDK 官方文档。
- Elasticsearch 机制引用 Elastic 官方文档；项目容量数字明确标注为候选人项目事实和压测起点。
- 不复制第三方长篇正文，不发布 Pandoc `media/` 导出图片，不链接 DOCX 作为主入口。
- 所有内部相对链接、H1、Front Matter、Markdown 和 VitePress 构建通过现有门禁。

## 7. 完成定义

只有同时满足以下条件才算完成：

1. 新增 10 个 P7/P8 页面和 1 张架构图，导航与专题首页可达。
2. 五份 Word 来源和架构图在迁移清单中各出现一次，角色和去重结果明确。
3. 旧 100 万条 ES 口径未进入当前项目推荐结论。
4. v5.4 未形成重复综合页面；只吸收语义新增内容。
5. `npm test`、`npm run lint:md`、`npm run validate:content` 和 `npm run docs:build` 全部通过。
6. Git diff 不含源 DOCX、密钥、Pandoc media 目录或构建产物。
7. 合并到远程 `main` 后 GitHub Pages 构建成功，新页面与图片返回 HTTP 200。
