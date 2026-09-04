---
name: word-review-to-github-pages
description: Use when a user provides a Word document and wants its content reviewed, reorganized, or published into a GitHub Pages documentation repository.
---

# Word Review to GitHub Pages

## Hard Gate: Confirm the Repository Every Time

On **every execution**, ask the user which GitHub repository to use and require an explicit `owner/repo` or repository URL for this execution.

Use this question:

> 这次要整理到哪个 GitHub 仓库？请给我 `owner/repo` 或仓库 URL。

Do not reuse the **previous execution** repository. Do not infer it from project context, recent history, a familiar repository name, or the repository that stores this skill. Wait for the answer **before reading or writing the target repository**, generating target paths, creating branches, or making any target-repository change.

## Workflow

1. **Confirm target repository.** The hard gate above cannot be skipped.
2. **Inspect repository conventions.** Read its README, contribution/style guidance, site configuration, build scripts, deployment workflow, nearby topic pages, and asset layout. Target-repository rules override generic defaults.
3. **Extract the Word document faithfully.** Preserve meaningful headings, paragraphs, tables, code, images, captions, links, and ordering. Ignore decorative Word-only artifacts.
4. **Review before publishing.** Apply `references/review-rubric.md`. Correct well-supported public technical facts. For a **project fact conflict**, do not guess; preserve the conflicting evidence and require user confirmation before publishing the disputed claim.
5. **Restructure for the target site.** Apply repository conventions first; otherwise use `references/interview-content-standard.md`. Do not change technical meaning merely to improve presentation.
6. **Handle assets and navigation.** Follow `references/github-pages-rules.md`. Prefer updating an existing relevant page when the Word substantially duplicates current content; avoid unnecessary new top-level sections.
7. **Run quality gates.** Reuse the target repository's existing tests, lint/content validation, link checks, and static-site build when available. Any Blocker or failed mandatory quality gate stops publication.
8. **Write safely.** Follow the repository's branch/PR/protection strategy. Direct publication is allowed only when the repository flow and the user's request support it.
9. **Verify deployment.** Check the resulting commit/PR and, when publication is requested, the GitHub Pages or deployment workflow result. You must not claim publication success without deployment verification.
10. **Report results.** Include repository, source Word name, Blocker/Major/Minor counts, important corrections, final paths, navigation changes, quality-gate results, commit/PR, and deployment status.

## Required References

- `references/review-rubric.md`
- `references/interview-content-standard.md`
- `references/github-pages-rules.md`

## Stop Conditions

Stop publication and surface the issue when there is unresolved sensitive information, an unresolved Blocker, a project fact conflict that materially changes the published claim, a failed mandatory quality gate, or an unverified/failed deployment.
