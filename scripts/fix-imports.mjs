import { promises as fs } from 'node:fs';
import fssync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUT_DIRS = process.argv.slice(2).length
  ? process.argv.slice(2).map(p => path.resolve(ROOT, p))
  : [path.resolve(ROOT, 'dist/server'), path.resolve(ROOT, 'dist/server/server')];
const JS_EXTS = new Set(['.js', '.mjs', '.cjs', '.json', '.node']);
const REL = ['./', '../'];

const patterns = [
  // import x from '...';  import '...';
  { re: /(import\s+[^'"]*?from\s*['"])([^'"]+)(['"]\s*;?)/g, group: 2 },
  { re: /(import\s*['"])([^'"]+)(['"]\s*;?)/g, group: 2 },
  // export * from '...';
  { re: /(export\s+[^'"]*?from\s*['"])([^'"]+)(['"]\s*;?)/g, group: 2 },
  // require('...')
  { re: /(require\(\s*['"])([^'"]+)(['"]\s*\))/g, group: 2 },
  // import('...')
  { re: /(import\(\s*['"])([^'"]+)(['"]\s*\))/g, group: 2 },
];

function exists(p) {
  try { return fssync.statSync(p).isFile(); } catch { return false; }
}

function needsExt(spec) {
  if (!REL.some(p => spec.startsWith(p))) return false;
  if (JS_EXTS.has(path.extname(spec))) return false;
  return true;
}

function resolveCandidates(spec, basedir) {
  return {
    asFile: path.resolve(basedir, spec + '.js'),
    asIndex: path.resolve(basedir, spec, 'index.js'),
  };
}

async function fixFile(filePath) {
  const basedir = path.dirname(filePath);
  let src = await fs.readFile(filePath, 'utf8');
  let changed = false;
  
  for (const { re, group } of patterns) {
    src = src.replace(re, (full, pre, spec, post) => {
      if (!needsExt(spec)) return full;
      
      // Always add .js extension for relative imports
      const next = spec + '.js';
      changed = true;
      return `${pre}${next}${post}`;
    });
  }
  
  if (changed) {
    await fs.writeFile(filePath, src, 'utf8');
    console.log('fixed:', path.relative(ROOT, filePath));
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.isFile() && (p.endsWith('.js') || p.endsWith('.mjs') || p.endsWith('.cjs'))) {
      await fixFile(p);
    }
  }
}

(async () => {
  for (const d of OUT_DIRS) {
    console.log('Fixing ESM imports in:', d);
    await walk(d);
  }
  console.log('Done.');
})();