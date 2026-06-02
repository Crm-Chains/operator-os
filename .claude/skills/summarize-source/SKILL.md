---
name: summarize-source
description: Summarises a fetched web source into structured, cited notes suitable for a research brief. Extracts key claims, attributes each to the source URL, and flags unsupported or hedged assertions. Designed for use inside the Researcher Worker of research swarms.
model: sonnet
---

# summarize-source

Converts raw fetched web content into structured, cited notes. Used by the Researcher
Worker inside research swarms. Input is a URL + raw page content + research topic;
output is a set of claim bullets, each attributed to the source.

---

## When to invoke

Call this skill immediately after a successful WebFetch call, before appending anything to
the build state file. Do not summarise content you have not actually fetched.

```
/summarize-source
url: <url>
content: <raw fetched text — paste the full WebFetch output>
topic: <the research question or subject>
```

---

## What the skill produces

A structured note block in this format:

```markdown
### <url>
- Claim: "<verbatim or close-paraphrase claim from the source, directly relevant to the topic>."
  [Source: <url>]
- Claim: "<next claim>."
  [Source: <url>]
- [UNSUPPORTED] "<hedged or speculative statement that should not be treated as fact>."
- [OFF-TOPIC] Skipped N paragraphs not relevant to topic.
```

Rules applied during extraction:

| Rule | Behaviour |
|------|-----------|
| Relevance filter | Only extract claims relevant to the `topic`. Off-topic content is logged as `[OFF-TOPIC]` with a count. |
| Citation on every claim | Every claim line ends with `[Source: <url>]`. Never emit a claim without it. |
| No fabrication | If the fetched content does not support a claim, do not emit it. |
| Hedge flagging | Speculative or hedged statements (uses "may", "might", "could", "unclear") are marked `[UNSUPPORTED]`. |
| Deduplication | If a claim is a restatement of a prior claim in this summary, skip it. |
| Length cap | Emit at most 8 claim bullets per source. Prefer the most specific, well-supported claims. |

---

## Model rationale

**Sonnet** — extracting claims from unstructured web content requires judgement: deciding
what is relevant, distinguishing a stated fact from a hedged opinion, and paraphrasing
accurately without over-summarising or fabricating. This is a pattern-matching-with-judgement
task — the Sonnet tier in the decision tree (`docs/conventions/model-orchestration.md`).

---

## Failure modes

| Failure | Response |
|---------|----------|
| Fetched content is blank or an error page | Emit a single line: `[FETCH FAILED] <url> — content empty or error.` Do not call the skill. |
| Content is in a non-English language | Emit up to 3 translated claims if confident; flag `[TRANSLATED]`. If not confident, emit `[LANGUAGE BARRIER] — skipped.` |
| Content is a paywall / login page | Emit `[PAYWALLED] <url> — no extractable content.` |
| Content has no claims relevant to topic | Emit `[OFF-TOPIC] <url> — no relevant claims found.` |

---

## Example invocation and output

**Input:**

```
/summarize-source
url: https://example-edu.org/consensus-mechanisms
content: [raw page text about blockchain consensus mechanisms]
topic: How do proof-of-work and proof-of-stake consensus mechanisms differ?
```

**Output:**

```markdown
### https://example-edu.org/consensus-mechanisms
- Claim: "Proof-of-work requires miners to solve cryptographic puzzles, consuming significant
  electrical energy." [Source: https://example-edu.org/consensus-mechanisms]
- Claim: "Proof-of-stake selects validators proportionally to their staked token holdings,
  eliminating the need for energy-intensive computation." [Source: https://example-edu.org/consensus-mechanisms]
- [UNSUPPORTED] "Some researchers suggest PoS may introduce new centralisation risks — the
  evidence is still emerging."
```

---

## Related

- `swarms/example-research-swarm/agents/researcher.md` — primary caller
- `docs/conventions/model-orchestration.md` — model selection rationale
- `docs/conventions/skill-model-pins.md` — pin catalog (row added on creation)
