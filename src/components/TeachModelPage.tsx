import React, { useState, useRef } from 'react';
import { 
  Layers, 
  Upload, 
  Sliders, 
  Check,
  Plus,
  Info
} from 'lucide-react';
import { generateGearSvg, generateFlangeSvg } from '../utils/partSVGs';
import { industrialAudio } from '../utils/audio';

export interface GoldenSampleItem {
  id: number;
  label: string;
  angle: string;
  rotationDeg: number;
  uri: string;
}

export function createInitialGoldenSamples(isFlange: boolean = false): GoldenSampleItem[] {
  const angles = [
    { id: 1, label: 'Golden Sample #01', angle: '0° Datum', rotationDeg: 0 },
    { id: 2, label: 'Golden Sample #02', angle: '45° Rotation', rotationDeg: 45 },
    { id: 3, label: 'Golden Sample #03', angle: '90° Rotation', rotationDeg: 90 },
    { id: 4, label: 'Golden Sample #04', angle: '135° Rotation', rotationDeg: 135 },
    { id: 5, label: 'Golden Sample #05', angle: '180° Inverted', rotationDeg: 180 },
    { id: 6, label: 'Golden Sample #06', angle: '225° Specular', rotationDeg: 225 },
    { id: 7, label: 'Golden Sample #07', angle: '270° Ambient', rotationDeg: 270 },
    { id: 8, label: 'Golden Sample #08', angle: '315° Edge Ref', rotationDeg: 315 },
  ];

  return angles.map((a) => {
    const svgStr = isFlange
      ? generateFlangeSvg('NORMAL', a.rotationDeg)
      : generateGearSvg('NORMAL', a.rotationDeg);
    return {
      ...a,
      uri: `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`,
    };
  });
}

interface TeachModelPageProps {
  onStartInspection: () => void;
  activeProfile: string;
}

export const TeachModelPage: React.FC<TeachModelPageProps> = ({
  onStartInspection,
  activeProfile,
}) => {
  const isFlange = activeProfile.toLowerCase().includes('flange');
  const [samples, setSamples] = useState<GoldenSampleItem[]>(() => createInitialGoldenSamples(isFlange));
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [toleranceThreshold, setToleranceThreshold] = useState<number>(3.2); // 3.2 sigma
  const [surfaceSensitivity, setSurfaceSensitivity] = useState<number>(85);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const features = [
    { name: 'Surface', description: 'Specular reflectance, Ra finish variance, machining toolpath micro-texture', score: '99.4%' },
    { name: 'Shape', description: 'Overall circularity, bore concentricity, hub collar symmetry', score: '99.8%' },
    { name: 'Edges', description: 'Involute tooth profile gradient, root fillet radius, chamfer runout', score: '98.9%' },
    { name: 'Pattern', description: '6-hole weight reduction lightning pattern pitch circle alignment', score: '99.6%' },
    { name: 'Geometry', description: 'Pitch circle diameter (PCD), DIN 3962 Class 6 dimensional envelope', score: '99.2%' },
  ];

  const handleUploadGoodPart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      industrialAudio.playClick();
      setIsUpdating(true);
      const newEntries: GoldenSampleItem[] = [];
      Array.from(files).forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const uri = event.target?.result as string;
          newEntries.push({
            id: Date.now() + idx,
            label: `User Good Sample #${samples.length + idx + 1}`,
            angle: 'Workshop Capture',
            rotationDeg: 0,
            uri,
          });
          if (newEntries.length === files.length) {
            setSamples((prev) => [...prev, ...newEntries]);
            setTimeout(() => {
              setIsUpdating(false);
              industrialAudio.playPass();
            }, 600);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="space-y-6 pb-16 font-mono">
      {/* Title & Subtitle (Explicitly required on Page 3) */}
      <div className="relative bg-black border border-[#00f0ff]/60 p-5 md:p-6 shadow-[0_0_25px_rgba(0,240,255,0.12)] space-y-3">
        <div className="corner-marker-tl"></div>
        <div className="corner-marker-tr"></div>
        <div className="corner-marker-bl"></div>
        <div className="corner-marker-br"></div>

        <div className="flex items-center gap-2 text-xs text-[#00f0ff] font-bold">
          <Layers className="w-4 h-4 text-[#00f0ff]" />
          <span>[PAGE_03 // REFERENCE SPECIMEN LIBRARY &amp; DEMO PROFILING]</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wider uppercase">
            TEACH THE MODEL
          </h1>
          <span className="px-2 py-0.5 text-xs font-mono border border-cyan-500/40 text-cyan-300 bg-cyan-950/30">
            [VISUAL REFERENCE DEMO]
          </span>
        </div>
        <p className="text-base sm:text-lg text-[#00f0ff] font-mono">
          &gt;&gt; &ldquo;Visual reference library &amp; deterministic augmentation preview.&rdquo;
        </p>

        {/* Compact Reference Note */}
        <div className="p-2.5 bg-black border border-zinc-800 text-xs text-zinc-300 flex flex-wrap items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#00f0ff]"></span>
            <span className="text-[#00f0ff] font-bold">[AUGMENTATION DEMO]:</span>
            <span className="text-zinc-300">
              Generates 8 deterministic orientation views for operator visual reference. Zero neural network training loop executed.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-black border border-amber-500/80 text-amber-400 text-[10px] font-bold">
            DEMO PREVIEW ONLY
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Normality Profile Panel (Explicitly Required on Page 3) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="relative bg-black border border-zinc-800 p-5 space-y-4 font-mono shadow-2xl">
            <div className="corner-marker-tl"></div>
            <div className="corner-marker-tr"></div>
            <div className="corner-marker-bl"></div>
            <div className="corner-marker-br"></div>

            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                [REFERENCE PROFILE SPECIFICATION]
              </h2>
              <span className="text-xs px-2 py-0.5 bg-black text-[#00f0ff] border border-[#00f0ff] font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                SPECIMEN ACTIVE
              </span>
            </div>

            {/* Target Profile Info */}
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-500 font-bold">[TARGET COMPONENT]</div>
              <div className="text-xs font-bold text-white">{activeProfile}</div>
            </div>

            {/* Samples Count Metric */}
            <div className="p-3 bg-black border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400 font-bold">Samples:</div>
                <div className="text-3xl font-black text-[#00f0ff] mt-0.5 tabular-nums">
                  {samples.length}
                </div>
              </div>
              <div className="text-right text-[10px] text-zinc-400 font-mono">
                <div>ROTATION BENCHMARKS</div>
                <div className="text-[#00f0ff] font-bold">8 DETERMINISTIC ANGLES</div>
              </div>
            </div>

            {/* Features (Prompt criteria: Surface, Shape, Edges, Pattern, Geometry) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  [REFERENCE INSPECTION CRITERIA]:
                </div>
                <div className="text-[10px] text-zinc-500">SPEC BENCHMARKS</div>
              </div>
              <div className="space-y-2">
                {features.map((feat) => (
                  <div key={feat.name} className="p-2.5 bg-black border border-zinc-800 hover:border-[#00f0ff]/60 transition-colors space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#00f0ff]" />
                        {feat.name}
                      </span>
                      <span className="text-zinc-400 font-bold tabular-nums text-[11px]">[{feat.score} BENCHMARK]</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-tight font-mono">
                      {feat.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Status */}
            <div className="p-3 bg-black border border-zinc-700 text-zinc-300 flex items-center justify-between shadow-lg">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">[INSPECTION PROFILE STATUS]</div>
                <div className="text-base font-bold text-[#00f0ff] flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 bg-[#00f0ff]"></span>
                  SPECIMEN CATALOG READY
                </div>
                <div className="text-[9px] text-zinc-500 font-mono mt-0.5">
                  (Uses demo presets or cloud inspection; no local training loop)
                </div>
              </div>
              <button
                onClick={() => {
                  industrialAudio.playClick();
                  onStartInspection();
                }}
                className="px-3 py-1.5 bg-[#00f0ff] hover:bg-cyan-300 text-black font-black text-xs font-mono transition-colors shadow-[0_0_10px_rgba(0,240,255,0.3)]"
              >
                [TEST INSPECTION →]
              </button>
            </div>
          </div>

          {/* Tolerance Envelope Tuning (Micro-MSME Control - Demo Sliders) */}
          <div className="bg-black border border-zinc-800 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 uppercase font-bold">[TOLERANCE THRESHOLDS (DEMO CONTROLS)]</span>
              <Sliders className="w-3.5 h-3.5 text-[#00f0ff]" />
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-zinc-300">
                  <span>Anomaly Cutoff (Sigma):</span>
                  <span className="text-[#00f0ff] font-bold tabular-nums">{toleranceThreshold} σ</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="5.0"
                  step="0.1"
                  value={toleranceThreshold}
                  onChange={(e) => setToleranceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-[#00f0ff] bg-zinc-900 h-1.5 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Aggressive (1.5σ)</span>
                  <span>Balanced (3.2σ)</span>
                  <span>Permissive (5.0σ)</span>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-zinc-800/60">
                <div className="flex justify-between text-zinc-300">
                  <span>Surface Sensitivity:</span>
                  <span className="text-[#00f0ff] font-bold tabular-nums">{surfaceSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  value={surfaceSensitivity}
                  onChange={(e) => setSurfaceSensitivity(parseInt(e.target.value, 10))}
                  className="w-full accent-[#00f0ff] bg-zinc-900 h-1.5 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Standard (50%)</span>
                  <span>High Sensitivity (85%)</span>
                  <span>Ultra-Fine (100%)</span>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 font-mono pt-1">
                * Note: Demonstration controls for proposed edge threshold calibration. Sliders do not alter neural weights or backend thresholds in current build.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Upload multiple images of GOOD parts & Golden Grid */}
        <div className="lg:col-span-7 space-y-5">
          <div className="relative bg-black border border-zinc-800 p-5 space-y-4 font-mono shadow-2xl">
            <div className="corner-marker-tl"></div>
            <div className="corner-marker-tr"></div>
            <div className="corner-marker-bl"></div>
            <div className="corner-marker-br"></div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  [REFERENCE SPECIMEN LIBRARY: {samples.length} VIEWS]
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visual reference specimens showing deterministic rotation views (0° to 315°). Uploaded parts update the in-memory catalog for visual review.
                </p>
              </div>

              {/* Upload good parts button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadGoodPart}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-black hover:bg-zinc-900 text-[#00f0ff] border border-[#00f0ff] text-xs font-bold tracking-wider transition-colors shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                >
                  <Upload className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>[UPLOAD GOOD PARTS]</span>
                </button>
              </div>
            </div>

            {isUpdating && (
              <div className="p-2.5 bg-cyan-950/40 border border-[#00f0ff] text-[#00f0ff] text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00f0ff] animate-ping"></span>
                <span>[CATALOG UPDATE]: Appending reference specimens to local in-memory preview library...</span>
              </div>
            )}

            <div className="p-2.5 bg-black border border-zinc-800 text-[11px] text-zinc-400 font-mono flex items-start gap-2">
              <Info className="w-4 h-4 text-[#00f0ff] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Reference Specimen Library:</strong> Uploaded parts and rotation presets provide an operator visual comparison gallery in browser memory. In this build, uploaded reference images do not execute a local or cloud training pipeline to update neural network weights.
              </span>
            </div>

            {/* Interactive Grid of Golden Samples */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {samples.map((item) => (
                <div
                  key={item.id}
                  data-rotation-deg={item.rotationDeg}
                  className="group relative bg-black border border-zinc-800 hover:border-[#00f0ff] p-2 transition-all flex flex-col items-center justify-center text-center"
                >
                  <div className="w-full aspect-square bg-black overflow-hidden flex items-center justify-center border border-zinc-800 mb-2 p-1">
                    <img
                      src={item.uri}
                      alt={item.label}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="w-full">
                    <div className="text-[10px] font-bold text-white truncate">{item.label}</div>
                    <div className="text-[9px] text-[#00f0ff] truncate">{item.angle}</div>
                  </div>
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#00f0ff]"></span>
                </div>
              ))}

              {/* Upload Placeholder Slot */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-800 hover:border-[#00f0ff] p-4 transition-colors flex flex-col items-center justify-center text-center text-zinc-500 hover:text-white min-h-[120px] bg-black"
              >
                <Plus className="w-5 h-5 mb-1 text-[#00f0ff]" />
                <span className="text-[10px] font-bold">[ADD REFERENCE VIEW]</span>
                <span className="text-[9px] text-zinc-600">IN-MEMORY CATALOG</span>
              </button>
            </div>

            {/* Normality Envelope Visualizer - Relabeled as synthetic demonstration */}
            <div className="p-3 bg-black border border-zinc-800 space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
                <span>[SYNTHETIC FEATURE DENSITY DEMO]</span>
                <span className="text-[#00f0ff]">SIMULATED DIVERGENCE: ~0.012 [BENCHMARK]</span>
              </div>
              <div className="h-10 w-full bg-black border border-zinc-800 flex items-center px-2 gap-1">
                {/* Procedural covariance bars */}
                {[94, 98, 92, 99, 96, 91, 95, 97, 93, 99, 94, 96, 92, 98, 95, 97].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end pb-0.5">
                    <div 
                      className="w-full bg-[#00f0ff] shadow-[0_0_4px_#00f0ff]"
                      style={{ height: `${val - 50}%` }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>Simulated feature cluster density</span>
                <span>Visual reference only (no active weights updated)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
