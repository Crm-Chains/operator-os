---
name: audit
description: Gap-grade ritual — assess workspace health against its own standards by running secret-scan, swarm conformance, wiki-lint, and docs accuracy checks; produce a graded Four-Cs report with prioritized gaps. Second of three OS rituals.
model: sonnet
---

# /audit

The second of three OS rituals: `/onboard` → `/audit` → `/level-up`.

`/audit` is **judgement-bearing** — it grades the workspace against its own declared standards, names concrete gaps, and computes drift since the last audit. The output feeds `/level-up`. Sonnet-pinned: this is pattern-matching with local judgement, not open-ended architectural synthesis.

Framework: `docs/ai-os-framework.md` (Four Cs). Grading rubric below.

---

## Inputs

| Input | Source | Notes |
|---|---|---|
| Operator imprint | `operators/<slug>/IMPRINT.md` | Establish which slug is active; if multiple slugs exist, ask. |
| Secret-scan result | `tools/secret-scan` | Run the scan; do not trust a cached result from a prior session. |
| Swarm conformance | `tools/swarm-conform` (if present) | Run against each swarm under `swarms/`. |
| Wiki-lint | `/wiki-lint` skill | Run on `wiki/wiki/`. |
| Docs accuracy | `docs/` directory | Spot-check: do linked files exist? Are cross-references valid? |
| Prior audit | `wiki/wiki/_meta/history/audit-*.md` (most recent) | For drift detection. |
| Current snapshot | Live workspace reads via Glob/Grep | Do not rely on a cached snapshot. |

Never read `.env.local`. Never echo a credential or token.

---

## Checks to run

### 1. Secret scan

```
tools/secret-scan/scan.sh   # or the equivalent script in tools/secret-scan/
```

Report: PASS or FAIL. If FAIL, list each finding with file + line. Do not echo the secret value — echo only the pattern matched and the line number.

### 2. Swarm conformance

For each directory under `swarms/` that is not `_protocol/` or `PROTOCOL.md`:
- Does `CLAUDE.md` exist and reference `swarms/PROTOCOL.md`?
- Does `role-registry.md` exist?
- Does at least one agent reference the handoff schema?
- Does the swarm have a validation contract?

Report per swarm: PASS / WARN / FAIL with the specific gap.

### 3. Wiki-lint

Invoke the `wiki-lint` skill. Capture its output. Report:
- Total pages checked.
- Lint errors (schema violations, broken wikilinks, missing required frontmatter fields).
- Pages with `deprecated: true` that are still wikilinked from active pages.

### 4. Docs accuracy

Spot-check `docs/`:
- Every `[link](path)` in `docs/ai-os-framework.md`, `docs/protocols/`, and `docs/conventions/` — does the target file exist?
- Does `docs/conventions/command-model-pins.md` Catalog have a row for every file in `.claude/commands/`?
- Does `docs/conventions/skill-model-pins.md` Catalog have a row for every `SKILL.md` in `.claude/skills/`?

Report: list any broken links or missing catalog rows.

### 5. Four-Cs assessment

Read the live workspace (Glob/Grep for counts; do not estimate) and grade each layer:

| Layer | Evidence to collect |
|---|---|
| Context | Page count under `wiki/wiki/`; freshness (`updated:` frontmatter); ROUTER.md last-modified; presence of `wiki/wiki/_meta/` governance pages |
| Connections | Keys in `.mcp.json`; do env var names in `.env.example` match what the imprint declared? |
| Capabilities | Command count + model pins vs. catalog; skill count vs. catalog; swarm conformance result |
| Cadence | Hooks in `.claude/settings.json`; any `/schedule` artifacts; `/audit` run frequency (from audit history) |

---

## Output

Write two files with identical content:

1. `wiki/wiki/_meta/Meta - OS Audit.md` (latest — overwrites)
2. `wiki/wiki/_meta/history/audit-<DATE>.md` (archive — never overwrites)

### File template

```markdown
---
title: Meta - OS Audit
type: meta
tags: [framework, operations, audit]
summary: Graded Four-Cs gap analysis as of <DATE>. Top-3 gaps feed /level-up.
updated: <DATE>
deprecated: false
disputed: []
---

# OS Audit — <DATE>

Prior audit: <link or "(none — this is the baseline)">

## Check results

| Check | Result | Notes |
|---|---|---|
| Secret scan | PASS / FAIL | <finding count or "clean"> |
| Swarm conformance | PASS / WARN / FAIL | <swarm count; gap summary> |
| Wiki-lint | PASS / WARN / FAIL | <error count> |
| Docs accuracy | PASS / WARN / FAIL | <broken link count; missing catalog rows> |

## Four-Cs grades

| Layer | Grade | One-line verdict |
|---|---|---|
| Context | <Strong\|Adequate\|Weak\|Missing> | <one line> |
| Connections | <grade> | <one line> |
| Capabilities | <grade> | <one line> |
| Cadence | <grade> | <one line> |

## Context — <grade>

**Evidence:** <2–3 specific files, counts, dates cited>
**Gaps:** <bulleted; each gap cites a concrete file or absence>
**Drift since <prior date>:** <bulleted, or "no prior audit — this is the baseline">

## Connections — <grade>

**Evidence:** <MCP key count; env var alignment>
**Gaps:** <bulleted>
**Drift:** <bulleted or "no prior audit">

## Capabilities — <grade>

**Evidence:** <command count; skill count; swarm conformance summary>
**Gaps:** <bulleted; include any missing catalog rows found in docs check>
**Drift:** <bulleted or "no prior audit">

## Cadence — <grade>

**Evidence:** <hook count; schedule artifacts; audit frequency>
**Gaps:** <bulleted>
**Drift:** <bulleted or "no prior audit">

## Top-3 gaps (ranked by leverage)

1. **<Title>** — <C layer>. <One paragraph: why this is #1, what it blocks.>
2. **<Title>** — <C layer>. <One paragraph.>
3. **<Title>** — <C layer>. <One paragraph.>

These three feed `/level-up` next.

## Wins since last audit

<bullets — concrete; do not invent>

## Immediate actions (blockers only)

<Only include items that FAIL a check and must be resolved before the next `/level-up`. Gaps that are merely Weak go into Top-3 instead.>
```

---

## Grading rubric

| Grade | Meaning |
|---|---|
| Strong | Layer is comprehensive, current, and self-maintaining (has a regeneration ritual or active hook) |
| Adequate | Layer covers the workspace but has known stale spots or missing automation |
| Weak | Layer exists but is partial, manual, or drifting |
| Missing | Layer not present in any meaningful form |

Be specific in evidence. "The wiki has many pages" is not evidence. "The wiki has 87 pages under `wiki/wiki/`, last 3 ingested on 2026-05-28" is.

---

## Drift detection

For each C layer, compare current state to the prior audit:
- **New:** items present now that were absent in the prior audit.
- **Removed:** items in the prior audit no longer present.
- **Quality change:** e.g. a Cadence layer that was "Adequate" now "Weak" because a hook was disabled.

If no prior audit exists, the Drift section says "no prior audit — this is the baseline."

---

## Top-3 ranking

Rank by **leverage**, not severity. A small Context gap that blocks five downstream skills outranks a large Cadence gap that only affects manual work. State the leverage explicitly in the one-paragraph rationale.

---

## Process

1. Read `operators/<slug>/IMPRINT.md` to know which slug is active and what was declared.
2. Run the four checks in order (secret-scan → swarm-conform → wiki-lint → docs accuracy). Report each result before moving to the next.
3. Read live workspace for Four-Cs evidence (Glob/Grep for counts; do not estimate).
4. Grade each C with cited evidence.
5. Identify gaps — concrete, file-citing.
6. Compute drift if a prior audit exists in `wiki/wiki/_meta/history/`.
7. Rank gaps by leverage; select top 3.
8. Write both output files.
9. Print to chat: the 4 check results as a 4-row table, the 4 grades as a 4-row table, then the top-3 gap titles with "Run `/level-up` next."

---

## When to skip

If `/audit` ran within the current session and nothing material changed (no new commits, no `wiki/` edits, no `.mcp.json` changes, no new commands or skills), state "audit is current from this session" and do not re-run. Otherwise run fresh.

---

## When to run

- Weekly cadence (recommended; wire a `/schedule` stub in your operator imprint).
- Before any `/level-up` cycle.
- After adding a new swarm, new MCP server, or large batch of skills.
- After any security-relevant change (new env var, credential rotation).
