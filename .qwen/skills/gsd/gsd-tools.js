#!/usr/bin/env node
// GSD Tools wrapper for easy access
const { execSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../../..');
const gsdTools = path.join(projectRoot, '.claude/get-shit-done/bin/gsd-tools.cjs');

const args = process.argv.slice(2);
try {
  const result = execSync(`node "${gsdTools}" ${args.join(' ')}`, {
    cwd: projectRoot,
    stdio: 'inherit',
    encoding: 'utf8'
  });
} catch (err) {
  process.exit(err.status || 1);
}
