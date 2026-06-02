# Meta-Protocol 0.1 — Persistent Knowledge

**What it governs:** the wiki engine that forms the Context layer of the OS.

The central insight: an AI agent with no persistent memory re-derives everything from the conversation context every session. This is wasteful, inconsistent, and fragile. The wiki is the fix — a structured, maintained knowledge base that survives sessions, accumulates over time, and is queryable on demand.

---

## The core idea

> The wiki is persistent thinking made legible.

Every piece of knowledge the operator cares about — domain concepts, schema decisions, research findings, tag vocabularies, capability inventories — lives in the wiki as a structured page. Agents read from it before acting. The maintenance stack keeps it from drifting.

Without the wiki:
- Every session re-reads the same raw sources
- Terminology is inconsistent across agents and sessions
- Decisions get re-litigated because nobody recorded the rationale
- The OS forgets what it knows

With the wiki:
- Agents start informed, not blank
- Vocabulary is controlled and consistent
- Decisions are recorded with context
- Knowledge compounds across time

---

## The ingest-to-query cadence

Raw knowledge enters the wiki and flows through five stages. No stage is skipped.

```
Raw input
   │
   ▼
1. Ingest       ← capture source material (URLs, docs, transcripts, meeting notes)
   │
   ▼
2. Distill      ← extract signal; discard noise; write a structured wiki page
   │
   ▼
3. Tag          ← apply controlled vocabulary (tag taxonomy); add frontmatter
   │
   ▼
4. Verify       ← lint for schema compliance, factual drift, broken links, stale dates
   │
   ▼
5. Query        ← agents and operators retrieve knowledge on demand
        ↑
        └── Maintenance loop keeps the pipeline healthy over time
```

Each stage has a corresponding skill in the chassis (see the maintenance stack below). Together they form a closed loop: new knowledge enters at stage 1, flows to stage 5, and is periodically refreshed by the maintenance loop.

---

## Wiki page anatomy

Every page in the wiki shares a common structure that makes it machine-readable and human-readable simultaneously.

**Required frontmatter fields:**
- `title` — unique, human-readable
- `type` — the ontological category (concept, source, meta, decision, etc.)
- `tags` — controlled vocabulary from the tag taxonomy
- `summary` — one sentence; what an agent reads first when routing
- `updated` — ISO date; staleness detection targets this field
- `deprecated` — boolean; deprecated pages stay queryable but are flagged

**Body conventions:**
- Lead with the "so what" — why this knowledge matters
- Use `##` sections for major sub-concepts
- Link to related pages with `[[Page Name]]` syntax (resolved by the cross-linker)
- Source URLs and evidence go in a `## Sources` section at the bottom

---

## The maintenance skill stack

The wiki does not maintain itself. The following skills run on cadence (automated via Cadence hooks and `/schedule`) or on demand:

| Skill | What it does | When to run |
|-------|-------------|------------|
| `wiki-ingest` | Captures a raw source into a structured draft page | On demand — whenever new material arrives |
| `wiki-update` | Refreshes a specific page against its source | When a source changes or the page is flagged stale |
| `wiki-lint` | Checks all pages for schema compliance, drift, broken links | Weekly (or before any major query session) |
| `tag-taxonomy` | Applies and normalizes the controlled vocabulary | After ingest; before lint |
| `cross-linker` | Detects and inserts missing `[[links]]` between related pages | After lint |
| `wiki-status` | Dashboard: counts pages, flags stale entries, reports health score | On demand; surfaced by `/audit` |
| `wiki-rebuild` | Full rebuild of the index and graph from scratch | After structural changes to the schema or taxonomy |
| `wiki-query` | Retrieves pages matching a query (topic, type, tag, recency) | Any time an agent needs Context |

**Cadence recommendation:** run `wiki-lint` → `tag-taxonomy` → `cross-linker` → `wiki-status` as a weekly composite. The `/audit` ritual calls `wiki-status` automatically.

---

## Schema governance

The wiki has a `schema/` directory that defines the controlled vocabulary and page templates. Schema changes are infrequent and consequential — they require a `wiki-rebuild` to propagate. All schema changes are recorded as decision records (`docs/adr/`).

Key schema artifacts:
- `wiki/schema/page-types.md` — enumerated page types and their required frontmatter fields
- `wiki/schema/tag-taxonomy.md` — controlled tag vocabulary with definitions
- `wiki/ROUTER.md` — the routing index; maps knowledge domains to wiki sections

---

## ROUTER.md — the gateway

`wiki/ROUTER.md` is the single file agents consult first when they need to find something in the wiki. It maps knowledge domains and question types to specific wiki sections or pages. It is maintained by the operator (and updated by `/onboard`) rather than auto-generated, so it remains intentional rather than exhaustive.

An agent that reads `ROUTER.md` before querying the wiki is faster, uses fewer tokens, and returns more relevant results than one that searches the full vault.

---

## Anti-patterns

**Treating the wiki as a dump.** Every page must earn its place. Ingesting without distilling produces noise, not knowledge. The `wiki-ingest` skill always produces a structured page, not a raw paste.

**Skipping tags.** Untagged pages are invisible to agents routing by taxonomy. Tag every page before it leaves the ingest stage.

**Never running lint.** A wiki that is never linted drifts. Stale pages with old `updated:` dates mislead agents. Weekly lint is the minimum.

**Querying without routing.** An agent that searches the full vault without reading `ROUTER.md` first burns tokens and gets noisy results. Route first.

---

## Related

- [`wiki/ROUTER.md`](../../wiki/ROUTER.md) — the domain routing index
- [Meta-Protocol 0.3 — Capability Extension](capability-extension.md) — how new wiki skills are authored
- [`docs/ai-os-framework.md`](../ai-os-framework.md) — Context layer in the Four Cs
- [`docs/conventions/`](../conventions/) — skill conventions (applies to wiki skills too)
