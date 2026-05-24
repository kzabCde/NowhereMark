import { execSync } from 'node:child_process';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));
const required = ['next', 'react', 'react-dom', 'typescript', 'tailwindcss', 'vitest'];

console.log('Node.js:', process.version);
console.log('npm:', execSync('npm --version', { encoding: 'utf8' }).trim());
console.log('packageManager:', pkg.packageManager ?? 'not set');
console.log('project version:', pkg.version);

const all = { ...pkg.dependencies, ...pkg.devDependencies };
let missing = false;
for (const dep of required) {
  if (!all[dep]) {
    console.error('Missing dependency:', dep);
    missing = true;
  } else {
    console.log(`${dep}: ${all[dep]}`);
  }
}

try {
  execSync('npm outdated', { stdio: 'pipe' });
} catch {
  console.warn('Warning: Some packages are outdated (informational only).');
}

if (missing) process.exit(1);
