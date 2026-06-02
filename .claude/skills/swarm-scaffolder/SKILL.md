---
name: swarm-scaffolder
description: Scaffolds a new conformant multi-agent swarm under swarms/ against swarms/PROTOCOL.md, producing CLAUDE.md, agents/ (orchestrator, worker, validator stubs), role-registry.md, a validation-contract stub, and a builds/ directory so the result passes all 7 protocol conformance checks. Invoke when an operator asks to "create a new swarm for X", "set up a multi-agent workflow to do Y", or "scaffold a swarm that handles Z". Use only when the task genuinely requires multiple roles, multiple sessions, or adversarial validation — if it fits in one context window, use a composite skill instead.
model: sonnet
---

# swarm-scaffolder

Produces a skeleton swarm conformant to `swarms/PROTOCOL.md` from a brief description of the swarm's purpose. Every file it creates is designed to pass all 7 protocol conformance checks run by `swarm-conform`.

**Before scaffolding:** confirm the work genuinely needs a swarm. A swarm is warranted when the task requires multiple roles with adversarial validation, spans multiple sessions, or involves state too large for one context window. If a composite skill would cover it, use that instead.

---

## Step 1 — Capture the brief

Gather from the operator:

1. **Swarm name** — kebab-case, descriptive noun phrase (e.g., `content-production-swarm`, `client-research-swarm`)
2. **Purpose** — one paragraph: what the swarm builds or produces, who consumes the output
3. **Phases** — the major build phases (each becomes a Worker agent file)
4. **Paradigm** — Linear-Missions (sequential phases, one build at a time) or Parallel-Research (fan-out domain research, then synthesize). If unclear, ask — the paradigm determines the control-plane shape and assertion patterns.

Do not proceed until all four are confirmed.

---

## Step 2 — Scaffold the directory structure

Create:

```
swarms/<swarm-name>/
├── CLAUDE.md
├── agents/
│   ├── orchestrator.md
│   ├── worker-<phase-1>.md
│   └── validator.md
├── role-registry.md
├── validation-contracts/
│   └── .gitkeep
└── builds/
    └── .gitkeep
```

Add one `worker-<phase>.md` per phase identified in Step 1. Name files after the phase, not after roles or numbers alone (prefer `worker-research.md` over `worker-2.md`).

---

## Step 3 — Populate each file

### CLAUDE.md

```markdown
# <Swarm Name>

Startup document for the <swarm-name> swarm.

**Protocol:** This swarm operates under [`swarms/PROTOCOL.md`](../../swarms/PROTOCOL.md). In any conflict between this file and the protocol, the protocol wins.

**Paradigm:** <Linear-Missions | Parallel-Research> — see [`swarms/PROTOCOL.md`](../../swarms/PROTOCOL.md) for the paradigm definition and its implications for orchestration, worker dispatch, and validation.

## Purpose

<One-paragraph description from Step 1>

## Phases

<Numbered list of phases, each mapped to its Worker agent file>

## Startup

1. Read `swarms/PROTOCOL.md` fully before any agent begins work.
2. Read `role-registry.md` to confirm model assignments.
3. The Orchestrator reads the brief and authors a validation contract before dispatching any Worker.
4. Workers run one phase at a time. No Worker reads another Worker's in-flight state.
5. Validators run at milestone boundaries with fresh context only.

## HITL

All operator escalations use the canonical HITL block from `swarms/_protocol/hitl-block.md`. No paraphrasing.
```

### agents/orchestrator.md

```markdown
# Orchestrator

**Role:** Orchestrator
**Model:** See `role-registry.md`

## Responsibilities

- Read the brief and ask the operator strategic questions before any work begins.
- Author the validation contract at `validation-contracts/<slug>.md` before dispatching any Worker.
- Emit and own the control plane (builds index). Update it after each Worker completes or stalls.
- Dispatch Workers one phase at a time. Do not implement features directly.
- Escalate to the operator via HITL when a decision requires human judgment. Use the canonical HITL block from `swarms/_protocol/hitl-block.md`.

## Planning protocol

1. Read the brief in full.
2. Identify open questions — list them, ask the operator, resolve before dispatching.
3. Author the validation contract using `validation-contract author <swarm-name> <slug>`.
4. Update the control plane: create a row in the Active Builds table with status PLANNING.
5. Dispatch Worker 1. Monitor for handoffs. When Worker N completes, dispatch Worker N+1.
6. After all Workers complete, dispatch the Validator with fresh context.
7. When the Validator passes all assertions, mark the build COMPLETE in the control plane.
```

### agents/worker-<phase>.md (one per phase)

```markdown
# Worker — <Phase Name>

**Role:** Worker
**Phase:** <phase name>
**Model:** See `role-registry.md`

## Inputs

- Build spec: `builds/<slug>.md`
- Control plane: (read your row only)
- Handoff from previous Worker (if any): `handoff/<slug>-handoff.md`

## Responsibilities

1. Read the build spec and your phase's scope.
2. Produce the artifacts for this phase. Record verifiable output (IDs, file paths, exit codes) — not narrative claims.
3. Update your row in the control plane when the phase is complete or stalled.
4. Write a handoff document if you cannot continue: `handoff/<slug>-handoff.md` using `swarms/_protocol/handoff-schema.md`.
5. Never read another Worker's in-flight state. All cross-Worker information flows through the control plane.

## Output contract

List the artifacts this phase must produce. The Validator checks these against the validation contract.
```

### agents/validator.md

```markdown
# Validator

**Role:** Validator
**Model:** See `role-registry.md`

## Fresh context requirement

A Validator must never share context with the Worker whose output it is checking. Open a new session or subagent for every validation run. Shared context eliminates the adversarial signal and is a protocol violation.

## Two flavors

**Scrutiny validator** — run first:
1. Read the validation contract at `validation-contracts/<slug>.md`.
2. Read each Worker artifact listed in the contract.
3. For each assertion, record: satisfied / failed / pending with evidence (file path, exit code, content excerpt).
4. Update `coverage_pct` in the contract frontmatter.
5. Report: if any assertion is `failed`, block the "done" claim and escalate to the Orchestrator.

**User-testing validator** — run when the deliverable is live:
1. Exercise the deliverable end-to-end as a user would.
2. Record pass/fail for each user-facing assertion in the contract.
3. Flag HITL items where automation cannot substitute for human judgment.

## Output

Write findings to the validation contract. Do not modify Worker artifacts.
```

### role-registry.md

```markdown
# Role Registry — <Swarm Name>

Model assignments for every agent role in this swarm. Conforms to `swarms/_protocol/role-registry-schema.md`.

| Role | Agent file | Model | Rationale |
|---|---|---|---|
| Orchestrator | agents/orchestrator.md | opus | Planning judgment is the most consequential part of the build; a wrong plan propagates N× through Workers. |
| Worker — <phase-1> | agents/worker-<phase-1>.md | sonnet | Implementation with local judgment; Haiku is appropriate only for pure template-fill phases. |
| Validator | agents/validator.md | sonnet | Pattern-matching against the validation contract with judgment; Opus where behavior is ambiguous. |
```

Add one Worker row per phase. Use Haiku for phases that are pure template fill with no judgment.

---

## Step 4 — Verify against the 7 conformance checks

Before handing off to the operator, confirm each check from `swarms/PROTOCOL.md § Conformance Test`:

```
1. CLAUDE.md references swarms/PROTOCOL.md                     [ ]
2. Agent files map cleanly to Orchestrator / Worker / Validator [ ]
3. Handoff schema reference points to _protocol/handoff-schema.md  [ ]
4. Control plane shape matches _protocol/control-plane-schema.md   [ ]
5. HITL blocks reference _protocol/hitl-block.md                   [ ]
6. validation-contracts/ directory exists (ready for contracts)    [ ]
7. role-registry.md exists and covers every role in agents/        [ ]
```

Report any gap and fix it before handing off. The operator will run `swarm-conform <swarm-name>` to verify — scaffold it so that run passes clean.

---

## Step 5 — Operator handoff

After scaffolding, tell the operator:

1. What was created (file list with paths).
2. What to fill in next (Worker phases' output contracts, Orchestrator planning prompts, role-registry model choices).
3. How to verify: "Run `swarm-conform <swarm-name>` to confirm all 7 checks pass before the first build."
4. How to begin a build: "Author a validation contract with `validation-contract author <swarm-name> <slug>` before dispatching any Worker."

---

## What not to do

- Do not scaffold a swarm for work that fits in one context window — use a composite skill.
- Do not leave placeholder text in `CLAUDE.md` — fill in the purpose, phases, and paradigm from Step 1.
- Do not create a Validator that shares context with any Worker — the fresh-context requirement is load-bearing.
- Do not conflate roles: no agent file spans Orchestrator + Worker or Worker + Validator.
- Do not invent a local handoff format — always reference `swarms/_protocol/handoff-schema.md`.
- Do not add fields to the role-registry beyond the schema — propose protocol changes through `swarms/PROTOCOL.md`.

---

## Related

- `swarms/PROTOCOL.md` — the protocol this skill scaffolds against; read before any structural decision
- `swarm-conform` — verifies conformance after scaffolding; run before the first build
- `validation-contract` — authors the pre-build assertion contract the Orchestrator must complete
- `docs/protocols/capability-extension.md` — when a swarm vs. a composite skill is the right choice
- `docs/protocols/multi-agent-coordination.md` — conceptual rationale behind the role taxonomy
