# builds/

This directory holds per-run records for the example-research-swarm. One subdirectory (or
file) per build slug.

## Structure

```
builds/
├── README.md                    ← this file
├── <slug>.md                    ← per-build state file (created by Orchestrator)
└── <slug>/
    └── brief.md                 ← research brief (created by Writer, read by Validator)
```

## Per-build state file (`<slug>.md`)

The Orchestrator creates `<slug>.md` at build start. Workers append to it; they never
overwrite existing content. The file contains:

| Section | Owner | Notes |
|---------|-------|-------|
| `## Header` | Orchestrator | Topic, slug, date, contract path |
| `## Phase Log` | All agents | Append-only timestamped entries |
| `## Research Log` | Researcher | Queries issued + URLs found |
| `## Source Notes` | Researcher | Summarise-source output, one block per URL |
| `## Research Summary` | Researcher | Overview + numbered cited claims |

The Validator does **not** read the state file — it reads only `brief.md` and the
validation contract. This preserves the Validator's fresh context.

## Brief (`<slug>/brief.md`)

Written by the Writer Worker from the Researcher's notes. Four required sections:

1. `## Overview`
2. `## Key Findings` — every item must have a `[Source: <url>]` citation
3. `## Source Disagreements or Gaps`
4. `## Sources Consulted`

---

## Sample build record

Below is a synthetic example showing what a completed state file looks like. It is for
teaching only — all URLs and claims are illustrative.

---

### `builds/example-run-001.md` (synthetic sample)

```markdown
---
topic: How do proof-of-work and proof-of-stake consensus mechanisms differ?
build_slug: example-run-001
contract: validation-contracts/brief-quality.md
date: 2026-06-01
---

## Header

- Topic: How do proof-of-work and proof-of-stake consensus mechanisms differ?
- Build slug: example-run-001
- Date: 2026-06-01
- Contract: validation-contracts/brief-quality.md

## Phase Log

- [2026-06-01 09:00] Orchestrator — validation contract authored, build-index.md updated.
- [2026-06-01 09:05] Researcher — research loop started.
- [2026-06-01 09:22] Researcher — 5 sources fetched, research summary written.
- [2026-06-01 09:25] Writer — brief.md written (412 words, 5 citations).
- [2026-06-01 09:30] Validator — PASS. All 5 assertions satisfied.
- [2026-06-01 09:32] Orchestrator — wiki page written, HITL emitted.

## Research Log

Queries issued:
1. "proof of work vs proof of stake consensus mechanism explained"
2. "proof of stake energy consumption comparison"
3. "bitcoin proof of work security model"
4. "ethereum proof of stake transition benefits"
5. "blockchain consensus mechanism trade-offs 2024"

URLs found (10 total; 5 selected for fetch):
- https://example-edu.org/consensus-mechanisms
- https://example-news.org/pow-pos-comparison
- https://example-tech.org/ethereum-merge-explained
- https://example-research.org/blockchain-security
- https://example-wiki.org/proof-of-stake

## Source Notes

### https://example-edu.org/consensus-mechanisms
- Claim: "Proof-of-work requires miners to solve cryptographic puzzles, consuming significant
  electrical energy." [Source: https://example-edu.org/consensus-mechanisms]
- Claim: "Proof-of-stake selects validators proportionally to their staked token holdings."
  [Source: https://example-edu.org/consensus-mechanisms]

### https://example-news.org/pow-pos-comparison
- Claim: "PoS networks consume roughly 99% less energy than equivalent PoW networks."
  [Source: https://example-news.org/pow-pos-comparison]

### https://example-tech.org/ethereum-merge-explained
- Claim: "Ethereum's transition to PoS in 2022 reduced its energy use by approximately 99.95%."
  [Source: https://example-tech.org/ethereum-merge-explained]

### https://example-research.org/blockchain-security
- Claim: "PoW security derives from the cost of computational work; attacking the network
  requires controlling 51% of hashrate." [Source: https://example-research.org/blockchain-security]

### https://example-wiki.org/proof-of-stake
- Claim: "Stake-based attacks require an attacker to acquire and risk a majority of staked
  tokens, creating a financial disincentive." [Source: https://example-wiki.org/proof-of-stake]

## Research Summary

Proof-of-work (PoW) and proof-of-stake (PoS) are two dominant consensus mechanisms in
blockchain networks. PoW uses computational puzzle-solving to validate blocks, making it
energy-intensive but resistant to Sybil attacks. PoS selects validators by staked token
holdings, achieving equivalent security with far lower energy consumption. Ethereum's
2022 migration from PoW to PoS demonstrated the feasibility of the transition at scale.

Key claims:
1. PoW requires miners to solve cryptographic puzzles. [Source: https://example-edu.org/consensus-mechanisms]
2. PoS selects validators by staked tokens. [Source: https://example-edu.org/consensus-mechanisms]
3. PoS uses ~99% less energy than PoW. [Source: https://example-news.org/pow-pos-comparison]
4. Ethereum's PoS transition cut energy use by 99.95%. [Source: https://example-tech.org/ethereum-merge-explained]
5. PoW security costs derive from hashrate; PoS from staked capital. [Source: https://example-research.org/blockchain-security]
```
