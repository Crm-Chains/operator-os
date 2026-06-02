# AI OS Framework

operator-os is an **AI operating system** — a durable, self-improving infrastructure that makes an AI-augmented operator progressively more capable over time. This document explains the conceptual model the OS is built on.

---

## The Three Ms — operator mindset

Before reaching for tools, a trained operator thinks in three moves.

| M | Question | Purpose |
|---|----------|---------|
| **Mindset** | "To what extent can AI be leveraged here?" | Applied to every new task and every recurring chore — no exceptions |
| **Method** | "Should I Eliminate, Automate, or Delegate this?" | Applied when Mindset answers "yes" — in that order |
| **Machine** | "Is this worth encoding as a durable workflow?" | Applied when Method has produced a repeatable process |

### The EAD ordering matters

**Eliminate first.** The cheapest work is the work that doesn't happen. Before automating a chore, ask whether it should exist.

**Automate second.** Deterministic pipelines — hooks, schedules, lint runs — are more reliable and cheaper than model calls. Wire the pipeline before wiring the agent.

**Delegate last.** Model-mediated work is powerful but not free. Delegate only what genuinely requires judgment.

### Workflows beat agents

A well-designed skill or composite command (a sequence of model-pinned subagents) is almost always cheaper, more debuggable, and more durable than a single open-ended agent with a long system prompt. Each step gets its own model, fresh context, and isolated failure surface. The `/level-up` ritual enforces the EAD ordering when proposing new capabilities.

---

## The Four Cs — system layers

The OS is organized into four layers. Every file in the repository belongs to at least one.

### Context — what the OS knows

Persistent thinking that survives sessions. Business knowledge, schema decisions, research findings, and domain vocabulary live here. When the agent needs to know something, it reads from Context rather than re-deriving from scratch.

**Lives in:** `wiki/` (the knowledge engine) + `docs/` (design decisions, protocols, conventions)

The wiki has its own maintenance stack — ingest, lint, tag, cross-link, status-check — that keeps Context from drifting into irrelevance. See [Meta-Protocol 0.1](protocols/persistent-knowledge.md).

### Connections — what the OS can reach

External systems: APIs, databases, SaaS platforms, data feeds. Connections are declared as named environment variable references (never literal secrets) and exposed to agents through MCP servers.

**Lives in:** `.mcp.json` (server declarations with `${VAR}` refs only) · `.env.example` (the names the operator must fill in) · per-swarm `CLAUDE.md` files (which connections each swarm uses)

### Capabilities — what the OS can do

Multi-step workflows triggered by phrases or invoked by other agents. Capabilities are the action surface of the OS.

**Three kinds:**
- **Skills** (`.claude/skills/`) — reusable, model-pinned procedures that any agent or command can invoke
- **Commands** (`.claude/commands/`) — operator-facing slash commands, each with a declared model pin
- **Swarms** (`swarms/`) — multi-agent pipelines for work too large or complex for a single context window

Capabilities grow through the Capability Extension meta-protocol. See [Meta-Protocol 0.3](protocols/capability-extension.md).

### Cadence — what runs on rhythm

Automations that execute on schedule or in response to events, without the operator needing to ask. Cadence transforms the OS from a reactive tool into a proactive system.

**Lives in:**
- `.claude/settings.json` — hooks that fire on session start, on tool use, or on stop
- `/loop` — recurring in-session polling tasks
- `/schedule` — agent runs on cron schedules (remote trigger)
- **The three rituals** — `/onboard`, `/audit`, `/level-up` (see below)

---

## The three rituals

The OS has a built-in self-improvement cycle driven by three slash commands. Running them on a regular cadence keeps Context accurate, surfaces capability gaps, and continuously extends what the OS can do.

| Ritual | When to run | What it does |
|--------|-------------|-------------|
| `/onboard` | Once at setup; again after major changes | Snapshots your Four-Cs state into `operators/<slug>/IMPRINT.md`. Guides you through domain, connections, swarms, and cadence setup. Produces a skeleton wired to the chassis. |
| `/audit` | Weekly | Grades each C layer against the workspace's own standards. Names gaps. Computes drift since the last audit. Writes a structured report to the wiki. |
| `/level-up` | Weekly, after `/audit` | Applies the Three Ms to the top gaps from the audit. Emits a prioritized improvement queue — EAD-ordered, with proposed skills and model pins. Reads prior audits to detect compounding patterns. |

**Output convention:** each ritual writes its latest result to the wiki (queryable via `/wiki-query`) and archives history under `wiki/wiki/_meta/history/`.

---

## How the Four Cs compose

The Four Cs are not independent — they reinforce each other:

- **Context feeds Capabilities.** Skills and swarms query the wiki before acting, so they know the operator's domain and prior decisions.
- **Connections enable Capabilities.** A swarm without Connections is read-only. MCP servers unlock write paths into external systems.
- **Cadence keeps Context fresh.** Without scheduled maintenance, the wiki drifts; stale Context misleads agents.
- **Capabilities extend Cadence.** New skills become new hooks and schedule candidates — the OS grows its own rhythm.

The `/audit` ritual measures this composition: a healthy Four-Cs score means all layers are current, connected, and actively used.

---

## Anti-patterns

**Re-inventing rather than composing.** Before writing a new skill, check whether existing skills can be chained. Composition is cheaper and keeps each component testable.

**Stale Context as ground truth.** A wiki page last updated six months ago misleads agents. Always check `updated:` frontmatter. `/audit` catches drift.

**Single agent doing five jobs.** Monolithic agents pay the highest model tier for the cheapest work and produce no per-step audit trail. Decompose into model-pinned subagents.

**Connections as capabilities.** Knowing an API exists (Connections) is not the same as having a skill to use it well (Capabilities). Explicitly author the skill.

---

## Related

- [Meta-Protocol 0.1 — Persistent Knowledge](protocols/persistent-knowledge.md)
- [Meta-Protocol 0.2 — Multi-Agent Coordination](protocols/multi-agent-coordination.md)
- [Meta-Protocol 0.3 — Capability Extension](protocols/capability-extension.md)
- [`swarms/PROTOCOL.md`](../swarms/PROTOCOL.md) — the multi-agent conformance contract
- [`wiki/ROUTER.md`](../wiki/ROUTER.md) — routing into the knowledge base
- [`docs/conventions/`](conventions/) — skill conventions, model orchestration, command model pins
