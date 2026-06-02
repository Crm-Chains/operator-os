#!/usr/bin/env node
// tools/verify/run.mjs — operator-os verification harness.
// Runs the automatable acceptance gates from the §9 matrix and summarises results.
// Exit 0 only if all three automatable gates PASS.
//
// Gates:
//   Gate 2 (Secret-safety)     → node tools/secret-scan/scan.mjs
//   Gate 3 (Conformance)       → node tools/swarm-conform/check-conformance.mjs swarms/example-research-swarm
//   Gate 5 (Docs accuracy)     → node tools/docs-check/check-links.mjs
//   Gate 1 (Clones-and-runs)   → MANUAL
//   Gate 4 (Onboarding dogfood)→ MANUAL

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';

function header(text) {
  console.log(`\n${BOLD}${CYAN}${'─'.repeat(60)}${RESET}`);
  console.log(`${BOLD}${CYAN}  ${text}${RESET}`);
  console.log(`${BOLD}${CYAN}${'─'.repeat(60)}${RESET}`);
}

function result(pass, label) {
  const tag = pass ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
  console.log(`\n${BOLD}Result: [${tag}${BOLD}]  ${label}${RESET}\n`);
}

function runGate(label, args, { capture = false } = {}) {
  header(label);
  const opts = {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
  };
  const r = spawnSync('node', args, opts);
  if (capture && r.stdout) process.stdout.write(r.stdout);
  if (capture && r.stderr) process.stderr.write(r.stderr);
  const pass = r.status === 0;
  result(pass, label);
  return pass;
}

function manualGate(label, instructions) {
  header(label);
  console.log(`${YELLOW}  MANUAL — not automatable in this harness.${RESET}\n`);
  console.log(instructions);
  console.log();
}

// ── Automatable gates ──────────────────────────────────────────────────────

const g2 = runGate(
  'Gate 2 — Secret-safety (secret-scan)',
  ['tools/secret-scan/scan.mjs'],
);

const g3 = runGate(
  'Gate 3 — Protocol conformance (swarm-conform)',
  ['tools/swarm-conform/check-conformance.mjs', 'swarms/example-research-swarm'],
);

const g5 = runGate(
  'Gate 5 — Docs accuracy (check-links)',
  ['tools/docs-check/check-links.mjs'],
);

// ── Manual gates ───────────────────────────────────────────────────────────

manualGate('Gate 1 — Clones-and-runs (MANUAL)', `\
  Steps to verify in a live Claude Code session:
    1.  git clone <this repo> /tmp/operator-os-test && cd /tmp/operator-os-test
    2.  cp .env.example .env.local   # no real credentials needed for example swarm
    3.  Open Claude Code in that directory.
    4.  Run:  /onboard --example
        or invoke the example swarm directly per swarms/example-research-swarm/CLAUDE.md
    5.  Confirm brief.md is produced and wiki pages are written.
  Pass condition: brief.md exists + zero credential prompts required.`);

manualGate('Gate 4 — Onboarding dogfood (MANUAL)', `\
  Steps to verify in a live Claude Code session:
    1.  Open a fresh clone of this repo in Claude Code.
    2.  Run:  /onboard
    3.  Answer all Four-Cs prompts (use a throwaway slug, e.g. "test-operator").
    4.  Confirm operators/test-operator/IMPRINT.md was created.
    5.  Run conformance on any scaffolded swarm:
          node tools/swarm-conform/check-conformance.mjs operators/test-operator/swarms/<name>
  Pass condition: valid IMPRINT.md + conformance PASS on the scaffolded swarm.`);

// ── Summary ────────────────────────────────────────────────────────────────

header('FINAL SUMMARY');

const gates = [
  { id: 2, label: 'Secret-safety',      pass: g2, auto: true },
  { id: 3, label: 'Protocol conformance', pass: g3, auto: true },
  { id: 5, label: 'Docs accuracy',       pass: g5, auto: true },
  { id: 1, label: 'Clones-and-runs',     pass: null, auto: false },
  { id: 4, label: 'Onboarding dogfood',  pass: null, auto: false },
];

for (const g of gates) {
  const tag = g.auto
    ? (g.pass ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`)
    : `${YELLOW}MANUAL${RESET}`;
  console.log(`  Gate ${g.id}: [${tag}]  ${g.label}`);
}

const allAutoPass = g2 && g3 && g5;
console.log();
if (allAutoPass) {
  console.log(`${GREEN}${BOLD}All automatable gates PASS. Run manual gates before publishing.${RESET}`);
} else {
  console.log(`${RED}${BOLD}One or more automatable gates FAILED. See output above.${RESET}`);
}
console.log();

process.exit(allAutoPass ? 0 : 1);
