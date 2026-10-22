import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { createApp } from '../server.ts';
import { InspectionService } from '../src/services/inspectionService.ts';

const VALID_PNG_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('AUDIT-002: Fail-Safe Inspection — Never convert failures into PASS', () => {

  describe('1. Upstream AI failure handling in server', () => {
    let server: http.Server;
    let baseUrl: string;
    let sessionToken: string;
    let currentMockBehavior: 'throw' | 'timeout' | 'malformed-json' | 'missing-status' | 'invalid-status' | 'invalid-confidence' | 'invalid-observations' | 'invalid-location' | 'success' = 'success';

    const dynamicMockAiClient = {
      models: {
        generateContent: async () => {
          if (currentMockBehavior === 'throw') {
            throw new Error('Gemini upstream network connection reset');
          }
          if (currentMockBehavior === 'timeout') {
            const err = new Error('Upstream deadline exceeded');
            (err as any).name = 'AbortError';
            throw err;
          }
          if (currentMockBehavior === 'malformed-json') {
            return { text: '<html><body>502 Bad Gateway</body></html>' };
          }
          if (currentMockBehavior === 'missing-status') {
            return {
              text: JSON.stringify({
                confidence: 0.95,
                anomalyScore: 0.05,
                observations: ['Valid observation'],
              }),
            };
          }
          if (currentMockBehavior === 'invalid-status') {
            return {
              text: JSON.stringify({
                status: 'MAYBE_PASS',
                confidence: 0.95,
                anomalyScore: 0.05,
                observations: ['Valid observation'],
              }),
            };
          }
          if (currentMockBehavior === 'invalid-confidence') {
            return {
              text: JSON.stringify({
                status: 'PASS',
                confidence: 'not-a-number',
                anomalyScore: 0.05,
                observations: ['Valid observation'],
              }),
            };
          }
          if (currentMockBehavior === 'invalid-observations') {
            return {
              text: JSON.stringify({
                status: 'PASS',
                confidence: 0.95,
                anomalyScore: 0.05,
                observations: [],
              }),
            };
          }
          if (currentMockBehavior === 'invalid-location') {
            return {
              text: JSON.stringify({
                status: 'DEFECT',
                confidence: 0.95,
                anomalyScore: 0.85,
                location: { x: -5, y: 150, width: 20, height: 20 },
                observations: ['Valid observation'],
              }),
            };
          }
          // Default: valid success
          return {
            text: JSON.stringify({
              status: 'DEFECT',
              defectType: 'Micro-Fracture',
              confidence: 0.97,
              anomalyScore: 0.89,
              location: { x: 30, y: 40, width: 25, height: 20 },
              observations: ['Linear fracture line on flange perimeter'],
            }),
          };
        },
      },
    };

    before(async () => {
      const app = createApp({
        host: '127.0.0.1',
        aiClient: dynamicMockAiClient,
        geminiApiKey: 'mock-valid-key',
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

    it('returns HTTP 502 when Gemini throws an exception (never returns 200 PASS)', async () => {
      currentMockBehavior = 'throw';
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

      assert.strictEqual(res.status, 502, 'Must return 502 on upstream call failure');
      const data = await res.json();
      assert.notStrictEqual(data.status, 'PASS', 'Must NOT return false PASS');
      assert.ok(data.error && typeof data.error === 'string');
    });

    it('returns HTTP 502 on upstream timeout (never returns 200 PASS)', async () => {
      currentMockBehavior = 'timeout';
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

      assert.strictEqual(res.status, 502);
      const data = await res.json();
      assert.notStrictEqual(data.status, 'PASS');
    });

    it('returns HTTP 502 when Gemini returns malformed non-JSON text', async () => {
      currentMockBehavior = 'malformed-json';
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

      assert.strictEqual(res.status, 502);
      const data = await res.json();
      assert.notStrictEqual(data.status, 'PASS');
      assert.match(data.error, /malformed JSON/i);
    });

    it('returns HTTP 502 when response is missing status', async () => {
      currentMockBehavior = 'missing-status';
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

      assert.strictEqual(res.status, 502);
      const data = await res.json();
      assert.notStrictEqual(data.status, 'PASS');
      assert.match(data.error, /invalid status/i);
    });

    it('returns HTTP 502 when response has invalid status value', async () => {
      currentMockBehavior = 'invalid-status';
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

      assert.strictEqual(res.status, 502);
      const data = await res.json();
      assert.notStrictEqual(data.status, 'PASS');
    });

    it('returns HTTP 502 when confidence score is not a valid number', async () => {
      currentMockBehavior = 'invalid-confidence';
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

      assert.strictEqual(res.status, 502);
      const data = await res.json();
      assert.notStrictEqual(data.status, 'PASS');
      assert.match(data.error, /invalid confidence/i);
    });

    it('returns HTTP 502 when observations list is empty or invalid', async () => {
      currentMockBehavior = 'invalid-observations';
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

      assert.strictEqual(res.status, 502);
      const data = await res.json();
      assert.notStrictEqual(data.status, 'PASS');
      assert.match(data.error, /observations/i);
    });

    it('returns HTTP 502 when location coordinates are out of bounds', async () => {
      currentMockBehavior = 'invalid-location';
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

      assert.strictEqual(res.status, 502);
      const data = await res.json();
      assert.notStrictEqual(data.status, 'PASS');
      assert.match(data.error, /location/i);
    });

    it('returns HTTP 200 with genuine parsed result when valid response received', async () => {
      currentMockBehavior = 'success';
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
      const data = await res.json();
      assert.strictEqual(data.status, 'DEFECT');
      assert.strictEqual(data.defectType, 'Micro-Fracture');
      assert.strictEqual(data.confidence, 0.97);
      assert.deepStrictEqual(data.location, { x: 30, y: 40, width: 25, height: 20 });
      assert.strictEqual(data.observations[0], 'Linear fracture line on flange perimeter');
    });
  });

  describe('2. Missing cloud API configuration', () => {
    let server: http.Server;
    let baseUrl: string;
    let sessionToken: string;

    before(async () => {
      // No geminiApiKey, no aiClient
      const app = createApp({
        host: '127.0.0.1',
        geminiApiKey: undefined,
        aiClient: null,
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

    it('returns HTTP 503 when cloud processing is requested but Gemini is not configured', async () => {
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

      assert.strictEqual(res.status, 503, 'Must return 503 when cloud processing is requested without key');
      const data = await res.json();
      assert.notStrictEqual(data.status, 'PASS');
      assert.match(data.error, /not configured/i);
    });
  });

  describe('3. Client InspectionService fail-safe behavior', () => {
    it('throws error and does NOT add a PASS record to history on failed inspection', async () => {
      const service = new InspectionService();
      const initialHistoryLength = service.getHistory().length;

      // Mock global fetch to simulate a 502 error from /api/inspect
      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async (input: any, init?: any) => {
          const url = String(input);
          if (url.includes('/api/auth/session')) {
            return new Response(JSON.stringify({ sessionToken: 'mock-token' }), { status: 200 });
          }
          if (url.includes('/api/inspect')) {
            return new Response(JSON.stringify({ error: 'Upstream call failed', code: 'UPSTREAM_CALL_FAILED' }), {
              status: 502,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          return originalFetch(input, init);
        };

        // Attempt inspection that fails
        await assert.rejects(
          async () => {
            await service.inspectPart({
              imageBase64: VALID_PNG_BASE64,
              partProfile: 'Precision Gear',
              allowCloudProcessing: true,
            });
          },
          /Upstream call failed|Inspection endpoint returned 502/i,
          'Must reject when API returns failure'
        );

        // Verify history length did NOT increase
        const finalHistory = service.getHistory();
        assert.strictEqual(finalHistory.length, initialHistoryLength, 'Failed inspection must NOT be added to history');

        // Verify no false PASS record was inserted
        const topRecord = finalHistory[0];
        assert.notStrictEqual(topRecord.id.startsWith('PNZ-REC-') && topRecord.timestamp.startsWith('2026') && topRecord.status === 'PASS' && topRecord.processingEngine.includes('Browser Wasm'), true, 'Must not prepend false PASS');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
