import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Cpu, 
  Check, 
  Crosshair, 
  Cloud
} from 'lucide-react';
import { generateGearSvg } from '../utils/partSVGs';
import { inspectionService } from '../services/inspectionService';
import { industrialAudio } from '../utils/audio';
import { InspectionRecord } from '../types/inspection';

interface TeachNewDefectPageProps {
  initialImage?: string;
  onNavigateToInspection: () => void;
  isOffline?: boolean;
}

async function rasterizeSvgToPng(svgDataUri: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(svgDataUri);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 400;
        canvas.height = img.height || 400;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(svgDataUri);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngUri = canvas.toDataURL('image/png');
        resolve(pngUri);
      } catch {
        resolve(svgDataUri);
      }
    };
    img.onerror = () => resolve(svgDataUri);
    img.src = svgDataUri;
  });
}

export const TeachNewDefectPage: React.FC<TeachNewDefectPageProps> = ({
  initialImage,
  onNavigateToInspection,
  isOffline = false,
}) => {
  // Default to an unknown anomaly specimen if none passed
  const defaultAnomalyUri = `data:image/svg+xml;utf8,${encodeURIComponent(generateGearSvg('UNKNOWN'))}`;
  const [specimenImage] = useState<string>(initialImage || defaultAnomalyUri);

  // Workflow states: 'UNFAMILIAR' | 'UPDATING' | 'LEARNED' | 'REINSPECTED' | 'INSPECTION_FAILED'
  const [workflowState, setWorkflowState] = useState<'UNFAMILIAR' | 'UPDATING' | 'LEARNED' | 'REINSPECTED' | 'INSPECTION_FAILED'>('UNFAMILIAR');
  const [selectedDefect, setSelectedDefect] = useState<string>('SCRATCH');
  const [customDefectName, setCustomDefectName] = useState<string>('');
  const [allowCloudProcessing, setAllowCloudProcessing] = useState<boolean>(false);
  const [reinspectResult, setReinspectResult] = useState<InspectionRecord | null>(null);
  const [inspectionError, setInspectionError] = useState<string | null>(null);

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
    setInspectionError(null);

    const effectiveName = selectedDefect === 'OTHER' && customDefectName.trim()
      ? customDefectName.trim().toUpperCase()
      : selectedDefect;

    try {
      await inspectionService.teachDefect(effectiveName, 'Dynamic Operator Classification', specimenImage);
      setWorkflowState('LEARNED');
      industrialAudio.playPass();
    } catch (err: any) {
      setInspectionError(err?.message || 'Failed to register defect in catalog');
      setWorkflowState('INSPECTION_FAILED');
      industrialAudio.playAlert();
    }
  };

  const handleReInspect = async () => {
    industrialAudio.playClick();
    setWorkflowState('UPDATING');
    setInspectionError(null);

    try {
      let finalImage = specimenImage;
      if (specimenImage.startsWith('data:image/svg+xml')) {
        finalImage = await rasterizeSvgToPng(specimenImage);
      }

      const record = await inspectionService.inspectPart({
        imageBase64: finalImage,
        partProfile: 'Precision Gear (PNZ-GEAR-M12)',
        forceOffline: isOffline,
        allowCloudProcessing,
        isDemoSimulation: false,
      });

      setReinspectResult(record);
      setWorkflowState('REINSPECTED');

      if (record.status === 'PASS') {
        industrialAudio.playPass();
      } else if (record.status === 'DEFECT') {
        industrialAudio.playDefect();
      } else {
        industrialAudio.playAlert();
      }
    } catch (err: any) {
      setReinspectResult(null);
      setInspectionError(err?.message || 'Re-inspection failed: Upstream or local inference error');
      setWorkflowState('INSPECTION_FAILED');
      industrialAudio.playAlert();
    }
  };

  const handleReset = () => {
    industrialAudio.playClick();
    setWorkflowState('UNFAMILIAR');
    setSelectedDefect('SCRATCH');
    setReinspectResult(null);
    setInspectionError(null);
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
          <span>[PAGE_04 // DEFECT REGISTRATION WORKFLOW]</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wider uppercase">
              TEACH ME A NEW DEFECT
            </h1>
            <p className="text-xs text-zinc-300 mt-1">
              Register new defect labels and visual signatures into the inspection catalog for future reference.
            </p>
          </div>
          <div className="px-3 py-1 bg-black border border-[#ffb703] text-[#ffb703] text-xs font-bold shadow-[0_0_10px_rgba(255,183,3,0.3)]">
            [DEFECT REGISTRY]
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
              {reinspectResult?.location ? (
                <div 
                  className={`absolute border-2 transition-all ${
                    reinspectResult.status === 'PASS'
                      ? 'border-[#00ff66] bg-[#00ff66]/15 shadow-[0_0_25px_rgba(0,255,102,0.5)]'
                      : 'border-[#ff0055] bg-[#ff0055]/15 shadow-[0_0_25px_rgba(255,0,85,0.6)]'
                  }`}
                  style={{
                    left: `${reinspectResult.location.x}%`,
                    top: `${reinspectResult.location.y}%`,
                    width: `${reinspectResult.location.width}%`,
                    height: `${reinspectResult.location.height}%`,
                  }}
                >
                  <div className={`absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider whitespace-nowrap border ${
                    reinspectResult.status === 'PASS'
                      ? 'bg-black text-[#00ff66] border-[#00ff66] shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                      : 'bg-black text-[#ff0055] border-[#ff0055] shadow-[0_0_10px_rgba(255,0,85,0.4)]'
                  }`}>
                    [{reinspectResult.status}: {reinspectResult.defectType || activeDefectLabel}]
                  </div>
                </div>
              ) : (workflowState === 'UNFAMILIAR' || workflowState === 'LEARNED') ? (
                <div 
                  className="absolute border-2 border-[#ffb703] bg-[#ffb703]/15 shadow-[0_0_20px_rgba(255,183,3,0.5)] animate-pulse"
                  style={{ left: '38%', top: '48%', width: '30%', height: '24%' }}
                >
                  <div className="absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider whitespace-nowrap border bg-black text-[#ffb703] border-[#ffb703] shadow-[0_0_10px_rgba(255,183,3,0.4)]">
                    ⚠ UNKNOWN ANOMALY (OPERATOR REVIEW)
                  </div>
                </div>
              ) : null}

              {/* Updating Animation Overlay */}
              {workflowState === 'UPDATING' && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center font-mono">
                  <div className="relative w-16 h-16 mb-3 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-[#ffb703]/30 border-t-[#ffb703] animate-spin"></div>
                    <Cpu className="w-6 h-6 text-[#ffb703] absolute" />
                  </div>
                  <div className="text-sm font-black text-[#ffb703] tracking-widest uppercase">
                    [PROCESSING SPECIMEN...]
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Communicating with inspection service...
                  </p>
                </div>
              )}
            </div>

            {/* Specimen Telemetry */}
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 pt-2 border-t border-zinc-800 font-mono">
              <div>Catalog Status: <strong className="text-[#ffb703] font-bold">{workflowState === 'LEARNED' || workflowState === 'REINSPECTED' ? 'REGISTERED' : 'UNCLASSIFIED'}</strong></div>
              <div className="text-right">Baseline: <strong className="text-white">Precision Gear</strong></div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Scenario & Dialogue Flow */}
        <div className="lg:col-span-6 space-y-5">
          {/* SCENARIO 1: UNFAMILIAR / UNKNOWN ANOMALY DETECTED */}
          {workflowState === 'UNFAMILIAR' && (
            <div className="relative bg-black border border-[#ffb703] p-5 md:p-6 space-y-5 font-mono shadow-[0_0_25px_rgba(255,183,3,0.15)]">
              <div className="corner-marker-tl"></div>
              <div className="corner-marker-tr"></div>
              <div className="corner-marker-bl"></div>
              <div className="corner-marker-br"></div>

              {/* Display: ⚠ UNKNOWN ANOMALY */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black border border-[#ffb703] text-[#ffb703] text-sm font-bold shadow-[0_0_10px_rgba(255,183,3,0.3)]">
                  <AlertTriangle className="w-4 h-4 text-[#ffb703]" />
                  <span>⚠ UNKNOWN ANOMALY</span>
                </div>
                <p className="text-sm text-zinc-300 font-mono">
                  &ldquo;The system has detected something outside the learned normal profile.&rdquo;
                </p>
              </div>

              {/* Then ask: WHAT IS THIS? */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  [WHAT IS THIS?]
                </div>

                {/* Defect buttons */}
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

              {/* Button: LEARN THIS DEFECT */}
              <div className="pt-2">
                <button
                  onClick={handleLearnDefect}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#ffb703] hover:bg-amber-300 text-black font-black text-sm font-mono tracking-widest transition-all shadow-[0_0_20px_rgba(255,183,3,0.5)]"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>[REGISTER THIS DEFECT]</span>
                </button>
              </div>
            </div>
          )}

          {/* SCENARIO 2: DEFECT PROFILE UPDATED / CATALOG REGISTERED */}
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
                    [CATALOG SYNCHRONIZED]
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#00ff66] neon-text-emerald">
                    DEFECT CATALOG UPDATED
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black border border-zinc-800 space-y-1.5 text-xs font-mono">
                <div className="text-zinc-400">
                  Registered Defect Class: <strong className="text-white text-sm">[{activeDefectLabel}]</strong>
                </div>
                <div className="text-zinc-400">
                  Catalog Status: <strong className="text-[#00f0ff]">Added to Defect Vocabulary</strong>
                </div>
                <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-900">
                  Defect signature has been recorded in the defect catalog. Note: Model weights are not modified (no neural training pipeline is installed).
                </p>
              </div>

              {/* Cloud Consent Toggle for Genuine Re-inspection */}
              <div className="p-3 bg-black border border-zinc-800 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCloudProcessing}
                    onChange={(e) => setAllowCloudProcessing(e.target.checked)}
                    className="mt-0.5 accent-[#00f0ff] cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 text-[#00f0ff]" />
                      Enable Cloud AI for Re-inspection (Google Gemini)
                    </span>
                    <p className="text-[10px] text-zinc-400">
                      Required for genuine specimen inspection. Offline inspection is unavailable without a local model runtime.
                    </p>
                  </div>
                </label>
              </div>

              {/* Button: RE-INSPECT */}
              <button
                onClick={handleReInspect}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#00f0ff] hover:bg-cyan-300 text-black font-black text-sm font-mono tracking-widest transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>[RE-INSPECT SPECIMEN]</span>
              </button>
            </div>
          )}

          {/* SCENARIO 3: AFTER GENUINE RE-INSPECTION */}
          {workflowState === 'REINSPECTED' && reinspectResult && (
            <div className={`relative bg-black border-2 p-5 md:p-6 space-y-5 font-mono shadow-[0_0_30px_rgba(255,0,85,0.25)] ${
              reinspectResult.status === 'PASS'
                ? 'border-[#00ff66]'
                : reinspectResult.status === 'DEFECT'
                ? 'border-[#ff0055]'
                : 'border-[#ffb703]'
            }`}>
              <div className="corner-marker-tl"></div>
              <div className="corner-marker-tr"></div>
              <div className="corner-marker-bl"></div>
              <div className="corner-marker-br"></div>

              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                    [RESULT POST-REGISTRATION // GENUINE INFERENCE]
                  </div>
                  <div className={`text-2xl font-black mt-0.5 ${
                    reinspectResult.status === 'PASS'
                      ? 'text-[#00ff66] neon-text-emerald'
                      : reinspectResult.status === 'DEFECT'
                      ? 'text-[#ff0055] neon-text-rose'
                      : 'text-[#ffb703]'
                  }`}>
                    {reinspectResult.status === 'PASS'
                      ? 'SPECIMEN PASSED'
                      : reinspectResult.status === 'DEFECT'
                      ? 'DEFECT IDENTIFIED'
                      : 'ANOMALY UNRESOLVED'}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-0.5 bg-black border font-bold ${
                  reinspectResult.status === 'PASS'
                    ? 'text-[#00ff66] border-[#00ff66]'
                    : reinspectResult.status === 'DEFECT'
                    ? 'text-[#ff0055] border-[#ff0055]'
                    : 'text-[#ffb703] border-[#ffb703]'
                }`}>
                  [{reinspectResult.status}]
                </span>
              </div>

              {/* Display: Real Defect Name & Confidence from actual inference */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-black border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">[VERDICT / CLASSIFICATION]</div>
                  <div className="text-xl font-black text-white mt-1 uppercase">
                    {reinspectResult.defectType || activeDefectLabel}
                  </div>
                </div>

                <div className="p-3 bg-black border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">[MEASURED CONFIDENCE]</div>
                  <div className="text-xl font-black text-[#00f0ff] mt-1 tabular-nums">
                    {(reinspectResult.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black border border-zinc-800 text-xs text-zinc-300 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-zinc-500 uppercase font-bold text-[10px]">
                  <span>[INFERENCE ENGINE]:</span>
                  <span className="text-cyan-400 font-bold">{reinspectResult.processingTimeMs.toFixed(0)} ms</span>
                </div>
                <div className="text-xs text-cyan-300">{reinspectResult.processingEngine}</div>
                {reinspectResult.observations.length > 0 && (
                  <div className="pt-1.5 text-[11px] text-zinc-400 border-t border-zinc-900">
                    {reinspectResult.observations.join(' • ')}
                  </div>
                )}
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

          {/* SCENARIO 4: RE-INSPECTION UNAVAILABLE / FAILED */}
          {workflowState === 'INSPECTION_FAILED' && (
            <div className="relative bg-black border-2 border-[#ff0055] p-5 md:p-6 space-y-5 font-mono shadow-[0_0_30px_rgba(255,0,85,0.25)]">
              <div className="corner-marker-tl border-[#ff0055]"></div>
              <div className="corner-marker-tr border-[#ff0055]"></div>
              <div className="corner-marker-bl border-[#ff0055]"></div>
              <div className="corner-marker-br border-[#ff0055]"></div>

              <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                <div className="w-10 h-10 bg-black text-[#ff0055] border border-[#ff0055] flex items-center justify-center shadow-[0_0_10px_rgba(255,0,85,0.3)]">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                    [SYSTEM DIAGNOSTIC // INFERENCE BLOCKED]
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#ff0055]">
                    RE-INSPECTION UNAVAILABLE
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-black border border-zinc-800 space-y-2 text-xs font-mono">
                <div className="text-[#ff0055] font-bold">[DIAGNOSTIC REASON]:</div>
                <p className="text-zinc-300">{inspectionError}</p>
                <div className="text-[11px] text-zinc-500 pt-1.5 border-t border-zinc-800">
                  Defect label <strong>&ldquo;{activeDefectLabel}&rdquo;</strong> remains recorded in the defect catalog. However, evaluating the physical specimen requires an active computer vision inference engine.
                </div>
              </div>

              {/* Cloud Consent Option if failed due to consent or offline */}
              {!allowCloudProcessing && (
                <div className="p-3 bg-black border border-[#ffb703] text-xs space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowCloudProcessing}
                      onChange={(e) => setAllowCloudProcessing(e.target.checked)}
                      className="mt-0.5 accent-[#ffb703] cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#ffb703]">Enable Cloud AI Inspection (Google Gemini)</span>
                      <p className="text-[11px] text-zinc-400">
                        Authorize transmitting specimen image to Google Gemini 3.8 Flash Vision for genuine multimodal classification.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={handleReInspect}
                  className="flex-1 px-4 py-2.5 bg-[#00f0ff] hover:bg-cyan-300 text-black font-black text-xs transition-colors text-center shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  [RETRY RE-INSPECTION]
                </button>
                <button
                  onClick={() => setWorkflowState('LEARNED')}
                  className="flex-1 px-4 py-2.5 bg-black hover:bg-zinc-900 text-zinc-300 border border-zinc-700 font-bold text-xs transition-colors text-center"
                >
                  [BACK TO CATALOG]
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
