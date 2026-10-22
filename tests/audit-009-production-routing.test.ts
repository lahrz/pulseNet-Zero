import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createApp } from '../server';

describe('AUDIT-009: Production Server Fallbacks & Missing Dist Guard', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    const distPath = path.resolve(process.cwd(), 'dist');
    const indexHtmlPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      execSync('npm run build', { encoding: 'utf8' });
    }

    // Instantiate test server in production mode using actual dist
    const app = createApp({
      host: '127.0.0.1',
      isProduction: true,
      distPath,
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(() => {
    if (server) {
      server.close();
    }
  });

  test('1. Unknown API route returns JSON 404 (not HTML SPA)', async () => {
    const res = await fetch(`${baseUrl}/api/nonexistent-endpoint`, {
      headers: {
        Origin: baseUrl,
        'Sec-Fetch-Site': 'same-origin',
      },
    });

    assert.equal(res.status, 404);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('application/json'), 'Unknown API path must return JSON, not HTML');

    const data = await res.json();
    assert.equal(data.code, 'NOT_FOUND');
    assert.ok(data.error.includes('/api/nonexistent-endpoint'));
  });

  test('2. Unknown POST to /api/* returns JSON 404', async () => {
    const res = await fetch(`${baseUrl}/api/v2/unregistered-path`, {
      method: 'POST',
      headers: {
        Origin: baseUrl,
        'Sec-Fetch-Site': 'same-origin',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 123 }),
    });

    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.code, 'NOT_FOUND');
  });

  test('3. Registered API routes still respond with HTTP 200', async () => {
    const res = await fetch(`${baseUrl}/api/status`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ONLINE');
  });

  test('4. Production SPA fallback serves index.html for non-API routes', async () => {
    const res = await fetch(`${baseUrl}/inspection-studio`);
    assert.equal(res.status, 200);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('text/html'));
    const html = await res.text();
    assert.ok(html.includes('<html') || html.includes('<!DOCTYPE html>'));
  });

  test('5. Missing dist directory safely returns HTTP 503 JSON with actionable error message', async () => {
    // Create an app instance pointing to a non-existent dist directory
    const missingDistApp = createApp({
      host: '127.0.0.1',
      isProduction: true,
      distPath: path.resolve(process.cwd(), 'nonexistent-dist-dir-xyz'),
    });

    let tempServer: http.Server;
    let tempBaseUrl = '';

    await new Promise<void>((resolve) => {
      tempServer = missingDistApp.listen(0, '127.0.0.1', () => {
        const addr = tempServer.address() as any;
        tempBaseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });

    try {
      const res = await fetch(`${tempBaseUrl}/dashboard`);
      assert.equal(res.status, 503, 'Must return 503 Service Unavailable when dist is missing');
      const data = await res.json();
      assert.equal(data.code, 'BUILD_ASSETS_MISSING');
      assert.ok(data.error.includes('Run "npm run build" before starting in production mode.'));
    } finally {
      tempServer!.close();
    }
  });
});
