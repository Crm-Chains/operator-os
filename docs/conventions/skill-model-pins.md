# Skill Model Pins

Every file under `.claude/skills/` declares a `model:` field in its YAML frontmatter. This
table mirrors those pins so:

1. A lightweight process can answer "what model runs skill X?" without opening every file.
2. Reviewers have one place to check whether a skill is over- or under-pinned.

The *why* behind each pin lives in [`docs/conventions/model-orchestration.md`](model-orchestration.md).

---

## Convention

Every new skill MUST:

1. Declare `model: haiku | sonnet | opus | inherit` in frontmatter (placed after `name` and
   `description`).
2. Add a row to the [Catalog](#catalog) below in the **same change**.

Drift between a skill's frontmatter pin and its catalog row is a lint violation.

---

## Catalog

| Skill | Model | Rationale |
|---|---|---|
| `wiki-ingest` | sonnet | Merge judgment required — deciding what to create vs. update, resolving naming conflicts with existing pages, and applying provenance markers. |
| `wiki-lint` | sonnet | Pattern-matching with judgment — distinguishing auto-fixable issues from report-only ones, and evaluating provenance drift. |
| `cross-linker` | sonnet | Write-heavy with scoring judgment — evaluating semantic relevance, confidence labeling, and deciding inline vs. related-section placement. |
| `tag-taxonomy` | haiku | Primarily mechanical — alias substitution and tag-limit enforcement are deterministic pattern matching; unknown-tag disposition escalates to the operator, not the model. |
| `wiki-status` | haiku | Deterministic counting, date comparison, and manifest lookups; all output is factual reporting with no creative or strategic reasoning. |
| `swarm-conform` | sonnet | Judgment-bearing audit — semantic role-mapping review, contract-before-workers assessment, and schema diff evaluation require bounded reasoning beyond mechanical pattern matching. |
| `find-skills` | haiku | Purely mechanical — reads frontmatter fields, ranks keyword overlap, and returns matches; no creative or strategic reasoning required. |
| `skill-creator` | sonnet | Judgment-bearing — applies naming conventions, selects model tier via decision tree, writes description copy, and enforces the authoring checklist; errors here propagate into every future invocation of the created skill. |
| `swarm-scaffolder` | sonnet | Judgment-bearing — maps operator input to role taxonomy, chooses Worker granularity per phase, and verifies all 7 conformance checks; structural errors compound across every build the swarm runs. |

---

## How to add a row

1. Use the decision tree in [`docs/conventions/model-orchestration.md`](model-orchestration.md)
   to pick a pin.
2. Add `model: <pin>` to the skill's YAML frontmatter.
3. Append a row to the table above in the **same change**.

---

## How to change a pin

1. Update `model:` in the skill's frontmatter.
2. Update the row in the Catalog above.
3. Note the reason in `wiki/log.md`:

```
[YYYY-MM-DDTHH:MM:SSZ] PIN-CHANGE skill="<name>" from=<old> to=<new> reason="<1-line>"
```

Repeated pin flips signal the skill's mechanical checklist is underspecified — fix the spec.

---

## Related

- [`docs/conventions/model-orchestration.md`](model-orchestration.md) — decision tree and
  cost rationale
- [`docs/conventions/skill-conventions.md`](skill-conventions.md) — skill authoring rules
  (includes the model-pin requirement)
- [`docs/conventions/command-model-pins.md`](command-model-pins.md) — the analogous catalog
  for slash commands
