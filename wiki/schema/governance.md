# Schema — Governance

The wiki does not maintain itself. This file defines the maintenance loop, health rules, and decisions that keep the knowledge base trustworthy over time.

## The maintenance cadence

Run this composite weekly (or before any major query session):

```
/tag-taxonomy   ← normalize tags against controlled vocabulary
/wiki-lint      ← check health, fix deterministic issues, flag ambiguous ones
/cross-linker   ← insert missing [[links]] between related pages
/wiki-status    ← dashboard: page count, stale flags, health score
```

The `/audit` ritual calls `/wiki-status` automatically. The `/wiki-rebuild` skill runs these in sequence after structural schema changes.

---

## Health rules

**Staleness.** A page is stale if `updated:` is older than 90 days and has not been deliberately frozen. Lint flags stale pages. The operator decides whether to update or deprecate.

**Orphans.** A page with no inbound `[[links]]` is an orphan. Lint tags it `orphan`. Cross-linker attempts to resolve orphans automatically. Persistent orphans indicate the page either belongs in `raw/` or should be deleted.

**Growth rule.** Every new source should touch at least 3 existing pages — either updating them with new evidence or creating them if they are missing. If a concept appears in 3+ pages without its own page, create it.

**The overview page.** `wiki/wiki/_meta/index.md` is the single-page index of all wiki content. Keep it current. Update it when pages are created or deleted — not for content-only edits.

---

## Deprecation protocol

1. Add `deprecated: true` to the page's frontmatter.
2. Add a brief deprecation note at the top of the page body: what supersedes it and why.
3. Do not delete the page — it is audit history.
4. Lint will surface deprecated pages and verify no active pages still link to them.
5. Remove inbound `[[links]]` from active pages, replacing with links to the superseding page.

---

## Conflict resolution

When two sources or pages contradict each other:
1. Add `disputed: [slug-a, slug-b]` to frontmatter of the affected page.
2. In the body, note both claims with their source dates and which is more recent.
3. Lint surfaces disputed pages in the health report.
4. When a newer source settles the contradiction: resolve the `disputed:` field, update the page, and log the resolution.

---

## Schema changes

Schema changes (new page types, new frontmatter fields, new tag prefixes) are infrequent and consequential:
1. Update the relevant file in `wiki/schema/`.
2. Record the decision in `docs/adr/` (short ADR noting what changed and why).
3. Run `/wiki-rebuild` to propagate the change across all existing pages.
4. Update `wiki/wiki/_meta/index.md` if the change affects how pages are categorized.

---

## Log conventions

`wiki/wiki/_meta/index.md` tracks the vault state. Append a brief note when:
- A new page is created or deleted
- A lint run surfaces and fixes significant issues
- A schema change is applied

Do not log routine content edits or QUERY operations (unless a synthesis page is filed).

---

## Anti-patterns

- **Ingesting without distilling.** Raw paste is not a wiki page. Every source gets a structured page.
- **Skipping tags.** Untagged pages are invisible to agents routing by taxonomy.
- **Never running lint.** Stale pages with old `updated:` dates mislead agents. Weekly lint is the minimum.
- **Querying without routing.** Read `ROUTER.md` first. Scanning the full vault burns tokens and returns noisy results.
- **Deleting deprecated pages.** Deprecated pages are audit history. Mark them; do not delete them.
