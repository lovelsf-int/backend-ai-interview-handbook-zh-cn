import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

test('thread programming examples compile and verify ordering, failure, timeout and cleanup', () => {
  const out = mkdtempSync(join(tmpdir(), 'thread-programming-'))
  try {
    const compile = spawnSync('javac', ['--release', '8', '-encoding', 'UTF-8', '-d', out,
      'examples/concurrency/AlternatingPrint.java', 'examples/concurrency/AlternatingPrintTest.java'],
    {encoding: 'utf8', timeout: 60000})
    assert.equal(compile.status, 0, compile.error?.message || compile.stderr)
    const result = spawnSync('java', ['-cp', out, 'AlternatingPrintTest'], {encoding: 'utf8', timeout: 60000})
    assert.equal(result.status, 0, result.error?.message || result.stderr)
    assert.match(result.stdout, /PASS: \d+ assertions/)
    console.log(result.stdout.trim())
  } finally { rmSync(out, {recursive: true, force: true}) }
})

test('thread programming pages expose the tested source regions and navigation', () => {
  const source = readFileSync('examples/concurrency/AlternatingPrint.java', 'utf8')
  const overview = readFileSync('docs/java/thread-programming/index.md', 'utf8')
  const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
  for (const page of ['alternating-abc', 'odd-even']) {
    const doc = readFileSync(`docs/java/thread-programming/${page}.md`, 'utf8')
    assert.ok(overview.includes(`./${page}.md`))
    assert.ok(config.includes(`/java/thread-programming/${page}.md`))
    for (const region of [...doc.matchAll(/AlternatingPrint\.java#(\w+)/g)].map(m => m[1])) {
      assert.ok(source.includes(`// #region ${region}`), `missing snippet ${region}`)
    }
  }
})
