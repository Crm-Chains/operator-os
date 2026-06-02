---
title: Meta - About This Wiki
type: meta
tags: [meta, knowledge-management, framework]
aliases: [About the Wiki, Wiki Overview, How This Works]
summary: Explains what this wiki is, how the ingest-query-lint loop works, and the principles that keep it trustworthy.
updated: 2026-06-01
deprecated: false
disputed: []
---

# About This Wiki

This wiki is the **Context layer** of the operator OS — a persistent, structured knowledge base maintained by Claude that survives across sessions, accumulates over time, and is queryable on demand.

The core insight: an AI agent with no persistent memory re-derives everything from the conversation context every session. This is wasteful, inconsistent, and fragile. The wiki is the fix.

---

## What lives here

Every piece of knowledge the operator cares about:
- Domain concepts, frameworks, and decisions
- Summaries of ingested research and sources
- Filed answers to non-trivial questions
- Tag vocabulary and schema governance

What does NOT live here:
- Raw source material → lives in `wiki/raw/` (immutable)
- Credentials or secrets → never in the wiki, ever
- Execution state, active task tracking → lives in project repos and issue trackers

---

## The ingest-query-lint loop

```
Raw source
   │
   ▼
INGEST (/wiki-ingest)     ← capture + distill into a structured page
   │
   ▼
TAG (/tag-taxonomy)        ← apply controlled vocabulary; add frontmatter
   │
   ▼
LINT (/wiki-lint)          ← check health: broken links, stale dates, drift
   │
   ▼
QUERY (/wiki-query)        ← agents and operators retrieve knowledge on demand
        ↑
        └── maintenance loop keeps the pipeline healthy over time
```

See [[Meta - Index]] for what is currently in the vault. See `wiki/schema/governance.md` for the maintenance cadence.

---

## How agents use this wiki

1. Read `wiki/ROUTER.md` first — it maps knowledge needs to specific pages.
2. Load only the pages named by the router — never scan the full vault.
3. Synthesize answers from those pages, citing `[[Page Title]]` links.
4. If the answer is non-trivial and reusable, file it as a synthesis page.

This tiered retrieval pattern — router → targeted pages — keeps token usage low and results accurate.

---

## Design principles

**Route first.** The router is the first read, not the last resort.

**Distill, don't dump.** Every ingested source produces a structured page with frontmatter, summary, and cross-links. Raw pastes are not wiki pages.

**Tags are contracts.** Tags come from a controlled vocabulary (`schema/tags.md`). Untagged pages are invisible to agents routing by taxonomy.

**Contradictions are first-class.** When pages conflict, the conflict is noted with `disputed:` frontmatter and documented in the body. The wiki does not paper over contradictions.

**Deprecated, not deleted.** Superseded pages get `deprecated: true` and a deprecation note. They stay in the vault as audit history.

**Weekly lint.** A wiki that is never linted drifts. Stale pages with old `updated:` dates mislead agents.

---

## Related

- `wiki/CLAUDE.md` — gateway for all wiki operations (INGEST / QUERY / LINT)
- `wiki/ROUTER.md` — task-dispatch table; the first thing to read before any query
- `wiki/schema/` — the deterministic schema governing page structure and vocabulary
- `docs/protocols/persistent-knowledge.md` — the protocol that defines this system
