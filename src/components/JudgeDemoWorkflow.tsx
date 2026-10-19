import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  WifiOff, 
  Cpu, 
  Crosshair,
  Volume2,
  Trophy,
  Check
} from 'lucide-react';
import { generateGearSvg } from '../utils/partSVGs';
import { industrialAudio } from '../utils/audio';

interface JudgeDemoWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyOfflineToggle: (val: boolean) => void;
}

export const JudgeDemoWorkflow: React.FC<JudgeDemoWorkflowProps> = ({
  isOpen,
  onClose,
  onApplyOfflineToggle,
}) => {
  // Current step 1 to 16
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // SVGs for the demo stages
  const normalGearUri = `data:image/svg+xml;utf8,${encodeURIComponent(generateGearSvg('NORMAL'))}`;
  const defectiveGearUri = `data:image/svg+xml;utf8,${encodeURIComponent(generateGearSvg('CRACK'))}`;
  const anomalyGearUri = `data:image/svg+xml;utf8,${encodeURIComponent(generateGearSvg('UNKNOWN'))}`;
  const scratchGearUri = `data:image/svg+xml;utf8,${encodeURIComponent(generateGearSvg('SCRATCH'))}`;

  // Step definitions matching the exact 16-step sequence from prompt
  const steps = [
    {
      step: 1,
      title: 'Step 1: Normal Manufactured Component',
      description: 'Displaying golden reference Precision Gear specimen (PNZ-GEAR-M12) conforming to DIN 3962 Class 6.',
      image: normalGearUri,
      statusBadge: 'SPECIMEN LOADED',
      badgeColor: 'border-cyan-500 text-cyan-400 bg-cyan-950',
      actionText: 'Inspecting part contour...',
    },
    {
      step: 2,
      title: 'Step 2: Run Inspection',
      description: 'Executing zero-shot optical scan. Evaluating tooth flanks, root fillets, and surface reflectivity against learned 8-sample normality tensor.',
      image: normalGearUri,
      statusBadge: 'INSPECTING...',
      badgeColor: 'border-cyan-500 text-cyan-400 bg-cyan-950 animate-pulse',
      actionText: 'Running feature gradient match...',
    },
    {
      step: 3,
      title: 'Step 3: Inspection Result: PASS',
      description: 'All pitch circle runouts, involute angles, and surface roughness Ra within 0.008mm manufacturing tolerance.',
      image: normalGearUri,
      statusBadge: 'PASS — 98% CONFIDENCE',
      badgeColor: 'border-emerald-500 text-emerald-400 bg-emerald-950',
      confidence: '98%',
      anomalyScore: '0.03',
      resultType: 'PASS',
      audioTrigger: 'pass',
    },
    {
      step: 4,
      title: 'Step 4: Introduce Defective Component',
      description: 'Introducing a precision gear component with a known structural flaw: Micro-Crack on the hub collar.',
      image: defectiveGearUri,
      statusBadge: 'DEFECTIVE SPECIMEN',
      badgeColor: 'border-rose-500 text-rose-400 bg-rose-950',
      actionText: 'Triggering optical inspection...',
    },
    {
      step: 5,
      title: 'Step 5: Run Inspection',
      description: 'Zero-shot feature extractor detects structural discontinuity exceeding 3.5-sigma envelope threshold.',
      image: defectiveGearUri,
      statusBadge: 'ANALYZING SPECIMEN...',
      badgeColor: 'border-rose-500 text-rose-400 bg-rose-950 animate-pulse',
    },
    {
      step: 6,
      title: 'Step 6: DEFECT DETECTED',
      description: 'Sub-millimeter fracture line localized on hub collar. Defect type: Micro-Crack (Confidence: 96.5%, Latency: 12.8ms). Immediate scrap action triggered.',
      image: defectiveGearUri,
      statusBadge: 'DEFECT DETECTED',
      badgeColor: 'border-rose-500 text-rose-400 bg-rose-950',
      confidence: '96.5%',
      anomalyScore: '0.88',
      resultType: 'DEFECT',
      audioTrigger: 'defect',
    },
    {
      step: 7,
      title: 'Step 7: Introduce Unfamiliar Anomaly',
      description: 'Introducing a part with an unprecedented molten splatter / unfamiliar contaminant that the system has NEVER seen before.',
      image: anomalyGearUri,
      statusBadge: 'UNFAMILIAR SPECIMEN',
      badgeColor: 'border-amber-500 text-amber-400 bg-amber-950',
    },
    {
      step: 8,
      title: 'Step 8: UNKNOWN ANOMALY',
      description: 'The system flags: "⚠ UNKNOWN ANOMALY — detected something outside the learned normal profile". System requests operator label.',
      image: anomalyGearUri,
      statusBadge: 'UNKNOWN ANOMALY',
      badgeColor: 'border-amber-500 text-amber-400 bg-amber-950',
      confidence: '72%',
      anomalyScore: '0.64',
      resultType: 'UNKNOWN',
      audioTrigger: 'alert',
    },
    {
      step: 9,
      title: 'Step 9: Click: TEACH ME',
      description: 'Operator activates the signature on-the-fly defect adaptation protocol without halting the line or collecting a massive dataset.',
      image: anomalyGearUri,
      statusBadge: 'TEACH ME INITIATED',
      badgeColor: 'border-amber-500 text-amber-300 bg-amber-950',
    },
    {
      step: 10,
      title: 'Step 10: Label Anomaly as SCRATCH',
      description: 'Operator identifies the defect as "SCRATCH" (Linear tooling abrasion).',
      image: scratchGearUri,
      statusBadge: 'LABEL: SCRATCH',
      badgeColor: 'border-cyan-500 text-cyan-300 bg-cyan-950',
    },
    {
      step: 11,
      title: 'Step 11: LEARNING NEW DEFECT...',
      description: 'Updating inspection profile in real-time. Defect vector partitioned and embedded into the edge classifier matrix.',
      image: scratchGearUri,
      statusBadge: 'LEARNING NEW DEFECT...',
      badgeColor: 'border-cyan-500 text-cyan-400 bg-cyan-950 animate-pulse',
    },
    {
      step: 12,
      title: 'Step 12: Reinspect Component',
      description: 'Re-evaluating the component against the freshly updated normality and defect boundary.',
      image: scratchGearUri,
      statusBadge: 'RE-INSPECTING...',
      badgeColor: 'border-cyan-500 text-cyan-400 bg-cyan-950 animate-pulse',
    },
    {
      step: 13,
      title: 'Step 13: SCRATCH DETECTED — 94% CONFIDENCE',
      description: 'Defect successfully identified as SCRATCH at 94% confidence! The system adapted on-the-fly without model retraining downtime.',
      image: scratchGearUri,
      statusBadge: 'SCRATCH DETECTED // 94% CONFIDENCE',
      badgeColor: 'border-rose-500 text-rose-300 bg-rose-950',
      confidence: '94%',
      anomalyScore: '0.78',
      resultType: 'DEFECT',
      audioTrigger: 'pass',
    },
    {
      step: 14,
      title: 'Step 14: Toggle: OFFLINE MODE',
      description: 'Simulating internet outage on the factory floor. System seamlessly engages 100% air-gapped on-device WebAssembly edge kernel.',
      image: scratchGearUri,
      statusBadge: 'OFFLINE MODE: ACTIVE',
      badgeColor: 'border-amber-500 text-amber-400 bg-amber-950',
      onEnter: () => onApplyOfflineToggle(true),
    },
    {
      step: 15,
      title: 'Step 15: Run Another Inspection (Sub-15ms Edge)',
      description: 'Inference completes locally in 12.4 ms! $0 cloud API costs, 0s cloud latency, zero risk of leaking confidential CAD blueprints.',
      image: normalGearUri,
      statusBadge: 'EDGE PASS // 12.4 MS',
      badgeColor: 'border-emerald-500 text-emerald-400 bg-emerald-950',
      confidence: '98.5%',
      anomalyScore: '0.04',
      resultType: 'PASS',
      audioTrigger: 'pass',
    },
    {
      step: 16,
      title: 'Step 16: PULSENET-ZERO GRAND FINALE',
      description: 'Proven solution for the National Student Ideation Challenge. Affordable. Data-efficient. Offline-ready.',
      image: normalGearUri,
      statusBadge: 'DEMO COMPLETE',
      badgeColor: 'border-cyan-500 text-cyan-300 bg-cyan-950',
      isFinal: true,
    },
  ];

  const currentStepData = steps[currentStep - 1];

  // Auto-play timer
  useEffect(() => {
    if (!isOpen) return;

    if (currentStepData.audioTrigger) {
      if (currentStepData.audioTrigger === 'pass') industrialAudio.playPass();
      if (currentStepData.audioTrigger === 'defect') industrialAudio.playDefect();
      if (currentStepData.audioTrigger === 'alert') industrialAudio.playAlert();
    }
    if (currentStepData.onEnter) {
      currentStepData.onEnter();
    }

    if (!isAutoPlaying) return;

    setProgressPercent(0);
    const duration = currentStep === 16 ? 12000 : 3500;
    const interval = 50;
    const stepIncrement = (interval / duration) * 100;

    timerRef.current = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          if (currentStep < 16) {
            setCurrentStep((s) => s + 1);
          } else {
            setIsAutoPlaying(false);
          }
          return 0;
        }
        return prev + stepIncrement;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [currentStep, isAutoPlaying, isOpen]);

  const handleNext = () => {
    industrialAudio.playClick();
    if (currentStep < 16) {
      setCurrentStep((s) => s + 1);
      setProgressPercent(0);
    }
  };

  const handlePrev = () => {
    industrialAudio.playClick();
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      setProgressPercent(0);
    }
  };

  const handleRestart = () => {
    industrialAudio.playClick();
    setCurrentStep(1);
    setProgressPercent(0);
    setIsAutoPlaying(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-black border border-[#00f0ff] shadow-[0_0_50px_rgba(0,240,255,0.3)] overflow-hidden font-mono flex flex-col max-h-[92vh]">
        {/* Technical Corner Brackets */}
        <div className="corner-marker-tl"></div>
        <div className="corner-marker-tr"></div>
        <div className="corner-marker-bl"></div>
        <div className="corner-marker-br"></div>

        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-black border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black border border-[#ffb703] flex items-center justify-center text-[#ffb703] shadow-[0_0_10px_rgba(255,183,3,0.3)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-sm sm:text-base tracking-wider">[AUTOMATED JUDGE DEMONSTRATION]</span>
                <span className="text-xs px-2 py-0.5 bg-black text-[#00f0ff] border border-[#00f0ff] font-bold">
                  STEP {currentStep} / 16
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Automated 16-step sequence proving zero-shot inspection, on-the-fly learning, and offline edge resilience.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="px-3 py-1.5 bg-black border border-zinc-700 hover:border-[#00f0ff] text-xs text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5 text-[#ffb703]" /> : <Play className="w-3.5 h-3.5 text-[#00ff66]" />}
              <span>{isAutoPlaying ? '[PAUSE]' : '[AUTO-PLAY]'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-black border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
              title="Close Demo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-950 h-1 relative overflow-hidden border-b border-zinc-800">
          <div 
            className="h-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] transition-all duration-75"
            style={{ width: `${((currentStep - 1) / 15) * 100}%` }}
          ></div>
        </div>

        {/* Modal Main Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          {currentStepData.isFinal ? (
            /* Final Step 16 Celebration & Core Message (Required by prompt) */
            <div className="py-8 px-4 text-center space-y-8 max-w-3xl mx-auto font-mono">
              <div className="w-20 h-20 bg-black border border-[#00f0ff] flex items-center justify-center mx-auto text-[#00f0ff] shadow-[0_0_40px_rgba(0,240,255,0.4)]">
                <Trophy className="w-10 h-10 text-[#00f0ff]" />
              </div>

              {/* Required exact text from prompt:
                  "PULSENET-ZERO
                  QUALITY INSPECTION WITHOUT THE BIG-FACTORY PRICE TAG."
                  "Learn from what you have — not what you don't."
              */}
              <div className="space-y-4">
                <div className="text-xs text-[#00f0ff] font-bold uppercase tracking-widest">
                  [DEMONSTRATION COMPLETE // NATIONAL STUDENT IDEATION CHALLENGE]
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                  PULSENET<span className="text-[#00f0ff]">-ZERO</span>
                </h2>
                <p className="text-xl sm:text-2xl font-bold text-[#00f0ff] font-mono">
                  QUALITY INSPECTION WITHOUT THE BIG-FACTORY PRICE TAG.
                </p>
                <div className="p-4 bg-black border border-zinc-800 max-w-xl mx-auto text-zinc-300 font-mono text-sm">
                  &gt;&gt; &ldquo;Learn from what you have — not what you don&apos;t.&rdquo;
                </div>
              </div>

              {/* Core takeaways summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs font-mono pt-4">
                <div className="p-4 bg-black border border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.15)]">
                  <div className="text-[#00ff66] font-bold mb-1">[01 // ZERO DATA BARRIER]</div>
                  <div className="text-zinc-400">Learns normality from just 8 good parts. Eliminates the 10,000 defect image requirement.</div>
                </div>
                <div className="p-4 bg-black border border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                  <div className="text-[#00f0ff] font-bold mb-1">[02 // $0 HARDWARE CAPEX]</div>
                  <div className="text-zinc-400">Runs on standard webcams, smartphones, or laptops with sub-15ms edge inference.</div>
                </div>
                <div className="p-4 bg-black border border-[#ffb703] shadow-[0_0_15px_rgba(255,183,3,0.15)]">
                  <div className="text-[#ffb703] font-bold mb-1">[03 // 100% OFFLINE READY]</div>
                  <div className="text-zinc-400">Survives workshop network disruptions and protects client CAD drawings on-premises.</div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-black hover:bg-zinc-900 text-zinc-200 border border-zinc-700 font-bold text-xs flex items-center gap-2 transition-colors font-mono"
                >
                  <RotateCcw className="w-4 h-4 text-[#00f0ff]" />
                  <span>[REPLAY DEMO]</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-[#00f0ff] hover:bg-cyan-300 text-black font-black text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] font-mono"
                >
                  [EXPLORE INTERACTIVE WORKBENCH]
                </button>
              </div>
            </div>
          ) : (
            /* Steps 1 to 15 display */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center font-mono">
              {/* Left Column: Specimen Viewer */}
              <div className="md:col-span-6 relative bg-black border border-zinc-800 p-4 overflow-hidden aspect-square flex items-center justify-center console-grid">
                {/* Visual HUD Reticle */}
                <div className="corner-marker-tl"></div>
                <div className="corner-marker-tr"></div>
                <div className="corner-marker-bl"></div>
                <div className="corner-marker-br"></div>

                <img
                  src={currentStepData.image}
                  alt={currentStepData.title}
                  className="max-h-full max-w-full object-contain p-2"
                />

                {/* Status indicator on the image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] px-3 py-1.5 bg-black border border-zinc-800 font-mono">
                  <span className="text-zinc-400 truncate">[PULSENET ZERO-SHOT OPTICAL RETICLE]</span>
                  <span className="text-[#00f0ff] font-bold">FOV 120mm</span>
                </div>
              </div>

              {/* Right Column: Step Description and Metric Cards */}
              <div className="md:col-span-6 space-y-5">
                <div className="space-y-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold border uppercase ${currentStepData.badgeColor}`}>
                    {currentStepData.statusBadge}
                  </span>
                  <h3 className="text-2xl font-black text-white tracking-wide uppercase">
                    {currentStepData.title}
                  </h3>
                  <p className="text-sm text-zinc-300 font-mono leading-relaxed">
                    {currentStepData.description}
                  </p>
                </div>

                {/* Metric Telemetry Cards if applicable */}
                {currentStepData.confidence && (
                  <div className="grid grid-cols-3 gap-3 text-xs pt-2">
                    <div className="p-3 bg-black border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 font-bold">[CONFIDENCE]</div>
                      <div className="text-lg font-black text-[#00f0ff] mt-0.5 tabular-nums">
                        {currentStepData.confidence}
                      </div>
                    </div>
                    <div className="p-3 bg-black border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 font-bold">[ANOMALY SCORE]</div>
                      <div className={`text-lg font-black mt-0.5 tabular-nums ${
                        parseFloat(currentStepData.anomalyScore || '0') > 0.5 ? 'text-[#ff0055]' : 'text-[#00ff66]'
                      }`}>
                        {currentStepData.anomalyScore}
                      </div>
                    </div>
                    <div className="p-3 bg-black border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 font-bold">[LATENCY]</div>
                      <div className="text-lg font-black text-[#00ff66] mt-0.5 tabular-nums">
                        12.4 ms
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-timer countdown bar for current step */}
                {isAutoPlaying && (
                  <div className="space-y-1 text-[11px] text-zinc-500 pt-2 font-mono">
                    <div className="flex justify-between">
                      <span>AUTO-ADVANCING TO NEXT STEP...</span>
                      <span className="text-[#00f0ff] font-bold">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 overflow-hidden border border-zinc-800">
                      <div 
                        className="bg-[#00f0ff] h-full transition-all duration-75 shadow-[0_0_6px_#00f0ff]"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Manual Navigation Controls */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className="px-4 py-2.5 bg-black hover:bg-zinc-900 text-zinc-300 border border-zinc-700 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5 transition-colors font-mono"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>[PREVIOUS]</span>
                  </button>

                  <button
                    onClick={handleNext}
                    className="flex-1 px-5 py-2.5 bg-[#00f0ff] hover:bg-cyan-300 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] font-mono"
                  >
                    <span>[NEXT STEP]</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Step Tracker */}
        <div className="px-6 py-3 bg-black border-t border-zinc-800 flex flex-wrap items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
            {steps.map((s) => (
              <button
                key={s.step}
                onClick={() => {
                  industrialAudio.playClick();
                  setCurrentStep(s.step);
                  setProgressPercent(0);
                }}
                className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold transition-all border ${
                  currentStep === s.step
                    ? 'bg-[#00f0ff] text-black border-[#00f0ff] font-black'
                    : currentStep > s.step
                    ? 'bg-black text-[#00f0ff] border-zinc-800'
                    : 'bg-black text-zinc-600 border-zinc-900 hover:border-zinc-700'
                }`}
              >
                {s.step}
              </button>
            ))}
          </div>

          <div className="text-right">
            <span>PRESENTATION MODE: <strong className="text-zinc-200">[RAPID JUDGE EVALUATION]</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

