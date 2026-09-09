import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('project pages surface performance, reliability and extensibility before deep dives', () => {
  for (const name of ['soc-agent', 'overseas-payment', 'global-subscription', 'transport-safety', 'spec-driven-ai-coding']) {
    const body = readFileSync(`docs/system-design/${name}.md`, 'utf8')
    const intro = body.slice(0, 6500)
    assert.ok(intro.includes('{#quality-design}'), name)
    assert.ok(intro.includes('./project-quality-attributes.md'), name)
    for (const term of ['高性能', '高可靠', '高扩展性', '验证']) {
      assert.ok(intro.includes(term), `${name}: missing ${term}`)
    }
  }
})

test('quality framework is linked and defines measurable architecture boundaries', () => {
  const doc = readFileSync('docs/system-design/project-quality-attributes.md', 'utf8')
  for (const term of ['教学假设', 'RPO', 'RTO', 'SLO', 'UNKNOWN', '功能演进', '证据']) assert.ok(doc.includes(term), term)
  assert.ok(readFileSync('docs/.vitepress/config.mts', 'utf8').includes('/system-design/project-quality-attributes.md'))
  assert.ok(readFileSync('docs/system-design/index.md', 'utf8').includes('./project-quality-attributes.md'))
})
