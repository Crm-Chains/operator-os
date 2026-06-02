---
name: cross-linker
description: >
  Scans the wiki vault and adds missing [[wikilinks]] between pages that are related but not
  yet connected. Use this skill when the operator says "link my pages", "find missing links",
  "cross-reference the wiki", "connect my wiki", "add wikilinks", or after any large ingest
  to weave new pages into the existing knowledge graph. Also trigger when orphaned pages need
  connecting or when wiki-lint reports fragmented tag clusters. This is a write-heavy skill —
  it modifies page files to insert links, unlike wiki-lint which only reports.
model: sonnet
---

# Cross-Linker — Wiki Cross-Reference Writer

Weaves the wiki's knowledge graph tighter by finding and inserting missing `[[wikilinks]]`
between pages that should reference each other but currently do not.

**Build the page registry in Step 1 by grepping frontmatter only — not full pages.** Reserve
full `Read` calls for pages that are plausible edit candidates. Blind full-vault reads are
exactly what the wiki framework exists to avoid.

## Before You Start

1. Read `wiki/ROUTER.md` — understand the domain map.
2. Read `wiki/wiki/index.md` — full page inventory and one-line descriptions.
3. Read `wiki/log.md` — note recent ingests; focus linking effort on newly added pages.

## Step 1: Build the Page Registry

Glob all `.md` files under `wiki/wiki/` (excluding `_archives/`). For each page, extract
from frontmatter only:

- **Filename** (without `.md`) — the wikilink target
- **Title** from `title:`
- **Aliases** from `aliases:` (if present)
- **Tags** from `tags:`
- **Summary** from `summary:` — used to judge semantic relevance without reading the body

Build a lookup table:
```
page_name → { path, title, aliases, tags, summary }
```

Every entry in this table is a valid wikilink target.

## Step 2: Scan for Missing Links

For each page in the vault:

1. Read the full page body.
2. Extract existing `[[wikilinks]]` — do not re-add any that already appear.
3. Search for **unlinked mentions** — page filenames, titles, or aliases that appear as plain
   text without being wrapped in `[[...]]`.
4. Check for **semantic connections** — pages sharing 2+ tags or in the same category that
   do not link to each other.

### Matching Rules

- Case-insensitive and diacritic-insensitive matching (normalize to base characters before
  comparing, so "Müller" matches a page named "muller").
- Skip self-references — a page must not link to itself.
- Skip common or generic words; only match on distinctive names, concepts, or entities.
- Prefer the shortest unambiguous wikilink path: `[[page-name]]` not `[[full/path/page-name]]`
  when the name is unique across the vault.
- Do not link inside code blocks (` ``` `) or frontmatter.
- Do not add a second `[[foo]]` if one already exists on the page.

## Step 3: Score and Rank Candidates

Not every possible link is worth adding. Score each candidate:

| Signal | Points |
|---|---|
| Exact name or alias match in body text | +4 |
| Shared tags (2 or more) with no existing link | +2 |
| Same category directory, no link | +2 |
| Concept mentioned in body but not linked | +2 |
| Cross-category connection (different knowledge layers) | +2 |
| Peripheral page (≤2 total links) pointing to a hub (≥8 incoming) | +2 |
| Partial name match (plausible but ambiguous) | +1 |

**Confidence labels:**

| Score | Label | Action |
|---|---|---|
| ≥6 | EXTRACTED | Apply; near-certain match |
| 3–5 | INFERRED | Apply; include in report for operator review |
| 1–2 | AMBIGUOUS | Skip unless operator explicitly requested loose linking |

## Step 4: Apply Links

Process only EXTRACTED and INFERRED candidates.

### 4a: Inline linking (preferred)

Wrap the first natural mention of the term in the body text:

```markdown
<!-- Before -->
This page covers knowledge graphs as the core data structure.

<!-- After -->
This page covers [[concepts/knowledge-graphs|knowledge graphs]] as the core data structure.
```

Use `[[path|display text]]` when the path differs from the display text. Link only the
**first** occurrence on the page — not every occurrence.

### 4b: Related section (fallback)

When no natural inline mention exists but the pages are semantically related, add or append
to a `## Related` section at the bottom of the page:

```markdown
## Related

- [[concepts/knowledge-graphs]] — Core data structure used by this approach
- [[entities/project-x]] — Applied this technique in a production context
```

If a `## Related` section already exists, append to it without duplicating entries.

## Step 5: Report

```markdown
## Cross-Link Report

### Links Added: 23 across 12 pages

| Page | Links Added | Confidence | Type |
|---|---|---|---|
| `concepts/decision-records.md` | 3 | EXTRACTED | 2 inline, 1 related |
| `entities/tool-y.md` | 2 | INFERRED | 1 inline, 1 related |

### Orphan Pages Remaining: 2
- `references/foo.md` — no related pages found; tag as `orphan` via wiki-lint
- `concepts/bar.md` — could not resolve; needs operator review

### Pages Skipped: 3
- `index.md`, `log.md` — administrative files; not edit targets
- `_archives/*` — frozen snapshots; never modified
```

## Step 6: Update Log

Append to `wiki/log.md`:
```
- [TIMESTAMP] CROSS_LINK pages_scanned=N links_added=M pages_modified=P orphans_remaining=Q
```

## Tips

- Run after every ingest. New pages are almost always under-connected.
- Link the first mention only — not every occurrence.
- Do not touch pages in `_archives/`. Those are frozen.
- Entity and concept pages are link magnets — prioritize them when deciding where to add
  incoming links.
- If the operator requests cross-linking targeted at a specific tag (e.g. triggered by
  wiki-lint's Check 8), restrict Step 2 to pages sharing that tag; apply Step 3–4 normally.
