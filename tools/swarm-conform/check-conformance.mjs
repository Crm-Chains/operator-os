/**
 * tools/swarm-conform/check-conformance.mjs
 *
 * Structural conformance checker for operator-os swarm directories.
 * Implements the deterministic (non-semantic) subset of the 7-point checklist
 * defined in swarms/PROTOCOL.md.
 *
 * Usage (CLI):
 *   node tools/swarm-conform/check-conformance.mjs <swarm-dir>
 *
 * Exports:
 *   checkConformance(dir) → { checks: [{name, pass, notes}], pass: boolean }
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Run all structural conformance checks against a swarm directory.
 *
 * @param {string} dir - Absolute or relative path to the swarm directory.
 * @returns {{ checks: Array<{name: string, pass: boolean, notes: string}>, pass: boolean }}
 */
export function checkConformance(dir) {
  const absDir = resolve(dir);
  const checks = [];

  // ── S1: CLAUDE.md exists ──────────────────────────────────────────────────
  const claudePath = join(absDir, 'CLAUDE.md');
  const claudeExists = existsSync(claudePath);
  checks.push({
    name: 'S1: CLAUDE.md exists',
    pass: claudeExists,
    notes: claudeExists ? '' : `Not found: ${claudePath}`,
  });

  // ── S2: CLAUDE.md contains a reference to PROTOCOL.md ────────────────────
  let claudeContainsProtocol = false;
  if (claudeExists) {
    const content = readFileSync(claudePath, 'utf8');
    claudeContainsProtocol = content.includes('PROTOCOL.md');
  }
  checks.push({
    name: 'S2: CLAUDE.md references PROTOCOL.md',
    pass: claudeContainsProtocol,
    notes: claudeContainsProtocol
      ? ''
      : claudeExists
        ? 'CLAUDE.md does not contain "PROTOCOL.md"'
        : 'Skipped — CLAUDE.md missing',
  });

  // ── S3: role-registry.md exists ───────────────────────────────────────────
  const registryPath = join(absDir, 'role-registry.md');
  const registryExists = existsSync(registryPath);
  checks.push({
    name: 'S3: role-registry.md exists',
    pass: registryExists,
    notes: registryExists ? '' : `Not found: ${registryPath}`,
  });

  // ── S4: role-registry.md contains at least one "model" mention ────────────
  let registryHasModel = false;
  if (registryExists) {
    const content = readFileSync(registryPath, 'utf8');
    // Case-insensitive check for the word "model" anywhere in the file
    registryHasModel = /model/i.test(content);
  }
  checks.push({
    name: 'S4: role-registry.md mentions "model"',
    pass: registryHasModel,
    notes: registryHasModel
      ? ''
      : registryExists
        ? 'role-registry.md has no "model" mention'
        : 'Skipped — role-registry.md missing',
  });

  // ── S5: agents/ directory exists and is non-empty ─────────────────────────
  const agentsDir = join(absDir, 'agents');
  let agentsNonEmpty = false;
  let agentCount = 0;
  if (existsSync(agentsDir) && statSync(agentsDir).isDirectory()) {
    const entries = readdirSync(agentsDir);
    agentCount = entries.length;
    agentsNonEmpty = agentCount > 0;
  }
  checks.push({
    name: 'S5: agents/ directory is non-empty',
    pass: agentsNonEmpty,
    notes: agentsNonEmpty
      ? `${agentCount} file(s)`
      : existsSync(agentsDir)
        ? 'agents/ directory is empty'
        : `Not found: ${agentsDir}`,
  });

  // ── S6: validation contract file exists ───────────────────────────────────
  // Search agents/ directory AND swarm root for a file matching /validation|contract/i
  const contractPattern = /validation|contract/i;
  let contractFound = false;

  const searchDirs = [absDir];
  if (existsSync(agentsDir) && statSync(agentsDir).isDirectory()) {
    searchDirs.push(agentsDir);
  }

  for (const searchDir of searchDirs) {
    if (contractFound) break;
    if (!existsSync(searchDir)) continue;
    const entries = readdirSync(searchDir);
    for (const entry of entries) {
      if (contractPattern.test(entry)) {
        const fullPath = join(searchDir, entry);
        // Must be a file, not a subdirectory
        if (statSync(fullPath).isFile()) {
          contractFound = true;
          break;
        }
      }
    }
  }

  checks.push({
    name: 'S6: validation contract file exists',
    pass: contractFound,
    notes: contractFound
      ? ''
      : 'No file matching /validation|contract/i found in swarm root or agents/',
  });

  const allPass = checks.every((c) => c.pass);
  return { checks, pass: allPass };
}

// ── CLI entry point ────────────────────────────────────────────────────────
// Guard: only run when this file is invoked directly (not when imported as a module).
const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

if (isMain) {
  const dir = process.argv[2];
  if (!dir) {
    console.error('Usage: node tools/swarm-conform/check-conformance.mjs <swarm-dir>');
    process.exit(1);
  }

  const { checks, pass } = checkConformance(dir);

  const WIDTH_NAME = 42; // column width for check name — keeps output aligned
  console.log(`\nswarm-conform structural check — ${resolve(dir)}\n`);

  for (const check of checks) {
    const status = check.pass ? 'PASS' : 'FAIL';
    const notes = check.notes ? `  (${check.notes})` : '';
    console.log(`  [${status}]  ${check.name.padEnd(WIDTH_NAME)}${notes}`);
  }

  const total = checks.length;
  const passed = checks.filter((c) => c.pass).length;
  console.log(`\nResult: ${passed}/${total} checks passed — overall ${pass ? 'PASS' : 'FAIL'}\n`);

  process.exit(pass ? 0 : 1);
}
