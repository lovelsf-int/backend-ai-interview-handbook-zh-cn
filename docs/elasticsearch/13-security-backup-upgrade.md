---
title: 安全、备份、升级与运维治理
description: 访问控制、快照、恢复演练、升级和变更治理
status: reviewing
baseline: Elasticsearch mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: Elasticsearch 深度原理、生产调优与面试题自有资料
---

# 安全、备份、升级与运维治理

## 源章节：安全、备份、升级与运维治理

### 13.1 安全基线

- 开启认证授权，禁止 ES 直接暴露公网。

- 业务系统使用最小权限账号，只允许访问必要 index 和 API。

- 开启 TLS，尤其是跨机房、云环境、合规场景。

- 敏感字段在写入前脱敏或加密，避免误被搜索。

- 审计管理操作：delete index、close index、update settings、snapshot restore。

### 13.2 Snapshot 与 Restore

副本不是备份。副本可以抵抗单节点故障，但不能防止误删、逻辑错误、勒索、全盘损坏。生产必须配置 snapshot repository，并定期演练恢复。

**快照示例**

> \# 注册仓库示例（以文件系统仓库为例，实际生产常用对象存储）
>
> PUT \_snapshot/my_backup
>
> {
>
> "type": "fs",
>
> "settings": {
>
> "location": "/mount/backups/es",
>
> "compress": true
>
> }
>
> }
>
> PUT \_snapshot/my_backup/snap_2026_07_07?wait_for_completion=false
>
> {
>
> "indices": "orders-\*,products-\*",
>
> "include_global_state": false
>
> }
>
> GET \_cat/snapshots/my_backup?v

### 13.3 升级治理

38. 阅读目标版本 breaking changes。

39. 备份快照并验证可恢复。

40. 先升级测试环境，跑核心 DSL、索引模板、客户端兼容性。

41. 滚动升级时优先升级非 master，再升级 master，遵循官方版本路径。

42. 升级后观察 cluster health、GC、慢查询、写入拒绝、ILM。

### 13.4 运维治理制度

| **治理项** | **建议**                                                       |
|------------|----------------------------------------------------------------|
| 索引申请   | 必须说明数据量、保留期、QPS、字段数、分片数                    |
| 模板管理   | 统一 index template/component template，不允许业务随意 dynamic |
| 容量巡检   | 每周检查 shard 数、磁盘水位、segment、GC、慢日志               |
| 变更审批   | 删除索引、修改副本、调整集群级参数需要审批                     |
| 故障演练   | 快照恢复、节点下线、磁盘满、别名回滚                           |
