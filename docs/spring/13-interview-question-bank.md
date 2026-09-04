---
title: Spring 100 道核心面试题
description: 覆盖 IoC、Bean 创建、AOP、事务、MVC、Boot、异步与生产排障的速记题库
status: reviewing
baseline: Spring Framework core architecture and Spring Boot application model
last_verified: 2026-09-04
level: P7/P8
source: Spring 官方参考文档、核心源码与资深 Java 面试整理
---

# Spring 100 道核心面试题

## 使用方式

先遮住答案做 30 秒口述，再用对应专题补充源码、边界和项目案例。题库答案用于快速复习，正式面试应至少增加一次生产取舍或故障路径。

## Spring 与整体架构

#### Q1. Spring Framework 的核心是什么？

**答案：**核心是 IoC 容器，AOP 是关键增强机制；Web、事务与数据访问建立在容器和代理基础设施之上。

#### Q2. IoC 和 DI 有什么区别？

**答案：**IoC 是控制权交给容器的思想，DI 是容器在创建对象时提供依赖的实现方式。

#### Q3. Spring Framework 与 Spring Boot 有什么区别？

**答案：**Framework 提供容器、AOP、事务和 Web；Boot 负责启动、自动配置、Starter 与运维约定。

#### Q4. BeanDefinition 是什么？

**答案：**Bean 的元数据配方，描述类型、作用域、依赖、初始化、销毁、工厂方法和 Supplier 等信息，不是实例本身。

#### Q5. BeanFactory 的职责是什么？

**答案：**注册和读取定义、创建与查找 Bean、解析依赖、管理作用域和生命周期。

#### Q6. ApplicationContext 比 BeanFactory 多什么？

**答案：**增加资源、Environment、事件、国际化、生命周期和基础设施自动编排。

#### Q7. DefaultListableBeanFactory 为什么重要？

**答案：**它同时承担 BeanDefinition 注册表、按类型候选解析和可配置 BeanFactory 等核心职责。

#### Q8. Spring 单例是 JVM 单例吗？

**答案：**不是，是每个容器中每个 Bean 名称通常一个共享实例。

#### Q9. 为什么说注解只是元数据？

**答案：**真正行为由配置解析器、后置处理器、Advisor 或任务基础设施读取注解后实现。

#### Q10. Spring 的扩展性来自哪里？

**答案：**来自定义、实例、代理、容器和事件等阶段的稳定 SPI 与模板方法。

## IoC、注入与 Bean

#### Q11. 构造器注入为什么优于字段注入？

**答案：**依赖显式、支持 `final`、易测试，并在构造完成时保证必要依赖存在。

#### Q12. Setter 注入适合什么场景？

**答案：**真正可选或允许重配置的依赖，不适合掩盖必需依赖。

#### Q13. `@Autowired` 如何完成注入？

**答案：**`AutowiredAnnotationBeanPostProcessor` 发现注入点，再委托 BeanFactory 解析候选。

#### Q14. 同一接口多个实现如何选择？

**答案：**使用有业务语义的 `@Qualifier`，真正有默认值时用 `@Primary`，策略集合可注入列表。

#### Q15. Primary 和 Qualifier 谁更精确？

**答案：**Qualifier 显式缩小候选集合，Primary 用于多个候选中的默认优先项。

#### Q16. ObjectProvider 有什么用途？

**答案：**支持可选、延迟、按需和多候选流式获取，但不应掩盖强依赖。

#### Q17. Bean 名称默认怎么产生？

**答案：**组件扫描通常由名称生成器产生，`@Bean` 方法默认使用方法名，也可显式指定。

#### Q18. Spring 中有哪些方式注册 Bean？

**答案：**常见入口包括组件扫描、`@Bean`、`@Import`/ImportSelector/Registrar、XML、编程式 BeanDefinitionRegistry、Registry 后置处理器和 Boot 自动配置；复杂产品对象还常用 `FactoryBean`。这些入口最终大多形成 BeanDefinition。底层实例化再分构造器、静态/实例工厂方法、Supplier 和 FactoryBean 产品对象。

#### Q19. FactoryBean 与 BeanFactory 有何区别？

**答案：**前者是生产对象的特殊 Bean，后者是整个 IoC 容器。

#### Q20. 如何获取 FactoryBean 本身？

**答案：**使用带 `&` 前缀的 Bean 名称，而普通名称获取其产品对象。

## 容器启动与生命周期

#### Q21. refresh 方法做什么？

**答案：**刷新整个上下文：准备工厂、执行定义后置处理、注册实例后置处理器并完成单例初始化。

#### Q22. BeanFactoryPostProcessor 处理什么？

**答案：**在普通 Bean 实例化前修改 BeanDefinition 或工厂配置。

#### Q23. BeanDefinitionRegistryPostProcessor 多了什么能力？

**答案：**可在更早阶段继续注册 BeanDefinition。

#### Q24. BeanPostProcessor 处理什么？

**答案：**处理已经实例化并进入初始化阶段的 Bean，可返回包装后的对象。

#### Q25. Bean 的五段生命周期如何概括？

**答案：**实例化、属性填充、初始化、增强、销毁。

#### Q26. Aware 接口的作用是什么？

**答案：**让 Bean 获得 BeanName、BeanFactory、ApplicationContext 等容器基础设施引用。

#### Q27. PostConstruct 与 afterPropertiesSet 顺序如何？

**答案：**通常先执行 PostConstruct，再执行 InitializingBean，最后自定义 init-method。

#### Q28. prototype Bean 谁负责销毁？

**答案：**容器创建并初始化后通常不跟踪完整销毁，使用方要管理外部资源。

#### Q29. 为什么后置处理器要先于普通单例创建？

**答案：**否则早建 Bean 无法经过完整注入、生命周期与代理链。

#### Q30. Lazy 能解决什么？

**答案：**推迟 Bean 创建或通过延迟代理推迟目标解析，不代表消除业务依赖。

## 循环依赖

#### Q31. 什么是 Spring 三级缓存？

**答案：**完整单例、提前引用、提前引用工厂三层协作的 singleton 创建状态。

#### Q32. 三级缓存为什么需要工厂？

**答案：**延迟生成提前引用，并允许 AOP 在需要时提前返回代理。

#### Q33. 哪些循环依赖可能被打破？

**答案：**单例 Bean 的属性或 Setter 环，在满足提前引用条件时可能被打破。

#### Q34. 构造器循环依赖为什么不能解决？

**答案：**双方在实例产生前都要求对方完成，无法先暴露半成品。

#### Q35. prototype 循环依赖为什么不能解决？

**答案：**没有全局共享单例创建状态和可复用的提前引用。

#### Q36. 二级缓存为什么可能不够？

**答案：**直接暴露原对象会与最终代理不一致，三级工厂能产生一致的提前代理。

#### Q37. Lazy 是否是循环依赖最佳解？

**答案：**通常不是，它只是推迟解析；应优先拆职责、改依赖方向或用事件解耦。

#### Q38. 循环依赖暴露了什么设计问题？

**答案：**职责边界不清、模块双向依赖或命令与查询方向混乱。

#### Q39. AOP 为什么让循环依赖更复杂？

**答案：**必须保证提前注入引用与最终对外代理身份一致。

#### Q40. 如何重构双向 Service 依赖？

**答案：**提取协调者、拆接口、发布领域事件或重新划分模块/聚合。

## AOP 与代理

#### Q41. Spring AOP 的核心执行模型是什么？

**答案：**运行期代理匹配 Advisor，组装 MethodInterceptor 链后调用目标方法。

#### Q42. Advisor 由什么组成？

**答案：**Pointcut 与 Advice。

#### Q43. JDK 动态代理适合什么？

**答案：**面向接口的 Bean，由代理实现同一接口。

#### Q44. CGLIB 代理有什么限制？

**答案：**final 类/方法与 private 方法无法通过子类覆盖方式增强。

#### Q45. 自调用为什么绕过 AOP？

**答案：**`this` 调用直接进入目标对象，没有重新经过外层代理。

#### Q46. 事务、缓存、异步为什么都有自调用问题？

**答案：**它们常由 Spring AOP Advisor 实现，调用未过代理就没有拦截。

#### Q47. 如何优先解决自调用？

**答案：**把增强边界拆到独立 Bean，通过外部依赖调用代理。

#### Q48. 多个切面的顺序为什么重要？

**答案：**会改变事务、重试、缓存和权限的包裹关系与失败语义。

#### Q49. 如何确认 Bean 已被代理？

**答案：**检查运行期类型与 Advisor，并用行为测试确认目标方法确实被拦截。

#### Q50. Spring AOP 与 AspectJ 的主要区别？

**答案：**Spring AOP 主要代理容器 Bean 的方法执行，AspectJ 可编译/加载期织入更多连接点。

## 事务

#### Q51. Transactional 的底层原理是什么？

**答案：**事务代理中的 TransactionInterceptor 读取属性并委托 TransactionManager 开启、提交或回滚。

#### Q52. REQUIRED 的语义是什么？

**答案：**有事务加入，无事务新建。

#### Q53. REQUIRES_NEW 的语义和风险是什么？

**答案：**挂起外层新开事务，增加连接占用且可能与外层回滚产生业务不一致。

#### Q54. NESTED 与 REQUIRES_NEW 有何区别？

**答案：**NESTED 常用同一物理事务保存点；REQUIRES_NEW 是独立物理事务。

#### Q55. 默认哪些异常会回滚？

**答案：**通常未检查异常和 Error；受检异常需按业务语义配置。

#### Q56. 异常被 catch 后为什么不回滚？

**答案：**代理看到方法正常返回；除非显式标记 rollback-only 或重新抛出。

#### Q57. UnexpectedRollbackException 常见原因？

**答案：**内层已把共享事务标记 rollback-only，外层捕获异常后仍尝试提交。

#### Q58. 异步方法会继承调用线程事务吗？

**答案：**不会自动继承；异步任务应建立自己的事务或通过可靠事件衔接。

#### Q59. 事务中调用远程接口有什么风险？

**答案：**延长连接和锁持有时间，超时结果不确定，并把下游抖动传入本地事务。

#### Q60. DB 与 Kafka 如何保证一致性？

**答案：**业务数据与 Outbox 同事务，异步发布，消费者按稳定事件 ID 幂等。

## Spring MVC

#### Q61. DispatcherServlet 的作用是什么？

**答案：**作为前端控制器统一编排处理器查找、执行、返回值和异常处理。

#### Q62. HandlerMapping 做什么？

**答案：**根据请求条件找到 Handler，并形成包含拦截器的执行链。

#### Q63. HandlerAdapter 为什么存在？

**答案：**适配不同 Handler 执行模型，让 DispatcherServlet 保持稳定。

#### Q64. ArgumentResolver 做什么？

**答案：**把请求、路径、认证和上下文数据解析为 Controller 方法参数。

#### Q65. ReturnValueHandler 做什么？

**答案：**决定 Controller 返回值如何进入消息转换、视图或异步流程。

#### Q66. HttpMessageConverter 在哪里工作？

**答案：**读取 RequestBody 和写出 ResponseBody，对象与媒体类型之间转换。

#### Q67. ControllerAdvice 如何处理异常？

**答案：**由异常解析器链匹配全局或局部异常处理方法并生成响应。

#### Q68. Filter、Interceptor、AOP 如何区分？

**答案：**分别位于 Servlet、MVC Handler 和 Bean 方法层。

#### Q69. Filter 异常一定能被 ControllerAdvice 捕获吗？

**答案：**不一定，异常可能发生在进入 DispatcherServlet 之前。

#### Q70. MVC 异步请求需要关注什么？

**答案：**执行器、超时、取消、上下文传播、再次派发和下游并发限制。

## Spring Boot

#### Q71. SpringApplication.run 的主流程是什么？

**答案：**准备环境、创建上下文、装载来源、refresh、执行 Runner 并发布就绪事件。

#### Q72. 自动配置的本质是什么？

**答案：**导入候选配置类并按条件注册 BeanDefinition。

#### Q73. ConditionalOnMissingBean 有什么意义？

**答案：**默认配置在用户已提供相应 Bean 时退让，但需注意类型、名称和搜索范围。

#### Q74. Starter 的职责是什么？

**答案：**聚合和组织推荐依赖，不等同于自动配置代码。

#### Q75. SpringBootApplication 组合了什么？

**答案：**配置类、自动配置开启和组件扫描等核心语义。

#### Q76. ConfigurationProperties 为什么适合结构化配置？

**答案：**类型安全、集中、可校验、可生成元数据并便于测试。

#### Q77. 自动配置为什么没生效如何排查？

**答案：**查看条件评估报告、classpath、属性、用户 Bean 和配置导入情况。

#### Q78. 用户 Bean 为什么可能没有覆盖默认 Bean？

**答案：**条件的类型/名称/时机或父子上下文搜索范围与预期不同。

#### Q79. Runner 有什么生产风险？

**答案：**长任务会推迟就绪，失败可能让启动失败，必须有幂等、超时和恢复。

#### Q80. 如何分析 Boot 启动慢？

**答案：**按环境、定义注册、Bean 初始化、迁移、网络初始化和 Runner 分阶段度量。

## 事件、缓存、异步与调度

#### Q81. Spring 事件默认是同步的吗？

**答案：**通常在发布线程调用监听器，慢或失败会影响发布方。

#### Q82. TransactionalEventListener 能保证消息不丢吗？

**答案：**不能；提交后到监听执行间仍可能崩溃，关键事件用持久化 Outbox。

#### Q83. Cacheable 的语义是什么？

**答案：**先查缓存，命中跳过目标方法，未命中执行后按规则写缓存。

#### Q84. CachePut 与 Cacheable 有何区别？

**答案：**CachePut 总执行方法后更新缓存；Cacheable 命中可跳过方法。

#### Q85. CacheEvict 能保证缓存与数据库一致吗？

**答案：**不能自动保证，还需设计提交顺序、失败重试、TTL 或消息收敛。

#### Q86. Async 的底层是什么？

**答案：**代理把方法调用封装为任务提交到 TaskExecutor。

#### Q87. void 异步方法异常如何处理？

**答案：**调用方无法从 Future 获取，应配置异常处理、日志、指标和业务失败状态。

#### Q88. 为什么异步会造成过载？

**答案：**提交速度超过下游处理能力时，队列、内存或资源池形成积压。

#### Q89. Scheduled 能保证集群只执行一次吗？

**答案：**不能，多实例需要分布式调度、租约或锁，并保证业务幂等。

#### Q90. 多注解叠加如何判断语义？

**答案：**查看实际 Advisor 顺序和线程切换，并用集成测试验证。

## 作用域、线程安全与生产

#### Q91. singleton Bean 一定线程安全吗？

**答案：**不一定，实例共享不等于并发安全；无状态设计通常更安全。

#### Q92. prototype Bean 一定线程安全吗？

**答案：**不一定，同一实例被共享或依赖非线程安全资源仍会竞争。

#### Q93. singleton 注入 prototype 会怎样？

**答案：**默认只在 singleton 创建时取得一次；按次获取需 Provider 或作用域代理。

#### Q94. Request scope 在异步线程能直接用吗？

**答案：**不能默认用，异步线程可能没有原请求上下文。

#### Q95. ThreadLocal 在线程池中的主要风险？

**答案：**未清理会跨请求污染并保留对象，必须在 finally 中 remove。

#### Q96. 虚拟线程会自动提升数据库吞吐吗？

**答案：**不会，数据库连接、锁、CPU 和下游容量仍是硬约束。

#### Q97. 如何排查连接池耗尽？

**答案：**看 active、idle、pending、获取等待、事务时长、慢 SQL、锁等待和泄漏。

#### Q98. 如何排查 Bean 初始化卡住？

**答案：**线程转储定位 PostConstruct/构造器中的网络、锁、迁移或无限重试。

#### Q99. Spring 服务如何优雅停机？

**答案：**摘流、停止新任务、有界 drain、保存检查点、释放租约并关闭资源。

#### Q100. P7/P8 回答 Spring 题的核心结构是什么？

**答案：**结论、核心对象、调用链、失效边界、生产实践和可观测证据。

## 进阶训练

从 100 题中随机抽取 10 题，每题继续追问“源码入口是什么、什么时候失效、生产如何观测、你的项目如何使用”。能稳定回答三轮追问后，再进入完整模拟面试。
