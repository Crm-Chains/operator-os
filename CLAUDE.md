# operator-os — Root Router

Route first. Retrieve, don't pre-load.

| Need | Go here |
|------|---------|
| What this OS is and how it works | [`docs/ai-os-framework.md`](docs/ai-os-framework.md) |
| How persistent knowledge works | [`docs/protocols/persistent-knowledge.md`](docs/protocols/persistent-knowledge.md) |
| How multi-agent swarms are structured | [`docs/protocols/multi-agent-coordination.md`](docs/protocols/multi-agent-coordination.md) |
| How to extend the OS with new skills/agents | [`docs/protocols/capability-extension.md`](docs/protocols/capability-extension.md) |
| Skill naming, model pins, conventions | [`docs/conventions/`](docs/conventions/) |
| Wiki routing (what's in the knowledge base) | [`wiki/ROUTER.md`](wiki/ROUTER.md) |
| Swarm protocol (role taxonomy, handoff, HITL) | [`swarms/PROTOCOL.md`](swarms/PROTOCOL.md) |
| Run the three rituals | `/onboard` · `/audit` · `/level-up` |
| See a working end-to-end example | [`swarms/example-research-swarm/CLAUDE.md`](swarms/example-research-swarm/CLAUDE.md) |
| Your operator imprint | `operators/<your-slug>/IMPRINT.md` |

---

## Session start checklist

1. If this is your first session: run `/onboard` — it will guide you through imprinting the OS with your identity, domains, connections, and first swarm.
2. If you have an existing imprint: check `operators/<your-slug>/IMPRINT.md` for any open handoffs or pending cadence items.
3. If something feels stale: run `/audit` to grade the workspace against its own standards, then `/level-up` to surface the improvement queue.

---

## The Four Cs (tl;dr)

| Layer | Question answered | Lives in |
|-------|-------------------|---------|
| **Context** | What does the OS know? | `wiki/` |
| **Connections** | What can it reach? | `.mcp.json` · `.env.example` |
| **Capabilities** | What can it do? | `.claude/skills/` · `.claude/commands/` · `swarms/` |
| **Cadence** | What runs on rhythm? | `.claude/settings.json` hooks · `/loop` · `/schedule` |

Full explanation: [`docs/ai-os-framework.md`](docs/ai-os-framework.md).

---

## Rules

- Never commit credentials. Use `.env.local` (gitignored). Only `${VAR}` references enter `.mcp.json`.
- Never leave a mid-phase swarm build without a handoff document.
- Plan before 3+ step tasks. Spec before build.
- Read before editing any file.
- Agents work inside the workspace; the workspace governs the agents.
