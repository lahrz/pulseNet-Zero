import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { InspectionService } from '../src/services/inspectionService';
import { InspectionRecord } from '../src/types/inspection';

describe('AUDIT-007: Real Batch Analytics from Persisted Inspection History', () => {
  let service: InspectionService;

  beforeEach(() => {
    service = new InspectionService();
    // Clear history to start each test in a known state
    (service as any).history = [];
  });

  test('1. Empty history returns zero counts and safe 0% yield (no divide-by-zero or NaN)', () => {
    const analytics = service.getBatchAnalytics('ALL', false);

    assert.equal(analytics.totalInspected, 0);
    assert.equal(analytics.passCount, 0);
    assert.equal(analytics.defectCount, 0);
    assert.equal(analytics.unknownCount, 0);
    assert.equal(analytics.yieldRate, 0);
    assert.equal(analytics.ppmDefectRate, 0);
    assert.equal(Number.isNaN(analytics.yieldRate), false);
    assert.equal(Number.isNaN(analytics.ppmDefectRate), false);
    assert.equal(analytics.defectBreakdown.length, 0);
    assert.equal(analytics.hourlyTrend.length, 0);
    assert.equal(analytics.hasGenuineRecords, false);
  });

  test('2. Separates genuine inspections from simulated presets by default', () => {
    // Add simulated record
    (service as any).history.push({
      id: 'REC-SIM-1',
      timestamp: '2026-10-23T10:00:00Z',
      partId: 'PART-001',
      partProfile: 'Gear',
      status: 'DEFECT',
      defectType: 'Surface Scratch',
      confidence: 0.95,
      anomalyScore: 0.8,
      location: null,
      processingTimeMs: 12,
      processingEngine: 'PulseNet Demo Preset Simulator (Canned Data)',
      observations: ['Simulated defect'],
      metrics: { surfaceRoughnessRa: '1.2', edgeRunout: '0.02', contourMatch: '90%' },
      isSimulated: true,
      batchId: 'DEMO-BATCH-001',
    } as InspectionRecord);

    // Add genuine record
    (service as any).history.push({
      id: 'REC-REAL-1',
      timestamp: '2026-10-23T10:05:00Z',
      partId: 'PART-002',
      partProfile: 'Gear',
      status: 'PASS',
      defectType: null,
      confidence: 0.98,
      anomalyScore: 0.02,
      location: null,
      processingTimeMs: 450,
      processingEngine: 'PulseNet Cloud Hybrid (Gemini 3.8 Flash Vision)',
      observations: ['Genuine pass'],
      metrics: { surfaceRoughnessRa: '0.8', edgeRunout: '0.005', contourMatch: '99%' },
      isSimulated: false,
      batchId: 'PROD-LOT-101',
    } as InspectionRecord);

    // Default: exclude simulated
    const genuineOnly = service.getBatchAnalytics('ALL', false);
    assert.equal(genuineOnly.totalInspected, 1, 'Operational analytics must strictly exclude simulated presets');
    assert.equal(genuineOnly.passCount, 1);
    assert.equal(genuineOnly.defectCount, 0);
    assert.equal(genuineOnly.yieldRate, 100.0);
    assert.equal(genuineOnly.hasGenuineRecords, true);
    assert.equal(genuineOnly.isSimulatedOnly, false);

    // Opt-in: include simulated
    const withSimulated = service.getBatchAnalytics('ALL', true);
    assert.equal(withSimulated.totalInspected, 2);
    assert.equal(withSimulated.passCount, 1);
    assert.equal(withSimulated.defectCount, 1);
    assert.equal(withSimulated.yieldRate, 50.0);
  });

  test('3. Filters records by batchId correctly', () => {
    (service as any).history.push(
      {
        id: 'REC-1',
        timestamp: '2026-10-23T08:00:00Z',
        partId: 'P-1',
        partProfile: 'Gear',
        status: 'PASS',
        confidence: 0.99,
        anomalyScore: 0.01,
        isSimulated: false,
        batchId: 'LOT-A',
      } as InspectionRecord,
      {
        id: 'REC-2',
        timestamp: '2026-10-23T08:30:00Z',
        partId: 'P-2',
        partProfile: 'Gear',
        status: 'DEFECT',
        defectType: 'Crack',
        confidence: 0.94,
        anomalyScore: 0.85,
        isSimulated: false,
        batchId: 'LOT-A',
      } as InspectionRecord,
      {
        id: 'REC-3',
        timestamp: '2026-10-23T09:00:00Z',
        partId: 'P-3',
        partProfile: 'Gear',
        status: 'PASS',
        confidence: 0.97,
        anomalyScore: 0.03,
        isSimulated: false,
        batchId: 'LOT-B',
      } as InspectionRecord
    );

    // Query LOT-A only
    const lotA = service.getBatchAnalytics('LOT-A', false);
    assert.equal(lotA.totalInspected, 2);
    assert.equal(lotA.passCount, 1);
    assert.equal(lotA.defectCount, 1);
    assert.equal(lotA.yieldRate, 50.0);
    assert.equal(lotA.batchNumber, 'LOT-A');

    // Query LOT-B only
    const lotB = service.getBatchAnalytics('LOT-B', false);
    assert.equal(lotB.totalInspected, 1);
    assert.equal(lotB.passCount, 1);
    assert.equal(lotB.defectCount, 0);
    assert.equal(lotB.yieldRate, 100.0);
    assert.equal(lotB.batchNumber, 'LOT-B');

    // Query ALL
    const all = service.getBatchAnalytics('ALL', false);
    assert.equal(all.totalInspected, 3);
    assert.equal(all.passCount, 2);
    assert.equal(all.defectCount, 1);
    assert.equal(all.yieldRate, 66.7);
    assert.ok(all.availableBatches?.includes('LOT-A'));
    assert.ok(all.availableBatches?.includes('LOT-B'));
  });

  test('4. Correctly calculates Pareto defect breakdown and PPM', () => {
    (service as any).history.push(
      { id: '1', timestamp: '2026-10-23T08:00:00Z', status: 'PASS', isSimulated: false, batchId: 'LOT-1' },
      { id: '2', timestamp: '2026-10-23T08:10:00Z', status: 'DEFECT', defectType: 'Scratch', isSimulated: false, batchId: 'LOT-1' },
      { id: '3', timestamp: '2026-10-23T08:20:00Z', status: 'DEFECT', defectType: 'Scratch', isSimulated: false, batchId: 'LOT-1' },
      { id: '4', timestamp: '2026-10-23T08:30:00Z', status: 'DEFECT', defectType: 'Crack', isSimulated: false, batchId: 'LOT-1' },
      { id: '5', timestamp: '2026-10-23T08:40:00Z', status: 'UNKNOWN', defectType: 'Foreign Particle', isSimulated: false, batchId: 'LOT-1' }
    );

    const stats = service.getBatchAnalytics('LOT-1', false);
    assert.equal(stats.totalInspected, 5);
    assert.equal(stats.passCount, 1);
    assert.equal(stats.defectCount, 3);
    assert.equal(stats.unknownCount, 1);
    assert.equal(stats.yieldRate, 20.0);

    // PPM: (3 defects / 5 parts) * 1,000,000 = 600,000
    assert.equal(stats.ppmDefectRate, 600000);

    // Most common defect should be Scratch (count = 2)
    assert.equal(stats.mostCommonDefect, 'Scratch');

    // Pareto breakdown sorted descending
    assert.equal(stats.defectBreakdown[0].name, 'Scratch');
    assert.equal(stats.defectBreakdown[0].count, 2);
  });

  test('5. Dynamic update: newly inspected part immediately updates analytics', () => {
    const before = service.getBatchAnalytics('LOT-NEW', false);
    assert.equal(before.totalInspected, 0);

    // Simulate appending a newly completed inspection
    (service as any).history.unshift({
      id: 'REC-NEW',
      timestamp: new Date().toISOString(),
      partId: 'PART-NEW',
      partProfile: 'Gear',
      status: 'PASS',
      isSimulated: false,
      batchId: 'LOT-NEW',
    } as InspectionRecord);

    const after = service.getBatchAnalytics('LOT-NEW', false);
    assert.equal(after.totalInspected, 1);
    assert.equal(after.passCount, 1);
    assert.equal(after.yieldRate, 100.0);
  });
});
