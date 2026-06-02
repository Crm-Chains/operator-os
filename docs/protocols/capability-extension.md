# Meta-Protocol 0.3 — Capability Extension

**What it governs:** how the OS grows itself — discovering, creating, and governing new skills, commands, and swarms.

The OS is not static. Every time an operator identifies a recurring task, a gap in the audit, or an improvement proposed by `/level-up`, the Capability Extension protocol is the path from "this should exist" to "this works and is conformant."

---

## The core idea

> The OS should be able to build its own next capability.

A mature operator-os instance does not require the operator to hand-author every new skill from scratch. The factory — `find-skills`, `skill-creator`, and the swarm scaffolder — exists to produce conformant, model-pinned capabilities from a brief description of the need. The operator's job is to describe the capability and review the output, not to write the boilerplate.

This is the self-improvement flywheel: `/level-up` identifies gaps → the operator describes the needed capability → the factory scaffolds it → the operator reviews and activates it → `/audit` confirms the gap is closed.

---

## Always-on bootstrap: `find-skills`

`find-skills` is the first skill every operator learns and the one they never stop using. It answers the question: "does a skill for this already exist?"

Before authoring any new capability:
1. Invoke `find-skills` with a description of what you need
2. If a matching skill exists — use it; do not create a duplicate
3. If a partial match exists — consider composing existing skills rather than building from scratch
4. If nothing matches — proceed to `skill-creator`

`find-skills` searches the `.claude/skills/` directory and, for operators with the wiki connected, the wiki's capability catalog. It returns matches ranked by relevance with a brief description of what each does.

**Why always-on?** Duplicate skills are a maintenance liability. Two skills that do approximately the same thing drift apart over time, accumulate separate bugs, and confuse agents routing by name. The cost of running `find-skills` is trivial; the cost of a duplicate skill is compounding.

---

## Creating a new skill: `skill-creator`

When `find-skills` returns no match, `skill-creator` scaffolds a new conformant skill from a description of the need.

**Input:** a plain-language description of what the skill should do, including:
- The trigger (what situation calls for this skill)
- The action (what the skill does, step by step at a high level)
- The output (what artifact or state change results)
- The model appropriate for this work (Haiku for deterministic, Sonnet for judgment, Opus for strategy)

**Output:** a populated `SKILL.md` in `.claude/skills/<skill-name>/` conforming to the skill conventions, ready for operator review.

**The operator's job after scaffolding:**
1. Read the generated `SKILL.md` — verify the trigger, steps, model pin, and output match the intent
2. Activate it by running it once against a known case
3. Register the model pin in the command model pins catalog (if it is a command)
4. Document it in the wiki's capability catalog page

---

## Skill conventions (summary)

Every skill in `.claude/skills/` must conform to the conventions documented in [`docs/conventions/skill-conventions.md`](../conventions/skill-conventions.md). Key invariants:

**Structure:**
- Lives at `.claude/skills/<skill-name>/SKILL.md`
- Has a `model:` declaration in frontmatter
- Has a `trigger:` field describing when it should be invoked
- Has a `description:` field suitable for `find-skills` to match against

**Model pinning:**
- Every skill declares the model appropriate for its work — not the most capable model available, but the right one for the task
- Haiku: deterministic operations, template fills, diffs, count operations
- Sonnet: judgment calls, bounded implementation, review tasks
- Opus: strategic synthesis, architectural decisions, adversarial critique

**Composition over creation:**
- A new skill that calls two existing skills is preferred to one that re-implements their logic
- The `model:` pin on the composite is the orchestration model; each sub-invocation uses its own pin

---

## Scaffolding a new swarm or agent

When an operator needs a multi-agent workflow (too complex or too long for a single skill), the swarm scaffolder produces a skeleton conformant to `swarms/PROTOCOL.md`.

**What the scaffolder produces:**
- `swarms/<swarm-name>/CLAUDE.md` — points up to `swarms/PROTOCOL.md`; contains the swarm's brief and startup instructions
- `swarms/<swarm-name>/agent-orchestrator.md` — Orchestrator role agent file
- `swarms/<swarm-name>/agent-worker.md` — Worker role template (rename per phase/domain)
- `swarms/<swarm-name>/agent-validator.md` — Validator role agent file
- `swarms/<swarm-name>/role-registry.md` — model-per-role assignments (filled in by the operator)
- `swarms/<swarm-name>/validation-contracts/` — directory for pre-build contracts

**The operator's job after scaffolding:**
1. Fill in the Orchestrator's brief and planning prompts
2. Define the Worker phases and their artifact contracts
3. Fill in the `role-registry.md` model assignments
4. Run `swarm-conform` to verify conformance before the first build

See [Meta-Protocol 0.2](multi-agent-coordination.md) for the role taxonomy and conformance criteria.

---

## Command model pins — mandatory governance

Every command in `.claude/commands/` must declare a `model:` field in its frontmatter. This is not optional — it is enforced by the pre-commit hook.

Commands without model pins are non-deterministic in cost and capability. Two operators running the same command on different machines may get different model behavior because Claude Code selects a default. Model pins eliminate this variance.

**Registration:** when a command is created or its model pin changes, the operator registers it in `docs/conventions/command-model-pins.md`. This catalog is the source of truth for "which command runs at what cost."

---

## The self-improvement flywheel

```
/audit
  identifies gap
       │
       ▼
/level-up
  proposes capability (EAD-ordered)
       │
       ▼
find-skills
  confirms no duplicate exists
       │
       ├── match found → use existing skill or compose
       │
       └── no match → skill-creator scaffolds new skill
                           │
                           ▼
                    operator reviews + activates
                           │
                           ▼
                    wiki capability catalog updated
                           │
                           ▼
                    next /audit closes the gap
```

Each cycle makes the OS more capable. The gap that required human intervention this cycle may be fully automated next cycle.

---

## Anti-patterns

**Building without finding first.** Running `skill-creator` without first running `find-skills` produces duplicates. Always find before building.

**Skipping the model pin.** An unpinned skill or command is a hidden cost driver. Every skill and command gets a pin — before it is activated.

**Authoring a skill for a one-off task.** Skills are for recurring needs. If you are doing something once, do it inline. Skills justify their maintenance cost only when they run repeatedly.

**A swarm as a glorified prompt.** If the work fits in one context window, it does not need a swarm. Use a composite skill instead. Swarms are for builds that require multiple roles, multiple sessions, or validation by a fresh-context adversary.

**Diverging from `swarms/PROTOCOL.md`.** A swarm that invents its own handoff format or coordination pattern is not conformant and will fail the `swarm-conform` check. Extend the protocol through the defined extension points, not by ignoring it.

---

## Related

- [`docs/conventions/skill-conventions.md`](../conventions/skill-conventions.md) — full skill authoring rules
- [`docs/conventions/command-model-pins.md`](../conventions/command-model-pins.md) — the command pin catalog
- [`docs/conventions/model-orchestration.md`](../conventions/model-orchestration.md) — Haiku / Sonnet / Opus decision tree
- [Meta-Protocol 0.2 — Multi-Agent Coordination](multi-agent-coordination.md) — swarm conformance contract
- [`swarms/PROTOCOL.md`](../../swarms/PROTOCOL.md) — the detailed swarm protocol
- [`docs/ai-os-framework.md`](../ai-os-framework.md) — Capabilities layer in the Four Cs
