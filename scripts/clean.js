import fs from 'node:fs';
import path from 'node:path';

// Target generated build directories/files (allows fixture override for isolated testing)
const TARGETS = process.env.CLEAN_TARGETS 
  ? process.env.CLEAN_TARGETS.split(',').map((s) => s.trim()).filter(Boolean)
  : ['dist', 'server.js'];

const ROOT_DIR = process.cwd();

console.log('[CLEAN] Starting cross-platform cleanup...');

let hadError = false;

for (const target of TARGETS) {
  const targetPath = path.resolve(ROOT_DIR, target);

  // Security guard: never allow deleting outside cwd or root critical paths
  if (!targetPath.startsWith(ROOT_DIR) || targetPath === ROOT_DIR) {
    console.error(`[CLEAN ERROR] Unsafe target path rejected: ${targetPath}`);
    hadError = true;
    continue;
  }

  // Security guard: never allow deleting source files, configuration, or docs
  const protectedNames = ['src', 'node_modules', 'tests', 'package.json', 'bun.lock', '.env', 'PROJECT_AUDIT.md'];
  if (protectedNames.includes(target)) {
    console.error(`[CLEAN ERROR] Protected path cannot be removed: ${target}`);
    hadError = true;
    continue;
  }

  try {
    if (fs.existsSync(targetPath)) {
      const stat = fs.statSync(targetPath);
      if (stat.isDirectory()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
        console.log(`[CLEAN] Removed directory: ${target}`);
      } else {
        fs.unlinkSync(targetPath);
        console.log(`[CLEAN] Removed file: ${target}`);
      }
    } else {
      console.log(`[CLEAN] Target not present (already clean): ${target}`);
    }
  } catch (err) {
    console.error(`[CLEAN ERROR] Failed to clean ${target}: ${err.message}`);
    hadError = true;
  }
}

if (hadError) {
  console.error('[CLEAN] Completed with errors.');
  process.exit(1);
} else {
  console.log('[CLEAN] Clean operation completed successfully.');
}
