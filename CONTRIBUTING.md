# Contributing to operator-os

operator-os is an open-core project. The chassis is public and contributions are welcome. This document covers the four things you need to know before opening a PR.

---

## 1. Authoring conformant skills, swarms, and agents

Everything in operator-os that does work — skills, slash commands, swarms, and their agents — must conform to the published conventions. Read these before authoring anything:

| Document | What it covers |
|---|---|
| [`docs/conventions/skill-conventions.md`](docs/conventions/skill-conventions.md) | How to structure a skill: `SKILL.md`, trigger phrases, model pin, input/output contract, references |
| [`docs/conventions/model-orchestration.md`](docs/conventions/model-orchestration.md) | How to compose multi-model pipelines: which model tier for which work, subagent decomposition, cost discipline |
| [`docs/conventions/command-model-pins.md`](docs/conventions/command-model-pins.md) | How to declare and register a model pin for every command |
| [`swarms/PROTOCOL.md`](swarms/PROTOCOL.md) | The multi-agent conformance contract: role taxonomy, handoff schema, HITL block format, validation contract |

> `swarms/PROTOCOL.md` and the `swarms/_protocol/` schemas land in a later phase. They are linked here so contributors know where they will live. If they are not yet present, check `docs/superpowers/plans/` for current phase status.

The built-in factory — `skill-creator` (`.claude/skills/skill-creator/`) and the swarm/agent scaffolder — generates conformant skeletons for you. Use it rather than authoring from scratch.

---

## 2. Secret safety — the single hardest rule

**Never commit secrets, credentials, client names, or private workspace identifiers of any kind.**

This is an absolute rule, not a guideline. The repo is public (or will be at v1). A single leaked token or real company name makes the history permanently unsafe.

### What the pre-commit hook does

`.githooks/pre-commit` runs `tools/secret-scan` before every commit. It checks for:

- Known API key patterns (bearer tokens, PITs, base64-encoded credentials)
- Real email addresses and domains (except intentional synthetic placeholders)
- Hardcoded URLs with embedded credentials
- Any pattern in the denylist at `tools/secret-scan/denylist.txt`

If it fires, the commit is rejected. Fix the leak, then commit again.

### What to do instead of committing a real value

- Use `${ENV_VAR_NAME}` in `.mcp.json` and config files
- Add the variable name (not its value) to `.env.example`
- Use synthetic placeholders in examples: `acme-corp`, `example-operator`, `your-slug`, `YOUR_API_KEY`

### The `.secretscanignore` allowlist

If a file intentionally contains a pattern that resembles a secret (for example, a documented example of what a token format looks like), add it to `.secretscanignore` with a comment explaining why it is safe. Keep this allowlist tight — every entry requires justification.

```
# .secretscanignore
# docs/conventions/skill-conventions.md:42 — synthetic key format example, not a real value
docs/conventions/skill-conventions.md
```

---

## 3. Running checks locally

Before opening a PR, run both checks:

```bash
# Unit and integration tests
npm test

# Secret scan (same scan the pre-commit hook runs)
npm run secret-scan
```

Both must pass with zero errors. `npm run secret-scan` exits non-zero on any hit — fix the file, not the scan.

If you have added a new file that intentionally contains a pattern the scanner flags, add it to `.secretscanignore` (see above) before running the scan.

---

## 4. Commit style and model-pin registration

### Conventional commits

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

Examples:
```
feat(skills): add wiki-lint skill with auto-fix mode
fix(swarms): correct handoff schema field name in example-research-swarm
docs(conventions): add model-orchestration guidance for subagent decomposition
```

Keep the subject line under 72 characters. Use the body for "why", not "what".

### Model pin registration — mandatory for every command and skill

Every slash command in `.claude/commands/` and every skill in `.claude/skills/` must:

1. Declare its model pin inside its own file (e.g., `model: claude-sonnet-4-5` in the frontmatter or the `SKILL.md` header)
2. Register that pin in the model-pin registry at `docs/conventions/command-model-pins.md`

Both steps must happen in the same commit that introduces or modifies the command or skill. A PR that adds a command without registering its model pin will be asked to add the registration before merge.

This rule exists because unregistered model pins create invisible cost and behavior drift. The registry is the single source of truth for what model tier each capability uses.

---

## What makes a good contribution

The best contributions to operator-os are ones that strengthen the chassis for everyone without adding vertical-specific logic. Good examples:

- Improving the conformance protocol or its schemas
- Adding or tightening a convention document
- Fixing a gap in the `/onboard`, `/audit`, or `/level-up` rituals
- Improving the example swarm's pedagogical clarity
- Strengthening the secret-scan denylist

Vertical-specific logic (domain knowledge, client-specific swarms, private API integrations) belongs in your own instance, not in this repo.

---

## Questions

Open an issue before starting significant work. The design spec at [`docs/superpowers/specs/`](docs/superpowers/specs/) and the ADRs at [`docs/adr/`](docs/adr/) explain the decisions behind the current structure. Reading them first will save you time.
