# Wiki — Gateway

The wiki is the **Context** layer of the OS. Raw sources go in; structured, queryable knowledge comes out. This file is the entry point for all wiki operations. Load it first, then dispatch to the specific schema file for your operation.

## Directory layout

```
wiki/
├── CLAUDE.md          ← this file — gateway for all wiki ops
├── ROUTER.md          ← task-dispatch table (need → file or skill)
├── schema/            ← load on demand; never preload all
│   ├── naming.md      ← file + page naming rules
│   ├── page-types.md  ← allowed page types + required frontmatter
│   ├── frontmatter.md ← frontmatter schema reference
│   ├── governance.md  ← maintenance loop + health rules
│   └── tags.md        ← controlled tag vocabulary
├── raw/               ← ingestion staging area (source material, immutable)
└── wiki/              ← distilled pages (agent-maintained)
    ├── _meta/         ← vault index, governance pages
    ├── concepts/      ← ideas, frameworks, domain knowledge
    ├── sources/       ← one summary page per ingested source
    └── syntheses/     ← analyses, Q&A, decisions, postmortems
```

## The three operations

### INGEST — raw source → distilled page

Trigger: new source material arrives (URL, doc, transcript, notes).

Steps:
1. Place source material in `wiki/raw/` (immutable — never edit raw files).
2. Read the source in full.
3. Write `wiki/wiki/sources/<slug>.md` — summary, key claims, evidence.
4. Create or update relevant `concepts/` and `syntheses/` pages that the source touches.
5. Apply tags from the controlled vocabulary (`schema/tags.md`).
6. Add required frontmatter (`schema/frontmatter.md`).
7. Update `wiki/wiki/_meta/index.md` — add the new page entry.
8. Report: pages created, pages updated, contradictions flagged.

Schema dispatch: `schema/naming.md` → `schema/frontmatter.md` → `schema/page-types.md`
Skill: `/wiki-ingest <path>`

---

### QUERY — answer a question from wiki pages

Trigger: agent or operator needs to retrieve knowledge.

Steps:
1. Read `wiki/ROUTER.md` to identify the relevant section or pages.
2. Read only the targeted pages — do not scan the full vault.
3. Synthesize an answer with citations (link to wiki pages).
4. If the answer is non-trivial and reusable, offer to file it as `wiki/wiki/syntheses/<slug>.md`.

Schema dispatch: `wiki/ROUTER.md` only — no schema files needed for a standard query.
Skill: `/wiki-query <question>`

---

### LINT — health and consistency check

Trigger: weekly cadence, before any major query session, or after structural changes.

Check for:
- Pages missing required frontmatter fields
- `summary:` that has drifted more than ~50 chars from the page body
- Orphan pages (no inbound `[[links]]`) — tag them `orphan`
- Broken or unresolved `[[wikilinks]]`
- Pages with `updated:` older than 90 days — flag as stale
- Concepts mentioned in 3+ pages but lacking their own page
- Deprecated pages still linked from active pages
- Contradictions between pages — add `disputed:` frontmatter

Lint must fix deterministic issues (missing fields, broken links) directly. Flag ambiguous issues for operator review. Run `cross-linker` after lint to insert missing `[[links]]`.

Schema dispatch: `schema/governance.md` + `schema/frontmatter.md`
Skill: `/wiki-lint`

---

## Dispatch table

| Operation | Schema files to load | Skill |
|-----------|---------------------|-------|
| INGEST | `naming.md` + `frontmatter.md` + `page-types.md` | `/wiki-ingest` |
| QUERY | `ROUTER.md` only | `/wiki-query` |
| LINT | `governance.md` + `frontmatter.md` | `/wiki-lint` |
| New page (manual) | `page-types.md` + `naming.md` + `frontmatter.md` | — |
| Tag normalization | `tags.md` | `/tag-taxonomy` |
| Full vault rebuild | all schema files | `/wiki-rebuild` |
| Health dashboard | — | `/wiki-status` |

## Rules

- Load schema files on demand. Never preload all of `schema/` at once.
- Read `ROUTER.md` before any query — it directs you to the right pages.
- INGEST without DISTILL produces noise, not knowledge. Always write a structured page.
- Tag every page before it leaves the ingest stage.
- Never run a recursive vault scan in main context — spawn a subagent.
