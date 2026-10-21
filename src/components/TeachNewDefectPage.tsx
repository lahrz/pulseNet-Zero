import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Layers, 
  Cpu, 
  Check, 
  Crosshair,
  ArrowRight,
  ShieldAlert,
  Zap,
  Activity
} from 'lucide-react';
import { generateGearSvg } from '../utils/partSVGs';
import { inspectionService } from '../services/inspectionService';
import { industrialAudio } from '../utils/audio';

interface TeachNewDefectPageProps {
  initialImage?: string;
  onNavigateToInspection: () => void;
}

export const TeachNewDefectPage: React.FC<TeachNewDefectPageProps> = ({
  initialImage,
  onNavigateToInspection,
}) => {
  // Default to an unknown anomaly specimen if none passed
  const defaultAnomalyUri = `data:image/svg+xml;utf8,${encodeURIComponent(generateGearSvg('UNKNOWN'))}`;
  const [specimenImage, setSpecimenImage] = useState<string>(initialImage || defaultAnomalyUri);

  // Workflow states: 'UNFAMILIAR' | 'UPDATING' | 'LEARNED' | 'REINSPECTED'
  const [workflowState, setWorkflowState] = useState<'UNFAMILIAR' | 'UPDATING' | 'LEARNED' | 'REINSPECTED'>('UNFAMILIAR');
  const [selectedDefect, setSelectedDefect] = useState<string>('SCRATCH');
  const [customDefectName, setCustomDefectName] = useState<string>('');
  const [confidenceScore, setConfidenceScore] = useState<number>(0.94);

  const defectOptions = [
    { id: 'CRACK', label: 'CRACK', desc: 'Stress micro-fracture or fissure' },
    { id: 'SCRATCH', label: 'SCRATCH', desc: 'Linear abrasive scoring or tooling mark' },
    { id: 'DENT', label: 'DENT', desc: 'Impact depression or deformation' },
    { id: 'SURFACE DEFECT', label: 'SURFACE DEFECT', desc: 'Pit, porosity, or oxidation spot' },
    { id: 'MISSING FEATURE', label: 'MISSING FEATURE', desc: 'Omitted hole, tooth, or keyway' },
    { id: 'OTHER', label: 'OTHER', desc: 'Custom operator-defined defect class' },
  ];

  const handleSelectDefect = (id: string) => {
    industrialAudio.playClick();
    setSelectedDefect(id);
  };

  const handleLearnDefect = async () => {
    industrialAudio.playAlert();
    setWorkflowState('UPDATING');

    const effectiveName = selectedDefect === 'OTHER' && customDefectName.trim()
      ? customDefectName.trim().toUpperCase()
      : selectedDefect;

    // Simulate profile update and server sync
    await inspectionService.teachDefect(effectiveName, 'Dynamic Operator Classification', specimenImage);

    setTimeout(() => {
      setWorkflowState('LEARNED');
      industrialAudio.playPass();
    }, 1400);
  };

  const handleReInspect = () => {
    industrialAudio.playClick();
    setWorkflowState('UPDATING');

    setTimeout(() => {
      setConfidenceScore(0.94);
      setWorkflowState('REINSPECTED');
      industrialAudio.playDefect();
    }, 900);
  };

  const handleReset = () => {
    industrialAudio.playClick();
    setWorkflowState('UNFAMILIAR');
    setSelectedDefect('SCRATCH');
  };

  const activeDefectLabel = selectedDefect === 'OTHER' && customDefectName.trim()
    ? customDefectName.trim().toUpperCase()
    : selectedDefect;

  return (
    <div className="space-y-6 pb-16 font-mono">
      {/* Title & Signature Banner */}
      <div className="relative bg-black border border-[#ffb703]/60 p-5 md:p-6 space-y-3 font-mono shadow-[0_0_30px_rgba(255,183,3,0.12)]">
        <div className="corner-marker-tl border-amber-400"></div>
        <div className="corner-marker-tr border-amber-400"></div>
        <div className="corner-marker-bl border-amber-400"></div>
        <div className="corner-marker-br border-amber-400"></div>

        <div className="flex items-center gap-2 text-xs text-[#ffb703] font-bold">
          <Sparkles className="w-4 h-4 text-[#ffb703]" />
          <span>[PAGE_04 // KILLER FEATURE // ON-THE-FLY ADAPTATION]</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wider uppercase">
              TEACH ME A NEW DEFECT
            </h1>
            <p className="text-xs text-zinc-300 mt-1">
              1-click defect absorption. Teach unknown anomalies on-the-fly with zero retraining lag.
            </p>
          </div>
          <div className="px-3 py-1 bg-black border border-[#ffb703] text-[#ffb703] text-xs font-bold shadow-[0_0_10px_rgba(255,183,3,0.3)]">
            [KILLER FEATURE]
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Suspicious Specimen Viewer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative bg-black border border-zinc-800 p-4 space-y-3 font-mono shadow-2xl">
            {/* Corner Industrial Brackets */}
            <div className="corner-marker-tl"></div>
            <div className="corner-marker-tr"></div>
            <div className="corner-marker-bl"></div>
            <div className="corner-marker-br"></div>

            {/* Specimen Header HUD */}
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1 pb-2 border-b border-zinc-800 font-bold">
              <span className="flex items-center gap-1.5 text-[#ffb703]">
                <Crosshair className="w-4 h-4 text-[#ffb703]" />
                [SUSPICIOUS ANOMALY SENSOR ZONE]
              </span>
              <span className="text-zinc-500">[SPECIMEN #ANOMALY-092]</span>
            </div>

            {/* Image Viewer Container */}
            <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center border border-zinc-800 p-4 console-grid">
              <img
                src={specimenImage}
                alt="Suspicious Anomaly Specimen"
                className="max-h-full max-w-full object-contain"
              />

              {/* Anomaly Bounding Box Marker */}
              <div 
                className={`absolute border-2 transition-all ${
                  workflowState === 'REINSPECTED'
                    ? 'border-[#ff0055] bg-[#ff0055]/15 shadow-[0_0_25px_rgba(255,0,85,0.6)]'
                    : 'border-[#ffb703] bg-[#ffb703]/15 shadow-[0_0_20px_rgba(255,183,3,0.5)] animate-pulse'
                }`}
                style={{ left: '38%', top: '48%', width: '30%', height: '24%' }}
              >
                <div className={`absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider whitespace-nowrap border ${
                  workflowState === 'REINSPECTED'
                    ? 'bg-black text-[#ff0055] border-[#ff0055] shadow-[0_0_10px_rgba(255,0,85,0.4)]'
                    : 'bg-black text-[#ffb703] border-[#ffb703] shadow-[0_0_10px_rgba(255,183,3,0.4)]'
                }`}>
                  {workflowState === 'REINSPECTED' ? `[IDENTIFIED: ${activeDefectLabel}]` : '⚠ UNKNOWN ANOMALY'}
                </div>
              </div>

              {/* Updating Animation Overlay */}
              {workflowState === 'UPDATING' && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center font-mono">
                  <div className="relative w-16 h-16 mb-3 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-[#ffb703]/30 border-t-[#ffb703] animate-spin"></div>
                    <Cpu className="w-6 h-6 text-[#ffb703] absolute" />
                  </div>
                  <div className="text-sm font-black text-[#ffb703] tracking-widest uppercase">
                    [UPDATING INSPECTION PROFILE...]
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Recalculating feature boundary tensors and embedding signature...
                  </p>
                </div>
              )}
            </div>

            {/* Specimen Telemetry */}
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 pt-2 border-t border-zinc-800 font-mono">
              <div>Boundary Distance: <strong className="text-[#ffb703] font-bold">3.82 σ</strong></div>
              <div className="text-right">Baseline: <strong className="text-white">Precision Gear</strong></div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Scenario & Dialogue Flow (Required by Page 4) */}
        <div className="lg:col-span-6 space-y-5">
          {/* SCENARIO 1: UNFAMILIAR / UNKNOWN ANOMALY DETECTED */}
          {workflowState === 'UNFAMILIAR' && (
            <div className="relative bg-black border border-[#ffb703] p-5 md:p-6 space-y-5 font-mono shadow-[0_0_25px_rgba(255,183,3,0.15)]">
              <div className="corner-marker-tl"></div>
              <div className="corner-marker-tr"></div>
              <div className="corner-marker-bl"></div>
              <div className="corner-marker-br"></div>

              {/* Display: ⚠ UNKNOWN ANOMALY (Required by prompt) */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black border border-[#ffb703] text-[#ffb703] text-sm font-bold shadow-[0_0_10px_rgba(255,183,3,0.3)]">
                  <AlertTriangle className="w-4 h-4 text-[#ffb703]" />
                  <span>⚠ UNKNOWN ANOMALY</span>
                </div>
                {/* Required text from prompt */}
                <p className="text-sm text-zinc-300 font-mono">
                  &ldquo;The system has detected something outside the learned normal profile.&rdquo;
                </p>
              </div>

              {/* Then ask: WHAT IS THIS? (Required by prompt) */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  [WHAT IS THIS?]
                </div>

                {/* Required defect buttons: CRACK, SCRATCH, DENT, SURFACE DEFECT, MISSING FEATURE, OTHER */}
                <div className="grid grid-cols-2 gap-2">
                  {defectOptions.map((opt) => {
                    const isSelected = selectedDefect === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectDefect(opt.id)}
                        className={`text-left p-3 border text-xs font-mono font-bold transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-black text-[#ffb703] border-[#ffb703] shadow-[0_0_15px_rgba(255,183,3,0.3)]'
                            : 'bg-black text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#ffb703]" />}
                        </div>
                        <span className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-zinc-200' : 'text-zinc-500'}`}>
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedDefect === 'OTHER' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Enter custom defect label (e.g., TOOL WEAR CHIP)..."
                      value={customDefectName}
                      onChange={(e) => setCustomDefectName(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-white text-xs p-2.5 font-mono focus:outline-none focus:border-[#ffb703]"
                    />
                  </div>
                )}
              </div>

              {/* Button: LEARN THIS DEFECT (Required by prompt) */}
              <div className="pt-2">
                <button
                  onClick={handleLearnDefect}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#ffb703] hover:bg-amber-300 text-black font-black text-sm font-mono tracking-widest transition-all shadow-[0_0_20px_rgba(255,183,3,0.5)]"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>[LEARN THIS DEFECT]</span>
                </button>
              </div>
            </div>
          )}

          {/* SCENARIO 2: DEFECT PROFILE UPDATED */}
          {workflowState === 'LEARNED' && (
            <div className="relative bg-black border border-[#00ff66] p-5 md:p-6 space-y-5 font-mono shadow-[0_0_25px_rgba(0,255,102,0.2)]">
              <div className="corner-marker-tl"></div>
              <div className="corner-marker-tr"></div>
              <div className="corner-marker-bl"></div>
              <div className="corner-marker-br"></div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black text-[#00ff66] border border-[#00ff66] flex items-center justify-center shadow-[0_0_10px_rgba(0,255,102,0.3)]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                    [SYSTEM SYNCHRONIZED]
                  </div>
                  {/* Required text from prompt */}
                  <div className="text-xl sm:text-2xl font-black text-[#00ff66] neon-text-emerald">
                    DEFECT PROFILE UPDATED
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black border border-zinc-800 space-y-1.5 text-xs font-mono">
                <div className="text-zinc-400">
                  New Defect Class: <strong className="text-white text-sm">[{activeDefectLabel}]</strong>
                </div>
                <div className="text-zinc-400">
                  Normality Boundary: <strong className="text-[#00f0ff]">Partitioned and Re-indexed</strong>
                </div>
                <p className="text-[11px] text-zinc-400 pt-1">
                  The local edge inference kernel now recognizes this visual aberration without requiring cloud retraining or modifying the core golden baseline.
                </p>
              </div>

              {/* Button: RE-INSPECT (Required by prompt) */}
              <button
                onClick={handleReInspect}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#00f0ff] hover:bg-cyan-300 text-black font-black text-sm font-mono tracking-widest transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>[RE-INSPECT SPECIMEN]</span>
              </button>
            </div>
          )}

          {/* SCENARIO 3: AFTER RE-INSPECTION (Required: DEFECT IDENTIFIED, SCRATCH, Confidence: 94%) */}
          {workflowState === 'REINSPECTED' && (
            <div className="relative bg-black border-2 border-[#ff0055] p-5 md:p-6 space-y-5 font-mono shadow-[0_0_30px_rgba(255,0,85,0.25)]">
              <div className="corner-marker-tl"></div>
              <div className="corner-marker-tr"></div>
              <div className="corner-marker-bl"></div>
              <div className="corner-marker-br"></div>

              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                    [RESULT POST-LEARNING]
                  </div>
                  {/* Required text: DEFECT IDENTIFIED */}
                  <div className="text-2xl font-black text-[#ff0055] neon-text-rose mt-0.5">
                    DEFECT IDENTIFIED
                  </div>
                </div>
                <span className="text-xs px-2.5 py-0.5 bg-black text-[#ff0055] border border-[#ff0055] font-bold shadow-[0_0_10px_rgba(255,0,85,0.3)]">
                  [CLASSIFIED]
                </span>
              </div>

              {/* Required display: Defect Name & Confidence: 94% */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-black border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">[IDENTIFIED DEFECT]</div>
                  <div className="text-xl font-black text-[#ff0055] mt-1 uppercase">
                    {activeDefectLabel}
                  </div>
                </div>

                <div className="p-3 bg-black border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">[CONFIDENCE]</div>
                  <div className="text-xl font-black text-[#00f0ff] mt-1 tabular-nums">
                    {(confidenceScore * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black border border-zinc-800 text-xs text-zinc-300 space-y-1 font-mono">
                <div className="text-zinc-500 uppercase font-bold text-[10px]">[VERIFICATION SUMMARY]:</div>
                <p>
                  Zero-retraining adaptation verified. Previously flagged as an ambiguous <em className="text-[#ffb703]">&ldquo;UNKNOWN ANOMALY&rdquo;</em>, this specimen is now conclusively classified as <strong className="text-[#ff0055]">{activeDefectLabel}</strong> at {Math.round(confidenceScore * 100)}% confidence in under 15ms.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2.5 bg-black hover:bg-zinc-900 text-zinc-300 border border-zinc-700 font-bold text-xs transition-colors text-center"
                >
                  [TEST ANOTHER DEFECT]
                </button>
                <button
                  onClick={() => {
                    industrialAudio.playClick();
                    onNavigateToInspection();
                  }}
                  className="flex-1 px-4 py-2.5 bg-[#00f0ff] hover:bg-cyan-300 text-black font-black text-xs transition-colors text-center shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  [RETURN TO MAIN INSPECTOR →]
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
