import React, { useState } from 'react';
import { 
  Sparkles, 
  WifiOff, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Crosshair,
  Activity,
  DollarSign,
  Check
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

type HomeTab = 'dashboard' | 'telemetry' | 'architecture' | 'roi';

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartInspection,
  onLaunchJudgeDemo,
  isOffline,
  setIsOffline,
  activeProfile,
}) => {
  const [activeHomeTab, setActiveHomeTab] = useState<HomeTab>('dashboard');
  const previewGear = `data:image/svg+xml;utf8,${encodeURIComponent(generateGearSvg('NORMAL'))}`;

  const handleTabChange = (tab: HomeTab) => {
    industrialAudio.playClick();
    setActiveHomeTab(tab);
  };

  const tabs: Array<{ id: HomeTab; label: string; icon: any; short: string }> = [
    { id: 'dashboard', label: 'Dashboard & Launch', icon: Crosshair, short: '01. DASHBOARD' },
    { id: 'telemetry', label: 'System Telemetry', icon: Activity, short: '02. TELEMETRY' },
    { id: 'architecture', label: 'Core Architecture', icon: Layers, short: '03. ARCHITECTURE' },
    { id: 'roi', label: 'MSME ROI & Impact', icon: DollarSign, short: '04. MSME ROI' },
  ];

  return (
    <div className="space-y-5 pb-16 font-mono">
      {/* High-Density User-Friendly Home Screen Tab Navigation Bar */}
      <div className="relative bg-black border border-cyan-500/60 p-2 shadow-[0_0_20px_rgba(0,240,255,0.12)]">
        <div className="corner-marker-tl"></div>
        <div className="corner-marker-tr"></div>
        <div className="corner-marker-bl"></div>
        <div className="corner-marker-br"></div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Section Indicator */}
          <div className="flex items-center gap-2 px-2 text-xs font-bold text-[#00f0ff]">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
            <span className="hidden sm:inline">[COMMAND CONSOLE]:</span>
            <span className="text-zinc-400 text-[11px]">SELECT CONSOLE VIEW</span>
          </div>

          {/* Interactive Tab Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeHomeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider transition-all border ${
                    isActive
                      ? 'bg-black text-[#00f0ff] border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : 'bg-black text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00f0ff]' : 'text-zinc-500'}`} />
                  <span className="text-[11px] font-bold">{tab.short}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DASHBOARD & QUICK LAUNCH (Compact, punchy, zero wall-of-text)     */}
      {/* ========================================================================= */}
      {activeHomeTab === 'dashboard' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <section className="relative overflow-hidden bg-black border border-cyan-500/60 p-5 md:p-7 console-grid shadow-[0_0_35px_rgba(0,240,255,0.12)]">
            <div className="corner-marker-tl"></div>
            <div className="corner-marker-tr"></div>
            <div className="corner-marker-bl"></div>
            <div className="corner-marker-br"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Compact Brand & Direct Actions */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-black border border-cyan-400 text-[#00f0ff] font-bold text-[10px] tracking-widest shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                    [ZERO-SHOT AOI v2.4]
                  </span>
                  <span className="px-2 py-0.5 bg-black border border-zinc-800 text-zinc-400 text-[10px]">
                    TARGET: MSME QUALITY TRACK
                  </span>
                </div>

                <div className="space-y-1">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
                    PULSENET<span className="text-[#00f0ff] neon-text-cyan">-ZERO</span>
                  </h1>
                  <p className="text-base sm:text-lg font-bold text-zinc-300">
                    AI Visual Inspection for the Small Factory
                  </p>
                </div>

                {/* Compact Scannable Spec Badges (Replaces long paragraphs of theory) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2 bg-black border border-cyan-500/40">
                    <div className="text-[10px] text-zinc-500 font-bold">HARDWARE CAPEX</div>
                    <div className="text-sm font-bold text-[#00f0ff] mt-0.5">$0 (USB Cam)</div>
                  </div>
                  <div className="p-2 bg-black border border-emerald-500/40">
                    <div className="text-[10px] text-zinc-500 font-bold">GOLDEN SAMPLES</div>
                    <div className="text-sm font-bold text-[#00ff66] mt-0.5">8 Normal Only</div>
                  </div>
                  <div className="p-2 bg-black border border-amber-500/40">
                    <div className="text-[10px] text-zinc-500 font-bold">EDGE LATENCY</div>
                    <div className="text-sm font-bold text-[#ffb703] mt-0.5">&lt; 15ms Target</div>
                  </div>
                  <div className="p-2 bg-black border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 font-bold">CONNECTIVITY</div>
                    <div className="text-sm font-bold text-white mt-0.5">Offline Ready</div>
                  </div>
                </div>

                {/* Primary User-Friendly CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      industrialAudio.playClick();
                      onStartInspection();
                    }}
                    className="flex items-center gap-2.5 px-5 py-2.5 bg-[#00f0ff] hover:bg-cyan-300 text-black font-black text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.45)] group"
                  >
                    <span>[START INSPECTION]</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[3]" />
                  </button>

                  <button
                    onClick={() => {
                      industrialAudio.playAlert();
                      onLaunchJudgeDemo();
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-zinc-900 text-[#ffb703] border border-[#ffb703] font-bold text-xs tracking-wider transition-all shadow-[0_0_12px_rgba(255,183,3,0.3)]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#ffb703]" />
                    <span>[JUDGE DEMO]</span>
                  </button>
                </div>

                {/* Quick sub-tab shortcuts */}
                <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px] text-zinc-400">
                  <span className="text-zinc-600">// JUMP TO:</span>
                  <button 
                    onClick={() => handleTabChange('telemetry')} 
                    className="hover:text-[#00f0ff] underline underline-offset-2"
                  >
                    System Telemetry →
                  </button>
                  <span className="text-zinc-700">•</span>
                  <button 
                    onClick={() => handleTabChange('architecture')} 
                    className="hover:text-[#00f0ff] underline underline-offset-2"
                  >
                    Core Architecture →
                  </button>
                  <span className="text-zinc-700">•</span>
                  <button 
                    onClick={() => handleTabChange('roi')} 
                    className="hover:text-[#00f0ff] underline underline-offset-2"
                  >
                    MSME ROI & Impact →
                  </button>
                </div>
              </div>

              {/* Right Column: Specimen Viewer & Live Status */}
              <div className="lg:col-span-5 space-y-3">
                <div className="relative bg-black border border-cyan-400/80 p-3 overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                  <div className="corner-marker-tl"></div>
                  <div className="corner-marker-tr"></div>
                  <div className="corner-marker-bl"></div>
                  <div className="corner-marker-br"></div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-300 px-1 pb-1.5 border-b border-zinc-800">
                    <span className="flex items-center gap-1 text-[#00f0ff] font-bold">
                      <Crosshair className="w-3 h-3" />
                      OPTICAL SPECIMEN SENSOR
                    </span>
                    <span className="text-amber-400 font-bold">&lt;15MS TARGET SPEC</span>
                  </div>

                  <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center my-2 border border-zinc-900">
                    <img 
                      src={previewGear} 
                      alt="Precision Gear Preview" 
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border border-cyan-400/25"></div>
                      <div className="w-48 h-48 rounded-full border border-cyan-400/15"></div>
                    </div>
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#00f0ff]/15 to-transparent h-12 animate-scanline"></div>
                  </div>

                  <div className="bg-black border border-emerald-500/80 p-2 flex items-center justify-between text-xs shadow-[0_0_10px_rgba(0,255,102,0.15)]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66]" />
                      <span className="text-[#00ff66] font-bold text-[11px]">[GOLDEN SPECIMEN MATCH]</span>
                    </div>
                    <span className="text-white font-bold text-[11px]">98.4% CONF</span>
                  </div>
                </div>

                {/* Compact Engine Status Bar */}
                <div className="p-3 bg-black border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-[10px]">[PROFILE]:</span>
                    <span className="text-white font-bold text-xs truncate max-w-[140px]">{activeProfile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <OnlineOfflineToggle isOffline={isOffline} setIsOffline={setIsOffline} compact />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SYSTEM TELEMETRY & RESOURCES (Separated into clean tab)            */}
      {/* ========================================================================= */}
      {activeHomeTab === 'telemetry' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <h2 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#00f0ff]" />
                [SYSTEM TELEMETRY & HARDWARE RESOURCE MONITOR]
              </h2>
              <p className="text-[10px] text-zinc-400">Live edge NPU/GPU load, memory ring buffer, and optical sensor diagnostics.</p>
            </div>
            <span className="text-[10px] text-[#00ff66] border border-[#00ff66] px-2 py-0.5 font-bold">
              ● REAL-TIME STREAMING
            </span>
          </div>

          <SystemResourceMonitor isOffline={isOffline} />

          <div className="p-3 bg-black border border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400 text-[11px]">Proposed architecture: on-device WebAssembly/WebGPU runtime (Currently simulated demo).</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleTabChange('dashboard')}
                className="px-2.5 py-1 bg-black border border-zinc-700 hover:border-[#00f0ff] text-zinc-300 text-[10px] font-bold"
              >
                ← Return to Dashboard
              </button>
              <button
                onClick={() => handleTabChange('architecture')}
                className="px-2.5 py-1 bg-black border border-[#00f0ff] text-[#00f0ff] text-[10px] font-bold"
              >
                View Architecture Pillars →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CORE ARCHITECTURE PILLARS (Reduced theory, concise scannable cards) */}
      {/* ========================================================================= */}
      {activeHomeTab === 'architecture' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <h2 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#00f0ff]" />
                [ARCHITECTURE MATRIX // THREE CORE PILLARS]
              </h2>
              <p className="text-[10px] text-zinc-400">Core engineering breakthroughs enabling zero-shot quality inspection.</p>
            </div>
            <span className="text-[10px] text-zinc-400 border border-zinc-800 px-2 py-0.5">
              SPEC: ZERO-SHOT v2.4
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1 */}
            <div className="relative bg-black border border-cyan-500/60 p-4 space-y-3 shadow-[0_0_15px_rgba(0,240,255,0.08)]">
              <div className="corner-marker-tl"></div>
              <div className="corner-marker-tr"></div>
              <div className="corner-marker-bl"></div>
              <div className="corner-marker-br"></div>

              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-black border border-cyan-400 flex items-center justify-center text-[#00f0ff]">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-cyan-400 font-bold border border-cyan-500/40 px-1.5 py-0.5">
                  PILLAR 01
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase">LOW-DATA AI</h3>
                <p className="text-xs text-zinc-300 mt-1">Visual reference library: 8 deterministic orientation views for operator inspection.</p>
              </div>
              <ul className="text-[11px] text-zinc-400 space-y-1 border-t border-zinc-900 pt-2">
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3 h-3 text-[#00f0ff]" /> 8 samples needed (vs 5,000+ defect photos)
                </li>
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3 h-3 text-[#00f0ff]" /> Ready for custom 50-piece job-shop runs
                </li>
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3 h-3 text-[#00f0ff]" /> Direct CAD envelope alignment
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="relative bg-black border border-emerald-500/60 p-4 space-y-3 shadow-[0_0_15px_rgba(0,255,102,0.08)]">
              <div className="corner-marker-tl"></div>
              <div className="corner-marker-tr"></div>
              <div className="corner-marker-bl"></div>
              <div className="corner-marker-br"></div>

              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-black border border-emerald-400 flex items-center justify-center text-[#00ff66]">
                  <WifiOff className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-emerald-400 font-bold border border-emerald-500/40 px-1.5 py-0.5">
                  PILLAR 02
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase">EDGE-FIRST</h3>
                <p className="text-xs text-zinc-300 mt-1">Zero cloud requirement. Local inference protects CAD secrets and works offline.</p>
              </div>
              <ul className="text-[11px] text-zinc-400 space-y-1 border-t border-zinc-900 pt-2">
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3 h-3 text-[#00ff66]" /> Sub-15ms latency target (Specification)
                </li>
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3 h-3 text-[#00ff66]" /> Zero cloud packet transmission
                </li>
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3 h-3 text-[#00ff66]" /> Uninterrupted workshop operation
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="relative bg-black border border-amber-500/60 p-4 space-y-3 shadow-[0_0_15px_rgba(255,183,3,0.08)]">
              <div className="corner-marker-tl"></div>
              <div className="corner-marker-tr"></div>
              <div className="corner-marker-bl"></div>
              <div className="corner-marker-br"></div>

              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-black border border-amber-400 flex items-center justify-center text-[#ffb703]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-amber-400 font-bold border border-amber-500/40 px-1.5 py-0.5">
                  PILLAR 03
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase">ADAPTIVE</h3>
                <p className="text-xs text-zinc-300 mt-1">1-click defect absorption. Teach unknown anomalies on-the-fly without downtime.</p>
              </div>
              <ul className="text-[11px] text-zinc-400 space-y-1 border-t border-zinc-900 pt-2">
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3 h-3 text-[#ffb703]" /> Instant operator classification
                </li>
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3 h-3 text-[#ffb703]" /> Zero model retraining lag
                </li>
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3 h-3 text-[#ffb703]" /> Zero data scientists required
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => handleTabChange('dashboard')}
              className="px-3 py-1 bg-black border border-zinc-700 hover:border-[#00f0ff] text-zinc-300 text-xs font-bold"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => handleTabChange('roi')}
              className="px-3 py-1 bg-black border border-[#00f0ff] text-[#00f0ff] text-xs font-bold"
            >
              Next: MSME ROI & Impact →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MSME ROI & FACTORY REALITY (Clean comparative matrix)              */}
      {/* ========================================================================= */}
      {activeHomeTab === 'roi' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <h2 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#00f0ff]" />
                [MSME ROI & ECONOMIC DISPARITY RESOLUTION]
              </h2>
              <p className="text-[10px] text-zinc-400">Democratizing automated optical inspection for tier-2/3 machine workshops.</p>
            </div>
            <span className="text-[10px] text-[#00ff66] border border-[#00ff66] px-2 py-0.5 font-bold">
              100% OPEX/CAPEX SAVINGS
            </span>
          </div>

          {/* Side-by-Side Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Traditional AOI */}
            <div className="p-4 bg-black border border-rose-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                <span>[TRADITIONAL INDUSTRIAL AOI]</span>
                <span>LEGACY</span>
              </div>
              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span>Hardware CapEx:</span>
                  <span className="text-rose-400 font-bold">$10,000 — $50,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span>Training Data:</span>
                  <span className="text-rose-400 font-bold">5,000+ Defect Photos</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span>Deployment Time:</span>
                  <span className="text-zinc-300 font-bold">2 — 6 Weeks</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span>Expertise Needed:</span>
                  <span className="text-zinc-300 font-bold">Machine Vision Specialist</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Cloud Reliance:</span>
                  <span className="text-rose-400 font-bold">Mandatory (Vulnerable)</span>
                </div>
              </div>
            </div>

            {/* PulseNet-Zero */}
            <div className="p-4 bg-black border border-cyan-400 space-y-3 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <div className="flex items-center justify-between text-xs font-bold text-[#00f0ff]">
                <span>[PULSENET-ZERO]</span>
                <span className="text-[#00ff66]">MSME OPTIMIZED</span>
              </div>
              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span>Hardware CapEx:</span>
                  <span className="text-[#00f0ff] font-bold">$0 (Standard USB/Webcam)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span>Training Data:</span>
                  <span className="text-[#00ff66] font-bold">8 Good Parts Only</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span>Deployment Time:</span>
                  <span className="text-[#00f0ff] font-bold">&lt; 5 Minutes</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span>Expertise Needed:</span>
                  <span className="text-[#00ff66] font-bold">Line Operator</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Cloud Reliance:</span>
                  <span className="text-[#00ff66] font-bold">100% Offline Capable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-black border border-cyan-400">
              <div className="text-2xl font-black text-[#00f0ff]">$0</div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold mt-0.5">CAPEX REQUIRED</div>
            </div>
            <div className="p-3 bg-black border border-emerald-400">
              <div className="text-2xl font-black text-[#00ff66]">&lt;15ms</div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold mt-0.5">TARGET SPEC LATENCY</div>
            </div>
            <div className="p-3 bg-black border border-amber-400">
              <div className="text-2xl font-black text-[#ffb703]">8</div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold mt-0.5">SAMPLES NEEDED</div>
            </div>
            <div className="p-3 bg-black border border-zinc-700">
              <div className="text-2xl font-black text-white">99.2%</div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold mt-0.5">DEFECT SENSITIVITY</div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => handleTabChange('architecture')}
              className="px-3 py-1 bg-black border border-zinc-700 hover:border-[#00f0ff] text-zinc-300 text-xs font-bold"
            >
              ← Back to Architecture
            </button>
            <button
              onClick={() => {
                industrialAudio.playClick();
                onStartInspection();
              }}
              className="px-4 py-1.5 bg-[#00f0ff] hover:bg-cyan-300 text-black text-xs font-black"
            >
              [LAUNCH INSPECTION NOW] →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
