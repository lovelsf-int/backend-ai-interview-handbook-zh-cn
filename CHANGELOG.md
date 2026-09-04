# 变更日志

## 2026-09-04

- 新增独立 Spring P7/P8 核心面试模块，覆盖架构、IoC、Bean 生命周期、循环依赖、AOP、事务、MVC、Boot、事件缓存异步、线程安全、源码与生产排障。
- 新增 Spring 100 道速记题库，并为每章配置顶部导航、专题侧栏、首页、学习路线和 Java 专题入口。
- 保留旧 Spring 事务治理页面作为兼容入口，canonical 内容迁移到独立事务章节。
- 增加 Spring 模块验收测试，验证完整页面集合、导航可达性、兼容链接和题库数量。
- 修复 Spring 专题仅存在于功能分支、未触发主分支 Pages 发布而导致的 `/spring/` 404，并校准专题首页与百题题库验收规则。
- 补充 Bean 创建专项：区分注册入口与底层实例化方式，覆盖组件扫描、`@Bean`、`@Import`、FactoryBean、Registry、Supplier、工厂方法和源码分支。

## 2026-09-03

- 审计 2019 Java 并发面试 PDF，修正同步方法字节码、偏向锁、AQS/Condition、线程池与 JMM/ThreadLocal 旧口径，并补齐并发集合和阻塞队列选型。
- 新增锁与同步器、线程池生产治理、JMM 与上下文传播三篇 P8 专题，并与既有虚拟线程内容去重互链。
- 所有版本敏感结论以 JLS、JVMS、OpenJDK JEP 与 Java SE 25 官方 API 为基线。

## 2026-09-02

- 新增 MySQL、Redis、Kafka 与 Elasticsearch 事务边界对比，校准回滚、原子可见性、乐观并发和批量部分失败语义。
- 新增 Elasticsearch SOC Event/Alert 分层、800～900 万业务记录与 150GB Primary 容量推导，以及五轮生产压力面。
- 新增 JDK 21–25 虚拟线程版本演进、生产架构模式、JFR/MXBean 观测、压测、灰度与回滚专题。
- 从 v5.4 合并跨支付、Agent、RAG 的设计模式场景和 P8 项目压力面，重复题库改为 canonical 链接。
- 发布日本—台湾双 Region 订单系统架构图，明确分片级单写、Route Control Plane、epoch/fencing 与接管/回切顺序。
- 审计 `mysql_07_08_000230.doc`，按 MySQL 8.4 修正 MVCC、锁、索引、执行计划、分页、Join 和复制旧口径，拆分三篇 P8 深入页。
- 所有新增机制引用 OpenJDK、Oracle、Elastic 或 MySQL 官方资料；候选人项目数字保留事实核验边界。

## 2026-09-01

- 建立 VitePress 站点、中文搜索和自定义主题。
- 增加内容质量测试、Front Matter 校验和内部链接检查。
- 将 12 份源资料迁移为 AI Agent、Kafka、Redis、Elasticsearch、金融支付与 DDD、Java、JVM、MySQL 和系统设计专题。
- 增加源附件与 Pandoc `media/` 图片引用拦截，避免提交二进制源材料和失效图片链接。
- 增加完整导航、专题侧边栏和 GitHub Pages 自动部署工作流。
