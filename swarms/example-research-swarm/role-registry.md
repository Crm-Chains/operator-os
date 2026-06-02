---
swarm: example-research-swarm
updated: 2026-06-01
---

# Role Registry — Example Research Swarm

Default model assignments per role for this swarm. Per-build overrides are allowed in
`builds/<slug>.md` frontmatter under `role-overrides:`.

## Defaults

| Role | Agent file(s) | Model | Rationale |
|---|---|---|---|
| Orchestrator | agents/orchestrator.md | Opus | Plans the research scope, authors the validation contract before any Worker runs, and makes the final call on what constitutes a complete brief. A wrong research plan propagates through every downstream Worker — the cost of replanning far exceeds the marginal cost of the Opus call. |
| Worker — Researcher | agents/researcher.md | Sonnet | Executes a defined search-and-extract loop: issue WebSearch queries, fetch source pages, extract cited claims. Bounded judgement (is this claim well-supported?) within a deterministic structure. Sonnet handles this class of task reliably at lower cost than Opus. |
| Worker — Writer | agents/writer.md | Sonnet | Synthesises the Researcher's cited notes into a structured brief. Follows the brief template exactly; no open-ended design decisions. Sonnet's artifact fluency is sufficient; Opus would be over-pinned here. |
| Validator — Scrutiny | agents/validator.md | Sonnet | Reads the brief and the validation contract in fresh context; checks each assertion using file_check and manual_review methods. Precise instruction-following against a defined checklist — a Sonnet strength. No live system calls needed. |

## Build Overrides

| Build slug | Role | Override model | Reason |
|---|---|---|---|
