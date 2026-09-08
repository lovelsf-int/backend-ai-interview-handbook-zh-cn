---
title: Spring Boot 必知 40 问：启动、自动配置与生产治理
description: 40 道标准问答与 P7/P8 追问，覆盖配置、Web、事务异步、探针停机、测试及版本迁移
status: reviewed
baseline: Spring Boot 3.5 examples; Boot 2.7/3.x and 4.0 migration boundaries; Java 17+ unless noted
last_verified: 2026-09-08
level: P7/P8
source: Spring 官方参考文档与迁移指南、OpenJDK、Kubernetes；本站原创归纳和场景推演
---

# Spring Boot 必知 40 问：启动、自动配置与生产治理

Spring Boot 面试必须同时答清“为什么会自动配置”“如何判断配置是否生效”“进程如何安全上线下线”。只背注解名称，无法解释生产中的行为变化。

## 阅读范围与复习优先级

本章沿用原有 Spring Boot 路径，扩展为 **40 道必知问题，每题含标准回答和追问边界**。示例按 Boot 3.5 编写；2.7/3.x 注册机制与 4.0 迁移单独标注。这是学习基线，不是宣称 3.5 是最新版本，也不表示用户项目已采用这些版本。

| 优先级 | 先掌握什么 | 达标方式 |
| --- | --- | --- |
| 必会 | Q01–Q16：启动、自动配置、Starter、配置 | 画出发现到注册的链路，解释配置来源 |
| 生产核心 | Q17–Q30：Web、事务异步、资源、探针与发布 | 给出失败路径和诊断证据，不只报参数 |
| 深挖 | Q31–Q40：测试、迁移、AOT、虚拟线程和场景 | 解释版本边界，并设计可重复验证 |

先读每题标准回答，再遮住答案复述。代码与配置片段是面试示例，不是可直接套用的生产基线；本章不声称已运行独立 Spring Boot 样例应用或完成跨版本兼容测试。

## Boot 与 Framework 的关系

### Q01. Spring、Spring MVC、Spring Boot 分别解决什么问题？ {#boot-q01}

**标准回答：** Spring Framework 提供 IoC、AOP、事务等基础设施；Spring MVC 是其 Servlet Web 框架；Boot 在此基础上提供依赖管理、条件化自动配置、应用启动和运维集成。Boot 不是重新实现一个 Spring，也不要求所有应用都必须是 Web 服务。

**追问与边界：** 问“为什么用了 Boot 仍要懂 Spring”？因为 Bean 生命周期、代理边界和事务语义仍由底层框架决定，自动配置只帮你组织对象，不替你保证业务正确性。

依据：[SpringBootApplication 注解][S1]。

### Q02. `@SpringBootApplication` 包含什么，扫描范围如何确定？ {#boot-q02}

**标准回答：** 它组合 `@SpringBootConfiguration`、`@EnableAutoConfiguration`、`@ComponentScan`。默认组件扫描从启动类所在包向下；启动类应放在应用包的上层，而不是默认包或任意业务子包。

**追问与边界：** 自定义 `scanBasePackages` 主要影响组件扫描，不能想当然地认为 JPA 实体、Repository、MyBatis Mapper 都会按同一规则扫描。分别检查各框架注册入口；自动配置候选也不是靠业务包扫描发现。

依据：[SpringBootApplication 注解][S1]。

## SpringApplication 启动主线

### Q03. `SpringApplication.run()` 的关键阶段是什么？ {#boot-q03}

**标准回答：** 按“准备 Environment 与配置 → 创建并准备 ApplicationContext → 加载配置来源 → refresh → 执行 Runner → 发布就绪事件”回答。refresh 中处理 BeanDefinition、后置处理器和非懒加载单例；Web 上下文还参与嵌入式服务器生命周期。

**追问与边界：** 不要把配置解析、Bean 定义注册和 Bean 实例化混成一个阶段。启动失败应先定位处在环境加载、容器刷新还是 Runner，而不是只背十几个方法名。

依据：[启动、事件、可用性与虚拟线程][S2]。

### Q04. `ApplicationStartedEvent`、Runner、`ApplicationReadyEvent` 有什么区别？ {#boot-q04}

**标准回答：** `ApplicationStartedEvent` 在上下文刷新后、Runner 前；`ApplicationRunner` 接收结构化参数，`CommandLineRunner` 接收字符串数组；二者执行后发布 `ApplicationReadyEvent`，随后发布接受流量的 readiness 状态。

**追问与边界：** 端口能连接不等于业务已就绪。预热须有超时和失败策略；重数据迁移应独立治理。较早的启动事件发生在容器创建前，不能只靠普通 `@Bean` 监听器捕获。

依据：[启动、事件、可用性与虚拟线程][S2]。

## 自动配置原理

### Q05. 自动配置是如何找到并注册 Bean 的？ {#boot-q05}

**标准回答：** 典型 3.5 链路是 `@EnableAutoConfiguration` → `AutoConfigurationImportSelector` → 读取候选自动配置类 → 去重、排除、排序和条件过滤 → 注册满足条件的 BeanDefinition。条件主要在配置处理和定义注册阶段评估，不是每次 HTTP 请求重新扫描。

**追问与边界：** 要区分“类在依赖中”“自动配置进入候选”“条件命中”“Bean 真正创建”。任一环节失败都可能表现为注入不到 Bean，判断不能只看依赖树。

依据：[自定义自动配置与条件测试][S3]。

### Q06. `spring.factories` 与 `AutoConfiguration.imports` 怎么区分版本？ {#boot-q06}

**标准回答：** 2.7 引入 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 并兼容旧注册方式；3.x 不再通过 `spring.factories` 的 `EnableAutoConfiguration` 键注册自动配置，改用 imports 文件。文件中一行一个配置类全名。

**追问与边界：** 不能说“3.x 删除了整个 spring.factories”。其他扩展点的条目未因此全部失效。面试先报版本；维护兼容库时，对目标版本分别做打包发现测试。

依据：[Boot 3.0 迁移指南][S16]。

### Q07. 常见 `@Conditional` 条件及评估时机是什么？ {#boot-q07}

**标准回答：** `@ConditionalOnClass` 检查类路径，`@ConditionalOnMissingBean` 检查已知 Bean 定义，`@ConditionalOnProperty` 检查属性，`@ConditionalOnWebApplication` 区分 Web 类型。显式开关可用 `havingValue="true", matchIfMissing=false` 表达。

**追问与边界：** 不要把属性条件默认理解为严格等于 true；也不要用配置类顺序保证 Bean 初始化先后。自动配置 before/after 影响定义顺序，实例化还由依赖关系等决定。

依据：[自定义自动配置与条件测试][S3]。

### Q08. 用户 Bean 让默认 Bean 退让，等于同名 Bean 覆盖吗？ {#boot-q08}

**标准回答：** 不是。back-off 通常由 `@ConditionalOnMissingBean` 让默认定义不成立；同名覆盖是两个定义竞争同一名称。`@Primary` 主要影响注入候选选择，不会自动删除另一 Bean，更不会消除同名定义冲突。

**追问与边界：** 不要把打开 `spring.main.allow-bean-definition-overriding` 当通用修复。先检查条件匹配的类型、名称、父子上下文、注册时机与 `@Bean` 返回类型，避免掩盖错误配置。

依据：[自定义自动配置与条件测试][S3]。

## Starter 的作用

### Q09. Starter、自动配置、BOM 和 Maven 插件有什么区别？ {#boot-q09}

**标准回答：** Starter 聚合依赖；autoconfigure 实现按条件注册 Bean；`spring-boot-dependencies` BOM 管理一组兼容依赖版本；Boot Maven/Gradle 插件负责可执行包等构建工作。引入 BOM 不等于增加具体依赖，也不等于自动配置好构建插件。

**追问与边界：** 为什么不用每个依赖都手工选最新版本？单个库能启动不代表组合兼容。先看 BOM 和框架兼容矩阵；确需覆盖版本时，记录原因并跑集成测试、依赖冲突与安全检查。

依据：[构建与依赖管理][S4]。

### Q10. 如何设计一个可供其他团队使用的 Starter？ {#boot-q10}

**标准回答：** 划分依赖入口和自动配置模块，提供独立配置前缀、类型化属性、校验、开关、用户 Bean 退让及 imports 注册。自动配置放在独立包，避免被业务组件扫描意外加载；资源连接的创建、关闭和失败语义也需明确。

**追问与边界：** 不能把“封装几个依赖”当完整交付。还需条件测试、属性元数据、示例、兼容矩阵、脱敏日志和升级说明；避免在构造 Bean 时执行无界远程重试。

依据：[自定义自动配置与条件测试][S3]。

## 配置绑定

### Q11. 配置优先级怎么回答才不容易出错？ {#boot-q11}

**标准回答：** 普通运行场景可记住常见链路：命令行参数通常高于 JVM 系统属性，后者高于操作系统环境变量，再高于常规配置文件。同层级文件还受 Profile、位置组及 import 规则影响；测试属性另有更高优先级来源。

**追问与边界：** 这不是所有 PropertySource 的完整排序。排障看最终 Environment 及值的来源，不只看某份 YAML；加入配置中心后应以其实际接入方式和版本核对，不能套一个绝对“远程最高”的口诀。

依据：[外部配置与类型绑定][S5]。

### Q12. `location`、`additional-location`、`import` 各做什么？ {#boot-q12}

**标准回答：** `spring.config.location` 替换默认搜索位置，`spring.config.additional-location` 在默认位置之外追加，`spring.config.import` 从配置文档声明导入其他来源。`optional:` 表示缺失时可以继续，不表示配置存在时忽略其内容。

**追问与边界：** 改配置不生效时，先确认文件是否被加载，再看覆盖来源。关键凭证文件不应为追求“能启动”就加 optional；搜索路径等早期属性也不能指望从尚未加载的文件里读取。

依据：[外部配置与类型绑定][S5]。

### Q13. Profile、配置文件和 `@Profile` 是一回事吗？ {#boot-q13}

**标准回答：** `spring.profiles.active` 选择活跃环境；`application-{profile}.yaml` 提供环境配置；`@Profile` 决定特定 Bean/配置是否参与注册。多 Profile 和多个位置组合要按覆盖规则判断，不是看到 prod 字样就一定生效。

**追问与边界：** Profile 不是权限或租户隔离机制。`spring.profiles.active` 不应写在 Profile 专属文档里做自激活；多文档 YAML 可用 `spring.config.activate.on-profile` 表达激活条件。

依据：[Profile][S6]。

### Q14. `@Value` 与 `@ConfigurationProperties` 如何选择？ {#boot-q14}

**标准回答：** 少量标量或确有 SpEL 需求可用 `@Value`；一组结构化配置优先 `@ConfigurationProperties`，便于类型转换、绑定、校验及元数据生成。两者不是功能完全相同的两种写法，宽松绑定行为也不应简单等同。

**追问与边界：** 声明属性类不等于它已经注册，应使用 `@ConfigurationPropertiesScan`、`@EnableConfigurationProperties` 等合适入口。共享配置不要散落在多个类里，各自维护一套默认值。

依据：[外部配置与类型绑定][S5]。

### Q15. 如何让错误配置在启动阶段暴露？ {#boot-q15}

**标准回答：** 对配置属性启用 `@Validated` 并提供 Jakarta Validation 实现；使用 `@NotNull`、`@Min` 等与类型匹配的约束，嵌套对象按需 `@Valid`。还要校验诸如重试总预算小于上游截止时间这样的跨字段关系。

**追问与边界：** “能绑定”不代表“业务有效”。为缺失、越界、单位错误和非法组合写启动测试；Duration 等类型的具体约束别生搬数字注解。密钥缺失应失败或禁用功能，不应静默落到危险默认值。

依据：[外部配置与类型绑定][S5]。

### Q16. 修改配置中心或 YAML 后，所有 Bean 会自动更新吗？ {#boot-q16}

**标准回答：** 不会。Boot 加载外部配置不等于自动监视文件并重建整个对象图。动态更新需要配置客户端和刷新机制；Spring Cloud 的 `@RefreshScope` 也不是所有状态对象都能安全热更新的保证。

**追问与边界：** Environment 改了，已构造客户端的连接和超时不一定改变。关键配置建议采用版本化快照、先校验再原子切换，并设计失败回退；不要把普通单例属性更新当作跨实例原子发布。

依据：[Spring Cloud 刷新边界][S20]。

## Web 运行与自动配置排障

### Q17. 为什么能直接 `java -jar`，内嵌 Tomcat 在哪里启动？ {#boot-q17}

**标准回答：** 可执行包由 Boot Loader 处理应用类与嵌套依赖，常见布局为 `BOOT-INF/classes` 和 `BOOT-INF/lib`。Servlet Web 上下文通过 WebServerFactory 集成嵌入式服务器的创建、启动与关闭；入口仍是应用 main 方法。

**追问与边界：** 并非任何普通 jar 都能同样运行，也不是 Boot 自己实现了 HTTP 协议栈。WAR 外置容器部署、非 Web 应用和响应式应用有不同入口与运行边界。

依据：[可执行包的嵌套 JAR 布局][S21]。

### Q18. 同时引入 MVC 和 WebFlux 后会跑哪种模式？ {#boot-q18}

**标准回答：** 在 Boot 3.5 的常规类路径推断下，MVC 存在时优先 Servlet 模式；仅有 WebFlux 时采用响应式模式。只为使用 WebClient 引入响应式依赖，并不必然把已有 MVC 服务变成 WebFlux。

**追问与边界：** WebFlux 不是“天然更快”。在事件循环上调用阻塞 JDBC 或阻塞第三方 SDK 会造成排队；应明确端到端模型、调度边界和下游资源，而不是仅比较框架名称。

依据：[启动、事件、可用性与虚拟线程][S2]。

### Q19. Filter、Interceptor、AOP 应该放在哪一层？ {#boot-q19}

**标准回答：** Servlet Filter 围绕 Servlet 请求处理，MVC Interceptor 围绕 Handler，Spring AOP 围绕代理方法调用。请求编码、安全过滤链、控制器上下文和业务审计属于不同层次，不能把三者混成同一条插件链。

**追问与边界：** 安全鉴权不应仅靠 MVC Interceptor，某些请求可能不经过相同 Handler 映射。优先使用成熟安全过滤链；线程上下文要在完成路径清理，异步分派还需明确是否再次执行。

依据：[MVC Interceptor 的边界][S23]。

### Q20. 自动配置不生效或加了 `@EnableWebMvc` 后行为改变，怎么查？ {#boot-q20}

**标准回答：** 依次确认依赖、扫描/导入入口、Profile、条件报告、排除项与自定义 Bean。`--debug` 和受保护的 conditions 端点用于解释命中原因；mappings 可辅助核对请求映射。不要把 `--debug` 理解为所有日志都变 DEBUG。

**追问与边界：** 在 Boot 3.5 中，仅需扩展 MVC 时通常实现 `WebMvcConfigurer` 而不加 `@EnableWebMvc`；后者意味着主动接管 MVC 配置，使 Boot 的 MVC 自动配置退让。排除某自动配置只应用于确知不需要它的场景。

依据：[Servlet 与 MVC 自动配置][S7]。

## 事务、异步与资源治理

### Q21. `@Transactional` 不生效，首先查哪些条件？ {#boot-q21}

**标准回答：** 先查对象是否被容器管理、调用是否经过代理、事务管理器和数据源是否正确，再查方法可代理性、传播行为和异常处理。默认代理模式下，同类内部直接调用事务方法不会重新经过事务拦截。

**追问与边界：** 默认回滚规则与受检异常、异常被 catch 后吞掉的情况要分开。不能说“所有非 public 方法都无效”：Spring 6 类代理对部分非 public 方法有支持，但 private/final 及接口代理仍有各自约束。

依据：[声明式事务及代理边界][S8]。

### Q22. `@Async` 能继承调用方事务吗？ {#boot-q22}

**标准回答：** 不能把基于线程绑定的本地事务自动跨线程传播。异步方法需要启用对应机制且调用经过代理；异步工作可以在自己的线程建立独立事务，但不等于与调用方共享一个事务。

**追问与边界：** 支付成功后发消息不能仅靠 `@Async` 获得可靠性：主事务尚未提交、进程崩溃或异步异常都可能破坏期望。可用 Outbox 在本地事务内记录待办，再由幂等任务投递；after-commit 事件本身不等于持久队列。

依据：[异步和调度机制][S9]。

### Q23. `@Scheduled` 在多个副本中会只执行一次吗？ {#boot-q23}

**标准回答：** 不会。普通定时任务按各自应用实例运行，不自动提供集群唯一调度。还需开启调度、选择执行器、限制运行时长，并定义任务重叠、失败补偿和停机处理。

**追问与边界：** 全局只执行一次需外部调度或带租约/隔离机制的协调，但业务仍要幂等。锁超时后旧任务可能继续执行，不能把“拿到分布式锁”直接等同于 exactly-once。

依据：[异步和调度机制][S9]。

### Q24. Tomcat 线程、业务执行器和数据库连接池怎样一起设计？ {#boot-q24}

**标准回答：** 它们是不同资源边界。请求入口、异步任务和 JDBC 访问各需容量限制；业务线程数变大，并不会让数据库拥有更多处理能力。建议通过到达率、耗时分布、资源利用率、队列等待与拒绝率共同确定上限。

**追问与边界：** 共享执行器可能让慢 LLM 调用拖住支付回调。隔离执行器或使用独立并发配额，同时预算全部副本的连接总数。连接排队与实际查询应分别分配等待预算，不能只限制最外层线程数。

依据：[Boot 执行器与调度配置][S10]。

## Actuator、健康检查与发布

### Q25. Actuator 有哪些必知端点，怎样避免暴露敏感信息？ {#boot-q25}

**标准回答：** health 看健康，metrics 看指标，conditions 看条件报告，beans/mappings 辅助诊断，env/configprops 涉及配置，startup 需先采集启动步骤。Boot 3.5 默认仅暴露 health；可访问性还取决于端点访问设置、暴露规则和安全策略。

**追问与边界：** 不要为排障长期开放全部端点。采用最小暴露、认证授权、网络隔离与脱敏；自定义 `SecurityFilterChain` 后要自己覆盖管理端点规则，不能假设默认安全配置仍完整兜底。

依据：[Actuator、安全与探针][S11]。

### Q26. liveness、readiness、startup probe 分别判断什么？ {#boot-q26}

**标准回答：** liveness 表达进程是否处于需要重启才能恢复的异常状态；readiness 表达是否适合接收流量；startup probe 给启动过程单独的容忍窗口。不要把共享数据库短暂不可达直接纳入 liveness，触发所有副本反复重启。

**追问与边界：** Boot 不会默认把所有外部依赖加入 readiness。是否加入要看业务能否降级；管理端口成功也未必说明业务端口健康，可将探针组映射到主端口并进行真实入口验证。

依据：[Actuator、安全与探针][S11]。

### Q27. 优雅停机如何避免发布时丢请求？ {#boot-q27}

**标准回答：** 需要同时协调摘流量、传播延迟、Web 请求排空、后台任务/消费者停止和容器终止预算。Boot 3.5 的嵌入式服务器默认启用优雅停机；`spring.lifecycle.timeout-per-shutdown-phase` 是每个关闭阶段的等待上限，不是全进程总上限。

**追问与边界：** 仅写 `server.shutdown=graceful` 不保证零损。平台终止预算须覆盖 preStop、排空和其他阶段；SIGKILL 无法触发正常清理。Kafka offset、内存队列与外部副作用仍要独立保证可恢复。

依据：[优雅停机][S12]。

### Q28. 超时、重试和幂等怎样配合，而不是层层放大故障？ {#boot-q28}

**标准回答：** 以端到端截止时间分配连接、获取连接、响应与业务预算，区分可重试和不可重试错误。重试需限次、退避、抖动和总预算；多层各自重试会放大调用量，宜由能识别语义的一层统一治理。

**追问与边界：** 这是基于资源预算的设计建议，不是 Boot 自动提供的业务保证。支付超时意味着结果未知而非一定失败；先用业务幂等键查询或对账，不能无条件重放扣款。

本题为设计推演；结合 [业务状态与 UNKNOWN](/finance-payment-ddd/06-state-machine-unknown.md) 复习。

### Q29. 日志、Metrics、Tracing 怎么分工？ {#boot-q29}

**标准回答：** 日志记录可检索事件与错误细节；Metrics 聚合成功率、延迟与资源饱和度；Tracing 连接一次请求的跨服务耗时。Boot 可集成 Micrometer，但仍需配置注册表/导出器、采样、客户端及异步上下文传播。

**追问与边界：** 订单号、用户 ID 不宜直接做高基数指标标签，可放入受控日志或 trace。看到 traceId 不代表链路完整；用框架配置的客户端构建器，并验证线程切换后的传播和脱敏。

依据：[Micrometer 指标][S14]、[Tracing 与传播][S15]。

### Q30. 启动慢是否打开懒加载就好了？ {#boot-q30}

**标准回答：** 先按配置加载、扫描、Bean 初始化、连接/迁移、Runner 和预热分段定位，再用 ApplicationStartup、JFR 或线程转储找阻塞。懒加载只是延迟部分初始化，可能把成本与配置错误推到首个请求。

**追问与边界：** 指标应同时看启动时长、首请求延迟、就绪判断和稳定态内存，不只看日志中 Started 的耗时。对关键依赖保留启动校验；不要用懒加载掩盖无超时网络初始化。

依据：[启动、事件、可用性与虚拟线程][S2]。

## 测试、依赖与版本演进

### Q31. `@SpringBootTest` 与切片测试怎么选？ {#boot-q31}

**标准回答：** 纯业务逻辑优先单元测试；`@WebMvcTest` 聚焦 MVC 边界，`@DataJpaTest` 聚焦 JPA，`@SpringBootTest` 加载更完整上下文。`RANDOM_PORT` 启真实服务器，MOCK 模式并不等于真实网络链路。

**追问与边界：** 切片不应意外扫描全应用；外部依赖要明确 mock 或真实集成环境。H2 不能自动证明 MySQL 特有 SQL、锁和隔离行为正确，关键用例应针对真实目标类型验证。

依据：[Boot 应用测试][S13]。

### Q32. 测试加 `@Transactional` 后，HTTP 请求写的数据一定回滚吗？ {#boot-q32}

**标准回答：** 不一定。使用 `@SpringBootTest(webEnvironment=RANDOM_PORT)` 等真实服务器时，测试线程与服务端处理线程分离，通常不共享测试事务；服务端已提交的数据不会被测试线程的回滚自动撤销。

**追问与边界：** 用隔离数据库、清理脚本或可重复的测试数据策略控制污染。MockMvc 同线程调用、真实 HTTP 调用、异步任务要分别推理；不要因为测试类上有注解就省略数据清理。

依据：[Boot 应用测试][S13]。

### Q33. Starter 怎样测试条件装配及用户自定义覆盖？ {#boot-q33}

**标准回答：** 使用 `ApplicationContextRunner` 加载指定自动配置，分别检查启用/禁用属性、用户 Bean 退让、缺失类路径（可用 FilteredClassLoader）、非法配置和资源释放。测试断言应验证实际 Bean 与失败原因，而不只看启动是否成功。

**追问与边界：** 直接在测试中导入配置类，不能证明打包后的 imports 文件可被 Boot 发现。再增加使用真实 starter 依赖的最小消费者启动测试，覆盖资源打包和候选发现。

依据：[自定义自动配置与条件测试][S3]。

### Q34. 加一个依赖后出现 401、启动失败或 Bean 冲突，如何定位？ {#boot-q34}

**标准回答：** 先比较依赖树与最终 classpath，再看自动配置条件报告、Bean 定义来源、异常根因和环境差异。新依赖可能触发先前不匹配的配置；401 还需检查是否新增安全过滤链及其匹配范围。

**追问与边界：** 不要先关认证、允许所有 Bean 覆盖或随意排除数据源来消除报错。确认行为变化是预期还是误引依赖，然后最小化修复，并补充对应集成回归。

依据：[构建与依赖管理][S4]。

### Q35. 从 Boot 2.x 升到 3.x，必须知道哪些变化？ {#boot-q35}

**标准回答：** 迁移主线包括 Java 17 基线、Spring Framework 6、Jakarta EE 相关 API 从 javax 迁到 jakarta、自动配置注册方式以及安全/持久层生态兼容。建议先在 2.7 支线清理废弃用法，再逐项升级验证。

**追问与边界：** 不是把所有 `javax.*` 无差别替换：JDK 中仍有相应包。还应验证 JSON、日期、URL 尾斜杠、校验、监控与数据库行为；编译通过和启动成功不是迁移验收终点。

依据：[Boot 3.0 迁移指南][S16]。

### Q36. 从 Boot 3.5 升到 4.0，为什么不能只改版本号？ {#boot-q36}

**标准回答：** 4.0 涉及 Spring Framework 7、Jakarta EE 11/Servlet 6.1、模块和包结构调整、测试 starter 与 Jackson 3 迁移。Java 最低要求仍为 17，不应误说最低必须 21；`starter-web` 到 `starter-webmvc` 等命名迁移需按指南核对。

**追问与边界：** 先整理 3.5 废弃 API、第三方 starter/Spring Cloud 兼容性，再做配置与协议契约回归。自研 starter 应分别验证 3.x 和 4.x，不把同一产物默认视为双版本兼容。

依据：[Boot 4.0 迁移指南][S17]。

### Q37. AOT 和 GraalVM Native Image 解决什么，又限制什么？ {#boot-q37}

**标准回答：** AOT 将部分容器处理前移；Native Image 在封闭世界假设下生成本机程序，常用于降低冷启动和基础内存开销。反射、动态代理、资源访问等需提供或验证相关 hints；这不是将普通 jar 改一个启动命令。

**追问与边界：** 运行期仍可有配置值，但影响 Bean 图的 Profile/条件不能任意假设都能在运行时改变。还要比较构建耗时、峰值吞吐、诊断能力及动态特性兼容性，不能保证所有工作负载都更快。

依据：[GraalVM Native Image][S18]。

### Q38. Spring Boot 开启虚拟线程后还需要限流吗？ {#boot-q38}

**标准回答：** 需要。Java 21+ 可使用虚拟线程，Boot 支持通过 `spring.threads.virtual.enabled=true` 启用相应自动配置。它减少阻塞等待占用平台线程的成本，不增加 CPU、数据库连接或外部模型服务配额。

**追问与边界：** 仍需按租户/下游限制在途任务，处理超时取消并控制 ThreadLocal 大对象。自定义执行器不会自动全部变成虚拟线程；钉住问题按实际 JDK 验证。纯后台应用还需评估 `spring.main.keep-alive`。

依据：[JEP 444 虚拟线程][S19]、[Boot 虚拟线程配置][S2]、[执行器配置][S10]。

## P7/P8 项目场景题

### Q39. 支付回调服务滚动发布，如何设计不重复发货且可恢复？ {#boot-q39}

**标准回答：** 参考设计：摘流量并等待入口传播；排空在途请求；以持久化状态机和唯一业务键记录回调与发货意图；外部通知用 Outbox 重试和下游幂等。若已提交但响应丢失，重试应读取既有结果，而非再次发货。

**追问与边界：** 这是设计练习，不是对个人项目已实现效果的断言。优雅停机仅改善窗口；强杀、网络分区、跨区同步延迟仍需用故障注入验证。回答必须说出幂等键、事务边界和恢复依据。

依据：[Kubernetes Pod 终止生命周期][S22]。

### Q40. SOC Agent 的 ES 或模型服务故障，应用应该重启吗？ {#boot-q40}

**标准回答：** 参考设计：先区分进程损坏与下游故障，后者不直接拉低 liveness。按接口能力决定 readiness 或局部降级；LLM/ES 使用独立配额、超时、重试预算与隔离，关键告警进入持久队列并保留可重放状态。

**追问与边界：** 不能让共享下游故障触发全部副本重启，也不能为了健康检查绿灯继续无限接单。说明在途上限、积压告警、DLQ、重放幂等及人工兜底；查询失败和写入未知状态分别处理。

依据：[Actuator、安全与探针][S11]。

## 配置片段与手推验证

### 配置覆盖手推

假设只有以下四个相关来源：YAML 中 `server.port=8080`、环境变量 `SERVER_PORT=8081`、JVM 参数 `-Dserver.port=8082`、应用参数 `--server.port=8083`。常规命令行属性处理未被关闭时，最终端口应为 8083；删除最高优先级项后逐级回退。接入其他 PropertySource 后，应重新确认实际来源，而非只背这个例子。[配置规则][S5]

```bash
# 本地示例，不含生产凭证。-D 必须放在 -jar 之前。
SERVER_PORT=8081 java -Dserver.port=8082 -jar app.jar --server.port=8083
# 自动配置诊断，不代表开启所有组件的 DEBUG 日志。
java -jar app.jar --debug
```

### Boot 3.5 探针与停机配置示例

以下仅展示配置关系；20s 是示例值，必须按真实请求时长、任务阶段与平台预算调整。访问路径还须和应用上下文路径、安全过滤链、代理规则对齐。不要仅凭 YAML 就宣称具备零损发布能力。[探针][S11]、[停机][S12]、[平台终止][S22]

```yaml
server:
  shutdown: graceful
spring:
  lifecycle:
    timeout-per-shutdown-phase: 20s
management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      show-details: never
      probes:
        enabled: true
        add-additional-paths: true
```

未另设管理端口且使用默认路径时，探针组位于 `/actuator/health/liveness` 和 `/actuator/health/readiness`；额外主端口路径为 `/livez` 和 `/readyz`。示例不把 DB 或 ES 无差别塞进 liveness，也没有配置全部管理端点公开暴露。Kubernetes 的 `terminationGracePeriodSeconds` 需要覆盖终止全过程，不能直接视为与 20s 同义。

### 自定义自动配置设计原则

```text
acme-client-spring-boot-starter
  -> SDK 与 autoconfigure 依赖入口
acme-client-spring-boot-autoconfigure
  -> @AutoConfiguration 配置类
  -> @ConfigurationProperties + 校验
  -> 条件、开关及用户 Bean 退让
  -> META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
  -> 属性元数据、关闭资源策略
  -> ApplicationContextRunner 条件测试
  -> 使用打包依赖的最小消费者启动测试
```

用“默认创建、开关关闭、用户覆盖、依赖缺失、错误配置”五种输入手推预期 Bean 集合。配置顺序、资源发现、实例化顺序分别验证；不要在单个成功用例上推断兼容所有应用。[官方自动配置测试说明][S3]

## 面试中应主动纠正的说法

| 容易答错 | 更准确的说法 |
| --- | --- |
| Boot 就是自动扫描整个 classpath | 组件扫描、候选发现与条件注册是不同机制 |
| 3.x 已没有 spring.factories | 改的是自动配置注册键；其他扩展点不能一概而论 |
| 写了 @Primary 就覆盖默认 Bean | 注入优先级、条件退让、同名覆盖三者不同 |
| 配置中心一改，所有对象立即同步更新 | 需区分环境值、已创建对象、刷新机制及跨实例一致性 |
| @Async 会沿用外层事务 | 默认线程绑定事务不自动跨线程传播 |
| DB 不可用就应该重启所有应用 | 先区分 liveness、readiness 和可降级能力 |
| 开启 graceful 就绝不会丢请求 | 还需摘流量、终止预算、持久化和重放幂等 |
| 测试标注事务，真实 HTTP 数据一定回滚 | 服务端事务可能与测试事务完全分离 |
| Boot 4.0 最低要求 Java 21 | 4.0 的 Java 基线是 17，其他组件要求另行核对 |
| 虚拟线程越多就能吞吐越高 | 最终仍受 CPU、连接、配额、内存和队列预算约束 |

本表对应上文相应问题及引用；不作为脱离版本和场景的口诀。

## 与现有模块一起复习

[Bean 生命周期](./03-bean-lifecycle-extension-points.md)、[循环依赖](./04-dependency-injection-circular-reference.md)、[AOP 代理](./05-aop-proxy-interceptor.md)、[事务原理](./06-transaction-principles.md)、[MVC 链路](./07-spring-mvc-request-flow.md)、[事件与异步](./09-annotations-events-cache-async.md)、[生产排障](./12-production-troubleshooting.md)。

支付可靠投递结合 [Outbox 与 Inbox](/finance-payment-ddd/08-events-outbox-inbox.md)；Agent 故障隔离结合 [可靠性与成本](/ai-agent/09-production-reliability-cost.md)；虚拟线程结合 [生产实践](/java/virtual-threads-production-patterns.md)。这些是知识关联，不是新增个人项目事实。

## 官方来源与验证边界

本次按下列官方材料核对机制与版本差异。HTTP 客户端与异步 trace 传播补充见 [Tracing][S15]。升级时应再核对目标维护版本及第三方依赖；本次仓库测试覆盖文档结构、问答完整性、链接及站点构建，不替代实际服务的启动、压测和故障注入。

[S1]: https://docs.spring.io/spring-boot/3.5/reference/using/using-the-springbootapplication-annotation.html
[S2]: https://docs.spring.io/spring-boot/3.5/reference/features/spring-application.html
[S3]: https://docs.spring.io/spring-boot/3.5/reference/features/developing-auto-configuration.html
[S4]: https://docs.spring.io/spring-boot/3.5/reference/using/build-systems.html
[S5]: https://docs.spring.io/spring-boot/3.5/reference/features/external-config.html
[S6]: https://docs.spring.io/spring-boot/3.5/reference/features/profiles.html
[S7]: https://docs.spring.io/spring-boot/3.5/reference/web/servlet.html
[S8]: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
[S9]: https://docs.spring.io/spring-framework/reference/integration/scheduling.html
[S10]: https://docs.spring.io/spring-boot/3.5/reference/features/task-execution-and-scheduling.html
[S11]: https://docs.spring.io/spring-boot/3.5/reference/actuator/endpoints.html
[S12]: https://docs.spring.io/spring-boot/3.5/reference/web/graceful-shutdown.html
[S13]: https://docs.spring.io/spring-boot/3.5/reference/testing/spring-boot-applications.html
[S14]: https://docs.spring.io/spring-boot/3.5/reference/actuator/metrics.html
[S15]: https://docs.spring.io/spring-boot/3.5/reference/actuator/tracing.html
[S16]: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide
[S17]: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide
[S18]: https://docs.spring.io/spring-boot/3.5/reference/packaging/native-image/introducing-graalvm-native-images.html
[S19]: https://openjdk.org/jeps/444
[S20]: https://docs.spring.io/spring-cloud-commons/reference/spring-cloud-commons/application-context-services.html
[S21]: https://docs.spring.io/spring-boot/3.5/specification/executable-jar/nested-jars.html
[S22]: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
[S23]: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-config/interceptors.html

- [SpringBootApplication 注解][S1]
- [启动、事件、可用性与虚拟线程][S2]
- [自定义自动配置与条件测试][S3]
- [构建与依赖管理][S4]
- [外部配置与类型绑定][S5]
- [Profile][S6]
- [Servlet 与 MVC 自动配置][S7]
- [声明式事务及代理边界][S8]
- [异步和调度机制][S9]
- [Boot 执行器与调度配置][S10]
- [Actuator、安全与探针][S11]
- [优雅停机][S12]
- [Boot 应用测试][S13]
- [Micrometer 指标][S14]
- [Tracing 与传播][S15]
- [Boot 3.0 迁移指南][S16]
- [Boot 4.0 迁移指南][S17]
- [GraalVM Native Image][S18]
- [JEP 444 虚拟线程][S19]
- [Spring Cloud 刷新边界][S20]
- [可执行包的嵌套 JAR 布局][S21]
- [Kubernetes Pod 终止生命周期][S22]
- [MVC Interceptor 的边界][S23]
