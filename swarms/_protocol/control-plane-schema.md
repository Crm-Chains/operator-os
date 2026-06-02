# Control Plane Schema

Every swarm has exactly one control-plane file. It is the single source of truth for in-flight state across all builds. Operators read it first, every time. Workers update only their own row.

The file name varies by swarm (`build-index.md`, `run-index.md`, `task-index.md`, etc.). The shape is canonical regardless of name.

---

## Required Sections

A conforming control plane has these top-level sections, in this order:

1. **Active Builds** — table, one row per active build
2. **Pending Handoffs** — builds where status = `HANDOFF PENDING`
3. **Resource Locks** — shared physical or logical resources (e.g. a browser seat, an external auth token) and which build holds them
4. **Seat Registry** — which agent seats are connected and what they currently hold
5. **Completed Builds** — archive of finished builds, append-only
6. **Sync Conflict Log** — append-only; populated whenever a storage-layer conflict is detected

---

## Active Builds — Column Shape

| Column | Type | Notes |
|---|---|---|
| Build slug | string | Unique. `<domain>-<descriptor>` pattern recommended. |
| Build name | string | Full human-readable name |
| Phase / Feature | string | Active phase or feature name |
| Status | enum | `ACTIVE` \| `HANDOFF PENDING` \| `MANUAL STEP` \| `BLOCKED` \| `VALIDATOR FAILED` \| `READY FOR VALIDATOR` \| `COMPLETE` |
| Seat | string | Seat identifier, or `unassigned` |
| Resource lock | string | Describe what is locked, or `n/a` |
| Validation contract | path | `validation-contracts/<slug>.md` — blank until Orchestrator authors it |
| Last write | timestamp | `YYYY-MM-DD HH:MM by [seat]` |
| Handoff | path or empty | `handoff/<slug>-handoff.md` when pending; empty otherwise |

---

## Status Values

| Status | Meaning |
|---|---|
| `ACTIVE` | A Worker holds this build and is actively making progress |
| `HANDOFF PENDING` | A Worker has written a handoff; seat is `unassigned` pending relief |
| `MANUAL STEP` | A HITL block has been written; waiting for operator action |
| `BLOCKED` | Blocked by an external dependency (not HITL — e.g. API outage, missing prerequisite) |
| `VALIDATOR FAILED` | A Validator ran and at least one assertion did not pass |
| `READY FOR VALIDATOR` | A Worker completed its phase; Validator not yet claimed |
| `COMPLETE` | All assertions passed; build moves to Completed Builds section |

---

## Edit Rules

1. **Own your row only.** Workers edit only the row for the build they currently hold. Editing another Worker's row is a protocol violation.
2. **Re-read before claiming.** To claim an `unassigned` build, re-read the control plane (force-fresh on synced storage), confirm it is still `unassigned`, then write your seat identifier in.
3. **Minimize writes.** Update the control plane only on these events:
   - Claim / release a build
   - Phase transition (after Validator pass)
   - Resource lock claim / release
   - Handoff written / acknowledged
   - Validator pass / fail
   - Build completion (move row to Completed Builds)
4. **No narrative.** In-progress detail goes in `builds/<slug>.md`. The control plane carries state transitions only.
5. **Sync conflict → STOP.** If the storage layer creates a conflict copy (e.g. duplicate file), every seat halts. The operator reconciles before any seat continues. Log the conflict in the Sync Conflict Log section.

---

## Example (Active Builds table)

```markdown
## Active Builds

| Build slug | Build name | Phase / Feature | Status | Seat | Resource lock | Validation contract | Last write | Handoff |
|---|---|---|---|---|---|---|---|---|
| acme-launch-v1 | Acme Corp — Launch v1 | Phase 2 — Asset Config | HANDOFF PENDING | unassigned | n/a | validation-contracts/acme-launch-v1.md | 2026-06-01 14:32 by seat-A | handoff/acme-launch-v1-handoff.md |
| beta-onboard-v2 | Beta Inc — Onboarding v2 | Phase 1 — Data Setup | ACTIVE | seat-B | n/a | validation-contracts/beta-onboard-v2.md | 2026-06-01 15:10 by seat-B | |
```

---

## Why This Shape

- One row per build with a narrow column set means a full swarm review needs only this file — no drilling into per-build state files.
- Append-only Completed and Sync Conflict sections preserve the audit trail without growing the active surface.
- The Validation contract column makes it structurally impossible to start a Worker without an authored contract — the cell is empty until the Orchestrator writes one.
- Resource Locks as a dedicated section makes contention visible at a glance, without requiring per-row lock annotations.

---

## Anti-Patterns

- **Narrative in the control plane** — narrative belongs in `builds/<slug>.md`
- **Handoff body in the control plane** — it carries the handoff path, not the handoff contents
- **Omitting the Validation contract column** — a blank cell is a deliberate signal that no contract exists; do not hide the gap
- **Trusting the control plane for live system state** — it reflects swarm intent; for ground truth, call the live tool or read the file
