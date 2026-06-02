# Role Registry Schema — Model-per-Role Assignments

Every swarm has a `role-registry.md` at its root documenting which model is used for which role. This makes model selection auditable and reviewable across builds.

The registry is a conformance requirement: a swarm with no registry, or a registry with missing entries, fails the conformance test.

---

## File Location

```
<swarm>/role-registry.md
```

One file per swarm. Build-level overrides are declared in the per-build state file (`builds/<slug>.md`) under a `role-overrides:` frontmatter key. Overrides are rare — most builds use swarm defaults.

---

## Schema

```markdown
---
swarm: [swarm name]
updated: [YYYY-MM-DD]
---

# Role Registry — [SWARM NAME]

Default model assignments per role for this swarm. Per-build overrides are allowed in `builds/<slug>.md`
frontmatter under `role-overrides:`.

## Defaults

| Role | Agent file(s) | Model | Rationale |
|---|---|---|---|
| Orchestrator | agents/orchestrator.md | Opus | Slow, careful planning. Authors validation contracts. Strategic operator-facing questions before any Worker runs. |
| Worker — Phase 1 ([name]) | agents/worker-phase-1.md | Sonnet | Fast artifact production with bounded implementation decisions. |
| Worker — Phase 2 ([name]) | agents/worker-phase-2.md | Sonnet | Same — structured output from a defined spec slice. |
| Worker — Phase N (template-fill) | agents/worker-phase-N.md | Haiku | Deterministic substitution only; no judgment required. |
| Validator — Scrutiny | agents/validator.md (scrutiny mode) | Sonnet | Precise instruction-following against the assertion list; reads artifacts, no live system calls. |
| Validator — User-testing | agents/validator.md (user-testing mode) | Sonnet | Tool-use plus judgment. Escalate to Opus for genuinely ambiguous behavior. |

## Build Overrides

[List any active builds whose `role-overrides:` differ from the defaults above. Leave empty if none.]

| Build slug | Role | Override model | Reason |
|---|---|---|---|
```

---

## Authoring Rules

1. **Every role has an entry.** If a swarm does not yet have a Validator, add the row with model `(gap — not yet assigned)` and flag it in the swarm's `CLAUDE.md`. A gap is visible; an omission is invisible.

2. **Rationale is required and must be substantive.** "Sonnet because it's the default" is not a rationale. State what the role needs from the model — planning depth, artifact fluency, instruction precision, tool-use judgment — and why the chosen model class satisfies it.

3. **Use model class names, not snapshot IDs.** Write `Opus`, `Sonnet`, or `Haiku`. The workspace's model-pin registry resolves class names to current snapshot IDs. Pinning to a snapshot ID causes the registry to decay as models are updated.

4. **Validators should differ from Workers where possible.** A Validator running the same model class with the same training bias as the Worker loses adversarial signal. Where a different model family is unavailable, use a meaningfully different system prompt or temperature.

5. **Review on model release.** When a new model is released, check whether the rationale still holds. A registry that hasn't been reviewed in six months is a reliability risk.

---

## Default Model Table (OS-wide)

| Role | Default model | Rationale |
|---|---|---|
| Orchestrator (planning) | Opus | Slow, careful reasoning; wrong plans are expensive and propagate through all Workers |
| Worker (implementation) | Sonnet | Fast code and artifact fluency; bounded implementation decisions |
| Worker (template-fill only) | Haiku | Deterministic substitution; no judgment required; lowest cost |
| Scrutiny validator | Sonnet | Precise instruction-following against the assertion list |
| User-testing validator | Sonnet | Tool use + judgment; Opus for genuinely ambiguous behavior |

These are defaults. Each swarm's `role-registry.md` may override any row with a rationale.

---

## Conformance Audit

The conformance checker enforces:

- Every role declared in the swarm's `CLAUDE.md` role list has a registry entry
- Every entry has a non-placeholder model and a non-placeholder rationale
- The Build overrides table is syntactically valid
- No entry uses a full snapshot ID (class names only)

Audit failures are a swarm health flag. They do not block Workers already in progress, but they block a swarm from being declared conformant.

---

## Example

```markdown
---
swarm: example-delivery-swarm
updated: 2026-06-01
---

# Role Registry — Example Delivery Swarm

## Defaults

| Role | Agent file(s) | Model | Rationale |
|---|---|---|---|
| Orchestrator | agents/orchestrator.md | Opus | Deep planning + validation contract authoring before any build work begins. Errors here multiply across all Workers. |
| Worker — Phase 1 (setup) | agents/worker-phase-1.md | Sonnet | Reads a defined spec slice, calls APIs, writes verified IDs to the state file. Fast artifact fluency needed. |
| Worker — Phase 2 (content) | agents/worker-phase-2.md | Sonnet | Structured content generation from a script spec. Bounded decisions, no open-ended planning. |
| Worker — Phase 3 (template-fill) | agents/worker-phase-3.md | Haiku | Pure substitution: merge field values into a template. No judgment. Cost-optimize this phase. |
| Validator — Scrutiny | agents/validator.md (scrutiny mode) | Sonnet | Reads artifacts + runs command checks against the assertion list. Precise instruction-following. |
| Validator — User-testing | agents/validator.md (user-testing mode) | Sonnet | Live-system walkthrough. Opus on escalation for ambiguous rendered behavior. |

## Build Overrides

| Build slug | Role | Override model | Reason |
|---|---|---|---|
| acme-launch-v1 | Validator — User-testing | Opus | Complex multi-step live workflow; two prior Sonnet validation runs produced inconsistent results. |
```

---

## Related

- [`swarms/PROTOCOL.md`](../PROTOCOL.md) — conformance test (item 7 requires this registry)
- [`docs/protocols/multi-agent-coordination.md`](../../docs/protocols/multi-agent-coordination.md) — model-per-role rationale
