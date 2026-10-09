import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Offline documentation-contract checks only. These do not execute Elasticsearch,
// validate an ES version, measure ANN recall, or prove runtime authorization.
// Regressions detected: a missing shared ACL/tenant/type/policy constraint, a
// size=10 response sent to a purported 50-candidate reranker, or invalid JSON.
const source = readFileSync('docs/system-design/soc-agent.md', 'utf8')
const anchor = '<a id="soc-rag-filter-contract"></a>'
assert.ok(source.includes(anchor), 'the SOC RAG contract anchor must exist')
const section = source.slice(source.indexOf(anchor))
const jsonBlock = section.match(/```json\n([\s\S]*?)\n```/)
assert.ok(jsonBlock, 'the contract must contain a fenced JSON request template')
const request = JSON.parse(jsonBlock[1])
const rrf = request.retriever?.rrf

// This intentionally small fixture interpreter covers only the predicates used
// by this teaching example. Unsupported operators fail instead of being ignored.
// It is not an Elasticsearch query engine or a replacement for integration tests.
function fixtureMatches(query, document) {
  assert.equal(Object.keys(query).length, 1, 'one supported predicate per object')
  if ('term' in query) {
    return Object.entries(query.term).every(([field, value]) => {
      const actual = document[field]
      return Array.isArray(actual) ? actual.includes(value) : actual === value
    })
  }
  if ('terms' in query) {
    return Object.entries(query.terms).every(([field, allowed]) => {
      const actual = document[field]
      const values = Array.isArray(actual) ? actual : [actual]
      return values.some(value => allowed.includes(value))
    })
  }
  if ('exists' in query) {
    const value = document[query.exists.field]
    return value !== undefined && value !== null && (!Array.isArray(value) || value.length > 0)
  }
  if ('range' in query) {
    return Object.entries(query.range).every(([field, bounds]) => {
      if (document[field] === undefined) return false
      const actual = Date.parse(document[field])
      assert.ok(Number.isFinite(actual), 'date fixture must be parseable')
      return Object.entries(bounds).every(([operator, value]) => {
        const limit = Date.parse(value)
        assert.ok(Number.isFinite(limit), 'date bound must be parseable')
        if (operator === 'lte') return actual <= limit
        if (operator === 'gt') return actual > limit
        assert.fail(`unsupported fixture range operator: ${operator}`)
      })
    })
  }
  if ('bool' in query) {
    const bool = query.bool
    for (const key of Object.keys(bool)) {
      assert.ok(['filter', 'must_not', 'should', 'minimum_should_match'].includes(key),
        `unsupported fixture bool clause: ${key}`)
    }
    const filters = bool.filter ?? []
    const exclusions = bool.must_not ?? []
    const alternatives = bool.should ?? []
    // Require explicit OR cardinality rather than guessing versioned DSL defaults.
    if (alternatives.length) assert.equal(bool.minimum_should_match, 1)
    return filters.every(clause => fixtureMatches(clause, document)) &&
      exclusions.every(clause => !fixtureMatches(clause, document)) &&
      alternatives.filter(clause => fixtureMatches(clause, document)).length >=
        (bool.minimum_should_match ?? 0)
  }
  assert.fail(`unsupported fixture predicate: ${Object.keys(query)[0]}`)
}

function allowedBySharedFilter(document, filters = rrf.filter) {
  assert.ok(Array.isArray(filters) && filters.length > 0, 'a mandatory shared filter is required')
  return filters.every(clause => fixtureMatches(clause, document))
}

const policy = {
  tenant_id: 'T1',
  acl_tags: ['group:soc-l1'],
  doc_type: 'policy',
  status: 'published',
  effective_from: '2026-08-01T00:00:00Z'
}

const fixtures = [
  { name: 'allows an authorized effective policy without an expiry', patch: {}, expected: true },
  { name: 'denies a different tenant', patch: { tenant_id: 'T2' }, expected: false },
  { name: 'denies another ACL within the same tenant', patch: { acl_tags: ['group:finance'] }, expected: false },
  { name: 'denies a document type outside the allowlist', patch: { doc_type: 'mail-raw' }, expected: false },
  { name: 'denies an unpublished draft', patch: { status: 'draft' }, expected: false },
  { name: 'denies a policy not effective at the event time', patch: { effective_from: '2026-10-01T00:00:00Z' }, expected: false },
  { name: 'denies a policy expired before the event time', patch: { effective_to: '2026-08-31T23:59:59Z' }, expected: false },
  { name: 'does not apply policy dates to an authorized case', patch: { doc_type: 'case', effective_from: '2026-10-01T00:00:00Z' }, expected: true },
  ...['tenant_id', 'acl_tags', 'doc_type', 'status', 'effective_from'].map(field => ({
    name: `denies a policy missing ${field}`, omit: field, expected: false
  }))
]

test('SOC RAG JSON template exposes one shared filter to both retrieval branches (static only)', () => {
  assert.ok(rrf)
  assert.ok(Array.isArray(rrf.filter) && rrf.filter.length > 0)
  assert.equal(rrf.retrievers.length, 2)
  assert.ok(rrf.retrievers[0].standard?.query?.multi_match)
  assert.equal(rrf.retrievers[1].knn?.field, 'embedding')
  assert.deepEqual(rrf.retrievers[1].knn.query_vector, [])
  assert.match(section, /必须将 query_vector 的空数组替换为实际 BGE-M3 1024 维浮点向量/)
  assert.equal(rrf.retrievers[0].standard.filter, undefined)
  assert.equal(rrf.retrievers[1].knn.filter, undefined)
})

test('SOC RAG response size supports the documented external rerank window (static only)', () => {
  const knn = rrf.retrievers[1].knn
  assert.equal(request.size, 50)
  assert.equal(rrf.rank_window_size, 80)
  assert.equal(rrf.rank_constant, 30)
  assert.equal(knn.k, 50)
  assert.equal(knn.num_candidates, 200)
  assert.ok(rrf.rank_window_size >= request.size)
  assert.ok(knn.num_candidates >= knn.k)
  assert.match(section, /size=50 返回最多 50 条候选/)
})

for (const fixture of fixtures) {
  test(`SOC RAG offline filter fixture: ${fixture.name}`, () => {
    const document = { ...policy, ...fixture.patch }
    if (fixture.omit) delete document[fixture.omit]
    assert.equal(allowedBySharedFilter(document), fixture.expected)
  })
}

test('SOC RAG fixture detects the old tenant-only filter regression', () => {
  const tenantOnly = [{ term: { tenant_id: 'T1' } }]
  const deniedDocument = { ...policy, acl_tags: ['group:finance'] }
  assert.equal(allowedBySharedFilter(deniedDocument, tenantOnly), true)
  assert.equal(allowedBySharedFilter(deniedDocument), false)
})

test('SOC RAG fixture interpreter rejects unsupported predicates', () => {
  assert.throws(() => fixtureMatches({ unknown_predicate: {} }, policy), /unsupported fixture predicate/)
})
