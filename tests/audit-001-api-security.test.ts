import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { createApp, DEFAULT_HOST } from '../server.ts';

// 1x1 transparent PNG base64
const VALID_PNG_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('AUDIT-001: Protect Inspection API Security Controls', () => {
  it('defaults server binding to loopback 127.0.0.1', () => {
    assert.strictEqual(DEFAULT_HOST, '127.0.0.1');
  });

  describe('Non-loopback LAN protection (HOST=0.0.0.0)', () => {
    let server: http.Server;
    let baseUrl: string;
    const TEST_API_KEY = 'test-secret-key-12345';

    before(async () => {
      const app = createApp({
        host: '0.0.0.0',
        apiKey: TEST_API_KEY,
        skipVite: true,
      });
      server = http.createServer(app);
      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve());
      });
      const port = (server.address() as any).port;
      baseUrl = `http://127.0.0.1:${port}`;
    });

    after(async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('rejects unauthenticated POST /api/inspect with 401', async () => {
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear',
        }),
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.match(data.error, /API key required/i);
    });

    it('rejects POST /api/inspect with invalid API key with 401', async () => {
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'wrong-key',
        },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear',
        }),
      });
      assert.strictEqual(res.status, 401);
    });

    it('allows POST /api/inspect with valid x-api-key', async () => {
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear',
          forceOffline: true,
          isDemoSimulation: true,
        }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.status, 'PASS');
    });

    it('rejects unauthenticated POST /api/teach-defect with 401', async () => {
      const res = await fetch(`${baseUrl}/api/teach-defect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defectName: 'New Defect' }),
      });
      assert.strictEqual(res.status, 401);
    });

    it('allows POST /api/teach-defect with valid Bearer token', async () => {
      const res = await fetch(`${baseUrl}/api/teach-defect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_API_KEY}`,
        },
        body: JSON.stringify({ defectName: 'Authorized Flaw' }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });
  });

  describe('Loopback Protection & CSRF / Fetch Metadata (HOST=127.0.0.1)', () => {
    let server: http.Server;
    let baseUrl: string;

    before(async () => {
      const app = createApp({
        host: '127.0.0.1',
        skipVite: true,
      });
      server = http.createServer(app);
      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve());
      });
      const port = (server.address() as any).port;
      baseUrl = `http://127.0.0.1:${port}`;
    });

    after(async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('rejects cross-site request with Sec-Fetch-Site: cross-site with 403', async () => {
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Sec-Fetch-Site': 'cross-site',
        },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear',
        }),
      });
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.match(data.error, /Cross-site/i);
    });

    it('rejects request with mismatched Origin header with 403', async () => {
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://malicious-attacker.com',
        },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear',
        }),
      });
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.match(data.error, /origin/i);
    });

    it('rejects request without session token on loopback with 401', async () => {
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear',
        }),
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.match(data.error, /session token/i);
    });

    it('allows request with valid session token obtained from /api/auth/session', async () => {
      const sessionRes = await fetch(`${baseUrl}/api/auth/session`);
      assert.strictEqual(sessionRes.status, 200);
      const { sessionToken } = await sessionRes.json();
      assert.ok(sessionToken && typeof sessionToken === 'string');

      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sessionToken,
        },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear',
          forceOffline: true,
          isDemoSimulation: true,
        }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.status, 'PASS');
    });
  });

  describe('Input Structure, MIME Type, and Payload Size Validation', () => {
    let server: http.Server;
    let baseUrl: string;
    let sessionToken: string;

    before(async () => {
      const app = createApp({
        host: '127.0.0.1',
        skipVite: true,
      });
      server = http.createServer(app);
      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve());
      });
      const port = (server.address() as any).port;
      baseUrl = `http://127.0.0.1:${port}`;

      const sessionRes = await fetch(`${baseUrl}/api/auth/session`);
      const data = await sessionRes.json();
      sessionToken = data.sessionToken;
    });

    after(async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('returns 400 when imageBase64 is missing', async () => {
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sessionToken,
        },
        body: JSON.stringify({ partProfile: 'Precision Gear' }),
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /imageBase64 is required/i);
    });

    it('returns 400 when partProfile is missing', async () => {
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sessionToken,
        },
        body: JSON.stringify({ imageBase64: VALID_PNG_BASE64 }),
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /partProfile is required/i);
    });

    it('returns 415 when an unsupported MIME type (e.g. image/gif) is submitted', async () => {
      const gifBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sessionToken,
        },
        body: JSON.stringify({
          imageBase64: gifBase64,
          partProfile: 'Precision Gear',
        }),
      });
      assert.strictEqual(res.status, 415);
      const data = await res.json();
      assert.match(data.error, /unsupported image type/i);
    });

    it('returns 400 when invalid base64 image data is provided', async () => {
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sessionToken,
        },
        body: JSON.stringify({
          imageBase64: 'data:image/png;base64,!!!not-valid-base64-content!!!',
          partProfile: 'Precision Gear',
        }),
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /invalid base64/i);
    });

    it('returns 413 when image payload exceeds size limit', async () => {
      // 9MB base64 string
      const largeData = Buffer.alloc(9 * 1024 * 1024).toString('base64');
      const largeBase64 = `data:image/png;base64,${largeData}`;
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sessionToken,
        },
        body: JSON.stringify({
          imageBase64: largeBase64,
          partProfile: 'Precision Gear',
        }),
      });
      // Express 10mb body parser or our 8MB image check returns 413
      assert.ok(res.status === 413 || res.status === 400);
    });

    it('returns 400 on /api/teach-defect when defectName is missing or empty', async () => {
      const res = await fetch(`${baseUrl}/api/teach-defect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sessionToken,
        },
        body: JSON.stringify({ defectName: '   ' }),
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /Defect name is required/i);
    });
  });

  describe('Explicit Cloud Processing Opt-In (Gemini Guard)', () => {
    let server: http.Server;
    let baseUrl: string;
    let sessionToken: string;
    let geminiCallCount = 0;

    const mockAiClient = {
      models: {
        generateContent: async () => {
          geminiCallCount++;
          return {
            text: JSON.stringify({
              status: 'PASS',
              confidence: 0.99,
              anomalyScore: 0.01,
              observations: ['Mocked Gemini observation'],
            }),
          };
        },
      },
    };

    before(async () => {
      const app = createApp({
        host: '127.0.0.1',
        apiKey: undefined,
        aiClient: mockAiClient,
        geminiApiKey: 'mock-key',
        skipVite: true,
      });
      server = http.createServer(app);
      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve());
      });
      const port = (server.address() as any).port;
      baseUrl = `http://127.0.0.1:${port}`;

      const sessionRes = await fetch(`${baseUrl}/api/auth/session`);
      const data = await sessionRes.json();
      sessionToken = data.sessionToken;
    });

    after(async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('does NOT call Gemini when allowCloudProcessing is omitted, even with key present', async () => {
      geminiCallCount = 0;
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sessionToken,
        },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear',
          forceOffline: false,
          isDemoSimulation: true,
          // allowCloudProcessing not provided
        }),
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(geminiCallCount, 0, 'Gemini must NOT be called without explicit opt-in');
    });

    it('does NOT call Gemini when allowCloudProcessing is false', async () => {
      geminiCallCount = 0;
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sessionToken,
        },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear',
          allowCloudProcessing: false,
          forceOffline: false,
          isDemoSimulation: true,
        }),
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(geminiCallCount, 0, 'Gemini must NOT be called when opt-in is false');
    });

    it('does NOT call Gemini when forceOffline is true, even if allowCloudProcessing is true', async () => {
      geminiCallCount = 0;
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sessionToken,
        },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear',
          allowCloudProcessing: true,
          forceOffline: true,
          isDemoSimulation: true,
        }),
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(geminiCallCount, 0, 'forceOffline must override cloud opt-in');
    });

    it('calls Gemini ONLY when allowCloudProcessing is true, forceOffline is false, and key is present', async () => {
      geminiCallCount = 0;
      const res = await fetch(`${baseUrl}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sessionToken,
        },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear',
          allowCloudProcessing: true,
          forceOffline: false,
        }),
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(geminiCallCount, 1, 'Gemini should be called when explicitly opted in and online');
      const data = await res.json();
      assert.strictEqual(data.status, 'PASS');
      assert.strictEqual(data.observations[0], 'Mocked Gemini observation');
    });
  });

  describe('Unrelated existing endpoints remain intact', () => {
    let server: http.Server;
    let baseUrl: string;

    before(async () => {
      const app = createApp({
        host: '127.0.0.1',
        skipVite: true,
      });
      server = http.createServer(app);
      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve());
      });
      const port = (server.address() as any).port;
      baseUrl = `http://127.0.0.1:${port}`;
    });

    after(async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('GET /api/status returns system status', async () => {
      const res = await fetch(`${baseUrl}/api/status`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.status, 'ONLINE');
      assert.ok('engine' in data);
    });

    it('GET /api/learned-defects returns registered defects', async () => {
      const res = await fetch(`${baseUrl}/api/learned-defects`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      assert.ok(data.length >= 3);
    });
  });
});
