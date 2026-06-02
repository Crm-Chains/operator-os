# Wiki Router

Read this first for any wiki operation. It maps knowledge needs to the right file or skill — avoiding unnecessary vault scans.

**Route first. Load only what this table names.**

---

## Core routing table

| Need | Read first | Then drill into |
|------|-----------|-----------------|
| Understanding the wiki system itself | `wiki/CLAUDE.md` | `wiki/schema/governance.md` |
| INGEST — add a new source | `wiki/CLAUDE.md` → INGEST section | `schema/naming.md` · `schema/frontmatter.md` |
| QUERY — answer a question | This file → find the domain below | 2–3 targeted pages |
| LINT — health check | `wiki/CLAUDE.md` → LINT section | `schema/governance.md` |
| New page (manual creation) | `schema/page-types.md` | `schema/naming.md` · `schema/frontmatter.md` |
| Tag a page or normalize vocabulary | `schema/tags.md` | — |
| Naming a new file | `schema/naming.md` | — |
| Vault index / what pages exist | `wiki/wiki/_meta/index.md` | domain subdirs below |
| What the wiki is and how it works | `wiki/wiki/_meta/about-this-wiki.md` | — |
| OS framework / Four Cs | `wiki/wiki/_meta/about-this-wiki.md` | `docs/ai-os-framework.md` |
| Schema governance / maintenance loop | `schema/governance.md` | — |

---

## Domain routing

*Replace or extend this section with your own domains after onboarding.*

| Domain | Landing page | Notes |
|--------|-------------|-------|
| Core concepts | `wiki/wiki/concepts/` | Domain knowledge, frameworks, decisions |
| Ingested sources | `wiki/wiki/sources/` | One summary page per source |
| Analyses and Q&A | `wiki/wiki/syntheses/` | Filed query answers, postmortems |
| Vault governance | `wiki/wiki/_meta/` | Index, maintenance, meta-pages |

---

<!-- ================================================================
     ADD YOUR OWN DOMAINS HERE
     
     After /onboard imprints your operator profile, add rows to the
     table above for your specific knowledge domains. Examples:
     
     | Customer research    | wiki/wiki/concepts/customers/   | Personas, JTBD, interviews |
     | Product decisions    | wiki/wiki/syntheses/decisions/  | ADR-style filed Q&A        |
     | Competitor intel     | wiki/wiki/sources/competitors/  | One page per competitor     |
     | Technical references | wiki/wiki/concepts/tech/        | APIs, schemas, constraints  |
     
     Keep entries short: need → file → one-line note about what lives there.
     ================================================================ -->

---

## Rules

- Do not load `wiki/CLAUDE.md` unless this table routes you there.
- Do not run recursive directory scans in main context — spawn a subagent, cap at 200 words.
- Schema files are load-on-demand. Load only the one this table names.
- If a domain is not listed here, check `wiki/wiki/_meta/index.md` before scanning.
