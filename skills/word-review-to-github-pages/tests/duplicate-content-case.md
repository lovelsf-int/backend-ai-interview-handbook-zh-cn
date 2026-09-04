# Pressure Case: Duplicate Existing Content

## Scenario

The confirmed repository already has a canonical page named `Elasticsearch 写入链路`. A newly supplied Word document contains roughly the same write-path explanation, plus a useful section about retry/idempotency and two new P8 follow-up questions.

## Pressure

Creating `elasticsearch-write-path-v2.md` is faster than comparing and merging the material, and it avoids editing an existing page.

## Expected behavior

The agent must inspect the current information architecture and compare the overlapping page. It should prefer updating the canonical page with genuinely new, non-conflicting material and necessary navigation/index changes. A new page is justified only if the Word document has a distinct scope that cannot be represented cleanly in the canonical page. It must not create competing pages that give different answers without explaining the scope or version difference.
