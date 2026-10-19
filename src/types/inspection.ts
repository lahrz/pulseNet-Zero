export type InspectionStatus = 'PASS' | 'DEFECT' | 'UNKNOWN';

export interface DefectLocation {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number;
  height: number;
}

export interface TechnicalMetrics {
  surfaceRoughnessRa: string;
  edgeRunout: string;
  contourMatch: string;
}

export interface InspectionRecord {
  id: string;
  timestamp: string;
  partId: string;
  partProfile: string;
  status: InspectionStatus;
  defectType: string | null;
  confidence: number;
  anomalyScore: number;
  location: DefectLocation | null;
  processingTimeMs: number;
  processingEngine: string;
  observations: string[];
  metrics: TechnicalMetrics;
  imageUrl?: string;
  notes?: string;
}

export interface PartProfile {
  id: string;
  name: string;
  sku: string;
  category: string;
  tolerance: string;
  goldenSamplesCount: number;
  featuresLearned: string[];
  specs: {
    outerDiameter: string;
    boreDiameter: string;
    thickness: string;
    material: string;
  };
}

export interface LearnedDefectItem {
  id: string;
  name: string;
  category: string;
  addedAt: string;
  samplesCount: number;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  color: string;
}

export interface BatchSummary {
  batchNumber: string;
  totalInspected: number;
  passCount: number;
  defectCount: number;
  unknownCount: number;
  yieldRate: number;
  mostCommonDefect: string;
  qualityInsight: string;
  ppmDefectRate: number;
  defectBreakdown: Array<{ name: string; count: number; percentage: number; color: string }>;
  hourlyTrend: Array<{ hour: string; pass: number; defect: number; yield: number }>;
}
