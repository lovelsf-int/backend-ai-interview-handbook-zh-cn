# DOCX Incremental Content Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge four user-owned DOCX sources and one architecture image into the published VitePress handbook without duplicating canonical content or reintroducing obsolete Elasticsearch capacity assumptions.

**Architecture:** Add focused domain pages rather than source-shaped exports. Tests first define the approved sources, seven target pages, image asset, and sidebar visibility; content pages then reference existing canonical explanations and keep project facts separate from official version facts.

**Tech Stack:** Node.js built-in test runner, VitePress 1.6, Markdown, Mermaid, markdownlint-cli2, Git, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-02-docx-incremental-content-merge-design.md`

## Global Constraints

- Do not commit any source DOCX, Pandoc `media/` directory, generated build output, credential, or unknown-copyright asset.
- Publish the user-provided image only at `docs/public/images/system-design/japan-taiwan-active-active-order.png` with Alt Text and a textual explanation.
- Treat 800–900 万 Event + Alert, 150GB Primary/day, and about 300GB/day with one replica as candidate-provided project facts requiring personal verification.
- Never describe 150GB as one shard; calculate primary shards per Data Stream and present 35–40GB as a benchmark starting range, not a universal constant.
- Treat the 100 万/day ES document as legacy; do not carry its 1-primary recommendation into the current SOC pages.
- Preserve canonical pages and replace semantic duplication with internal links.
- Verify JDK version claims against OpenJDK/Oracle official documentation and Elasticsearch mechanisms against Elastic official documentation.
- Use ASCII file paths and Simplified Chinese page content.
- Add no runtime dependency.

---

## Target File Map

- `tests/content-inventory.test.mjs`: contract for five new sources/assets and seven new pages.
- `tests/site-structure.test.mjs`: contract that Java, ES, and system-design sidebars expose the new pages.
- `docs/migration-manifest.md`: source lineage, canonical/legacy/superseded roles, and merge decisions.
- `docs/elasticsearch/17-soc-event-alert-capacity.md`: project data model and capacity derivation.
- `docs/elasticsearch/18-soc-pressure-interview.md`: SOC operations and project pressure interview.
- `docs/java/virtual-threads-jdk21-25.md`: official version model.
- `docs/java/virtual-threads-production-patterns.md`: production control patterns and Spring boundaries.
- `docs/java/virtual-threads-observability-migration.md`: observability, benchmark, rollout, and rollback.
- `docs/java/design-patterns-production-scenarios.md`: v5.4 unique design-pattern scenarios.
- `docs/system-design/pressure-interview-playbook.md`: v5.4 unique pressure-interview framework.
- `docs/public/images/system-design/japan-taiwan-active-active-order.png`: user-owned architecture image.
- `docs/.vitepress/config.mts`: sidebar entries.
- Domain `index.md` and existing overview pages: concise entry links only.

---

### Task 1: Lock the incremental migration contract

**Files:**
- Modify: `tests/content-inventory.test.mjs`
- Modify: `tests/site-structure.test.mjs`
- Modify: `docs/migration-manifest.md`

**Interfaces:**
- Produces the arrays `incrementalSources`, `incrementalTargets`, and `incrementalAssets` in the inventory test.
- Produces a manifest entry for every new source exactly once.

- [ ] **Step 1: Write the failing inventory test**

Add these exact contracts:

```js
const incrementalSources = [
  'Elasticsearch_P7_P8_完整面试手册_SOC_800到900万条_Primary150GB_事件告警分层版_v2.4.docx',
  'Java虚拟线程生产实践指南_JDK21-25.docx',
  'Elasticsearch_P7_P8_完整面试手册_SOC告警场景.docx',
  '金余概_资深Java_AI-Agent开发_定制面试手册_v5.4_全量未答题补全版.docx',
  '日本台湾双活订单系统架构图.png'
]

const incrementalTargets = [
  'docs/elasticsearch/17-soc-event-alert-capacity.md',
  'docs/elasticsearch/18-soc-pressure-interview.md',
  'docs/java/virtual-threads-jdk21-25.md',
  'docs/java/virtual-threads-production-patterns.md',
  'docs/java/virtual-threads-observability-migration.md',
  'docs/java/design-patterns-production-scenarios.md',
  'docs/system-design/pressure-interview-playbook.md'
]

const incrementalAssets = [
  'docs/public/images/system-design/japan-taiwan-active-active-order.png'
]
```

Test that each source occurs exactly once in `docs/migration-manifest.md` and each target/asset exists.

- [ ] **Step 2: Run the inventory test and verify RED**

Run: `node --test tests/content-inventory.test.mjs`

Expected: FAIL because the seven pages, image, and five manifest entries do not exist.

- [ ] **Step 3: Add the manifest lineage**

Append five rows: ES v2.4 `canonical/in progress`, virtual threads `canonical/in progress`, old ES SOC `legacy/merged`, v5.4 `incremental/in progress`, and the image `owned visual/in progress`. Change the v5.0 row to `superseded` without deleting it.

- [ ] **Step 4: Run the inventory test**

Run: `node --test tests/content-inventory.test.mjs`

Expected: still FAIL only for missing target pages/assets, proving the manifest half is covered.

- [ ] **Step 5: Commit the RED contract and governance update**

```bash
git add tests/content-inventory.test.mjs tests/site-structure.test.mjs docs/migration-manifest.md
git commit -m "test(content): define incremental DOCX merge contract"
```

### Task 2: Add SOC Elasticsearch project pages

**Files:**
- Create: `docs/elasticsearch/17-soc-event-alert-capacity.md`
- Create: `docs/elasticsearch/18-soc-pressure-interview.md`
- Modify: `docs/elasticsearch/index.md`
- Modify: `docs/elasticsearch/07-shards-routing-capacity.md`
- Modify: `docs/elasticsearch/10-production-runbook.md`
- Modify: `docs/elasticsearch/14-interview-question-bank.md`

**Interfaces:**
- Produces the canonical project-capacity URL `/elasticsearch/17-soc-event-alert-capacity.md`.
- Produces the canonical SOC interview URL `/elasticsearch/18-soc-pressure-interview.md`.

- [ ] **Step 1: Verify the inventory test is RED for both ES pages**

Run: `node --test tests/content-inventory.test.mjs`

Expected: missing both `17-...` and `18-...` pages.

- [ ] **Step 2: Write the minimal page shells and verify GREEN for the ES targets**

Create valid Front Matter and one H1 in both files. Run `node --test tests/content-inventory.test.mjs`; ES target failures disappear while other target failures remain.

- [ ] **Step 3: Implement the capacity page**

Write the following tested derivations explicitly:

```text
150GB / 4 primary = 37.5GB per primary only for a hypothetical single stream.
150GB primary * (1 + 1 replica) = about 300GB physical store before operational reserve.
average business payload = 150GB / 8.5 million ≈ 18.9KB, but ES documents can outnumber business records after Raw/Normalized/Alert/AI layering.
```

Include per-stream sizing, rollover JSON, Raw/Normalize pipeline responsibility, idempotency keys, DLQ/replay, and project-fact warnings.

- [ ] **Step 4: Implement the SOC pressure-interview page**

Cover Query/Fetch, routing hot shards, merge pressure, item-level Bulk retries with exponential backoff for 429, pagination/aggregation, ILM, zero-downtime reindex, DB/ES fact ownership, AI result idempotency, Hybrid Search, five pressure rounds, and diagnostic commands.

- [ ] **Step 5: Add canonical cross-links instead of copied explanations**

Add concise links from the ES index, shard/capacity page, production runbook, and general question bank. Do not copy the new project sections into those files.

- [ ] **Step 6: Verify and commit**

Run: `npm test && npm run validate:content && npm run lint:md`

Expected: only non-ES incremental target failures remain in the inventory contract; content validation and Markdown lint pass for the new pages.

```bash
git add docs/elasticsearch tests/content-inventory.test.mjs
git commit -m "docs(elasticsearch): add SOC capacity and pressure interview"
```

### Task 3: Add JDK 21–25 virtual-thread production guidance

**Files:**
- Create: `docs/java/virtual-threads-jdk21-25.md`
- Create: `docs/java/virtual-threads-production-patterns.md`
- Create: `docs/java/virtual-threads-observability-migration.md`
- Modify: `docs/java/concurrency-virtual-threads.md`
- Modify: `docs/java/index.md`

**Interfaces:**
- Produces three stable URLs used by the Java sidebar and overview page.
- Keeps `concurrency-virtual-threads.md` as the canonical overview for the broader Java concurrency topic.

- [ ] **Step 1: Verify RED for all three Java targets**

Run: `node --test tests/content-inventory.test.mjs`

Expected: missing three virtual-thread pages.

- [ ] **Step 2: Create minimal valid pages and verify target GREEN**

Create Front Matter, H1, an official-source section, and cross-links among the three pages. Run the inventory test and confirm their missing-file failures disappear.

- [ ] **Step 3: Implement the JDK version page**

Document platform thread/carrier/virtual thread mounting, I/O unmounting, throughput-versus-latency, JEP 444 in JDK 21, JEP 491 in JDK 24, remaining native/foreign-function pinning, final Scoped Values in JDK 25, and Structured Concurrency as JDK 25 Preview. Include a version decision table and no fixed virtual-thread pool recommendation.

- [ ] **Step 4: Implement production patterns with compilable Java examples**

Include `Executors.newVirtualThreadPerTaskExecutor()`, per-downstream `Semaphore`, absolute deadline budgeting, bounded admission, CPU executor isolation, interruption propagation, Spring `@Transactional` boundaries, `@Async` executor selection, and a SOC AI fan-out example. State that a DB connection pool is already a resource gate and an extra semaphore is optional only when protecting a broader budget.

- [ ] **Step 5: Implement observability and migration**

Include JFR events, `jcmd Thread.dump_to_file`, scheduler/carrier/queue/downstream metrics, baseline-vs-virtual benchmark matrix, Little's Law interpretation, rollout stages, rollback thresholds, and Go/No-Go checks.

- [ ] **Step 6: Trim the old overview and add links**

Do not delete its transaction and SOC examples. Replace duplicated virtual-thread detail with a three-page learning map and concise summary.

- [ ] **Step 7: Verify and commit**

Run: `npm test && npm run validate:content && npm run lint:md`

```bash
git add docs/java
git commit -m "docs(java): add JDK 21 to 25 virtual thread production guide"
```

### Task 4: Merge only unique v5.4 interview content

**Files:**
- Create: `docs/java/design-patterns-production-scenarios.md`
- Create: `docs/system-design/pressure-interview-playbook.md`
- Modify: `docs/finance-payment-ddd/03-design-patterns.md`
- Modify: `docs/system-design/interview-strategy.md`
- Modify: `docs/java/index.md`
- Modify: `docs/system-design/index.md`

**Interfaces:**
- Produces one cross-domain Java pattern page and one compact pressure-interview playbook.
- Uses links to existing AI/Kafka/Redis/MySQL/ES canonical pages instead of repeating generic answers.

- [ ] **Step 1: Verify RED for the two v5.4 targets**

Run: `node --test tests/content-inventory.test.mjs`

Expected: missing pattern-scenario and pressure-playbook pages.

- [ ] **Step 2: Create the page shells and verify target GREEN**

Add valid Front Matter, H1, and canonical cross-links. Run the inventory test; only the image target remains missing.

- [ ] **Step 3: Implement the design-pattern scenario page**

Use the sequence “change point → invariant → pattern → trade-off → failure mode”. Cover Strategy + Adapter + Factory/Registry for payment channels, State Machine for monotonic payment states, Chain versus Pipeline/Filter, Command for Agent tools, Decorator versus Proxy, Composite for workflow trees, Facade for application APIs, and explicit over-design rejection. Link to `finance-payment-ddd/03-design-patterns.md` for definitions.

- [ ] **Step 4: Implement the pressure-interview playbook**

Cover fact boundary, invariant-first response, seven-part project answer, payment callback idempotency, Japan/Taiwan failover, evidence and metrics, incident retrospectives, and a scoring rubric. Link to existing long-form project pages and question banks.

- [ ] **Step 5: Verify semantic trimming**

Search the new pages for long verbatim headings already present in `docs/system-design/interview-strategy.md` and `docs/finance-payment-ddd/03-design-patterns.md`; replace repeated exposition with links.

- [ ] **Step 6: Verify and commit**

Run: `npm test && npm run validate:content && npm run lint:md`

```bash
git add docs/java docs/system-design docs/finance-payment-ddd/03-design-patterns.md
git commit -m "docs(interview): merge unique v5.4 production scenarios"
```

### Task 5: Publish the owned Japan–Taiwan architecture visual

**Files:**
- Create: `docs/public/images/system-design/japan-taiwan-active-active-order.png`
- Modify: `docs/system-design/overseas-payment.md`
- Modify: `docs/system-design/global-subscription.md`

**Interfaces:**
- Produces `/backend-ai-interview-handbook-zh-cn/images/system-design/japan-taiwan-active-active-order.png` in the built site.

- [ ] **Step 1: Verify RED for the asset**

Run: `node --test tests/content-inventory.test.mjs`

Expected: missing image asset.

- [ ] **Step 2: Copy the exact user-owned PNG**

Run:

```bash
mkdir -p docs/public/images/system-design
cp /workspace/scratch/287ebbb8439c/upload/日本台湾双活订单系统架构图.png docs/public/images/system-design/japan-taiwan-active-active-order.png
```

- [ ] **Step 3: Verify asset GREEN**

Run: `node --test tests/content-inventory.test.mjs`

Expected: all inventory tests pass.

- [ ] **Step 4: Add the image and operational explanation**

Embed it in `overseas-payment.md` with descriptive Alt Text. Explain Route Control Plane, `home_region`, `active_region`, `epoch`, fencing, local primary/remote replica, Outbox/Kafka, failover order, GTID/data validation, and rollback. Add only a cross-link from `global-subscription.md`.

- [ ] **Step 5: Commit**

Run: `npm test && npm run validate:content && npm run lint:md`

```bash
git add docs/public/images/system-design docs/system-design
git commit -m "docs(system-design): add Japan Taiwan active-active architecture"
```

### Task 6: Correct and merge the MySQL 8.4 source

**Files:**
- Modify: `tests/content-inventory.test.mjs`
- Create: `docs/mysql/innodb-write-mvcc-transactions.md`
- Create: `docs/mysql/locks-deadlocks-production-runbook.md`
- Create: `docs/mysql/index-explain-pagination-replication.md`
- Modify: `docs/mysql/index.md`
- Modify: `docs/mysql/transactions-locks-indexes.md`
- Modify: `docs/migration-manifest.md`

**Interfaces:**
- Adds one reviewed source and three non-overlapping MySQL 8.4 pages.
- Replaces legacy assertions with official-version semantics and reproducible diagnostic methods.

- [ ] **Step 1: Add the source and target inventory, then verify RED**

- [ ] **Step 2: Implement write/MVCC, locking/runbook, and index/plan/replication pages**

- [ ] **Step 3: Turn the existing page into a concise overview with canonical links**

- [ ] **Step 4: Validate, lint, test, and commit the MySQL unit**

### Task 7: Expose navigation and close governance

**Files:**
- Modify: `docs/.vitepress/config.mts`
- Modify: `tests/site-structure.test.mjs`
- Modify: `docs/migration-manifest.md`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Makes all seven pages reachable from Java, ES, and system-design sidebars.
- Changes new manifest rows from `in progress` to `migrated`, `merged`, or `legacy`.

- [ ] **Step 1: Add failing sidebar assertions**

Assert that `config.mts` contains each of the seven target links and run:

`node --test tests/site-structure.test.mjs`

Expected: FAIL because the links are absent.

- [ ] **Step 2: Add sidebar links and verify GREEN**

Add two ES items, four Java items, and one system-design item. Keep existing ordering and labels.

- [ ] **Step 3: Finalize manifest and changelog**

Mark ES v2.4, virtual threads, v5.4 and the owned image as migrated/merged; keep old ES as legacy and v5.0 as superseded. Record the seven pages, image, official version calibration, and automatic trimming in `CHANGELOG.md`.

- [ ] **Step 4: Run the focused tests**

Run: `npm test`

Expected: all tests pass with zero failures.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/config.mts tests/site-structure.test.mjs docs/migration-manifest.md CHANGELOG.md
git commit -m "feat(site): expose incremental P8 content"
```

### Task 8: Verify, publish, and inspect Pages

**Files:**
- Verify only; no planned production edits.

**Interfaces:**
- Produces a clean, buildable branch ready for remote `main` integration.

- [ ] **Step 1: Run the complete local quality gate**

Run: `npm run check`

Expected: all Node tests pass, Markdown lint reports zero errors, and all Markdown pages validate.

- [ ] **Step 2: Run a production build**

Run: `npm run docs:build`

Expected: VitePress client and SSR build succeed.

- [ ] **Step 3: Inspect repository hygiene**

Run:

```bash
git status --short
git diff --check
git ls-files | rg '\.(docx|pdf)$|(^|/)media/|docs/.vitepress/dist'
```

Expected: clean status after final commit, no whitespace errors, and no forbidden tracked source/build files.

- [ ] **Step 4: Integrate using the repository's GitHub API workflow**

Create Git objects from the verified commit tree against remote `main`, update `refs/heads/main`, and do not force-push unrelated history.

- [ ] **Step 5: Verify GitHub Actions and public pages**

Confirm the Pages workflow succeeds, then request the home page, all seven new page URLs, and the image URL. Expected: HTTP 200 and the new navigation content is present.
