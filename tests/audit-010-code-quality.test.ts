import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

describe('AUDIT-010: Code Quality, Dead Code, and Unused Import Remediation', () => {
  const rootDir = process.cwd();

  test('1. tsconfig.json enforces noUnusedLocals and noUnusedParameters', () => {
    const tsconfigPath = path.resolve(rootDir, 'tsconfig.json');
    assert.ok(fs.existsSync(tsconfigPath), 'tsconfig.json must exist');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    assert.equal(tsconfig.compilerOptions?.noUnusedLocals, true, 'noUnusedLocals must be enabled');
    assert.equal(tsconfig.compilerOptions?.noUnusedParameters, true, 'noUnusedParameters must be enabled');
  });

  test('2. tsc --noEmit static analysis runs cleanly with zero unused symbol errors', () => {
    assert.doesNotThrow(() => {
      execSync('npx tsc --noEmit', {
        cwd: rootDir,
        encoding: 'utf8',
        stdio: 'pipe',
      });
    }, 'tsc --noEmit must pass with zero errors');
  });

  test('3. Key components do not import unused lucide icons or symbols', () => {
    const appTsx = fs.readFileSync(path.resolve(rootDir, 'src/App.tsx'), 'utf8');
    assert.ok(!appTsx.includes('ShieldCheck,'), 'App.tsx should not import unused ShieldCheck');
    assert.ok(!appTsx.includes('Sparkles,'), 'App.tsx should not import unused Sparkles');

    const studioTsx = fs.readFileSync(path.resolve(rootDir, 'src/components/InspectionStudio.tsx'), 'utf8');
    assert.ok(!studioTsx.includes('RotateCcw,'), 'InspectionStudio should not import unused RotateCcw');
    assert.ok(!studioTsx.includes('DEFAULT_PROFILES'), 'InspectionStudio should not import unused DEFAULT_PROFILES');

    const overlayTsx = fs.readFileSync(path.resolve(rootDir, 'src/components/ControlConsoleOverlay.tsx'), 'utf8');
    assert.ok(!overlayTsx.includes('getAccentColor'), 'ControlConsoleOverlay should not have dead getAccentColor');
    assert.ok(!overlayTsx.includes('useUITheme'), 'ControlConsoleOverlay should not have dead useUITheme');

    const historyTsx = fs.readFileSync(path.resolve(rootDir, 'src/components/HistoryPage.tsx'), 'utf8');
    assert.ok(!historyTsx.includes('setHistoryList'), 'HistoryPage should not have dead setHistoryList');
  });

  test('4. npm run lint script is verified and configured', () => {
    const pkgPath = path.resolve(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert.ok(pkg.scripts?.lint, 'lint script must exist');
    assert.ok(pkg.scripts.lint.includes('tsc --noEmit'), 'lint script must invoke tsc --noEmit');
  });
});
