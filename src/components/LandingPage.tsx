import React from 'react';
import { 
  Play, 
  Sparkles, 
  Cpu, 
  WifiOff, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Crosshair,
  Gauge,
  Zap,
  Terminal,
  Activity
} from 'lucide-react';
import { industrialAudio } from '../utils/audio';
import { generateGearSvg } from '../utils/partSVGs';
import { SystemResourceMonitor } from './SystemResourceMonitor';
import { OnlineOfflineToggle } from './OnlineOfflineToggle';

interface LandingPageProps {
  onStartInspection: () => void;
  onLaunchJudgeDemo: () => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  activeProfile: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartInspection,
  onLaunchJudgeDemo,
  isOffline,
  setIsOffline,
  activeProfile,
}) => {
  const previewGear = `data:image/svg+xml;utf8,${encodeURIComponent(generateGearSvg('NORMAL'))}`;

  return (
    <div className="space-y-10 pb-16 font-mono">
      {/* Hero Section — Stark Control Console */}
      <section className="relative overflow-hidden rounded-lg bg-black border border-cyan-500/50 p-6 md:p-10 console-grid shadow-[0_0_50px_rgba(0,240,255,0.12)]">
        {/* Technical Corner Brackets */}
        <div className="corner-marker-tl"></div>
        <div className="corner-marker-tr"></div>
        <div className="corner-marker-bl"></div>
        <div className="corner-marker-br"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand & Copy */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-black border border-cyan-400 text-xs font-mono text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
              <span className="font-bold tracking-widest">[ZERO-SHOT OPTICAL ANOMALY ENGINE // v2.4]</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase font-mono">
                PULSENET<span className="text-[#00f0ff] neon-text-cyan">-ZERO</span>
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-slate-100 font-mono tracking-wide">
                AI Quality Inspection for the Small Factory
              </p>
              <div className="inline-block px-3 py-1 rounded-sm bg-black border border-cyan-500/80 text-[#00f0ff] text-xs font-bold tracking-wider">
                &ldquo;AFFORDABLE. DATA-EFFICIENT. OFFLINE-READY.&rdquo;
              </div>
            </div>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed font-mono">
              Traditional AOI setups cost $10,000+ and require massive defect photo datasets. 
              <span className="text-white font-bold"> PulseNet-Zero</span> operates on consumer webcams, learns normality from 8 golden samples, and executes zero-shot edge inference in under 15ms.
            </p>

            <div className="border-l-2 border-[#00f0ff] pl-3 py-1 text-xs text-cyan-200 bg-cyan-950/20 font-mono">
              &gt;&gt; &ldquo;Learn from what you have — not what you don&apos;t.&rdquo;
            </div>

            {/* High-Contrast CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  industrialAudio.playClick();
                  onStartInspection();
                }}
                className="flex items-center gap-3 px-6 py-3 rounded bg-[#00f0ff] hover:bg-cyan-300 text-black font-black font-mono tracking-widest transition-all shadow-[0_0_25px_rgba(0,240,255,0.5)] group"
              >
                <span>[START INSPECTION]</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[3]" />
              </button>

              <button
                onClick={() => {
                  industrialAudio.playAlert();
                  onLaunchJudgeDemo();
                }}
                className="flex items-center gap-3 px-6 py-3 rounded bg-black hover:bg-slate-900 text-amber-300 border border-amber-400 font-bold font-mono tracking-widest transition-all shadow-[0_0_15px_rgba(255,183,3,0.3)]"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>[JUDGE DEMO]</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Interactive Specimen Preview & System Status */}
          <div className="lg:col-span-5 space-y-4">
            {/* Specimen Viewer Frame */}
            <div className="relative rounded bg-black border border-cyan-400/80 p-3 overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.15)]">
              {/* Corner brackets */}
              <div className="corner-marker-tl"></div>
              <div className="corner-marker-tr"></div>
              <div className="corner-marker-bl"></div>
              <div className="corner-marker-br"></div>

              {/* Header HUD */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 px-2 pb-2 border-b border-cyan-900/60">
                <span className="flex items-center gap-1 text-[#00f0ff] font-bold">
                  <Crosshair className="w-3.5 h-3.5" />
                  OPTICAL SENSOR FEED // FOV: 120MM
                </span>
                <span className="text-[#00ff66] font-bold">60.0 FPS // 12.4MS</span>
              </div>

              {/* Part Visualizer */}
              <div className="relative aspect-square w-full rounded-sm bg-black overflow-hidden flex items-center justify-center my-2 border border-cyan-950">
                <img 
                  src={previewGear} 
                  alt="Precision Gear Preview" 
                  className="w-full h-full object-contain p-2"
                />
                {/* Simulated Radar Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border border-cyan-400/30"></div>
                  <div className="w-64 h-64 rounded-full border border-cyan-400/20"></div>
                </div>
                {/* Scanline */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#00f0ff]/20 to-transparent h-16 animate-scanline"></div>
              </div>

              {/* Status footer pill */}
              <div className="bg-black border border-emerald-500/80 rounded p-2.5 flex items-center justify-between text-xs font-mono shadow-[0_0_12px_rgba(0,255,102,0.2)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  <span className="text-[#00ff66] font-bold">[GOLDEN SPECIMEN MATCH]</span>
                </div>
                <span className="text-white font-bold">98.4% CONF</span>
              </div>
            </div>

            {/* System Status Panel (High-Contrast Technical) */}
            <div className="relative rounded bg-black border border-cyan-500/60 p-4 space-y-3 font-mono shadow-[0_0_20px_rgba(0,240,255,0.1)]">
              <div className="corner-marker-tl"></div>
              <div className="corner-marker-tr"></div>
              <div className="corner-marker-bl"></div>
              <div className="corner-marker-br"></div>

              <div className="text-xs text-[#00f0ff] uppercase tracking-widest font-bold border-b border-cyan-900/80 pb-1 flex items-center justify-between">
                <span>[SYSTEM TELEMETRY CONSOLE]</span>
                <Activity className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded bg-black border border-emerald-500/60">
                  <div className="text-[10px] text-slate-400 mb-0.5">ENGINE STATUS</div>
                  <div className="flex items-center gap-1.5 text-[#00ff66] font-black">
                    <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse"></span>
                    READY
                  </div>
                </div>

                <div className="p-2.5 rounded bg-black border border-cyan-500/60">
                  <div className="text-[10px] text-slate-400 mb-0.5">PIPELINE</div>
                  <div className={`font-black ${isOffline ? 'text-[#ffb703]' : 'text-[#00f0ff]'}`}>
                    {isOffline ? 'EDGE / WASM' : 'HYBRID GEMINI'}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-black border border-slate-700">
                  <div className="text-[10px] text-slate-400 mb-0.5">ACTIVE PROFILE</div>
                  <div className="text-white font-bold truncate">
                    GEAR-M12
                  </div>
                </div>
              </div>

              {/* In-place Online / Offline Mode Switcher */}
              <div className="pt-2 border-t border-cyan-900/60">
                <OnlineOfflineToggle isOffline={isOffline} setIsOffline={setIsOffline} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time System Resource Monitor Widget (GPU/NPU, Thermal, Buffer) */}
      <section>
        <SystemResourceMonitor isOffline={isOffline} />
      </section>

      {/* Three Core Feature Cards (High-Contrast Neon Wireframes) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#00f0ff] font-bold">
            // ARCHITECTURE MATRIX // CORE PILLARS
          </h2>
          <span className="text-xs font-mono text-[#00ff66] font-bold">[ZERO-SHOT ADVANTAGE ACTIVE]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: LOW-DATA AI */}
          <div className="group relative rounded bg-black border border-cyan-500/60 hover:border-[#00f0ff] p-6 space-y-4 shadow-[0_0_15px_rgba(0,240,255,0.08)] hover:shadow-[0_0_25px_rgba(0,240,255,0.25)] transition-all">
            <div className="corner-marker-tl"></div>
            <div className="corner-marker-tr"></div>
            <div className="corner-marker-bl"></div>
            <div className="corner-marker-br"></div>

            <div className="w-10 h-10 rounded bg-black border border-cyan-400 flex items-center justify-center text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.4)]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">[PILLAR 01]</div>
              <h3 className="text-lg font-black text-white font-mono tracking-wide uppercase mt-0.5">
                LOW-DATA AI
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-mono">
                Learns standard part geometry from 8 golden samples. Micro-MSMEs produce small batches and possess zero historical defect databases.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-[#00f0ff] font-bold flex items-center gap-1">
              <span>&gt;&gt; 8 SAMPLES NEEDED</span>
            </div>
          </div>

          {/* Card 2: EDGE-FIRST */}
          <div className="group relative rounded bg-black border border-emerald-500/60 hover:border-[#00ff66] p-6 space-y-4 shadow-[0_0_15px_rgba(0,255,102,0.08)] hover:shadow-[0_0_25px_rgba(0,255,102,0.25)] transition-all">
            <div className="corner-marker-tl"></div>
            <div className="corner-marker-tr"></div>
            <div className="corner-marker-bl"></div>
            <div className="corner-marker-br"></div>

            <div className="w-10 h-10 rounded bg-black border border-emerald-400 flex items-center justify-center text-[#00ff66] shadow-[0_0_10px_rgba(0,255,102,0.4)]">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">[PILLAR 02]</div>
              <h3 className="text-lg font-black text-white font-mono tracking-wide uppercase mt-0.5">
                EDGE-FIRST
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-mono">
                Zero cloud reliance. Sub-15ms local WebGPU/Wasm frame inference protects workshop CAD secrecy and survives internet dropouts.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-[#00ff66] font-bold flex items-center gap-1">
              <span>&gt;&gt; &lt;15MS EVALUATION</span>
            </div>
          </div>

          {/* Card 3: ADAPTIVE */}
          <div className="group relative rounded bg-black border border-amber-500/60 hover:border-[#ffb703] p-6 space-y-4 shadow-[0_0_15px_rgba(255,183,3,0.08)] hover:shadow-[0_0_25px_rgba(255,183,3,0.25)] transition-all">
            <div className="corner-marker-tl"></div>
            <div className="corner-marker-tr"></div>
            <div className="corner-marker-bl"></div>
            <div className="corner-marker-br"></div>

            <div className="w-10 h-10 rounded bg-black border border-amber-400 flex items-center justify-center text-[#ffb703] shadow-[0_0_10px_rgba(255,183,3,0.4)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">[PILLAR 03]</div>
              <h3 className="text-lg font-black text-white font-mono tracking-wide uppercase mt-0.5">
                ADAPTIVE
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-mono">
                Teach the system new defect classes on-the-fly. Operator identifies an unknown anomaly and the edge model registers it in 1-click.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-[#ffb703] font-bold flex items-center gap-1">
              <span>&gt;&gt; ZERO RETRAINING LAG</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Small Factory Reality Callout — Stark Technical Frame */}
      <section className="relative rounded bg-black border border-cyan-500/70 p-6 md:p-8 console-grid shadow-[0_0_30px_rgba(0,240,255,0.15)]">
        <div className="corner-marker-tl"></div>
        <div className="corner-marker-tr"></div>
        <div className="corner-marker-bl"></div>
        <div className="corner-marker-br"></div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest font-bold">
              // DISRUPTIVE ECONOMIC DISPARITY RESOLUTION
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-white uppercase font-mono">
              &ldquo;Traditional machine vision is built for factories that have money and data. PulseNet-Zero is built for factories that don&apos;t.&rdquo;
            </h4>
            <p className="text-xs text-slate-300 font-mono">
              Solves the Micro-SME Quality Paradox with $0 hardware CapEx, sub-15ms edge inference, and synthetic CAD perturbation.
            </p>
          </div>
          <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
            <div className="p-3 rounded bg-black border border-cyan-400 text-center font-mono shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <div className="text-3xl font-black text-[#00f0ff]">$0</div>
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">HARDWARE CAPEX</div>
            </div>
            <div className="p-3 rounded bg-black border border-emerald-400 text-center font-mono shadow-[0_0_12px_rgba(0,255,102,0.3)]">
              <div className="text-3xl font-black text-[#00ff66]">&lt; 15 MS</div>
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">FRAME EVALUATION</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

