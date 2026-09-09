import test from 'node:test'
import assert from 'node:assert/strict'
import { validateDocument } from '../scripts/lib/content-validator.mjs'

const fm = '---\ntitle: Example\ndescription: Example\nstatus: reviewing\nbaseline: test\nlast_verified: 2026-09-09\nlevel: learning\nsource: test\n---\n\n# Example\n\n'
const run = body => validateDocument(fm + body, 'docs/example.md', new Set(['docs/example.md']))

test('example links inside Markdown code fences are not document dependencies', () => {
  assert.deepEqual(run('```markdown\n[Forms](FORMS.md)\n[Reference](REFERENCE.md)\n[PDF](example.pdf)\n![Image](media/example.png)\n```\n'), [])
})

test('long fences may contain shorter fences without ending the example', () => {
  assert.deepEqual(run('````markdown\n```javascript\n# Example heading\n[Reference](missing.md)\n```\n````\n'), [])
})

test('visible broken links and attachment links still fail at the original line', () => {
  const body = '```markdown\n[Example](FORMS.md)\n```\n\n[Broken](missing.md)\n[PDF](https://example.org/book.pdf)\n![Image](media/example.png)\n'
  const results = run(body)
  assert.equal(results.length, 3)
  for (const [code, marker] of [['missing-local-link','[Broken]'],['attachment-link','[PDF]'],['source-media-image','![Image]']]) {
    const result = results.find(x => x.code === code)
    assert.ok(result)
    assert.equal(result.line, (fm + body).slice(0, (fm + body).indexOf(marker)).split('\n').length)
  }
})
