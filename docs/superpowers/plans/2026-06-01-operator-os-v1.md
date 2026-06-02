# operator-os v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build operator-os v1 — a public, Claude-Code-native, open-core operator OS (chassis + one synthetic worked example) that clones-and-runs with zero credentials.

**Architecture:** A template repo whose directory layout teaches the Four Cs. Built in 7 sequenced phases, each independently testable. This document fully details **Phase 1 (secret-scan safety harness)**; Phases 2–7 are roadmapped here and each gets its own full plan just-in-time.

**Tech Stack:** Node.js (built-in `node:test`, zero runtime dependencies — preserves the "clones-and-runs with nothing installed" promise), Markdown, Claude Code primitives (skills, commands, hooks), git hooks.

---

## Build Roadmap (7 phases)

| Phase | Delivers | Acceptance gate | Depends on |
|---|---|---|---|
| **1. Safety harness** ⟵ *this plan* | `tools/secret-scan` + `.githooks/pre-commit` + root `package.json` | Gate 2: planted-secret fixture → exit 1; clean tree → exit 0; hook blocks a secret commit | — |
| **2. Framework & conventions docs** | root `CLAUDE.md`, `docs/ai-os-framework.md`, `docs/protocols/*` (3), `docs/conventions/*`, real `README.md`, `CONTRIBUTING.md` | Gate 5: links resolve; Four-Cs↔folder claims match tree | 1 |
| **3. Wiki engine (Context)** | `wiki/schema/`, `wiki/ROUTER.md`, `wiki/CLAUDE.md` gateway, maintenance skills (`wiki-*`, `tag-taxonomy`, `cross-linker`), seed `_meta` pages | wiki INGEST/QUERY/LINT runs on a seed page | 2 |
| **4. Swarm protocol + factory (Capabilities)** | `swarms/PROTOCOL.md`, `swarms/_protocol/*` schemas, factory skills (`find-skills`, `skill-creator`, swarm/agent scaffolder), conformance checker | conformance checker runs; scaffolder emits a conformant stub | 2 |
| **5. Example research swarm** | `swarms/example-research-swarm/` (orchestrator + researcher + writer + validator, role-registry, validation contract), one example skill | Gate 1 + 3: runs end-to-end zero-cred → `brief.md` + wiki pages; passes conformance | 3, 4 |
| **6. Imprint flow** | `/onboard` (wizard + `--deep`), `operators/_template/`, synthetic `operators/example-operator/IMPRINT.md`, `/audit` + `/level-up` rituals | Gate 4: `/onboard` on throwaway slug → valid IMPRINT.md + conformant skeleton | 4 |
| **7. Verification harness** | a runnable `tools/verify` wiring all 5 gates; final README "delete the example" pass | all 5 gates green | 1–6 |

Each later phase is expanded into its own `docs/superpowers/plans/2026-06-01-operator-os-v1-phase-N-*.md` immediately before it is executed.

---

## Phase 1 — Secret-scan safety harness

**Files:**
- Create: `package.json` (repo root)
- Create: `tools/secret-scan/scan.mjs`
- Create: `tools/secret-scan/scan.test.mjs`
- Create: `tools/secret-scan/README.md`
- Create: `.githooks/pre-commit`

### Task 1: Repo Node skeleton + first failing test

**Files:**
- Create: `package.json`
- Test: `tools/secret-scan/scan.test.mjs`

- [ ] **Step 1: Create the root `package.json`**

```json
{
  "name": "operator-os",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "license": "MIT",
  "scripts": {
    "test": "node --test",
    "secret-scan": "node tools/secret-scan/scan.mjs"
  }
}
```

- [ ] **Step 2: Write the failing test for the core scanner**

Create `tools/secret-scan/scan.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanText } from './scan.mjs';

test('detects an OpenAI-style key', () => {
  const f = scanText('x.md', 'token = sk-abcdefABCDEF0123456789xyz');
  assert.equal(f.length, 1);
  assert.match(f[0].name, /OpenAI/);
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `node --test tools/secret-scan/`
Expected: FAIL — `Cannot find module './scan.mjs'` (file not yet created).

### Task 2: Implement the pattern engine

**Files:**
- Create: `tools/secret-scan/scan.mjs`
- Test: `tools/secret-scan/scan.test.mjs`

- [ ] **Step 1: Implement `scan.mjs` (pure functions + guarded CLI)**

```js
#!/usr/bin/env node
// tools/secret-scan/scan.mjs — generic, pattern-based secret detector.
// PUBLIC FILE: contains NO private/client-specific terms (those would themselves
// be a leak). Detects provider token shapes, private-key blocks, bearer tokens,
// and real values leaking into .env.example.
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const PATTERNS = [
  { name: 'OpenAI key',        re: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { name: 'GitHub token',      re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  { name: 'Slack token',       re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Google API key',    re: /\bAIza[0-9A-Za-z_\-]{35}\b/ },
  { name: 'GHL PIT',           re: /\bpit-[0-9a-fA-F-]{20,}\b/ },
  { name: 'Private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  { name: 'Bearer token',      re: /\bBearer\s+[A-Za-z0-9._\-]{20,}/ },
];

const PLACEHOLDER = /^(\$\{[^}]+\}|your[_-].*|<[^>]+>|changeme|example.*|x{3,})$/i;

export function scanEnvExample(content) {
  const findings = [];
  content.split(/\r?\n/).forEach((line, i) => {
    const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!m) return;
    const value = m[2].trim().replace(/^["']|["']$/g, '');
    if (value && !PLACEHOLDER.test(value)) {
      findings.push({ line: i + 1, name: `env value for ${m[1]}`, match: value.slice(0, 12) + '…' });
    }
  });
  return findings;
}

export function scanText(name, content) {
  const findings = [];
  content.split(/\r?\n/).forEach((line, i) => {
    for (const { name: pname, re } of PATTERNS) {
      const m = line.match(re);
      if (m) findings.push({ line: i + 1, name: pname, match: m[0].slice(0, 12) + '…' });
    }
  });
  if (/(^|[/\\])\.env\.example$/.test(name)) findings.push(...scanEnvExample(content));
  return findings;
}

function targetFiles(argv) {
  if (argv.length) return argv;
  return execSync('git ls-files', { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
}

function main() {
  const files = targetFiles(process.argv.slice(2));
  let total = 0;
  for (const f of files) {
    let content;
    try { content = readFileSync(f, 'utf8'); } catch { continue; }
    for (const x of scanText(f, content)) {
      total++;
      console.error(`✖ ${f}:${x.line}  ${x.name}  (${x.match})`);
    }
  }
  if (total) { console.error(`\nsecret-scan: ${total} potential secret(s) found.`); process.exit(1); }
  console.log(`secret-scan: clean (${files.length} files).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
```

- [ ] **Step 2: Run the test to verify it passes**

Run: `node --test tools/secret-scan/`
Expected: PASS (1 test).

- [ ] **Step 3: Add coverage tests (clean text, private key, env leakage)**

Append to `tools/secret-scan/scan.test.mjs`:

```js
test('clean text yields no findings', () => {
  assert.deepEqual(scanText('x.md', 'a normal sentence with no secrets'), []);
});

test('detects a private key block', () => {
  assert.equal(scanText('id_rsa', '-----BEGIN OPENSSH PRIVATE KEY-----').length, 1);
});

test('.env.example with a real value is flagged', () => {
  const f = scanText('.env.example', 'API_TOKEN=supersecretvalue123');
  assert.ok(f.some(x => /env value/.test(x.name)));
});

test('.env.example with placeholders or ${VAR} is clean', () => {
  assert.deepEqual(scanText('.env.example', 'A=\nB=${B}\nC=your_token_here'), []);
});
```

- [ ] **Step 4: Run the full suite**

Run: `node --test tools/secret-scan/`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add package.json tools/secret-scan/scan.mjs tools/secret-scan/scan.test.mjs
git commit -m "feat(safety): pattern-based secret-scan core + tests"
```

### Task 3: Pre-commit hook + wiring

**Files:**
- Create: `.githooks/pre-commit`
- Create: `tools/secret-scan/README.md`

- [ ] **Step 1: Create `.githooks/pre-commit`**

```sh
#!/bin/sh
# Block commits containing secrets. Scans staged files only.
staged=$(git diff --cached --name-only --diff-filter=ACM)
[ -z "$staged" ] && exit 0
node tools/secret-scan/scan.mjs $staged || {
  echo "commit blocked: secret-scan found potential secrets (see above)." >&2
  echo "if this is a false positive, see tools/secret-scan/README.md." >&2
  exit 1
}
```

- [ ] **Step 2: Activate the hooks path**

Run: `git config core.hooksPath .githooks`
Then (POSIX shells): `chmod +x .githooks/pre-commit`
Expected: no output; `git config core.hooksPath` prints `.githooks`.

- [ ] **Step 3: Write `tools/secret-scan/README.md`**

```markdown
# secret-scan

Generic, pattern-based secret detector. Zero dependencies.

- `npm run secret-scan` — scan all git-tracked files.
- `node tools/secret-scan/scan.mjs <files...>` — scan specific files.
- Runs automatically on `git commit` via `.githooks/pre-commit`.

Detects provider token shapes (OpenAI/GitHub/Slack/AWS/Google/GHL), private-key
blocks, bearer tokens, and real values leaking into `.env.example`. Exit code 1
on any finding. This file intentionally contains **no private or client-specific
denylist** — that would itself be a leak. Apply such a denylist out-of-band when
extracting from a private source.

False positive? Refine the pattern in `scan.mjs` and add a regression test.
```

- [ ] **Step 4: Verify the hook blocks a planted secret**

```bash
printf 'token: sk-abcdefABCDEF0123456789test\n' > /tmp/leak.md
cp /tmp/leak.md leak-fixture.md
git add leak-fixture.md
git commit -m "test: should be blocked"   # expect: BLOCKED, exit 1
git restore --staged leak-fixture.md && rm leak-fixture.md
```
Expected: commit is blocked with a `✖ leak-fixture.md:1  OpenAI key` line.

- [ ] **Step 5: Commit the hook + docs**

```bash
git add .githooks/pre-commit tools/secret-scan/README.md
git commit -m "feat(safety): pre-commit secret-scan hook + usage docs"
```

---

## Self-Review (Phase 1 vs spec)

- **Spec §8 (extraction safety):** secret-scan tool ✓, pre-commit hook ✓, generic-not-denylist ✓ (Task 2 comment + README), clean-history preserved ✓ (no secrets introduced).
- **Spec §9 Gate 2 (secret-safety):** enforced by Task 2 tests + Task 3 hook ✓.
- **Placeholder scan:** none — all code is complete and runnable.
- **Type consistency:** `scanText(name, content)` / `scanEnvExample(content)` signatures consistent across scan.mjs and scan.test.mjs ✓.
- **Roadmap coverage:** every spec subsystem maps to a roadmap phase (table above); each future phase gets its own full plan before execution.
