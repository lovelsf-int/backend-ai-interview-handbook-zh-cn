---
title: 多线程编程实战：从交替打印到可靠退出
description: 可运行多线程手写题、条件与许可协议、异常退出及面试追问
status: reviewing
baseline: Java 8 兼容源码；Java SE 25 API 和 JLS 机制参考
last_verified: 2026-09-09
level: 基础到 P7/P8
source: 本站原创代码与题解、Java 官方 API 和语言规范
---

# 多线程编程实战：从交替打印到可靠退出

本模块练习“能手写、能解释、能停止”的多线程代码。先掌握条件、共享状态、可见性和退出协议，再选择并发工具。示例源码使用 Java 8 兼容语法；使用 JDK 17+ 编译运行更方便。

## 题目与复习顺序

| 题目 | 写法 | 重点 |
| --- | --- | --- |
| [三个线程交替打印 ABC](./alternating-abc.md) | wait/notifyAll、Condition、Semaphore、LockSupport | 初始状态、唤醒对象、正确交接、异常停止 |
| [两个线程交替打印奇偶数](./odd-even.md) | synchronized 与条件循环 | 共享计数、奇数上限、最终唤醒与退出 |

先独立写 Semaphore 版 ABC，再写 monitor 版解释 while，然后写多 Condition 版解释定向通知，最后用 LockSupport 练习许可与 volatile 条件配合。奇偶题重点在边界：不是简单把三个字母换成两个数字。

## 可运行源码

完整程序：[AlternatingPrint.java](https://github.com/lovelsf-int/backend-ai-interview-handbook-zh-cn/blob/main/examples/concurrency/AlternatingPrint.java)；回归测试：[AlternatingPrintTest.java](https://github.com/lovelsf-int/backend-ai-interview-handbook-zh-cn/blob/main/examples/concurrency/AlternatingPrintTest.java)。

从仓库根目录运行，需安装 JDK 而非仅 JRE：

```bash
mkdir -p /tmp/alternating-print-classes
javac --release 8 -encoding UTF-8 -d /tmp/alternating-print-classes examples/concurrency/AlternatingPrint.java examples/concurrency/AlternatingPrintTest.java
java -cp /tmp/alternating-print-classes AlternatingPrint semaphore 3
java -cp /tmp/alternating-print-classes AlternatingPrint monitor 3
java -cp /tmp/alternating-print-classes AlternatingPrint condition 3
java -cp /tmp/alternating-print-classes AlternatingPrint locksupport 3
java -cp /tmp/alternating-print-classes AlternatingPrint odd-even 9
java -cp /tmp/alternating-print-classes AlternatingPrintTest
```

四种 ABC 写法输出均为 `ABCABCABC`；奇偶题输出 `1 2 3 4 5 6 7 8 9`。测试覆盖 0/1/多轮、反向提交任务、输出失败、调用者中断、总超时以及线程退出。重复运行是回归证据，不是穷举所有线程调度的形式化证明。

## 共用的启动和停止协议

页面直接引用同一份 Java 源码，避免文档与测试各维护一套实现。各解法返回三个固定角色任务，每个任务在本轮运行中对应一个 Worker；完整入口如下：

<<< @/../examples/concurrency/AlternatingPrint.java#main

共用运行器按完成顺序发现失败、取消其余任务，并关闭专用线程池：

<<< @/../examples/concurrency/AlternatingPrint.java#supervisor

这里特意反向提交任务，证明输出顺序由同步协议决定。线程池大小等于参与角色数；如果只有一个线程先跑等待中的 C，A 永远得不到执行机会，会形成线程池饥饿。

任务执行共用一个基于 nanoTime 的截止时间，清理阶段另有最多 5 秒等待。它不是硬实时上限；被调用的输出函数必须有限时或响应中断，忽略中断的外部代码无法靠 shutdownNow 强制杀掉。连续再次中断清理线程也可能打断等待，因此业务系统仍应监督执行器生命周期。调用方收到异常后不能把已输出内容当作可回滚事务。

## 面试中的错误写法

- 用 sleep 或线程优先级“保证”执行顺序：它们不表达字母之间的依赖。
- 只给打印方法加 synchronized：只能保证互斥，不能决定轮到哪个角色。
- await/wait 外面用 if：唤醒后条件需要重新检查。
- catch 中断后只打印异常：其他线程可能永久等不到下一棒。
- 输出失败仍无条件给下一位发许可：可能输出缺字母的伪成功结果。
- 测试只看控制台肉眼顺序：应断言完整内容、长度、边界与终止状态。

机制复习：[Object 等待通知](../object-methods-interview.md)、[锁与同步器](../concurrency-locks-aqs-cas.md)、[线程池治理](../thread-pool-production-guide.md)。完成顺序收集见 [ExecutorCompletionService API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorCompletionService.html)。
