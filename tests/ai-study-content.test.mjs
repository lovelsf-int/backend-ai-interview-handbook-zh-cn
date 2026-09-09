import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8')
const exists = file => existsSync(new URL('../' + file, import.meta.url))

test('AI study snapshot contains all 32 articles and 6 guides with source provenance', () => {
  const catalog = JSON.parse(read('scripts/ai-study/catalog.json'))
  const manifest = JSON.parse(read('docs/public/ai-study-manifest.json'))
  assert.equal(manifest.source_commit, catalog.source_commit)
  assert.equal(manifest.pages.length, 38)
  assert.equal(manifest.pages.filter(p => p.kind === 'article').length, 32)
  assert.equal(manifest.pages.filter(p => p.kind === 'guide').length, 6)
  const expected = new Map([...catalog.articles.map(c => [c.file, c.sha]), ...catalog.guides.map(c => [c[0], c[1]])])
  assert.equal(new Set(manifest.pages.map(p => p.source_file)).size, 38)
  for (const page of manifest.pages) {
    assert.equal(expected.get(page.source_file), page.source_blob)
    const content = read('docs/ai-study/java-guide/' + page.target)
    assert.equal(createHash('sha256').update(content).digest('hex'), page.output_sha256)
    assert.ok(content.includes(page.source_blob) && content.includes(page.source_commit))
    assert.ok(content.includes('{#source-body}'))
    assert.ok(page.body_characters > 400)
    assert.ok(content.includes('status: "reviewing"'))
  }
})

test('every AI learning article has three collapsed self-tests and a distinct practice task', () => {
  const catalog = JSON.parse(read('scripts/ai-study/catalog.json'))
  assert.equal(catalog.articles.reduce((n, c) => n + c.qa.length, 0), 96)
  assert.equal(new Set(catalog.articles.map(c => c.exercise)).size, 32)
  for (const card of catalog.articles) {
    const content = read('docs/ai-study/java-guide/' + card.file).split('## JavaGuide 正文学习')[0]
    assert.equal((content.match(/<details>/g) || []).length, 3)
    assert.ok(content.includes(card.exercise))
    assert.ok(content.includes('/ai-agent/' + card.related))
    assert.ok(exists('docs/ai-agent/' + card.related))
  }
})

test('AI learning routes, review guide and third-party license remain available', () => {
  for (const name of ['index','learning-path','review','coverage','version-notes','sources']) {
    assert.ok(exists('docs/ai-study/' + name + '.md'))
  }
  assert.ok(read('docs/.vitepress/config.mts').includes("'/ai-study/': aiStudySidebar"))
  assert.ok(read('docs/ai-agent/index.md').includes('/ai-study/'))
  assert.equal(read('LICENSES/JavaGuide-Apache-2.0.txt'), read('docs/public/licenses/javaguide-apache-2.0.txt'))
  assert.ok(read('THIRD_PARTY_NOTICES.md').includes('JavaGuide'))
})
