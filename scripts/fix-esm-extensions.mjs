import fs from "node:fs";
import path from "node:path";

const exts = new Set([".js", ".mjs", ".cjs", ".json"]);

const re = /(\bimport\s+(?:[^'"]*?from\s*)|\bexport\s+(?:[^'"]*?from\s*))\s*['"](\.\/[^'"]*?|\.{2}\/[^'"]*?)['"]/g;

function needsExt(spec) {
  const p = spec.split("?")[0];
  const base = path.basename(p);
  if (exts.has(path.extname(p))) return false;
  if (base === "" || base === "." || base === "..") return false;
  return true;
}

function addJs(spec) {
  // поддержка index-импортов: './dir' → './dir/index.js'
  // и файлов: './util' → './util.js'
  const noQ = spec.split("?")[0];
  const q = spec.slice(noQ.length);
  return `${noQ}.js${q}`;
}

function processFile(file) {
  let s = fs.readFileSync(file, "utf8");
  let changed = false;

  // 1) Fix relative specifiers: ./x, ../y
  s = s.replace(re, (_m, head, spec) => {
    if (!needsExt(spec)) return _m;
    const withExt = addJs(spec);
    changed = true;
    return `${head}"${withExt}"`;
  });

  // 2) Rewrite TS path alias @shared/* -> relative ../shared/* with .js
  // Important: do NOT consume the closing ')' for dynamic import(...) so we can re-emit it
  const aliasRe =
    /(\bimport\s+(?:[^'"]*?from\s*)?|\bexport\s+(?:[^'"]*?from\s*)?|\bimport\s*\()\s*['"]@shared\/([^'"]+?)['"]/g;

  s = s.replace(aliasRe, (_m, head, spec) => {
    const noQ = spec.split("?")[0];
    const withJs = exts.has(path.extname(noQ)) ? noQ : `${noQ}.js`;
    // Compute relative path from current file to ROOT/shared/withJs
    const targetAbs = path.join(ROOT, "shared", withJs);
    let rel = path
      .relative(path.dirname(file), targetAbs)
      .replace(/\\/g, "/");
    if (!rel.startsWith(".")) rel = "./" + rel;
    changed = true;
    // Emit replaced spec; preserve original trailing syntax (including ')' for dynamic import)
    return `${head}"${rel}"`;
  });

  if (changed) fs.writeFileSync(file, s, "utf8");
}

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && p.endsWith(".js")) processFile(p);
  }
}

const target = process.argv[2] || "dist";
const ROOT = path.resolve(process.cwd(), target);
walk(ROOT);
console.log(`[fix-esm-extensions] patched: ${target}`);