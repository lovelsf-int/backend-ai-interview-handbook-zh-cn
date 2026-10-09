import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const read = file => readFileSync(file, 'utf8')

test('start-here offers four distinct reading modes and diagnostic skipping', () => {
  const guide = read('docs/guide/index.md')
  for (const target of ['learning-path.md', 'topic-map.md', 'practice.md', 'archive.md']) {
    assert.ok(guide.includes(target), `missing reader mode: ${target}`)
    assert.ok(existsSync(`docs/guide/${target}`))
  }
  assert.match(guide, /跳过/)
  assert.ok(guide.split('\n').length <= 80, 'start-here must stay short')
})

test('curated routes remain discoverable without making the source snapshot compulsory', () => {
  const config = read('docs/.vitepress/config.mts')
  for (const page of ['topic-map', 'practice', 'archive']) assert.ok(config.includes(`/guide/${page}.md`))
  const path = read('docs/guide/learning-path.md')
  assert.match(path, /诊断/)
  assert.match(path, /跳过/)
  assert.ok(path.split('\n').length <= 100, 'route should not become a full catalog')
})

test('inventory and coverage descriptions no longer repeat superseded counts', () => {
  for (const file of ['README.md', 'SOURCES.md', 'docs/guide/learning-path.md']) {
    assert.doesNotMatch(read(file), /12 份|100 余个/)
  }
  const gap = read('docs/guide/interview-sprint-gap-map.md')
  assert.doesNotMatch(gap, /算法与手写代码 \| 尚无独立模块/)
  assert.match(gap, /\.\.\/algorithms\//)
})

test('documented dev command starts the explicit VitePress dev mode', () => {
  assert.equal(JSON.parse(read('package.json')).scripts['docs:dev'], 'vitepress dev docs')
})

test('AI study regeneration preserves the optional-reading guidance', () => {
  const generator = read('scripts/ai-study/import_ai.py')
  assert.match(generator, /两套不用从头各读一遍/)
  assert.match(generator, /诊断与跳读/)
})
