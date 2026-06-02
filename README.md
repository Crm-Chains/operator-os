# operator-os

**The operator OS for Claude Code.** Persistent thinking, multi-agent coordination, and a self-extending skill/agent factory — packaged as a template you clone, onboard onto, and imprint with your own domain.

> ⚠️ **Status: design phase.** This repository currently holds only its design records. The OS scaffold lands *after* the design spec and implementation plan are complete (spec-before-build). Start at [`docs/adr/0001-foundational-decisions.md`](docs/adr/0001-foundational-decisions.md).

## The idea

operator-os is the *chassis* extracted from a working multi-agent agency workspace. It gives any agent system four things, in order — the **Four Cs**:

| Layer | What it is |
|---|---|
| **Context** | a persistent-thinking wiki that survives sessions |
| **Connections** | how the OS reaches the outside world (MCP, env) |
| **Capabilities** | skills, slash commands, and multi-agent swarms |
| **Cadence** | what runs on rhythm without being asked |

Bring your own vertical — AI training, content, research, ops, anything — and the OS gives it memory, multi-agent coordination, and the ability to grow itself (skills and agents are first-class, authored against a conformance protocol).

## Status & roadmap

This is **open-core**: the chassis is public; verticals built on top can stay private. v1 ships the chassis plus one synthetic, deletable worked example so it clones-and-runs. See the ADRs in [`docs/adr/`](docs/adr/) for the decisions behind it.

## License

[MIT](LICENSE).
