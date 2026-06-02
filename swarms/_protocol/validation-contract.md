# Validation Contract — Schema and Authoring Rules

A validation contract is a list of correctness assertions written during planning, **before any Worker runs**. It is the load-bearing artifact of the protocol: it defines what "done" means for a build in terms that a fresh-context Validator can test without asking the Orchestrator.

---

## What a Validation Contract Is

The Orchestrator authors the contract as the final planning step. Workers reference the assertions assigned to their phase. Validators run against the contract at milestone boundaries — not against their own intuitions about what the build should contain.

**Why this order matters:** writing the contract before building forces the Orchestrator to be explicit about success criteria. It prevents the failure mode where a build is "done" because an agent says so rather than because a specified criterion was checked by an independent Validator.

A contract authored *after* the build starts is post-hoc test coverage. It does not satisfy this protocol.

---

## Where Contracts Live

```
<swarm>/validation-contracts/<slug>.md
```

One contract per active build. Created by the Orchestrator before Workers are dispatched. Referenced in the control-plane Validation contract column from the moment it exists.

---

## Schema

```markdown
---
swarm: [swarm name]
build_slug: [slug]
build_name: [full human-readable name]
authored_by: [Orchestrator seat identifier or operator name]
authored_at: [YYYY-MM-DD]
total_assertions: [N]
coverage_pct: [computed by lint — leave 0 until Workers are assigned]
---

# Validation Contract — [BUILD NAME]

Each assertion is a correctness claim the finished build MUST satisfy. Every assertion has an owner
(the Worker or phase responsible for satisfying it) and a validation method (exactly how a Validator
will confirm it).

## Assertions

### A1. [One-line assertion — declarative and testable]
- assigned_to: [phase name / Worker identifier / "unassigned" — must be resolved before Workers begin]
- validates_via: [api_get | file_check | command_exit | render_check | manual_review]
- validation_detail: [exactly what the Validator runs — specific enough to execute without asking the Orchestrator]
- status: [pending | satisfied | failed]
- last_checked: [YYYY-MM-DD or empty]

### A2. [Next assertion]
- assigned_to: ...
- validates_via: ...
- validation_detail: ...
- status: pending
- last_checked:
```

---

## Validation Method Values

| Value | Meaning |
|---|---|
| `api_get` | Validator calls a read-only API or tool and inspects the response |
| `file_check` | Validator reads a file and asserts a property (path exists, hash matches, regex present) |
| `command_exit` | Validator runs a command and asserts exit code (lint, type-check, test suite, build) |
| `render_check` | Validator confirms a media or UI artifact renders correctly (image, video, page component) |
| `manual_review` | HITL — operator reviews and confirms; use only where automation is genuinely unavailable |

Minimize `manual_review`. It does not satisfy the "fresh-context Validator" property and creates a bottleneck on every validation run.

---

## Authoring Rules

1. **Write before any Worker runs.** The contract must predate the first Worker dispatch. The Orchestrator signs off on the contract as the last planning action.

2. **Every assertion has an owner.** No `assigned_to: unassigned` entries at planning sign-off. The Orchestrator must allocate every assertion to a phase or Worker before Workers begin. Unassigned at sign-off = blocked Worker dispatch.

3. **The sum of Worker outputs must cover every assertion.** A phase with no assertions assigned to it should be reconsidered: either it produces something validatable or its scope is under-specified.

4. **Every assertion is testable.** "Feature X works correctly" is not testable. "Feature X returns response Y for input Z, confirmed via api_get call returning status 200 with field `result: Y`" is testable.

5. **Validation detail must be self-contained.** A fresh Validator reading only the assertion must be able to execute the check without asking the Orchestrator or reading the implementation.

6. **Contracts are append-only during a build.** New assertions can be added if scope expands. Existing assertions are not edited — mark `failed` and add a follow-up assertion. This preserves the audit trail.

7. **One contract per build slug.** Do not reuse assertions verbatim across builds — each build has its own scope, and copy-paste contracts create silent gaps when scope diverges.

---

## PASS / FAIL Semantics

- **PASS**: every assertion in the contract has `status: satisfied` and a `last_checked` date.
- **FAIL**: any assertion has `status: failed`, or any assertion is still `pending` when the Validator declares a milestone complete.

The control-plane status reflects the Validator's determination:
- All assertions satisfied → `COMPLETE`
- Any assertion failed → `VALIDATOR FAILED`

A `VALIDATOR FAILED` status requires the Orchestrator to triage: determine if the failure is a Worker defect (reassign the Worker) or a contract defect (scope changed — amend the contract with a rationale note, do not silently edit the existing assertion).

---

## Lint Rules

The conformance checker enforces:

- `authored_at` precedes any Worker run timestamp in the per-build state file
- `assigned_to` is not `unassigned` for any assertion (at planning sign-off)
- `validates_via` is one of the allowed values
- `validation_detail` is non-empty and not a placeholder string
- `total_assertions` in frontmatter matches the body count
- `coverage_pct` is recomputed from `status` values (lint updates this field)

A failing lint run blocks Worker dispatch for the affected build.

---

## Example

```markdown
---
swarm: example-delivery-swarm
build_slug: acme-launch-v1
build_name: Acme Corp — Launch Campaign v1
authored_by: orchestrator-seat-A
authored_at: 2026-06-01
total_assertions: 4
coverage_pct: 0
---

# Validation Contract — Acme Corp — Launch Campaign v1

## Assertions

### A1. Asset group "Hero Banner" exists with status "draft" and contains exactly 3 assets.
- assigned_to: Phase 1 — Worker (asset setup)
- validates_via: api_get
- validation_detail: "Call get_asset_groups, confirm group name 'Hero Banner' present, status='draft', asset_count=3."
- status: pending
- last_checked:

### A2. Asset group "Email Header" exists with status "draft" and contains exactly 2 assets.
- assigned_to: Phase 1 — Worker (asset setup)
- validates_via: api_get
- validation_detail: "Call get_asset_groups, confirm group name 'Email Header' present, status='draft', asset_count=2."
- status: pending
- last_checked:

### A3. Landing page slug "acme-launch-v1" returns HTTP 200 and contains the H1 "Welcome to Acme."
- assigned_to: Phase 2 — Worker (page config)
- validates_via: command_exit
- validation_detail: "curl -s -o /dev/null -w '%{http_code}' https://example.com/acme-launch-v1 returns 200. curl -s https://example.com/acme-launch-v1 | grep -c '<h1>Welcome to Acme.</h1>' returns 1."
- status: pending
- last_checked:

### A4. Operator has reviewed and approved the final landing page layout.
- assigned_to: Phase 2 — Worker (page config)
- validates_via: manual_review
- validation_detail: "Operator opens https://example.com/acme-launch-v1 in a browser, reviews the layout against the brief, and confirms back 'Approved — layout matches brief.'"
- status: pending
- last_checked:
```

---

## Anti-Patterns

- **Contract during the build** — captures decisions made, not intent set; defeats the protocol
- **Assertions about process, not artifacts** — "Worker followed the spec" is not a testable assertion; the artifact's correctness is the test
- **Vague validation detail** — "check that it works" cannot be executed by a fresh Validator
- **Omitting assertions for "obvious" phases** — every phase produces something validatable; if you can't write an assertion, the phase is under-specified
- **Editing existing assertions** — mark failed, add a follow-up; the original intent must remain in the audit trail

---

## Related

- [`swarms/PROTOCOL.md`](../PROTOCOL.md) — conformance test (item 6 requires pre-build contracts)
- [`_protocol/handoff-schema.md`](handoff-schema.md) — Validation Contract Status section in handoffs
- [`_protocol/control-plane-schema.md`](control-plane-schema.md) — Validation contract column in the control plane
