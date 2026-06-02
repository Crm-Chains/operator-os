---
name: onboard
description: Imprint front door — guided Four-Cs wizard that captures Identity, Context, Connections, Capabilities, and Cadence; produces operators/<slug>/IMPRINT.md and scaffolds the operator skeleton. Pass --deep for an adversarial, architect-style interrogation that yields a sharper imprint.
model: sonnet
---

# /onboard

The first of three OS rituals: `/onboard` → `/audit` → `/level-up`.

`/onboard` is the **imprint front door** — it runs once at setup (and again after a major domain shift) to capture who the operator is and wire them into the chassis. The output is `operators/<slug>/IMPRINT.md`: the manifest of who the operator is, which chassis pieces are activated, and what custom swarms/skills must be built.

Framework: `docs/ai-os-framework.md` (Four Cs). Scaffold target: `operators/_template/`.

---

## Modes

| Mode | Behaviour |
|---|---|
| `/onboard` (default) | Friendly wizard. A few well-chosen questions per layer. Low friction. Suitable for first run or re-imprint. |
| `/onboard --deep` | Adversarial, architect-style interrogation. Every assumption is challenged. Produces a sharper imprint at the cost of a longer session. |

---

## Layer sequence

Work through layers in order. For each layer: ask the questions, wait for answers, then proceed. Never ask all layers at once.

### Layer 0 — Identity

Questions:
1. What is your name or handle? (This becomes the `<slug>` — lowercase, hyphens only.)
2. What domain(s) does your work span? (e.g., research, e-commerce, media, consulting — be specific.)
3. One sentence: what is the primary outcome you want this OS to produce for you?

`--deep` additions:
- Who are your end users or clients? What do they care about that you do not?
- What would a competitor say is your weakness? (Be honest.)
- What have you tried before that didn't work?

### Layer 1 — Context

Questions:
1. What knowledge domains does your work draw on? List them (e.g., "market research, copywriting, competitor analysis").
2. Do you have existing documents, notes, or research to ingest into the wiki? Where do they live?
3. How often does your domain knowledge change significantly — daily, weekly, quarterly?

`--deep` additions:
- What do you currently have to re-derive from scratch each time because you have no persistent record?
- What knowledge, if it went stale, would cause the most damage?
- Who else on your team needs to read from this context? What format do they expect?

### Layer 2 — Connections

Questions:
1. What external systems does your work depend on? (APIs, databases, SaaS platforms, data feeds — name them.)
2. For each: does an MCP server already exist for it, or will you call it via REST/CLI?
3. What credentials will each connection require? (Name the env var — never the value.)

`--deep` additions:
- Which connection, if it went down, would halt your most important workflow?
- Are there connections you rely on manually (browser tabs, spreadsheets) that you've never automated? Why not?
- What data do you currently pull by hand that an agent could pull on schedule?

### Layer 3 — Capabilities

Questions:
1. What recurring workflows do you run at least once a week?
2. For each: is it better described as a skill (reusable procedure) or a swarm (multi-agent pipeline)?
3. Which chassis skills do you want to keep active? Which can you drop for now?

`--deep` additions:
- Walk me through your single most time-consuming workflow step by step. Where does it break? Where does it feel manual and dumb?
- What would you automate first if you had unlimited agent capacity tomorrow?
- What have you tried to automate before that failed? What caused the failure?

### Layer 4 — Cadence

Questions:
1. Which of your workflows should run on a schedule without you asking? (Suggest: wiki maintenance, status dashboards, weekly audit.)
2. How often do you want `/audit` to remind you of gaps? (Default: weekly.)
3. Are there any events (new document ingested, external webhook) that should trigger an automatic action?

`--deep` additions:
- What do you currently do manually at the start of each week that an agent could prep the night before?
- What is the one thing you always forget to check until something breaks?
- If you were away for two weeks, what would drift most in your workspace?

---

## Output

### 1. `operators/<slug>/IMPRINT.md`

```markdown
---
slug: <slug>
domain: <domain(s)>
imprinted: <DATE>
mode: <default|deep>
---

# Operator Imprint — <slug>

> "<primary-outcome-sentence>"

## Identity

- **Slug:** `<slug>`
- **Domain(s):** <list>
- **Primary outcome:** <sentence>

## Context

- **Knowledge domains:** <list>
- **Existing sources to ingest:** <list or "none">
- **Change velocity:** <daily|weekly|quarterly>
- **Wiki seed taxonomy:** <proposed top-level tags or folders>

## Connections

| System | MCP or REST | Env var name(s) |
|---|---|---|
| <system> | <mcp|rest|cli> | <VAR_NAME> |

## Capabilities

### Active chassis skills

<list of chassis skills the operator confirmed keeping>

### Skills to build

<list of custom skills surfaced during the wizard — name + one-line purpose each>

### Swarms to build

<list of custom swarms — name + brief description + first agent roles>

## Cadence

| Ritual / hook | Trigger | Frequency |
|---|---|---|
| `/audit` | manual or scheduled | <operator answer> |
| wiki-lint | post-ingest hook | automatic |
| <custom> | <trigger> | <frequency> |

## Open questions

<any --deep challenges that surfaced ambiguity the operator hasn't resolved>

## Next steps

1. Fill in `.env.example` with the env var names above (values go in `.env.local`, never committed).
2. Wire MCP refs in `.mcp.json` using `${VAR_NAME}` syntax.
3. Ingest existing sources: `/wiki-ingest`.
4. Build the first swarm listed above against `swarms/PROTOCOL.md`.
5. Run `/audit` after the first week.
```

### 2. Operator skeleton

Scaffold from `operators/_template/`:

```
operators/<slug>/
├── IMPRINT.md          ← written above
├── CLAUDE.md           ← operator-specific routing (copy + fill from _template)
├── swarms/             ← empty; operator builds against swarms/PROTOCOL.md
├── skills/             ← empty; operator builds against .claude/skills conventions
└── wiki-seed/          ← seed pages for the operator's knowledge domains
```

---

## Process

1. Greet the operator. Explain the wizard and the two modes. If `--deep` was passed, state that explicitly.
2. Work through layers 0–4 in order. Ask questions, wait, move on. Never bundle layers.
3. For `--deep`: after each standard question, ask the deep-probe follow-ups. Do not skip them.
4. After all layers: read `operators/_template/` to understand the scaffold shape.
5. Write `operators/<slug>/IMPRINT.md` using the template above.
6. Scaffold the operator skeleton (copy `_template/` structure; fill what you know; leave stubs for unknowns).
7. Print a 6-line summary to chat: one bullet per layer (0–4) stating the key decision, plus "Run `/audit` after your first week."

---

## Rules

- Never ask for secret values. Only ask for env var **names**.
- Never read `.env.local`.
- If the operator skips a layer, note it in the IMPRINT as "skipped — revisit".
- `--deep` is heavier but still Sonnet-appropriate: the questions are harder, not the synthesis.
- If `operators/<slug>/` already exists, read the existing `IMPRINT.md` first and present a diff-update flow ("Here is what changed since last imprint") rather than starting from scratch.

---

## When to run

- First setup of the OS.
- After a significant domain shift (new vertical, major pivot).
- After adding or removing a large set of connections or capabilities.
- Before a major `/level-up` cycle if the imprint is more than 90 days old.
