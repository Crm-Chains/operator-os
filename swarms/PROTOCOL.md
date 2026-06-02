# Swarm Protocol

Canonical multi-agent protocol for every swarm in this operator OS. Swarm-specific files (`<swarm>/CLAUDE.md`) MUST reference this file. In any conflict between a swarm-local document and this file, this file wins.

---

## Role Taxonomy

Every swarm composes its agents into exactly three roles. A single agent process plays one role per build. **Roles must not be conflated.**

### Orchestrator

The Orchestrator plans and coordinates. It does not implement.

Responsibilities:
- Reads the brief and asks the operator strategic questions before any work begins
- Authors the **validation contract** — a list of correctness assertions written *before any Worker runs*
- Emits and owns the **control plane** — the single source of truth for what is in flight and who owns it
- Dispatches Workers; reassigns when a Worker stalls, completes, or escalates
- May delegate read-only research sub-tasks; must never implement a feature itself

Default model: **Opus** — planning judgment is the most consequential part of the build; a wrong plan propagated through N Workers produces N× wrong output.

### Workers

Workers implement. One feature or phase at a time. Clean context per assignment.

Contract:
- Read the spec, read only the slice of state they own, then produce verifiable artifacts (IDs, file paths, hashes, exit codes)
- Write a handoff when they cannot continue (token ceiling, HITL pending, session end, seat reassignment)
- Never read another Worker's in-flight state — cross-Worker information flows only through the control plane and the handoff archive
- Read-only operations (search, list, doc lookup) may parallelize inside a Worker's turn; write operations are serial

Default model: **Sonnet** for implementation; **Haiku** for pure template-fill phases (no judgment required).

### Validators

Validators verify. Fresh context only — they have never seen the implementation.

Two flavors:
- **Scrutiny validator** — runs lint, type checks, schema checks, and reviews each output against the validation contract. Reads artifacts; does not interact with live systems.
- **User-testing validator** — exercises the live deliverable end-to-end. May require HITL where automation is not viable.

Validators run at milestone boundaries and before any "done" claim. **A build is not done until every assertion in the validation contract passes.**

Default model: **Sonnet**; **Opus** where ambiguous behavior requires deeper judgment.

---

## No-Role-Conflation Rule

The following are banned in every swarm:

- An Orchestrator that writes code, calls implementation APIs, or edits artifacts (it plans; Workers build)
- A Worker that updates another Worker's control-plane row (own your row only)
- A Validator that has shared context with the Worker whose output it is checking (fresh context is the adversarial signal)
- Any agent that fulfills two roles in the same build turn (e.g. "plan and build Phase 1 simultaneously")

---

## Swarm Structure

A conformant swarm has this layout:

```
<swarm>/
├── CLAUDE.md                    ← Startup doc. Must reference swarms/PROTOCOL.md.
├── agents/                      ← Agent prompt files, one per phase/role
│   ├── orchestrator.md          ← Orchestrator agent (planning, contract authoring)
│   ├── worker-<phase>.md        ← One per phase or feature
│   └── validator.md             ← Scrutiny + user-testing validator(s)
├── role-registry.md             ← Model-per-role assignments (schema: _protocol/role-registry-schema.md)
├── <control-plane>.md           ← build-index.md or equivalent (schema: _protocol/control-plane-schema.md)
├── validation-contracts/
│   └── <slug>.md                ← Pre-build assertion contracts, one per active build
└── handoff/
    ├── <slug>-handoff.md        ← Active handoffs (schema: _protocol/handoff-schema.md)
    └── archive/                 ← Acknowledged handoffs, append-only
```

The `agents/` directory holds all agent prompt files. Every file in `agents/` must map to exactly one role (Orchestrator, Worker, or Validator) — no ambiguous or dual-role files.

---

## Five Communication Patterns

Every coordination event in a swarm uses exactly one of these patterns.

| # | Pattern | Allowed where |
|---|---|---|
| 1 | **Delegation** — parent dispatches child, child returns result | Universal — Orchestrator to Workers, Workers to read-only sub-agents |
| 2 | **Creator-verifier** — builder produces, fresh-context verifier checks | Universal — every Worker output goes through a Validator before "done" |
| 3 | **Direct (peer-to-peer)** — agents exchange state without a coordinator | **Banned.** State flows through the control plane and handoffs only. |
| 4 | **Negotiation** — agents coordinate over a shared resource | Allowed only with an explicit shared protocol (e.g. row ownership in the control plane) |
| 5 | **Broadcast** — one sender, many receivers | Universal — control-plane updates, milestone notifications |

Banning pattern 3 is the most important rule. Direct peer-to-peer communication bypasses the control plane, produces invisible state changes, and creates the inconsistency the protocol is designed to prevent.

---

## Serial Execution with Internal Parallelization

Workers run serially within a phase — one Worker is "writing" at a time per build. This is intentional. Concurrent writers create conflicts, duplicated decisions, and inconsistent state that erases any speed benefit.

What does parallelize:
- Read-only operations inside a Worker's turn
- Code review and output review inside a Validator's turn
- Separate builds running concurrently (one seat per build)

The **Parallel-Research exception**: an Orchestrator may fan out peer Workers for domain research, then collect outputs before any writes occur. This is explicitly gated by the Orchestrator — never an emergent side effect of Workers deciding to coordinate.

---

## Anti-Patterns (Universal)

Banned in every swarm:

- **Shared Builder/Validator context** — a Validator with the Builder's context produces no adversarial signal
- **Contract authored after build start** — post-hoc test coverage is not a contract
- **Agent narrative as state** — state must be verifiable (IDs, file hashes, exit codes), not "agent says it worked"
- **Hard-coded orchestration in code** — logic lives in markdown prompts/skills so the system improves with each model release; bookkeeping (validation runners, gating) is the only deterministic logic allowed
- **Cross-build context bleed** — a Worker on Build A never reads Build B's per-build state
- **Skipping the handoff** — never leave a mid-phase build without a handoff document

---

## Conformance Test

A swarm conforms to this protocol when all of the following hold. Run this checklist before declaring a swarm ready for use.

1. **`CLAUDE.md` references `swarms/PROTOCOL.md`** — the startup document explicitly points to this file so any agent entering the swarm loads the protocol.

2. **Agent files map cleanly to Orchestrator / Worker / Validator** — every file in `agents/` is annotated with its role; no file spans two roles; no role is unrepresented.

3. **Handoffs use `_protocol/handoff-schema.md`** — all `handoff/<slug>-handoff.md` files follow the canonical schema; no local field additions.

4. **Control plane matches `_protocol/control-plane-schema.md`** — the swarm's `<control-plane>.md` has the required sections (Active Builds, Pending Handoffs, Resource Locks, Seat Registry, Completed Builds, Sync Conflict Log) and the canonical column shape.

5. **HITL blocks use `_protocol/hitl-block.md`** — all HITL escalations in agent prompts and per-build state files use the exact canonical block format; no paraphrasing.

6. **Validation contracts are authored before any Worker runs** — every active build has a `validation-contracts/<slug>.md` with `authored_at` predating the first Worker run timestamp; `assigned_to` is not `unassigned` for any assertion at planning sign-off; contract lints clean per `_protocol/validation-contract.md`.

7. **`role-registry.md` declares ≥1 model per role** — the registry file exists at swarm root, covers every role present in `agents/`, and has a non-placeholder model + rationale for each.

The `swarm-conform` skill runs this checklist automatically and reports gaps.

---

## Related

- [`_protocol/handoff-schema.md`](_protocol/handoff-schema.md) — canonical handoff format
- [`_protocol/control-plane-schema.md`](_protocol/control-plane-schema.md) — control-plane column shape and edit rules
- [`_protocol/hitl-block.md`](_protocol/hitl-block.md) — canonical HITL block format
- [`_protocol/role-registry-schema.md`](_protocol/role-registry-schema.md) — model-per-role registry schema
- [`_protocol/validation-contract.md`](_protocol/validation-contract.md) — validation contract schema and authoring rules
- [`docs/protocols/multi-agent-coordination.md`](../docs/protocols/multi-agent-coordination.md) — the conceptual rationale behind this protocol
