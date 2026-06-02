---
title: Concept - Retrieval-Augmented Generation
type: concept
tags: [concept, framework, knowledge-management]
aliases: [RAG, RAG pattern]
summary: A pattern where an AI agent retrieves relevant context from a knowledge store before generating a response, improving accuracy and reducing hallucination.
updated: 2026-06-01
deprecated: false
disputed: []
---

<!-- ============================================================
     EXAMPLE PAGE — DELETABLE
     
     This page demonstrates the anatomy of a wiki concept page.
     It is a synthetic example, not real domain knowledge.
     Delete it (and remove its entry from _meta/index.md) once
     you have created your first real concept page.
     ============================================================ -->

# Concept - Retrieval-Augmented Generation

**So what:** RAG makes language models more accurate and trustworthy by grounding their responses in retrieved facts rather than relying solely on training-time knowledge.

---

## What it is

Retrieval-Augmented Generation (RAG) is a pattern where an AI agent, before generating a response, retrieves a set of relevant documents or passages from an external knowledge store and includes them in its context window. The model then generates its response conditioned on both the original query and the retrieved material.

The key insight is that retrieval separates *what to say* (retrieved facts) from *how to say it* (the model's language capability). This separation makes responses more verifiable and easier to update — change the knowledge store, and the model's responses change without retraining.

---

## When to use it

- When the model needs facts that may have changed since its training cutoff
- When accuracy is more important than latency (retrieval adds a step)
- When you need the model to cite its sources
- When domain knowledge is too large to fit in a single context window

---

## How this wiki implements RAG

This wiki is itself a RAG knowledge store. The ingest-query-lint loop produces structured, tagged pages optimized for retrieval. When an agent needs to answer a question:

1. `wiki/ROUTER.md` identifies the relevant section of the vault
2. The agent reads 2–3 targeted pages (not the full vault)
3. Those pages form the retrieved context
4. The agent generates its response grounded in that context

See [[Meta - About This Wiki]] for how the full loop works.

---

## Key properties of good RAG sources

- **Chunked correctly** — each page covers one concept; not too broad, not too narrow
- **Tagged for routing** — controlled vocabulary enables fast, accurate retrieval
- **Freshness-tracked** — `updated:` frontmatter enables staleness detection
- **Cross-linked** — `[[wikilinks]]` between related pages improve recall

---

## Related pages

- [[Meta - About This Wiki]] — how the wiki implements the retrieval layer
- [[Meta - Index]] — full page index; navigate the vault by type

---

## Sources

*This is a synthetic example page with no real source. In a real source page, you would add:*

```
## Sources
- Original paper: [Retrieval-Augmented Generation for NLP](https://arxiv.org/abs/2005.11401) (Lewis et al., 2020)
```
