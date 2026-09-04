# Review Rubric

Use this rubric before restructuring or publishing a Word document.

## Severity

### Blocker

Publication must stop until resolved.

Typical cases:

- A core technical conclusion is materially wrong.
- The document exposes credentials, tokens, secrets, internal endpoints, personal data, or other information that should not be public.
- A required source, image, table, or code sample is corrupted so badly that the meaning cannot be recovered safely.
- A conflict changes the central claim and cannot be resolved from reliable evidence.

### Major

The document needs correction, clarification, or explicit confirmation before the affected claim is published as fact.

Typical cases:

- Important architecture, consistency, transaction, concurrency, reliability, or version semantics are incomplete or misleading.
- Key performance/capacity numbers conflict with another source.
- A project fact conflict exists between the Word document and another user-provided or repository source.
- The content is so duplicated that creating a second page would make the knowledge base inconsistent.

### Minor

Safe editorial improvements that do not change meaning.

Examples include heading hierarchy, terminology normalization, repeated wording, table cleanup, code-fence language labels, and link formatting.

## Technical Review Checklist

Check at least these dimensions:

1. Technical correctness and causal reasoning.
2. Product/version boundaries and whether defaults are presented as universal truths.
3. Consistency semantics: synchronous/asynchronous, strong/eventual consistency, at-least-once/at-most-once/exactly-once.
4. Failure paths, recovery, idempotency, retry, timeout, compensation, and observability where relevant.
5. Capacity math, units, replica/primary distinctions, QPS/TPS/latency definitions, and assumptions.
6. Code, SQL, configuration, API names, and command plausibility.
7. Internal consistency across diagrams, prose, tables, examples, and metrics.
8. Public-safety review for secrets and information unsuitable for a public Pages site.

## Fact Boundary

### Public technical facts

When reliable evidence is available, correct public technical facts directly. Examples include documented Java/JVM behavior, database semantics, framework behavior, formulas, Markdown rules, and static-site build behavior.

Record meaningful corrections in the final review summary.

### User or project facts

Treat real project metrics and personal/work-history claims as user-owned facts. This includes QPS, DAU, storage volume, latency, node counts, shard counts, region topology, business outcomes, responsibilities, and company/project details.

When these conflict:

- Label the issue `Major: project fact conflict`.
- Preserve the competing values and where each came from.
- **Do not guess** which value is correct.
- **Require user confirmation** before publishing the disputed value as a settled fact.
- Do not silently normalize, average, round, or choose the value that makes the architecture look better.

## Duplicate and Conflict Handling

Before creating a new page, compare the document with nearby repository content. Prefer, in order:

1. Merge useful new material into the canonical page.
2. Replace an obsolete section when the new source is clearly authoritative.
3. Add a narrowly scoped new page when the topic is genuinely distinct.

Do not create competing pages that state different answers to the same interview question without explaining the version or scope difference.
