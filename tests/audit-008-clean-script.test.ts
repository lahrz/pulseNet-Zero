import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

describe('AUDIT-008: Cross-Platform Clean Script', () => {
  const rootDir = process.cwd();
  const cleanScriptPath = path.resolve(rootDir, 'scripts/clean.js');
  const fixtureDir = path.resolve(rootDir, 'test-dist-fixture');
  const fixtureFile = path.resolve(rootDir, 'test-dummy.js');

  after(() => {
    // Ensure test fixtures are cleaned up
    if (fs.existsSync(fixtureDir)) {
      fs.rmSync(fixtureDir, { recursive: true, force: true });
    }
    if (fs.existsSync(fixtureFile)) {
      fs.unlinkSync(fixtureFile);
    }
  });

  test('1. clean.js exists and is a valid cross-platform Node script', () => {
    assert.ok(fs.existsSync(cleanScriptPath), 'scripts/clean.js must exist');
    const content = fs.readFileSync(cleanScriptPath, 'utf8');
    assert.ok(!content.includes('rm -rf'), 'Must not invoke Unix rm -rf');
    assert.ok(content.includes('fs.rmSync') || content.includes('unlinkSync'), 'Must use built-in fs APIs');
  });

  test('2. clean.js safely removes directory and files when present', () => {
    // Create test fixture directory and file
    if (!fs.existsSync(fixtureDir)) {
      fs.mkdirSync(fixtureDir, { recursive: true });
    }
    fs.writeFileSync(path.join(fixtureDir, 'test-artifact.txt'), 'test content', 'utf8');
    fs.writeFileSync(fixtureFile, 'console.log("dummy");', 'utf8');
    assert.ok(fs.existsSync(fixtureDir));
    assert.ok(fs.existsSync(fixtureFile));

    // Execute clean script with test targets
    const output = execSync('node scripts/clean.js', {
      encoding: 'utf8',
      env: { ...process.env, CLEAN_TARGETS: 'test-dist-fixture,test-dummy.js' },
    });

    assert.ok(output.includes('[CLEAN] Clean operation completed successfully.'));
    assert.equal(fs.existsSync(fixtureDir), false, 'Fixture directory must be removed');
    assert.equal(fs.existsSync(fixtureFile), false, 'Fixture file must be removed');
  });

  test('3. clean.js handles missing targets idempotently with exit code 0', () => {
    // Ensure targets are already absent
    assert.equal(fs.existsSync(fixtureDir), false);
    assert.equal(fs.existsSync(fixtureFile), false);

    const output = execSync('node scripts/clean.js', {
      encoding: 'utf8',
      env: { ...process.env, CLEAN_TARGETS: 'test-dist-fixture,test-dummy.js' },
    });

    assert.ok(output.includes('Target not present (already clean)'));
    assert.ok(output.includes('Clean operation completed successfully.'));
  });

  test('4. clean.js protects repository files and rejects deletion of critical paths', () => {
    const protectedPaths = ['src', 'node_modules', 'tests', 'package.json', 'bun.lock', 'PROJECT_AUDIT.md'];

    for (const item of protectedPaths) {
      assert.ok(fs.existsSync(path.resolve(rootDir, item)), `Pre-condition: ${item} should exist`);
      assert.throws(
        () => {
          execSync('node scripts/clean.js', {
            encoding: 'utf8',
            env: { ...process.env, CLEAN_TARGETS: item },
            stdio: 'pipe',
          });
        },
        (err: any) => {
          assert.equal(err.status, 1, `Clean script must exit with code 1 for protected path: ${item}`);
          const stderr = err.stderr ? err.stderr.toString() : '';
          assert.ok(
            stderr.includes('[CLEAN ERROR] Protected path cannot be removed'),
            `Stderr must indicate protected path rejection: ${item}`
          );
          return true;
        }
      );
      assert.ok(fs.existsSync(path.resolve(rootDir, item)), `Protected path ${item} must not be deleted`);
    }
  });
});
