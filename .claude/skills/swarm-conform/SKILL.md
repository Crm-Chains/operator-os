---
name: swarm-conform
description: Audits a swarm directory against the 7-point conformance checklist in swarms/PROTOCOL.md and emits a structured gap report. Invoked when an operator wants to verify a swarm before promotion, during Gate 3 of a new swarm scaffold, or whenever a swarm's conformance status is in question.
model: sonnet
---

# swarm-conform

Audits a swarm directory against the 7-point conformance checklist defined in
`swarms/PROTOCOL.md` and emits a gap report covering both structural and semantic checks.

---

## When to invoke

- Gate 3 of a new swarm scaffold (pre-promotion check)
- After editing a swarm's `CLAUDE.md`, `role-registry.md`, or agent files
- When a `wiki-status` sweep flags a swarm as unverified
- Any time the operator asks "does this swarm conform?"

---

## Inputs

Pass the swarm directory path as the argument:

```
/swarm-conform swarms/my-swarm
```

The path is relative to the workspace root. The skill resolves it to an absolute path before
running checks.

---

## Two-phase audit

### Phase 1 — Structural checks (script)

Run the deterministic checker first:

```
node tools/swarm-conform/check-conformance.mjs <swarm-dir>
```

The script prints PASS/FAIL per check and exits 0 (all pass) or 1 (any fail). Structural
checks cover:

| # | Check |
|---|-------|
| S1 | `CLAUDE.md` exists in the swarm dir |
| S2 | `CLAUDE.md` contains a reference to `PROTOCOL.md` |
| S3 | `role-registry.md` exists in the swarm dir |
| S4 | `role-registry.md` contains at least one `model` mention |
| S5 | `agents/` directory exists and is non-empty |
| S6 | A validation contract file exists (name matches `/validation|contract/i` in `agents/` or swarm root) |

### Phase 2 — Semantic checks (model review)

After the script, read the following files and verify:

1. **Role mapping** (`agents/` contents) — every agent file maps cleanly to exactly one of:
   Orchestrator, Worker, or Validator. Flag any file whose role is ambiguous or conflated
   (e.g., a single agent that both plans and implements).

2. **Contract-before-workers discipline** — the validation contract must be authored before
   any Worker agent ran. Check for evidence: contract file timestamps or explicit "authored
   during planning" header. Flag if the contract appears to have been written after Worker
   output files.

3. **HITL format** — if any agent file references a HITL block, verify it follows the
   canonical format in `swarms/_protocol/hitl-block.md`.

4. **Handoff schema** — if any handoff files exist, verify they match
   `swarms/_protocol/handoff-schema.md`.

5. **Control-plane schema** — if a control-plane file exists, verify it matches
   `swarms/_protocol/control-plane-schema.md`.

6. **Model assignments** — `role-registry.md` must have at least one model assignment per
   role actually present in `agents/`. Cross-reference agent role declarations with registry
   entries.

---

## Gap report format

Emit a fenced markdown block:

```
## swarm-conform gap report — <swarm-dir>
Checked: <ISO-8601 timestamp>

### Structural checks
| Check | Status | Notes |
|-------|--------|-------|
| S1: CLAUDE.md exists        | PASS | |
| S2: PROTOCOL.md reference   | FAIL | CLAUDE.md has no mention of PROTOCOL.md |
| S3: role-registry.md exists | PASS | |
| S4: model mention in registry | PASS | |
| S5: agents/ non-empty       | PASS | 3 files |
| S6: validation contract     | FAIL | no file matching /validation|contract/i found |

### Semantic checks
| Check | Status | Notes |
|-------|--------|-------|
| Role mapping          | PASS | Orchestrator + 2 Workers + 1 Validator cleanly separated |
| Contract-before-workers | WARN | Cannot determine authorship order — no timestamp header |
| HITL format           | N/A  | No HITL blocks found |
| Handoff schema        | N/A  | No handoff files found |
| Control-plane schema  | PASS | |
| Model assignments     | PASS | All three roles covered |

### Summary
FAIL — 2 structural gap(s), 1 warning, 0 semantic failures.

### Remediation
- S2: Add `swarms/PROTOCOL.md` to the "Read first" line in CLAUDE.md
- S6: Create agents/validation-contract.md (template: swarms/_protocol/validation-contract.md)
- Contract-before-workers: Add `<!-- authored during planning, before Workers ran -->` header
  to the contract file if confirmed.
```

---

## Remediation guidance

For each FAIL or WARN, append a one-line fix. Do not implement fixes — only describe them.
If the operator requests auto-fix, confirm scope before writing any files.

---

## Related

- `swarms/PROTOCOL.md` — canonical conformance rules and schemas
- `swarms/_protocol/` — schema reference files
- `tools/swarm-conform/check-conformance.mjs` — structural checker script
- `docs/protocols/multi-agent-coordination.md` — why the protocol is structured this way
