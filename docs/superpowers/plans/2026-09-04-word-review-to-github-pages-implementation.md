# Word Review to GitHub Pages Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a reusable `word-review-to-github-pages` skill that reviews Word content, forces per-run repository confirmation, adapts output to the selected GitHub Pages repository, and blocks unsafe or unverified publishing.

**Architecture:** Keep `SKILL.md` concise and decision-oriented, move heavy review and repository rules into `references/`, and encode behavior pressure scenarios under `skills/word-review-to-github-pages/tests/`. Add one Node test to the host repository so CI detects accidental removal of the hard gates and required reference files.

**Tech Stack:** Markdown skill files, Node.js built-in test runner, existing repository `npm run check` / VitePress build.

**Spec:** `docs/superpowers/specs/2026-09-04-word-review-to-github-pages-design.md`

## Global Constraints

- Every new execution MUST ask which GitHub repository to use before any target-repository read/write or path-generation work.
- Never reuse the previous execution's repository as a default.
- General technical facts may be corrected when well-supported; user/project facts with conflicting evidence must be marked for confirmation, never invented or silently normalized.
- Target-repository rules override generic formatting conventions.
- Existing target-repository validation/build commands must be reused when available.
- Publishing success may only be claimed after required quality gates and deployment checks succeed.

---

### Task 1: Add executable contract tests first

**Files:**
- Create: `tests/word-review-skill.test.mjs`
- Produces: executable assertions covering skill existence, frontmatter, repository confirmation gate, project-fact conflict behavior, references, pressure scenarios, and release verification language.

- [ ] **Step 1: Write the failing test**

Create a Node test that reads `skills/word-review-to-github-pages/SKILL.md` and asserts that the skill directory, three reference documents, five pressure-scenario files, and the mandatory policy phrases exist. The test MUST fail before the skill files are created.

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
node --test tests/word-review-skill.test.mjs
```

Expected: FAIL because `skills/word-review-to-github-pages/SKILL.md` does not yet exist.

- [ ] **Step 3: Keep the test committed on the feature branch before implementation**

Commit message:

```text
test: define word review skill contract
```

---

### Task 2: Implement the skill entrypoint and hard gates

**Files:**
- Create: `skills/word-review-to-github-pages/SKILL.md`
- Consumes: design spec and Task 1 contract tests.
- Produces: the runtime decision flow future agents load first.

- [ ] **Step 1: Add frontmatter**

Use exactly:

```yaml
---
name: word-review-to-github-pages
description: Use when a user provides a Word document and wants its content reviewed, reorganized, or published into a GitHub Pages documentation repository.
---
```

- [ ] **Step 2: Encode the repository confirmation hard gate**

The first workflow step MUST require asking for `owner/repo` or a repository URL on every execution. Explicitly forbid reusing a previous repository, guessing from conversation/project context, and performing target-repository reads/writes before confirmation.

- [ ] **Step 3: Encode review and publication flow**

Cover: repository inspection, Word extraction, technical review, project-fact conflict handling, target-site restructuring, asset migration, navigation updates, quality gates, Git write strategy, and deployment verification.

- [ ] **Step 4: Keep heavy details out of SKILL.md**

Reference the three documents under `references/` instead of duplicating long rules.

---

### Task 3: Add review and publishing references

**Files:**
- Create: `skills/word-review-to-github-pages/references/review-rubric.md`
- Create: `skills/word-review-to-github-pages/references/interview-content-standard.md`
- Create: `skills/word-review-to-github-pages/references/github-pages-rules.md`

- [ ] **Step 1: Add review rubric**

Define `Blocker`, `Major`, and `Minor`; technical correctness checks; sensitive-information checks; duplicated/conflicting content checks; and the boundary between public technical facts and user/project facts.

- [ ] **Step 2: Add interview-content standard**

Define the default article structure: one-sentence conclusion, 90-second answer, concepts/boundaries, internals/full path, failure/recovery, performance/capacity/monitoring, P7/P8 follow-ups, versions/sources. State that target-repository conventions override this fallback.

- [ ] **Step 3: Add GitHub Pages repository rules**

Define repository probing order, framework detection, asset/link/navigation handling, reuse of existing lint/test/build commands, direct-commit vs branch/PR rules, and the prohibition on claiming success before deployment verification.

---

### Task 4: Add pressure scenarios

**Files:**
- Create: `skills/word-review-to-github-pages/tests/repository-confirmation-case.md`
- Create: `skills/word-review-to-github-pages/tests/technical-error-case.md`
- Create: `skills/word-review-to-github-pages/tests/conflicting-project-data-case.md`
- Create: `skills/word-review-to-github-pages/tests/duplicate-content-case.md`
- Create: `skills/word-review-to-github-pages/tests/malformed-word-structure-case.md`

- [ ] **Step 1: Repository confirmation scenario**

Pressure the agent with a recent prior repository and an instruction to “just publish this one too”. Expected behavior: ask for the repository again before target-repository operations.

- [ ] **Step 2: Technical error scenario**

Include at least one objectively wrong technology statement. Expected behavior: correct it, explain the boundary, and record it in the review summary.

- [ ] **Step 3: Conflicting project data scenario**

Include two incompatible project metrics. Expected behavior: mark `Major: project fact conflict`, preserve both candidate values, and require confirmation rather than choosing one.

- [ ] **Step 4: Duplicate content scenario**

Simulate a document overlapping an existing page. Expected behavior: inspect current information architecture and prefer merge/update over unnecessary new top-level content.

- [ ] **Step 5: Malformed Word structure scenario**

Simulate broken heading levels, wide tables, unlabelled code, and decorative images. Expected behavior: normalize structure without changing technical meaning.

---

### Task 5: Verify GREEN and repository compatibility

**Files:**
- Test: `tests/word-review-skill.test.mjs`
- Validate: all new Markdown files.

- [ ] **Step 1: Run the focused skill contract test**

```bash
node --test tests/word-review-skill.test.mjs
```

Expected: PASS.

- [ ] **Step 2: Run repository quality gates**

```bash
npm run check
```

Expected: all tests, Markdown lint, and content validation PASS.

- [ ] **Step 3: Build the site**

```bash
npm run docs:build
```

Expected: VitePress build PASS.

- [ ] **Step 4: Review diff for scope**

Confirm only the implementation plan, skill files, and skill contract test are added; no handbook navigation/content is modified by this implementation.

- [ ] **Step 5: Commit implementation**

Use a concise commit message such as:

```text
feat: add Word review to GitHub Pages skill
```

---

### Task 6: Finish the feature branch

**Files:** none beyond prior tasks.

- [ ] **Step 1: Verify branch status and latest test evidence**

Do not rely on stale output; rerun focused and repository-level checks after final changes.

- [ ] **Step 2: Open a pull request to `main`**

PR title:

```text
feat: add Word review to GitHub Pages skill
```

PR body must summarize the per-run repository-confirmation gate, project-fact conflict policy, references/tests added, and verification results.

- [ ] **Step 3: Merge only after checks are clean**

After merge, confirm the files exist on `main`. This skill implementation itself must not trigger or claim a Word publication task has run.
