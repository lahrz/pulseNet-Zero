import { InspectionRecord, BatchSummary, LearnedDefectItem, PartProfile } from '../types/inspection';

// Default Golden Profiles
export const DEFAULT_PROFILES: PartProfile[] = [
  {
    id: 'profile-gear',
    name: 'Precision Gear',
    sku: 'PNZ-GEAR-M12',
    category: 'Powertrain Gearing',
    tolerance: '±0.008 mm (DIN 3962 Class 6)',
    goldenSamplesCount: 8,
    featuresLearned: ['Involute Flank Profile', 'Root Radius Geometry', 'Keyway Concentricity', 'Specular Uniformity', 'Pitch Circle Runout'],
    specs: {
      outerDiameter: '80.0 mm',
      boreDiameter: '28.0 mm',
      thickness: '18.0 mm',
      material: 'AISI 8620 Case-Hardened Steel',
    },
  },
  {
    id: 'profile-flange',
    name: 'CNC Milled Flange',
    sku: 'PNZ-FLG-44',
    category: 'Pressure Vessels',
    tolerance: '±0.012 mm (ANSI B16.5)',
    goldenSamplesCount: 8,
    featuresLearned: ['Bolt Hole Spacing', 'Raised Face Planarity', 'Machined Toolpath Grooves', 'Inner Bore Chamfer'],
    specs: {
      outerDiameter: '120.0 mm',
      boreDiameter: '45.0 mm',
      thickness: '14.0 mm',
      material: '316L Stainless Steel',
    },
  },
];

// Initial mock batch data (Batch #PNZ-042: 100 parts, 91 pass, 7 defect, 2 unknown)
export const INITIAL_BATCH: BatchSummary = {
  batchNumber: 'ALL BATCHES',
  totalInspected: 0,
  passCount: 0,
  defectCount: 0,
  unknownCount: 0,
  yieldRate: 0,
  mostCommonDefect: 'None Recorded',
  qualityInsight: 'No production inspection records recorded yet.',
  ppmDefectRate: 0,
  defectBreakdown: [],
  hourlyTrend: [],
};

// Inspection Service abstraction
export class InspectionService {
  private sessionToken: string | null = null;

  async getSessionToken(): Promise<string | null> {
    if (this.sessionToken) return this.sessionToken;
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          this.sessionToken = data.sessionToken;
          return this.sessionToken;
        }
      } catch (e) {
        // network or server offline
      }
    }
    return null;
  }
  private learnedDefects: LearnedDefectItem[] = [
    {
      id: 'def-1',
      name: 'Micro-Crack',
      category: 'Structural Flaw',
      addedAt: '2026-10-18T19:30:00Z',
      samplesCount: 4,
      severity: 'CRITICAL',
      color: '#ef4444',
    },
    {
      id: 'def-2',
      name: 'Surface Burr',
      category: 'Machining Residue',
      addedAt: '2026-10-18T20:15:00Z',
      samplesCount: 6,
      severity: 'MAJOR',
      color: '#f97316',
    },
    {
      id: 'def-3',
      name: 'Tooth Chipping',
      category: 'Form Irregularity',
      addedAt: '2026-10-18T21:40:00Z',
      samplesCount: 3,
      severity: 'CRITICAL',
      color: '#e11d48',
    },
  ];

  private history: InspectionRecord[] = [
    {
      id: 'PNZ-REC-098',
      timestamp: '2026-10-18T23:18:12Z',
      partId: 'PART-098',
      partProfile: 'Precision Gear (PNZ-GEAR-M12)',
      status: 'PASS',
      defectType: null,
      confidence: 0.984,
      anomalyScore: 0.03,
      location: null,
      processingTimeMs: 14.2,
      processingEngine: 'PulseNet Demo Preset Simulator (Canned Data)',
      observations: ['Flank concentricity nominal', 'Zero burr threshold met', 'Ra 0.78μm'],
      metrics: { surfaceRoughnessRa: '0.78 μm', edgeRunout: '0.005 mm', contourMatch: '99.2%' },
      isSimulated: true,
      batchId: 'DEMO-BATCH-001',
    },
    {
      id: 'PNZ-REC-099',
      timestamp: '2026-10-18T23:22:45Z',
      partId: 'PART-099',
      partProfile: 'Precision Gear (PNZ-GEAR-M12)',
      status: 'DEFECT',
      defectType: 'Surface Scratch',
      confidence: 0.942,
      anomalyScore: 0.79,
      location: { x: 38, y: 44, width: 24, height: 18 },
      processingTimeMs: 12.8,
      processingEngine: 'PulseNet Demo Preset Simulator (Canned Data)',
      observations: ['Linear scoring on flank tooth 4', 'Specular variance > 40%'],
      metrics: { surfaceRoughnessRa: '1.42 μm', edgeRunout: '0.038 mm', contourMatch: '87.4%' },
      isSimulated: true,
      batchId: 'DEMO-BATCH-001',
    },
    {
      id: 'PNZ-REC-100',
      timestamp: '2026-10-18T23:25:30Z',
      partId: 'PART-100',
      partProfile: 'Precision Gear (PNZ-GEAR-M12)',
      status: 'UNKNOWN',
      defectType: 'Unclassified Anomaly',
      confidence: 0.720,
      anomalyScore: 0.64,
      location: { x: 42, y: 55, width: 28, height: 25 },
      processingTimeMs: 15.1,
      processingEngine: 'PulseNet Demo Preset Simulator (Canned Data)',
      observations: ['Unfamiliar dark particulate deposit', 'Deviation 3.8σ from normal profile'],
      metrics: { surfaceRoughnessRa: '1.10 μm', edgeRunout: '0.018 mm', contourMatch: '91.0%' },
      isSimulated: true,
      batchId: 'DEMO-BATCH-001',
    },
  ];

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedHistory = localStorage.getItem('pnz_history');
        if (savedHistory) {
          this.history = JSON.parse(savedHistory);
        }
        const savedDefects = localStorage.getItem('pnz_defects');
        if (savedDefects) {
          this.learnedDefects = JSON.parse(savedDefects);
        }
      } catch (e) {
        console.warn('LocalStorage load error:', e);
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('pnz_history', JSON.stringify(this.history.slice(0, 50)));
        localStorage.setItem('pnz_defects', JSON.stringify(this.learnedDefects));
      } catch (e) {
        // storage quota exceeded or disabled
      }
    }
  }

  async inspectPart(params: {
    imageBase64: string;
    partProfile: string;
    forceOffline?: boolean;
    allowCloudProcessing?: boolean;
    isDemoSimulation?: boolean;
    simulatedPreset?: 'normal' | 'scratch' | 'crack' | 'dent' | 'unknown';
    partId?: string;
    batchId?: string;
  }): Promise<InspectionRecord> {
    const { imageBase64, partProfile, forceOffline = false, allowCloudProcessing = false, isDemoSimulation, simulatedPreset, partId, batchId } = params;
    const assignedPartId = partId || `PART-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const token = await this.getSessionToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['x-pnz-session-token'] = token;
      }

      const response = await fetch('/api/inspect', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          imageBase64,
          partProfile,
          forceOffline,
          allowCloudProcessing,
          isDemoSimulation,
          simulatedPreset,
          knownDefects: this.learnedDefects.map((d) => d.name),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Inspection endpoint returned ${response.status}`);
      }

      const data = await response.json();
      const record: InspectionRecord = {
        id: `PNZ-REC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        partId: assignedPartId,
        partProfile,
        status: data.status,
        defectType: data.defectType,
        confidence: data.confidence,
        anomalyScore: data.anomalyScore,
        location: data.location,
        processingTimeMs: data.processingTimeMs,
        processingEngine: data.processingEngine,
        observations: data.observations || [],
        metrics: data.metrics || { surfaceRoughnessRa: '0.80 μm', edgeRunout: '0.008 mm', contourMatch: '98.5%' },
        imageUrl: imageBase64,
        isSimulated: Boolean(data.isSimulated ?? isDemoSimulation),
        batchId: batchId ? batchId.trim() : (isDemoSimulation ? 'DEMO-BATCH-001' : undefined),
      };

      this.history.unshift(record);
      this.persist();
      return record;
    } catch (err: any) {
      console.error('Inspection failed:', err?.message || err);
      throw err;
    }
  }

    async teachDefect(defectName: string, category: string = 'Surface Anomaly', sampleImage?: string): Promise<LearnedDefectItem> {
    try {
      const token = await this.getSessionToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['x-pnz-session-token'] = token;
      }
      await fetch('/api/teach-defect', {
        method: 'POST',
        headers,
        body: JSON.stringify({ defectName, category, sampleImage }),
      });
    } catch (e) {
      console.warn('Teach defect server sync skipped (running local):', e);
    }

    const existing = this.learnedDefects.find((d) => d.name.toLowerCase() === defectName.toLowerCase());
    if (existing) {
      existing.samplesCount += 1;
      this.persist();
      return existing;
    }

    const newDefect: LearnedDefectItem = {
      id: `def-${Date.now()}`,
      name: defectName,
      category,
      addedAt: new Date().toISOString(),
      samplesCount: 1,
      severity: 'MAJOR',
      color: '#38bdf8',
    };
    this.learnedDefects.unshift(newDefect);
    this.persist();
    return newDefect;
  }

  getLearnedDefects(): LearnedDefectItem[] {
    return [...this.learnedDefects];
  }

  async syncLearnedDefects(): Promise<LearnedDefectItem[]> {
    try {
      const res = await fetch('/api/learned-defects');
      if (res.ok) {
        const serverDefects = await res.json();
        if (Array.isArray(serverDefects)) {
          for (const item of serverDefects) {
            const name = typeof item === 'string' ? item : item?.name;
            if (name && !this.learnedDefects.some((d) => d.name.toLowerCase() === name.toLowerCase())) {
              this.learnedDefects.push({
                id: (typeof item === 'object' && item?.id) || `def-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name,
                category: (typeof item === 'object' && item?.category) || 'Surface Anomaly',
                addedAt: (typeof item === 'object' && item?.addedAt) || new Date().toISOString(),
                samplesCount: (typeof item === 'object' && item?.samplesCount) || 1,
                severity: 'MAJOR',
                color: '#38bdf8',
              });
            }
          }
          this.persist();
        }
      }
    } catch {
      // Offline fallback: keep local storage defects
    }
    return this.getLearnedDefects();
  }

  getHistory(): InspectionRecord[] {
    return [...this.history];
  }

  getBatchAnalytics(selectedBatchId?: string, includeSimulated: boolean = false): BatchSummary {
    let records = this.history;
    if (!includeSimulated) {
      records = records.filter((r) => !r.isSimulated);
    }

    if (selectedBatchId && selectedBatchId !== 'ALL') {
      records = records.filter((r) => r.batchId === selectedBatchId);
    }

    const totalInspected = records.length;
    const passCount = records.filter((r) => r.status === 'PASS').length;
    const defectCount = records.filter((r) => r.status === 'DEFECT').length;
    const unknownCount = records.filter((r) => r.status === 'UNKNOWN').length;

    const yieldRate = totalInspected > 0
      ? parseFloat(((passCount / totalInspected) * 100).toFixed(1))
      : 0;

    const ppmDefectRate = totalInspected > 0
      ? Math.round((defectCount / totalInspected) * 1_000_000)
      : 0;

    const defectMap = new Map<string, number>();
    records
      .filter((r) => r.status === 'DEFECT' || r.status === 'UNKNOWN')
      .forEach((r) => {
        const type = r.defectType || (r.status === 'UNKNOWN' ? 'Unclassified Anomaly' : 'Unspecified Defect');
        defectMap.set(type, (defectMap.get(type) || 0) + 1);
      });

    const defectBreakdown: Array<{ name: string; count: number; percentage: number; color: string }> = [];
    const colors = ['#f43f5e', '#ef4444', '#fb923c', '#eab308', '#a855f7'];
    let colorIdx = 0;
    let mostCommonDefect = 'None Recorded';
    let maxDefectCount = 0;

    const totalDefectsAndUnknown = defectCount + unknownCount;

    defectMap.forEach((count, name) => {
      const percentage = totalDefectsAndUnknown > 0
        ? parseFloat(((count / totalDefectsAndUnknown) * 100).toFixed(1))
        : 0;
      defectBreakdown.push({
        name,
        count,
        percentage,
        color: colors[colorIdx % colors.length],
      });
      colorIdx++;
      if (count > maxDefectCount) {
        maxDefectCount = count;
        mostCommonDefect = name;
      }
    });

    defectBreakdown.sort((a, b) => b.count - a.count);

    const hourMap = new Map<string, { pass: number; defect: number }>();
    records.forEach((r) => {
      try {
        const date = new Date(r.timestamp);
        const hour = `${String(date.getHours()).padStart(2, '0')}:00`;
        const entry = hourMap.get(hour) || { pass: 0, defect: 0 };
        if (r.status === 'PASS') {
          entry.pass++;
        } else {
          entry.defect++;
        }
        hourMap.set(hour, entry);
      } catch {
        // invalid timestamp handling
      }
    });

    const hourlyTrend = Array.from(hourMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([hour, data]) => {
        const hTotal = data.pass + data.defect;
        const hYield = hTotal > 0 ? parseFloat(((data.pass / hTotal) * 100).toFixed(1)) : 0;
        return {
          hour,
          pass: data.pass,
          defect: data.defect,
          yield: hYield,
        };
      });

    const qualityInsight = totalInspected === 0
      ? 'No operational inspection records found. Run inspections to generate quality trends.'
      : defectCount === 0
      ? '100% quality compliance achieved across inspected units. Zero non-conformance detected.'
      : `${mostCommonDefect} is the leading non-conformance flag (${maxDefectCount} occurrence${maxDefectCount > 1 ? 's' : ''}). Review station setup.`;

    const batchSet = new Set<string>();
    this.history.forEach((r) => {
      if (r.batchId) batchSet.add(r.batchId);
    });

    const activeBatchNumber = selectedBatchId && selectedBatchId !== 'ALL'
      ? selectedBatchId
      : (batchSet.size > 0 ? Array.from(batchSet)[0] : 'ALL BATCHES');

    return {
      batchNumber: activeBatchNumber,
      totalInspected,
      passCount,
      defectCount,
      unknownCount,
      yieldRate,
      mostCommonDefect,
      qualityInsight,
      ppmDefectRate,
      defectBreakdown,
      hourlyTrend,
      hasGenuineRecords: this.history.some((r) => !r.isSimulated),
      isSimulatedOnly: totalInspected > 0 && records.every((r) => r.isSimulated),
      availableBatches: Array.from(batchSet),
    };
  }

  createPartProfile(name: string, sku: string, category: string): PartProfile {
    return {
      id: `profile-${Date.now()}`,
      name,
      sku,
      category,
      tolerance: '±0.010 mm (Custom MSME Profile)',
      goldenSamplesCount: 8,
      featuresLearned: ['Boundary Contour', 'Surface Reflectivity', 'Dimensional Symmetry', 'Bore Concentricity'],
      specs: {
        outerDiameter: '75.0 mm',
        boreDiameter: '25.0 mm',
        thickness: '12.0 mm',
        material: 'Mild Steel / EN8',
      },
    };
  }
}

export const inspectionService = new InspectionService();
