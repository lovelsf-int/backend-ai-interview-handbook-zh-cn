---
title: 零停机重建索引与数据一致性
description: Alias、Reindex、双写、CDC、校验和回滚
status: reviewing
baseline: Elasticsearch 8.x/9.x; current official API reference checked 2026-10-09
last_verified: 2026-10-09
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# 零停机重建索引与数据一致性

## 源章节：零停机重建索引、数据一致性与同步链路

### 12.1 为什么需要重建索引

Mapping 字段类型、分词器、主分片数量等关键设置通常不能直接原地修改。生产中一旦需要修改这些内容，就要创建新索引并 reindex，然后通过 alias 原子切换。

### 12.2 Alias 零停机切换

**Alias 切换只原子发布路由变更，不提供跨索引数据事务。**下面示例针对普通 Index Alias，要求切换前两个别名都只指向 `order_v1`，且新索引已经达到后文验收水位。

```json
POST /_aliases
{
  "actions": [
    { "remove": { "index": "order_v1", "alias": "order_read", "must_exist": true } },
    { "remove": { "index": "order_v1", "alias": "order_write", "must_exist": true } },
    { "add": { "index": "order_v2", "alias": "order_read" } },
    { "add": { "index": "order_v2", "alias": "order_write", "is_write_index": true } }
  ]
}
```

- 不带严格存在性要求的多 Action 请求可能出现 `acknowledged: true`、`errors: true`：例如旧别名不存在导致 `remove` 失败，但 `add` 成功。不能只看 HTTP 200 或 `acknowledged`。
- 本例对两个 `remove` 都设置 `must_exist: true`，使缺失旧别名的前置条件错误阻止整组操作；具体失败响应应在目标 ES 版本演练。原子发布成功动作集，不等于任意错误都会自动补偿到原状态。
- 发布前读取当前 Alias，串行化迁移操作；发布后检查 `errors`/`action_results`（版本提供时）及 `GET /_alias/order_read,order_write`，确认读指向、唯一写索引与预期一致。超时或脚本重跑先查询状态，不盲目再次 `remove/add`。

官方依据：[Aliases 的多 Action 结果](https://www.elastic.co/docs/manage-data/data-store/aliases#multiple-action-results)与 [Aliases API 的 `must_exist`](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-indices-update-aliases)。

### 12.3 Reindex 标准流程

#### 快照、追平、切换与回滚门槛 {#rebuild-cutover-rollback}

下面是**以数据库为事实源、CDC 构建普通 ES 索引**的一种工程时序，需按实际连接器验证。`C0` 表示与全量一致性快照对应的日志起点，`H` 表示本次切换边界；多 Kafka Partition 时它们是位点向量，不能取一个全局最大 Offset 冒充全部追平。它们不是 Elasticsearch 自动生成的事务边界。

1. **固定契约。**冻结迁移期间 Mapping 变更；预建 v2 的 Mapping、Settings、Template。确定业务主键、租户/路由、单调源版本与删除表示；明确日志保留期覆盖全量、追平和回滚窗口。恢复 Refresh/Replica 的步骤也写入计划，不能导入结束后忘记。
2. **建立无缺口起点。**通过数据库/CDC 连接器支持的快照流程，取得与 `C0` 配套的一致性快照，并持久保存此后的增量，含删除事件。不能在任意全量扫描完成后才开始订阅 CDC，也不能把开始扫描的墙上时钟当日志位点。
3. **先全量，后增量落 v2。**本方案全量导入期间持续捕获 CDC，但先缓冲增量；确认全量所有批次完成后，再从 `C0` 之后按每主键版本重放。由此避免全量旧 v5 在 CDC v7 之后覆盖目标。若要并行写 v2，所有写路径必须使用同一版本比较契约，见下节。
4. **验证追平。**记录每分区连续成功应用的 checkpoint；单个更大 Offset 完成不能越过中间失败项。未修复的 DLQ、未处理的删除或 Schema 错误都阻止“完整追平”验收。按相同边界比对业务键、版本、内容摘要、删除状态、聚合与查询结果；仅文档数相等不够。灰度查询先验证召回、排序和延迟。
5. **设切换屏障。**选定高水位 `H`，暂停投影继续消费 `H` 之后的事件并排空旧 Worker 的在途写入；源 DB 可继续接收写入，后续日志留在可靠队列。等待 v1/v2 都无缺口应用到 `H`，恢复目标 Refresh/Replica、确认搜索可见和可用性后切 Alias。若客户端直接写 ES，必须由入口暂停/可靠排队并排空旧写入，或采用已验证的 Fence/路由代际机制；Alias 切换本身不阻止已解析到 v1 的请求迟到。
6. **切换并恢复消费。**按 12.2 核查 Alias 请求与最终状态；失败或结果未知时保持屏障并核对，不能让两批 Writer 各猜一个目标。确认后从 `H` 之后继续投影到 v2，并记录迁移代际和 checkpoint。这里保持读服务与源 DB 接收可用，但允许短暂搜索新鲜度延迟，不承诺没有任何写入等待。
7. **维持可回滚状态。**回滚期继续从同一事实日志向 v1 投影，或保留足够日志以便回滚前补齐。回滚时重新设水位 `H2`、排空在途写入，证明 v1 含切换后的新增/更新/删除并验证旧 Schema 仍能表示这些状态，才能切回。若 v1 只保留在 `H`，直接改回 Alias 会让新状态消失；不满足条件时先补齐或前向修复，不能宣称“一键无损回滚”。验收及回滚期结束后再按变更流程清理旧索引。

如果全量源是旧 ES 而非 DB，不可假定一次 `_reindex` 自动对应 DB 的 `C0`。必须由投影系统证明旧索引的日志覆盖与删除边界。例如可让 v1 投影停在已排空并 Refresh 的 `C0`，建立稳定导出视图后复制，并保留 `C0` 后日志；代价是这段期间 v1 新鲜度下降。无法建立无缺口契约时，应回到事实源重建，不能仅靠 `_reindex` 任务成功宣称在线一致。

### 12.4 数据一致性策略

| **问题** | **方案与边界** |
|---|---|
| 消息重复 | 使用带租户/来源域的业务键；同一普通索引/路由内去重。Data Stream 的跨 Rollover 边界见 [稳定 ID 与 Rollover](./17-soc-event-alert-capacity.md#rollover-idempotency) |
| 消息乱序 | 写入路径执行单调源版本比较；仅在 `_source` 保存 `version` 或 `update_time` 不会自动拒绝旧事件 |
| 消息丢失 | 可靠日志、连续 checkpoint、足够保留期及事实源对账；DLQ 是待修复缺口，不是完整同步成功 |
| ES 写失败 | 逐 Item 分类、有界重试、DLQ 和修复后重放；检查 Reindex 的失败/冲突明细 |
| 删除同步 | 保留带源版本的 Tombstone，所有查询/回源路径识别删除；清理必须晚于允许的迟到/回放窗口 |

#### 版本字段必须参与条件写入

默认 `_reindex` 使用 `internal`，会覆盖目标相同 ID 的文档，哪怕 `_source.version` 的值更旧。`dest.version_type: external` 比较的是参与 ES 写入的版本元数据；全量和 CDC 必须使用同一可比较、对每主键单调递增的源版本。旧 ES 的内部 `_version`、业务 `source_version`、数据库日志坐标与 `_seq_no` 不能混作同一种版本。仅写一个普通字段不生效；源 ES 未保存正确的外部版本时，应由受控导入器/脚本显式映射并验证，不能直接拿其内部计数与 CDC 版本比较。

严格 `external` 只接受更大的版本；相同版本重试可能返回 409，需按事件 ID/内容摘要辨别重复与冲突。`external_gte` 允许同版本覆盖，只有已证明同版本必为同状态时才评估，不能用它掩盖并发冲突。`conflicts: proceed` 只允许跳过版本冲突，并不证明目标完整或其他错误可忽略。[官方 Reindex 版本规则](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-reindex)

物理 Delete 后，ES 仅在 `index.gc_deletes` 配置的有限时间内保留删除版本，不能把它当长期防复活账本。因此本方案在源日志及投影中保留带版本的逻辑删除记录，或由可靠版本账本阻止旧事件；超过最大重放窗口并完成对账后才清理。查询 Filter、按 ID 回取与迁移导出都要处理 Tombstone，不能只在一个 Alias Filter 上隐藏。[官方 Delete API 版本保留说明](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-delete)

**验收反例：**全量 v5 晚于 CDC v7、delete v8 后迟到 v6、某分区缺一条但最大 Offset 已前进、切换前在途写入迟到、切换十分钟后回滚、重复提交 Alias 操作。预期分别是旧状态不覆盖、不复活、不提前宣布追平、无旧目标漏写、回滚不丢新增状态、状态可核对。这里列的是待执行演练，不代表已验证目标集群。

### 12.5 双写为什么危险

业务代码同时写 DB 和 ES 容易出现部分成功、顺序错乱、重试不一致。更可靠的方式是 DB 事务提交后通过 binlog/CDC 产生事件，ES 由异步消费者构建读模型。

> **面试回答**
>
> 如果问“如何保证 MySQL 与 ES 一致”，不要承诺强一致。标准答案是：DB 是事实源，ES 是异步读模型；通过 CDC/Kafka、幂等 \_id、版本控制、失败重试、DLQ、定时校验和补偿，将不一致窗口控制在业务可接受范围内。

## 版本与验证范围

2026-10-09 核对 Elastic 官方 Alias、Reindex、Delete API 文档；上述 CDC 屏障和回滚流程是基于这些 API 边界的工程设计，不是 API 自带的端到端保证。未连接目标 ES/CDC 环境执行迁移，落地前应锁定版本并运行本页反例。目标若是 Data Stream，Reindex 只允许 `op_type: create` 追加，不能直接套用本页普通索引的更新/删除投影方案。
