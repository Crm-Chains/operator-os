// tools/docs-check/check-links.test.mjs — node:test suite for findBrokenLinks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findBrokenLinks } from './check-links.mjs';

// Use a path that definitely exists (this test file's own directory) as base.
// We pass the test file itself as the "file" parameter so relative paths
// resolve from tools/docs-check/.
const THIS_FILE = new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

test('good relative link — returns no findings', () => {
  // check-links.mjs exists in the same directory as this test file
  const content = '[the scanner](check-links.mjs)';
  const result = findBrokenLinks(THIS_FILE, content);
  assert.deepEqual(result, []);
});

test('broken relative link — returns one finding', () => {
  const content = '[missing](totally-nonexistent-file-xyz.md)';
  const result = findBrokenLinks(THIS_FILE, content);
  assert.equal(result.length, 1);
  assert.equal(result[0].line, 1);
  assert.equal(result[0].target, 'totally-nonexistent-file-xyz.md');
});

test('external http link — ignored', () => {
  const content = '[OpenAI](https://openai.com)';
  const result = findBrokenLinks(THIS_FILE, content);
  assert.deepEqual(result, []);
});

test('pure anchor link — ignored', () => {
  const content = '[section](#introduction)';
  const result = findBrokenLinks(THIS_FILE, content);
  assert.deepEqual(result, []);
});

test('link with anchor fragment — strips anchor before resolving', () => {
  // check-links.mjs#some-section should resolve to check-links.mjs (exists)
  const content = '[scanner with anchor](check-links.mjs#some-section)';
  const result = findBrokenLinks(THIS_FILE, content);
  assert.deepEqual(result, []);
});

test('mailto link — ignored', () => {
  const content = '[email](mailto:example@example.com)';
  const result = findBrokenLinks(THIS_FILE, content);
  assert.deepEqual(result, []);
});

test('good relative link to directory — returns no findings', () => {
  // The tools/docs-check directory itself resolved from THIS_FILE's parent → '.'
  const content = '[this dir](.)';
  const result = findBrokenLinks(THIS_FILE, content);
  assert.deepEqual(result, []);
});
