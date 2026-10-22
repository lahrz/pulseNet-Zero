import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { createApp } from '../server.ts';
import { InspectionService } from '../src/services/inspectionService.ts';

const VALID_PNG_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

describe('AUDIT-004: Remove Unsupported WebGPU/WASM/Performance Claims', () => {
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

  it('1. GET /api/status does not claim a local WASM/Edge engine or unqualified <15ms latency', async () => {
    const res = await fetch(`${baseUrl}/api/status`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    // Engine must not falsely claim to be a WASM or Edge tensor runtime
    assert.ok(!data.engine.toLowerCase().includes('wasm'), 'Engine should not claim WASM without a WASM CV runtime');
    assert.ok(!data.engine.toLowerCase().includes('webassembly'), 'Engine should not claim WebAssembly');
    assert.strictEqual(data.localInferenceAvailable, false, 'localInferenceAvailable should be false');

    // Latency target must be explicitly qualified as a target/unmeasured
    assert.match(data.edgeLatencyTarget, /target|unmeasured|spec/i, 'Latency must be qualified as an unmeasured target');
  });

  it('2. Initial history in InspectionService does not claim WebAssembly edge kernel', () => {
    const service = new InspectionService();
    const history = service.getHistory();

    assert.ok(history.length >= 3, 'Initial history records exist');
    for (const record of history) {
      assert.ok(
        !record.processingEngine.toLowerCase().includes('webassembly'),
        `Record ${record.id} should not claim WebAssembly engine: ${record.processingEngine}`
      );
      assert.ok(
        !record.processingEngine.toLowerCase().includes('wasm'),
        `Record ${record.id} should not claim WASM engine`
      );
      assert.strictEqual(record.isSimulated, true, `Record ${record.id} must be labeled as simulated`);
    }
  });

  it('3. Demo preset inspection does not return fake WASM/WebGPU engine claims', async () => {
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

    assert.strictEqual(data.isSimulated, true);
    assert.strictEqual(data.processingEngine, 'PulseNet Demo Preset Simulator (Canned Data)');
    assert.ok(!data.processingEngine.toLowerCase().includes('wasm'));
    assert.ok(!data.processingEngine.toLowerCase().includes('webgpu'));
  });

  it('4. Custom image offline inspection honestly reports lack of local model runtime', async () => {
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
        isDemoSimulation: false,
      }),
    });

    assert.strictEqual(res.status, 503);
    const data = await res.json();
    assert.strictEqual(data.code, 'LOCAL_MODEL_UNAVAILABLE');
    assert.match(data.error, /no local computer vision.*runtime/i);
  });
});
