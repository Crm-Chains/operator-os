# Schema — Frontmatter

All wiki pages share a common frontmatter schema. Every field listed as **required** must be present. Optional fields should be included when applicable.

## Full schema

```yaml
---
title: Prefix - Human Readable Title    # required — unique; matches filename exactly
type: concept | source | synthesis | meta  # required — see page-types.md
subtype: decision | postmortem | blueprint | learning  # optional — see page-types.md
tags: [tag-one, tag-two]               # required — from controlled vocabulary in tags.md
aliases: [alt-name, acronym]           # optional — enables fuzzy [[wikilink]] resolution
summary: ≤200-char one-sentence preview  # required — what an agent reads first when routing
updated: YYYY-MM-DD                    # required — staleness detection targets this field
links: [slug-a, slug-b]               # optional — explicit cross-references (supplement [[wikilinks]])
source-url: https://...               # required for source pages; omit for others
source-path: wiki/raw/...             # alternative to source-url for local files
deprecated: false                     # required — always include; do not omit
disputed: []                          # required — list slugs of conflicting pages when disputed
---
```

## Field rules

**`title`**
Must match the filename character-for-character (minus `.md`). Title case. Unique across the vault.

**`type`**
Exactly one of: `concept`, `source`, `synthesis`, `meta`. See `page-types.md` for when to use each.

**`tags`**
At least one tag. All tags must exist in `schema/tags.md`. Do not invent ad-hoc tags — extend the taxonomy first.

**`aliases`**
Populate with alternate names, acronyms, or shortenings. Obsidian resolves `[[Alias]]` to the page. Empty list `[]` is acceptable when there are no natural alternates.

**`summary`**
One sentence, ≤200 chars. Written at create time. Recomputed by `wiki-lint` when it drifts from the page body. Used by tiered retrieval (agents read frontmatter before opening pages). Keep it factual.

**`updated`**
ISO date (`YYYY-MM-DD`). Set at create time; update whenever the page body changes meaningfully. Pages with `updated:` older than 90 days are flagged stale by lint.

**`deprecated`**
Always present. Default: `false`. Set to `true` when a page is superseded. Never delete deprecated pages.

**`disputed`**
Always present. Default: `[]`. When two sources contradict, add both slugs to this list on the affected page and note both claims with dates in the body.

## Minimum viable page

A page that passes lint must have at minimum:

```yaml
---
title: Concept - My Topic
type: concept
tags: [domain-tag]
summary: One sentence describing what this page covers and why it matters.
updated: 2026-06-01
deprecated: false
disputed: []
---
```
