# Meta-Protocol 0.2 — Multi-Agent Coordination

**What it governs:** the conceptual contract that every swarm in the OS must conform to.

The detailed conformance rules and schemas live in [`swarms/PROTOCOL.md`](../../swarms/PROTOCOL.md) and [`swarms/_protocol/`](../../swarms/_protocol/). This document explains *why* the protocol is structured the way it is, so operators can author conformant swarms rather than just copy them.

---

## The core insight

> Naive parallelism costs more than it saves. Coordination is the product.

The intuition "N agents = N× throughput" fails for knowledge work and artifact production. When agents operate without a shared coordination contract, they:

- Make inconsistent decisions about the same facts
- Duplicate work or build on each other's in-flight (unverified) outputs
- Produce no audit trail — "the agent said it worked" is not a verifiable artifact
- Fail in ways that are invisible until a downstream agent inherits the corrupted state

The protocol replaces intuition with discipline: clear roles, controlled information flow, explicit validation, and a canonical format for every coordination event.

---

## Role taxonomy

Every swarm composes its agents into three roles. A single Claude Code process may play one role per build. Roles must not be conflated.

### Orchestrator

The Orchestrator plans and coordinates. It does not implement.

Responsibilities:
- Reads the brief and asks the operator strategic questions
- Authors the **validation contract** — a list of correctness assertions written *before any Worker runs*
- Emits and updates the **control plane** — the single source of truth for what is in flight and who owns it
- Dispatches Workers; reassigns when a Worker stalls or completes
- May delegate read-only research sub-tasks but must never implement a feature itself

The Orchestrator runs on the highest-capability model (Opus by default) because its judgment during planning is the most consequential part of the build. A wrong plan, propagated through N Workers, produces N× wrong output.

### Workers

Workers implement. One feature or phase at a time. Clean context per assignment.

The contract:
- Read the spec, read only the slice of state they own, then produce verifiable artifacts (IDs, files, hashes, exit codes)
- Write a handoff when they cannot continue (token ceiling, HITL pending, session end)
- Never read another Worker's in-flight state — cross-Worker information flows only through the control plane and handoff archive
- Read-only operations (search, list, doc lookup) may parallelize inside a Worker's turn; write operations are serial

Workers run on a mid-tier model (Sonnet; Haiku for pure template-fill phases) — fast enough to produce code and artifacts, capable enough to make bounded implementation decisions.

### Validators

Validators verify. Fresh context only — they have never seen the implementation.

Two flavors:
- **Scrutiny validator** — runs lint, type checks, schema checks, and reviews each output against the validation contract. Reads artifacts; does not interact with live systems.
- **User-testing validator** — exercises the live deliverable end-to-end. May require human-in-the-loop (HITL) where automation is not viable.

Validators run at milestone boundaries and before any "done" claim. **A build is not done until every assertion in the validation contract passes.** Validators run on Sonnet; Opus for cases requiring ambiguous-behavior judgment.

---

## The validation contract

The validation contract is the load-bearing artifact of the protocol.

It is a list of correctness assertions written by the Orchestrator during planning, before any Worker runs. Each assertion is assigned to the Worker responsible for satisfying it. The sum of all Worker outputs must cover every assertion. Validators run against the contract — not against their own intuitions about what "done" means.

**Why it matters:** writing the contract before building forces the Orchestrator to be explicit about what success looks like. It prevents the common failure mode where a build is "done" because the agent says so rather than because a specified criterion was checked.

The contract format is defined in [`swarms/_protocol/validation-contract.md`](../../swarms/_protocol/validation-contract.md).

---

## Handoff discipline

A Worker that cannot complete its assignment writes a handoff. This is not optional. A mid-phase build with no handoff is a protocol violation.

**Handoff trigger conditions:**
- Token ceiling approaching mid-phase — stop building immediately, write the handoff
- Pausing to handle another assignment
- HITL escalation pending (Worker cannot proceed without human action)
- Session end with mid-phase work
- Seat reassignment

The handoff must contain enough state that a relief Worker (or Validator) reading it plus the control plane can be operational within three file reads.

Format defined in [`swarms/_protocol/handoff-schema.md`](../../swarms/_protocol/handoff-schema.md).

---

## The control plane

Every swarm has exactly one control-plane file. It is the single source of truth for "what is in flight right now and who owns it."

Rules:
- A Worker edits only its own row
- Concurrent-edit conflicts trigger STOP — the operator reconciles before any seat continues
- The control plane records state transitions only; narrative belongs in per-build state files

Format defined in [`swarms/_protocol/control-plane-schema.md`](../../swarms/_protocol/control-plane-schema.md).

---

## HITL — Human-in-the-Loop

Some actions have no automation path and require a human decision before work can continue. The protocol defines a canonical HITL block format so these escalations are legible across swarms.

Two escalation modes:
- **Mandatory HITL** — actions the operator has pre-classified as requiring human approval (listed in each swarm's `CLAUDE.md`)
- **Conditional HITL** — escalate after two failed automation attempts on the same target; never a third attempt

After writing a HITL block, set the control-plane status to `MANUAL STEP` and continue any non-blocked work in parallel.

Format defined in [`swarms/_protocol/hitl-block.md`](../../swarms/_protocol/hitl-block.md).

---

## Model-per-role

Each swarm registers a model assignment per role per build. The assignment is auditable: any build with no model assignments is flagged by the `swarm-conform` checker.

| Role | Default model | Rationale |
|------|--------------|-----------|
| Orchestrator (planning) | Opus | Slow, careful reasoning; wrong plans are expensive |
| Worker (implementation) | Sonnet | Fast artifact fluency; bounded implementation decisions |
| Worker (template-fill only) | Haiku | Deterministic substitution; no judgment required |
| Scrutiny validator | Sonnet | Precise instruction-following against the contract |
| User-testing validator | Sonnet (Opus for ambiguous behavior) | Tool use + judgment |

The model-per-role registry schema is defined in [`swarms/_protocol/role-registry-schema.md`](../../swarms/_protocol/role-registry-schema.md).

---

## Information flow rules

Five patterns cover every coordination event in a swarm. Only these five.

| Pattern | Allowed where |
|---------|--------------|
| **Delegation** — parent dispatches child, child returns result | Universal |
| **Creator-verifier** — builder produces, fresh-context verifier checks | Universal — every Worker output goes through a Validator |
| **Direct (peer-to-peer)** — agents exchange state directly | **Banned.** State flows through the control plane and handoffs only. |
| **Negotiation** — agents coordinate over a shared resource | Allowed only with an explicit shared protocol (e.g. row ownership in the control plane) |
| **Broadcast** — one sender, many receivers | Universal — control-plane updates, milestone notifications |

Banning direct peer-to-peer is the most important rule. When agents talk directly, they bypass the control plane, produce invisible state changes, and create the exact inconsistency the protocol is designed to prevent.

---

## Serial execution with internal parallelization

Workers run serially within a phase — one Worker is "writing" at a time per build. This is intentional. The coordination cost of concurrent writers (conflicts, duplicated decisions, inconsistent state) erases the speed benefit.

What does parallelize:
- Read-only operations inside a Worker's turn
- Code review and output review inside a Validator's turn
- Separate builds running concurrently (one seat per build)

The one exception is the **Parallel-Research paradigm**: an Orchestrator may fan out to peer Workers for domain research, then collect their outputs before any writes occur. This is explicitly gated by the Orchestrator, not an emergent side effect.

---

## Conformance

A swarm conforms to this protocol when:

1. Its `CLAUDE.md` points up to `swarms/PROTOCOL.md`
2. Its agent files map cleanly to the Orchestrator / Workers / Validators taxonomy with no conflated roles
3. It has a validation contract authored before Workers ran
4. Its handoff schema matches the canonical format
5. Its control plane matches the canonical schema
6. It uses the canonical HITL block format
7. It has a `role-registry.md` with at least one model assignment per role

The `swarm-conform` skill runs this checklist automatically.

---

## Related

- [`swarms/PROTOCOL.md`](../../swarms/PROTOCOL.md) — the full conformance contract with schemas
- [`swarms/_protocol/`](../../swarms/_protocol/) — the schema files referenced above
- [`swarms/example-research-swarm/`](../../swarms/example-research-swarm/) — a fully conformant worked example
- [Meta-Protocol 0.3 — Capability Extension](capability-extension.md) — how to scaffold a new conformant swarm
- [`docs/ai-os-framework.md`](../ai-os-framework.md) — Capabilities layer in the Four Cs
