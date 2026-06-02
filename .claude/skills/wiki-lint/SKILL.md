---
name: wiki-lint
description: >
  Audits the wiki vault for structural health problems and auto-fixes deterministic issues.
  Use this skill when the operator wants to check the wiki for issues — "audit my wiki",
  "wiki health check", "find broken links", "fix my frontmatter", "what needs fixing",
  "clean up the wiki", or before any major query session or ingest. Reports orphans, broken
  wikilinks, missing or invalid frontmatter, schema violations, stale content, and tag
  inconsistencies. Auto-fixes deterministic issues; reports judgment-bearing issues for
  operator review. Runs cross-linker on fragmented tag clusters at the end of every run.
model: sonnet
---

# Wiki Lint — Health Audit

Performs a health check on the wiki vault. Finds structural issues that degrade the wiki's
value over time. Some checks are deterministic rewrites — auto-fixed silently. Others require
judgment — reported for operator action.

**Before scanning anything:** use frontmatter-scoped Greps and section-anchored reads rather
than full-page reads across the vault. Read full pages only when a check requires content
comparison (contradictions, provenance drift).

## Before You Start

1. Read `wiki/schema/page-types.md` — canonical required frontmatter fields per type.
2. Read `wiki/schema/tag-taxonomy.md` — canonical tag vocabulary.
3. Read `wiki/wiki/index.md` — full page inventory.
4. Read `wiki/log.md` — recent activity context.

## Lint Checks

Run in order. Report findings as you go.

### Check 1 — Orphaned Pages

Pages with zero incoming wikilinks are knowledge islands. Glob all `.md` files; for each
page, grep the rest of the vault for `[[page-name]]` references.

**Exemptions (not orphans by design):**
- `wiki/index.md`, `wiki/log.md`, and other vault-root administrative files
- Pages with `type: hub` in frontmatter — hubs derive value from outbound links

**Auto-fix:** add `orphan` to the page's `tags:` frontmatter so it is visible in audits
and reports. Remove the tag when the page is linked from a relevant hub or index.

**Offer to fix:** add the page to `wiki/wiki/index.md` under the appropriate section, which
also establishes an incoming link.

### Check 2 — Broken Wikilinks

Links that point to pages that do not exist on disk.

**How to check:** grep for `\[\[.*?\]\]` across all pages; extract targets; verify each
target resolves to a `.md` file.

**Offer to fix:** update renamed targets, create missing stub pages, or remove invalid links.

### Check 3 — Missing or Invalid Frontmatter

Every page requires: `title`, `type`, `tags`, `summary`, `updated`, `deprecated`.

**How to check:** grep frontmatter blocks (`^---` at file heads) for missing fields rather
than reading every page in full.

**Offer to fix:** add missing fields with schema-appropriate defaults:
- `deprecated: false` unless page content suggests otherwise
- `tags: []` if no tags are inferrable (flag for `tag-taxonomy` to resolve)
- `summary:` requires reading the page body — see Check 3a

### Check 3a — Missing or Stale Summary

`summary:` must be present, ≤200 characters, and match the page's current lead content.

**How to check:** grep frontmatter for `^summary:` across the vault. Flag missing fields and
summaries exceeding 200 characters. Flag likely drift when the summary diverges substantially
from the page's opening paragraph.

**Offer to fix:** rewrite the summary to match current page content (requires reading the body).

### Check 4 — Stale Content

Pages whose `updated` date predates the modification time of their listed sources.

**How to check:** compare `updated` frontmatter timestamps to source file modification times
where the page has a `## Sources` section with identifiable file paths.

**Report only** — stale pages should be re-ingested via `wiki-ingest` with full mode.

### Check 5 — Contradictions

Claims that conflict across pages sharing tags or heavy cross-references.

**How to check:** read related pages (pages sharing 2+ tags); look for claims that directly
contradict each other.

**Offer to fix:** add an `## Open Questions` section to the relevant pages noting the
contradiction and citing both sources.

### Check 6 — Index Consistency

`wiki/wiki/index.md` must list every page in the vault.

**How to check:** compare pages listed in `index.md` to files on disk (Glob `wiki/wiki/`).
Check that entries not in `index.md` are genuinely missing, not just nested differently.

**Offer to fix:** add missing entries; remove entries for deleted files.

### Check 7 — Provenance Drift

Pages with a `provenance:` frontmatter block should accurately reflect the current mix of
extracted / inferred / ambiguous claims in the body.

**How to check:** for pages with a `provenance:` block, count sentences/bullets ending with
`^[inferred]` or `^[ambiguous]`; compute fractions; flag when any field differs by more than
0.20 from the block's declared values.

**Thresholds:**
- `ambiguous > 0.15` — flag as speculation-heavy; suggest re-sourcing or splitting
- `inferred > 0.40` with no `sources:` — flag as unsourced synthesis

**Offer to fix:** update the `provenance:` frontmatter to match recomputed values.

### Check 8 — Fragmented Tag Clusters

Pages sharing a tag that are not linked to each other — knowledge islands within a topic.

**How to check:** for each tag with ≥5 pages:
- `n` = page count; `actual_links` = wikilinks between any two pages in the group
- `cohesion = actual_links / (n × (n−1) / 2)`
- Flag tag groups where `cohesion < 0.15` and `n ≥ 5`

**Auto-fix (end of run):** invoke the `cross-linker` skill targeted at each fragmented tag.
Cross-linker proposes and applies links; do not skip this step.

### Check 9 — Tag Limit Violations

Pages with more than 5 domain/type tags (system `visibility/` tags do not count toward the
limit).

**How to check:** grep frontmatter `tags:` arrays; count non-`visibility/` entries.

**Offer to fix:** suggest the 2–3 least specific tags to drop, keeping the most precise ones.

### Check 10 — Filename Conventions

Page filenames must match prefix conventions defined in `wiki/schema/page-types.md` and
live in the correct category directory.

**How to check:** glob each category directory; verify filenames match the expected prefix
for that type.

**Offer to fix:** rename files and update inbound wikilinks.

## Auto-fix vs. Report

| Check | Action |
|---|---|
| #1 Orphan tagging | Auto-fix: add `orphan` tag |
| #8 Cross-linker on fragmented clusters | Auto-fix: invoke `cross-linker` at end of run |
| #2 Broken wikilinks | Offer to fix |
| #3 Missing frontmatter | Offer to fix |
| #3a Summary missing or stale | Offer to fix |
| #4 Stale content | Report only — use `wiki-ingest --mode full` |
| #5 Contradictions | Offer to fix |
| #6 Index consistency | Offer to fix |
| #7 Provenance drift | Offer to fix |
| #9 Tag limit violations | Offer to fix |
| #10 Filename conventions | Offer to fix |

## Output Format

```markdown
## Wiki Health Report

### Orphaned Pages (N found)
- `concepts/foo.md` — no incoming links; tagged `orphan`

### Broken Wikilinks (N found)
- `entities/bar.md:15` — links to [[nonexistent-page]]

### Missing Frontmatter (N found)
- `skills/baz.md` — missing: summary, tags

### Missing / Stale Summary (N found)
- `concepts/qux.md` — no `summary:` field
- `entities/quux.md` — summary exceeds 200 chars

### Stale Content (N found)
- `references/paper-x.md` — source modified 2025-11-10, page updated 2025-09-01

### Contradictions (N found)
- `concepts/scaling.md` claims "X" but `synthesis/efficiency.md` claims "not X"

### Index Inconsistencies (N found)
- `concepts/new-page.md` exists on disk but is not in index.md

### Provenance Drift (N found)
- `concepts/scaling.md` — declared inferred=0.10, recomputed=0.45

### Fragmented Tag Clusters (N found — cross-linker triggered)
- **#systems** — 7 pages, cohesion=0.06

### Tag Limit Violations (N found)
- `entities/foo.md` — 8 tags (limit is 5 domain/type tags)

### Filename Convention Issues (N found)
- `wiki/_meta/wrong-name.md` — meta pages must begin with "Meta - "
```

## After Linting

Append to `wiki/log.md`:
```
- [TIMESTAMP] LINT issues_found=N orphans=X broken_links=Y missing_frontmatter=F
  missing_summary=S stale=Z contradictions=W provenance_issues=P fragmented_clusters=C
  tag_violations=V filename_issues=N cross_links_added=CL. <one-sentence narrative>.
```
