import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const approvedSources = [
  'AI_Agent工程师_P7-P8完整面试手册_2026版_追问答案完整版(1).docx',
  'AI_Agent_面试题_资深级参考答案.md',
  'Kafka核心知识点_P7P8面试强化版.docx',
  'Kafka 核心技术全解析(1).docx',
  'Kafka Exactly-Once 精确一次语义完全解析.docx',
  'redis.docx',
  'Redis P7 核心知识&面试终极手册（架构级·可直接背诵） (2).docx',
  'Elasticsearch_深度原理_生产调优_面试题完整版 (1).docx',
  'P8金融支付_SOLID设计模式_完整面试资料_Java版(2).docx',
  'DDD支付订阅系统_高清架构评审版(1).docx',
  'DDD支付订阅系统_架构设计面试版_架构图版(1).docx',
  '金余概_资深Java_AI-Agent开发_定制面试手册_v5.0_全球数据库容灾回切深挖版.docx'
]

const incrementalSources = [
  'Elasticsearch_P7_P8_完整面试手册_SOC_800到900万条_Primary150GB_事件告警分层版_v2.4.docx',
  'Java虚拟线程生产实践指南_JDK21-25.docx',
  'Elasticsearch_P7_P8_完整面试手册_SOC告警场景.docx',
  '金余概_资深Java_AI-Agent开发_定制面试手册_v5.4_全量未答题补全版.docx',
  '日本台湾双活订单系统架构图.png',
  'mysql_07_08_000230.doc'
]

const incrementalTargets = [
  'docs/elasticsearch/17-soc-event-alert-capacity.md',
  'docs/elasticsearch/18-soc-pressure-interview.md',
  'docs/java/virtual-threads-jdk21-25.md',
  'docs/java/virtual-threads-production-patterns.md',
  'docs/java/virtual-threads-observability-migration.md',
  'docs/java/design-patterns-production-scenarios.md',
  'docs/system-design/pressure-interview-playbook.md',
  'docs/mysql/innodb-write-mvcc-transactions.md',
  'docs/mysql/locks-deadlocks-production-runbook.md',
  'docs/mysql/index-explain-pagination-replication.md'
]

const incrementalAssets = [
  'docs/public/images/system-design/japan-taiwan-active-active-order.png'
]

const mysqlReviewedTargets = [
  'docs/mysql/innodb-write-mvcc-transactions.md',
  'docs/mysql/locks-deadlocks-production-runbook.md',
  'docs/mysql/index-explain-pagination-replication.md'
]

const aiAgentTargets = [
  'docs/ai-agent/index.md',
  'docs/ai-agent/01-llm-agent-basics.md',
  'docs/ai-agent/02-architecture-orchestration.md',
  'docs/ai-agent/03-prompt-context-engineering.md',
  'docs/ai-agent/04-tools-mcp-a2a.md',
  'docs/ai-agent/05-rag-knowledge-engineering.md',
  'docs/ai-agent/06-planning-execution-recovery.md',
  'docs/ai-agent/07-memory-session-personalization.md',
  'docs/ai-agent/08-multi-agent.md',
  'docs/ai-agent/09-production-reliability-cost.md',
  'docs/ai-agent/10-evaluation-observability.md',
  'docs/ai-agent/11-security-guardrails-governance.md',
  'docs/ai-agent/12-system-design-project-deep-dive.md',
  'docs/ai-agent/appendix-scenario-question-bank.md'
]

const kafkaTargets = [
  'docs/kafka/index.md',
  'docs/kafka/01-core-model-and-kraft.md',
  'docs/kafka/02-log-storage-and-performance.md',
  'docs/kafka/03-producer-reliability-ordering.md',
  'docs/kafka/04-consumer-offset-rebalance.md',
  'docs/kafka/05-replication-failure-recovery.md',
  'docs/kafka/06-delivery-semantics-exactly-once.md',
  'docs/kafka/07-retry-dlq-business-consistency.md',
  'docs/kafka/08-production-governance-capacity.md',
  'docs/kafka/09-troubleshooting-runbook.md',
  'docs/kafka/10-interview-follow-ups.md',
  'docs/kafka/appendix-kafka-3x-legacy.md'
]

const redisTargets = [
  'docs/redis/index.md',
  'docs/redis/01-thread-model-event-loop.md',
  'docs/redis/02-data-structures-version-differences.md',
  'docs/redis/03-expiration-eviction.md',
  'docs/redis/04-rdb-aof-recovery.md',
  'docs/redis/05-cache-consistency.md',
  'docs/redis/06-penetration-breakdown-avalanche.md',
  'docs/redis/07-replication-sentinel.md',
  'docs/redis/08-cluster.md',
  'docs/redis/09-transactions-lua-functions.md',
  'docs/redis/10-redisson-fencing-token.md',
  'docs/redis/11-bigkey-hotkey-incidents.md',
  'docs/redis/12-interview-troubleshooting.md'
]

const elasticsearchTargets = [
  'docs/elasticsearch/index.md',
  'docs/elasticsearch/01-learning-interview-framework.md',
  'docs/elasticsearch/02-architecture-core-concepts.md',
  'docs/elasticsearch/03-lucene-index-internals.md',
  'docs/elasticsearch/04-write-path.md',
  'docs/elasticsearch/05-search-path.md',
  'docs/elasticsearch/06-mapping-analyzers.md',
  'docs/elasticsearch/07-shards-routing-capacity.md',
  'docs/elasticsearch/08-dsl-pagination-aggregation.md',
  'docs/elasticsearch/09-jvm-os-tuning.md',
  'docs/elasticsearch/10-production-runbook.md',
  'docs/elasticsearch/11-enterprise-cases.md',
  'docs/elasticsearch/12-reindex-consistency.md',
  'docs/elasticsearch/13-security-backup-upgrade.md',
  'docs/elasticsearch/14-interview-question-bank.md',
  'docs/elasticsearch/15-command-templates.md',
  'docs/elasticsearch/16-references.md'
]

const paymentTargets = [
  'docs/finance-payment-ddd/index.md',
  'docs/finance-payment-ddd/01-domain-foundations.md',
  'docs/finance-payment-ddd/02-solid.md',
  'docs/finance-payment-ddd/03-design-patterns.md',
  'docs/finance-payment-ddd/04-domain-modeling.md',
  'docs/finance-payment-ddd/05-idempotency-consistency.md',
  'docs/finance-payment-ddd/06-state-machine-unknown.md',
  'docs/finance-payment-ddd/07-ledger-reconciliation.md',
  'docs/finance-payment-ddd/08-events-outbox-inbox.md',
  'docs/finance-payment-ddd/09-risk-security-compliance.md',
  'docs/finance-payment-ddd/10-capacity-reliability.md',
  'docs/finance-payment-ddd/11-java-implementation.md',
  'docs/finance-payment-ddd/12-system-design-cases.md',
  'docs/finance-payment-ddd/13-interview-question-bank.md',
  'docs/finance-payment-ddd/subscription-case/01-bounded-contexts.md',
  'docs/finance-payment-ddd/subscription-case/02-aggregates-consistency.md',
  'docs/finance-payment-ddd/subscription-case/03-payment-channel-acl.md',
  'docs/finance-payment-ddd/subscription-case/04-payment-state-machine.md',
  'docs/finance-payment-ddd/subscription-case/05-outbox-inbox.md',
  'docs/finance-payment-ddd/subscription-case/06-data-model.md',
  'docs/finance-payment-ddd/subscription-case/07-renewal-scheduling.md',
  'docs/finance-payment-ddd/subscription-case/08-evolution-roadmap.md',
  'docs/finance-payment-ddd/subscription-case/09-interview-follow-ups.md'
]

const backendTargets = [
  'docs/java/index.md',
  'docs/java/concurrency-virtual-threads.md',
  'docs/java/spring-transactions-service-governance.md',
  'docs/jvm/index.md',
  'docs/jvm/diagnostics-gc.md',
  'docs/mysql/index.md',
  'docs/mysql/transactions-locks-indexes.md',
  'docs/system-design/index.md',
  'docs/system-design/soc-agent.md',
  'docs/system-design/global-subscription.md',
  'docs/system-design/overseas-payment.md',
  'docs/system-design/transport-safety.md',
  'docs/system-design/spec-driven-ai-coding.md',
  'docs/system-design/interview-strategy.md',
  'docs/system-design/storage-transaction-comparison.md'
]

test('migration manifest lists every approved source exactly once', () => {
  const manifestPath = 'docs/migration-manifest.md'
  assert.equal(existsSync(manifestPath), true, 'missing migration manifest')
  const manifest = readFileSync(manifestPath, 'utf8')

  for (const source of approvedSources) {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const occurrences = manifest.match(new RegExp(escaped, 'g'))?.length ?? 0
    assert.equal(occurrences, 1, `expected one manifest entry for ${source}`)
  }
})

test('incremental migration lists every new source exactly once', () => {
  const manifest = readFileSync('docs/migration-manifest.md', 'utf8')

  for (const source of incrementalSources) {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const occurrences = manifest.match(new RegExp(escaped, 'g'))?.length ?? 0
    assert.equal(occurrences, 1, `expected one incremental manifest entry for ${source}`)
  }
})

test('incremental migration exposes every new page and owned asset', () => {
  for (const target of [...incrementalTargets, ...incrementalAssets]) {
    assert.equal(existsSync(target), true, `missing incremental target: ${target}`)
  }
})

test('MySQL 8.4 review exposes all corrected canonical pages', () => {
  for (const target of mysqlReviewedTargets) {
    assert.equal(existsSync(target), true, `missing reviewed MySQL page: ${target}`)
  }
})

test('AI Agent migration exposes the complete target page set', () => {
  for (const target of aiAgentTargets) {
    assert.equal(existsSync(target), true, `missing AI Agent page: ${target}`)
  }
})

test('Kafka migration exposes canonical and legacy target pages', () => {
  for (const target of kafkaTargets) {
    assert.equal(existsSync(target), true, `missing Kafka page: ${target}`)
  }
})

test('Redis migration exposes the complete reviewing page set', () => {
  for (const target of redisTargets) {
    assert.equal(existsSync(target), true, `missing Redis page: ${target}`)
  }
})

test('Elasticsearch migration exposes the complete reviewing page set', () => {
  for (const target of elasticsearchTargets) {
    assert.equal(existsSync(target), true, `missing Elasticsearch page: ${target}`)
  }
})

test('Payment and DDD migration exposes the complete target page set', () => {
  for (const target of paymentTargets) {
    assert.equal(existsSync(target), true, `missing payment or DDD page: ${target}`)
  }
})

test('Backend and system-design extraction exposes every target page', () => {
  for (const target of backendTargets) {
    assert.equal(existsSync(target), true, `missing backend page: ${target}`)
  }
})
