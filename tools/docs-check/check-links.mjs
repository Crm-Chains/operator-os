#!/usr/bin/env node
// tools/docs-check/check-links.mjs — zero-dep internal link checker for markdown files.
// Finds relative internal links [text](path), resolves relative to the file's dir,
// verifies each target exists (file or directory). Ignores http/https/mailto links
// and pure anchor (#...) links. Strips trailing #anchor before resolving.
//
// Usage:
//   node tools/docs-check/check-links.mjs [file1.md file2.md ...]
//   (with no args, reads tracked files via git ls-files "*.md")
//
// Exports: findBrokenLinks(file, content) — pure function for testing.

import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const LINK_RE = /\[(?:[^\]]*)\]\(([^)]+)\)/g;

/**
 * Find broken relative internal links in a markdown file's content.
 *
 * @param {string} file    - File path (used for resolving relative links).
 * @param {string} content - Markdown content of the file.
 * @returns {Array<{line: number, target: string}>} Broken link findings.
 */
export function findBrokenLinks(file, content) {
  const findings = [];
  const fileDir = dirname(resolve(file));
  const lines = content.split(/\r?\n/);
  let inFencedBlock = false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const raw = lines[lineIdx];

    // Track fenced code blocks (``` or ~~~) — skip link-scanning inside them.
    if (/^[ \t]*(`{3,}|~{3,})/.test(raw)) {
      inFencedBlock = !inFencedBlock;
      continue;
    }
    if (inFencedBlock) continue;

    // Strip inline code spans (` ... `) before scanning for links so that
    // example text like `[link](path)` is not treated as a real link.
    const line = raw.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length));
    let match;
    LINK_RE.lastIndex = 0;
    while ((match = LINK_RE.exec(line)) !== null) {
      const raw = match[1].trim();

      // Ignore external links (http, https, mailto)
      if (/^https?:\/\//i.test(raw) || /^mailto:/i.test(raw)) continue;

      // Ignore pure anchor links (#something)
      if (raw.startsWith('#')) continue;

      // Strip trailing #anchor fragment
      const withoutAnchor = raw.replace(/#[^#]*$/, '');

      // After stripping anchor, if empty, it was a pure anchor — skip
      if (!withoutAnchor) continue;

      const resolved = resolve(join(fileDir, withoutAnchor));

      if (!existsSync(resolved)) {
        findings.push({ line: lineIdx + 1, target: withoutAnchor });
      }
    }
  }

  return findings;
}

function targetFiles(argv) {
  if (argv.length) return argv;
  return execSync('git ls-files "*.md"', { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
}

// CLI guard — only run when invoked directly
const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const files = targetFiles(process.argv.slice(2));
  let totalBroken = 0;

  for (const f of files) {
    let content;
    try { content = readFileSync(f, 'utf8'); } catch { continue; }

    const broken = findBrokenLinks(f, content);
    for (const { line, target } of broken) {
      totalBroken++;
      console.error(`${f}:${line} -> ${target}`);
    }
  }

  if (totalBroken) {
    console.error(`\ndocs-check: ${totalBroken} broken link(s) found.`);
    process.exit(1);
  }
  console.log(`docs-check: all links OK (${files.length} file(s) checked).`);
}
