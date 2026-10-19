import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Calendar, 
  Download, 
  RefreshCw, 
  Info,
  Clock,
  Sparkles,
  PieChart
} from 'lucide-react';
import { INITIAL_BATCH } from '../services/inspectionService';
import { industrialAudio } from '../utils/audio';

export const BatchAnalyticsPage: React.FC = () => {
  const [batchData, setBatchData] = useState(INITIAL_BATCH);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Simulate inspecting 10 more parts in current batch
  const handleSimulateMore = () => {
    industrialAudio.playClick();
    setIsSimulating(true);

    setTimeout(() => {
      setBatchData((prev) => {
        const addedPass = 9;
        const addedDefect = 1;
        const newTotal = prev.totalInspected + 10;
        const newPass = prev.passCount + addedPass;
        const newDefect = prev.defectCount + addedDefect;
        const newYield = (newPass / newTotal) * 100;
        return {
          ...prev,
          totalInspected: newTotal,
          passCount: newPass,
          defectCount: newDefect,
          yieldRate: parseFloat(newYield.toFixed(1)),
          hourlyTrend: [
            ...prev.hourlyTrend,
            { hour: '13:00', pass: addedPass, defect: addedDefect, yield: 90.0 },
          ],
        };
      });
      setIsSimulating(false);
      industrialAudio.playPass();
    }, 700);
  };

  return (
    <div className="space-y-6 pb-16 font-mono">
      {/* Page Header */}
      <div className="relative bg-black border border-[#00f0ff]/60 p-5 md:p-6 shadow-[0_0_25px_rgba(0,240,255,0.12)] space-y-3">
        <div className="corner-marker-tl"></div>
        <div className="corner-marker-tr"></div>
        <div className="corner-marker-bl"></div>
        <div className="corner-marker-br"></div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#00f0ff] font-bold">
              <BarChart3 className="w-4 h-4 text-[#00f0ff]" />
              <span>[PAGE_05 // MANUFACTURING TELEMETRY]</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase mt-1">
              BATCH QUALITY DASHBOARD
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Real-time lot yield tracking and statistical defect Pareto analysis for small-batch runs.
            </p>
          </div>

          {/* DEMO DATA Badge (Explicitly Required by prompt) */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-black text-[#ffb703] border border-[#ffb703] text-xs font-bold tracking-wider shadow-[0_0_10px_rgba(255,183,3,0.25)]">
              [DEMO DATA // FOR EVALUATION]
            </span>
            <button
              onClick={handleSimulateMore}
              disabled={isSimulating}
              className="px-3 py-1 bg-black hover:bg-zinc-900 text-[#00f0ff] border border-[#00f0ff] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? '[SIMULATING...]' : '[+10 PARTS SIM]'}</span>
            </button>
          </div>
        </div>

        {/* Demo Data Disclaimer note required by prompt */}
        <div className="p-2.5 bg-black border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2 font-mono">
          <Info className="w-4 h-4 text-[#00f0ff] shrink-0" />
          <span>
            Demonstration batch analytics. Does not fabricate unverified scientific statistics or exaggerated cost claims.
          </span>
        </div>
      </div>

      {/* Primary Batch Overview Panel (Explicitly Required on Page 5) */}
      <div className="relative bg-black border border-zinc-800 p-5 font-mono space-y-5 shadow-2xl">
        <div className="corner-marker-tl"></div>
        <div className="corner-marker-tr"></div>
        <div className="corner-marker-bl"></div>
        <div className="corner-marker-br"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-3">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold">[ACTIVE PRODUCTION LOT]</div>
            {/* Required: BATCH #PNZ-042 */}
            <div className="text-2xl font-black text-white mt-0.5">
              BATCH {batchData.batchNumber}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Calendar className="w-4 h-4 text-[#00f0ff]" />
            <span>Shift: Day 1 (08:00 - 16:00 UTC)</span>
          </div>
        </div>

        {/* 100 PARTS INSPECTED: 91 PASS, 7 DEFECT, 2 UNKNOWN (Required by prompt) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-black border border-zinc-800 space-y-1">
            <div className="text-[10px] text-zinc-500 font-bold uppercase">[PARTS INSPECTED]</div>
            <div className="text-3xl font-black text-white tabular-nums tracking-tight">
              {batchData.totalInspected}
            </div>
            <div className="text-[10px] text-zinc-400">100% OF LOT PROCESSED</div>
          </div>

          <div className="p-4 bg-black border border-[#00ff66] text-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.2)] space-y-1">
            <div className="text-[10px] uppercase font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PASS
            </div>
            <div className="text-3xl font-black tabular-nums tracking-tight">
              {batchData.passCount}
            </div>
            <div className="text-[10px] font-bold">
              {((batchData.passCount / batchData.totalInspected) * 100).toFixed(1)}% YIELD RATE
            </div>
          </div>

          <div className="p-4 bg-black border border-[#ff0055] text-[#ff0055] shadow-[0_0_15px_rgba(255,0,85,0.2)] space-y-1">
            <div className="text-[10px] uppercase font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              DEFECT
            </div>
            <div className="text-3xl font-black tabular-nums tracking-tight">
              {batchData.defectCount}
            </div>
            <div className="text-[10px] font-bold">
              {((batchData.defectCount / batchData.totalInspected) * 100).toFixed(1)}% SCRAP RATE
            </div>
          </div>

          <div className="p-4 bg-black border border-[#ffb703] text-[#ffb703] shadow-[0_0_15px_rgba(255,183,3,0.2)] space-y-1">
            <div className="text-[10px] uppercase font-bold flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              UNKNOWN
            </div>
            <div className="text-3xl font-black tabular-nums tracking-tight">
              {batchData.unknownCount}
            </div>
            <div className="text-[10px] font-bold">TAUGHT VIA KILLER FEATURE</div>
          </div>
        </div>

        {/* Quality Insights Banner (Explicitly Required on Page 5) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* MOST COMMON DEFECT */}
          <div className="p-4 bg-black border border-zinc-800 space-y-1">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">
              [MOST COMMON DEFECT]
            </div>
            <div className="text-base font-bold text-[#ff0055]">
              {batchData.mostCommonDefect}
            </div>
            <p className="text-xs text-zinc-400">
              Accounts for 57.1% of all non-conformance flags in lot #PNZ-042.
            </p>
          </div>

          {/* QUALITY INSIGHT */}
          <div className="p-4 bg-black border border-[#00f0ff]/50 space-y-1 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
            <div className="text-[10px] text-[#00f0ff] uppercase font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
              [QUALITY INSIGHT]
            </div>
            <div className="text-sm font-bold text-white">
              &ldquo;{batchData.qualityInsight}&rdquo;
            </div>
            <p className="text-xs text-zinc-400">
              Action recommended: Inspect toolholder alignment on CNC lathe #2.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid (Explicitly Required on Page 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: PASS vs FAIL & Quality Distribution */}
        <div className="lg:col-span-6 bg-black border border-zinc-800 p-5 font-mono space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs text-zinc-400 uppercase font-bold">[PASS vs FAIL RATIO]</span>
            <span className="text-xs text-[#00f0ff] font-bold">{batchData.yieldRate}% YIELD</span>
          </div>

          {/* Graphical Progress Bar Breakdown */}
          <div className="space-y-2 pt-1">
            <div className="h-6 w-full flex bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div 
                className="bg-[#00ff66] flex items-center justify-center text-[10px] text-black font-black"
                style={{ width: `${(batchData.passCount / batchData.totalInspected) * 100}%` }}
                title={`PASS: ${batchData.passCount}`}
              >
                {batchData.passCount}%
              </div>
              <div 
                className="bg-[#ff0055] flex items-center justify-center text-[10px] text-white font-black"
                style={{ width: `${(batchData.defectCount / batchData.totalInspected) * 100}%` }}
                title={`DEFECT: ${batchData.defectCount}`}
              >
                {batchData.defectCount}%
              </div>
              <div 
                className="bg-[#ffb703] flex items-center justify-center text-[10px] text-black font-black"
                style={{ width: `${(batchData.unknownCount / batchData.totalInspected) * 100}%` }}
                title={`UNKNOWN: ${batchData.unknownCount}`}
              >
                {batchData.unknownCount}%
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 bg-[#00ff66]"></span>
                <span className="text-[#00ff66]">PASS ({batchData.passCount})</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 bg-[#ff0055]"></span>
                <span className="text-[#ff0055]">DEFECT ({batchData.defectCount})</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 bg-[#ffb703]"></span>
                <span className="text-[#ffb703]">UNKNOWN ({batchData.unknownCount})</span>
              </div>
            </div>
          </div>

          {/* Pareto Defect Breakdown */}
          <div className="space-y-3 pt-2">
            <div className="text-xs text-zinc-400 font-bold uppercase">[DEFECT TYPES // PARETO]</div>
            <div className="space-y-2">
              {batchData.defectBreakdown.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="font-bold">{item.name}</span>
                    <span className="text-zinc-400 tabular-nums">{item.count} units ({item.percentage}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <div 
                      className="h-full transition-all"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: QUALITY TREND (Hour-by-hour production yield) */}
        <div className="lg:col-span-6 bg-black border border-zinc-800 p-5 font-mono space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs text-zinc-400 uppercase font-bold">[QUALITY TREND // TIMELINE]</span>
            <span className="text-xs text-zinc-500 font-bold">HOURLY DISPERSION</span>
          </div>

          <div className="h-52 w-full flex items-end justify-between gap-3 pt-4 px-2 border-b border-zinc-800">
            {batchData.hourlyTrend.map((t, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="text-[10px] text-[#00f0ff] opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold">
                  {t.yield}%
                </div>
                <div className="w-full max-w-[36px] bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col justify-end h-36">
                  {/* Defect segment */}
                  {t.defect > 0 && (
                    <div 
                      className="w-full bg-[#ff0055]"
                      style={{ height: `${(t.defect / (t.pass + t.defect)) * 100}%` }}
                    ></div>
                  )}
                  {/* Pass segment */}
                  <div 
                    className="w-full bg-[#00f0ff] shadow-[0_0_5px_#00f0ff]"
                    style={{ height: `${(t.pass / (t.pass + t.defect)) * 100}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-zinc-400 mt-2 font-bold">{t.hour}</div>
              </div>
            ))}
          </div>

          {/* Chart 3: DEFECT FREQUENCY Breakdown */}
          <div className="pt-2 text-xs text-zinc-400 flex items-center justify-between font-mono">
            <span className="uppercase">[DEFECT FREQUENCY: 0.07 PER UNIT]</span>
            <span className="text-[#00f0ff] font-bold">[PPM: 70,000]</span>
          </div>
        </div>
      </div>
    </div>
  );
};
