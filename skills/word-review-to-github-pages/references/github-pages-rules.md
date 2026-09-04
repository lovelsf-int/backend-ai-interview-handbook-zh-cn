# GitHub Pages Repository Rules

Apply these rules only after the user has confirmed the target repository for the current execution.

## Repository Probe Order

Inspect the repository before choosing paths or formatting:

1. `README.md`.
2. `STYLE-GUIDE.md`, `CONTRIBUTING.md`, or equivalent authoring guidance.
3. Package/build files such as `package.json`, `pyproject.toml`, `Gemfile`, or other site dependencies.
4. Static-site configuration such as `docs/.vitepress/config.*`, `mkdocs.yml`, `_config.yml`, `docusaurus.config.*`, or equivalent.
5. GitHub Actions or other deployment workflows.
6. The nearest existing topic index, sibling pages, navigation configuration, and static-asset directories.

Do not assume VitePress. Detect the repository's actual framework and conventions.

## Content Placement

- Reuse the existing information architecture.
- Prefer an existing relevant section over creating a new top-level category.
- Match existing path naming, front matter, heading hierarchy, and ordering.
- When the repository has a canonical page for the topic, merge or update it instead of creating a duplicate page unless a separate scope is justified.
- Update only navigation/index files necessary to make the new or changed content reachable.

## Assets

- Extract only meaningful Word images.
- Use the repository's existing public/static asset location and path style.
- If no naming rule exists, use lowercase ASCII, digits, and hyphens.
- Preserve important original diagrams when converting them to Mermaid would lose information.
- Check that every new image reference points to an actual repository asset.

## Links and Sources

- Preserve useful source links from the Word document.
- Prefer repository-relative links for internal content.
- Check that navigation and internal links target real files/routes.
- Avoid copying large external copyrighted passages into the site; summarize and link when appropriate.

## Quality Gates

Reuse the target repository's existing **quality gate** commands whenever possible. Typical categories are:

1. Unit or repository tests.
2. Markdown/content lint or validation.
3. Link and asset checks.
4. Static-site **build**.

Do not replace established checks with a weaker custom check. A mandatory check that fails blocks publication until the failure is understood and resolved.

## Git Write Strategy

- Respect branch protection and the repository's normal contribution flow.
- Use a feature branch/PR when the repository requires review, protected-branch checks, or when the change is broad.
- Direct commit to the publication branch only when the repository allows it and the user's current request supports direct publication.
- Avoid unrelated reformatting, mass navigation reordering, or content deletion.

## Deployment Verification

When the request includes publication, verify the relevant **deployment** after the content commit/merge:

- Identify the GitHub Pages or site-deployment workflow.
- Confirm the expected workflow ran for the published commit when the repository uses automation.
- Inspect failure details instead of treating a pushed commit as a deployed site.
- If a live route can be verified through the available tooling, confirm the expected page/route exists.

You **must not claim publication success** merely because files were written or a commit was created. Publication success requires the repository's required checks and deployment verification to succeed.

## Execution Report

Report:

- Confirmed repository.
- Source Word file/title.
- Content paths created or updated.
- Navigation/index changes.
- Quality-gate commands/checks and outcomes.
- Commit or PR reference.
- Deployment state and any unresolved failure.
