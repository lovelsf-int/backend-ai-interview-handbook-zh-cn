# Interview Content Standard

Use this only when the target repository does not provide a stricter content structure. Repository-specific style, front matter, naming, and navigation rules always win.

## Default Article Structure

1. **One-sentence conclusion** — answer the core interview question immediately.
2. **90-second interview answer** — a concise spoken answer that a senior candidate can deliver directly.
3. **Core concepts and boundaries** — define terms, assumptions, and conditions where the answer applies.
4. **Internals and full execution path** — explain the mechanism, data flow, important components, and causal chain.
5. **Failure paths and recovery** — cover exceptions, retries, idempotency, compensation, fallback, and recovery where applicable.
6. **Performance, capacity, and monitoring** — include sizing logic, bottlenecks, key metrics, alerting, and operational trade-offs.
7. **P7/P8 follow-ups** — add deeper interviewer questions and short reference answers that expose design trade-offs rather than trivia.
8. **Version differences and sources** — distinguish product versions, defaults, historical behavior, and source status.

## Writing Rules

- Prefer “under these conditions” over universal “best practice” claims.
- Separate product defaults, production recommendations, benchmark starting points, and the user's real project facts.
- Preserve uncertainty explicitly. Do not make an answer sound more certain than the evidence supports.
- Keep one H1 per page unless the target repository defines another convention.
- Use official English technical names where translating them would reduce precision.
- Keep code examples minimal but executable-looking; include failure handling when it is central to the interview point.
- Use tables for real comparison dimensions, not to compress unrelated paragraphs.
- Use Mermaid only when the relationship, sequence, or state transition becomes easier to understand than prose.

## Word-to-Markdown Normalization

- Convert real heading semantics into a clean hierarchy; do not preserve purely visual font-size differences as headings.
- Convert simple tables to Markdown. Split tables with complex merged cells into smaller tables or structured sections.
- Add a language tag to code fences. Use `text` when the language cannot be identified reliably.
- Preserve meaningful diagrams and screenshots. Remove decorative Office artifacts and empty placeholders.
- Keep captions near the resource they describe.
- Preserve source links and citations when they are useful and allowed by the target repository.

## Interview Quality Check

Before publishing, ask whether a senior interviewer could reasonably follow up with “why?”, “what fails?”, “how do you measure it?”, or “what changes at scale?” and find the answer in the page. If not, mark the missing area Major when it is central to the document's purpose.
