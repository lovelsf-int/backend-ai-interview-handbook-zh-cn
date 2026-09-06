---
title: Java 集合、Map 与泛型高频面试
description: 集合选型、HashMap、ConcurrentHashMap、不可变集合、equals/hashCode 与泛型擦除的生产边界
status: verified
baseline: Java SE 26 API and Java Language Specification 26
last_verified: 2026-09-06
level: P7/P8
source: Java SE 26 API、JLS 26 与生产实践整理
---

# Java 集合、Map 与泛型高频面试

> 集合题的高分点不是背内部常量，而是从数据访问模式、顺序、并发、内存、复杂度和一致性语义完成选型，并能指出 API 契约与某个 JDK 实现细节的边界。

## 90 秒回答骨架

Java 集合先按语义分为 `List`、`Set`、`Queue/Deque` 和 `Map`。选型时我先问五件事：是否需要顺序、按下标还是按键访问、读写比例、是否并发、能否接受快照或弱一致遍历。

单线程高频随机访问通常优先 `ArrayList`；真正需要双端队列语义时使用 `ArrayDeque`；唯一性查找用 `HashSet`；键值查询用 `HashMap`；需要排序用 `TreeMap`；并发读写用 `ConcurrentHashMap`。`CopyOnWriteArrayList` 只适合读多写极少且集合不大的场景，因为每次写都会复制底层数组。

`HashMap` 的平均查询接近常数时间，但依赖哈希分布和容量。键必须保持稳定的 `equals/hashCode` 语义，放入 Map 后再修改参与哈希的字段会导致逻辑上“找不到”。多线程复合操作不能用普通 `HashMap`；即便换成 `ConcurrentHashMap`，`get` 后 `put` 仍是两个步骤，应使用 `putIfAbsent`、`compute` 或 `merge` 等原子方法。

## 集合选型表

| 需求 | 首选 | 关键边界 |
|---|---|---|
| 按下标随机访问、尾部追加 | `ArrayList` | 中间插入/删除可能搬移元素；扩容会分配新数组 |
| 双端入队出队、栈 | `ArrayDeque` | 不支持按下标随机访问；不要用 `Stack` 作为新代码首选 |
| 去重、不要求顺序 | `HashSet` | 本质依赖哈希和相等性契约 |
| 保留插入顺序 | `LinkedHashMap` / `LinkedHashSet` | 多维护链路，空间成本更高 |
| 按键排序、范围查询 | `TreeMap` | 操作通常是 `O(log n)`；比较器必须与业务相等性协调 |
| 并发键值读写 | `ConcurrentHashMap` | 单个方法线程安全不等于任意组合都原子 |
| 读多写极少的监听器列表 | `CopyOnWriteArrayList` | 写放大和内存峰值明显；迭代看到快照 |
| 有界生产者消费者 | `ArrayBlockingQueue` | 容量必须来自下游吞吐和等待预算 |
| 零容量直接移交 | `SynchronousQueue` | 没有内部存储；生产者与消费者必须配对 |

## HashMap 应该讲到哪一层

### 契约层

- 允许一个 `null` Key 和多个 `null` Value。
- 不保证遍历顺序长期稳定。
- 在哈希分布合理时，`get` 和 `put` 具有接近常数时间的期望性能。
- 迭代成本与容量和实际元素数都有关，容量过大也会拖慢遍历。
- 它不是线程安全容器；存在并发结构修改时必须外部同步或换容器。

### 典型实现层

典型 OpenJDK 实现会先计算扰动后的哈希，再定位数组桶；冲突元素在桶内组织。冲突严重且容量达到一定条件时，桶可能从链式结构转换为树形结构，以避免极端哈希碰撞退化。

面试可以解释树化思路，但要加一句：树化阈值、扩容细节和内部字段属于具体 JDK 实现，不是 `Map` 接口或 `HashMap` API 对所有实现承诺的契约。源码题先确认目标 JDK 版本。

### 容量与扩容

默认负载因子通常在时间和空间之间折中。已知会放入大量元素时，应按预期元素量初始化容量，避免多次扩容；当前 JDK 还提供按预期映射数量创建 Map 的工厂方法。不要盲目把容量设得很大，因为空桶同样增加遍历和内存成本。

## equals 与 hashCode 为什么必须一起设计

`HashMap` 先用哈希缩小桶范围，再用相等性确认 Key。核心约束是：两个对象若 `equals` 为真，它们的 `hashCode` 必须相同；反过来不要求成立，哈希相同可以通过相等性继续区分。

常见事故：

- 只重写 `equals` 未重写 `hashCode`，导致相等对象落到不同位置。
- Key 是可变对象，入 Map 后修改了参与 `equals/hashCode` 的字段。
- `compareTo` 与 `equals` 语义不一致，放入有序集合后出现“看似重复”或“查找异常”。
- ORM 实体在持久化前后 ID 改变，却被长期作为哈希 Key。

生产上更稳妥的 Key 通常是不可变值对象，例如稳定的订单号、租户 ID 与业务 ID 组合，而不是生命周期复杂的可变实体。

## ConcurrentHashMap 的正确边界

`ConcurrentHashMap` 支持高并发读取和更新。读取通常不需要锁住整个表，并能与更新重叠；成功完成的某个 Key 更新与后续观察到该更新的读取之间存在可见性保证。

但要区分三层原子性：

1. `get`、`put` 等单个方法的线程安全；
2. `putIfAbsent`、`compute`、`merge` 等单 Key 复合原子操作；
3. 跨多个 Key、多个容器或外部数据库的业务不变量。

第三层不能因为用了并发容器就自动成立，仍需要锁、状态机、数据库条件更新或事务。

错误写法：

```java
if (!map.containsKey(key)) {
    map.put(key, createValue());
}
```

两个线程都可能通过检查。单 Key 初始化应优先：

```java
Value value = map.computeIfAbsent(key, this::loadValue);
```

还要注意映射函数不应执行无界慢调用、递归修改同一映射或产生不可重放副作用。缓存加载涉及远程 IO 时，通常还要处理超时、请求合并、失败不缓存和热点 Key。

## 计数器为什么常用 LongAdder

高竞争统计场景下，所有线程更新同一个原子变量可能形成热点。`LongAdder` 通过分散竞争再汇总，通常更适合吞吐型指标；但 `sum()` 不是跨并发更新的线性化快照，不适合余额、库存或版本号等严格业务状态。

典型频次统计可以使用：

```java
ConcurrentHashMap<String, LongAdder> frequencies = new ConcurrentHashMap<>();
frequencies.computeIfAbsent(key, ignored -> new LongAdder()).increment();
```

## 迭代器：fail-fast 不是并发安全

普通集合的 fail-fast 迭代器可能在检测到结构修改时抛出 `ConcurrentModificationException`，但这只是尽力检测错误，不能作为业务正确性机制。不能依赖“它一定抛异常”判断并发修改。

并发集合可能提供弱一致或快照式迭代：

- `ConcurrentHashMap` 迭代不等于对整个 Map 加锁后的全局快照；
- `CopyOnWriteArrayList` 迭代基于创建迭代器时的数组快照；
- 需要强一致导出时，应明确版本、锁定策略或复制边界。

## 泛型擦除怎么回答

Java 泛型主要在编译期提供类型检查。编译后很多参数化类型信息通过擦除映射到边界类型，编译器在必要位置插入类型转换，并可能生成桥接方法保持多态。

因此：

- `List<String>` 与 `List<Integer>` 不是两个不同的运行时 Class；
- 不能直接 `new T()` 或创建普通的 `new T[]`；
- 不能通过 `instanceof List<String>` 判断元素参数；
- 原始类型会绕过部分检查，可能导致延迟到运行时的 `ClassCastException`；
- 数组具备运行时组件类型检查，泛型通常是不变的，两者不能混为一谈。

“擦除”不等于运行时完全没有任何泛型信息。类、字段和方法签名可以在 Class 文件的元数据中保留声明信息，反射能够读取部分泛型签名；但对象实例不会因此携带完整的 `T` 实参。

## PECS 与通配符

`List<Integer>` 不是 `List<Number>` 的子类型。需要只读生产者时使用 `? extends T`，需要写入消费者时使用 `? super T`：Producer Extends, Consumer Super。

```java
static double sum(List<? extends Number> values) {
    return values.stream().mapToDouble(Number::doubleValue).sum();
}

static void addDefaults(List<? super Integer> target) {
    target.add(0);
}
```

`? extends Number` 不能安全写入某个具体 Number 子类，因为调用方可能传入 `List<Double>`；`? super Integer` 读取时只能安全视为 `Object`。

## 不可修改视图不等于不可变对象

需要区分：

- `Collections.unmodifiableList(source)`：通常是原集合的不可修改视图，`source` 后续变化仍可能反映出来；
- `List.copyOf(source)`：创建不可修改结果，并拒绝 `null` 元素；
- 元素本身仍可能是可变对象，集合不可改不代表对象图深度不可变。

跨线程共享配置、缓存快照和返回 API 结果时，应明确是只禁止调用方修改，还是要求稳定快照，还是要求元素也不可变。

## 生产场景连续追问

### 百万数据去重用 HashSet 就够了吗

先估算 Key 数量、对象大小、哈希表容量和峰值内存，再看是否需要顺序、过期、跨节点和可接受误判。单机精确去重可用 `HashSet`，流式大规模去重可能要分区、数据库唯一键、Redis、布隆过滤器或离线排序，方案取决于正确性边界。

### 本地缓存为什么不能直接用 ConcurrentHashMap

它只提供并发 Map，不提供容量上限、过期、淘汰、加载合并、刷新、命中率和内存权重治理。生产缓存通常需要专用缓存库，并监控条目数、权重、命中率、加载延迟和回收压力。

### 排序集合的比较器写错会怎样

比较器必须满足反对称、传递和稳定的零值语义。使用减法比较整数可能溢出，应使用 `Integer.compare` 等方法。比较器若把两个不相等对象比较为零，`TreeSet/TreeMap` 可能把它们视作同一排序位置。

## P7/P8 高频题

1. `ArrayList` 和 `LinkedList` 如何按真实访问模式选？
2. `HashMap` 为什么平均快，什么情况会退化？
3. 为什么可变对象不适合作为 Hash Key？
4. `ConcurrentHashMap` 的 `get` 后 `put` 为什么仍有竞态？
5. `computeIfAbsent` 的映射函数为什么不能随便调用远程服务？
6. fail-fast、弱一致迭代和快照迭代分别意味着什么？
7. `LongAdder` 为什么适合指标而不适合余额？
8. 泛型擦除后编译器做了什么，桥接方法解决什么？
9. `? extends T` 和 `? super T` 分别允许什么操作？
10. 不可修改集合、不可变集合和不可变对象图有什么区别？

## 官方依据

- [Java SE 26 HashMap API](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/HashMap.html)
- [Java SE 26 ConcurrentHashMap API](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html)
- [Java SE 26 ConcurrentMap API](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/ConcurrentMap.html)
- [JLS 26：Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se26/html/jls-4.html)
