---
name: wiki-status
description: >
  Reports the current state of the wiki vault — page counts, category breakdown, hub pages,
  orphans, stale entries, and a delta showing what has changed since the last ingest. Use
  this skill when the operator asks "what's the status", "wiki dashboard", "how many pages",
  "what's stale", "what's been ingested", "show me the delta", or "wiki health overview".
  Also surfaces structural insights (top hubs, fragmented clusters, bridge pages) when the
  operator asks "wiki insights", "what's central", or "show me the hubs". Read-only: this
  skill reports and recommends; it does not modify any files.
model: haiku
---

# Wiki Status — Vault State Report

Computes a snapshot of the wiki's current state: page counts, category breakdown, ingest
delta, staleness flags, and optional structural insights. Read-only — no files are modified.

**Model rationale:** haiku. This skill runs deterministic counts, date comparisons, and
manifest lookups. All output is factual reporting from existing data; no creative synthesis
or strategic judgment is required.

## Before You Start

1. Read `wiki/wiki/index.md` — page inventory.
2. Read `wiki/log.md` — recent activity.
3. Read `wiki/.manifest.json` (if it exists) — ingest tracking ledger.

## The Manifest

The manifest at `wiki/.manifest.json` tracks every source file ingested. If it does not
exist, the vault is fresh and everything is pending.

```json
{
  "version": 1,
  "last_updated": "2025-11-01T10:00:00Z",
  "sources": {
    "/path/to/source.md": {
      "ingested_at": "2025-11-01T10:00:00Z",
      "size_bytes": 4523,
      "modified_at": "2025-10-30T08:00:00Z",
      "pages_created": ["concepts/example.md"],
      "pages_updated": []
    }
  },
  "stats": {
    "total_sources_ingested": 18,
    "total_pages": 42
  }
}
```

## Step 1: Page Inventory

Glob all `.md` files under `wiki/wiki/` (exclude `_archives/`). Count:
- **Total pages** across the vault
- **Pages per category** (by directory prefix)
- **Untagged pages** — `tags: []` or missing `tags:` field
- **Pages missing `summary:`** — frontmatter grep is sufficient; do not read page bodies
- **Deprecated pages** — `deprecated: true` in frontmatter
- **Orphan pages** — `orphan` tag in frontmatter (set by wiki-lint Check 1)

## Step 2: Compute the Delta

Compare pages and sources to the manifest:

| Status | Meaning |
|---|---|
| **New source** | File exists on disk; not in manifest |
| **Modified source** | In manifest; modification time newer than `ingested_at` |
| **Unchanged source** | In manifest; modification time unchanged |
| **Deleted source** | In manifest; file no longer exists |

When no manifest exists, report all sources as new.

## Step 3: Staleness Check

Flag pages whose `updated:` frontmatter date is more than 90 days old (relative to today).
Use frontmatter-scoped Grep — do not read page bodies for this check.

## Step 4: Report

```markdown
# Wiki Status — [TIMESTAMP]

## Overview
- **Total pages:** 42 across 6 categories
- **Sources ingested:** 18
- **Last ingest:** 2025-11-01T10:00:00Z
- **Deprecated pages:** 2
- **Orphan pages:** 3 (tagged `orphan` — run cross-linker to connect)
- **Pages missing summary:** 5 (run wiki-lint to fix)

## Categories
| Category | Pages |
|---|---|
| concepts/ | 18 |
| entities/ | 9 |
| skills/ | 7 |
| synthesis/ | 5 |
| references/ | 3 |

## Delta Since Last Ingest
- **New sources:** 4
- **Modified sources:** 2
- **Unchanged sources:** 12
- **Deleted sources:** 0

### New Sources (need ingesting)
| Source | Size | Modified |
|---|---|---|
| wiki/raw/new-doc.md | 12 KB | 2025-11-03 |
| wiki/raw/meeting-notes.md | 4 KB | 2025-11-04 |

### Modified Sources (need re-ingesting)
| Source | Ingested | Modified |
|---|---|---|
| docs/architecture.md | 2025-10-01 | 2025-11-02 |

## Staleness (pages not updated in >90 days)
- `references/paper-y.md` — last updated 2025-07-01
- `entities/tool-x.md` — last updated 2025-06-15

## Recommendation
```

Choose one recommendation:

| Situation | Recommendation |
|---|---|
| Delta <20% of total | **Append** — ingest new and modified sources only |
| Delta >50% of total | **Rebuild** — archive and reprocess everything |
| Many deleted sources | **Lint first** — check for stale pages, then decide |
| First time / empty vault | **Full ingest** — process all sources |
| No delta | **No action** — vault is current |

## Step 5: Insights Mode (optional)

Triggered by: "wiki insights", "what's central", "show me the hubs", "wiki structure".

Build the wikilink graph: glob all pages, extract every `[[wikilink]]`, compute incoming
and outgoing counts per page.

Report:

1. **Top hubs** — 10 pages with the most incoming links. Flag sink hubs (high incoming,
   zero outgoing) as cross-linker candidates.

2. **Fragmented tag clusters** — tags with ≥5 pages and cohesion <0.15:
   `cohesion = actual_links / (n × (n−1) / 2)`

3. **Orphan-adjacent pages** — linked from a top-10 hub but with zero outgoing links of
   their own. Dead-ends in high-traffic areas — prime cross-linker candidates.

```markdown
## Insights

### Top Hubs (by incoming links)
| Page | Incoming | Outgoing | Note |
|---|---|---|---|
| [[concepts/core-concept]] | 18 | 5 | connector hub |
| [[entities/key-entity]] | 12 | 0 | sink hub — cross-linker candidate |

### Fragmented Tag Clusters
- **#methods** — 6 pages, cohesion=0.08 — run cross-linker
- **#tools** — 5 pages, cohesion=0.10 — run cross-linker

### Orphan-Adjacent Pages
- [[concepts/foo]] — linked from 3 hubs, 0 outbound links
```

After writing insights, append to `wiki/log.md`:
```
- [TIMESTAMP] STATUS_INSIGHTS anchors=N fragmented=F orphan_adjacent=O
```

### When to skip insights mode

- Vaults with fewer than 20 pages — not enough graph structure to be meaningful.
- Immediately after a full rebuild before any ingest has run.
