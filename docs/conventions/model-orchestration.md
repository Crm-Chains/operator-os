# Model Orchestration

**One-line rule:** use the cheapest model that can produce the correct output reliably.

This document is the *why*. The *what* — the per-command and per-skill pin catalogs — live at:
- [`docs/conventions/command-model-pins.md`](command-model-pins.md)
- [`docs/conventions/skill-model-pins.md`](skill-model-pins.md)

---

## Decision tree

Answer the questions top-down. Stop at the first "yes".

**1. Is the task purely mechanical?**
Template fill, regex or JSON patching, config scaffolding, CSV emit, renaming fields. No decision requires interpreting intent, balancing tradeoffs, or applying domain knowledge.
- **→ Haiku.**
- If Haiku produces malformed output twice in a row, escalate to Sonnet (see [Escalation](#escalation) below).

**2. Does the task follow a known pattern but require local judgement?**
Matching output to a style guide. Ingesting a document and deciding what to merge versus create. Writing code against an existing pattern. Reviewing a diff for correctness or style violations. Classifying or scoring content against defined criteria.
- **→ Sonnet.**

**3. Does the task involve architectural tradeoffs, ambiguous requirements, or novel synthesis?**
"Should we design this as X or Y?" Refactoring across multiple agents or swarms. Designing a new skill, swarm, or schema from scratch. Evaluating risk across options. Reading a whole codebase to reason about its structure.
- **→ Opus.**

If you genuinely cannot decide between two tiers, pick the cheaper one and let escalation handle failures. Most surprise costs come from running Opus on tasks Haiku or Sonnet could have handled.

---

## Why three tiers

Each tier trades cost for capability. The relative ordering holds even as specific prices change:

```
Haiku  <<  Sonnet  <<  Opus
(cheapest)            (most capable)
```

**Prompt caching flips the math in batch contexts.** A Sonnet call with a large cached system prompt and a short delta can land cheaper per turn than a non-cached Haiku call of similar total size. When building a loop that reuses the same context repeatedly, design for cache hits first — then pick the cheapest model that meets quality.

**Batch API:** for high-volume non-interactive work, consider the Anthropic Batch API. It reduces cost further on bulk runs where latency is not a constraint.

---

## Generic worked examples

| Task | Pin | Why |
|---|---|---|
| Register a new external service (append config + patch JSON) | haiku | Regex validation + text append. No judgement required. |
| Regenerate a status dashboard from a script | haiku | Runs a deterministic script, echoes output. No interpretation. |
| Template-fill 30 content drafts from a brand voice doc | haiku | Mechanical substitution. Output goes to a human review gate before publish. |
| Ingest a new source document into the wiki | sonnet | Merge judgement + naming conventions + disambiguation between existing pages. |
| Review a pull request diff for style violations | sonnet | Pattern-matching with judgement — style violations are not always mechanical. |
| Verify a draft against production rules and brand voice | sonnet | Judgement-bearing gate; errors here block downstream publish. |
| Design a new swarm from scratch | opus | Cross-domain architectural tradeoffs, novel synthesis. |
| Evaluate audit findings and propose the highest-leverage improvement | opus | Strategic reasoning across multiple context sources; bad prioritization compounds. |
| Orchestrate a pipeline of model-pinned subagents | haiku | Pure dispatch; judgement lives inside the subagents, not the orchestrator. |

---

## Escalation

If a Haiku-pinned command or skill produces output that fails its own validation twice in a row (regex mismatch, JSON parse failure, schema violation), do not loop a third time. Escalate to Sonnet with an explicit note:

> Escalated to Sonnet after 2 Haiku validation failures. Original task: `<name>`. Failure signal: `<validation error>`.

Log the escalation as a single line at the end of the turn. Repeated escalations on the same task are a signal that the task's mechanical checklist is underspecified — open a follow-up to tighten it rather than permanently re-pinning to Sonnet.

---

## Convention: every command and skill must declare its model

Every file under `.claude/commands/` and every `SKILL.md` under `.claude/skills/` MUST:

1. Declare `model: haiku | sonnet | opus | inherit` in YAML frontmatter.
2. Register a row in the corresponding pin catalog in the **same change**.

`inherit` is acceptable when a task's complexity genuinely varies by invocation — but prefer an explicit pin. Undocumented model choice defaults to the harness default (often the most expensive model), turning ambiguity directly into cost.

---

## How to change a pin

When a command or skill is repeatedly escalating (Haiku failing validation) or is clearly over-pinned (Opus doing mechanical work):

1. Update `model:` in the frontmatter.
2. Update the row in the pin catalog.
3. Note the reason in `wiki/log.md`:

```
[YYYY-MM-DDTHH:MM:SSZ] PIN-CHANGE target="/<name-or-skill>" from=<old> to=<new> reason="<1-line>"
```

Too many pin flips on one command or skill signal that the underlying specification is underspecified. Fix the spec rather than chasing the right model indefinitely.

---

## Related

- [`docs/conventions/command-model-pins.md`](command-model-pins.md) — per-command pin catalog
- [`docs/conventions/skill-model-pins.md`](skill-model-pins.md) — per-skill pin catalog
- [`docs/conventions/skill-conventions.md`](skill-conventions.md) — skill authoring rules (includes model-pin requirement)
