---
title: Java IO、NIO、Reactor 与 Netty 面试手册
description: 从 BIO/NIO/AIO、Channel/Buffer/Selector、epoll、Reactor、零拷贝到 Netty 线程模型与生产排障
status: verified
baseline: Java NIO / Linux I/O multiplexing / Netty production model
last_verified: 2026-09-04
level: P7/P8
source: Java NIO 官方 API、Linux I/O 多路复用机制与 Netty 工程实践整理
---

# Java IO、NIO、Reactor 与 Netty 面试手册

> 面试答 IO 不要只背“BIO 阻塞、NIO 非阻塞”。P7/P8 要能从 **系统调用、线程模型、I/O 多路复用、Reactor、零拷贝、背压和生产排障** 串起来。

## 1. 90 秒面试总答

> Java 传统 BIO 通常是一连接一阻塞处理线程，代码简单，但高连接数下线程、栈内存和上下文切换成本高。NIO 引入 `Channel`、`Buffer` 和 `Selector`，应用线程可以通过一个 Selector 监听多个 Channel 的就绪事件，再把读写和业务处理分开。Linux 上常见底层实现是 epoll，macOS 常见是 kqueue。
>
> NIO 解决的是“如何用较少线程管理大量连接”，不是让网络本身变快。工程上通常采用 Reactor 模型：EventLoop 负责 accept/read/write 等 I/O 事件，CPU 或阻塞业务任务交给独立业务线程池，避免阻塞事件循环。Netty 把 Selector、Channel、Pipeline、ByteBuf、EventLoop 等进行了工程化封装，并提供连接管理、编解码、内存池和背压能力。
>
> 文件传输还要区分普通 `read/write`、`mmap` 和 `sendfile/transferTo`。所谓零拷贝不是绝对“0 次内存复制”，而是减少用户态/内核态切换和不必要的数据复制。生产排障要同时看 EventLoop 阻塞、连接数、pending tasks、direct memory、GC、socket buffer、丢包/重传和下游背压。

## 2. BIO、NIO、AIO 的核心区别

| 模型 | 典型调用语义 | 线程模型 | 优点 | 风险 |
| --- | --- | --- | --- | --- |
| BIO | 阻塞式 read/write | 常见一连接一线程或线程池 | 简单、适合低并发 | 大量连接导致线程和上下文切换成本高 |
| NIO | 非阻塞 Channel + Selector | 少量 EventLoop 管理大量连接 | 高连接数、可控线程数 | 状态机复杂，业务阻塞会拖死 EventLoop |
| AIO | 异步完成通知 | 操作系统/运行时完成后回调 | 理论上减少主动轮询 | Java 生产生态里远不如 NIO/Netty 普及，平台实现差异大 |

### 面试一句话

**BIO 的主要问题是等待期间占着线程；NIO 的价值是把“等待 I/O 就绪”和“真正处理数据”拆开，用少量线程管理大量连接。**

## 3. Channel、Buffer、Selector 分别解决什么

### Channel

Channel 是可读写的数据通道，例如 `SocketChannel`、`ServerSocketChannel`、`FileChannel`。相比传统 Stream，它更适合双向、非阻塞和与 Buffer 配合。

### Buffer

Buffer 是 NIO 数据读写的核心载体。常见状态字段：

- `capacity`：容量；
- `position`：当前读/写位置；
- `limit`：当前可访问边界。

写完准备读时常用 `flip()`：把 `limit` 设为当前 position，再把 position 归零。

读完继续写时：

- `clear()`：逻辑清空，position=0、limit=capacity，旧数据并不会物理擦除；
- `compact()`：保留未读数据，将其搬到前部，再继续写。

### Selector

Selector 用于监听多个注册的 Channel 是否出现感兴趣的事件，例如：

- `OP_ACCEPT`
- `OP_CONNECT`
- `OP_READ`
- `OP_WRITE`

Selector 告诉你的是“哪些连接就绪”，不是替你执行完整业务逻辑。

## 4. select / poll / epoll 怎么回答

### select

- 监听集合大小通常受限制；
- 每次调用需要传递/扫描 fd 集合；
- 就绪后仍需遍历查找哪些 fd 可用。

### poll

- 用 pollfd 数组，取消 select 的固定 fd bitmap 限制；
- 仍需要线性扫描就绪描述符集合。

### epoll

Linux 下 epoll 通过内核维护关注集合，并在事件发生时返回就绪项，避免每次都全量扫描全部连接。

### 面试边界

不要简单回答“epoll 是 O(1)，select 是 O(n)，所以 epoll 一定更快”。真正性能还受活跃连接比例、事件密度、系统调用、缓存命中、业务处理和内核实现影响。

## 5. LT 与 ET

### Level Triggered（LT）

只要 fd 仍处于可读/可写状态，后续 `epoll_wait` 还可能继续返回。编程更稳健。

### Edge Triggered（ET）

状态从“未就绪”变成“就绪”时触发边沿通知。通常要求非阻塞 fd，并一次尽量读/写到 `EAGAIN`，否则可能遗漏后续处理机会。

面试一句话：**ET 不是天然更高级，主要是减少重复通知，但对读写循环和状态管理要求更高。**

## 6. Reactor 模型

### 单 Reactor 单线程

一个线程处理 accept、read/write 和业务。结构简单，但任何慢业务都会阻塞整个事件循环。

### 单 Reactor 多线程

Reactor 负责 I/O 事件，业务逻辑交给工作线程池。适合业务处理较重场景。

### 主从 Reactor

Acceptor/主 Reactor 负责接收连接，多个子 Reactor/EventLoop 负责连接读写，再按需把业务分发给 Worker Pool。

```text
Client
  ↓
Boss / Acceptor
  ↓
Worker EventLoop Group
  ↓
Read / Decode / Handler / Encode / Write
  ↓
Business Executor（仅当业务不能在 EventLoop 内快速完成）
```

## 7. 为什么 EventLoop 不能做慢阻塞业务

EventLoop 往往串行处理多个连接的 I/O 事件。如果在 EventLoop 中执行：

- 慢 SQL；
- 同步 HTTP/RPC；
- 大文件阻塞 I/O；
- 长时间 CPU 计算；
- `Thread.sleep()`；

就会导致同一个 EventLoop 负责的其他连接无法及时 read/write，表现为整体延迟飙升、心跳超时、连接堆积。

### 标准回答

> EventLoop 的职责是快速处理 I/O 就绪事件和轻量 Handler。阻塞或 CPU 重任务应迁移到独立 Executor；同时必须限制业务线程池和队列，避免把背压问题从 EventLoop 转移到 Worker Pool。

## 8. Netty 核心组件如何对应 NIO

| Netty | 作用 |
| --- | --- |
| `EventLoopGroup` | 管理 EventLoop 线程 |
| `EventLoop` | 一个事件循环，绑定多个 Channel |
| `Channel` | 网络连接抽象 |
| `ChannelPipeline` | Handler 责任链 |
| `ChannelHandler` | 编解码、认证、业务处理等 |
| `ByteBuf` | Netty 自有 Buffer，支持池化、引用计数等 |
| `ChannelFuture` | 异步操作结果 |

### 为什么 Netty 不直接只用 JDK NIO

因为生产网络框架还要解决：连接生命周期、协议编解码、半包粘包、内存池、零拷贝优化、线程模型、异步回调、异常传播、背压、SSL、心跳等工程问题。

## 9. 粘包、半包怎么答

TCP 是字节流，没有消息边界。一次 `write()` 不等于对端一次 `read()`。

常见解决办法：

1. 固定长度；
2. 分隔符；
3. Length Field（消息头声明 body 长度）；
4. 自描述协议，例如基于框架的完整协议编解码。

P7 加分点：要限制最大 frame 长度，避免恶意长度字段导致 OOM 或大对象攻击。

## 10. ByteBuf 为什么比 ByteBuffer 更适合网络框架

常见优势：

- readerIndex / writerIndex 分离，不需要频繁 `flip()`；
- 支持 heap/direct、池化和复合 Buffer；
- 支持 slice/duplicate 等视图；
- 引用计数管理直接内存生命周期；
- 更适合网络编解码和零拷贝组合。

### 风险

使用引用计数对象时必须注意 retain/release 平衡，否则可能出现内存泄漏或提前释放。

## 11. DirectBuffer 与 HeapBuffer

### HeapBuffer

数据在 Java 堆，分配回收受 GC 管理；访问 Java 对象方便。

### DirectBuffer

数据位于堆外直接内存，网络/文件 I/O 时可减少某些额外复制，适合长期复用的大量 I/O Buffer。

### 风险

Direct Memory 不是“不要管理”。仍需关注：

- `MaxDirectMemorySize`/运行时限制；
- 池化使用率；
- 泄漏；
- 分配释放成本；
- Native Memory Tracking。

## 12. 零拷贝到底是什么

### 传统文件发送

典型路径可能经历：

```text
Disk → Kernel Page Cache → User Buffer → Socket Kernel Buffer → NIC
```

这包含多次数据复制和用户态/内核态切换。

### sendfile / FileChannel.transferTo

让文件页缓存数据更直接地进入 socket 发送路径，减少用户态参与和不必要复制。

### mmap

把文件映射到进程虚拟地址空间，应用通过内存访问方式操作页缓存，减少显式 `read()` 到用户缓冲区的复制。

### 面试纠错

“零拷贝”通常表示减少不必要的数据复制和上下文切换，不代表物理上绝对一次 copy 都没有。具体路径与内核、DMA、网卡能力有关。

## 13. `mmap` 与 `sendfile` 怎么选

- 只需要把文件直接发送给 socket：优先考虑 `sendfile/transferTo`；
- 需要随机访问、修改文件内容：`mmap` 更合适；
- 超大文件 mmap 要关注虚拟地址空间、page fault、脏页刷盘和异常处理；
- 不要把 mmap 当成所有文件 I/O 的默认优化。

## 14. NIO 与虚拟线程是什么关系

两者解决的问题不同：

- **NIO/Reactor**：用少量线程管理大量 socket 连接和就绪事件；
- **Virtual Thread**：让阻塞式代码在高并发 I/O 下以更低线程成本运行。

虚拟线程出现后，并不意味着 Netty/Reactor 失去价值。网络协议框架仍需要连接状态管理、Pipeline、编解码、内存池和背压；而简单 request-per-task 服务可以更自然地使用阻塞风格 + 虚拟线程。

面试不要回答“虚拟线程淘汰 NIO”。

## 15. Backpressure 为什么重要

高吞吐网络系统不能只关注“能不能读”。如果下游业务处理速度低于入口读速度：

```text
Network Read > Business Consume
          ↓
      Queue Growth
          ↓
  Memory / Latency / OOM
```

治理手段：

- 限制 inflight；
- 有界队列；
- 暂停/恢复读取；
- 水位线控制写缓冲；
- 限流、熔断、降级；
- 让上游感知系统真实处理能力。

## 16. Netty 高 CPU 怎么排

固定故障树：

1. EventLoop 是否被业务阻塞；
2. 是否出现空轮询/异常事件风暴；
3. Codec 是否 CPU 热点；
4. 小包/高频系统调用是否过多；
5. TLS 加解密是否消耗 CPU；
6. 是否发生频繁 direct buffer 分配/释放；
7. 是否有连接抖动、重连风暴；
8. 用 JFR、async-profiler、线程栈确认热点，而不是只看线程数量。

## 17. 网络延迟突然升高怎么排

从四层拆：

### 应用层

EventLoop 阻塞、线程池排队、GC、锁竞争、编解码耗时。

### JVM/内存

堆内/堆外压力、Direct Memory、GC Pause、对象分配。

### Socket/OS

send/recv buffer、accept queue、连接状态、文件描述符、上下文切换。

### 网络

RTT、丢包、重传、拥塞、跨 AZ/跨地域、DNS、LB/NAT。

常用思路是 Metrics → Trace → JVM/OS → 网络抓包或系统级证据。

## 18. 高频面试题与标准答案

### Q1. BIO 为什么高并发差？

不是因为“阻塞一定慢”，而是大量并发连接会长期占用大量平台线程，带来栈内存、调度和上下文切换成本。

### Q2. NIO 一定比 BIO 快吗？

不一定。低并发、逻辑简单时 BIO 更容易维护。NIO 的主要价值是连接规模和线程模型，不是单请求绝对延迟更低。

### Q3. Selector 是不是一直轮询所有连接？

Java Selector 暴露统一 API；底层通常借助操作系统 I/O 多路复用。应用拿到的是就绪事件集合，不应简单描述成 Java 层不断全量扫描所有 Socket。

### Q4. `OP_WRITE` 为什么不能一直注册？

Socket 大多数时间都可写，如果长期关注 `OP_WRITE`，Selector 可能持续被可写事件唤醒，形成忙循环。通常在存在待发送数据且发生写不完时才关注，写完再取消。

### Q5. 非阻塞 `read()` 返回 0 代表什么？

当前没有数据可读，不等于连接关闭；返回 -1 才表示对端正常关闭输入流。

### Q6. 为什么 Netty 一个 EventLoop 通常绑定多个 Channel？

利用 I/O 多路复用让少量线程管理大量连接，并保持每个 Channel 事件处理的顺序性。

### Q7. 为什么 Handler 里不能随便 `sleep`？

它可能阻塞 EventLoop，拖慢该 EventLoop 绑定的所有连接。

### Q8. 零拷贝的收益是什么？

减少用户态与内核态切换以及不必要的数据复制，降低 CPU 和内存带宽消耗；不是“完全没有复制”。

### Q9. DirectBuffer 为什么可能 OOM？

直接内存位于 Java 堆外，也有容量上限和生命周期；池化泄漏或高并发大 Buffer 仍可耗尽 direct memory。

### Q10. Reactor 和 Proactor 的区别？

Reactor 关注“事件已就绪，由应用执行实际 I/O”；Proactor 关注“异步 I/O 已完成，再通知应用处理结果”。实际实现和 OS API 需结合具体平台，不要只背概念图。

## 19. P7/P8 追问树

```text
BIO / NIO
 ├─ 阻塞与非阻塞分别描述谁？
 ├─ 同步与异步分别描述谁？
 ├─ Channel / Buffer / Selector
 ├─ select / poll / epoll / kqueue
 ├─ LT / ET
 ├─ Reactor
 │   ├─ 单线程
 │   ├─ Worker Pool
 │   └─ 主从 Reactor
 ├─ Netty
 │   ├─ EventLoop
 │   ├─ Pipeline
 │   ├─ ByteBuf
 │   ├─ 粘包半包
 │   ├─ Direct Memory
 │   └─ Backpressure
 ├─ 零拷贝
 │   ├─ sendfile
 │   ├─ transferTo
 │   └─ mmap
 └─ 生产排障
     ├─ EventLoop blocked
     ├─ High CPU
     ├─ Direct Memory
     ├─ Connection storm
     └─ Packet loss / retransmission
```

## 20. 面试最终收口

> Java IO 题我会先区分阻塞/非阻塞和同步/异步，再讲 BIO 到 NIO 的线程模型变化。NIO 的核心不是“API 换成 Channel”，而是 Selector + 操作系统多路复用让少量 EventLoop 管理大量连接。工程上再通过 Reactor/Netty 解决连接生命周期、编解码、内存池和背压；文件传输侧通过 transferTo/sendfile/mmap 减少复制。生产里最关键的是不要阻塞 EventLoop，并持续监控业务排队、Direct Memory、连接状态、GC 和网络重传。
