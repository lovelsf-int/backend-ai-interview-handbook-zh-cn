---
title: JDK 8–26 版本特性与面试演进
description: 按版本梳理 JDK 8 到 JDK 26 的核心语言、并发、GC、JVM、标准库与生产迁移特性，并标注 LTS 与面试优先级
status: verified
baseline: OpenJDK / Oracle JDK release notes through JDK 26
last_verified: 2026-09-04
level: P7/P8
source: OpenJDK JEP、Oracle JDK Release Notes、Java SE API Specification
---

# JDK 8–26 版本特性与面试演进

> 面试不要把版本特性背成流水账。建议沿着五条主线记忆：**语言表达力、并发模型、GC/JVM、标准库/网络、平台治理与安全**。

## LTS 版本先记住

| 版本 | 类型 | 面试定位 |
| --- | --- | --- |
| JDK 8 | LTS | Lambda / Stream / CompletableFuture / `java.time`，现代 Java 起点 |
| JDK 11 | LTS | 标准 HTTP Client、JFR、ZGC/Epsilon 等进入企业视野 |
| JDK 17 | LTS | Records / Sealed / Pattern Matching 时代的重要落点 |
| JDK 21 | LTS | Virtual Threads 正式落地，现代高并发 Java 分水岭 |
| JDK 25 | LTS | Scoped Values、Compact Object Headers、AOT/JFR 继续成熟 |

## 版本总览

| JDK | 代表性特性 | 面试优先级 |
| --- | --- | --- |
| 8 | Lambda、Stream、Optional、`java.time`、默认方法、CompletableFuture、Metaspace | ★★★★★ |
| 9 | JPMS、JShell、集合工厂、Flow API、Process API、G1 默认 | ★★★★☆ |
| 10 | `var`、AppCDS、G1 Parallel Full GC | ★★☆☆☆ |
| 11 | HTTP Client、Lambda `var`、JFR、ZGC/Epsilon、TLS 1.3 | ★★★★★ |
| 12 | Switch Expressions Preview、Shenandoah、CompactNumberFormat | ★★☆☆☆ |
| 13 | Text Blocks Preview、Dynamic CDS | ★★☆☆☆ |
| 14 | Switch Expressions 正式、Records Preview、Pattern Matching Preview、Helpful NPE | ★★★☆☆ |
| 15 | Text Blocks 正式、Sealed Preview、Hidden Classes | ★★★☆☆ |
| 16 | Records 正式、`instanceof` Pattern 正式、jpackage、Vector API Incubator | ★★★☆☆ |
| 17 | Sealed Classes 正式、Pattern Switch Preview、强封装继续推进 | ★★★★★ |
| 18 | UTF-8 默认、Simple Web Server、Javadoc Snippets | ★★☆☆☆ |
| 19 | Virtual Threads Preview、Structured Concurrency Incubator、Record Patterns Preview | ★★★★☆ |
| 20 | Virtual Threads 二次 Preview、Scoped Values Incubator | ★★★☆☆ |
| 21 | Virtual Threads 正式、Record Patterns / Pattern Switch 正式、Sequenced Collections、Generational ZGC | ★★★★★ |
| 22 | FFM API 正式、Unnamed Variables 正式、Stream Gatherers Preview、Class-File API Preview | ★★★★☆ |
| 23 | Markdown Javadoc、Generational ZGC 默认、Scoped Values 继续 Preview | ★★★☆☆ |
| 24 | Class-File API、Stream Gatherers 正式、虚拟线程同步优化、AOT Class Loading、Security Manager 永久禁用 | ★★★★☆ |
| 25 | Scoped Values、Module Import、Compact Source Files、Flexible Constructor Bodies、Compact Object Headers | ★★★★★ |
| 26 | HTTP/3 Client、AOT Object Caching、Lazy Constants Preview、Structured Concurrency 继续 Preview | ★★★★☆ |

## JDK 8：现代 Java 编程范式起点

### 核心特性

- Lambda 表达式与方法引用。
- Stream API。
- `Optional`。
- `java.time` 日期时间 API。
- 接口默认方法与静态方法。
- `CompletableFuture`。
- JVM 永久代被 Metaspace 取代。

### 高频追问

**Lambda 和匿名内部类区别？** Lambda 主要表达函数式接口实例，不等价于“语法缩短的匿名类”；`this`、作用域和生成方式都不同。

**CompletableFuture 解决什么？** 解决异步任务编排、组合、异常处理，但公共线程池和阻塞调用要谨慎使用。

## JDK 9：模块化与平台治理

### 核心特性

- JPMS 模块系统：`module-info.java`。
- JShell。
- `List.of` / `Set.of` / `Map.of`。
- Reactive Streams 对应的 `Flow` API。
- Process API 增强。
- G1 成为默认 GC。

### 高频追问

**JPMS 解决什么？** 显式模块依赖和强封装，降低超大型应用依赖边界不清的问题，但传统 Spring 业务项目并不一定主动模块化。

## JDK 10：局部变量推断

### 核心特性

- `var` 局部变量类型推断。
- AppCDS 增强。
- G1 Full GC 并行化。

### 高频追问

`var` 不是动态类型，编译期依然确定静态类型，只能用于有初始化器的局部变量等允许位置。

## JDK 11：企业常见 LTS

### 核心特性

- 标准化 `java.net.http.HttpClient`。
- Lambda 参数支持 `var`。
- Java Flight Recorder 开源进入标准 JDK 生态。
- ZGC、Epsilon GC 进入 JDK 特性序列。
- TLS 1.3。
- 单文件源码运行：`java Hello.java`。

### 高频追问

**JDK 8 升 11 最常见风险？** Java EE / CORBA 模块移除、强封装演进、依赖库兼容、GC 与启动参数变化。

## JDK 12：Switch 表达式开始演进

### 核心特性

- Switch Expressions Preview。
- Shenandoah GC。
- CompactNumberFormat。

### 高频追问

重点理解后续 `switch` 从语句向表达式演进，不必死背 preview 次数。

## JDK 13：文本块开始进入语言

### 核心特性

- Text Blocks Preview。
- Switch Expressions 再次 Preview。
- Dynamic CDS Archives。

## JDK 14：Record 与模式匹配进入视野

### 核心特性

- Switch Expressions 正式。
- Records Preview。
- Pattern Matching for `instanceof` Preview。
- Helpful NullPointerExceptions。
- JFR Event Streaming。

### 高频追问

**Record 是 DTO 替代品吗？** Record 适合“以数据为核心、状态不可随意变化”的载体，但不是所有 JPA Entity / 复杂领域对象的直接替代。

## JDK 15：Text Blocks 正式

### 核心特性

- Text Blocks 正式。
- Sealed Classes Preview。
- Hidden Classes。
- ZGC / Shenandoah 进入更成熟的生产阶段。

## JDK 16：Records 正式

### 核心特性

- Records 正式。
- Pattern Matching for `instanceof` 正式。
- `jpackage` 正式。
- Vector API 首次孵化。

### 高频追问

**Record 是否真正不可变？** 组件引用是 `final`，但引用指向的对象自身仍可能可变，因此是浅层不可重新赋值，不代表深度不可变。

## JDK 17：主流 LTS 基线

### 核心特性

- Sealed Classes 正式。
- Pattern Matching for `switch` Preview。
- Enhanced PRNG。
- JDK 内部 API 强封装继续推进。

### 高频追问

JDK 17 常作为从 8/11 升级的企业目标版本；面试重点通常是语言演进、模块封装和 GC/JVM 迁移，而不是只背 JEP 编号。

## JDK 18：平台默认行为调整

### 核心特性

- UTF-8 成为标准 Java API 默认字符集。
- Simple Web Server。
- Javadoc Code Snippets。
- Internet-Address Resolution SPI。

### 高频追问

升级时要关注默认字符集变化对旧系统文件读写的影响。

## JDK 19：Loom 进入公开 Preview

### 核心特性

- Virtual Threads Preview。
- Structured Concurrency Incubator。
- Record Patterns Preview。
- Foreign Function & Memory API Preview。

### 高频追问

虚拟线程的核心价值是降低大量阻塞任务的线程承载成本，不是让 CPU 或下游 QPS 无限增长。

## JDK 20：Loom 持续收敛

### 核心特性

- Virtual Threads 第二次 Preview。
- Structured Concurrency 第二次 Incubator。
- Scoped Values Incubator。
- Record Patterns 第二次 Preview。

## JDK 21：现代 Java 高并发分水岭

### 核心特性

- Virtual Threads 正式。
- Record Patterns 正式。
- Pattern Matching for `switch` 正式。
- Sequenced Collections。
- Generational ZGC。
- Structured Concurrency Preview。
- Scoped Values Preview。

### 高频追问

**为什么虚拟线程正式后还要限流？** 虚拟线程降低线程等待成本，数据库连接池、LLM 配额、CPU 和下游服务容量仍是硬上限。

## JDK 22：Panama 重要落点

### 核心特性

- Foreign Function & Memory API 正式。
- Unnamed Variables & Patterns 正式。
- Stream Gatherers Preview。
- Class-File API Preview。
- Structured Concurrency / Scoped Values 继续 Preview。

### 高频追问

FFM API 目标是以更安全、现代的方式与 native code / off-heap memory 交互，逐步降低 JNI 的使用复杂度。

## JDK 23：GC 与文档工具继续演进

### 核心特性

- Markdown Documentation Comments。
- Generational ZGC 成为默认 ZGC 模式。
- Stream Gatherers 第二次 Preview。
- Scoped Values 继续 Preview。
- Primitive Types in Patterns Preview。

## JDK 24：虚拟线程与 AOT 继续成熟

### 核心特性

- Class-File API 正式。
- Stream Gatherers 正式。
- Synchronize Virtual Threads without Pinning：优化虚拟线程在 `synchronized` 场景的 carrier pinning 问题。
- Ahead-of-Time Class Loading & Linking。
- Security Manager 永久禁用。
- Generational Shenandoah Experimental。
- Structured Concurrency 第四次 Preview。

### 高频追问

不要再把“虚拟线程遇到所有 `synchronized` 都会严重 pinning”当成静态结论；JDK 24 已显著改变这一边界，native/foreign 等不可卸载场景仍需关注。

## JDK 25：LTS，Scoped Values 正式

### 核心特性

- Scoped Values 正式。
- Module Import Declarations 正式。
- Compact Source Files and Instance Main Methods 正式。
- Flexible Constructor Bodies 正式。
- Compact Object Headers 正式。
- Key Derivation Function API 正式。
- Generational Shenandoah。
- JFR CPU-Time Profiling、Cooperative Sampling、Method Timing & Tracing 增强。
- AOT Command-Line Ergonomics 与 AOT Method Profiling。
- Structured Concurrency 第五次 Preview。

### 高频追问

**ScopedValue 与 ThreadLocal？** ScopedValue 面向有界作用域内的只读上下文传播，更容易推理，尤其适合虚拟线程；ThreadLocal 更通用但生命周期管理错误时更容易造成隐式状态和资源问题。

## JDK 26：HTTP/3 与 AOT 继续推进

### 核心特性

- HTTP Client API 支持 HTTP/3。
- Ahead-of-Time Object Caching。
- Lazy Constants 继续 Preview。
- Structured Concurrency 继续 Preview。
- Java 平台继续推进安全、GC、性能和历史 API 清理。

### 高频追问

**JDK 26 对后端最值得关注什么？** 对网络服务关注 HTTP/3；对启动与部署关注 AOT 演进；并发侧继续关注 Structured Concurrency 的 API 收敛，而不是把 Preview 当成已稳定生产 API。

## 面试中的版本演进主线

### 语言主线

Lambda / Stream → `var` → Switch Expressions → Text Blocks → Records → Sealed Classes → Pattern Matching → Module Import / Compact Source Files。

### 并发主线

CompletableFuture → Flow → Virtual Threads → Scoped Values → Structured Concurrency。

### GC 主线

G1 默认 → ZGC / Shenandoah → Generational ZGC / Generational Shenandoah。

### 平台主线

JPMS → HTTP Client → FFM → Class-File API → AOT → HTTP/3。

## 30 秒版本回答

> 我不会逐个版本背流水账，而会抓 LTS 和演进主线。JDK 8 是 Lambda、Stream、CompletableFuture；11 是 HTTP Client 和 JFR 等企业能力；17 是 Record、Sealed、Pattern Matching 这一代语言能力的重要落点；21 最大变化是 Virtual Threads 正式；25 则把 Scoped Values、Compact Object Headers、AOT/JFR 等继续推向成熟。非 LTS 版本主要用来理解这些能力是怎样从 Preview/Incubator 逐步变成正式特性的。
