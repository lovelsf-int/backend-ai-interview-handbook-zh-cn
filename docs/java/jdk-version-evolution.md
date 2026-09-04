---
title: JDK 8–26 版本特性与面试演进
description: 按版本梳理 JDK 8 到 JDK 26 的核心语言、并发、GC、JVM、标准库与生产迁移特性，并标注 LTS 与面试优先级
status: verified
baseline: OpenJDK / Oracle JDK release notes through JDK 26
last_verified: 2026-09-04
level: P7/P8
source: OpenJDK JEP / Oracle JDK release notes
---

# JDK 8–26 版本特性与面试演进

> 面试不要把“JDK 版本特性”背成流水账。建议分成五条演进主线：**语言表达力、并发模型、GC/JVM、标准库/网络、平台治理与安全**。

## 先记 LTS

| 版本 | 类型 | 面试定位 |
| --- | --- | --- |
| JDK 8 | LTS | 现代 Java 起点，Lambda / Stream / `java.time` / `CompletableFuture` |
| JDK 11 | LTS | 模块化之后的企业稳定版本，HTTP Client、JFR、ZGC/Epsilon |
| JDK 17 | LTS | Records / Sealed / Pattern Matching 时代的重要落点 |
| JDK 21 | LTS | Virtual Threads 正式落地，现代高并发 Java 分水岭 |
| JDK 25 | LTS | Scoped Values、Compact Object Headers、AOT/JFR 等继续成熟 |

> JDK 26 已于 2026-03-17 GA；JDK 27 截至 2026-09-04 仍处于发布候选阶段，计划 2026-09-14 GA，因此本页正式特性统计到 JDK 26。

## 一张总表

| JDK | 代表性特性 | 面试优先级 |
| --- | --- | --- |
| 8 | Lambda、Stream、Optional、`java.time`、默认方法、CompletableFuture、Metaspace | ★★★★★ |
| 9 | JPMS 模块系统、JShell、集合工厂、Flow API、Process API、G1 默认 | ★★★★☆ |
| 10 | `var` 局部变量类型推断、AppCDS、G1 Parallel Full GC | ★★☆☆☆ |
| 11 | 标准 HTTP Client、Lambda `var`、JFR 开源、ZGC/Epsilon、TLS 1.3 | ★★★★★ |
| 12 | Switch Expressions 预览、Shenandoah、CompactNumberFormat | ★★☆☆☆ |
| 13 | Text Blocks 预览、Switch Expressions 再预览、Dynamic CDS | ★★☆☆☆ |
| 14 | Switch Expressions 正式、Records/Pattern Matching 预览、Helpful NPE、JFR Streaming | ★★★☆☆ |
| 15 | Text Blocks 正式、Sealed 预览、Hidden Classes、ZGC/Shenandoah 生产化 | ★★★☆☆ |
| 16 | Records 正式、`instanceof` Pattern 正式、jpackage、Vector API 孵化 | ★★★☆☆ |
| 17 | Sealed Classes 正式、Pattern Switch 预览、PRNG 增强、强封装继续推进 | ★★★★★ |
| 18 | UTF-8 默认、Simple Web Server、Javadoc snippets、Internet-Address SPI | ★★☆☆☆ |
| 19 | Virtual Threads 预览、Structured Concurrency 孵化、Record Patterns 预览 | ★★★★☆ |
| 20 | Virtual Threads 二预览、Scoped Values 孵化、Structured Concurrency 二孵化 | ★★★☆☆ |
| 21 | Virtual Threads 正式、Record Patterns / Pattern Switch 正式、Sequenced Collections、Generational ZGC | ★★★★★ |
| 22 | FFM API 正式、Unnamed Variables 正式、Stream Gatherers 预览、Class-File API 预览 | ★★★★☆ |
| 23 | Markdown Javadoc、Generational ZGC 默认、Stream Gatherers 二预览、Scoped Values 三预览 | ★★★☆☆ |
| 24 | Class-File API 正式、Stream Gatherers 正式、Virtual Thread synchronized 不再因 Monitor 长时间 pin、AOT Class Loading、Security Manager 永久禁用 | ★★★★☆ |
| 25 | Scoped Values 正式、Module Import 正式、Compact Source Files 正式、Flexible Constructor Bodies 正式、Compact Object Headers 正式、AOT/JFR 增强 | ★★★★★ |
| 26 | HTTP/3 Client、G1 吞吐优化、AOT Object Caching、Lazy Constants 二预览、Structured Concurrency 六预览、Applet API 移除 | ★★★★☆ |

# JDK 8：现代 Java 的起点

## 核心特性

- Lambda Expressions；
- Stream API；
- Functional Interface；
- Interface Default / Static Methods；
- `Optional`；
- 新日期时间 API `java.time`；
- `CompletableFuture`；
- Metaspace 替代 PermGen；
- Nashorn JavaScript Engine（后续版本被移除）。

## 高频追问

**Q：JDK 8 最大的变化是什么？**

> 编程模型从偏命令式走向函数式组合，Lambda + Stream 提升集合处理表达力；`CompletableFuture` 让异步编排进入标准库；JVM 层 PermGen 被 Metaspace 替代。

# JDK 9：模块化

## 核心特性

- JPMS / Project Jigsaw：`module-info.java`；
- JShell；
- `List.of` / `Set.of` / `Map.of`；
- Reactive Streams 标准接口 `Flow`；
- ProcessHandle / Process API 增强；
- G1 成为默认 GC；
- JDK 内部 API 强封装开始推进。

## 高频追问

**Q：模块系统解决什么？**

> 解决大型应用/平台的可靠配置和强封装问题，显式声明依赖和导出边界，但企业业务系统并不一定需要主动模块化。

# JDK 10：`var`

- 局部变量类型推断 `var`；
- AppCDS 改进；
- G1 支持 Parallel Full GC；
- 容器环境与 JVM 资源识别继续增强。

> `var` 不是动态类型，类型仍在编译期确定。

# JDK 11：企业 LTS

## 核心特性

- `java.net.http.HttpClient` 正式；
- Lambda 参数允许 `var`；
- JDK Flight Recorder 开源；
- ZGC（实验）；
- Epsilon GC；
- TLS 1.3；
- 单文件源码运行：`java Hello.java`；
- 移除 Java EE / CORBA 模块。

## 高频追问

**Q：为什么很多公司从 JDK 8 直接迁到 11/17？**

> LTS 生命周期、框架生态成熟、GC/JFR/标准库增强明显，同时避开每个半年版本逐个升级的维护成本。

# JDK 12

- Switch Expressions Preview；
- Shenandoah GC（实验/特定构建）；
- CompactNumberFormat；
- JVM Constants API；
- G1 GC 改进。

# JDK 13

- Text Blocks Preview；
- Switch Expressions 第二次 Preview；
- Dynamic CDS Archives；
- ZGC 归还未使用内存能力改进。

# JDK 14

- Switch Expressions 正式；
- Records Preview；
- Pattern Matching for `instanceof` Preview；
- Helpful NullPointerExceptions；
- JFR Event Streaming；
- Foreign-Memory Access API 孵化。

# JDK 15

- Text Blocks 正式；
- Sealed Classes Preview；
- Records 第二次 Preview；
- Hidden Classes；
- ZGC / Shenandoah 从实验走向生产支持；
- EdDSA。

# JDK 16

- Records 正式；
- Pattern Matching for `instanceof` 正式；
- `jpackage` 正式；
- Vector API 第一轮孵化；
- Sealed Classes 第二次 Preview；
- Unix-Domain Socket Channels。

## Record 面试口径

> Record 是面向透明数据载体的特殊类，自动生成组件访问器、`equals/hashCode/toString` 等，但并不是“万能 DTO”；它仍然可以有方法和校验逻辑，核心约束是状态由 record components 定义。

# JDK 17：LTS

## 核心特性

- Sealed Classes 正式；
- Pattern Matching for `switch` Preview；
- Enhanced Pseudo-Random Number Generators；
- Context-Specific Deserialization Filters；
- 恢复严格浮点语义；
- macOS/AArch64 支持；
- JDK 内部 API 强封装继续收紧。

## Sealed 高频题

```java
public sealed interface Payment permits CardPayment, WalletPayment {}
```

> Sealed 类型显式限制允许的子类型，适合状态机、领域模型和模式匹配，增强封闭层次结构的可推理性。

# JDK 18

- UTF-8 成为默认 Charset；
- Simple Web Server：`jwebserver`；
- Javadoc Code Snippets；
- Internet-Address Resolution SPI。

# JDK 19：Loom 进入主舞台

- Virtual Threads Preview；
- Structured Concurrency Incubator；
- Record Patterns Preview；
- Pattern Matching for switch 继续 Preview；
- Foreign Function & Memory API Preview。

## 面试重点

> 从 JDK 19 开始要建立 Loom 演进时间线：19 预览 → 20 二预览 → 21 Virtual Threads 正式。

# JDK 20

- Virtual Threads 第二次 Preview；
- Scoped Values Incubator；
- Structured Concurrency 第二轮 Incubator；
- Record Patterns 第二次 Preview；
- FFM API 第二次 Preview。

# JDK 21：现代 Java 高并发分水岭

## 正式特性

- Virtual Threads 正式；
- Record Patterns 正式；
- Pattern Matching for switch 正式；
- Sequenced Collections；
- Generational ZGC；
- Key Encapsulation Mechanism API。

## Preview

- Scoped Values；
- Structured Concurrency；
- String Templates（后续未继续进入正式标准）；
- Unnamed Patterns / Variables；
- Foreign Function & Memory API 第三次 Preview。

## Virtual Threads 90 秒回答

> 虚拟线程降低的是阻塞 IO 场景的线程承载成本，不提高 CPU 算力和下游容量。它适合 LLM、HTTP、DB 等高等待任务，但仍需要 RateLimiter、Semaphore、连接池和舱壁限制真正稀缺资源。

对应深挖：[JDK 21–25 虚拟线程](./virtual-threads-jdk21-25.md)。

# JDK 22

- Foreign Function & Memory API 正式；
- Unnamed Variables & Patterns 正式；
- Stream Gatherers Preview；
- Class-File API Preview；
- Structured Concurrency 第二次 Preview；
- Scoped Values 第二次 Preview；
- Statements before `super(...)` Preview；
- G1 Region Pinning；
- Multi-File Source-Code Programs。

## FFM 高频题

> FFM 提供 Java 与 native code / native memory 的标准互操作方式，目标是逐步降低 JNI 的复杂度、危险性和维护成本，但迁移仍需评估 native 生命周期、ABI 和性能边界。

# JDK 23

- Markdown Documentation Comments；
- Generational ZGC 成为默认 ZGC 模式；
- Primitive Types in Patterns / `instanceof` / `switch` Preview；
- Module Import Declarations Preview；
- Stream Gatherers 第二次 Preview；
- Class-File API 第二次 Preview；
- Structured Concurrency 第三次 Preview；
- Scoped Values 第三次 Preview；
- Flexible Constructor Bodies 第二次 Preview。

# JDK 24

## 正式/重要特性

- Class-File API 正式；
- Stream Gatherers 正式；
- Virtual Threads 在 `synchronized` 场景的 Pinning 问题显著改善；
- Ahead-of-Time Class Loading & Linking；
- Security Manager 永久禁用；
- ZGC 移除 Non-Generational 模式；
- Generational Shenandoah Experimental；
- Key Derivation Function API Preview；
- Quantum-Resistant ML-KEM / ML-DSA；
- Compact Object Headers Experimental。

## 高频追问：JDK 24 对虚拟线程最重要的变化？

> JEP 491 让虚拟线程在持有 `synchronized` monitor 时不再因为传统 monitor 机制长期绑定 carrier thread，显著缓解此前常见的 pinning 风险。面试时仍应强调：native/foreign 等其他不可卸载路径仍要监控，且下游容量限制依旧存在。

# JDK 25：LTS

JDK 25 于 2025-09-16 GA，共包含 18 个 JEP。

## 面试最值得记的特性

- Scoped Values 正式；
- Module Import Declarations 正式；
- Compact Source Files & Instance Main Methods 正式；
- Flexible Constructor Bodies 正式；
- Key Derivation Function API 正式；
- Compact Object Headers 正式；
- Generational Shenandoah；
- Ahead-of-Time Command-Line Ergonomics；
- Ahead-of-Time Method Profiling；
- JFR CPU-Time Profiling / Cooperative Sampling / Method Timing & Tracing；
- Stable Values Preview；
- Structured Concurrency 第五次 Preview；
- Primitive Types in Patterns 第三次 Preview；
- Vector API 第十次 Incubator。

## Scoped Values vs ThreadLocal

> Scoped Values 适合在线程/任务作用域内只读传播上下文，尤其适配虚拟线程和结构化并发；ThreadLocal 更通用但生命周期管理更容易造成泄漏和隐藏耦合。不能简单说 Scoped Values “完全替代” ThreadLocal。

# JDK 26：当前 GA Feature Release

JDK 26 于 **2026-03-17 GA**，包含 10 个 JEP。

## 核心特性

- HTTP/3 for the HTTP Client API；
- G1 GC 通过减少同步提高吞吐；
- Ahead-of-Time Object Caching with Any GC；
- Prepare to Make Final Mean Final：深反射修改 `final` 字段开始更严格治理；
- PEM Encodings of Cryptographic Objects 第二次 Preview；
- Lazy Constants 第二次 Preview；
- Structured Concurrency 第六次 Preview；
- Primitive Types in Patterns 第四次 Preview；
- Vector API 第十一次 Incubator；
- Remove the Applet API。

## 26 最值得 P7/P8 关注的三点

1. **HTTP/3**：标准 `HttpClient` 网络能力继续演进；
2. **Leyden / AOT**：Java 正持续优化启动、Warmup 和云原生弹性；
3. **Integrity by Default**：反射修改 final、JNI/Unsafe 等传统“后门式能力”持续收紧。

# 五条演进主线

## 1. 语言

Lambda → `var` → Switch Expression → Records → Sealed → Pattern Matching → Module Imports / Compact Source Files。

## 2. 并发

CompletableFuture → Flow → Virtual Threads → Scoped Values → Structured Concurrency。

## 3. JVM / GC

PermGen→Metaspace → G1 默认 → ZGC/Shenandoah → Generational ZGC → Compact Object Headers → AOT / Leyden。

## 4. Native / 性能

JNI / Unsafe 逐步治理 → FFM 正式 → Vector API 持续孵化 → AOT Cache。

## 5. 可观测性

JFR 开源 → Event Streaming → CPU-Time Profiling / Cooperative Sampling / Method Timing。

# 面试：到底应该重点背哪些版本？

## 第一优先级

- **8**：Lambda / Stream / CompletableFuture；
- **11**：HTTP Client / JFR / ZGC；
- **17**：Records / Sealed / Pattern Matching；
- **21**：Virtual Threads；
- **25**：Scoped Values / Compact Object Headers / AOT / JFR；
- **26**：HTTP/3 / AOT Cache / G1 / Integrity。

## 第二优先级

重点知道特性“在哪个版本预览、在哪个版本正式”：

- Switch Expressions：12 Preview → 14 Final；
- Text Blocks：13 Preview → 15 Final；
- Records：14 Preview → 16 Final；
- Sealed：15 Preview → 17 Final；
- `instanceof` Pattern：14 Preview → 16 Final；
- Virtual Threads：19 Preview → 20 Preview → 21 Final；
- FFM：多轮孵化/预览 → 22 Final；
- Scoped Values：20 Incubator → 21–24 Preview → 25 Final；
- Structured Concurrency：19 Incubator → 21 起 Preview → 26 仍为 Preview。

# 30 秒标准答案

> JDK 版本我一般不按流水账背，而是看几条演进主线。JDK 8 是 Lambda、Stream 和 CompletableFuture 的现代 Java 起点；9 模块化；11 是 HTTP Client、JFR 和新 GC 的企业 LTS；17 把 Records、Sealed、Pattern Matching 这类语言能力逐步落稳；21 最大变化是 Virtual Threads 正式；22 FFM 正式；24 解决了虚拟线程在 synchronized 下的重要 pinning 痛点；25 是新的 LTS，Scoped Values、Compact Object Headers 和 AOT/JFR 能力继续成熟；26 又增加 HTTP/3、AOT Object Cache 和 G1 吞吐优化。真正面试时我会结合项目说明这些特性解决了什么生产问题，而不是只背版本号。

# 参考

- OpenJDK JDK Projects / JEP Index
- Oracle JDK Release Notes
- Java Language / JVM Specifications
