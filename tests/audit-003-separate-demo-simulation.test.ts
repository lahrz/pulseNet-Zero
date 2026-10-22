import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { createApp } from '../server.ts';
import { InspectionService } from '../src/services/inspectionService.ts';

const VALID_PNG_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('AUDIT-003: Separate Demo Simulation from Real Inspection', () => {
  let server: http.Server;
  let baseUrl: string;
  let sessionToken: string;
  let geminiCallCount = 0;
  let geminiShouldFail = false;

  const mockAiClient = {
    models: {
      generateContent: async () => {
        geminiCallCount++;
        if (geminiShouldFail) {
          throw new Error('Upstream AI service error');
        }
        return {
          text: JSON.stringify({
            status: 'PASS',
            confidence: 0.98,
            anomalyScore: 0.02,
            observations: ['Genuine AI observation from multimodal scan'],
          }),
        };
      },
    },
  };

  before(async () => {
    const app = createApp({
      host: '127.0.0.1',
      aiClient: mockAiClient,
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

  it('1. Selecting a demo preset and running demo simulation returns labeled simulation result', async () => {
    const res = await fetch(`${baseUrl}/api/inspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pnz-session-token': sessionToken,
      },
      body: JSON.stringify({
        imageBase64: VALID_PNG_BASE64,
        partProfile: 'Precision Gear',
        isDemoSimulation: true,
        simulatedPreset: 'scratch',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'DEFECT');
    assert.strictEqual(data.defectType, 'Surface Scratch');
    assert.strictEqual(data.isSimulated, true, 'Result must be explicitly flagged as simulated');
    assert.match(data.processingEngine, /Simulator|Simulation|Demo/i, 'Engine must be labeled as simulator');
    assert.match(data.observations[0], /\[SIMULATED DEMO\]/i, 'Observations must be labeled as simulated demo');
  });

  it('2. Uploading an image after selecting a defect preset does NOT inherit defect verdict', async () => {
    // User selected 'crack' preset earlier, but now runs real inspection on uploaded image
    geminiShouldFail = false;
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
        isDemoSimulation: false,
        // simulatedPreset omitted because specimen is an upload
        allowCloudProcessing: true,
        forceOffline: false,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'PASS', 'Must reflect genuine inspection result, NOT canned crack defect');
    assert.notStrictEqual(data.defectType, 'Micro-Crack', 'Must not inherit crack preset');
    assert.strictEqual(data.isSimulated, false, 'Genuine inspection must not be flagged as simulated');
    assert.strictEqual(geminiCallCount, 1, 'Gemini must be called for real inspection');
  });

  it('3. Capturing a camera image after selecting a demo preset does NOT inherit preset verdict', async () => {
    // User selected 'dent' preset earlier, but captured a camera frame
    geminiShouldFail = false;
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
        isDemoSimulation: false,
        allowCloudProcessing: true,
        forceOffline: false,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.notStrictEqual(data.defectType, 'Radial Dent', 'Must not inherit dent preset');
    assert.strictEqual(data.isSimulated, false);
    assert.strictEqual(geminiCallCount, 1);
  });

  it('4. Attempting offline inspection of custom image without local model fails safely with 503', async () => {
    const res = await fetch(`${baseUrl}/api/inspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pnz-session-token': sessionToken,
      },
      body: JSON.stringify({
        imageBase64: VALID_PNG_BASE64,
        partProfile: 'Precision Gear',
        isDemoSimulation: false,
        forceOffline: true,
      }),
    });

    assert.strictEqual(res.status, 503, 'Must return 503 when offline inspection requested without local model');
    const data = await res.json();
    assert.strictEqual(data.code, 'LOCAL_MODEL_UNAVAILABLE');
    assert.match(data.error, /offline inspection is unavailable/i);
    assert.notStrictEqual(data.status, 'PASS', 'Must not fabricate PASS');
    assert.notStrictEqual(data.status, 'DEFECT', 'Must not fabricate DEFECT');
  });

  it('5. Attempting real inspection without cloud consent returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/inspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pnz-session-token': sessionToken,
      },
      body: JSON.stringify({
        imageBase64: VALID_PNG_BASE64,
        partProfile: 'Precision Gear',
        isDemoSimulation: false,
        allowCloudProcessing: false,
        forceOffline: false,
      }),
    });

    assert.strictEqual(res.status, 400, 'Must return 400 when real inspection attempted without consent');
    const data = await res.json();
    assert.strictEqual(data.code, 'CLOUD_CONSENT_REQUIRED');
    assert.match(data.error, /consent/i);
  });

  it('6. Failed cloud request NEVER silently falls back to a simulated result', async () => {
    geminiShouldFail = true;

    const res = await fetch(`${baseUrl}/api/inspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pnz-session-token': sessionToken,
      },
      body: JSON.stringify({
        imageBase64: VALID_PNG_BASE64,
        partProfile: 'Precision Gear',
        isDemoSimulation: false,
        allowCloudProcessing: true,
        forceOffline: false,
      }),
    });

    assert.strictEqual(res.status, 502, 'Must return 502 on Gemini failure');
    const data = await res.json();
    assert.notStrictEqual(data.status, 'PASS', 'Must not return false PASS');
    assert.notStrictEqual(data.isSimulated, true, 'Must not fall back to simulation');
  });

  it('7. Correctly distinguishes simulated results from genuine inspection in history', async () => {
    const service = new InspectionService();

    // 1. Simulate demo preset
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (input: any, init?: any) => {
        const url = String(input);
        if (url.includes('/api/auth/session')) {
          return new Response(JSON.stringify({ sessionToken: 'mock-token' }), { status: 200 });
        }
        if (url.includes('/api/inspect')) {
          const body = JSON.parse(init.body);
          if (body.isDemoSimulation) {
            return new Response(JSON.stringify({
              status: 'DEFECT',
              defectType: 'Surface Scratch',
              confidence: 0.941,
              anomalyScore: 0.78,
              location: { x: 38, y: 44, width: 24, height: 18 },
              observations: ['[SIMULATED DEMO] Linear scoring along tooth flank 3-4'],
              processingTimeMs: 12,
              processingEngine: 'PulseNet Demo Preset Simulator (Canned Data)',
              isSimulated: true,
              metrics: { surfaceRoughnessRa: '1.45 μm', edgeRunout: '0.042 mm', contourMatch: '86.1%' },
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          } else {
            return new Response(JSON.stringify({
              status: 'PASS',
              defectType: null,
              confidence: 0.985,
              anomalyScore: 0.02,
              location: null,
              observations: ['Genuine cloud vision verification'],
              processingTimeMs: 420,
              processingEngine: 'PulseNet Cloud Hybrid (Gemini 3.8 Flash Vision)',
              isSimulated: false,
              metrics: { surfaceRoughnessRa: '0.80 μm', edgeRunout: '0.007 mm', contourMatch: '99.0%' },
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
        }
        return originalFetch(input, init);
      };

      const demoRec = await service.inspectPart({
        imageBase64: VALID_PNG_BASE64,
        partProfile: 'Precision Gear',
        isDemoSimulation: true,
        simulatedPreset: 'scratch',
      });

      const realRec = await service.inspectPart({
        imageBase64: VALID_PNG_BASE64,
        partProfile: 'Precision Gear',
        isDemoSimulation: false,
        allowCloudProcessing: true,
      });

      assert.strictEqual(demoRec.isSimulated, true);
      assert.strictEqual(realRec.isSimulated, false);

      const history = service.getHistory();
      const latestReal = history.find((h) => h.id === realRec.id);
      const latestDemo = history.find((h) => h.id === demoRec.id);

      assert.strictEqual(latestReal?.isSimulated, false, 'Real record in history must have isSimulated=false');
      assert.strictEqual(latestDemo?.isSimulated, true, 'Demo record in history must have isSimulated=true');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
