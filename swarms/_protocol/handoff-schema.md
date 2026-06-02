# Handoff Schema — Canonical

Every handoff document in every swarm uses this schema. Per-swarm `handoff/` directories contain instances; this file defines the template. No field is optional. No local field additions — if a new field is needed, propose it as a protocol change.

A relief agent must be able to reach operational context within three file reads: this handoff, the per-build state file, and the active agent prompt.

---

## Schema

```markdown
# Handoff — [BUILD SLUG]

## Header
- Swarm: [swarm name]
- Build slug: [slug]
- Build name: [human-readable name]
- Resource ID(s): [the identifier(s) that uniquely name the work — e.g. folder path, run ID, record ID]
- From seat: [seat identifier]
- To seat: [any | specific seat | HUMAN — if HITL escalation]
- Written: [YYYY-MM-DD HH:MM]
- Reason for handoff: [token ceiling | manual step blocking | hitl escalation | session end | seat reassignment | validator failure]

## Current State
- Active phase / feature: [phase number + name, or feature name]
- Phase status: [in progress | blocked | complete — ready for next phase]
- Tool / connection status: [e.g. "build-tool — configured", "render pipeline — built", "API auth — ok"]
- Resource lock status: [shared resource: free | committed to this build | committed elsewhere | n/a]

## Last Completed Action
[One sentence. Include a verifiable artifact: file path, record ID, commit SHA, or command exit code.]

## Next Required Action
[One sentence. Exact and actionable — not "continue Phase 2" but the specific operation to perform.]

## Objects In Progress — Do Not Touch
[List any artifacts partially configured that must not be edited until the relief agent reviews them. "none" if clean.]

## Open Blockers
[List anything preventing forward progress and what is needed to unblock. "none" if unblocked.]

## Build State File Status
- Build state file: [current and accurate | has gaps — see notes]
- Last verified artifact: [ID / path / hash of the last thing confirmed as live]

## Verification Checkpoint
[List the last 2–3 verification calls (tool reads, file reads, command exit codes) so the relief agent can confirm live state quickly before making any writes.]

## Validation Contract Status
- Contract file: [path to validation-contracts/<slug>.md]
- Assertions covered so far: [N of M] — [list assertion IDs covered]
- Assertions next-up: [list assertion IDs the next agent is expected to cover]

## Manual Steps Outstanding
[List any steps requiring human action before the build can continue. "none" if there are none.]

## HITL Escalations — Human Action Required
[If reason is "hitl escalation", fill this section using the canonical HITL block from _protocol/hitl-block.md. Otherwise "none".]

## Notes for Relief Agent
[Anything not captured above. Keep it short. If this is a HITL handoff addressed to HUMAN: the same seat resumes after human action — re-read this doc and continue at "Next Required Action".]
```

---

## Example

```markdown
# Handoff — acme-launch-v1

## Header
- Swarm: example-delivery-swarm
- Build slug: acme-launch-v1
- Build name: Acme Corp — Launch Campaign v1
- Resource ID(s): builds/acme-launch-v1.md
- From seat: seat-A
- To seat: any
- Written: 2026-06-01 14:32
- Reason for handoff: token ceiling

## Current State
- Active phase / feature: Phase 2 — Asset Configuration
- Phase status: in progress
- Tool / connection status: delivery API — auth ok; asset store — connected
- Resource lock status: n/a

## Last Completed Action
Created asset group "Hero Banner" with ID asset-group-001 (confirmed via API get_asset_groups).

## Next Required Action
Create the second asset group "Email Header" using the spec in builds/acme-launch-v1.md §Asset Groups.

## Objects In Progress — Do Not Touch
asset-group-001 — configuration incomplete; do not publish until Phase 2 completes.

## Open Blockers
none

## Build State File Status
- Build state file: current and accurate
- Last verified artifact: asset-group-001 (API confirmed, 2026-06-01 14:30)

## Verification Checkpoint
1. API get_asset_groups → returned asset-group-001, status=draft. Exit 0.
2. builds/acme-launch-v1.md §Phase 2 Progress → "asset-group-001: created". File read clean.

## Validation Contract Status
- Contract file: validation-contracts/acme-launch-v1.md
- Assertions covered so far: 2 of 8 — [A1, A2]
- Assertions next-up: [A3, A4] (asset group completeness checks)

## Manual Steps Outstanding
none

## HITL Escalations — Human Action Required
none

## Notes for Relief Agent
The asset spec in builds/acme-launch-v1.md §Asset Groups is authoritative. Do not use the brief directly — scope was narrowed after planning.
```

---

## Lifecycle

1. **Outgoing agent writes** `handoff/<slug>-handoff.md` using this schema.
2. **Outgoing agent updates** the control plane: status → `HANDOFF PENDING`, seat → `unassigned`.
3. **Relief agent reads** in this exact order:
   a. `handoff/<slug>-handoff.md`
   b. Per-build state file (`builds/<slug>.md` or equivalent)
   c. Active phase agent prompt
   d. Validation contract
4. **Relief agent claims** the build: control plane status → `ACTIVE`, seat → its identifier.
5. **Relief agent moves** `handoff/<slug>-handoff.md` → `handoff/archive/<slug>-handoff-<YYYY-MM-DD>.md`.
6. **Relief agent re-runs verification checkpoint calls** before any new write.

---

## Anti-Patterns

- **Narrative in the handoff** — narrative goes in the per-build state file; the handoff is a baton, not a journal
- **Local field additions** — if a new field is needed, propose it as a protocol change; do not fork the schema
- **Missing verification checkpoint** — a handoff with no checkpoint is not auditable; the relief agent cannot confirm live state
- **Acknowledging without re-running checkpoints** — state on disk may be stale; live state is authoritative
