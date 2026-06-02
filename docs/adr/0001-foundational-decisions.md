# ADR-0001: Foundational decisions for operator-os

- **Status:** Accepted
- **Date:** 2026-06-01
- **Deciders:** nexuschains (operator), Claude Code (brainstorming session)

## Context

operator-os is a clean-room extraction of the "Operator Harness OS" that already
exists, in instance form, inside a private multi-agent agency workspace
("ai-agency"). That workspace had independently converged on a conceptual spine —
the **Four Cs** (Context → Connections → Capabilities → Cadence) — plus three
inheritable Meta-Protocols (Persistent Knowledge, Multi-Agent Coordination,
Capability Extension) and an "imprint"/extraction-manifest mechanism for seeding
new operator instances.

The goal of operator-os is to package that chassis as a standalone, onboardable
artifact that anyone can adopt and imprint with their own domain, agents, and
knowledge structure — without inheriting the source workspace's clients,
credentials, or proprietary verticals.

This ADR records the foundational decisions made before any scaffold was written.

## Decisions

### D1 — Artifact: a new standalone template repository (core-aware)
operator-os is a **fresh, standalone repo** — a clean-room extraction of the
chassis only. The source workspace stays untouched and may adopt operator-os
later as "instance #1." The OS-vs-instance boundary is drawn deliberately so the
core **can later graduate into an installable package / submodule** without a
rewrite. We are not paying for that packaging now, only keeping the door open.

### D2 — Audience: public, open-source, open-core
The repository is **public and open-source**. Strategy is **open-core**: the
chassis (the OS) is public; verticals built on top (domain-specific swarms,
skills, integrations, real client work) stay private in their own repos. Hard
constraint, enforced throughout: **zero secrets, zero client names, synthetic
examples only**, plus license + contribution model + public docs.

### D3 — Harness: Claude-Code-native only
operator-os binds tightly to Claude Code primitives — skills, slash commands,
hooks, subagents, MCP, `CLAUDE.md` routing. **No portability promise** to other
CLI harnesses (Codex, Copilot, Gemini). Rationale: being the best *Claude Code*
operator OS beats being a mediocre everything-harness. A future port would be an
additive, separately-scoped effort.

### D4 — Boundary / what ships: chassis + one synthetic worked example
v1 ships the full **chassis** PLUS **one synthetic, domain-neutral worked
example** — a small "research-and-write" swarm (orchestrator + 2 workers +
validator) using only free/local tools, a few example skills, a seeded example
wiki, and a sample operator imprint produced by the onboarding flow. The example
is clearly marked **removable**. (Rejected: A = empty chassis only, too hard for
OSS users to evaluate; C = de-identified full reference workspace, heavy
scrubbing + leak risk + blurs the boundary.)

### D5 — Imprint placement
Real imprints live at `operators/<slug>/` **inside the operator's own private
clone** (after GitHub "Use this template"). The canonical public template ships
only `operators/_template/` (the skeleton) plus one synthetic
`operators/example-operator/` as a teaching artifact. Nothing real is ever
committed back to the public template. The "scaffold a fully separate sibling
repo" model is what the future installable-core graduation (D1) unlocks.

### D6 — Setup parameters
- **Name:** `operator-os`
- **Git:** local-only for now; publish to GitHub at a real v1 (do not publish a
  mid-design skeleton).
- **License:** MIT.
- **Location:** sibling to the source workspace on disk; source workspace stays
  untouched.

## Consequences

- The directory layout itself must teach the Four Cs and the three Meta-Protocols
  (structure as documentation).
- A secret-safety discipline (scanning, synthetic-only examples) is a
  first-class, non-negotiable part of the build — not an afterthought.
- The onboarding/imprint flow must be **generalized** from the source workspace's
  marketing-operator-specific intake into a domain-neutral "define your domain,
  agent roster, knowledge taxonomy, and cadence" flow.
- Because publishing is deferred, the license and contribution scaffolding can be
  finalized before the repo ever goes public.

## Supersedes / related

- First ADR in this repository.
- Full design spec to follow at `docs/superpowers/specs/2026-06-01-operator-os-design.md`
  once the remaining design chunks are complete.
