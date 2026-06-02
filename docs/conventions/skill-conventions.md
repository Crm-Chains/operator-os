# Skill Conventions

Single source of truth for how operator-os authors `.claude/skills/*/SKILL.md` files. Every new skill — and every edit to an existing skill — must satisfy all rules on this page.

Layered structure: **Platform invariants** (required by the Claude Code skill system) + **OS additions** (required by operator-os) + **Forbidden patterns**.

Reference docs (upstream):
- [Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

---

## Platform invariants

Every skill MUST satisfy all of these.

### Frontmatter

Every `SKILL.md` requires YAML frontmatter with two required fields:

| Field | Rule |
|---|---|
| `name` | Max 64 chars. Lowercase letters, digits, hyphens only. No XML tags. Reserved words `anthropic` and `claude` are forbidden. Must match the containing folder name exactly (kebab-case). |
| `description` | Non-empty. Max 1024 chars. No XML tags. **Third person only** ("Searches and summarizes sources" — not "I can help you" or "You can use this"). Must state both **what the skill does** and **when to invoke it**. |

### Body

| Rule | Rationale |
|---|---|
| `SKILL.md` body ≤ 500 lines | Token-efficiency cap. Exceeded? Split into bundled reference files. |
| Bundled reference files must be **one level deep** from `SKILL.md` | Files referenced from a referenced file receive only partial reads (`head -100`). Keep the chain flat. |
| Reference files longer than 100 lines must include a TOC at the top | Aids targeted in-context loading. |
| Forward slashes only in all paths (`references/workflow.md`) | Backslashes break on Unix and inside subagents. |
| MCP tool calls must be fully-qualified (`ServerName:tool_name`) | Without the server prefix the runtime may fail to locate the tool. |
| Consistent terminology throughout | Pick one term per concept and use it everywhere in the file. |
| No time-sensitive content in the main body | Time-sensitive notes rot silently. Wrap them in a `<details>` block labelled "old patterns". |

### Naming

Gerund form preferred: `processing-pdfs`, `analyzing-sources`, `writing-documentation`. Noun-phrase form (`pdf-processing`) is acceptable. Avoid vague names: `utils`, `helpers`, `tools`, `documents`, `data`, `files`.

### Progressive disclosure

`SKILL.md` is a **table of contents**, not a manual. Three accepted patterns:

1. **High-level guide + references** — quick-start procedure in `SKILL.md`, link out to `references/` for advanced detail.
2. **Domain-specific organization** — `references/domain-a.md`, `references/domain-b.md`, loaded on demand.
3. **Conditional details** — surface the common path inline, link to a reference for edge cases.

If your `SKILL.md` exceeds 500 lines, split it. Bundled reference files do not consume context until they are read.

### Scripts (if applicable)

| Rule | Rationale |
|---|---|
| Handle errors explicitly; do not leave them for the model to interpret | "Solve, don't punt." |
| Every numeric constant must be justified in an adjacent comment | Unexplained constants ("voodoo constants") create maintenance debt. |
| Make execution intent explicit ("Run X" vs "See X for the algorithm") | Separates command from explanation. |

---

## OS additions

These rules extend the platform spec for operator-os specifically.

### Model pins are mandatory

Every new skill MUST:

1. Declare `model: haiku | sonnet | opus | inherit` in frontmatter (placed after `name` and `description`).
2. Register a row in `docs/conventions/skill-model-pins.md` in the **same change**.

**Rationale:** prevents silent cost surprises and gives any operator a single-page audit of where expensive model tokens are being spent. Drift between the frontmatter pin and the pins table is a lint violation.

The decision tree for choosing a pin is in [`docs/conventions/model-orchestration.md`](model-orchestration.md). Quick rule of thumb:

| Pin | When to use |
|---|---|
| `haiku` | Mechanical work: template fill, regex/JSON patching, config scaffolding. Output never published directly without a downstream gate. |
| `sonnet` | Judgement-bearing work: schema enforcement, merge decisions, classification, scoring, reviewing diffs for style. |
| `opus` | Architectural/strategic work: multi-source reasoning, gap prioritization, designing a new swarm or skill, evaluating novel tradeoffs. |
| `inherit` | The caller's pin propagates. Use sparingly — it shifts the cost-audit burden upstream and makes the catalog less useful. |

Authoring a skill includes registering its model pin. This is the same discipline as the command model-pin rule described in [`docs/conventions/command-model-pins.md`](command-model-pins.md).

### `references/` subdirectory required for three or more bundled docs

When a skill ships `SKILL.md` plus three or more sibling `.md` files, those siblings MUST live inside a `references/` subdirectory:

```
my-skill/
├── SKILL.md
└── references/
    ├── workflow.md
    ├── examples.md
    └── schema.md
```

`SKILL.md` still links one level deep — now `references/workflow.md`. This keeps the skill root clean and makes the boundary between the entry point and the supporting material obvious.

Skills that ship fewer than three bundled files may keep them as flat siblings.

### Permitted optional frontmatter fields

| Field | Use |
|---|---|
| `model` | **Required** by the OS model-pin rule above. |
| `argument-hint` | Optional. Hints expected arguments for skills that accept args. |
| `allowed-tools` | Optional. Restricts which tools the skill may invoke. |
| `aliases` | Optional. Alternative invocation names. |

Any field not listed here requires an update to this page before use. The platform spec rejects XML tags inside `name` and `description`.

### Plugin-shipped skills are read-only

Skills delivered by plugins (e.g., `~/.claude/plugins/`) are owned by the plugin maintainer. Do not:

- Edit them in place.
- Fork them into `.claude/skills/` (creates a maintenance liability).
- Attempt to pin a model in their frontmatter (ineffective from outside the plugin path).

To extend a plugin skill, write a thin local skill that delegates to it and adds the OS-specific layer on top.

---

## Forbidden patterns

Hard rejections. Catch these in review.

| Pattern | Why it is rejected |
|---|---|
| Vague names (`helper`, `utils`, `tools`, `documents`, `data`, `files`) | Platform spec calls these out. They degrade skill-selection accuracy. |
| Reserved words in `name` (`anthropic`, `claude`, `anthropic-helper`, `claude-tools`) | Platform violation — will not validate. |
| First-person descriptions ("I can help you...", "You can use this...") | Third person is required. First-person copy causes discovery problems. |
| Time-sensitive content in the main body | Rots silently. Use a `<details>` "old patterns" block instead. |
| Windows backslashes in paths (`references\workflow.md`) | Breaks on Unix and inside subagents. |
| Unqualified MCP tool names (`query_records` instead of `CRM:query_records`) | Runtime may fail to locate the tool without the server prefix. |
| Nested reference chains (`SKILL.md` → `a.md` → `b.md` → actual content) | Deep references receive partial reads only. Keep one level. |
| `SKILL.md` body longer than 500 lines | Exceeds the token-efficiency cap. Split into `references/`. |
| Adding a skill without a `model:` pin in frontmatter | OS rule. Lint violation. |
| Adding a skill without a row in `skill-model-pins.md` | OS rule. Lint violation. |

---

## Authoring checklist

Run before committing any new skill or skill edit.

```
- [ ] name: lowercase, hyphens, ≤64 chars, no reserved words, matches folder name exactly
- [ ] description: third person, ≤1024 chars, states WHAT the skill does + WHEN to invoke it
- [ ] model: pin declared (haiku / sonnet / opus / inherit)
- [ ] Row added to docs/conventions/skill-model-pins.md in the same change
- [ ] SKILL.md body ≤ 500 lines
- [ ] Three or more bundled docs are inside references/
- [ ] All reference files one level deep from SKILL.md
- [ ] Reference files longer than 100 lines have a TOC
- [ ] Forward slashes in all paths
- [ ] MCP tools fully-qualified (ServerName:tool_name)
- [ ] No time-sensitive content in main body (or wrapped in <details> "old patterns")
- [ ] Consistent terminology throughout
- [ ] If scripts present: errors handled explicitly, no unexplained constants
- [ ] No vague names, no first-person copy, no XML in name or description fields
```

---

## How to modify these conventions

This page is the rulebook. Changes to it are deliberate:

1. Open an ADR in `docs/adr/` if the change is architectural in scope.
2. Update affected skills in the same change — do not leave drift.
3. If a local rule conflicts with the upstream platform spec, the platform spec wins. Open a change to remove or relax the local rule.

---

## Related

- [`docs/conventions/model-orchestration.md`](model-orchestration.md) — decision tree for choosing a model pin
- [`docs/conventions/command-model-pins.md`](command-model-pins.md) — the analogous rule for slash commands
- [`docs/conventions/skill-model-pins.md`](skill-model-pins.md) — the per-skill pin catalog (the table this page mandates)
