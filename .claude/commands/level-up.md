---
name: level-up
description: Improvement-queue ritual — apply the Three Ms (Mindset / Method / Machine) to the top audit gaps and emit an EAD-ordered, prioritized capability improvement queue. Reads up to 4 prior audits to detect compounding patterns. Third of three OS rituals.
model: opus
---

# /level-up

The third of three OS rituals: `/onboard` → `/audit` → `/level-up`.

`/level-up` translates audit gaps into concrete capability proposals. Opus-pinned — this is the highest-leverage strategic output of the OS. The Three Ms enforce the EAD ordering: Eliminate before Automate before Delegate. The output is a numbered proposal queue, not an implementation plan.

Framework: `docs/ai-os-framework.md` (Three Ms + EAD discipline).

---

## Inputs

| Input | Source | Notes |
|---|---|---|
| Latest audit | `wiki/wiki/_meta/Meta - OS Audit.md` | If absent or older than 7 days, run `/audit` first. |
| Prior audits (up to 4) | `wiki/wiki/_meta/history/audit-*.md` (most recent 4) | Used to detect compounding gaps. |
| Recent git log | `git log --since="14 days ago" --oneline` | Grounds proposals in what is actually moving. |
| Active capabilities | `.claude/commands/*.md`, `.claude/skills/` (Glob) | Verify named skills exist before listing them as composable. |
| Operator imprint | `operators/<slug>/IMPRINT.md` | Understand declared goals; proposals must align. |

---

## Output

Write two files with identical content:

1. `wiki/wiki/_meta/Meta - OS Level-Up.md` (latest — overwrites)
2. `wiki/wiki/_meta/history/levelup-<DATE>.md` (archive — never overwrites)

### File template

```markdown
---
title: Meta - OS Level-Up
type: meta
tags: [framework, operations, synthesis, capability-plan]
summary: Three-Ms proposal queue over top-3 audit gaps from <DATE>. EAD-ordered. Accept/reject manually.
updated: <DATE>
deprecated: false
disputed: []
---

# OS Level-Up — <DATE>

Audit input: [[Meta - OS Audit]] (<DATE>).
Compounding gaps (appeared in 2+ of the last 4 audits) are flagged.

## Proposal queue

### Proposal 1 — <Title>

**Gap:** <restate from audit, with C layer (Context / Connections / Capabilities / Cadence)>
**Compounding:** <yes — appeared in N of last 4 audits / no — first occurrence>

**Mindset.** To what extent can AI be leveraged here?
<2–3 sentences. Be specific about what AI adds vs. what is deterministic.>

**Method.**

- **Constraint:** <the single bottleneck this gap creates for downstream work>
- **EAD:**
  - **Eliminate:** <Can this work be removed entirely? If yes, recommend that and stop. If no, state why not in one sentence.>
  - **Automate:** <Deterministic pipeline that closes the gap — hooks, scripts, scheduled runs. Be specific.>
  - **Delegate:** <Model-mediated work that requires judgment — only invoke if Automate is insufficient.>
- **Process map:**
  1. Input: <what triggers this>
  2. Step: <action → output>
  3. Step: <action → output>
  4. Output: <what is delivered>

**Machine.** Concrete proposal:

- **Type:** `composite-skill` | `slash-command` | `hook` | `schedule-entry` | `wiki-page` | `swarm`
- **Name:** `<proposed-slug>`
- **Composes:** <list existing skills/commands this reuses — verified against live `.claude/` — or "(new, no existing parts)">
- **Model pins:** <per-step if composite; single pin if monolithic>
- **First test:** <what to run on Day 1 to verify the proposal delivers>
- **Cost tier:** `haiku-cheap` | `sonnet-mid` | `opus-strategic`

---

### Proposal 2 — <Title>

<same structure>

---

### Proposal 3 — <Title>

<same structure>

---

## Decision queue

| # | Title | Type | Cost tier | Status |
|---|---|---|---|---|
| 1 | <title> | <type> | <tier> | proposed |
| 2 | <title> | <type> | <tier> | proposed |
| 3 | <title> | <type> | <tier> | proposed |

Update `Status` to `accepted` / `rejected` / `deferred` as decisions are made.
Implementation is a separate cycle — accepted proposals become `/gsd-plan-phase` inputs or direct build tasks.
```

---

## EAD discipline

**Eliminate first.** If the gap can be closed by removing the work entirely — a chore that no longer needs to happen, a connection that should be cut, a capability that is being maintained for no one — say so and stop. Do not propose automation. The cheapest capability is the one never built.

**Automate before Delegate.** Deterministic pipelines (Haiku, scripts, hooks, scheduled runs) beat agentic delegation when both can do the job. A hook that runs a linter is more durable than a Sonnet skill that does the same check. Prefer explicit over agentic.

**Delegate last.** Model-mediated work is powerful but not free and not always predictable. Delegate only what genuinely requires judgment and cannot be reduced to a deterministic step.

**Workflows beat agents.** A composite skill — a sequence of model-pinned subagents with isolated failure surfaces — is almost always cheaper, more debuggable, and more durable than a single open-ended agent. Each step gets its own model, its own context window, and its own audit trail.

---

## Compounding-gap rule

A gap that appears in the **current audit AND in 2 or more of the prior 4 audits** is compounding. Treat it differently:

1. **Mindset:** open with "This gap has resisted resolution N times. What is the actual constraint we keep missing?" before offering a proposal.
2. **Method:** the compounding history is evidence that the obvious fix has already been tried or considered. Look for the upstream cause, not the symptom.
3. **Machine:** allowed to recommend a more invasive change (refactor, deprecation, schema migration) than a single-audit gap would warrant.

---

## Proposal ranking

The `/audit` top-3 ranking is by leverage. Carry it through. Do not re-rank unless you have a specific reason (state it explicitly). A gap that blocks five downstream capabilities outranks a gap of equal severity that affects only one manual step.

---

## Process

1. Read all inputs. Note today's date; resolve relative dates in git log to absolute.
2. Identify the top-3 gaps from the latest audit. Check prior audits for compounding (count occurrences).
3. For each gap, walk the Three Ms in order. Do not skip EAD steps.
4. Before naming any existing skill or command in a Machine proposal: `Glob .claude/skills/` and `.claude/commands/` to confirm it exists. If a named skill is absent, mark it as `(verify — not found at time of proposal)`.
5. Write both output files.
6. Print to chat: a 3-row decision table (`# | Title | Type | Cost tier`) plus the line "Review and update Status in `wiki/wiki/_meta/Meta - OS Level-Up.md`. Accepted proposals are the next build queue."

---

## Anti-patterns

**Proposing a new skill when a composite exists.** Always check for reusable parts first. New skills have maintenance cost; composition is free.

**Mind-reading.** Do not infer constraints not present in the audit. If the audit lacks signal, the right move is `/audit` again with sharper inputs — not speculation.

**Skipping EAD.** Every proposal explicitly walks Eliminate → Automate → Delegate. Jumping to Delegate because it is the most interesting step is the most common failure mode.

**Monolithic agent proposals.** A single long-prompt agent is rarely the right Machine output. Decompose into model-pinned subagents with clear handoffs.

**Over-scoped proposals.** Each proposal must be testable in a single session on Day 1. If the "first test" step cannot be run immediately, the proposal is too big — split it.

---

## When to run

- Weekly, immediately after `/audit`.
- After a major structural change (new swarm, new domain, large wiki refactor) where the audit surfaces new gaps.
- When a prior Level-Up queue has been fully resolved (accepted, rejected, or deferred) and a new queue is needed.
