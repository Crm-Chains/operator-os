> **EXAMPLE — delete this directory once you've authored your own swarm.**
> This is a zero-credential teaching artifact. It demonstrates conformance only; no real
> data or credentials are required. Remove it before promoting the OS to production.

# Example Research Swarm

A fully conformant, synthetic swarm that accepts a topic, researches it with free tools
(WebSearch + WebFetch only — no paid APIs, no MCP), writes a structured brief, validates
it, and persists findings to the wiki. It exists to illustrate the protocol, not to run in
production.

**Protocol reference: [`../PROTOCOL.md`](../PROTOCOL.md)** — in any conflict between this
file and `swarms/PROTOCOL.md`, the protocol wins.

---

## Agent roster

| Role | File | Model |
|------|------|-------|
| Orchestrator | `agents/orchestrator.md` | Opus |
| Worker — Researcher | `agents/researcher.md` | Sonnet |
| Worker — Writer | `agents/writer.md` | Sonnet |
| Validator | `agents/validator.md` | Sonnet |

Full model rationale: [`role-registry.md`](role-registry.md)

---

## Zero-credential design

This swarm uses only built-in Claude Code tools:

- **WebSearch** — free, no API key required
- **WebFetch** — free, no API key required
- **File tools** (Read, Write, Edit, Glob) — workspace only

No external services, no MCP connections, no environment variables required.

---

## Inputs

The operator provides a single input: a **research topic** (a plain-English question or
subject, e.g. "What are the main consensus mechanisms in distributed systems?").

The Orchestrator collects the topic, authors the validation contract, then dispatches
Workers in sequence.

---

## Outputs

| Artifact | Path |
|----------|------|
| Research brief | `builds/<slug>/brief.md` |
| Wiki source page | `wiki/wiki/sources/<slug>.md` |
| Validation contract | `validation-contracts/<slug>.md` |
| Control-plane record | `build-index.md` |

---

## Mandatory HITL

The following actions always require operator approval before proceeding:

- Publishing any wiki page that makes strong factual claims without a retrievable citation
- Marking a build `COMPLETE` when any assertion has `status: failed`

---

## Swarm flow

```
Operator provides topic
        │
        ▼
Orchestrator — plans, authors validation contract, updates build-index.md
        │
        ▼
Researcher — WebSearch + WebFetch, extracts cited claims
        │
        ▼
Writer — drafts brief.md from cited material
        │
        ▼
Validator — checks brief.md against validation-contracts/<slug>.md
        │
        ▼
Orchestrator — writes wiki page, emits HITL if PASS, closes build
```

All state flows through `build-index.md` (control plane) and `builds/<slug>.md` (per-build
state). Workers never communicate peer-to-peer.

---

## Related

- [`../PROTOCOL.md`](../PROTOCOL.md) — canonical conformance contract
- [`../_protocol/`](../_protocol/) — schema files
- [`role-registry.md`](role-registry.md) — model-per-role assignments
- `build-index.md` — control plane (created on first run; does not exist until the swarm executes)
- [`docs/protocols/multi-agent-coordination.md`](../../docs/protocols/multi-agent-coordination.md) — conceptual rationale
