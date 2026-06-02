# Command Model Pins

Every file under `.claude/commands/` declares a `model:` field in its YAML frontmatter. This table mirrors those pins so:

1. A lightweight process can answer "what model runs `/X`?" without opening every file.
2. Reviewers have one place to check whether a command is over- or under-pinned.

The *why* behind each pin lives in [`docs/conventions/model-orchestration.md`](model-orchestration.md).

---

## Convention

Every new command MUST:

1. Declare `model: haiku | sonnet | opus | inherit` in frontmatter (recommended around line 4, after `name` and `description`).
2. Add a row to the [Catalog](#catalog) below in the **same change**.

**Why this matters:**
- Without an explicit pin, the harness uses its default — often the most expensive model. Ambiguity pays the Opus rate.
- A single catalog page makes cost/quality governance auditable without opening dozens of command files.
- Drift between a command's frontmatter pin and its catalog row is a lint violation. The two must always agree.

Rationale for each pin should fit one sentence. If it does not, the pin is probably wrong — reconsider the task decomposition.

---

## Catalog

| Command | Model | Rationale |
|---|---|---|

---

## How to add a row

When creating a new command file:

1. Use the decision tree in [`docs/conventions/model-orchestration.md`](model-orchestration.md) to pick a pin.
2. Add `model: <pin>` to the command's YAML frontmatter.
3. Append a row to the table above in the **same change**. Both files change together or neither does.

---

## How to change a pin

If a command repeatedly escalates from Haiku (validation failures) or is clearly over-pinned (Opus doing mechanical work):

1. Update `model:` in the command's frontmatter.
2. Update the row in the Catalog above.
3. Record the change in `wiki/log.md`:

```
[YYYY-MM-DDTHH:MM:SSZ] PIN-CHANGE command="/<name>" from=<old> to=<new> reason="<1-line>"
```

Repeated pin flips on the same command are a signal the command itself is underspecified — tighten its mechanical checklist rather than chasing the right model indefinitely.

---

## Related

- [`docs/conventions/model-orchestration.md`](model-orchestration.md) — the decision tree and cost rationale
- [`docs/conventions/skill-conventions.md`](skill-conventions.md) — the analogous pin rule for skills
- [`docs/conventions/skill-model-pins.md`](skill-model-pins.md) — per-skill pin catalog
