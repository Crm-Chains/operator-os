# operator-os — the operator OS for Claude Code

Persistent thinking, multi-agent coordination, and a self-extending skill/agent factory — packaged as a template you clone, imprint with your own domain, and run.

---

## What & why

Most AI workflows are ephemeral: each session starts cold, knows nothing about your domain, and leaves nothing behind. **operator-os** is the structural answer to that — it gives any Claude Code workspace four durable layers, in order:

- **Context** that survives sessions (a maintained wiki engine — the OS "remembers")
- **Connections** to external systems declared as references, never literal secrets
- **Capabilities** you extend by authoring conformant skills, commands, and swarms
- **Cadence** that runs on rhythm — hooks, schedules, and three built-in rituals — without being asked

You bring your own vertical (research, ops, content, engineering, anything). The OS gives it memory, multi-agent coordination, and the ability to grow itself. Skills and swarm agents are first-class, authored against a published conformance protocol.

**Open-core:** the chassis is public. The verticals you build on top stay in your own private clone.

---

## The Four Cs

| Layer | What it is | Lives in |
|---|---|---|
| **Context** | Persistent thinking — wiki + design records that survive sessions | `wiki/` + `docs/` |
| **Connections** | How the OS reaches the outside world | `.mcp.json` (`${VAR}` refs only) · `.env.example` · per-swarm `CLAUDE.md` |
| **Capabilities** | What it can do — skills, commands, and multi-agent swarms | `.claude/skills/` · `.claude/commands/` · `swarms/` |
| **Cadence** | What runs on rhythm without being asked | `.claude/settings.json` hooks · `/loop` · `/schedule` · the three rituals |

The Four Cs reinforce each other: Context feeds Capabilities; Connections enable them; Cadence keeps Context fresh; new Capabilities extend Cadence. The `/audit` ritual measures the health of the whole.

See [`docs/ai-os-framework.md`](docs/ai-os-framework.md) for the full conceptual model, including the Three Ms operator mindset (Eliminate → Automate → Delegate) and anti-patterns to avoid.

---

## Status

**Building toward v1 — the chassis is landing phase by phase; see [`docs/superpowers/plans/`](docs/superpowers/plans/).**

The design spec and foundational decisions are committed. Chassis components are being extracted and authored phase by phase. The example swarm runs with zero credentials. Not yet published; local-only until the acceptance matrix in the spec is met.

---

## Quickstart

```
# 1. Use this template (GitHub) or clone
git clone https://github.com/your-org/operator-os my-workspace
cd my-workspace

# 2. Wire the git hooks (includes the secret-scan guard)
git config core.hooksPath .githooks

# 3. Imprint the OS with your domain
/onboard

# 4. Run the example swarm (zero credentials required)
#    Open Claude Code in this directory, then:
/swarm example-research-swarm "the topic you want researched"

# 5. Read the output brief and the wiki pages it wrote

# 6. Delete the example
rm -rf swarms/example-research-swarm operators/example-operator

# 7. Build your own
#    Author a conformant swarm against swarms/PROTOCOL.md,
#    scaffold skills with .claude/skills/skill-creator,
#    and add your Connections to .env.example + .mcp.json
```

> `/onboard` runs in two modes: default (a guided Four-Cs intake, low friction) and `--deep` (an adversarial architect-style interrogation for a sharper imprint). Either produces `operators/<your-slug>/IMPRINT.md` — the manifest of who you are and which chassis pieces are activated.

---

## Repository structure

```
operator-os/
├── README.md · LICENSE · CONTRIBUTING.md · CLAUDE.md   ← root router
├── .env.example · .mcp.json (${VAR} refs only) · .gitignore
├── .claude/
│   ├── settings.json        ← hooks (incl. secret-scan guard) + permissions
│   ├── skills/              ← the FACTORY + chassis skills
│   └── commands/            ← /onboard · /audit · /level-up (+ model-pin governance)
├── docs/
│   ├── ai-os-framework.md   ← Four Cs · Three Ms · rituals
│   ├── protocols/           ← the 3 Meta-Protocols, one file each
│   ├── conventions/         ← skill-conventions · model-orchestration · command-model-pins
│   ├── adr/                 ← decision records (ADR-0001 seeded)
│   └── superpowers/         ← specs, plans, phases
├── wiki/                    ← CONTEXT engine
│   ├── ROUTER.md · CLAUDE.md   ← INGEST / QUERY / LINT gateway
│   ├── schema/ · raw/ · wiki/  ← structured knowledge + seed pages + _meta governance
├── swarms/                  ← CAPABILITIES (multi-agent)
│   ├── PROTOCOL.md          ← role taxonomy + conformance contract
│   ├── _protocol/           ← handoff · control-plane · hitl-block · role-registry · validation-contract
│   └── example-research-swarm/   ← THE worked example (delete after reading)
├── operators/
│   ├── _template/           ← imprint skeleton /onboard fills in
│   └── example-operator/    ← one synthetic imprint (teaching artifact)
└── tools/                   ← helpers (secret-scan, etc.)
```

**OS-vs-instance boundary:** everything above is the OS. An *instance* is whatever lands in `operators/<your-slug>/` after onboarding, plus private swarms, skills, and wiki pages added in your own clone. The OS never touches your verticals.

---

## Open-core positioning

The chassis (everything in this repo) is MIT-licensed and public. The verticals — your domain knowledge, private swarms, client-specific agents, proprietary connections — live in your instance and stay private. The OS is deliberately domain-neutral: it does not know or care what you build on top.

This mirrors the boundary in the source workspace: patterns are public; instances are private.

---

## Delete the example

`swarms/example-research-swarm/` and `operators/example-operator/` are teaching artifacts. They exist so the OS clones-and-runs on day one. Once you have authored your own conformant swarm and completed `/onboard`, delete them:

```
rm -rf swarms/example-research-swarm operators/example-operator
```

The example swarm's own `CLAUDE.md` repeats this instruction.

---

## Learn more

- [`docs/ai-os-framework.md`](docs/ai-os-framework.md) — the full conceptual model
- [`docs/protocols/`](docs/protocols/) — the three inheritable Meta-Protocols
- [`docs/conventions/`](docs/conventions/) — how to author conformant skills, commands, and swarms
- [`swarms/PROTOCOL.md`](swarms/PROTOCOL.md) — the multi-agent conformance contract
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to contribute to the OS itself

---

## License

[MIT](LICENSE)
