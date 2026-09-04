import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const config = readFileSync('docs/.vitepress/config.mts', 'utf8')

const sidebarCategories = {
  javaSidebar: [
    ['Java 基础与版本', false],
    ['并发基础', false],
    ['虚拟线程', false],
    ['设计模式与框架', true]
  ],
  jvmSidebar: [
    ['内存、GC 与诊断', false],
    ['生产故障与排障', false],
    ['关联专题', true]
  ],
  springSidebar: [
    ['核心容器与 Bean', false],
    ['AOP、事务与 Web', false],
    ['Boot 与应用能力', false],
    ['源码与生产排障', false],
    ['分类题库', true]
  ],
  mysqlSidebar: [
    ['事务与存储', false],
    ['索引与查询', false],
    ['锁与故障排查', false]
  ],
  kafkaSidebar: [
    ['核心原理', false],
    ['生产可靠性', false],
    ['治理与故障排查', false],
    ['题库与历史资料', true]
  ],
  redisSidebar: [
    ['核心机制', false],
    ['缓存一致性', false],
    ['高可用与集群', false],
    ['事务与分布式', false],
    ['生产排障与题库', true]
  ],
  elasticsearchSidebar: [
    ['核心原理与答题框架', false],
    ['写入、查询与建模', false],
    ['分片、容量与调优', false],
    ['治理、恢复与命令', false],
    ['案例、题库与复盘', true]
  ],
  aiAgentSidebar: [
    ['基础与编排', false],
    ['RAG、记忆与多智能体', false],
    ['生产可靠性与治理', false],
    ['系统设计与题库', true]
  ],
  paymentSidebar: [
    ['DDD 与设计基础', false],
    ['一致性、状态机与账务', false],
    ['安全、容量与实现', false],
    ['系统设计与题库', true],
    ['DDD 支付订阅案例', true]
  ],
  systemDesignSidebar: [
    ['存储与一致性', false],
    ['AI 与工程化', false],
    ['全球化与支付', false],
    ['行业项目案例', true],
    ['面试训练', true]
  ]
}

const sidebarBindings = {
  '/java/': 'javaSidebar',
  '/jvm/': 'jvmSidebar',
  '/spring/': 'springSidebar',
  '/mysql/': 'mysqlSidebar',
  '/kafka/': 'kafkaSidebar',
  '/redis/': 'redisSidebar',
  '/elasticsearch/': 'elasticsearchSidebar',
  '/ai-agent/': 'aiAgentSidebar',
  '/finance-payment-ddd/': 'paymentSidebar',
  '/system-design/': 'systemDesignSidebar'
}

const expectedRoutes = [
  '/java/jdk-version-evolution.md',
  '/java/concurrency-virtual-threads.md',
  '/java/concurrency-locks-aqs-cas.md',
  '/java/thread-pool-production-guide.md',
  '/java/jmm-volatile-threadlocal.md',
  '/java/io-nio-netty-interview-guide.md',
  '/java/virtual-threads-jdk21-25.md',
  '/java/virtual-threads-production-patterns.md',
  '/java/virtual-threads-observability-migration.md',
  '/java/design-patterns-production-scenarios.md',
  '/java/spring-transactions-service-governance.md',
  '/jvm/diagnostics-gc.md',
  '/jvm/production-incident-troubleshooting.md',
  '/spring/01-core-architecture.md',
  '/spring/02-ioc-di-container.md',
  '/spring/03-bean-lifecycle-extension-points.md',
  '/spring/04-dependency-injection-circular-reference.md',
  '/spring/05-aop-proxy-interceptor.md',
  '/spring/06-transaction-principles.md',
  '/spring/07-spring-mvc-request-flow.md',
  '/spring/08-spring-boot-startup-auto-configuration.md',
  '/spring/09-annotations-events-cache-async.md',
  '/spring/10-scope-thread-safety.md',
  '/spring/11-source-code-flows.md',
  '/spring/12-production-troubleshooting.md',
  '/spring/13-interview-question-bank.md',
  '/mysql/transactions-locks-indexes.md',
  '/mysql/innodb-write-mvcc-transactions.md',
  '/mysql/index-explain-pagination-replication.md',
  '/mysql/locks-deadlocks-production-runbook.md',
  '/kafka/01-core-model-and-kraft.md',
  '/kafka/02-log-storage-and-performance.md',
  '/kafka/03-producer-reliability-ordering.md',
  '/kafka/04-consumer-offset-rebalance.md',
  '/kafka/05-replication-failure-recovery.md',
  '/kafka/06-delivery-semantics-exactly-once.md',
  '/kafka/07-retry-dlq-business-consistency.md',
  '/kafka/08-production-governance-capacity.md',
  '/kafka/09-troubleshooting-runbook.md',
  '/kafka/10-interview-follow-ups.md',
  '/kafka/appendix-kafka-3x-legacy.md',
  '/redis/01-thread-model-event-loop.md',
  '/redis/02-data-structures-version-differences.md',
  '/redis/03-expiration-eviction.md',
  '/redis/04-rdb-aof-recovery.md',
  '/redis/05-cache-consistency.md',
  '/redis/06-penetration-breakdown-avalanche.md',
  '/redis/07-replication-sentinel.md',
  '/redis/08-cluster.md',
  '/redis/09-transactions-lua-functions.md',
  '/redis/10-redisson-fencing-token.md',
  '/redis/11-bigkey-hotkey-incidents.md',
  '/redis/12-interview-troubleshooting.md',
  '/elasticsearch/01-learning-interview-framework.md',
  '/elasticsearch/02-architecture-core-concepts.md',
  '/elasticsearch/03-lucene-index-internals.md',
  '/elasticsearch/04-write-path.md',
  '/elasticsearch/05-search-path.md',
  '/elasticsearch/06-mapping-analyzers.md',
  '/elasticsearch/07-shards-routing-capacity.md',
  '/elasticsearch/08-dsl-pagination-aggregation.md',
  '/elasticsearch/09-jvm-os-tuning.md',
  '/elasticsearch/10-production-runbook.md',
  '/elasticsearch/11-enterprise-cases.md',
  '/elasticsearch/12-reindex-consistency.md',
  '/elasticsearch/13-security-backup-upgrade.md',
  '/elasticsearch/14-interview-question-bank.md',
  '/elasticsearch/14-mock-interview-review-2026-09-04.md',
  '/elasticsearch/15-command-templates.md',
  '/elasticsearch/16-references.md',
  '/elasticsearch/17-soc-event-alert-capacity.md',
  '/elasticsearch/18-soc-pressure-interview.md',
  '/ai-agent/01-llm-agent-basics.md',
  '/ai-agent/02-architecture-orchestration.md',
  '/ai-agent/03-prompt-context-engineering.md',
  '/ai-agent/04-tools-mcp-a2a.md',
  '/ai-agent/05-rag-knowledge-engineering.md',
  '/ai-agent/06-planning-execution-recovery.md',
  '/ai-agent/07-memory-session-personalization.md',
  '/ai-agent/08-multi-agent.md',
  '/ai-agent/09-production-reliability-cost.md',
  '/ai-agent/10-evaluation-observability.md',
  '/ai-agent/11-security-guardrails-governance.md',
  '/ai-agent/12-system-design-project-deep-dive.md',
  '/ai-agent/appendix-scenario-question-bank.md',
  '/finance-payment-ddd/01-domain-foundations.md',
  '/finance-payment-ddd/02-solid.md',
  '/finance-payment-ddd/03-design-patterns.md',
  '/finance-payment-ddd/04-domain-modeling.md',
  '/finance-payment-ddd/05-idempotency-consistency.md',
  '/finance-payment-ddd/06-state-machine-unknown.md',
  '/finance-payment-ddd/07-ledger-reconciliation.md',
  '/finance-payment-ddd/08-events-outbox-inbox.md',
  '/finance-payment-ddd/09-risk-security-compliance.md',
  '/finance-payment-ddd/10-capacity-reliability.md',
  '/finance-payment-ddd/11-java-implementation.md',
  '/finance-payment-ddd/12-system-design-cases.md',
  '/finance-payment-ddd/13-interview-question-bank.md',
  '/finance-payment-ddd/subscription-case/01-bounded-contexts.md',
  '/finance-payment-ddd/subscription-case/02-aggregates-consistency.md',
  '/finance-payment-ddd/subscription-case/03-payment-channel-acl.md',
  '/finance-payment-ddd/subscription-case/04-payment-state-machine.md',
  '/finance-payment-ddd/subscription-case/05-outbox-inbox.md',
  '/finance-payment-ddd/subscription-case/06-data-model.md',
  '/finance-payment-ddd/subscription-case/07-renewal-scheduling.md',
  '/finance-payment-ddd/subscription-case/08-evolution-roadmap.md',
  '/finance-payment-ddd/subscription-case/09-interview-follow-ups.md',
  '/system-design/storage-transaction-comparison.md',
  '/system-design/soc-agent.md',
  '/system-design/spec-driven-ai-coding.md',
  '/system-design/global-subscription.md',
  '/system-design/overseas-payment.md',
  '/system-design/transport-safety.md',
  '/system-design/interview-strategy.md',
  '/system-design/pressure-interview-playbook.md'
]

const indexCategories = {
  'docs/java/index.md': [
    'Java 基础与版本',
    '并发基础',
    '虚拟线程',
    '设计模式与框架'
  ],
  'docs/jvm/index.md': ['内存、GC 与诊断', '生产故障与排障', '关联专题'],
  'docs/spring/index.md': [
    '核心容器与 Bean',
    'AOP、事务与 Web',
    'Boot 与应用能力',
    '源码与生产排障',
    '分类题库'
  ],
  'docs/mysql/index.md': ['事务与存储', '索引与查询', '锁与故障排查'],
  'docs/kafka/index.md': ['核心原理', '生产可靠性', '治理与故障排查', '题库与历史资料'],
  'docs/redis/index.md': ['核心机制', '缓存一致性', '高可用与集群', '事务与分布式', '生产排障与题库'],
  'docs/elasticsearch/index.md': [
    '核心原理与答题框架',
    '写入、查询与建模',
    '分片、容量与调优',
    '治理、恢复与命令',
    '案例、题库与复盘'
  ],
  'docs/ai-agent/index.md': ['基础与编排', 'RAG、记忆与多智能体', '生产可靠性与治理', '系统设计与题库'],
  'docs/finance-payment-ddd/index.md': [
    'DDD 与设计基础',
    '一致性、状态机与账务',
    '安全、容量与实现',
    '系统设计与题库',
    'DDD 支付订阅案例'
  ],
  'docs/system-design/index.md': ['存储与一致性', 'AI 与工程化', '全球化与支付', '行业项目案例', '面试训练']
}

test('every interview module uses second-level sidebar categories', () => {
  for (const [sidebar, categories] of Object.entries(sidebarCategories)) {
    assert.match(config, new RegExp(`const\\s+${sidebar}\\s*=\\s*\\[`))

    for (const [label, collapsed] of categories) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      assert.match(
        config,
        new RegExp(`text:\\s*['"]${escaped}['"][\\s\\S]{0,100}collapsed:\\s*${collapsed}`),
        `${sidebar} is missing category ${label} with collapsed=${collapsed}`
      )
    }
  }

  for (const [route, sidebar] of Object.entries(sidebarBindings)) {
    const escapedRoute = route.replaceAll('/', '\\/')
    assert.match(config, new RegExp(`['"]${escapedRoute}['"]:\\s*${sidebar}`))
  }
})

test('categorized sidebars keep every existing interview page reachable', () => {
  for (const route of expectedRoutes) {
    assert.equal(config.includes(route), true, `missing sidebar route: ${route}`)
  }
})

test('module landing pages mirror the sidebar categories', () => {
  for (const [path, categories] of Object.entries(indexCategories)) {
    const content = readFileSync(path, 'utf8')
    for (const category of categories) {
      const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      assert.match(content, new RegExp(`^##\\s+${escaped}$`, 'm'), `${path} is missing ${category}`)
    }
  }
})
