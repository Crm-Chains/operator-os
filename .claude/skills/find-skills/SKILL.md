---
name: find-skills
description: Scans .claude/skills/ to discover which skills exist in this workspace and selects the best match for a described task. Invoke whenever an operator asks "is there a skill for X", "what skill should I use to do Y", "does a skill exist for Z", or before authoring a new skill to prevent duplicates. Returns ranked matches with descriptions and invocation names so the operator can immediately use the right skill or confirm no match exists before proceeding to skill-creator.
model: haiku
---

# find-skills

The always-on bootstrap skill. Answers the question "does a skill for this already exist?" before any new capability is authored or any task is started.

`find-skills` is the first skill every operator uses and never stops using. Running it costs almost nothing. Skipping it produces duplicate skills that diverge, accumulate separate bugs, and confuse agent routing.

---

## When to invoke

- Before authoring any new skill (confirm no duplicate exists)
- When starting a task and unsure which skill covers it
- When an operator describes a need and you want to route them to an existing capability
- As the entry point of the self-improvement flywheel described in `docs/protocols/capability-extension.md`

---

## What to do

### Step 1 — Read the skill manifest

Scan every `SKILL.md` under `.claude/skills/`:

```
.claude/skills/*/SKILL.md
```

For each file, extract:
- `name` (from frontmatter)
- `description` (from frontmatter)
- `model` pin (from frontmatter)
- Folder path

### Step 2 — Match against the operator's intent

The operator provides a plain-language description of what they need. Match it against the `description` field of each discovered skill.

Ranking criteria (apply in order):
1. **Exact-intent match** — the description directly states it covers this use case
2. **Keyword overlap** — multiple key terms from the operator's request appear in the description
3. **Adjacent coverage** — the skill covers a related task that could be composed to meet the need

Return top 3 matches at most. If nothing reaches keyword-overlap confidence, return zero matches and say so clearly.

### Step 3 — Report results

**If matches found:**

```
Skill: <name>
Invoke: /<name>
Model: <pin>
Match: <why this matches>
Description: <full description field>
```

Repeat for each match, ranked best first.

Then ask: "Does one of these cover your need, or should we check whether composing two of them works? If nothing fits, I can hand off to skill-creator."

**If no match found:**

State clearly: "No existing skill covers this. Proceed to skill-creator to author a new one."

Do not suggest workarounds or partial matches as substitutes for a real match. If confidence is low, say so and let the operator decide.

### Step 4 — Composition check (optional)

If two partial matches together would cover the need, describe the composition pattern:

"Skill A handles the X part; skill B handles the Y part. You can invoke them in sequence: first /skill-a, then /skill-b. No new skill needed."

Composition over creation is always preferred when it fully covers the need.

---

## What not to do

- Do not recommend creating a new skill if a match exists — even a partial match worth composing.
- Do not suggest the operator use a skill without confirming it actually covers their case (read the description, not just the name).
- Do not load full SKILL.md bodies to do matching — frontmatter descriptions are sufficient and much cheaper.
- Do not skip this step because the operator "seems sure" they need a new skill. The cost of a duplicate is compounding; the cost of this check is trivial.

---

## Related

- `skill-creator` — author a new conformant skill when find-skills returns no match
- `docs/protocols/capability-extension.md` — the full self-improvement flywheel this skill anchors
- `docs/conventions/skill-conventions.md` — skill authoring rules (consulted by skill-creator after this step)
