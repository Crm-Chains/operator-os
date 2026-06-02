---
swarm: example-research-swarm
build_slug: example-run-001
build_name: Example Research Run — Synthetic Topic (for teaching only)
authored_by: orchestrator-seat-A
authored_at: 2026-06-01
total_assertions: 5
coverage_pct: 0
---

# Validation Contract — Example Research Run (Synthetic)

> **Teaching artifact.** This contract is pre-filled with a synthetic example to
> demonstrate the schema. In a real build, the Orchestrator fills this file during
> planning, before any Worker runs.

Each assertion is a correctness claim the finished build MUST satisfy. Every assertion has
an owner and a validation method that a fresh-context Validator can execute without asking
the Orchestrator.

## Assertions

### A1. `builds/example-run-001/brief.md` exists and contains the four required sections.
- assigned_to: Writer — Phase 2
- validates_via: file_check
- validation_detail: "Read builds/example-run-001/brief.md. Confirm the file exists and
  contains the headings '## Overview', '## Key Findings', '## Source Disagreements or Gaps',
  and '## Sources Consulted'. Missing any heading = failed."
- status: pending
- last_checked:

### A2. Every item in Key Findings ends with a citation marker `[Source: <url>]`.
- assigned_to: Writer — Phase 2
- validates_via: file_check
- validation_detail: "Read the '## Key Findings' section of builds/example-run-001/brief.md.
  For each numbered list item, confirm it ends with '[Source: <url>]' where <url> is a
  non-empty, non-placeholder URL. Any item without this marker = failed."
- status: pending
- last_checked:

### A3. `## Sources Consulted` lists at least 4 URLs, all fetched (not [FETCH FAILED]).
- assigned_to: Researcher — Phase 1
- validates_via: file_check
- validation_detail: "Count URLs in '## Sources Consulted' of builds/example-run-001/brief.md.
  Confirm count >= 4. Each URL must appear in builds/example-run-001.md '## Source Notes'
  without a '[FETCH FAILED]' tag."
- status: pending
- last_checked:

### A4. No citation in Key Findings references a URL absent from `## Sources Consulted`.
- assigned_to: Writer — Phase 2
- validates_via: manual_review
- validation_detail: "Extract every '[Source: <url>]' from '## Key Findings'. For each url,
  confirm it appears in '## Sources Consulted'. A citation URL not in that list is a
  fabricated source — mark failed."
- status: pending
- last_checked:

### A5. The brief's `topic:` frontmatter field is non-empty and matches the operator-supplied topic.
- assigned_to: Writer — Phase 2
- validates_via: file_check
- validation_detail: "Read frontmatter of builds/example-run-001/brief.md. Confirm `topic:`
  is a non-empty string. Compare against the operator's input topic stored in
  builds/example-run-001.md. Values must match (case-insensitive)."
- status: pending
- last_checked:
