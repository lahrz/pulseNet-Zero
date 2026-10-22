import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { createApp } from '../server.ts';


const VALID_PNG_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

describe('AUDIT-005: Remove Fake Teach-Defect Reinspection & Enforce Genuine Evaluation', () => {
  let server: http.Server;
  let baseUrl: string;
  let sessionToken: string;
  let mockAiClient: any;

  before(async () => {
    mockAiClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            status: 'DEFECT',
            defectType: 'OPERATOR_FLAW_01',
            confidence: 0.915,
            anomalyScore: 0.82,
            location: { x: 25, y: 35, width: 15, height: 15 },
            observations: ['Genuine AI detection matching taught defect pattern'],
          }),
        }),
      },
    };

    const app = createApp({
      host: '127.0.0.1',
      skipVite: true,
      aiClient: mockAiClient,
      geminiApiKey: 'mock-gemini-key',
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

  it('1. Registering a new defect via /api/teach-defect records label in catalog without claiming neural weights training', async () => {
    const teachRes = await fetch(`${baseUrl}/api/teach-defect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pnz-session-token': sessionToken,
      },
      body: JSON.stringify({
        defectName: 'OPERATOR_FLAW_01',
        category: 'Dynamic Operator Classification',
      }),
    });

    assert.strictEqual(teachRes.status, 200);
    const data = await teachRes.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.defect.name, 'OPERATOR_FLAW_01');

    // Verify defect is listed in learned defects
    const listRes = await fetch(`${baseUrl}/api/learned-defects`);
    const list = await listRes.json();
    const found = list.find((d: any) => d.name === 'OPERATOR_FLAW_01');
    assert.ok(found, 'OPERATOR_FLAW_01 should be present in defect catalog');
  });

  it('2. Re-inspection offline fails safely with 503 and NEVER returns hardcoded 94% confidence', async () => {
    const res = await fetch(`${baseUrl}/api/inspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pnz-session-token': sessionToken,
      },
      body: JSON.stringify({
        imageBase64: VALID_PNG_BASE64,
        partProfile: 'Precision Gear (PNZ-GEAR-M12)',
        forceOffline: true,
        isDemoSimulation: false,
      }),
    });

    assert.strictEqual(res.status, 503, 'Must return 503 Service Unavailable when attempting offline re-inspection without local model');
    const data = await res.json();
    assert.strictEqual(data.code, 'LOCAL_MODEL_UNAVAILABLE');
    assert.ok(!data.confidence, 'Must NOT contain confidence score');
    assert.ok(data.confidence !== 0.94, 'Must NOT fabricate 94% confidence');
  });

  it('3. Re-inspection without explicit cloud consent returns 400 CLOUD_CONSENT_REQUIRED', async () => {
    const res = await fetch(`${baseUrl}/api/inspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pnz-session-token': sessionToken,
      },
      body: JSON.stringify({
        imageBase64: VALID_PNG_BASE64,
        partProfile: 'Precision Gear (PNZ-GEAR-M12)',
        allowCloudProcessing: false,
        isDemoSimulation: false,
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.code, 'CLOUD_CONSENT_REQUIRED');
  });

  it('4. Re-inspection without configured cloud API key returns 503 CLOUD_AI_UNAVAILABLE', async () => {
    // Create server with no Gemini API key configured
    const noKeyApp = createApp({
      host: '127.0.0.1',
      skipVite: true,
      geminiApiKey: '',
    });
    const noKeyServer = http.createServer(noKeyApp);
    await new Promise<void>((resolve) => noKeyServer.listen(0, '127.0.0.1', () => resolve()));
    const port = (noKeyServer.address() as any).port;

    try {
      const sess = await (await fetch(`http://127.0.0.1:${port}/api/auth/session`)).json();
      const res = await fetch(`http://127.0.0.1:${port}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sess.sessionToken,
        },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear (PNZ-GEAR-M12)',
          allowCloudProcessing: true,
          isDemoSimulation: false,
        }),
      });

      assert.strictEqual(res.status, 503);
      const data = await res.json();
      assert.strictEqual(data.code, 'CLOUD_AI_UNAVAILABLE');
    } finally {
      await new Promise<void>((resolve) => noKeyServer.close(() => resolve()));
    }
  });

  it('5. Genuine re-inspection returns dynamic AI results (not hardcoded 94% or fixed bounding box)', async () => {
    const res = await fetch(`${baseUrl}/api/inspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pnz-session-token': sessionToken,
      },
      body: JSON.stringify({
        imageBase64: VALID_PNG_BASE64,
        partProfile: 'Precision Gear (PNZ-GEAR-M12)',
        allowCloudProcessing: true,
        isDemoSimulation: false,
        knownDefects: ['OPERATOR_FLAW_01'],
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.status, 'DEFECT');
    assert.strictEqual(data.defectType, 'OPERATOR_FLAW_01');
    assert.strictEqual(data.confidence, 0.915, 'Returns actual dynamic model confidence (0.915), not 0.94');
    assert.deepStrictEqual(data.location, { x: 25, y: 35, width: 15, height: 15 }, 'Returns dynamic bounding box, not hardcoded 38/48/30/24');
    assert.strictEqual(data.isSimulated, false);
    assert.strictEqual(data.processingEngine, 'PulseNet Cloud Hybrid (Gemini 3.8 Flash Vision)');
  });

  it('6. Failed upstream re-inspection call returns HTTP 502 and never fabricates success', async () => {
    const failingAiClient = {
      models: {
        generateContent: async () => {
          throw new Error('Gemini re-inspection internal deadline exceeded');
        },
      },
    };

    const failApp = createApp({
      host: '127.0.0.1',
      skipVite: true,
      aiClient: failingAiClient,
      geminiApiKey: 'mock-gemini-key',
    });
    const failServer = http.createServer(failApp);
    await new Promise<void>((resolve) => failServer.listen(0, '127.0.0.1', () => resolve()));
    const port = (failServer.address() as any).port;

    try {
      const sess = await (await fetch(`http://127.0.0.1:${port}/api/auth/session`)).json();
      const res = await fetch(`http://127.0.0.1:${port}/api/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pnz-session-token': sess.sessionToken,
        },
        body: JSON.stringify({
          imageBase64: VALID_PNG_BASE64,
          partProfile: 'Precision Gear (PNZ-GEAR-M12)',
          allowCloudProcessing: true,
          isDemoSimulation: false,
        }),
      });

      assert.strictEqual(res.status, 502, 'Must return 502 on upstream failure');
      const data = await res.json();
      assert.strictEqual(data.code, 'UPSTREAM_CALL_FAILED');
    } finally {
      await new Promise<void>((resolve) => failServer.close(() => resolve()));
    }
  });
});
