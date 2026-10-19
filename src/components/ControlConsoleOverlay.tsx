import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Settings2, 
  Sliders, 
  Activity, 
  ShieldCheck, 
  Terminal, 
  Zap, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Check, 
  Crosshair,
  Radio,
  Cpu
} from 'lucide-react';
import { industrialAudio } from '../utils/audio';
import { useUITheme } from '../context/ThemeContext';

interface ConsoleSettings {
  overlayActive: boolean;
  scanlines: boolean;
  crtNoise: boolean;
  crtFlicker: boolean;
  beamSweep: boolean;
  vignette: boolean;
  telemetryHud: boolean;
  cornerReticles: boolean;
  noiseOpacity: number; // 0.02 - 0.08
}

const DEFAULT_SETTINGS: ConsoleSettings = {
  overlayActive: true,
  scanlines: true,
  crtNoise: true,
  crtFlicker: true,
  beamSweep: true,
  vignette: true,
  telemetryHud: true,
  cornerReticles: true,
  noiseOpacity: 0.045,
};

export const ControlConsoleOverlay: React.FC = () => {
  const { theme } = useUITheme();
  const [settings, setSettings] = useState<ConsoleSettings>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('pnz_console_overlay_config');
        if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        // Fallback to default
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [timestamp, setTimestamp] = useState<string>('');
  const [frameCounter, setFrameCounter] = useState<number>(104820);
  const [fpsVal, setFpsVal] = useState<string>('59.94');
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync settings to localStorage
  const updateSetting = <K extends keyof ConsoleSettings>(key: K, value: ConsoleSettings[K]) => {
    industrialAudio.playClick();
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('pnz_console_overlay_config', JSON.stringify(next));
      }
      return next;
    });
  };

  const applyPreset = (preset: 'full' | 'clean' | 'off') => {
    industrialAudio.playPass();
    if (preset === 'full') {
      const next = { ...DEFAULT_SETTINGS, overlayActive: true };
      setSettings(next);
      localStorage.setItem('pnz_console_overlay_config', JSON.stringify(next));
    } else if (preset === 'clean') {
      const next: ConsoleSettings = {
        overlayActive: true,
        scanlines: false,
        crtNoise: false,
        crtFlicker: false,
        beamSweep: false,
        vignette: false,
        telemetryHud: true,
        cornerReticles: true,
        noiseOpacity: 0.02,
      };
      setSettings(next);
      localStorage.setItem('pnz_console_overlay_config', JSON.stringify(next));
    } else {
      const next = { ...settings, overlayActive: false };
      setSettings(next);
      localStorage.setItem('pnz_console_overlay_config', JSON.stringify(next));
    }
  };

  // Cursor tracking for real-time console coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // High precision time & frame counter loop
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const iso = now.toISOString().replace('T', ' ').replace('Z', '');
      setTimestamp(iso);
      setFrameCounter((prev) => (prev > 999999 ? 100000 : prev + 1));
      
      // Micro-jitter fps between 59.88 and 60.02
      const jitter = (59.88 + Math.random() * 0.18).toFixed(2);
      setFpsVal(jitter);
    }, 60);

    return () => clearInterval(timer);
  }, []);

  // CRT Phosphor Noise Canvas Generator (Ultra lightweight, runs ~15fps on tiny buffer)
  useEffect(() => {
    if (!settings.overlayActive || !settings.crtNoise) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 160;
    const height = 120;
    canvas.width = width;
    canvas.height = height;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    let animId: number;
    let lastTime = 0;

    const renderNoise = (time: number) => {
      // Throttle noise to ~18fps for authentic grain without high CPU
      if (time - lastTime > 55) {
        lastTime = time;
        for (let i = 0; i < data.length; i += 4) {
          const val = Math.random() > 0.48 ? (Math.random() * 255) | 0 : 0;
          data[i] = val;     // R
          data[i + 1] = val; // G
          data[i + 2] = val; // B
          data[i + 3] = val > 0 ? ((Math.random() * 110) | 0) : 0; // Alpha
        }
        ctx.putImageData(imgData, 0, 0);
      }
      animId = requestAnimationFrame(renderNoise);
    };

    animId = requestAnimationFrame(renderNoise);
    return () => cancelAnimationFrame(animId);
  }, [settings.overlayActive, settings.crtNoise]);

  // Color accents based on active theme
  const getAccentColor = () => {
    if (theme === 'amber') return '#ffb703';
    if (theme === 'emerald' || theme === 'cleanroom') return '#00ff66';
    return '#00f0ff';
  };

  const accentColor = getAccentColor();

  return (
    <>
      {/* Visual Overlay Layer (Strictly Pointer-Events-None) */}
      {settings.overlayActive && (
        <div 
          className={`fixed inset-0 z-40 pointer-events-none select-none overflow-hidden ${
            settings.crtFlicker ? 'crt-flicker-active' : ''
          }`}
          aria-hidden="true"
        >
          {/* CRT Curved Screen Vignette & Edge Shadow */}
          {settings.vignette && (
            <div className="absolute inset-0 crt-vignette-effect" />
          )}

          {/* CRT High-Density Scanline Raster Pattern */}
          {settings.scanlines && (
            <div className="absolute inset-0 crt-scanlines-pattern opacity-80" />
          )}

          {/* CRT Vertical Beam Sweep */}
          {settings.beamSweep && (
            <div className="absolute left-0 right-0 h-32 crt-beam-active bg-gradient-to-b from-transparent via-[#00f0ff]/10 to-transparent pointer-events-none" />
          )}

          {/* CRT Noise / Grain Canvas */}
          {settings.crtNoise && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover crt-noise-jitter"
              style={{
                opacity: settings.noiseOpacity,
                imageRendering: 'pixelated',
                mixBlendMode: 'screen',
              }}
            />
          )}

          {/* Technical Reticles in 4 Corners */}
          {settings.cornerReticles && (
            <>
              {/* Top-Left Reticle */}
              <div className="absolute top-2 left-2 flex flex-col gap-0.5 text-[9px] font-mono text-[#00f0ff]/70 tracking-widest">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
                  <span className="text-[8px] text-zinc-500 font-bold">POS_TL:0,0</span>
                </div>
                <div className="pl-3.5 text-[8px] text-zinc-600">SYS_CONSOLE::ONLINE</div>
              </div>

              {/* Top-Right Reticle */}
              <div className="absolute top-2 right-2 flex flex-col items-end gap-0.5 text-[9px] font-mono text-[#00f0ff]/70 tracking-widest">
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-zinc-500 font-bold">RASTER_V-SYNC::LOCK</span>
                  <div className="w-2.5 h-2.5 border-t-2 border-r-2 border-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
                </div>
                <div className="pr-3.5 text-[8px] text-zinc-600">{fpsVal} FPS // 31.47 kHz</div>
              </div>

              {/* Bottom-Left Reticle */}
              <div className="absolute bottom-2 left-2 flex flex-col gap-0.5 text-[9px] font-mono text-[#00f0ff]/70 tracking-widest">
                <div className="pl-3.5 text-[8px] text-zinc-600">AOI_EDGE_PIPELINE::INT8</div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 border-b-2 border-l-2 border-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
                  <span className="text-[8px] text-zinc-500 font-bold">FRAME_#{frameCounter}</span>
                </div>
              </div>

              {/* Bottom-Right Reticle */}
              <div className="absolute bottom-2 right-2 flex flex-col items-end gap-0.5 text-[9px] font-mono text-[#00f0ff]/70 tracking-widest hidden sm:flex">
                <div className="pr-3.5 text-[8px] text-zinc-600">LATENCY &lt;15MS // RING_64MB</div>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-zinc-500 font-bold">CALIB: ISO-2859</span>
                  <div className="w-2.5 h-2.5 border-b-2 border-r-2 border-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
                </div>
              </div>

              {/* Left Viewport Vertical Graduation Ruler */}
              <div className="hidden lg:flex absolute left-0 top-1/4 bottom-1/4 flex-col justify-between py-2 pl-0.5 text-[7px] text-zinc-700 font-mono select-none">
                <div className="flex items-center gap-1"><span className="w-1.5 h-[1px] bg-[#00f0ff]/40"></span><span>000</span></div>
                <div className="flex items-center gap-1"><span className="w-1 h-[1px] bg-zinc-800"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-[1px] bg-[#00f0ff]/40"></span><span>250</span></div>
                <div className="flex items-center gap-1"><span className="w-1 h-[1px] bg-zinc-800"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-[1px] bg-[#00f0ff]/40"></span><span>500</span></div>
                <div className="flex items-center gap-1"><span className="w-1 h-[1px] bg-zinc-800"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-[1px] bg-[#00f0ff]/40"></span><span>750</span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-[1px] bg-[#00f0ff]/40"></span><span>1000</span></div>
              </div>

              {/* Right Viewport Vertical Graduation Ruler */}
              <div className="hidden lg:flex absolute right-0 top-1/4 bottom-1/4 flex-col justify-between py-2 pr-0.5 text-[7px] text-zinc-700 font-mono select-none items-end">
                <div className="flex items-center gap-1"><span>Y-AXIS</span><span className="w-1.5 h-[1px] bg-[#00f0ff]/40"></span></div>
                <div className="flex items-center gap-1"><span className="w-1 h-[1px] bg-zinc-800"></span></div>
                <div className="flex items-center gap-1"><span>OPT-FOV</span><span className="w-1.5 h-[1px] bg-[#00f0ff]/40"></span></div>
                <div className="flex items-center gap-1"><span className="w-1 h-[1px] bg-zinc-800"></span></div>
                <div className="flex items-center gap-1"><span>STIGMA</span><span className="w-1.5 h-[1px] bg-[#00f0ff]/40"></span></div>
                <div className="flex items-center gap-1"><span className="w-1 h-[1px] bg-zinc-800"></span></div>
                <div className="flex items-center gap-1"><span>EO-LOCK</span><span className="w-1.5 h-[1px] bg-[#00f0ff]/40"></span></div>
              </div>
            </>
          )}

          {/* High-Density Monospaced Bottom Telemetry Strip */}
          {settings.telemetryHud && (
            <div className="hidden xl:flex absolute bottom-0 left-12 right-48 h-5 items-center justify-between px-3 bg-black/90 border-t border-zinc-900 text-[9px] font-mono text-zinc-500 tracking-wider">
              <div className="flex items-center gap-3">
                <span className="text-[#00f0ff] font-bold">[CRT_CONSOLE_OVERLAY]</span>
                <span className="text-zinc-600">//</span>
                <span>BEAM_HV: <strong className="text-zinc-300">24.8 kV</strong></span>
                <span className="text-zinc-600">//</span>
                <span>RETICLE_FOCUS: <strong className="text-zinc-300">0.942</strong></span>
                <span className="text-zinc-600">//</span>
                <span>RASTER_CLOCK: <strong className="text-cyan-400">{timestamp || '2026-10-19 07:41:12.482'}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span>CUR_POS: <strong className="text-emerald-400">X:{cursorPos.x.toString().padStart(4, '0')} Y:{cursorPos.y.toString().padStart(4, '0')}</strong></span>
                <span className="text-zinc-600">//</span>
                <span>IO_BUS: <strong className="text-amber-400">RS485_115K</strong></span>
                <span className="text-zinc-600">//</span>
                <span className="text-[#00ff66] font-bold">[NOMINAL_CALIBRATED]</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive HUD Control Console Widget (Always Clickable) */}
      <div className="fixed bottom-3 right-3 z-50 font-mono">
        {!isConfigOpen ? (
          <button
            onClick={() => {
              industrialAudio.playClick();
              setIsConfigOpen(true);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-black hover:bg-zinc-950 text-xs text-white border border-[#00f0ff]/60 hover:border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all"
            title="Configure Control Console Visual Overlay (CRT, Scanlines, Noise, Telemetry)"
          >
            <Tv className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <span className="text-zinc-400">[CONSOLE HUD]:</span>
              <span className={settings.overlayActive ? 'text-[#00ff66]' : 'text-zinc-500'}>
                {settings.overlayActive ? 'ON' : 'BYPASS'}
              </span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-black border border-[#00f0ff] shadow-[0_0_35px_rgba(0,240,255,0.35)] p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Corner Markers */}
            <div className="corner-marker-tl"></div>
            <div className="corner-marker-tr"></div>
            <div className="corner-marker-bl"></div>
            <div className="corner-marker-br"></div>

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-[#00f0ff]" />
                <div>
                  <h4 className="text-xs font-bold text-white tracking-widest uppercase">
                    CRT CONSOLE OVERLAY // CALIBRATION
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-mono">Industrial CRT & High-Density Telemetry</p>
                </div>
              </div>
              <button
                onClick={() => {
                  industrialAudio.playClick();
                  setIsConfigOpen(false);
                }}
                className="text-xs px-2 py-0.5 bg-black hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              >
                [CLOSE]
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Aesthetic Presets:</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => applyPreset('full')}
                  className={`px-2 py-1 text-[10px] font-bold border transition-all ${
                    settings.overlayActive && settings.scanlines && settings.crtNoise
                      ? 'bg-black text-[#00f0ff] border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                      : 'bg-black text-zinc-500 border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  MAX CRT
                </button>
                <button
                  onClick={() => applyPreset('clean')}
                  className={`px-2 py-1 text-[10px] font-bold border transition-all ${
                    settings.overlayActive && !settings.scanlines && !settings.crtNoise
                      ? 'bg-black text-[#00ff66] border-[#00ff66] shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                      : 'bg-black text-zinc-500 border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  CLEAN HUD
                </button>
                <button
                  onClick={() => applyPreset('off')}
                  className={`px-2 py-1 text-[10px] font-bold border transition-all ${
                    !settings.overlayActive
                      ? 'bg-black text-rose-400 border-rose-500'
                      : 'bg-black text-zinc-500 border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  OFF
                </button>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-2 pt-1 border-t border-zinc-900 text-xs">
              {/* Master Overlay Active */}
              <div className="flex items-center justify-between p-1.5 bg-zinc-950 border border-zinc-800">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5 text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  Master Overlay State
                </span>
                <button
                  onClick={() => updateSetting('overlayActive', !settings.overlayActive)}
                  className={`px-2 py-0.5 text-[10px] font-bold border ${
                    settings.overlayActive 
                      ? 'bg-black text-[#00ff66] border-[#00ff66]' 
                      : 'bg-black text-zinc-500 border-zinc-700'
                  }`}
                >
                  {settings.overlayActive ? '[ENABLED]' : '[BYPASSED]'}
                </button>
              </div>

              {/* Scanlines Toggle */}
              <div className="flex items-center justify-between p-1.5 bg-black border border-zinc-850">
                <span className="text-zinc-400 text-[11px]">Raster Scanlines (3px)</span>
                <button
                  disabled={!settings.overlayActive}
                  onClick={() => updateSetting('scanlines', !settings.scanlines)}
                  className={`px-2 py-0.5 text-[10px] font-bold border ${
                    settings.scanlines && settings.overlayActive
                      ? 'bg-black text-[#00f0ff] border-[#00f0ff]' 
                      : 'bg-black text-zinc-600 border-zinc-800'
                  }`}
                >
                  {settings.scanlines ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* CRT Noise Toggle & Slider */}
              <div className="p-1.5 bg-black border border-zinc-850 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-[11px]">Phosphor Grain / Noise</span>
                  <button
                    disabled={!settings.overlayActive}
                    onClick={() => updateSetting('crtNoise', !settings.crtNoise)}
                    className={`px-2 py-0.5 text-[10px] font-bold border ${
                      settings.crtNoise && settings.overlayActive
                        ? 'bg-black text-[#00f0ff] border-[#00f0ff]' 
                        : 'bg-black text-zinc-600 border-zinc-800'
                    }`}
                  >
                    {settings.crtNoise ? 'ON' : 'OFF'}
                  </button>
                </div>
                {settings.crtNoise && settings.overlayActive && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[9px] text-zinc-500">INTENSITY:</span>
                    <input 
                      type="range"
                      min="0.02"
                      max="0.09"
                      step="0.01"
                      value={settings.noiseOpacity}
                      onChange={(e) => updateSetting('noiseOpacity', parseFloat(e.target.value))}
                      className="w-full accent-[#00f0ff] h-1 bg-zinc-800 rounded-none cursor-pointer"
                    />
                    <span className="text-[9px] text-cyan-400 font-bold">{Math.round(settings.noiseOpacity * 1000)}%</span>
                  </div>
                )}
              </div>

              {/* CRT Micro-Flicker */}
              <div className="flex items-center justify-between p-1.5 bg-black border border-zinc-850">
                <span className="text-zinc-400 text-[11px]">Cathode Ray Micro-Flicker</span>
                <button
                  disabled={!settings.overlayActive}
                  onClick={() => updateSetting('crtFlicker', !settings.crtFlicker)}
                  className={`px-2 py-0.5 text-[10px] font-bold border ${
                    settings.crtFlicker && settings.overlayActive
                      ? 'bg-black text-[#00f0ff] border-[#00f0ff]' 
                      : 'bg-black text-zinc-600 border-zinc-800'
                  }`}
                >
                  {settings.crtFlicker ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* CRT Beam Sweep */}
              <div className="flex items-center justify-between p-1.5 bg-black border border-zinc-850">
                <span className="text-zinc-400 text-[11px]">Phosphor Sweep Beam</span>
                <button
                  disabled={!settings.overlayActive}
                  onClick={() => updateSetting('beamSweep', !settings.beamSweep)}
                  className={`px-2 py-0.5 text-[10px] font-bold border ${
                    settings.beamSweep && settings.overlayActive
                      ? 'bg-black text-[#00f0ff] border-[#00f0ff]' 
                      : 'bg-black text-zinc-600 border-zinc-800'
                  }`}
                >
                  {settings.beamSweep ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* CRT Vignette */}
              <div className="flex items-center justify-between p-1.5 bg-black border border-zinc-850">
                <span className="text-zinc-400 text-[11px]">Screen Vignette & Bezel</span>
                <button
                  disabled={!settings.overlayActive}
                  onClick={() => updateSetting('vignette', !settings.vignette)}
                  className={`px-2 py-0.5 text-[10px] font-bold border ${
                    settings.vignette && settings.overlayActive
                      ? 'bg-black text-[#00f0ff] border-[#00f0ff]' 
                      : 'bg-black text-zinc-600 border-zinc-800'
                  }`}
                >
                  {settings.vignette ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* High-Density Telemetry Readout */}
              <div className="flex items-center justify-between p-1.5 bg-black border border-zinc-850">
                <span className="text-zinc-400 text-[11px]">Edge Telemetry HUD</span>
                <button
                  disabled={!settings.overlayActive}
                  onClick={() => updateSetting('telemetryHud', !settings.telemetryHud)}
                  className={`px-2 py-0.5 text-[10px] font-bold border ${
                    settings.telemetryHud && settings.overlayActive
                      ? 'bg-black text-[#00f0ff] border-[#00f0ff]' 
                      : 'bg-black text-zinc-600 border-zinc-800'
                  }`}
                >
                  {settings.telemetryHud ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Real-Time Calibration Readout Box */}
            <div className="p-2 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 font-mono space-y-1">
              <div className="flex justify-between">
                <span>V-SYNC PHASE:</span>
                <span className="text-emerald-400 font-bold">0.00° [LOCKED]</span>
              </div>
              <div className="flex justify-between">
                <span>FRAME RATE:</span>
                <span className="text-cyan-400 font-bold">{fpsVal} FPS</span>
              </div>
              <div className="flex justify-between">
                <span>CURSOR COORD:</span>
                <span className="text-white font-bold">{cursorPos.x}px, {cursorPos.y}px</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
