import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const chapter = 'docs/spring/08-spring-boot-startup-auto-configuration.md'
const read = path => readFileSync(new URL(path, root), 'utf8')

test('Spring Boot chapter contains 40 answered questions with stable anchors', () => {
  assert.ok(existsSync(new URL(chapter, root)), 'Spring Boot chapter is missing')
  const text = read(chapter)
  const sections = [...text.matchAll(/^### Q(\d{2})\. (.+) \{#boot-q\d{2}\}\n([\s\S]*?)(?=^### Q\d{2}\.|^## |$(?![\s\S]))/gm)]
  assert.deepEqual(sections.map(m => Number(m[1])), Array.from({length: 40}, (_, i) => i + 1))
  for (const [, number, title, body] of sections) {
    assert.ok(title.length > 5, `Q${number}: meaningful title`)
    assert.match(body, /\*\*标准回答：\*\*/, `Q${number}: answer`)
    assert.match(body, /\*\*追问与边界：\*\*/, `Q${number}: follow-up`)
    assert.ok(body.length > 100, `Q${number}: substantive explanation`)
  }
})

test('Spring Boot chapter records official sources and critical version boundaries', () => {
  const text = read(chapter)
  for (const key of ['title', 'description', 'status', 'baseline', 'last_verified', 'level', 'source']) {
    assert.match(text, new RegExp(`^${key}: .+`, 'm'))
  }
  const prose = text.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '')
  assert.equal((prose.match(/^# /gm) || []).length, 1)
  for (const term of ['AutoConfiguration.imports', 'spring.factories', '2.7', '3.5', '4.0',
    'ApplicationReadyEvent', 'ApplicationContextRunner', 'RANDOM_PORT', 'liveness', 'readiness',
    'spring.config.additional-location', 'spring.lifecycle.timeout-per-shutdown-phase',
    'spring.threads.virtual.enabled', 'SecurityFilterChain', '配置片段', 'Outbox']) {
    assert.ok(text.includes(term), `missing boundary: ${term}`)
  }
  const sources = [...text.matchAll(/^\[S\d+\]: (https:\/\/\S+)/gm)].map(m => m[1])
  assert.ok(sources.length >= 15, 'official reference coverage')
  for (const url of sources) {
    assert.match(url, /^https:\/\/(docs\.spring\.io\/|github\.com\/spring-projects\/|kubernetes\.io\/|openjdk\.org\/|bugs\.openjdk\.org\/)/)
  }
  assert.ok(!text.includes('exposure.include=*'), 'do not offer expose-all configuration')
})

test('existing Spring navigation retains the Boot route and its expanded scope', () => {
  const index = read('docs/spring/index.md')
  assert.ok(index.includes('./08-spring-boot-startup-auto-configuration.md'))
  assert.ok(index.includes('40 道必知问题'))
  assert.ok(index.includes('./13-interview-question-bank.md'), 'retain the existing Spring question bank')
})
