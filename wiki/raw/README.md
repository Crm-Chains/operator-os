# wiki/raw/ — Ingestion Staging Area

This directory holds raw source material before distillation. Files placed here are **immutable** — agents read them but never edit them.

## What belongs here

- Articles, blog posts, papers saved as plain text or markdown
- Interview or meeting transcripts
- Documentation exports
- Research notes taken verbatim from a source
- Any external content you want the wiki to learn from

## What does NOT belong here

- Credentials, API keys, tokens — never store these anywhere in the wiki
- Partially-processed or agent-generated content — that goes in `wiki/wiki/`
- Duplicate files — one canonical copy per source

## Subdirectory conventions

Organize by source type. Suggested structure (adjust to your domain):

```
raw/
├── articles/       ← web articles, blog posts
├── transcripts/    ← video, audio, interview transcripts
├── papers/         ← research papers, whitepapers
├── notes/          ← freeform operator notes
└── docs/           ← documentation exports, reference material
```

## Immutability rule

Raw files are never modified after placement. If a source is updated, place the new version as a new file (e.g., append a date suffix) and re-ingest. The original stays as a point-in-time record.

## Ingest workflow

1. Place the source file here.
2. Run `/wiki-ingest wiki/raw/<path>` — the skill reads the raw file and writes a structured page to `wiki/wiki/sources/`.
3. The raw file remains here unchanged. The wiki page in `sources/` is the distilled version.

Raw files in this directory are tracked by git but their content is never used directly by agents during QUERY operations — always query through the distilled wiki pages.
