---
name: skill-creator
description: Scaffolds a new conformant skill under .claude/skills/, including the folder, SKILL.md frontmatter (name, description, model pin), body structure, and optional references/ directory. Invoke after find-skills confirms no existing skill covers the need, or when an operator asks to "create a skill for X", "add a skill that does Y", or "build a skill to automate Z". Also handles registering the new skill's model pin in docs/conventions/skill-model-pins.md as a mandatory part of creation.
model: sonnet
---

# skill-creator

Scaffolds a new operator-os-conformant skill from a plain-language description of the need. The output is a populated `SKILL.md` ready for operator review, with the model pin registered.

**Prerequisite:** run `find-skills` first. If a matching skill exists, use it or compose it — do not author a duplicate.

---

## Step 1 — Capture intent

Before writing anything, gather:

1. **What the skill does** — the action it takes (verb-first: "scans", "generates", "validates")
2. **When to invoke it** — the trigger phrases, situations, or conditions that call for this skill
3. **What it produces** — the artifact or state change that results
4. **Model tier** — apply the decision tree from `docs/conventions/model-orchestration.md`:
   - Haiku: purely mechanical work (template fill, regex/JSON patching, config scaffolding, counting)
   - Sonnet: judgment-bearing work (merge decisions, style review, classification, scoring)
   - Opus: architectural/strategic work (novel synthesis, multi-source reasoning, designing new schemas)

If the operator has not provided all four, ask for what is missing before proceeding. Do not guess at model tier — apply the decision tree explicitly and state the rationale.

---

## Step 2 — Choose a name

Apply the naming rules from `docs/conventions/skill-conventions.md`:

- Gerund form preferred: `processing-pdfs`, `analyzing-sources`
- Noun-phrase form acceptable: `pdf-processor`
- Lowercase, hyphens only, max 64 characters
- No reserved words: `anthropic`, `claude`
- No vague names: `helper`, `utils`, `tools`, `documents`, `data`, `files`
- Must match the folder name exactly

Propose the name and explain the choice. Get confirmation before creating the folder.

---

## Step 3 — Scaffold the folder and SKILL.md

Create:

```
.claude/skills/<skill-name>/
└── SKILL.md
```

SKILL.md template:

```markdown
---
name: <skill-name>
description: <third-person, ≤1024 chars, states WHAT it does + WHEN to invoke it>
model: <haiku | sonnet | opus | inherit>
---

# <Skill Title>

<One-sentence summary of what this skill does and why it exists.>

---

## When to invoke

<Bullet list of trigger conditions, phrases, and situations. This is the second place the model looks when routing — be specific.>

---

## What to do

<Numbered steps. Imperative form. Each step has a clear action and a clear output. No vague "consider" language.>

---

## What not to do

<Hard stops. Things that look like they belong here but do not. Common wrong turns.>

---

## Related

<Links to related skills, protocol docs, or convention files. Forward slashes in all paths.>
```

Fill every section with content derived from Step 1. Do not leave placeholder text.

### Description field rules

The `description` must:
- Be third person only ("Scans and reports..." not "I can help you..." or "You can use this...")
- State both WHAT the skill does AND WHEN to invoke it (both conditions in one field)
- Be ≤ 1024 characters
- Contain no XML tags

Write the description to be slightly specific and trigger-oriented — it is the primary mechanism by which the harness decides to invoke this skill.

---

## Step 4 — Add references/ if needed

If the skill body would exceed 500 lines, or if there are three or more supporting documents, create a `references/` subdirectory:

```
.claude/skills/<skill-name>/
├── SKILL.md
└── references/
    ├── workflow.md
    └── schema.md
```

Link from SKILL.md using forward-slash paths: `references/workflow.md`. Keep the chain one level deep — no nested references.

Reference files longer than 100 lines must include a TOC at the top.

---

## Step 5 — Register the model pin (mandatory)

Open `docs/conventions/skill-model-pins.md` and append a row to the Catalog table:

```markdown
| `<skill-name>` | <haiku\|sonnet\|opus\|inherit> | <one-sentence rationale citing the decision tree> |
```

This step is not optional. A skill without a pin row is a lint violation. Do this in the same operation as creating the SKILL.md.

---

## Step 6 — Run the authoring checklist

Verify before handing off to the operator:

```
- [ ] name: lowercase, hyphens, ≤64 chars, no reserved words, matches folder name
- [ ] description: third person, ≤1024 chars, states WHAT + WHEN, no XML tags
- [ ] model: pin declared
- [ ] Row added to docs/conventions/skill-model-pins.md
- [ ] SKILL.md body ≤ 500 lines
- [ ] Three or more bundled docs are inside references/
- [ ] All reference files one level deep from SKILL.md
- [ ] Forward slashes in all paths
- [ ] MCP tools fully-qualified if present (ServerName:tool_name)
- [ ] No time-sensitive content in main body
- [ ] No vague names, no first-person copy, no XML in name or description
```

Report any violations and fix them before handing off.

---

## What not to do

- Do not scaffold a skill for a one-off task. Skills justify maintenance cost only through repeated use. If the operator is doing something once, do it inline.
- Do not skip the find-skills prerequisite check.
- Do not leave placeholder text in the generated SKILL.md. Every section must be populated.
- Do not use `inherit` as a model pin without stating a clear reason why the caller's model is appropriate here.
- Do not create nested reference chains (SKILL.md → a.md → b.md → content). Keep references one level deep.

---

## Related

- `find-skills` — always run before authoring to confirm no duplicate exists
- `docs/conventions/skill-conventions.md` — full authoring rules; this skill operationalizes them
- `docs/conventions/model-orchestration.md` — decision tree for choosing a model pin
- `docs/conventions/skill-model-pins.md` — the pin catalog this skill must update
- `docs/protocols/capability-extension.md` — the self-improvement flywheel context
