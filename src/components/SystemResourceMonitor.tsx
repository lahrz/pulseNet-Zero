import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Thermometer, 
  Activity, 
  HardDrive, 
  Zap, 
  RotateCcw, 
  Flame, 
  ShieldCheck, 
  Gauge, 
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { industrialAudio } from '../utils/audio';

interface SystemResourceMonitorProps {
  isOffline?: boolean;
}

export const SystemResourceMonitor: React.FC<SystemResourceMonitorProps> = ({ isOffline = false }) => {
  // Live hardware metrics
  const [gpuLoad, setGpuLoad] = useState<number>(42);
  const [thermalTemp, setThermalTemp] = useState<number>(43.2);
  const [bufferHealth, setBufferHealth] = useState<number>(99.8);
  const [bufferQueue, setBufferQueue] = useState<number>(0);
  const [historyTicks, setHistoryTicks] = useState<number[]>([38, 41, 40, 44, 42, 45, 41, 43, 42, 44, 41, 43]);
  const [isStressTesting, setIsStressTesting] = useState<boolean>(false);
  const stressTimerRef = useRef<any>(null);

  // Background tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isStressTesting) return;

      // Realistic minor thermal and load oscillations
      setGpuLoad((prev) => {
        const delta = (Math.random() - 0.5) * 4;
        const next = Math.max(34, Math.min(52, prev + delta));
        setHistoryTicks((h) => [...h.slice(1), Math.round(next)]);
        return parseFloat(next.toFixed(1));
      });

      setThermalTemp((prev) => {
        const delta = (Math.random() - 0.5) * 0.4;
        return parseFloat(Math.max(41.0, Math.min(46.0, prev + delta)).toFixed(1));
      });

      setBufferHealth((prev) => {
        const delta = (Math.random() - 0.5) * 0.2;
        return parseFloat(Math.max(99.4, Math.min(100, prev + delta)).toFixed(1));
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isStressTesting]);

  // Handle Stress Test
  const handleTriggerStressTest = () => {
    industrialAudio.playAlert();
    setIsStressTesting(true);

    // Ramp up load
    setGpuLoad(88.4);
    setThermalTemp(49.8);
    setBufferQueue(8);
    setBufferHealth(97.2);
    setHistoryTicks((h) => [...h.slice(4), 65, 78, 88, 92]);

    stressTimerRef.current = setTimeout(() => {
      // Return to nominal
      setGpuLoad(44.2);
      setThermalTemp(44.1);
      setBufferQueue(0);
      setBufferHealth(99.9);
      setIsStressTesting(false);
      industrialAudio.playPass();
    }, 3200);
  };

  const maxTemp = 85.0; // Throttle limit
  const thermalHeadroom = (maxTemp - thermalTemp).toFixed(1);

  return (
    <div className="relative bg-black border border-[#00f0ff]/60 p-5 sm:p-6 font-mono space-y-5 shadow-[0_0_25px_rgba(0,240,255,0.12)]">
      {/* Precision Reticle Corner Markers */}
      <div className="corner-marker-tl"></div>
      <div className="corner-marker-tr"></div>
      <div className="corner-marker-bl"></div>
      <div className="corner-marker-br"></div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#00f0ff] font-bold">
            <Activity className="w-4 h-4 text-[#00f0ff]" />
            <span>[HARDWARE_TELEMETRY // BUS_SPEED: 8.0 GT/s]</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider mt-0.5">
            SYSTEM RESOURCE MONITOR
          </h3>
          <p className="text-xs text-zinc-400">
            Real-time NPU tensor cores, junction thermal headroom, and edge inference ring-buffer health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 bg-black border border-[#00ff66] text-[#00ff66] text-xs font-bold flex items-center gap-2 shadow-[0_0_10px_rgba(0,255,102,0.25)]">
            <span className="w-1.5 h-1.5 bg-[#00ff66] animate-ping"></span>
            <span>{isStressTesting ? '[LOAD_SATURATED]' : '[PIPELINE_NOMINAL]'}</span>
          </div>

          <button
            onClick={handleTriggerStressTest}
            disabled={isStressTesting}
            className={`px-3 py-1 border text-xs font-bold transition-all flex items-center gap-1.5 ${
              isStressTesting
                ? 'bg-black text-[#ffb703] border-[#ffb703] animate-pulse shadow-[0_0_15px_rgba(255,183,3,0.3)]'
                : 'bg-black hover:bg-zinc-900 text-[#00f0ff] border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#ffb703]" />
            <span>{isStressTesting ? '[BURST_TESTING...]' : '[BURST 100 FPS]'}</span>
          </button>
        </div>
      </div>

      {/* Primary 3 Metric Gauges (GPU/NPU, Thermal, Buffer) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: GPU/NPU Utilization */}
        <div className="p-4 bg-black border border-zinc-800 hover:border-[#00f0ff]/80 transition-colors space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#00f0ff]" />
              GPU / NPU COMPUTE LOAD
            </span>
            <span className="text-[10px] text-[#00f0ff]">[WGSL_V1]</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-white tabular-nums tracking-tight">
              {gpuLoad}%
            </div>
            <span className={`text-[10px] font-bold ${
              gpuLoad > 75 ? 'text-[#ffb703]' : 'text-[#00ff66]'
            }`}>
              {gpuLoad > 75 ? '[HIGH_WORKLOAD]' : '[SUB-15MS INFERENCE]'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                gpuLoad > 75 
                  ? 'bg-[#ffb703] shadow-[0_0_8px_#ffb703]' 
                  : 'bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]'
              }`}
              style={{ width: `${gpuLoad}%` }}
            ></div>
          </div>

          {/* Real-Time Sparkline */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] text-zinc-500 flex justify-between font-mono">
              <span>LOAD HISTORY (LAST 15s)</span>
              <span className="text-zinc-400">128 SHADER LANES</span>
            </div>
            <div className="h-7 flex items-end gap-1 px-1 bg-black border border-zinc-800">
              {historyTicks.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end h-full">
                  <div 
                    className="w-full bg-[#00f0ff] transition-all duration-200"
                    style={{ height: `${(val / 100) * 100}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metric 2: Thermal Headroom */}
        <div className="p-4 bg-black border border-zinc-800 hover:border-[#00ff66]/80 transition-colors space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-[#00ff66]" />
              JUNCTION TEMPERATURE
            </span>
            <span className="text-[10px] text-[#00ff66]">[PASSIVE_0dB]</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-white tabular-nums tracking-tight">
              {thermalTemp} <span className="text-sm font-normal text-zinc-400">°C</span>
            </div>
            <span className="text-[10px] font-bold text-[#00ff66]">
              [HEADROOM: +{thermalHeadroom}°C]
            </span>
          </div>

          {/* Thermal Meter */}
          <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-[#00ff66] shadow-[0_0_8px_#00ff66] transition-all duration-300"
              style={{ width: `${(thermalTemp / maxTemp) * 100}%` }}
            ></div>
          </div>

          <div className="space-y-1 pt-1 text-[11px] text-zinc-400 font-mono">
            <div className="flex justify-between">
              <span>Throttle Ceiling:</span>
              <span className="text-zinc-200 font-bold">85.0°C (318.15K)</span>
            </div>
            <div className="flex justify-between">
              <span>Dissipation Profile:</span>
              <span className="text-[#00ff66] font-bold">Passive Convection</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Ring Buffer Health */}
        <div className="p-4 bg-black border border-zinc-800 hover:border-[#00f0ff]/80 transition-colors space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-[#00f0ff]" />
              INFERENCE RING BUFFER
            </span>
            <span className="text-[10px] text-[#00f0ff]">[ZERO_DROP]</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-white tabular-nums tracking-tight">
              {bufferHealth}%
            </div>
            <span className="text-[10px] font-bold text-[#00f0ff]">
              [0 DROPPED FRAMES]
            </span>
          </div>

          {/* Buffer Capacity Meter */}
          <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] transition-all duration-300"
              style={{ width: `${bufferHealth}%` }}
            ></div>
          </div>

          <div className="space-y-1 pt-1 text-[11px] text-zinc-400 font-mono">
            <div className="flex justify-between">
              <span>Queue Backlog:</span>
              <span className="text-[#00ff66] font-bold">{bufferQueue} / 64 frames</span>
            </div>
            <div className="flex justify-between">
              <span>WASM Heap Allocation:</span>
              <span className="text-zinc-200 font-bold">142.8 MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Edge Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800 font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <span>Inference Latency: <strong className="text-[#00ff66]">&lt;15 ms</strong></span>
          <span>Camera Direct Stream: <strong className="text-white">DMA_ENABLED</strong></span>
          <span>Quantization: <strong className="text-[#00f0ff]">INT8 TENSOR</strong></span>
        </div>
        <div className="text-zinc-500 text-[10px]">
          [CONSOLE_KERNEL: v2.4-LOCAL // SIMD_AVX2 // WebGPU]
        </div>
      </div>
    </div>
  );
};
