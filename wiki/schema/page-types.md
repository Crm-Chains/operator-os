# Schema — Page Types

Every wiki page belongs to exactly one type, declared in frontmatter as `type:`. The type determines which additional frontmatter fields are required and where the page lives in the vault.

## Type definitions

### `concept`
**Location:** `wiki/wiki/concepts/<slug>.md`
**When to use:** An idea, framework, domain term, pattern, or piece of knowledge that the operator wants to reason about repeatedly. Not tied to a specific source — synthesized from understanding.
**Required frontmatter:** `title`, `type`, `tags`, `summary`, `updated`
**Optional:** `links`, `aliases`, `deprecated`
**Body convention:** Lead with the "so what." Use `##` sections for sub-concepts. Link to sources that informed this concept.

### `source`
**Location:** `wiki/wiki/sources/<slug>.md`
**When to use:** A summary of an ingested external source — article, paper, video transcript, interview, documentation. One page per source.
**Required frontmatter:** `title`, `type`, `tags`, `summary`, `updated`, `source-url` (or `source-path` for local files)
**Optional:** `links`, `aliases`
**Body convention:** Summary → Key claims → Notable quotes → Context and relevance. Include a `## Sources` section with the original URL or path.

### `synthesis`
**Location:** `wiki/wiki/syntheses/<slug>.md`
**When to use:** A filed answer to a non-trivial question, a decision record, a postmortem, or a cross-source analysis. Created when a QUERY produces something worth preserving.
**Required frontmatter:** `title`, `type`, `tags`, `summary`, `updated`, `links` (to sources or concepts it draws from)
**Optional:** `aliases`, `deprecated`, `disputed`
**Body convention:** Question/context → Answer/finding → Evidence (linked wiki pages) → Open questions.

### `meta`
**Location:** `wiki/wiki/_meta/<slug>.md`
**When to use:** Vault governance — the index, the overview, the tag taxonomy, maintenance dashboards. These pages describe the wiki itself, not domain knowledge.
**Required frontmatter:** `title`, `type`, `tags`, `summary`, `updated`
**Body convention:** Operator-facing. Terse. Used by agents for routing and health checks.

---

## Subtype extensions

Subtypes narrow a base type for specialized use cases. Declare as `subtype:` alongside `type:`.

| Subtype | Base type | Purpose |
|---------|-----------|---------|
| `decision` | `synthesis` | Architectural or strategic decision (ADR-style) |
| `postmortem` | `synthesis` | Failure capture — what broke, root cause, resolution |
| `blueprint` | `concept` | Reusable template or playbook for a repeatable process |
| `learning` | `concept` | Compounding operational knowledge extracted from production |

<!-- Add your own subtypes here when a stable pattern emerges in your domain. -->

---

## Deprecation

Mark a page as deprecated by adding `deprecated: true` to frontmatter. Deprecated pages:
- Stay queryable — they are audit history
- Surface in lint as warnings
- Should have no active inbound `[[links]]`
- Are never deleted

## Conflict tracking

When two sources or pages contradict each other, add `disputed: [slug-a, slug-b]` to frontmatter of the affected page. Note both claims with source dates in the body. Lint surfaces disputed pages for resolution.
