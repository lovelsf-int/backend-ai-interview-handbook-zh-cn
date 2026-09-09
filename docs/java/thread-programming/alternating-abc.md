---
title: 三个线程交替打印 ABC：四种实现与追问
description: 可运行多线程手写题、条件与许可协议、异常退出及面试追问
status: reviewing
baseline: Java 8 兼容源码；Java SE 25 API 和 JLS 机制参考
last_verified: 2026-09-09
level: 基础到 P7/P8
source: 本站原创代码与题解、Java 官方 API 和语言规范
---

# 三个线程交替打印 ABC：四种实现与追问

## 完整题目

创建三个线程，分别负责打印 A、B、C，输出严格为 `ABC` 重复 N 次。不能通过 sleep 猜测调度顺序。要求 N=0 能结束，N<0 拒绝；某个角色失败时整个任务失败并停止其他角色。

本页代码片段来自 [完整可运行程序](https://github.com/lovelsf-int/backend-ai-interview-handbook-zh-cn/blob/main/examples/concurrency/AlternatingPrint.java)，运行命令和统一超时/取消逻辑见 [模块首页](./index.md)。四个方法均生成 Callable 列表，必须与共用运行器一起使用，不是四个独立 main 程序。

## 先描述不变量

在输出成功的路径上，任何时刻只允许当前角色输出，完成输出后才能交棒。状态法初始化 turn=0，表示 A；许可法初始化 A/B/C 的许可数为 1/0/0。N 表示每个角色打印次数，因此总长度应为 3N。

“线程先启动”与“先打印”无关。B、C 可以先运行，只要它们会等待轮次或许可。证明方法是逐步推导：初始只能 A，A 后只允许 B，B 后只允许 C，C 后回到 A。

## 写法一：synchronized 与 wait/notifyAll

<<< @/../examples/concurrency/AlternatingPrint.java#monitor

**标准解释：** turn、条件检查、输出和转移都在同一监视器保护下，不需要给 turn 再加 volatile。等待使用 while；wait 释放当前监视器，唤醒后重新获取，再检查条件。notifyAll 只是提示等待者重新检查，不立即交出锁。[Object API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html)

**追问：为什么不能随手改成 notify？**三个角色共用一个等待集合，notify 可能通知不该接棒的角色。例如 A 输出后唤醒 C，C 发现 turn 是 B 又等待，而 B 没有被通知，就可能全部停住。notifyAll 让 B 有机会继续，代价是其他角色也被唤醒检查。

**追问：如果 A 通知时 B 还没开始等待，会丢通知吗？**通知本身不会保存，但 turn 保存了业务事实。B 获得锁时发现已经轮到自己，会直接输出，不需要消费历史通知。

**追问：锁能不能只包住 turn++？**不行。检查轮次、产生本轮输出和转移状态属于一个协议；过早转移后在锁外打印，B 可能先于 A 完成输出。真实业务若输出很慢，应重新设计异步结果排序，不在锁中做长远程调用。

## 写法二：ReentrantLock 与三个 Condition

<<< @/../examples/concurrency/AlternatingPrint.java#condition

**标准解释：**三个角色共用一把锁、各自一个等待条件。A 完成后只 signal B 的条件，B 只通知 C，C 再通知 A。保留 turn 与 while，signal 不能替代状态。必须在 finally 中 unlock；lockInterruptibly 和 await 让等待可以响应取消。[Condition API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/Condition.html)

**追问：这里为什么可以 signal 而不是 signalAll？**本题每个 Condition 只有一个固定角色线程在等待，且只通知下一角色。若改为每个角色多个 Worker 或多种等待条件，就要重新证明选择与终止协议，不能直接复制。

**追问：公平锁能保证 ABC 吗？**不能。公平性控制锁竞争策略，不知道业务上的字母轮次；顺序仍由 turn 决定。使用公平锁也不能省掉条件循环。

## 写法三：Semaphore 传递许可

<<< @/../examples/concurrency/AlternatingPrint.java#semaphore

**标准解释：**A 的许可为 1，其他为 0；每个线程先 acquire 自己的许可，输出成功后 release 下一角色的许可。这里不需要共享 turn，顺序由三个许可门控制；release 到后续成功 acquire 还提供内存可见性关系。[Semaphore API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Semaphore.html)

**追问：release 为什么不放 finally？**这里的许可表示“上一角色已输出成功，可以执行下一角色”，不是常见连接池的资源归还。输出失败不应该交棒，应让运行器发现异常并取消整个组。资源池的 permit 则通常在确实 acquire 成功后 finally 归还，不能混淆两种协议。

**追问：三个 Semaphore 都设成 1 呢？**三个角色都能先输出，顺序不再保证；都设为 0，则没有首棒，全部等待。

**追问：非公平 Semaphore 会打乱顺序吗？**本题每个 Semaphore 只有一个固定角色消费者，次序由跨门交棒决定，不依赖公平性。多个竞争者或使用 tryAcquire 后，需要按新模型分析。

## 写法四：LockSupport.park/unpark

<<< @/../examples/concurrency/AlternatingPrint.java#locksupport

**标准解释：** turn 使用 volatile 发布轮次；每个角色先登记当前线程，再循环检查 turn，没轮到自己时 park。输出完成后先更新 turn，再 unpark 下一角色。AtomicReferenceArray 用于安全发布线程引用。每个角色只有一个 Worker 是本算法的重要前提，不能扩成多个 A 线程后仍认为 volatile 能提供互斥。

**追问：它与 wait/notify 有什么区别？**park 不要求持有监视器，也不会替你释放已持有的锁；unpark 指定线程。每个线程最多保留一个许可，不能像计数信号量那样叠加。对已经启动的线程，先 unpark 可使后续 park 消耗许可直接返回；对未启动线程不能依赖该效果。[LockSupport API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/LockSupport.html)

**追问：已经有许可，为什么还要 while 和 volatile？**park 可能因许可、中断或虚假唤醒返回；返回不代表轮到自己。本题的轮次事实是 turn，许可只减少等待开销。共享状态不能靠一个普通 int 加 park 就假定可见。

**追问：B 尚未登记，A 的 unpark(null) 怎么办？**此调用无效果，但 A 已将 turn 改为 B。B 登记后读取 turn，会直接运行；如果 B 已检查过旧值准备 park，那么登记已完成，A 能取得其线程引用，提前到达的许可覆盖检查与阻塞之间的窗口。

**追问：为什么显式检查 Thread.interrupted？**park 因中断返回时不抛 InterruptedException，也不清除中断标记。若不处理，下一次 park 可能继续立刻返回，形成空转。本例用检查并抛异常表达取消；监督器再取消整个组。blocker 参数用于诊断，不是一把被自动获取的锁。

**追问：先 unpark 再改 turn 可以吗？**不应这样写。下一线程可能醒来看到旧 turn 又 park，之后只有状态变化而没有新唤醒，就可能卡住。固定遵循“先发布条件，后发唤醒”的顺序。

## 异常、中断与收尾

四个核心算法都依赖完整程序的监督器：任一 Worker 的输出回调抛异常，CompletionService 返回失败完成项；监督器取消其他 Future 并中断等待线程。只对提交顺序中的 A 调用 get 可能一直等 A，而失败的 B 已经退出，因此按完成顺序检查更适合发现此类失败。

最后一次 C 仍交给 A 一个许可是允许的：每个角色都有固定轮数，A 已完成就退出，额外许可局限于本次调用内部，不导致多输出。若把这些同步对象做成跨多次运行的全局对象，就需要重新初始化状态，不能复用残留许可。

异常发生后只承诺报告失败并合作停止，不承诺输出仍是完整的 ABC 周期，更不能撤销已经写入控制台或外部系统的内容。

## 方案对比

| 方案 | 顺序依据 | 唤醒范围 | 手写时最容易漏掉 |
| --- | --- | --- | --- |
| monitor | turn 与同一把锁 | notifyAll | while、初始状态、退出 |
| Condition | turn 与同一把锁 | 对应下一条件 | 持锁调用、finally 解锁 |
| Semaphore | 1/0/0 初始许可与传递 | 下一角色 | acquire 成功与失败停止 |
| LockSupport | volatile turn 与线程许可 | unpark 指定线程 | 条件循环、中断、线程引用发布 |

这道题的 P7/P8 追问可以延伸到：线程池饥饿、超时预算、幂等副作用、日志异步输出后是否仍有序。单进程的字母顺序协议不能直接证明分布式任务只执行一次。
