import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Calendar, 
  RefreshCw, 
  Info,
  Sparkles,
  Filter
} from 'lucide-react';
import { inspectionService } from '../services/inspectionService';
import { BatchSummary } from '../types/inspection';
import { industrialAudio } from '../utils/audio';

export const BatchAnalyticsPage: React.FC = () => {
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [includeSimulated, setIncludeSimulated] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [batchData, setBatchData] = useState<BatchSummary>(() => 
    inspectionService.getBatchAnalytics('ALL', false)
  );

  const handleRefresh = () => {
    industrialAudio.playClick();
    setIsRefreshing(true);
    const data = inspectionService.getBatchAnalytics(selectedBatch, includeSimulated);
    setBatchData(data);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 300);
  };

  useEffect(() => {
    const data = inspectionService.getBatchAnalytics(selectedBatch, includeSimulated);
    setBatchData(data);
  }, [selectedBatch, includeSimulated]);

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
              Live yield tracking and defect Pareto analysis derived from persisted inspection records.
            </p>
          </div>

          {/* Telemetry Status Badge & Refresh */}
          <div className="flex flex-wrap items-center gap-2">
            {batchData.totalInspected === 0 ? (
              <span className="px-3 py-1 bg-black text-zinc-400 border border-zinc-700 text-xs font-bold tracking-wider">
                [NO DATA // PENDING RUNS]
              </span>
            ) : batchData.isSimulatedOnly ? (
              <span className="px-3 py-1 bg-black text-[#ffb703] border border-[#ffb703] text-xs font-bold tracking-wider shadow-[0_0_10px_rgba(255,183,3,0.25)]">
                [SIMULATED DATA // DEMO]
              </span>
            ) : (
              <span className="px-3 py-1 bg-black text-[#00f0ff] border border-[#00f0ff] text-xs font-bold tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.25)]">
                [OPERATIONAL TELEMETRY]
              </span>
            )}

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1 bg-black hover:bg-zinc-900 text-[#00f0ff] border border-[#00f0ff] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? '[SYNCING...]' : '[REFRESH DATA]'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Strip */}
        <div className="p-3 bg-black border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-zinc-400 font-bold">
              <Filter className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>LOT FILTER:</span>
            </div>
            <select
              value={selectedBatch}
              onChange={(e) => {
                industrialAudio.playClick();
                setSelectedBatch(e.target.value);
              }}
              className="bg-black border border-zinc-700 text-white text-xs px-2 py-1 font-mono focus:outline-none focus:border-[#00f0ff]"
            >
              <option value="ALL">All Recorded Lots</option>
              {batchData.availableBatches && batchData.availableBatches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={includeSimulated}
              onChange={(e) => {
                industrialAudio.playClick();
                setIncludeSimulated(e.target.checked);
              }}
              className="accent-[#00f0ff] w-3.5 h-3.5 bg-black"
            />
            <span className="text-xs">Include Demo Preset Simulations</span>
          </label>
        </div>

        {/* Disclaimer / Guidance */}
        <div className="p-2.5 bg-black border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2 font-mono">
          <Info className="w-4 h-4 text-[#00f0ff] shrink-0" />
          <span>
            {includeSimulated
              ? 'Displaying operational records alongside simulated demo presets. Real quality audits should exclude simulation data.'
              : 'Filtering strictly by genuine operational inspections. Simulated demo presets are excluded from quality statistics.'}
          </span>
        </div>
      </div>

      {batchData.totalInspected === 0 ? (
        /* Empty State */
        <div className="relative bg-black border border-zinc-800 p-8 text-center font-mono space-y-4 shadow-2xl">
          <div className="corner-marker-tl"></div>
          <div className="corner-marker-tr"></div>
          <div className="corner-marker-bl"></div>
          <div className="corner-marker-br"></div>

          <div className="w-12 h-12 rounded-full border border-zinc-700 mx-auto flex items-center justify-center text-zinc-500">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              [NO INSPECTION RECORDS FOR SELECTED FILTER]
            </h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              {batchData.hasGenuineRecords
                ? 'No genuine records found for the selected lot. Select another lot or inspect parts in the Inspection Studio.'
                : 'No genuine inspections have been recorded yet. Perform inspections in the Inspection Studio, or toggle "Include Demo Simulations" to inspect demo batch records.'}
            </p>
          </div>
        </div>
      ) : (
        /* Primary Batch Overview Panel */
        <>
          <div className="relative bg-black border border-zinc-800 p-5 font-mono space-y-5 shadow-2xl">
            <div className="corner-marker-tl"></div>
            <div className="corner-marker-tr"></div>
            <div className="corner-marker-bl"></div>
            <div className="corner-marker-br"></div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-3">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold">[ACTIVE PRODUCTION LOT]</div>
                <div className="text-2xl font-black text-white mt-0.5">
                  {batchData.batchNumber}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Calendar className="w-4 h-4 text-[#00f0ff]" />
                <span>Aggregated Live History</span>
              </div>
            </div>

            {/* 4 Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-black border border-zinc-800 space-y-1">
                <div className="text-[10px] text-zinc-500 font-bold uppercase">[PARTS INSPECTED]</div>
                <div className="text-3xl font-black text-white tabular-nums tracking-tight">
                  {batchData.totalInspected}
                </div>
                <div className="text-[10px] text-zinc-400">PERSISTED AUDIT RECORDS</div>
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
                  {batchData.yieldRate}% YIELD RATE
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
                <div className="text-[10px] font-bold">
                  {((batchData.unknownCount / batchData.totalInspected) * 100).toFixed(1)}% ANOMALY RATE
                </div>
              </div>
            </div>

            {/* Quality Insights Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 bg-black border border-zinc-800 space-y-1">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">
                  [MOST COMMON DEFECT]
                </div>
                <div className="text-base font-bold text-[#ff0055]">
                  {batchData.mostCommonDefect}
                </div>
                <p className="text-xs text-zinc-400">
                  {batchData.defectCount > 0
                    ? `Leading non-conformance flag in lot ${batchData.batchNumber}.`
                    : 'Zero defects recorded across inspected units.'}
                </p>
              </div>

              <div className="p-4 bg-black border border-[#00f0ff]/50 space-y-1 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                <div className="text-[10px] text-[#00f0ff] uppercase font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
                  [QUALITY INSIGHT]
                </div>
                <div className="text-sm font-bold text-white">
                  &ldquo;{batchData.qualityInsight}&rdquo;
                </div>
                <p className="text-xs text-zinc-400">
                  Automated telemetry derived from local sensor logs.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chart 1: PASS vs FAIL & Quality Distribution */}
            <div className="lg:col-span-6 bg-black border border-zinc-800 p-5 font-mono space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs text-zinc-400 uppercase font-bold">[PASS vs FAIL RATIO]</span>
                <span className="text-xs text-[#00f0ff] font-bold">{batchData.yieldRate}% YIELD</span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="h-6 w-full flex bg-zinc-900 border border-zinc-800 overflow-hidden">
                  {batchData.passCount > 0 && (
                    <div 
                      className="bg-[#00ff66] flex items-center justify-center text-[10px] text-black font-black"
                      style={{ width: `${(batchData.passCount / batchData.totalInspected) * 100}%` }}
                      title={`PASS: ${batchData.passCount}`}
                    >
                      {((batchData.passCount / batchData.totalInspected) * 100).toFixed(0)}%
                    </div>
                  )}
                  {batchData.defectCount > 0 && (
                    <div 
                      className="bg-[#ff0055] flex items-center justify-center text-[10px] text-white font-black"
                      style={{ width: `${(batchData.defectCount / batchData.totalInspected) * 100}%` }}
                      title={`DEFECT: ${batchData.defectCount}`}
                    >
                      {((batchData.defectCount / batchData.totalInspected) * 100).toFixed(0)}%
                    </div>
                  )}
                  {batchData.unknownCount > 0 && (
                    <div 
                      className="bg-[#ffb703] flex items-center justify-center text-[10px] text-black font-black"
                      style={{ width: `${(batchData.unknownCount / batchData.totalInspected) * 100}%` }}
                      title={`UNKNOWN: ${batchData.unknownCount}`}
                    >
                      {((batchData.unknownCount / batchData.totalInspected) * 100).toFixed(0)}%
                    </div>
                  )}
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
                {batchData.defectBreakdown.length === 0 ? (
                  <div className="text-xs text-zinc-500 py-3 text-center border border-dashed border-zinc-800">
                    No defects recorded in this selection.
                  </div>
                ) : (
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
                )}
              </div>
            </div>

            {/* Chart 2: QUALITY TREND (Hour-by-hour production yield) */}
            <div className="lg:col-span-6 bg-black border border-zinc-800 p-5 font-mono space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs text-zinc-400 uppercase font-bold">[QUALITY TREND // TIMELINE]</span>
                <span className="text-xs text-zinc-500 font-bold">HOURLY DISPERSION</span>
              </div>

              {batchData.hourlyTrend.length === 0 ? (
                <div className="h-52 w-full flex items-center justify-center text-xs text-zinc-500 border border-dashed border-zinc-800">
                  Insufficient chronological data for timeline chart.
                </div>
              ) : (
                <div className="h-52 w-full flex items-end justify-between gap-3 pt-4 px-2 border-b border-zinc-800">
                  {batchData.hourlyTrend.map((t, idx) => {
                    const totalPartsInHour = t.pass + t.defect;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div className="text-[10px] text-[#00f0ff] opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold">
                          {t.yield}%
                        </div>
                        <div className="w-full max-w-[36px] bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col justify-end h-36">
                          {t.defect > 0 && totalPartsInHour > 0 && (
                            <div 
                              className="w-full bg-[#ff0055]"
                              style={{ height: `${(t.defect / totalPartsInHour) * 100}%` }}
                            ></div>
                          )}
                          {totalPartsInHour > 0 && (
                            <div 
                              className="w-full bg-[#00f0ff] shadow-[0_0_5px_#00f0ff]"
                              style={{ height: `${(t.pass / totalPartsInHour) * 100}%` }}
                            ></div>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-2 font-bold">{t.hour}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Chart 3: DEFECT FREQUENCY Breakdown */}
              <div className="pt-2 text-xs text-zinc-400 flex items-center justify-between font-mono">
                <span className="uppercase">
                  [DEFECT RATE: {batchData.totalInspected > 0 ? (batchData.defectCount / batchData.totalInspected).toFixed(3) : '0.000'} PER UNIT]
                </span>
                <span className="text-[#00f0ff] font-bold">
                  [PPM: {batchData.ppmDefectRate.toLocaleString()}]
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
