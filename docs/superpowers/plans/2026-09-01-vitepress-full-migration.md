# VitePress Full Handbook Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a VitePress GitHub Pages site that reorganizes and traces all 12 approved source documents into a maintainable Chinese P7/P8 interview handbook.

**Architecture:** VitePress renders Markdown under `docs/`; a small Node.js validator enforces repository-specific metadata, heading, attachment, and internal-link rules before production builds. Content is split by domain and canonical source, while `docs/migration-manifest.md` records how every approved source was merged, deduplicated, or marked as legacy/reviewing.

**Tech Stack:** Node.js 20, npm, VitePress, TypeScript configuration, Node.js built-in test runner, markdownlint-cli2, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-01-vitepress-github-pages-design.md`

## Global Constraints

- Use `base: '/backend-ai-interview-handbook-zh-cn/'` for the project Pages URL.
- Use ASCII directory and file paths; use Simplified Chinese titles and body text.
- Do not commit source DOCX/PDF files, unknown-copyright images, credentials, or generated build output.
- Markdown is the only primary reading format.
- Cover every unique knowledge point from the 12-source inventory, but merge duplicates into one canonical statement.
- Mark unverified Redis and legacy Kafka claims as `reviewing` or `legacy`, never `verified`.
- Treat Elasticsearch shard, heap, bulk, and capacity numbers as project context or benchmark starting points, not universal best practices.
- Keep the first dependency set to VitePress and markdownlint tooling; do not add a database, CMS, comments, analytics, or hosted search.
- Use a feature branch; do not push implementation directly to `main`.

---

## Target File Map

### Site and quality infrastructure

- `package.json`: scripts and development dependencies.
- `package-lock.json`: reproducible npm install.
- `docs/.vitepress/config.mts`: site metadata, navigation, sidebars, search, edit links, and Pages base.
- `docs/.vitepress/theme/index.ts`: custom theme entry.
- `docs/.vitepress/theme/custom.css`: readable Chinese handbook styles.
- `docs/public/logo.svg`: repository-owned vector mark.
- `scripts/lib/content-validator.mjs`: reusable document validation functions.
- `scripts/validate-content.mjs`: command-line validator.
- `tests/site-structure.test.mjs`: site contract tests.
- `tests/content-validator.test.mjs`: validator behavior tests.
- `tests/content-inventory.test.mjs`: 12-source and target-page coverage tests.
- `.markdownlint-cli2.jsonc`: Markdown lint policy.
- `.github/workflows/deploy.yml`: quality, build, artifact upload, and Pages deployment.

### Governance and reader entry points

- `README.md`, `ROADMAP.md`, `CONTRIBUTING.md`, `STYLE-GUIDE.md`, `SOURCES.md`, `CHANGELOG.md`.
- `docs/index.md`, `docs/guide/index.md`, `docs/guide/learning-path.md`.
- `docs/migration-manifest.md`: source-to-target coverage and calibration status.

### Domain content

- `docs/ai-agent/`: 14 pages covering modules 1-12, project deep dive, and scenario bank.
- `docs/kafka/`: 11 pages covering canonical Kafka chapters plus a legacy appendix.
- `docs/redis/`: 12 pages, all initially `reviewing` unless independently calibrated.
- `docs/elasticsearch/`: 16 pages split from the canonical handbook.
- `docs/finance-payment-ddd/`: 13 finance/payment pages and 9 subscription-case pages.
- `docs/java/`, `docs/jvm/`, `docs/mysql/`, `docs/system-design/`: content extracted from the comprehensive customized handbook.

---

### Task 1: Establish the site contract and minimal VitePress application

**Files:**
- Create: `tests/site-structure.test.mjs`
- Create: `package.json`
- Create: `docs/.vitepress/config.mts`
- Create: `docs/.vitepress/theme/index.ts`
- Create: `docs/.vitepress/theme/custom.css`
- Create: `docs/public/logo.svg`
- Create: `docs/index.md`
- Create: `.gitignore`

**Interfaces:**
- Produces npm scripts `test`, `docs:dev`, `docs:build`, `docs:preview`, and `check`.
- Produces the VitePress build output at `docs/.vitepress/dist`.

- [ ] **Step 1: Write the failing site-structure test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const required = [
  'package.json',
  'docs/index.md',
  'docs/.vitepress/config.mts'
]

test('required site files exist', () => {
  for (const file of required) assert.equal(existsSync(file), true, file)
})

test('VitePress uses the repository Pages base path', () => {
  const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
  assert.match(config, /base:\s*['"]\/backend-ai-interview-handbook-zh-cn\/['"]/)
})
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/site-structure.test.mjs`

Expected: FAIL because `package.json`, VitePress config, and homepage are absent.

- [ ] **Step 3: Create the minimal site and package scripts**

Use this script contract in `package.json`:

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "lint:md": "markdownlint-cli2 \"**/*.md\" \"#node_modules\" \"#docs/.vitepress/dist\"",
    "validate:content": "node scripts/validate-content.mjs docs",
    "check": "npm run test && npm run lint:md && npm run validate:content",
    "docs:dev": "vitepress docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

Set the exact title `后端与 AI 面试手册`, Chinese locale, local search, outline levels 2-4, GitHub edit link, and project Pages base in `config.mts`.

- [ ] **Step 4: Install dependencies and verify GREEN**

Run: `npm install --save-dev vitepress markdownlint-cli2`

Run: `npm test`

Expected: PASS for the initial site contract.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore tests/site-structure.test.mjs docs/index.md docs/.vitepress docs/public/logo.svg
git commit -m "feat: initialize VitePress handbook site"
```

### Task 2: Add content validation with test-first behavior

**Files:**
- Create: `tests/content-validator.test.mjs`
- Create: `scripts/lib/content-validator.mjs`
- Create: `scripts/validate-content.mjs`
- Create: `.markdownlint-cli2.jsonc`

**Interfaces:**
- Produces `validateDocument(markdown, filePath, existingPaths): ValidationIssue[]`.
- `ValidationIssue` is `{ code: string, message: string, line: number }`.
- CLI exits 0 with `Validated N Markdown files` or exits 1 after printing issues.

- [ ] **Step 1: Write failing unit tests**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { validateDocument } from '../scripts/lib/content-validator.mjs'

test('requires main-page front matter fields', () => {
  const issues = validateDocument('# 标题\n', 'docs/kafka/core.md', new Set())
  assert.deepEqual(issues.map(x => x.code), ['frontmatter-missing'])
})

test('rejects duplicate H1 headings and attachment-only links', () => {
  const markdown = `---\ntitle: 示例\ndescription: 示例\nstatus: reviewing\nbaseline: source snapshot\nlast_verified: 2026-09-01\nlevel: P7/P8\nsource: 自有资料\n---\n# 示例\n# 示例二\n[原文](x.docx)\n`
  const codes = validateDocument(markdown, 'docs/kafka/core.md', new Set()).map(x => x.code)
  assert.deepEqual(codes, ['duplicate-h1', 'attachment-link'])
})
```

- [ ] **Step 2: Run the tests and confirm RED**

Run: `node --test tests/content-validator.test.mjs`

Expected: FAIL because `content-validator.mjs` does not exist.

- [ ] **Step 3: Implement the validator**

Implement rules for required front matter, one H1, duplicate H1/H2, `.docx`/`.pdf` primary links, and missing relative Markdown targets. Ignore absolute HTTP(S), hash, mailto, and image links for local target checks.

- [ ] **Step 4: Verify GREEN and CLI behavior**

Run: `npm test`

Run: `npm run validate:content`

Expected: all tests pass and the homepage validates.

- [ ] **Step 5: Commit**

```bash
git add tests/content-validator.test.mjs scripts .markdownlint-cli2.jsonc package.json
git commit -m "feat: add documentation quality gates"
```

### Task 3: Define governance and full source coverage before migrating content

**Files:**
- Create: `tests/content-inventory.test.mjs`
- Create: `docs/migration-manifest.md`
- Create: `README.md`
- Create: `ROADMAP.md`
- Create: `CONTRIBUTING.md`
- Create: `STYLE-GUIDE.md`
- Create: `SOURCES.md`
- Create: `CHANGELOG.md`
- Create: `docs/guide/index.md`
- Create: `docs/guide/learning-path.md`

**Interfaces:**
- The inventory test starts with the exact 12-source list; each migration task extends it with that domain's required target-page mapping.
- The migration manifest uses one row per source with `migrated`, `merged`, or `legacy` status.

- [ ] **Step 1: Write the failing inventory test**

Create a literal list of all 12 filenames in the design spec. Assert that every filename appears exactly once in `docs/migration-manifest.md`. Domain target existence assertions are added by Tasks 4-9 only when those target pages are ready to make the test pass.

- [ ] **Step 2: Confirm RED**

Run: `node --test tests/content-inventory.test.mjs`

Expected: FAIL because the migration manifest is absent.

- [ ] **Step 3: Create governance files and the migration manifest**

Document canonical sources, duplicate handling, calibration status, Markdown-only policy, ASCII paths, copyright/source rules, and the distinction from `system-design-notes-zh-cn`.

- [ ] **Step 4: Run focused validation**

Run: `npm run validate:content`

Expected: governance and guide Markdown files pass metadata and link rules.

- [ ] **Step 5: Commit**

```bash
git add README.md ROADMAP.md CONTRIBUTING.md STYLE-GUIDE.md SOURCES.md CHANGELOG.md docs/guide docs/migration-manifest.md tests/content-inventory.test.mjs
git commit -m "docs: add handbook governance and migration manifest"
```

### Task 4: Migrate the complete AI Agent material

**Files:**
- Create: `docs/ai-agent/index.md`
- Create: `docs/ai-agent/01-llm-agent-basics.md`
- Create: `docs/ai-agent/02-architecture-orchestration.md`
- Create: `docs/ai-agent/03-prompt-context-engineering.md`
- Create: `docs/ai-agent/04-tools-mcp-a2a.md`
- Create: `docs/ai-agent/05-rag-knowledge-engineering.md`
- Create: `docs/ai-agent/06-planning-execution-recovery.md`
- Create: `docs/ai-agent/07-memory-session-personalization.md`
- Create: `docs/ai-agent/08-multi-agent.md`
- Create: `docs/ai-agent/09-production-reliability-cost.md`
- Create: `docs/ai-agent/10-evaluation-observability.md`
- Create: `docs/ai-agent/11-security-guardrails-governance.md`
- Create: `docs/ai-agent/12-system-design-project-deep-dive.md`
- Create: `docs/ai-agent/appendix-scenario-question-bank.md`
- Modify: `docs/migration-manifest.md`

**Interfaces:**
- Canonical source modules 1-12 map one-to-one to pages 01-12.
- The older Markdown question bank contributes only nonduplicate scenario questions to the appendix.
- SOC content from the comprehensive handbook goes to page 12 and links to Java virtual-thread and Kafka pages.

- [ ] **Step 1: Extend the inventory test for all 14 AI Agent targets and confirm RED**

Run: `node --test tests/content-inventory.test.mjs`

- [ ] **Step 2: Split the canonical Markdown by module H1 boundaries**

Preserve question headings, code blocks, tables, and answer sections. Normalize bold heading markup, demote each source module H1 to the page H1, and add full Front Matter with `status: reviewing` unless the page was independently calibrated.

- [ ] **Step 3: Merge unique scenario questions and SOC project material**

Do not duplicate canonical questions. Add source notes at the end of each page and update both source rows in the migration manifest.

- [ ] **Step 4: Verify**

Run: `npm test`

Run: `npm run validate:content`

Expected: all AI Agent targets exist, have metadata, and contain no attachment-only links.

- [ ] **Step 5: Commit**

```bash
git add docs/ai-agent docs/migration-manifest.md tests/content-inventory.test.mjs
git commit -m "docs(agent): migrate complete AI Agent handbook"
```

### Task 5: Migrate Kafka and preserve legacy boundaries

**Files:**
- Create: `docs/kafka/index.md`
- Create: `docs/kafka/01-core-model-and-kraft.md`
- Create: `docs/kafka/02-log-storage-and-performance.md`
- Create: `docs/kafka/03-producer-reliability-ordering.md`
- Create: `docs/kafka/04-consumer-offset-rebalance.md`
- Create: `docs/kafka/05-replication-failure-recovery.md`
- Create: `docs/kafka/06-delivery-semantics-exactly-once.md`
- Create: `docs/kafka/07-retry-dlq-business-consistency.md`
- Create: `docs/kafka/08-production-governance-capacity.md`
- Create: `docs/kafka/09-troubleshooting-runbook.md`
- Create: `docs/kafka/10-interview-follow-ups.md`
- Create: `docs/kafka/appendix-kafka-3x-legacy.md`
- Modify: `docs/migration-manifest.md`

**Interfaces:**
- `Kafka核心知识点_P7P8面试强化版.docx` is canonical.
- Kafka 3.x-only content goes to the legacy appendix.
- The dedicated EOS source enriches page 06; external database effects remain at-least-once plus business idempotency/compensation.

- [ ] **Step 1: Add Kafka targets to the inventory test and confirm RED**
- [ ] **Step 2: Split canonical chapters 1-11 into the target pages**
- [ ] **Step 3: Merge unique 3.x and EOS material with explicit status labels**
- [ ] **Step 4: Run `npm test && npm run validate:content` and confirm GREEN**
- [ ] **Step 5: Commit with `git commit -m "docs(kafka): migrate calibrated Kafka handbook"`**

### Task 6: Migrate Redis as reviewing content

**Files:**
- Create: `docs/redis/index.md`
- Create: `docs/redis/01-thread-model-event-loop.md`
- Create: `docs/redis/02-data-structures-version-differences.md`
- Create: `docs/redis/03-expiration-eviction.md`
- Create: `docs/redis/04-rdb-aof-recovery.md`
- Create: `docs/redis/05-cache-consistency.md`
- Create: `docs/redis/06-penetration-breakdown-avalanche.md`
- Create: `docs/redis/07-replication-sentinel.md`
- Create: `docs/redis/08-cluster.md`
- Create: `docs/redis/09-transactions-lua-functions.md`
- Create: `docs/redis/10-redisson-fencing-token.md`
- Create: `docs/redis/11-bigkey-hotkey-incidents.md`
- Create: `docs/redis/12-interview-troubleshooting.md`
- Modify: `docs/migration-manifest.md`

**Interfaces:**
- Every Redis page uses `status: reviewing` and a source-snapshot baseline.
- Contradictory or version-specific claims are presented as questions to verify or version tables, not timeless facts.
- Lua/transaction atomic execution is not described as automatic rollback after runtime errors.

- [ ] **Step 1: Add Redis targets to the inventory test and confirm RED**
- [ ] **Step 2: Reorganize both Redis sources by the 12 target topics**
- [ ] **Step 3: Remove formatting noise, deduplicate repeated explanations, and add version caveats**
- [ ] **Step 4: Run `npm test && npm run validate:content` and confirm GREEN**
- [ ] **Step 5: Commit with `git commit -m "docs(redis): migrate handbook with review status"`**

### Task 7: Split the Elasticsearch canonical handbook

**Files:**
- Create: `docs/elasticsearch/index.md`
- Create: `docs/elasticsearch/01-learning-and-answer-framework.md`
- Create: `docs/elasticsearch/02-architecture-core-concepts.md`
- Create: `docs/elasticsearch/03-lucene-data-structures.md`
- Create: `docs/elasticsearch/04-write-path.md`
- Create: `docs/elasticsearch/05-search-path.md`
- Create: `docs/elasticsearch/06-mapping-analyzer.md`
- Create: `docs/elasticsearch/07-shards-routing-capacity.md`
- Create: `docs/elasticsearch/08-dsl-pagination-aggregation.md`
- Create: `docs/elasticsearch/09-jvm-os-cluster-tuning.md`
- Create: `docs/elasticsearch/10-production-runbook.md`
- Create: `docs/elasticsearch/11-enterprise-cases.md`
- Create: `docs/elasticsearch/12-zero-downtime-reindex.md`
- Create: `docs/elasticsearch/13-security-backup-upgrade.md`
- Create: `docs/elasticsearch/14-soc-data-model.md`
- Create: `docs/elasticsearch/15-project-parameters.md`
- Create: `docs/elasticsearch/16-interview-question-bank.md`
- Modify: `docs/migration-manifest.md`

**Interfaces:**
- Source chapters 1-13 map directly to pages 01-13.
- SOC architecture and current project parameters map to pages 14-15.
- Remaining questions map to page 16.
- Capacity values carry explicit workload and benchmark caveats.

- [ ] **Step 1: Add all ES targets to the inventory test and confirm RED**
- [ ] **Step 2: Split chapters and normalize headings/code blocks**
- [ ] **Step 3: Add project-boundary callouts to shard, heap, bulk, refresh, and rollover parameters**
- [ ] **Step 4: Run `npm test && npm run validate:content` and confirm GREEN**
- [ ] **Step 5: Commit with `git commit -m "docs(es): split production and interview handbook"`**

### Task 8: Migrate finance, payment, and DDD subscription material

**Files:**
- Create: `docs/finance-payment-ddd/index.md`
- Create: `docs/finance-payment-ddd/01-domain-foundations.md`
- Create: `docs/finance-payment-ddd/02-solid.md`
- Create: `docs/finance-payment-ddd/03-design-patterns.md`
- Create: `docs/finance-payment-ddd/04-domain-modeling.md`
- Create: `docs/finance-payment-ddd/05-idempotency-consistency.md`
- Create: `docs/finance-payment-ddd/06-state-machine-unknown.md`
- Create: `docs/finance-payment-ddd/07-ledger-reconciliation.md`
- Create: `docs/finance-payment-ddd/08-events-outbox-inbox.md`
- Create: `docs/finance-payment-ddd/09-risk-security-compliance.md`
- Create: `docs/finance-payment-ddd/10-capacity-reliability.md`
- Create: `docs/finance-payment-ddd/11-java-implementation.md`
- Create: `docs/finance-payment-ddd/12-system-design-cases.md`
- Create: `docs/finance-payment-ddd/13-interview-question-bank.md`
- Create: `docs/finance-payment-ddd/subscription-case/01-bounded-contexts.md`
- Create: `docs/finance-payment-ddd/subscription-case/02-aggregates-consistency.md`
- Create: `docs/finance-payment-ddd/subscription-case/03-payment-channel-acl.md`
- Create: `docs/finance-payment-ddd/subscription-case/04-payment-state-machine.md`
- Create: `docs/finance-payment-ddd/subscription-case/05-outbox-inbox.md`
- Create: `docs/finance-payment-ddd/subscription-case/06-data-model.md`
- Create: `docs/finance-payment-ddd/subscription-case/07-renewal-scheduling.md`
- Create: `docs/finance-payment-ddd/subscription-case/08-evolution-roadmap.md`
- Create: `docs/finance-payment-ddd/subscription-case/09-interview-follow-ups.md`
- Modify: `docs/migration-manifest.md`

**Interfaces:**
- Payment, Ledger, Settlement, and Reconciliation remain separate fact lifecycles.
- UNKNOWN never becomes automatic failure or unconditional channel retry.
- DDD diagrams are rewritten as Mermaid based on owned source concepts; binary source images are not copied.

- [ ] **Step 1: Add all finance/DDD targets to the inventory test and confirm RED**
- [ ] **Step 2: Split the canonical 23-chapter payment source into 13 coherent pages**
- [ ] **Step 3: Merge both DDD documents into the nine-page subscription case and redraw essential diagrams as Mermaid**
- [ ] **Step 4: Run `npm test && npm run validate:content` and confirm GREEN**
- [ ] **Step 5: Commit with `git commit -m "docs(payment): migrate finance and DDD handbook"`**

### Task 9: Extract Java, JVM, MySQL, project, and system-design content

**Files:**
- Create: `docs/java/index.md`
- Create: `docs/java/concurrency-virtual-threads.md`
- Create: `docs/java/spring-transactions-service-governance.md`
- Create: `docs/jvm/index.md`
- Create: `docs/jvm/diagnostics-gc.md`
- Create: `docs/mysql/index.md`
- Create: `docs/mysql/transactions-locks-indexes.md`
- Create: `docs/system-design/index.md`
- Create: `docs/system-design/soc-agent.md`
- Create: `docs/system-design/global-subscription.md`
- Create: `docs/system-design/overseas-payment.md`
- Create: `docs/system-design/transport-safety.md`
- Create: `docs/system-design/spec-driven-ai-coding.md`
- Create: `docs/system-design/interview-strategy.md`
- Modify: `docs/migration-manifest.md`

**Interfaces:**
- The comprehensive source's chapters 2-5, 8-10, 11, and deep-dive chapters feed these pages.
- Duplicate AI Agent/Kafka/Redis/ES content becomes links to canonical domain pages.
- Personal project metrics are labeled as candidate-provided project context, not external benchmark facts.

- [ ] **Step 1: Add backend/system targets to the inventory test and confirm RED**
- [ ] **Step 2: Extract and merge the specified comprehensive-handbook sections**
- [ ] **Step 3: Replace duplicated domain explanations with canonical links while preserving project-specific answers**
- [ ] **Step 4: Run `npm test && npm run validate:content` and confirm GREEN**
- [ ] **Step 5: Commit with `git commit -m "docs(java): add backend and project deep dives"`**

### Task 10: Complete navigation, CI deployment, and end-to-end verification

**Files:**
- Modify: `docs/.vitepress/config.mts`
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `docs/migration-manifest.md`
- Modify: `tests/site-structure.test.mjs`

**Interfaces:**
- Every top navigation item resolves to an existing page.
- Every sidebar lists the complete domain file set.
- Workflow runs `npm ci`, `npm run check`, `npm run docs:build`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.

- [ ] **Step 1: Extend the site test for full navigation and workflow actions, then confirm RED**

Assert that config contains all domain route prefixes and workflow contains `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.

- [ ] **Step 2: Implement complete navigation and the Pages workflow**

Use Node.js 20 and deployment permissions `contents: read`, `pages: write`, and `id-token: write`. Upload only `docs/.vitepress/dist`.

- [ ] **Step 3: Run fresh complete verification**

```bash
npm ci
npm run check
npm run docs:build
git diff --check
git status --short
```

Expected: all tests pass, Markdown/content validation passes, VitePress build exits 0, no whitespace errors, and no source binaries/build output are staged.

- [ ] **Step 4: Inspect the built site locally**

Run `npm run docs:preview -- --host 127.0.0.1` and request the homepage plus one page from each domain. Confirm HTTP 200, correct base-prefixed assets, and no broken local navigation in browser console output.

- [ ] **Step 5: Commit and push the feature branch**

```bash
git add .github/workflows/deploy.yml docs/.vitepress/config.mts README.md CHANGELOG.md docs/migration-manifest.md tests/site-structure.test.mjs
git commit -m "ci: publish handbook with GitHub Pages"
git push -u origin feat/vitepress-site
```

- [ ] **Step 6: Complete branch handoff**

Use `superpowers:finishing-a-development-branch`. If direct merge or Pages settings are unavailable, report the exact branch, commits, build evidence, and the single remaining repository setting: `Settings → Pages → Source → GitHub Actions`.
