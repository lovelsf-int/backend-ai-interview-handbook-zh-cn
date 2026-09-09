import aiStudyImages from './ai-study-images.mjs'
import { aiStudySidebar } from './ai-study-sidebar.mts'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const aiCodingSidebar = [
  { text: 'AI Coding 学习路线', link: '/ai-coding/' },
  { text: '基础与工作流', collapsed: false, items: [
    { text: '工具选型与开发闭环', link: '/ai-coding/tools-workflow.md' },
    { text: 'Prompt、上下文与仓库规则', link: '/ai-coding/context-spec.md' },
    { text: 'Skills、MCP、Hooks 与多 Agent', link: '/ai-coding/skills-mcp-agents.md' }
  ] },
  { text: '工程实战与面试', collapsed: false, items: [
    { text: 'Java 后端 AI 编程实战', link: '/ai-coding/java-backend-practice.md' },
    { text: '质量、安全与团队效能', link: '/ai-coding/quality-governance.md' },
    { text: 'P7/P8 面试题与追问', link: '/ai-coding/interview.md' },
    { text: 'Spec-driven 项目深挖', link: '/system-design/spec-driven-ai-coding.md' }
  ] }
]

const aiAgentSidebar = [
  { text: '系统学习与复习（32 篇）', link: '/ai-study/' },
  { text: '专题首页', link: '/ai-agent/' },
  {
    text: '基础与编排',
    collapsed: false,
    items: [
      { text: '01 LLM 与 Agent 基础', link: '/ai-agent/01-llm-agent-basics.md' },
      { text: '02 架构与编排', link: '/ai-agent/02-architecture-orchestration.md' },
      { text: '03 Prompt 与上下文', link: '/ai-agent/03-prompt-context-engineering.md' },
      { text: '04 Tools、MCP 与 A2A', link: '/ai-agent/04-tools-mcp-a2a.md' },
      { text: '06 规划、执行与恢复', link: '/ai-agent/06-planning-execution-recovery.md' }
    ]
  },
  {
    text: 'RAG、记忆与多智能体',
    collapsed: false,
    items: [
      { text: '05 RAG 与知识工程', link: '/ai-agent/05-rag-knowledge-engineering.md' },
      { text: '07 Memory 与会话', link: '/ai-agent/07-memory-session-personalization.md' },
      { text: '08 Multi-Agent', link: '/ai-agent/08-multi-agent.md' }
    ]
  },
  {
    text: '生产可靠性与治理',
    collapsed: false,
    items: [
      { text: '09 可靠性与成本', link: '/ai-agent/09-production-reliability-cost.md' },
      { text: '10 评估与可观测', link: '/ai-agent/10-evaluation-observability.md' },
      { text: '11 安全与治理', link: '/ai-agent/11-security-guardrails-governance.md' },
      { text: '14 LLM 与 Agent 安全实战', link: '/ai-agent/14-llm-agent-security-practice.md' }
    ]
  },
  {
    text: '系统设计与题库',
    collapsed: true,
    items: [
      { text: '12 系统设计与项目', link: '/ai-agent/12-system-design-project-deep-dive.md' },
      { text: '场景题库', link: '/ai-agent/appendix-scenario-question-bank.md' }
    ]
  }
]

const javaSidebar = [
  { text: 'Java 专题首页', link: '/java/' },
  {
    text: '多线程编程实战',
    collapsed: false,
    items: [
      { text: '题目与运行指南', link: '/java/thread-programming/' },
      { text: '交替打印 ABC：四种实现', link: '/java/thread-programming/alternating-abc.md' },
      { text: '交替打印奇偶数', link: '/java/thread-programming/odd-even.md' }
    ]
  },
  {
    text: 'Java 基础与版本',
    collapsed: false,
    items: [
      { text: 'JDK 8–26 版本演进', link: '/java/jdk-version-evolution.md' },
      { text: 'Object 常用方法与面试题', link: '/java/object-methods-interview.md' },
      { text: '集合、Map 与泛型', link: '/java/collections-generics-interview-guide.md' },
      { text: 'IO、NIO、Reactor 与 Netty', link: '/java/io-nio-netty-interview-guide.md' }
    ]
  },
  {
    text: '并发基础',
    collapsed: false,
    items: [
      { text: '并发与虚拟线程总览', link: '/java/concurrency-virtual-threads.md' },
      { text: '锁、CAS、AQS 与同步器', link: '/java/concurrency-locks-aqs-cas.md' },
      { text: '线程池生产实践', link: '/java/thread-pool-production-guide.md' },
      { text: 'JMM、volatile 与 ThreadLocal', link: '/java/jmm-volatile-threadlocal.md' }
    ]
  },
  {
    text: '虚拟线程',
    collapsed: false,
    items: [
      { text: 'JDK 21–25 虚拟线程', link: '/java/virtual-threads-jdk21-25.md' },
      { text: '虚拟线程生产模式', link: '/java/virtual-threads-production-patterns.md' },
      { text: '虚拟线程观测与迁移', link: '/java/virtual-threads-observability-migration.md' }
    ]
  },
  {
    text: '设计模式与框架',
    collapsed: true,
    items: [
      { text: '设计模式生产场景', link: '/java/design-patterns-production-scenarios.md' },
      { text: 'Spring 核心面试', link: '/spring/' },
      { text: 'Spring 事务与治理', link: '/java/spring-transactions-service-governance.md' }
    ]
  }
]

const jvmSidebar = [
  { text: 'JVM 专题首页', link: '/jvm/' },
  {
    text: '内存、GC 与诊断',
    collapsed: false,
    items: [
      { text: '类加载与对象生命周期', link: '/jvm/class-loading-object-lifecycle.md' },
      { text: '诊断、内存与 GC', link: '/jvm/diagnostics-gc.md' },
      { text: '垃圾回收动态演示', link: '/jvm/gc-visualizer.md' }
    ]
  },
  {
    text: '生产故障与排障',
    collapsed: false,
    items: [
      { text: '生产故障定位 Runbook', link: '/jvm/production-incident-troubleshooting.md' }
    ]
  },
  {
    text: '关联专题',
    collapsed: true,
    items: [
      { text: 'Java 并发与虚拟线程', link: '/java/concurrency-virtual-threads.md' }
    ]
  }
]

const springSidebar = [
  { text: '专题首页', link: '/spring/' },
  {
    text: '核心容器与 Bean',
    collapsed: false,
    items: [
      { text: '01 核心架构', link: '/spring/01-core-architecture.md' },
      { text: '02 IoC、DI 与容器', link: '/spring/02-ioc-di-container.md' },
      { text: '03 Bean 生命周期', link: '/spring/03-bean-lifecycle-extension-points.md' },
      { text: '04 注入与循环依赖', link: '/spring/04-dependency-injection-circular-reference.md' }
    ]
  },
  {
    text: 'AOP、事务与 Web',
    collapsed: false,
    items: [
      { text: '05 AOP 与代理', link: '/spring/05-aop-proxy-interceptor.md' },
      { text: '06 声明式事务', link: '/spring/06-transaction-principles.md' },
      { text: '07 Spring MVC', link: '/spring/07-spring-mvc-request-flow.md' }
    ]
  },
  {
    text: 'Boot 与应用能力',
    collapsed: false,
    items: [
      { text: '08 Boot 与自动配置', link: '/spring/08-spring-boot-startup-auto-configuration.md' },
      { text: '09 事件、缓存与异步', link: '/spring/09-annotations-events-cache-async.md' },
      { text: '10 作用域与线程安全', link: '/spring/10-scope-thread-safety.md' }
    ]
  },
  {
    text: '源码与生产排障',
    collapsed: false,
    items: [
      { text: '11 核心源码链路', link: '/spring/11-source-code-flows.md' },
      { text: '12 生产故障排查', link: '/spring/12-production-troubleshooting.md' }
    ]
  },
  {
    text: '分类题库',
    collapsed: true,
    items: [
      { text: '13 100 道核心面试题', link: '/spring/13-interview-question-bank.md' }
    ]
  }
]

const mysqlSidebar = [
  { text: 'MySQL 专题首页', link: '/mysql/' },
  {
    text: '事务与存储',
    collapsed: false,
    items: [
      { text: '事务、锁、索引与分片总览', link: '/mysql/transactions-locks-indexes.md' },
      { text: '写入、MVCC 与事务', link: '/mysql/innodb-write-mvcc-transactions.md' }
    ]
  },
  {
    text: '索引与查询',
    collapsed: false,
    items: [
      { text: '索引、计划、分页与复制', link: '/mysql/index-explain-pagination-replication.md' }
    ]
  },
  {
    text: '锁与故障排查',
    collapsed: false,
    items: [
      { text: '锁、死锁与排障', link: '/mysql/locks-deadlocks-production-runbook.md' }
    ]
  },
  {
    text: '性能与变更治理',
    collapsed: false,
    items: [
      { text: '性能归因与 Online DDL', link: '/mysql/performance-schema-change-governance.md' }
    ]
  }
]

const kafkaSidebar = [
  { text: '专题首页', link: '/kafka/' },
  {
    text: '核心原理',
    collapsed: false,
    items: [
      { text: '01 核心模型与 KRaft', link: '/kafka/01-core-model-and-kraft.md' },
      { text: '02 日志存储与性能', link: '/kafka/02-log-storage-and-performance.md' },
      { text: '04 Consumer 与 Rebalance', link: '/kafka/04-consumer-offset-rebalance.md' },
      { text: '05 副本与故障恢复', link: '/kafka/05-replication-failure-recovery.md' }
    ]
  },
  {
    text: '生产可靠性',
    collapsed: false,
    items: [
      { text: '03 Producer 可靠性', link: '/kafka/03-producer-reliability-ordering.md' },
      { text: '06 Exactly-Once', link: '/kafka/06-delivery-semantics-exactly-once.md' },
      { text: '07 重试与业务一致性', link: '/kafka/07-retry-dlq-business-consistency.md' }
    ]
  },
  {
    text: '治理与故障排查',
    collapsed: false,
    items: [
      { text: '08 治理与容量', link: '/kafka/08-production-governance-capacity.md' },
      { text: '09 故障排查', link: '/kafka/09-troubleshooting-runbook.md' }
    ]
  },
  {
    text: '题库与历史资料',
    collapsed: true,
    items: [
      { text: '10 面试追问', link: '/kafka/10-interview-follow-ups.md' },
      { text: 'Kafka 3.x 历史材料', link: '/kafka/appendix-kafka-3x-legacy.md' }
    ]
  }
]

const redisSidebar = [
  { text: '专题首页', link: '/redis/' },
  {
    text: '核心机制',
    collapsed: false,
    items: [
      { text: '01 线程模型', link: '/redis/01-thread-model-event-loop.md' },
      { text: '02 数据结构', link: '/redis/02-data-structures-version-differences.md' },
      { text: '03 过期与淘汰', link: '/redis/03-expiration-eviction.md' },
      { text: '04 RDB 与 AOF', link: '/redis/04-rdb-aof-recovery.md' }
    ]
  },
  {
    text: '缓存一致性',
    collapsed: false,
    items: [
      { text: '05 缓存一致性', link: '/redis/05-cache-consistency.md' },
      { text: '06 穿透、击穿与雪崩', link: '/redis/06-penetration-breakdown-avalanche.md' }
    ]
  },
  {
    text: '高可用与集群',
    collapsed: false,
    items: [
      { text: '07 复制与 Sentinel', link: '/redis/07-replication-sentinel.md' },
      { text: '08 Redis Cluster', link: '/redis/08-cluster.md' }
    ]
  },
  {
    text: '事务与分布式',
    collapsed: false,
    items: [
      { text: '09 事务、Lua 与 Functions', link: '/redis/09-transactions-lua-functions.md' },
      { text: '10 分布式锁', link: '/redis/10-redisson-fencing-token.md' }
    ]
  },
  {
    text: '生产排障与题库',
    collapsed: true,
    items: [
      { text: '11 BigKey 与 HotKey', link: '/redis/11-bigkey-hotkey-incidents.md' },
      { text: '12 面试与排障', link: '/redis/12-interview-troubleshooting.md' }
    ]
  }
]

const elasticsearchSidebar = [
  { text: '专题首页', link: '/elasticsearch/' },
  {
    text: '核心原理与答题框架',
    collapsed: false,
    items: [
      { text: '01 学习与答题框架', link: '/elasticsearch/01-learning-interview-framework.md' },
      { text: '02 架构与核心概念', link: '/elasticsearch/02-architecture-core-concepts.md' },
      { text: '03 Lucene 底层', link: '/elasticsearch/03-lucene-index-internals.md' }
    ]
  },
  {
    text: '写入、查询与建模',
    collapsed: false,
    items: [
      { text: '04 写入链路', link: '/elasticsearch/04-write-path.md' },
      { text: '05 查询链路', link: '/elasticsearch/05-search-path.md' },
      { text: '06 Mapping 与 Analyzer', link: '/elasticsearch/06-mapping-analyzers.md' },
      { text: '08 DSL、分页与聚合', link: '/elasticsearch/08-dsl-pagination-aggregation.md' }
    ]
  },
  {
    text: '分片、容量与调优',
    collapsed: false,
    items: [
      { text: '07 分片、路由与容量', link: '/elasticsearch/07-shards-routing-capacity.md' },
      { text: '09 JVM 与 OS 调优', link: '/elasticsearch/09-jvm-os-tuning.md' },
      { text: '17 SOC 事件告警容量', link: '/elasticsearch/17-soc-event-alert-capacity.md' }
    ]
  },
  {
    text: '治理、恢复与命令',
    collapsed: false,
    items: [
      { text: '10 生产故障手册', link: '/elasticsearch/10-production-runbook.md' },
      { text: '12 重建索引与一致性', link: '/elasticsearch/12-reindex-consistency.md' },
      { text: '13 安全、备份与升级', link: '/elasticsearch/13-security-backup-upgrade.md' },
      { text: '15 命令与模板', link: '/elasticsearch/15-command-templates.md' },
      { text: '16 参考资料', link: '/elasticsearch/16-references.md' }
    ]
  },
  {
    text: '案例、题库与复盘',
    collapsed: true,
    items: [
      { text: '11 企业案例', link: '/elasticsearch/11-enterprise-cases.md' },
      { text: '14 高频面试题', link: '/elasticsearch/14-interview-question-bank.md' },
      { text: '2026-09-04 正式面试复盘', link: '/elasticsearch/14-mock-interview-review-2026-09-04.md' },
      { text: '18 SOC 压力面', link: '/elasticsearch/18-soc-pressure-interview.md' }
    ]
  }
]

const paymentSidebar = [
  { text: '专题首页', link: '/finance-payment-ddd/' },
  {
    text: 'DDD 与设计基础',
    collapsed: false,
    items: [
      { text: '01 领域基础', link: '/finance-payment-ddd/01-domain-foundations.md' },
      { text: '02 SOLID', link: '/finance-payment-ddd/02-solid.md' },
      { text: '03 设计模式', link: '/finance-payment-ddd/03-design-patterns.md' },
      { text: '04 领域建模', link: '/finance-payment-ddd/04-domain-modeling.md' }
    ]
  },
  {
    text: '一致性、状态机与账务',
    collapsed: false,
    items: [
      { text: '05 幂等与一致性', link: '/finance-payment-ddd/05-idempotency-consistency.md' },
      { text: '06 状态机与 UNKNOWN', link: '/finance-payment-ddd/06-state-machine-unknown.md' },
      { text: '07 账务与对账', link: '/finance-payment-ddd/07-ledger-reconciliation.md' },
      { text: '08 Outbox 与 Inbox', link: '/finance-payment-ddd/08-events-outbox-inbox.md' }
    ]
  },
  {
    text: '安全、容量与实现',
    collapsed: false,
    items: [
      { text: '09 风险、安全与合规', link: '/finance-payment-ddd/09-risk-security-compliance.md' },
      { text: '10 容量与可靠性', link: '/finance-payment-ddd/10-capacity-reliability.md' },
      { text: '11 Java 实现', link: '/finance-payment-ddd/11-java-implementation.md' }
    ]
  },
  {
    text: '系统设计与题库',
    collapsed: true,
    items: [
      { text: '12 系统设计案例', link: '/finance-payment-ddd/12-system-design-cases.md' },
      { text: '13 面试题库', link: '/finance-payment-ddd/13-interview-question-bank.md' }
    ]
  },
  {
    text: 'DDD 支付订阅案例',
    collapsed: true,
    items: [
      { text: '01 限界上下文', link: '/finance-payment-ddd/subscription-case/01-bounded-contexts.md' },
      { text: '02 聚合与一致性', link: '/finance-payment-ddd/subscription-case/02-aggregates-consistency.md' },
      { text: '03 支付渠道 ACL', link: '/finance-payment-ddd/subscription-case/03-payment-channel-acl.md' },
      { text: '04 支付状态机', link: '/finance-payment-ddd/subscription-case/04-payment-state-machine.md' },
      { text: '05 Outbox 与 Inbox', link: '/finance-payment-ddd/subscription-case/05-outbox-inbox.md' },
      { text: '06 数据模型', link: '/finance-payment-ddd/subscription-case/06-data-model.md' },
      { text: '07 续费调度', link: '/finance-payment-ddd/subscription-case/07-renewal-scheduling.md' },
      { text: '08 演进路线', link: '/finance-payment-ddd/subscription-case/08-evolution-roadmap.md' },
      { text: '09 评审追问', link: '/finance-payment-ddd/subscription-case/09-interview-follow-ups.md' }
    ]
  }
]

const systemDesignSidebar = [
  { text: '专题首页', link: '/system-design/' },
  {
    text: '架构质量与验收',
    collapsed: false,
    items: [
      { text: '高性能、高可靠与高扩展性', link: '/system-design/project-quality-attributes.md' }
    ]
  },
  {
    text: '存储与一致性',
    collapsed: false,
    items: [
      { text: '四大存储事务机制对比', link: '/system-design/storage-transaction-comparison.md' }
    ]
  },
  {
    text: 'AI 与工程化',
    collapsed: false,
    items: [
      { text: 'SOC AI Agent', link: '/system-design/soc-agent.md' },
      { text: 'Spec-driven AI Coding', link: '/system-design/spec-driven-ai-coding.md' }
    ]
  },
  {
    text: '全球化与支付',
    collapsed: false,
    items: [
      { text: '全球订阅与跨区容灾', link: '/system-design/global-subscription.md' },
      { text: '海外游戏支付', link: '/system-design/overseas-payment.md' }
    ]
  },
  {
    text: '行业项目案例',
    collapsed: true,
    items: [
      { text: '运输安全与 CBT-I', link: '/system-design/transport-safety.md' }
    ]
  },
  {
    text: '面试训练',
    collapsed: true,
    items: [
      { text: '面试策略与评分', link: '/system-design/interview-strategy.md' },
      { text: 'P8 项目压力面', link: '/system-design/pressure-interview-playbook.md' },
      { text: 'P7/P8 架构决策实战', link: '/system-design/p7-p8-architecture-decision-workshop.md' }
    ]
  }
]

const algorithmsSidebar = [
  { text: '算法面试首页', link: '/algorithms/' },
  {
    text: '基础与线性结构',
    collapsed: false,
    items: [
      { text: '01 算法基础与 Java 模板', link: '/algorithms/01-foundations.md' },
      { text: '02 数组、哈希与窗口', link: '/algorithms/02-array-hash-window.md' },
      { text: '03 二分查找与边界', link: '/algorithms/03-binary-search.md' },
      { text: '04 链表与快慢指针', link: '/algorithms/04-linked-list.md' },
      { text: '05 栈、堆与 Top K', link: '/algorithms/05-stack-heap.md' }
    ]
  },
  {
    text: '树、图与搜索',
    collapsed: false,
    items: [
      { text: '06 二叉树、BST 与 LCA', link: '/algorithms/06-tree.md' },
      { text: '07 图、拓扑与并查集', link: '/algorithms/07-graph.md' },
      { text: '08 回溯、排列与剪枝', link: '/algorithms/08-backtracking.md' }
    ]
  },
  {
    text: '贪心、DP 与设计',
    collapsed: false,
    items: [
      { text: '09 贪心、区间与股票', link: '/algorithms/09-greedy-interval.md' },
      { text: '10 动态规划与子序列', link: '/algorithms/10-dynamic-programming.md' },
      { text: '11 零钱兑换与 dp[0]', link: '/algorithms/11-coin-change.md' },
      { text: '12 LRU 与工程追问', link: '/algorithms/12-design-lru.md' }
    ]
  },
  {
    text: '题单、训练与进阶',
    collapsed: false,
    items: [
      { text: '13 LeetCode 80 题', link: '/algorithms/13-question-bank.md' },
      { text: '14 常见追问与训练计划', link: '/algorithms/14-interview-playbook.md' },
      { text: '15 进阶算法与大数据', link: '/algorithms/15-advanced-patterns.md' }
    ]
  }
]

export default withMermaid(defineConfig({
  lang: 'zh-CN',
  title: '后端与 AI 面试手册',
  description: '面向资深 Java、AI Agent、搜索与金融支付岗位的 P7/P8 中文技术手册',
  base: '/backend-ai-interview-handbook-zh-cn/',
  lastUpdated: true,
  cleanUrls: false,
  head: [
    ['meta', { name: 'theme-color', content: '#3451b2' }],
    ['meta', { name: 'author', content: 'lovelsf-int' }]
  ],
  markdown: {
    lineNumbers: true,
    config: (md) => { md.use(aiStudyImages) }
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: '后端与 AI 面试手册',
    nav: [
      { text: '首页', link: '/' },
      { text: '学习路线', link: '/guide/learning-path.md' },
      { text: '面试冲刺', link: '/guide/interview-sprint-gap-map.md' },
      { text: '算法面试', link: '/algorithms/' },
      {
        text: '后端基础设施',
        items: [
          { text: 'Java', link: '/java/' },
          { text: 'JVM', link: '/jvm/' },
          { text: 'Spring', link: '/spring/' },
          { text: 'MySQL', link: '/mysql/' },
          { text: 'Kafka', link: '/kafka/' },
          { text: 'Redis', link: '/redis/' },
          { text: 'Elasticsearch', link: '/elasticsearch/' }
        ]
      },
      { text: 'AI Agent', link: '/ai-agent/' },
      { text: 'AI 学习', link: '/ai-study/' },
      { text: 'AI Coding', link: '/ai-coding/' },
      {
        text: '架构案例',
        items: [
          { text: '金融支付与 DDD', link: '/finance-payment-ddd/' },
          { text: '系统设计与项目深挖', link: '/system-design/' }
        ]
      },
      {
        text: 'GitHub',
        link: 'https://github.com/lovelsf-int/backend-ai-interview-handbook-zh-cn'
      }
    ],
    sidebar: {
      '/guide/': [
        { text: '使用指南', link: '/guide/' },
        { text: '学习路线', link: '/guide/learning-path.md' },
        { text: 'P7/P8 面试冲刺与缺口地图', link: '/guide/interview-sprint-gap-map.md' },
        { text: '真实面试复盘', link: '/guide/real-interview-review-2026-09-03.md' }
      ],
      '/algorithms/': algorithmsSidebar,
      '/java/': javaSidebar,
      '/jvm/': jvmSidebar,
      '/spring/': springSidebar,
      '/mysql/': mysqlSidebar,
      '/kafka/': kafkaSidebar,
      '/redis/': redisSidebar,
      '/elasticsearch/': elasticsearchSidebar,
      '/ai-study/': aiStudySidebar,
      '/ai-coding/': aiCodingSidebar,
      '/ai-agent/': aiAgentSidebar,
      '/finance-payment-ddd/': paymentSidebar,
      '/system-design/': systemDesignSidebar
    },
    outline: {
      level: [2, 4],
      label: '本页目录'
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '没有找到相关内容',
                resetButtonTitle: '清除查询',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/lovelsf-int/backend-ai-interview-handbook-zh-cn'
      }
    ],
    editLink: {
      pattern: 'https://github.com/lovelsf-int/backend-ai-interview-handbook-zh-cn/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    lastUpdated: {
      text: '最后更新'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    footer: {
      message: '基于 VitePress 与 GitHub Pages 构建',
      copyright: 'Copyright © lovelsf-int'
    }
  }
}))
