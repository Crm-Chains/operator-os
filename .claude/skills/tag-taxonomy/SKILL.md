---
name: tag-taxonomy
description: >
  Enforces and normalizes tags across the wiki against the controlled vocabulary in
  wiki/schema/tag-taxonomy.md. Use this skill when the operator says "fix my tags",
  "normalize tags", "tag audit", "clean up tags", "tag taxonomy", or "my tags are a mess".
  Also use when creating or updating wiki pages and the right tags are unclear. Operates in
  three modes: Audit (report current state), Normalize (apply fixes), and Classify (tag a
  single new page). Always reads the taxonomy file before assigning any tags.
model: haiku
---

# Tag Taxonomy — Controlled Vocabulary Enforcement

Enforces consistent tagging across the wiki by normalizing all page tags against the
controlled vocabulary. Mechanical substitution (alias → canonical) is the primary workload;
judgment is only needed for unknown tags that require operator input before classification.

**Model rationale:** haiku. The dominant operations — grepping frontmatter, mapping aliases
to canonical forms, enforcing the tag-limit rule — are deterministic pattern matching with
no creative or strategic reasoning required. Unknown-tag disposition is the only judgment
step, and it escalates to the operator rather than being decided by the model.

## Before You Start

1. Read `wiki/schema/tag-taxonomy.md` — the canonical tag list, alias map, and rules.
2. Read `wiki/wiki/index.md` — scope check.

## The Taxonomy File

`wiki/schema/tag-taxonomy.md` defines:
- **Canonical tags** — the only tags that should appear in page frontmatter
- **Aliases** — common alternatives that map to a canonical tag
- **Rules** — max 5 domain/type tags per page; lowercase-hyphenated; prefer broader over
  narrower when a page fits both

Always read this file before tagging. It is the single source of truth.

## Reserved System Tags

`visibility/` tags are managed separately from the taxonomy and are not subject to alias
mapping or the 5-tag limit:

| Tag | Purpose |
|---|---|
| `visibility/public` | Explicitly public (same as no tag) |
| `visibility/internal` | Team-restricted content |
| `visibility/pii` | Content referencing personal or sensitive data |

Rules:
- Only one `visibility/` tag per page.
- Omit entirely when content is clearly public — no tag needed.
- Do not flag `visibility/` tags as unknown during an audit.
- Do not count them toward the 5-tag limit.
- When normalizing, leave `visibility/` tags untouched.

## Mode 1: Audit

Report the current tag state without modifying any files.

### Step 1: Scan all pages

```
Glob: wiki/wiki/**/*.md (exclude _archives/, _meta/)
Extract: tags field from YAML frontmatter of each page
```

### Step 2: Build a tag frequency table

For each tag found, count pages using it. Flag:
- **Alias tags** — not canonical; map exists in taxonomy
- **Unknown tags** — not in canonical list and no alias mapping
- **Over-tagged pages** — more than 5 domain/type tags (excluding `visibility/`)
- **Untagged pages** — no `tags:` field, or `tags: []`

### Step 3: Report

```markdown
## Tag Audit Report

### Summary
- Total unique tags: 42
- Canonical tags in use: 31
- Alias tags found: 8
- Unknown tags: 3
- Pages over tag limit (5): 2
- Untagged pages: 4

### Alias Tags (map to canonical)
| Current Tag | → Canonical | Pages Affected |
|---|---|---|
| `nextjs` | `react` | 4 |
| `k8s` | `kubernetes` | 2 |

### Unknown Tags (not in taxonomy)
| Tag | Pages | Recommended Action |
|---|---|---|
| `flutter` | 1 | Add to taxonomy under Frameworks, or map to `mobile` |
| `zettelkasten` | 3 | Add to taxonomy under Methods |

### Over-Tagged Pages
| Page | Tag Count | Tags |
|---|---|---|
| `entities/project-x.md` | 7 | tool, ai, research, ... |

### Untagged Pages
- `concepts/new-concept.md`
- `references/paper-y.md`
```

## Mode 2: Normalize

Apply fixes after auditing. Run Mode 1 first to establish the scope.

### Step 1: Apply alias substitutions

For each page with alias tags:
1. Read the page.
2. Replace each alias with its canonical form.
3. Write the updated frontmatter.

```yaml
# Before
tags: [nextjs, ai, ml-engineer]

# After
tags: [react, ai, ml]
```

### Step 2: Enforce tag limit

For pages with more than 5 domain/type tags:
1. Read the page.
2. Suggest which tags to drop — keep the most specific and relevant; remove the broadest
   or most redundant.
3. Confirm with the operator before writing — tag trimming requires judgment.

### Step 3: Handle unknown tags

- **Used on 2+ pages:** suggest adding to `wiki/schema/tag-taxonomy.md`; do not rename
  until the operator confirms the canonical form.
- **Used on 1 page:** suggest the closest canonical alternative; confirm before changing.

Never rename unknown tags without operator confirmation.

### Step 4: Update taxonomy

When the operator approves a new canonical tag, append it to `wiki/schema/tag-taxonomy.md`
in the correct section with its definition and any aliases.

## Mode 3: Classify a New Page

When creating a wiki page and the right tags are unclear:

1. Read `wiki/schema/tag-taxonomy.md`.
2. Select up to 5 tags:
   - 1–2 **domain tags** (what subject area)
   - 1 **type tag** (what kind of page)
   - 0–1 **project tag** (if project-specific)
   - 0–1 additional descriptive tag
3. Use only canonical tags — never aliases.
4. If no existing tag fits, flag for taxonomy extension via Mode 2 Step 3.

## After Any Tag Operation

Append to `wiki/log.md`:
```
- [TIMESTAMP] TAG_AUDIT tags_scanned=N alias_fixes=A unknown_flags=U pages_modified=P
```

Or for normalization:
```
- [TIMESTAMP] TAG_NORMALIZE aliases_applied=N pages_modified=M new_canonical_tags=P
```
