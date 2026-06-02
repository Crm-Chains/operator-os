# Schema — Naming

All wiki pages follow a `Prefix - Title` convention for both the filename and the `title:` frontmatter. This makes every node in the knowledge graph self-identifying at a glance.

## Prefix table

| Prefix | Domain | Examples |
|--------|--------|---------|
| `Concept -` | Domain knowledge, frameworks, ideas | `Concept - Retrieval-Augmented Generation`, `Concept - Four Cs Framework` |
| `Source -` | Ingested source summaries | `Source - Research Paper Title`, `Source - Interview Notes 2026-05` |
| `Synthesis -` | Analyses, filed Q&A, postmortems | `Synthesis - Decision on DB Choice`, `Synthesis - Q4 Retrospective` |
| `Meta -` | Vault governance, index, overview pages | `Meta - Index`, `Meta - Tag Taxonomy` |
| `Agent -` | Individual agent definitions | `Agent - Research Coordinator`, `Agent - Content Writer` |
| `Skill -` | Skills and capability packages | `Skill - wiki-ingest`, `Skill - cross-linker` |
| `Swarm -` | Multi-agent swarm projects | `Swarm - Research Pipeline`, `Swarm - Content Production` |
| `Project -` | Projects and initiatives | `Project - Platform Launch`, `Project - Knowledge Migration` |
| `Task -` | Active tasks and workstreams | `Task - API Integration`, `Task - Schema Review` |
| `Idea -` | Drafted ideas not yet committed | `Idea - Auto-Classify Inbound Sources` |

<!-- Add your own prefixes here when you have a stable new domain.
     Every new prefix should have a corresponding tag in schema/tags.md. -->

## File naming rules

- **Format:** `Prefix - Title.md` (spaces allowed; match `title:` frontmatter exactly)
- **Case:** Title case for the human-readable part; lowercase slug for `tags:` and `sources:` references
- **Uniqueness:** Titles must be unique within the vault — the graph breaks on duplicate node names
- **No dates in titles** — use `updated:` frontmatter for recency; dates in filenames create drift
- **Cross-link aggressively.** Every page should link to at least one other page via `[[Page Name]]`
- **Contradictions are first-class.** Flag them with `disputed:` frontmatter; do not paper over them

## Slug conventions (for frontmatter references)

When referencing a page in `sources:` or `links:` frontmatter, use a lowercase hyphenated slug derived from the title:

- `Source - My Research Paper.md` → slug: `my-research-paper`
- `Concept - Four Cs Framework.md` → slug: `four-cs-framework`
