/**
 * tools/swarm-conform/check-conformance.test.mjs
 *
 * Unit tests for the structural conformance checker.
 * Uses only Node built-ins: node:test, node:assert, node:fs, node:os, node:path.
 *
 * Run:
 *   node --test tools/swarm-conform/
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkConformance } from './check-conformance.mjs';

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Create an isolated temp directory for a single test swarm.
 * @returns {string} absolute path to the temp dir
 */
function makeTempDir() {
  return mkdtempSync(join(tmpdir(), 'swarm-conform-test-'));
}

/**
 * Build a fully conformant swarm structure inside `dir`.
 * All 6 structural checks should pass.
 */
function buildConformantSwarm(dir) {
  // S1 + S2: CLAUDE.md with PROTOCOL.md reference
  writeFileSync(
    join(dir, 'CLAUDE.md'),
    '# My Swarm\nRead first: swarms/PROTOCOL.md\n',
  );

  // S3 + S4: role-registry.md with a model mention
  writeFileSync(
    join(dir, 'role-registry.md'),
    '# Role Registry\n| Role | model | Agent file |\n|---|---|---|\n| Orchestrator | opus | agents/orchestrator.md |\n',
  );

  // S5: non-empty agents/ directory
  mkdirSync(join(dir, 'agents'));
  writeFileSync(
    join(dir, 'agents', 'orchestrator.md'),
    '# Orchestrator\nRole: Orchestrator\n',
  );

  // S6: validation contract file in agents/
  writeFileSync(
    join(dir, 'agents', 'validation-contract.md'),
    '# Validation Contract\n- [ ] assertion 1\n',
  );
}

/**
 * Build a non-conformant swarm — missing role-registry.md (S3/S4 fail).
 * CLAUDE.md, agents/, and a contract file are still present.
 */
function buildNonConformantSwarm(dir) {
  // S1 + S2: present
  writeFileSync(
    join(dir, 'CLAUDE.md'),
    '# Broken Swarm\nRead first: swarms/PROTOCOL.md\n',
  );

  // S3 + S4: role-registry.md intentionally omitted

  // S5: non-empty agents/
  mkdirSync(join(dir, 'agents'));
  writeFileSync(
    join(dir, 'agents', 'worker.md'),
    '# Worker\nRole: Worker\n',
  );

  // S6: contract present
  writeFileSync(
    join(dir, 'agents', 'validation-contract.md'),
    '# Validation Contract\n- [ ] assertion 1\n',
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

test('conformant swarm — all structural checks pass', () => {
  const dir = makeTempDir();
  buildConformantSwarm(dir);

  const result = checkConformance(dir);

  // Overall result must be pass
  assert.equal(result.pass, true, 'Expected overall pass for a conformant swarm');

  // Every individual check must pass
  for (const check of result.checks) {
    assert.equal(
      check.pass,
      true,
      `Expected check "${check.name}" to pass but got FAIL — notes: ${check.notes}`,
    );
  }

  // Exactly 6 structural checks defined
  assert.equal(result.checks.length, 6, 'Expected exactly 6 structural checks');
});

test('non-conformant swarm (missing role-registry.md) — S3 and S4 fail, overall fails', () => {
  const dir = makeTempDir();
  buildNonConformantSwarm(dir);

  const result = checkConformance(dir);

  // Overall result must be fail
  assert.equal(result.pass, false, 'Expected overall fail for a non-conformant swarm');

  // S1 and S2 should pass (CLAUDE.md with PROTOCOL.md reference present)
  const s1 = result.checks.find((c) => c.name.startsWith('S1'));
  const s2 = result.checks.find((c) => c.name.startsWith('S2'));
  assert.ok(s1, 'S1 check must exist');
  assert.ok(s2, 'S2 check must exist');
  assert.equal(s1.pass, true, 'S1 (CLAUDE.md exists) should pass');
  assert.equal(s2.pass, true, 'S2 (PROTOCOL.md reference) should pass');

  // S3 must fail — role-registry.md is absent
  const s3 = result.checks.find((c) => c.name.startsWith('S3'));
  assert.ok(s3, 'S3 check must exist');
  assert.equal(s3.pass, false, 'S3 (role-registry.md exists) should fail');

  // S4 must fail — registry file missing so model check is also impossible
  const s4 = result.checks.find((c) => c.name.startsWith('S4'));
  assert.ok(s4, 'S4 check must exist');
  assert.equal(s4.pass, false, 'S4 (model mention in registry) should fail');

  // S5 should pass — agents/ is non-empty
  const s5 = result.checks.find((c) => c.name.startsWith('S5'));
  assert.ok(s5, 'S5 check must exist');
  assert.equal(s5.pass, true, 'S5 (agents/ non-empty) should pass');

  // S6 should pass — contract file is present
  const s6 = result.checks.find((c) => c.name.startsWith('S6'));
  assert.ok(s6, 'S6 check must exist');
  assert.equal(s6.pass, true, 'S6 (validation contract exists) should pass');
});

test('empty swarm directory — all checks fail', () => {
  const dir = makeTempDir();
  // Write nothing into dir

  const result = checkConformance(dir);

  assert.equal(result.pass, false, 'Expected overall fail for an empty swarm directory');

  const failures = result.checks.filter((c) => !c.pass);
  // At minimum S1, S3, S5, S6 must fail (S2 and S4 are dependent on S1/S3)
  assert.ok(failures.length >= 4, `Expected at least 4 failures, got ${failures.length}`);
});

test('CLAUDE.md exists but lacks PROTOCOL.md reference — S2 fails', () => {
  const dir = makeTempDir();

  // CLAUDE.md without PROTOCOL.md mention
  writeFileSync(join(dir, 'CLAUDE.md'), '# Swarm without protocol reference\n');

  // Provide everything else valid
  writeFileSync(
    join(dir, 'role-registry.md'),
    '| Role | model |\n|---|---|\n| Worker | sonnet |\n',
  );
  mkdirSync(join(dir, 'agents'));
  writeFileSync(join(dir, 'agents', 'worker.md'), '# Worker\n');
  writeFileSync(join(dir, 'agents', 'contract.md'), '# Contract\n');

  const result = checkConformance(dir);

  assert.equal(result.pass, false, 'Expected overall fail when PROTOCOL.md reference missing');

  const s2 = result.checks.find((c) => c.name.startsWith('S2'));
  assert.ok(s2, 'S2 check must exist');
  assert.equal(s2.pass, false, 'S2 should fail when CLAUDE.md lacks PROTOCOL.md reference');
});
