# Schema — Tags

All tags must come from this controlled vocabulary. Do not invent ad-hoc tags. If a new tag is genuinely needed, extend this file first, then apply it.

## Core vocabulary

### By page type
| Tag | Meaning |
|-----|---------|
| `concept` | Domain knowledge, frameworks, patterns |
| `source` | Ingested external source |
| `synthesis` | Filed analysis, decision, or Q&A |
| `meta` | Vault governance and index pages |

### By status
| Tag | Meaning |
|-----|---------|
| `active` | Actively maintained and current |
| `stale` | Not updated in >90 days; needs review |
| `deprecated` | Superseded; kept for audit history |
| `orphan` | No inbound [[links]]; needs connection or deletion |
| `disputed` | Contains claims contradicted by another page |

### By domain (starter set)
| Tag | Meaning |
|-----|---------|
| `framework` | Conceptual model or structured approach |
| `decision` | Architectural or strategic choice |
| `operations` | Day-to-day workflow or process |
| `automation` | Machine-executed process or pipeline |
| `agents` | AI agent definitions, patterns, or coordination |
| `skills` | Capability packages (slash commands, skills) |
| `knowledge-management` | Wiki system, ingestion, retrieval |
| `research` | Research findings, competitive intel, discovery |

<!-- ================================================================
     ADD YOUR OWN DOMAIN TAGS HERE
     
     When your operator domain requires new tags, add them below with
     a brief definition. Rules:
     - Lowercase, hyphen-separated
     - Each tag needs a definition (one sentence)
     - Remove tags that you never use — dead vocabulary is noise
     - Re-run /tag-taxonomy after adding new tags to normalize existing pages
     
     Example:
     | `product`     | Product features, specs, roadmap items |
     | `customer`    | Customer personas, interviews, feedback |
     | `competitor`  | Competitor profiles and analysis |
     ================================================================ -->

---

## Extension rules

1. Check this file before tagging any page. If your tag is not here, do not use it.
2. To add a tag: edit this file, add the row, add a one-sentence definition.
3. Announce the new tag in `docs/adr/` if it represents a domain expansion.
4. Run `/tag-taxonomy` after extending — it normalizes all existing pages against the updated vocabulary.

## Enforcement

`/wiki-lint` checks every page for tags not in this list and flags them. `/tag-taxonomy` normalizes close variants (e.g. `knowledgeManagement` → `knowledge-management`). Both skills load this file before running.
