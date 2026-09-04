# Elasticsearch 正式面试复盘：2026-09-04

> 场景：SOC AI Agent 智能研判平台，日安全事件约 800～900 万条。本文记录本轮正式面试已经暴露出的 ES / Kafka→ES 链路薄弱点，并给出面试可直接使用的回答框架。

## 1. 本轮总体评价

本轮不是“完全不会”，主要问题是：**知道技术点，但回答缺少结论、参数、因果链和生产处置顺序**。

面试回答建议统一采用：

> **结论 → 原理 → 项目参数/量级 → 异常场景 → 兜底方案**

不要从背景开始绕很久，尤其是 P7/P8 面试，前 20～30 秒必须让面试官听到核心结论。

---

## 2. 分片、热点租户与容量规划

### 本轮暴露的问题

- 能说出业务拆索引、30～50GB 分片经验值，但没有形成完整容量公式。
- 热点分片问题一开始过多关注节点 CPU/IO，没有先回答“如何发现 → 如何预防 → 如何兜底”。
- `routing`、独立索引、扩容、reindex 的边界没有一次说清。
- “一个索引一个主分片”不能作为固定结论，必须由实际数据量、写入吞吐、查询并发、恢复时间和节点能力共同决定。

### 面试标准回答

我不会先拍脑袋定分片数，而是先看：

1. primary 数据量；
2. 峰值写入吞吐；
3. 查询并发与查询 fan-out；
4. 单分片目标大小；
5. 节点磁盘、IO、CPU 与恢复时间要求。

SOC 场景会先按照数据源/业务属性拆 Data Stream，例如 HIDS、DLP、SkyEye 等，避免 mapping 和生命周期完全混在一起。再通过 ILM/Data Stream rollover 控制单个 backing index 的规模。

经验上可以把单 primary shard 控制在约 30～50GB 作为初始基线，但这不是 Elasticsearch 的硬限制，最终要用压测验证。

### 热点租户：发现 → 预防 → 兜底

**发现：**

- shard indexing rate / indexing latency；
- node CPU、heap、disk IO；
- merge time / merge throttling；
- write thread pool rejected；
- shard size 与磁盘水位；
- 按 tenant 统计写入量和 QPS，发现数据倾斜。

**预防：**

- 普通租户共享 Data Stream；
- routing 只有在查询和写入模型收益明确时使用，不能为了“均匀”盲目按 tenant routing；
- 超大租户达到阈值后独立 Data Stream/索引；
- size + age 双条件 rollover；
- 对异常租户做限流和配额控制。

**兜底：**

> 热节点资源不足时先横向增加 data node；如果现有 primary shard 数已经限制并行能力，则创建新的索引模板/目标索引，通过 rollover 或 reindex 迁移。迁移期间依靠 alias/Data Stream、Kafka 可重放或受控双写衔接增量，校验完成后切换读写入口，避免停写式迁移。

### 必须记住

**增加节点不会把一个已经存在的 primary shard 自动拆成两个 primary shard。**

所以“扩节点”和“增加分片并行度”是两个不同问题。

---

## 3. Refresh → Segment → Merge → IO

### 本轮暴露的问题

原理主链路基本正确，但回答时把 Bulk 大小过早混入题目，导致主因不突出；同时没有直接给出 `refresh_interval` 的具体建议。

### 原理链路

```text
Bulk/Index
   ↓
Indexing Buffer
   ↓
Refresh
   ↓
产生新的可搜索 Lucene Segment
   ↓
小 Segment 数量增加
   ↓
后台 Merge
   ↓
读旧 Segment + 写新 Segment
   ↓
Disk IO / CPU / 写放大
```

Refresh 越频繁，在高写入场景下越容易产生大量小 segment；segment 太多会增加搜索开销，并推动后台 merge。Merge 本身需要大量磁盘读写，因此可能出现：

```text
CPU 只有 50%
但 Disk IO 很高
写入 latency 上升
```

这时瓶颈可能主要在存储，而不是 CPU。

### refresh_interval 怎么设置

不要回答“调大一点”。

应该回答：

> 先看业务的搜索可见性 SLA。如果 SOC 告警允许 10～30 秒后可搜索，我会压测 10s、30s 等档位，并观察 indexing throughput、segment count、merge time、IO 和搜索延迟，再确定最终值。大批量历史导入时，如果业务允许，可以暂时关闭周期性 refresh，导入完成后恢复并执行 refresh。

核心原则：

> `refresh_interval` 是实时性与写入吞吐/merge 压力之间的 trade-off。

---

## 4. Refresh、Flush、Translog 必须彻底区分

这是本轮需要重点巩固的知识点。

### Refresh

解决：**什么时候能搜到。**

Refresh 会让内存中的索引变化形成新的 Lucene segment，并使其对搜索可见，但它不是“持久化成功”的定义。

### Translog

解决：**Lucene commit 之间的故障恢复。**

写入过程中操作同时记录到 translog。节点异常重启时，可以利用 translog 恢复尚未包含在 Lucene commit 中的操作。

因此：

> 数据还没 refresh，并不等于数据一定会丢。

### Flush

Flush 的核心效果可以概括为：

```text
执行 Lucene commit
      +
开始新的 translog generation
```

它和 refresh 的目的不同。

### 面试一句话

> Refresh 管可搜索性，translog 负责 Lucene commit 之间的故障恢复，flush 推进 Lucene commit 并滚动 translog generation；所以把 refresh_interval 从 1 秒调到 30 秒，主要增加的是搜索可见延迟，而不能简单理解为数据会因此丢失。

---

## 5. Kafka → Worker → Bulk → ES：429 背压

### 本轮暴露的问题

能够说出：

- ES 成功后再提交 offset；
- 429 应重试；
- Kafka 可以作为缓冲。

但缺少真正的**背压闭环**。

### 错误设计

```text
Kafka
  ↓ 无限 poll
Worker 内存队列
  ↓
ES 429
  ↓
继续堆积
  ↓
OOM
```

Kafka 本身就是持久化缓冲层，不应该在 ES 已经明显过载时继续无限拉取并堆到 JVM heap。

### 正确设计

```text
Kafka
  ↓
Consumer
  ↓
有界队列 / 有界 in-flight
  ↓
Bulk Worker
  ↓
Elasticsearch

ES 429 / latency↑
      ↓
降低并发 + 指数退避
      ↓
pause partitions / 控制 poll 与 in-flight
      ↓
数据主要积压在 Kafka
      ↓
ES 恢复
      ↓
渐进恢复消费
```

### 需要监控

- ES 429/rejected rate；
- Bulk P95/P99 latency；
- Kafka consumer lag；
- in-flight requests；
- Worker queue utilization；
- JVM heap/GC；
- ES merge/IO；
- 写入成功率。

不能只监控 CPU。

---

## 6. Offset 提交时机与 ES 幂等

### 基本原则

不要：

```text
poll → commit offset → 写 ES
```

否则 ES 写失败而消费者已经确认 Kafka 消息，会造成业务数据丢失。

推荐语义：

```text
poll
 ↓
处理
 ↓
ES 成功 / 不可重试消息可靠进入 DLQ
 ↓
推进可提交 offset
```

整个链路通常设计为 **at-least-once + ES 幂等**，而不是声称 Kafka 到 ES 天然 exactly-once。

### ES 幂等

SOC 告警可以构造稳定文档 ID，例如：

```text
sourceSystem + tenantId + eventId
```

重复消费时再次 index/upsert 同一 `_id`，避免生成重复文档。

如果业务存在版本顺序，还需要进一步考虑 external version / seq_no、状态机或业务版本控制，不能只靠 `_id`。

---

## 7. Bulk 1000 条，999 成功，1 条 mapping 错

### 本轮回答

已经正确识别：mapping error 通常属于不可重试错误，不能像 429 一样无限 retry。

### 需要补齐

Bulk API 是 item-level result：HTTP/Bulk 请求整体返回不代表 1000 条全部成功。

必须逐 item 判断。

```text
1000 条 Bulk
 ├─ 999 success → 完成
 └─ 1 mapping error
       ↓
     DLQ
       ↓
错误原因 + 原始数据 + index + tenant + offset + traceId
```

当这条消息已经**可靠持久化到 DLQ** 后，可以将它视为主消费链路已处理，从而推进相应 offset；否则不能为了让消费继续而直接丢弃。

### DLQ 后续处理

```text
DLQ
 ↓
告警
 ↓
定位 mapping/schema 问题
 ↓
修复 template / parser
 ↓
Replay
 ↓
重新写 ES
```

---

## 8. 105 遇到 429，106～10000 能不能先执行？

这是本轮比较有价值的一道追问。

### 第一层：业务是否要求顺序

如果同一业务实体的事件必须严格有序：

```text
105 → 106 → 107
```

105 未完成时不能随意让 106 改变最终状态，否则可能产生状态倒退或覆盖。

解决方向：

- Kafka message key 保证同一实体进入同一 partition；
- 单实体状态机；
- version/sequence 校验；
- 必要时同 key 串行。

### 第二层：不要求严格顺序

如果各事件独立，则没必要让一个 429 阻塞整个系统。

可以允许后续消息并发处理，但 offset 提交需要维护一个 **completed offset tracker / contiguous commit watermark**。

示意：

```text
100 ✓
101 ✓
102 ✓
103 ✓
104 ✓
105 retrying
106 ✓
107 ✓
...
10000 ✓
```

此时 106～10000 可以完成业务处理，但 Kafka 的连续安全提交水位不能越过仍未可靠处理的 105。

105 最终成功后：

```text
105 ✓
 ↓
连续完成区间形成
 ↓
commit watermark 快速推进
```

这可以同时解决：

- 避免业务 Worker 队头阻塞；
- 避免 offset 提前提交导致 105 丢失。

但实现时必须限制最大 in-flight window，否则 105 长时间失败而后面无限执行，仍然可能造成内存状态膨胀。

---

## 9. 429、Mapping Error、超时不能使用同一重试策略

面试时建议直接分类回答。

| 错误 | 类型 | 策略 |
|---|---|---|
| 429 rejected | 可重试 | backoff + jitter + 降并发 + 背压 |
| 5xx / 网络超时 | 通常可重试 | 有界重试，必须幂等 |
| mapping_parsing_exception | 通常不可重试 | DLQ + 告警 + 修 schema |
| illegal_argument_exception | 多数不可重试 | DLQ / 修配置 |
| 文档过大 | 业务/数据错误 | DLQ + 数据治理 |
| 认证/权限失败 | 配置错误 | 快速告警，不要无限重试 |

原则：

> Retryable Error 才 retry；Non-retryable Error 进入 DLQ。无限重试本身就是事故放大器。

---

## 10. ES 挂 30 分钟如何保证不丢数据

完整回答不能只有“Kafka 能存”。

需要形成闭环：

```text
Producer
   ↓
Kafka（持久化缓冲）
   ↓
Consumer
   ↓
ES 失败
   ↓
不提前 commit offset
   ↓
Backoff + Pause / 限制 in-flight
   ↓
Lag 增长，但 JVM 不 OOM
   ↓
ES 恢复
   ↓
渐进恢复消费
   ↓
ES _id 幂等抵御重复消费
```

同时 Kafka retention 必须覆盖最大预计故障窗口并留足安全余量，否则“Kafka 缓冲”只是口号。

---

## 11. 本轮必须背熟的 8 个结论

1. **分片数不是按文档条数拍脑袋决定，而是容量、吞吐、查询 fan-out、恢复时间共同决定。**
2. **30～50GB 是工程经验基线，不是 ES 硬限制。**
3. **Refresh 管搜索可见性，不等于持久化。**
4. **Flush ≠ Refresh；flush 会推进 Lucene commit 并滚动 translog generation。**
5. **频繁 Refresh → 更多小 Segment → 更多 Merge → IO 写放大。**
6. **ES 429 时不能继续把 Kafka 数据无限堆到 JVM，应建立有界 in-flight 和消费背压。**
7. **Kafka→ES 常用 at-least-once + 幂等，不要轻易宣称 exactly-once。**
8. **Bulk 必须逐 item 判断成功失败；429 重试，mapping error 通常 DLQ。**

---

## 12. 60 秒面试标准回答：Kafka → ES 写入事故

> 我们 Kafka 到 Elasticsearch 的链路不会依赖 JVM 内存队列无限吸收流量，而是把 Kafka 本身作为持久化缓冲。正常情况下 Consumer 批量 poll，通过有界的 Bulk Worker 写 ES；只有 ES item 成功，或者不可重试的数据已经可靠进入 DLQ 后，才推进对应的安全提交水位。遇到 429，我会认为 ES 已经产生背压，采用指数退避加 jitter，同时降低 Bulk 并发，并在 in-flight 达到阈值后 pause 对应 partition，让 lag 留在 Kafka，而不是把 Worker 堆到 OOM。ES 恢复以后渐进恢复消费，避免瞬时 backlog 再次把 ES 打挂。整个链路采用 at-least-once，所以 ES 文档使用稳定业务 ID 保证幂等。mapping error 这类不可重试错误不参与无限 retry，而是进入 DLQ，修复 schema 后再 replay。

这段回答建议做到可以直接口述。

---

## 13. 下一轮建议继续追问

下一轮 ES 面试优先补：

- refresh / flush / translog / fsync 完整写入时序；
- primary → replica acknowledgement；
- segment merge 与 delete/update；
- rollover、ILM、Data Stream；
- shard relocation/recovery；
- routing 热点与 routing_partition_size；
- Kafka offset 与异步 Bulk 的正确提交算法；
- ES partial bulk failure；
- 429 背压与生产级限流；
- reindex 零停机迁移与数据校验。

> 目标：从“知道 ES 概念”提升到“能把生产事故按机制、指标、参数、处置顺序讲完整”。
