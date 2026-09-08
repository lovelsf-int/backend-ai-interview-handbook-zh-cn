import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = new URL('../', import.meta.url)
const read = p => readFileSync(new URL(p, root), 'utf8')
const sourcePath = new URL('examples/algorithms/InterviewAlgorithms.java', root)

test('algorithm module exposes 16 substantive pages and valid snippet regions', () => {
  assert.ok(existsSync(sourcePath), 'missing tested Java solution source')
  const source = readFileSync(sourcePath, 'utf8')
  const dir = new URL('docs/algorithms/', root)
  const pages = readdirSync(dir).filter(p => p.endsWith('.md'))
  assert.equal(pages.length, 16)
  const regions = new Set([...source.matchAll(/\/\/ #region (\w+)/g)].map(m => m[1]))
  assert.equal(regions.size, 37) // 36 solutions plus node definitions
  const seen = new Set()
  for (const page of pages) {
    const text = read(`docs/algorithms/${page}`)
    for (const key of ['title', 'description', 'status', 'baseline', 'last_verified', 'level', 'source']) {
      assert.match(text, new RegExp(`^${key}: .+`, 'm'), `${page}: missing ${key}`)
    }
    const prose = text.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '')
    assert.equal((prose.match(/^# /gm) || []).length, 1, `${page}: one H1`)
    for (const match of text.matchAll(/<<< @\/\.\.\/examples\/algorithms\/InterviewAlgorithms\.java#(\w+)/g)) {
      assert.ok(regions.has(match[1]), `${page}: unknown region ${match[1]}`)
      seen.add(match[1])
    }
  }
  assert.deepEqual([...seen].sort(), [...regions].sort(), 'every tested region should be visible')
  const index = read('docs/algorithms/index.md')
  for (const page of pages.filter(p => p !== 'index.md')) assert.ok(index.includes(`./${page}`), `index missing ${page}`)
  const bank = read('docs/algorithms/13-question-bank.md')
  const ids = [...bank.matchAll(/^\| (\d+) \|/gm)].map(m => m[1])
  assert.equal(ids.length, 80)
  assert.equal(new Set(ids).size, 80, 'problem IDs must be unique')
})

test('Java solutions compile with Java 8 APIs and pass deterministic regressions', () => {
  assert.ok(existsSync(sourcePath), 'missing Java source')
  const out = mkdtempSync(join(tmpdir(), 'interview-algorithms-'))
  try {
    const compiler = spawnSync('javac', ['--release', '8', '-encoding', 'UTF-8', '-d', out,
      sourcePath.pathname, new URL('examples/algorithms/InterviewAlgorithmsTest.java', root).pathname], {encoding: 'utf8', timeout: 60000})
    assert.equal(compiler.status, 0, compiler.error?.message || compiler.stderr)
    const result = spawnSync('java', ['-cp', out, 'InterviewAlgorithmsTest'], {encoding: 'utf8', timeout: 60000})
    assert.equal(result.status, 0, result.error?.message || result.stderr)
    assert.match(result.stdout, /PASS: \d+ assertions/)
    console.log(result.stdout.trim())
  } finally { rmSync(out, {recursive: true, force: true}) }
})
