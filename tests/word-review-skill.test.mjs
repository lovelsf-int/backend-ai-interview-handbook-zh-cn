import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const skillRoot = 'skills/word-review-to-github-pages'
const skillPath = `${skillRoot}/SKILL.md`

const requiredReferenceFiles = [
  `${skillRoot}/references/review-rubric.md`,
  `${skillRoot}/references/interview-content-standard.md`,
  `${skillRoot}/references/github-pages-rules.md`
]

const requiredPressureCases = [
  `${skillRoot}/tests/repository-confirmation-case.md`,
  `${skillRoot}/tests/technical-error-case.md`,
  `${skillRoot}/tests/conflicting-project-data-case.md`,
  `${skillRoot}/tests/duplicate-content-case.md`,
  `${skillRoot}/tests/malformed-word-structure-case.md`
]

function readRequired(file) {
  assert.equal(existsSync(file), true, `missing required skill file: ${file}`)
  return readFileSync(file, 'utf8')
}

test('word review skill exposes the approved discovery metadata', () => {
  const skill = readRequired(skillPath)

  assert.match(skill, /^---\nname: word-review-to-github-pages\n/)
  assert.match(
    skill,
    /description: Use when a user provides a Word document and wants its content reviewed, reorganized, or published into a GitHub Pages documentation repository\./
  )
})

test('every execution requires a fresh target repository confirmation before repository work', () => {
  const skill = readRequired(skillPath)

  for (const expected of [
    'every execution',
    'owner/repo',
    'previous execution',
    'Do not reuse',
    'before reading or writing the target repository'
  ]) {
    assert.match(skill, new RegExp(expected, 'i'))
  }
})

test('project facts are never invented or silently normalized when sources conflict', () => {
  const skill = readRequired(skillPath)
  const rubric = readRequired(`${skillRoot}/references/review-rubric.md`)

  for (const expected of [
    'project fact conflict',
    'do not guess',
    'require user confirmation'
  ]) {
    assert.match(`${skill}\n${rubric}`, new RegExp(expected, 'i'))
  }
})

test('skill delegates detailed rules to the required reference files', () => {
  const skill = readRequired(skillPath)

  for (const file of requiredReferenceFiles) {
    readRequired(file)
    const relativeName = file.split('/references/')[1]
    assert.match(skill, new RegExp(relativeName.replaceAll('.', '\\.')))
  }
})

test('pressure scenarios cover the five approved failure modes', () => {
  for (const file of requiredPressureCases) {
    const content = readRequired(file)
    assert.match(content, /Expected behavior/i)
  }
})

test('publication requires repository quality gates and deployment verification', () => {
  const skill = readRequired(skillPath)
  const pagesRules = readRequired(`${skillRoot}/references/github-pages-rules.md`)
  const combined = `${skill}\n${pagesRules}`

  for (const expected of [
    'quality gate',
    'build',
    'deployment',
    'must not claim.*success'
  ]) {
    assert.match(combined, new RegExp(expected, 'i'))
  }
})
