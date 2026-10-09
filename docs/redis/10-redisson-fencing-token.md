---
title: Redisson、分布式锁与 Fencing Token
description: 可重入锁、看门狗、发布订阅、失效窗口和下游条件写保护
status: reviewing
baseline: Redis mixed-version source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 两份 Redis 自有资料的分布式锁内容合并
---

# Redisson、分布式锁与 Fencing Token

> Fencing Token 必须由下游资源执行单调条件校验。它不是 Redis 或 Redisson 自动提供的全局正确性保证。

## 第十一章 Redisson 分布式锁（面试高频源码级考点）

### 11.1 核心数据结构

锁Key为自定义锁名，Value为Hash结构：field=线程唯一ID(UUID:threadId)，value=重入次数

### 11.2 加锁Lua脚本核心逻辑

锁不存在：创建锁，重入次数=1，设置过期时间

锁存在且是当前线程：重入次数+1，续期过期时间

锁存在且非当前线程：返回锁剩余时间，加锁失败

### 11.3 看门狗机制（自动续期核心）

未指定固定 `leaseTime`、且通过看门狗管理租期时，加锁成功后安排续期；默认 `lockWatchdogTimeout` 为 30 秒，续期调度与具体 Redisson 版本/配置有关。

显式指定 `leaseTime` 时，锁按给定租期到期，不应假设看门狗会无限续期。正常解锁会取消续期。

看门狗可降低业务执行较久导致的提前过期风险，但进程暂停、网络阻塞或故障仍可能让续期失败，不能阻止旧持锁者恢复后继续访问外部资源。

### 11.4 解锁Lua脚本逻辑

校验调用线程的所有权；非持锁线程解锁会触发 `IllegalMonitorStateException`，不能按成功解锁处理

重入次数-1

次数\>0：仅续期，不删除锁

次数=0：删除锁，发布解锁消息，唤醒等待线程

### 11.5 锁等待机制（发布订阅）

抢锁失败线程订阅解锁通道，锁释放后发布消息，唤醒等待队列线程重新抢锁，避免空轮询浪费CPU。

### 11.6 Redis锁核心缺陷与优化

异步复制和故障转移可能导致锁状态丢失。`min-replicas-to-write` 不是“当前写入未同步就拒写”，其准确限制见 [主从复制的写入保护边界](./07-replication-sentinel.md#min-replicas-的保护边界)。Redisson 的副本同步检查也需按所用版本和配置核验，不能据此推导任意拓扑、持久化和故障下的全局互斥。

使用 ZooKeeper 等协调服务同样不能让失去租约的旧进程自动停止访问数据库；外部资源的条件写保护仍需单独设计，性能则需按场景压测。

### 11.7 Fencing Token 防护令牌（P7超高频压轴考点）

#### 11.7.1 核心结论

若旧持锁者继续写入会破坏正确性，应让实际资源通过 fencing、版本条件更新或事务约束拒绝过时操作。是否采用 Fencing Token 取决于资源和故障模型，不按业务名称一概判断。

#### 11.7.2 出现的底层漏洞

即便有看门狗，极端卡顿仍会出现：**锁过期释放 \> 新线程抢锁执行业务 \> 旧线程恢复继续执行**，新旧线程并行写，覆盖数据，分布式锁彻底失效。

#### 11.7.3 Fencing Token 原理

普通 Redis 锁或 Redisson `RLock` 不会自动返回 fencing token。需显式采用令牌协议或 `RFencedLock` 等 API，为受保护资源的锁世代分配递增 token，并在每次写入时传递它。

资源端必须将“比较 token、更新最高已见 token、业务写入”作为一个原子操作，拒绝低于已接受 token 的请求。令牌分配也须在所承诺的故障模型下保持单调；仅用异步复制 Redis 上的 `INCR`，不能无条件证明故障转移后不倒退。

同一 token 下的请求重试仍需业务幂等。Fencing 拒绝的是落后于资源已见世代的写入，不代表锁到期瞬间就自动撤销旧进程的一切操作。

#### 11.7.4 实战执行逻辑

线程A加锁，获取 Token=100

线程A业务卡顿，锁超时自动释放

线程B抢到锁，获取新Token=101；数据库原子校验并记录101，同时完成业务更新

线程A恢复，携带旧Token=100尝试更新；数据库发现100小于已接受的101，拒绝写入

#### 11.7.5 最终面试标准答案

看门狗降低租期意外过期风险，fencing 让支持该协议的资源拒绝旧世代写入。它依赖令牌单调分配、资源端原子校验和完整写入覆盖，不能单凭“用了 Redisson”就宣称安全。实现条件统一见 [Fencing Token 原理](#_11-7-3-fencing-token-原理)。

## 版本与来源

本轮定向校准：2026-10-09，范围为普通锁与 fencing 的区别、看门狗和下游校验边界。

- [Redisson locks and synchronizers：RLock / RFencedLock](https://redisson.pro/docs/data-and-services/locks-and-synchronizers/)
- [Redis replication：异步复制与最小副本写入限制](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)
