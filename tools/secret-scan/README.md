# secret-scan

Generic, pattern-based secret detector. Zero dependencies (Node built-ins only).

- `npm run secret-scan` — scan all git-tracked files.
- `node tools/secret-scan/scan.mjs <files...>` — scan specific files.
- Runs automatically on `git commit` via `.githooks/pre-commit`.

Detects provider token shapes (OpenAI / GitHub / Slack / AWS / Google / GHL),
private-key blocks, bearer tokens, and real values leaking into `.env.example`.
Exit code `1` on any finding, `0` when clean.

## Allowlist

Paths listed in `.secretscanignore` (repo root) are skipped — for test fixtures
and planning docs that contain *intentional* example token shapes. Glob support:
`*` (matches within a path segment) and `**` (matches across segments). Keep the
list tight; an over-broad allowlist defeats the scanner.

This tool ships **no private/client-specific denylist** — embedding one would
itself leak those identifiers into a public repo. Apply such a denylist
out-of-band when extracting from a private source.

## Activate the hook (first clone)

```sh
git config core.hooksPath .githooks
```

False positive? Tighten the pattern in `scan.mjs` and add a regression test to
`scan.test.mjs`, or add a narrow path to `.secretscanignore`.
