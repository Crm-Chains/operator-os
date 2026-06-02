<!-- This file is the default/template validation contract for the example-research-swarm.
     Per-build contracts live in validation-contracts/<slug>.md.
     The Orchestrator copies and fills this template before dispatching any Worker.
     See swarms/_protocol/validation-contract.md for the full schema. -->

---
swarm: example-research-swarm
build_slug: TEMPLATE
build_name: TEMPLATE — replace before use
authored_by: orchestrator-seat
authored_at: 2026-06-01
total_assertions: 5
coverage_pct: 0
---

# Validation Contract — TEMPLATE

> **Replace all TEMPLATE values with build-specific data before Workers run.**
> Save the filled contract to `validation-contracts/<slug>.md` before dispatching the
> Researcher. The contract must predate the first Worker run.

Each assertion is a correctness claim the finished build MUST satisfy. Every assertion has
an owner (the Worker responsible for satisfying it) and a validation method (exactly how a
Validator will confirm it without asking the Orchestrator).

## Assertions

### A1. `builds/<slug>/brief.md` exists and contains the four required sections.
- assigned_to: Writer — Phase 2
- validates_via: file_check
- validation_detail: "Read builds/<slug>/brief.md. Confirm the file exists and contains
  headings: '## Overview', '## Key Findings', '## Source Disagreements or Gaps',
  '## Sources Consulted'."
- status: pending
- last_checked:

### A2. Every item in Key Findings includes a citation marker `[Source: <url>]`.
- assigned_to: Writer — Phase 2
- validates_via: file_check
- validation_detail: "Read the '## Key Findings' section of builds/<slug>/brief.md. For
  each numbered item, confirm it ends with '[Source: <url>]' where <url> is a non-empty
  URL string. Any item lacking this marker is a failure."
- status: pending
- last_checked:

### A3. `## Sources Consulted` lists at least 4 URLs, all of which appear in the Researcher's source notes.
- assigned_to: Researcher — Phase 1
- validates_via: file_check
- validation_detail: "Read '## Sources Consulted' in builds/<slug>/brief.md. Count the URLs.
  Confirm count >= 4. Each URL must also appear in the '## Source Notes' section of
  builds/<slug>.md with status not '[FETCH FAILED]'."
- status: pending
- last_checked:

### A4. No claim in the brief references a URL not in `## Sources Consulted`.
- assigned_to: Writer — Phase 2
- validates_via: manual_review
- validation_detail: "Read every '[Source: <url>]' citation in '## Key Findings'. For each
  URL, confirm it appears in '## Sources Consulted'. Any citation URL absent from
  '## Sources Consulted' is a fabricated source — mark failed."
- status: pending
- last_checked:

### A5. The brief's topic matches the topic declared in its frontmatter `topic:` field.
- assigned_to: Writer — Phase 2
- validates_via: file_check
- validation_detail: "Read the frontmatter of builds/<slug>/brief.md. Confirm the `topic:`
  value is a non-empty string and matches the research topic provided by the operator."
- status: pending
- last_checked:
