# operator-os — Design Spec

- **Status:** Approved (design phase complete)
- **Date:** 2026-06-01
- **Repo:** `operator-os` (local-only; publish at v1)
- **Supersedes:** extends [ADR-0001](../../adr/0001-foundational-decisions.md)

---

## 1. Overview

operator-os is **the operator OS for Claude Code** — a public, open-core template
repository that gives any agent system four things in order: persistent **Context**,
external **Connections**, composable **Capabilities**, and automated **Cadence**. You
clone it, run `/onboard`, and imprint it with your own domain, agents, and knowledge
structure.

It is a clean-room extraction of the "Operator Harness OS" chassis that already exists,
in instance form, inside a private multi-agent agency workspace. The chassis is public;
verticals built on top stay private (open-core).

**The promise, stated as a test:** clone it with zero credentials → run the bundled
example → watch the Four Cs work end-to-end → delete the example → build your own.

## 2. Foundational decisions (from ADR-0001)

1. **Artifact** — a new standalone template repo (core-aware: boundary drawn so the
   core can later graduate into an installable package).
2. **Audience** — public, open-source, open-core. Hard constraint: zero secrets, zero
   client names, synthetic examples only.
3. **Harness** — Claude-Code-native only; no portability promise to Codex/Copilot/Gemini.
4. **Boundary** — chassis + one synthetic worked example (not empty; not a
   de-identified full workspace).
5. **Imprint placement** — real imprints live at `operators/<slug>/` inside the
   operator's own private clone; the public template ships only `_template/` + one
   synthetic example operator.
6. **Setup** — name `operator-os`; local-only git for now; MIT license; sibling to the
   source workspace.

## 3. Conceptual model

### The Four Cs (the spine)
| Layer | What it is | Lives in |
|---|---|---|
| **Context** | persistent thinking that survives sessions | `wiki/` + `docs/` |
| **Connections** | how the OS reaches the outside world | `.mcp.json` + `.env.example` + per-swarm `CLAUDE.md` |
| **Capabilities** | what it can *do* | `.claude/skills/` + `.claude/commands/` + `swarms/` |
| **Cadence** | what runs on rhythm without being asked | `.claude/settings.json` hooks + `/loop` `/schedule` + the BRAIN-STATUS gate + rituals |

### The three inheritable Meta-Protocols (`docs/protocols/`)
- **0.1 Persistent Knowledge** — the wiki engine + schema + maintenance loop.
- **0.2 Multi-Agent Coordination** — `swarms/PROTOCOL.md` + the `_protocol/` schemas.
- **0.3 Capability Extension** — skill conventions + the skill/agent factory.

No operator can extend their workspace without all three. They are the non-negotiable
foundation; everything else is operator-variable.

### The three rituals (commands)
- `/onboard` — imprint / snapshot the operator onto the OS.
- `/audit` — periodic gap-grade of the workspace against its own standards.
- `/level-up` — surface the next Eliminate/Automate/Delegate improvement.

## 4. Repository architecture

The directory layout **is** the teaching device — structure as documentation.

```
operator-os/
├── README.md · LICENSE (MIT) · CONTRIBUTING.md · CLAUDE.md (root router)
├── .env.example · .mcp.json (${VAR} refs only) · .gitignore
├── .claude/
│   ├── settings.json        ← hooks (incl. secret-scan guard) + permissions
│   ├── skills/              ← the FACTORY + chassis skills
│   └── commands/            ← /onboard · /audit · /level-up (+ model-pin governance)
├── docs/
│   ├── ai-os-framework.md   ← Four Cs · Three Ms · rituals
│   ├── protocols/           ← the 3 Meta-Protocols, one file each
│   ├── conventions/         ← skill-conventions · model-orchestration · command-model-pins
│   └── adr/                 ← decision records (ADR-0001 seeded)
├── wiki/                    ← CONTEXT engine
│   ├── ROUTER.md · CLAUDE.md (INGEST/QUERY/LINT gateway)
│   ├── schema/ · raw/ · wiki/ (+ _meta governance, seed pages)
├── swarms/                  ← CAPABILITIES (multi-agent)
│   ├── PROTOCOL.md          ← role taxonomy + conformance test
│   ├── _protocol/           ← handoff · control-plane · hitl-block · role-registry · validation-contract
│   └── example-research-swarm/   ← THE worked example (deletable)
├── operators/
│   ├── _template/           ← imprint skeleton /onboard fills in
│   └── example-operator/    ← one synthetic imprint (teaching artifact)
└── tools/                   ← helpers (secret-scan, etc.)
```

**OS-vs-instance boundary:** everything above is the OS. An *instance* = whatever lands
in `operators/<you>/` after onboarding + private swarms/skills/wiki-pages added in the
operator's own clone. The example swarm + example operator are the one exception — they
ship in the OS as teaching artifacts and are meant to be deleted.

## 5. Chassis components (module contracts)

| Module | Purpose | How you use it | Depends on |
|---|---|---|---|
| **Root `CLAUDE.md`** | route-first dispatch table | auto-loaded each session | docs, wiki ROUTER |
| **`docs/ai-os-framework.md`** | the conceptual model | read once to understand the OS | — |
| **`docs/protocols/`** | the 3 inheritable Meta-Protocols | referenced by onboarding + conformance | — |
| **`wiki/` engine** | persistent thinking | ingest → distill → query; maintenance skills keep it healthy | wiki schema |
| **`swarms/PROTOCOL.md` + `_protocol/`** | multi-agent contract | author swarms against it; conformance checker validates | — |
| **Factory: `find-skills` (inherent), `skill-creator`, swarm/agent scaffolder** | self-extension | create new skills + conformant agents/swarms | conventions, PROTOCOL |
| **Maintenance skills** (`wiki-*`, `tag-taxonomy`, `cross-linker`, brain-status) | keep Context healthy | run on cadence or on demand | wiki engine |
| **Rituals** (`/onboard`, `/audit`, `/level-up`) | imprint + self-improvement | invoked by the operator | all of the above |

Each module has one clear purpose, a well-defined interface, and is understandable and
testable on its own.

## 6. The imprint flow — `/onboard`

Domain-neutral, driven straight off the Four Cs. Default = a **guided wizard** (a few
well-chosen questions per layer, low first-run friction); `--deep` runs an
adversarial, architect-style interrogation for a sharper imprint.

```
/onboard → guided Four-Cs intake → operators/<slug>/
   ├─ Identity      who you are · slug · domain(s)
   ├─ Context       knowledge domains → seed wiki taxonomy + ROUTER entries
   ├─ Connections   external systems → .env NAMES + .mcp.json refs (never secrets)
   ├─ Capabilities  swarms + agent roles → scaffold first swarm vs PROTOCOL.md;
   │                 keep/drop chassis skills
   └─ Cadence       rituals/loops → settings.json hook + /schedule stubs
                          ▼
        operators/<slug>/IMPRINT.md   ← the manifest (generalized HANDOFF.md)
        + scaffolded skeleton wired to the chassis
```

`IMPRINT.md` records **who the operator is + which chassis pieces are activated + what
custom swarms/skills must be built.** It is the public, domain-neutral descendant of the
source workspace's `HANDOFF.md` extraction manifest.

**Open-core split:** `/onboard` is the generic public front door; a vertical-specific
intake (e.g., the source workspace's marketing `architect-intake`) is a **private plugin
specialization** of it. The OS does not know or care what domain an instance serves.

## 7. The worked example — `example-research-swarm`

Synthetic, **zero-credential**, domain-neutral. Domain = "research a topic, produce a
written brief."

```
                    topic in
              ┌────────▼─────────┐  Orchestrator (Opus): plan · dispatch · assemble
              └───┬──────────┬───┘
        handoff   │          │  handoff
          ┌───────▼──┐  ┌────▼─────┐  Researcher / Writer (Sonnet): search·fetch / draft
          └───────┬──┘  └────┬─────┘
                  │ findings │ draft
              ┌───▼──────────▼───┐  Validator (Sonnet): claims vs sources → PASS/FAIL (HITL)
              └────────┬─────────┘
                       ▼
            brief.md + wiki pages written ← Context persists into the next run
```

- **Tools:** `WebSearch` + `WebFetch` + file I/O + wiki. No paid APIs, no MCP credentials.
- **Conformance artifacts:** `CLAUDE.md`→`PROTOCOL.md`; `role-registry.md`; handoff
  schema usage; a validation contract authored *before* workers run; canonical HITL block.
- **Four Cs exercised:** Context (writes findings to the wiki); Connections
  (WebSearch/WebFetch, no secrets); Capabilities (the conformant swarm + one example
  skill); Cadence (a commented `/schedule` "re-research weekly" stub).
- **Deletable:** a banner in the swarm's `CLAUDE.md` and the README instruct the operator
  to delete it once they've authored their own.

## 8. Extraction safety (clean-room)

The single biggest risk is leaking the private source workspace's secrets/client data.

- **Re-author, never bulk-copy.** Build the chassis from its *patterns*. Where a source
  file is already generic, port it *through a line-by-line scrub*. Nothing transplanted blind.
- **`tools/secret-scan`** — denylist scan for known client slugs, provider-token patterns
  (GHL PIT, API keys), specific IDs (HeyGen/Slack/Drive), real emails/domains. Runs as a
  committed pre-commit hook **and** before any future publish.
- **Synthetic-only examples** — invented names (Acme, `example-operator`, fictional topics).
- **Clean history from commit #1** — history leaks even when the tree is clean; we keep it
  spotless so the eventual publish needs no history rewrite.

## 9. Verification — acceptance matrix

| # | Gate | Pass condition |
|---|---|---|
| 1 | **Clones-and-runs** | example swarm runs end-to-end with zero credentials → `brief.md` + wiki pages |
| 2 | **Secret-safety** | `secret-scan` = zero hits across tree *and* history |
| 3 | **Protocol conformance** | example swarm passes the shipped `swarm-conform` check vs `PROTOCOL.md` |
| 4 | **Onboarding dogfood** | `/onboard` on a throwaway slug → valid `IMPRINT.md` + skeleton that itself passes conformance |
| 5 | **Docs accuracy** | links resolve; Four-Cs-to-folder claims match the real tree |

Gate 1 is load-bearing. At publish time these become a GitHub Actions CI run (deferred —
local-only now).

## 10. OSS scaffolding

- **CONTRIBUTING.md** — how to author a conformant skill/swarm/agent (points to the
  conventions docs + factory skills).
- **README** — the real pitch (current is a design-phase stub).
- "Delete the example" surfaced in README + the example's `CLAUDE.md`.
- `CODE_OF_CONDUCT.md` + issue/PR templates — optional; can wait for publish.

## 11. Out of scope (v1)

- Harness portability (Codex/Copilot/Gemini) — additive future effort.
- Graduating the core into an installable package/submodule — boundary kept ready, work deferred.
- GitHub publish + CI — deferred until a real v1 (we are local-only).
- De-identified full reference workspace (rejected boundary option C).
- Any real proprietary vertical (GHL, content pipelines, real client swarms) — stays private.

## 12. Future / open

- **Installable-core graduation** — when the boundary stabilizes, extract the chassis into
  a versioned package consumed by instances (resolves cross-instance upgrade propagation).
- **Publish gate** — full-history secret-scan + conformance + smoke must pass before the
  repo goes public; choose CODE_OF_CONDUCT + templates at that point.
