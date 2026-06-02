import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanText, isIgnored } from './scan.mjs';

test('detects an OpenAI-style key', () => {
  const f = scanText('x.md', 'token = sk-abcdefABCDEF0123456789xyz');
  assert.equal(f.length, 1);
  assert.match(f[0].name, /OpenAI/);
});

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

test('isIgnored matches exact paths and ** globs, normalizing separators', () => {
  const pats = ['tools/secret-scan/scan.test.mjs', 'docs/superpowers/**'];
  assert.equal(isIgnored('tools/secret-scan/scan.test.mjs', pats), true);
  assert.equal(isIgnored('docs/superpowers/plans/p.md', pats), true);
  assert.equal(isIgnored('docs\\superpowers\\specs\\s.md', pats), true);
  assert.equal(isIgnored('swarms/example/agent.md', pats), false);
});
