import test from 'node:test'
import assert from 'node:assert/strict'

import { validateDocument } from '../scripts/lib/content-validator.mjs'

const validFrontMatter = `---
title: 示例页面
description: 用于测试内容校验器
status: reviewing
baseline: source snapshot
last_verified: 2026-09-01
level: P7/P8
source: 自有资料
---`

test('requires front matter on domain content pages', () => {
  const issues = validateDocument('# 标题\n', 'docs/kafka/core.md', new Set())
  assert.deepEqual(issues.map(issue => issue.code), ['frontmatter-missing'])
})

test('rejects multiple H1 headings and source attachment links', () => {
  const markdown = `${validFrontMatter}
# 示例
# 示例二
[原始附件](./source.docx)
`

  const codes = validateDocument(markdown, 'docs/kafka/core.md', new Set())
    .map(issue => issue.code)

  assert.deepEqual(codes, ['multiple-h1', 'attachment-link'])
})

test('reports a missing relative Markdown target', () => {
  const markdown = `${validFrontMatter}
# 示例
[下一章](./missing.md)
`

  const issues = validateDocument(
    markdown,
    'docs/kafka/core.md',
    new Set(['docs/kafka/core.md'])
  )

  assert.deepEqual(issues.map(issue => issue.code), ['missing-local-link'])
})

test('accepts a complete document with an existing relative link', () => {
  const markdown = `${validFrontMatter}
# 示例
## 核心结论
[下一章](./next.md#面试回答)
`

  const issues = validateDocument(
    markdown,
    'docs/kafka/core.md',
    new Set(['docs/kafka/core.md', 'docs/kafka/next.md'])
  )

  assert.deepEqual(issues, [])
})

test('allows a VitePress home layout to generate the page H1', () => {
  const markdown = `---
layout: home
title: 首页
description: 首页描述
status: reviewing
baseline: site architecture v1
last_verified: 2026-09-01
level: P7/P8
source: 自有资料
---
`

  const issues = validateDocument(markdown, 'docs/index.md', new Set(['docs/index.md']))

  assert.deepEqual(issues, [])
})

test('rejects Pandoc source-media image references', () => {
  const markdown = `${validFrontMatter}
# 示例
<img src="media/rId27.png" alt="源文档图片" />
`

  const issues = validateDocument(markdown, 'docs/payment/core.md', new Set())

  assert.deepEqual(issues.map(issue => issue.code), ['source-media-image'])
})

test('rejects Pandoc raw HTML table wrappers', () => {
  const markdown = `${validFrontMatter}
# 示例
<table><tbody><tr><td>应转换为 Markdown</td></tr></tbody></table>
`

  const issues = validateDocument(markdown, 'docs/payment/core.md', new Set())

  assert.deepEqual(issues.map(issue => issue.code), ['pandoc-html-table'])
})
