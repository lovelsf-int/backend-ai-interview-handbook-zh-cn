---
title: Object 常用方法与对象面试题
description: Object 方法速查、equals 与 hashCode、toString、getClass、clone、wait 与 notify，以及资源释放边界
status: reviewing
baseline: Java SE 25 API 与 JLS；finalization 版本变化按 JEP 421
last_verified: 2026-09-09
level: 基础到 P7/P8
source: Java 官方 API、语言规范与本站原创场景推演
---

# Object 常用方法与对象面试题

“Java 对象通常有哪些方法”在基础面试中一般指 `java.lang.Object` 定义的方法。业务对象还可能声明 getter、setter、业务行为和接口方法，这些不是 Object 自动提供的。构造器也不算普通方法，不被子类继承。

## 方法速查

按 Java SE 25 的 Object 声明，包含重载及已弃用方法共 11 个实例方法，按方法名计 9 组。

| 方法 | 用途 | 能否重写 |
| --- | --- | --- |
| `boolean equals(Object obj)` | 相等判断 | 可以 |
| `int hashCode()` | 哈希值 | 可以 |
| `String toString()` | 字符串表示 | 可以 |
| `Class<?> getClass()` | 运行时类型 | 不可以，final |
| `protected Object clone()` | 复制对象 | 可以，注意 protected 与 Cloneable |
| `void wait()` | 等待通知或中断 | 不可以，final |
| `void wait(long timeoutMillis)` | 带超时等待 | 不可以，final |
| `void wait(long timeoutMillis, int nanos)` | 带额外纳秒参数的等待 | 不可以，final |
| `void notify()` | 通知一个等待线程 | 不可以，final |
| `void notifyAll()` | 通知所有等待线程 | 不可以，final |
| `protected void finalize()` | 历史终结机制，已弃用待移除 | 历史上可以，新代码不用 |

完整签名、异常声明与版本状态见 [Object API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html)。protected 方法不是在任意位置都能通过任意对象调用；“所有对象都有这些基础能力”不等于“每个方法都公开可调用”。

## Q1：equals 和 == 有什么区别？

**标准回答：** 对引用，`==` 判断是否指向同一个对象；Object 默认 equals 也是引用相等。业务类可以重写 equals 表达值相等，但要保持自反、对称、传递、一致，以及非空对象不等于 null。

**追问与答案：** `equals(MyType other)` 是重载，不是重写 `equals(Object)`。用 `@Override` 让编译器帮助发现签名写错，避免直接调用看起来正确、放进集合后却按另一套方法比较。

## Q2：为什么重写 equals 时通常必须重写 hashCode？

**标准回答：** 相等对象必须有相同哈希值；哈希相同不保证对象相等。否则 HashMap 可能把逻辑相等的键放到不同位置，使查询和去重失效。相关字段在一次执行中未改变时，hashCode 应保持一致，不要求跨进程相同。

以下是面向 SOC 的原创值对象示例，用租户和告警号共同表达身份；示例采用 Java 17+ record 语法。

```java
import java.util.HashMap;
import java.util.Map;

record AlertKey(String tenantId, String alertId) {}

class Demo {
    public static void main(String[] args) {
        Map<AlertKey, String> states = new HashMap<>();
        states.put(new AlertKey("tenant-a", "A123"), "DONE");
        System.out.println(states.get(new AlertKey("tenant-a", "A123")));
        // DONE：两个实例不同，但两个 String 分量相等。
    }
}
```

**追问与答案：** 能否把可变对象当 Map 的 key？若入 Map 后修改参与相等判断的字段，行为可能失去保证。比如把上例改成可变类，入库后修改 tenantId，会改变身份口径。使用不可变业务键，别依靠“再 put 一次”修复已有条目。见 [Map 的可变键约束](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html)。

更深问题见 [集合、Map 与泛型](./collections-generics-interview-guide.md)：哈希分桶只帮助寻找候选，相等判断才决定键是否等价。

## Q3：toString 输出的是内存地址吗？

**标准回答：** 不是。Object 默认格式由运行时类名、`@` 和 hashCode 的无符号十六进制形式组成，不应把它当物理地址；子类可完全重写输出。

**追问与答案：** 在 SOC 告警对象上自动生成包含全部字段的 toString 有什么问题？可能将 Token、邮件正文和个人信息写进日志，循环引用也可能导致递归。工程上只输出必要标识和脱敏摘要；不要在 toString 中发起数据库或远程请求。

## Q4：getClass 和 instanceof 有什么区别？

**标准回答：** getClass 返回对象的运行时 Class；instanceof 判断对象是否兼容某个类型。一个子类实例可以同时满足父类与接口的 instanceof 判断，但运行时类只有对应的那个 Class。

**追问与答案：** equals 应该用 getClass 还是 instanceof？取决于相等语义。继承层次若增加值字段，要防止父子对象比较破坏对称性或传递性；代理对象又可能使严格类型比较与业务预期不同。对明确的值对象，可选 final 类或 record 缩小设计边界；不把一种判断方式视为所有实体的通用答案。

## Q5：clone 是深拷贝吗？

**标准回答：** Object.clone 默认按字段复制，引用字段仍指向原对象，是浅拷贝。调用其实现通常要求实现 Cloneable，否则抛 CloneNotSupportedException；Cloneable 是标记接口，本身没有声明 clone 方法。见 [Cloneable API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Cloneable.html) 与前面的 Object API。

**追问与答案：** 复制一条告警后修改副本的 List，为什么原告警也变了？两份对象仍共用同一个可变 List。复制 List 只隔离容器，List 内元素若可变，还要决定是否继续复制。优先用明确的复制构造器、工厂方法或不可变模型表达复制范围；深拷贝不是无条件复制一切，连接、锁与文件句柄尤其不能照搬。

## Q6：wait 为什么要在 synchronized 中调用？

**标准回答：** 调用者必须拥有目标对象的监视器，否则抛 IllegalMonitorStateException。wait 释放的是该对象的监视器，不释放线程持有的其他对象锁；结束等待后需重新取得该监视器才能继续。规范见 [JLS 17.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.2)。

下面是一次性结果等待器，用于说明条件检查，不是完整生产任务框架：

```java
final class DecisionSlot {
    private final Object lock = new Object();
    private boolean ready;
    private String result;

    public String await() throws InterruptedException {
        synchronized (lock) {
            while (!ready) {
                lock.wait();
            }
            return result;
        }
    }

    public void complete(String value) {
        synchronized (lock) {
            if (ready) throw new IllegalStateException("already completed");
            result = value;
            ready = true;
            lock.notifyAll();
        }
    }
}
```

**追问与答案：** 为什么是 while，不是 if？线程可能虚假唤醒，或者重新取得锁时条件已经改变。通知不是业务条件成立的保证，必须再次检查。本例也通过同一把锁保护结果与 ready 的可见性；中断向上传递，不吞异常后继续假装成功。

## Q7：notify 后对方会立即执行吗？

**标准回答：** 不会立即交出锁。notify 选择一个等待线程，notifyAll 通知全部，但被通知线程仍要竞争该监视器；不保证选择顺序或公平性。若没有等待者，通知不会变成供未来消费的一张“票”。规范见 [JLS 通知语义](https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.2.2)。

**追问与答案：** 如何避免先通知、后等待造成挂起？保存真实条件，并在同一锁下先检查条件再决定等待。上例先 complete 后 await 会直接返回，正确性来自 ready，而非记住了一次 notifyAll。多种条件共用等待集合时要防止 notify 唤醒不满足条件的线程；业务开发常用 BlockingQueue、CountDownLatch 或 CompletableFuture 表达需求。

## Q8：wait 与 sleep 有什么区别？

**标准回答：** wait 是 Object 的等待机制，会释放对应监视器；sleep 是 Thread 的静态方法，让当前线程暂停，不释放已持有的监视器。sleep 不是线程间可见性协议，定时等待到期也不保证立刻得到 CPU。见 [JLS 17.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.3)。

**追问与答案：** wait(1000) 能否作为总计一秒的循环等待？每次循环重新等待一秒可能把总等待拉长。应计算总截止时间与剩余预算，或使用带超时的并发工具；还应处理取消与中断，避免调用方离开后后台任务继续占资源。

## Q9：finalize 能用来关闭连接吗？

**标准回答：** 不应依赖它。执行时机不可控，不能保证在需要时运行；finalization 在 JDK 18 被标记为待移除弃用机制。用 AutoCloseable 与 try-with-resources 明确释放资源；Cleaner 也不能替代及时 close。见 [JEP 421](https://openjdk.org/jeps/421)。

**追问与答案：** final、finally、finalize 是一回事吗？不是。final 限制赋值、重写或继承；finally 是异常控制结构；finalize 是历史终结回调。资源释放应属于业务生命周期，不是等 GC 替业务做收尾。

## 面试表达与复习顺序

可以这样开场：“我把 Object 方法分为相等与哈希、对象描述与类型、复制、线程等待通知，以及已弃用的终结机制。重点不是背方法数量，而是 equals/hashCode 的契约、clone 的共享引用、wait 的锁与条件协议。”

针对资深面试，再用业务例子说明：租户 ID 是否进入业务键、键是否可变、日志是否泄漏信息、取消是否传到等待线程、资源是否确定释放。这些场景比只背 11 个方法更能体现工程判断。

继续阅读：[JMM 与线程上下文](./jmm-volatile-threadlocal.md)、[锁与同步器](./concurrency-locks-aqs-cas.md)、[对象生命周期](../jvm/class-loading-object-lifecycle.md)。本文代码用于学习；站点检查不替代 Java 编译或并发压力测试。
