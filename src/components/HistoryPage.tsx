import React, { useState } from 'react';
import { History, Search, Download, CheckCircle2, AlertTriangle, HelpCircle, Eye, X } from 'lucide-react';
import { inspectionService } from '../services/inspectionService';
import { InspectionRecord } from '../types/inspection';
import { industrialAudio } from '../utils/audio';

export const HistoryPage: React.FC = () => {
  const [historyList] = useState<InspectionRecord[]>(() => inspectionService.getHistory());
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PASS' | 'DEFECT' | 'UNKNOWN'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);

  const filtered = historyList.filter((rec) => {
    const matchesStatus = filterStatus === 'ALL' || rec.status === filterStatus;
    const matchesSearch = 
      rec.partId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.partProfile.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.defectType && rec.defectType.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const exportCSV = () => {
    industrialAudio.playClick();
    const headers = ['Time', 'Part ID', 'Batch ID', 'Part Profile', 'Result', 'Defect Type', 'Confidence', 'Processing Time (ms)', 'Engine', 'Mode'];
    const rows = filtered.map((r) => [
      r.timestamp,
      `"${r.partId.replace(/"/g, '""')}"`,
      `"${(r.batchId || 'N/A').replace(/"/g, '""')}"`,
      `"${r.partProfile.replace(/"/g, '""')}"`,
      r.status,
      `"${(r.defectType || 'None').replace(/"/g, '""')}"`,
      (r.confidence * 100).toFixed(1) + '%',
      r.processingTimeMs.toFixed(1),
      `"${r.processingEngine.replace(/"/g, '""')}"`,
      r.isSimulated ? '"Simulated Demo"' : '"Genuine Inspection"',
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const encodedUri = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pulsenet_inspection_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(encodedUri);
  };

  return (
    <div className="space-y-6 pb-16 font-mono">
      {/* Header */}
      <div className="relative bg-black border border-[#00f0ff]/60 p-5 md:p-6 shadow-[0_0_25px_rgba(0,240,255,0.12)] space-y-3">
        <div className="corner-marker-tl"></div>
        <div className="corner-marker-tr"></div>
        <div className="corner-marker-bl"></div>
        <div className="corner-marker-br"></div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#00f0ff] font-bold">
              <History className="w-4 h-4 text-[#00f0ff]" />
              <span>[PAGE 07 // AUDIT LOG & QUALITY ARCHIVE]</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wider uppercase mt-1">
              INSPECTION HISTORY
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Traceable timestamped ledger of optical scan records, defect tags, and edge latency benchmarks.
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-zinc-900 text-[#00f0ff] border border-[#00f0ff] text-xs font-bold transition-colors shadow-[0_0_10px_rgba(0,240,255,0.2)]"
          >
            <Download className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>[EXPORT CSV AUDIT LOG]</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-black border border-zinc-800 text-xs">
        {/* Filters: ALL, PASS, DEFECT, UNKNOWN */}
        <div className="flex items-center gap-2">
          {(['ALL', 'PASS', 'DEFECT', 'UNKNOWN'] as const).map((status) => {
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => {
                  industrialAudio.playClick();
                  setFilterStatus(status);
                }}
                className={`px-3 py-1.5 border font-bold transition-all text-xs ${
                  isActive
                    ? status === 'PASS'
                      ? 'bg-black text-[#00ff66] border-[#00ff66] shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                      : status === 'DEFECT'
                      ? 'bg-black text-[#ff0055] border-[#ff0055] shadow-[0_0_10px_rgba(255,0,85,0.3)]'
                      : status === 'UNKNOWN'
                      ? 'bg-black text-[#ffb703] border-[#ffb703] shadow-[0_0_10px_rgba(255,183,3,0.3)]'
                      : 'bg-black text-[#00f0ff] border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                    : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                [{status}]
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search part ID or defect..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-zinc-700 text-white pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#00f0ff] placeholder-zinc-600 font-mono"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="relative bg-black border border-zinc-800 overflow-hidden shadow-2xl font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-black text-zinc-500 uppercase text-[11px]">
                <th className="py-3 px-4 font-bold">[TIME]</th>
                <th className="py-3 px-4 font-bold">[PART]</th>
                <th className="py-3 px-4 font-bold">[RESULT]</th>
                <th className="py-3 px-4 font-bold">[DEFECT]</th>
                <th className="py-3 px-4 font-bold">[CONFIDENCE]</th>
                <th className="py-3 px-4 font-bold">[PROCESSING TIME]</th>
                <th className="py-3 px-4 text-right font-bold">[ACTION]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-600">
                    No inspection logs match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-zinc-950 transition-colors group"
                  >
                    {/* TIME */}
                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px] tabular-nums">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    {/* PART */}
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{item.partId}</span>
                        {item.isSimulated ? (
                          <span className="text-[9px] px-1 py-0.2 bg-black border border-amber-500/60 text-amber-400 font-bold">
                            [DEMO]
                          </span>
                        ) : (
                          <span className="text-[9px] px-1 py-0.2 bg-black border border-cyan-500/60 text-cyan-400 font-bold">
                            [REAL]
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">{item.partProfile.split(' ')[0]}{item.batchId ? ` • Lot: ${item.batchId}` : ''}</div>
                    </td>

                    {/* RESULT */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold border ${
                        item.status === 'PASS'
                          ? 'bg-black text-[#00ff66] border-[#00ff66] shadow-[0_0_6px_rgba(0,255,102,0.2)]'
                          : item.status === 'DEFECT'
                          ? 'bg-black text-[#ff0055] border-[#ff0055] shadow-[0_0_6px_rgba(255,0,85,0.2)]'
                          : 'bg-black text-[#ffb703] border-[#ffb703] shadow-[0_0_6px_rgba(255,183,3,0.2)]'
                      }`}>
                        {item.status === 'PASS' && <CheckCircle2 className="w-3 h-3 text-[#00ff66]" />}
                        {item.status === 'DEFECT' && <AlertTriangle className="w-3 h-3 text-[#ff0055]" />}
                        {item.status === 'UNKNOWN' && <HelpCircle className="w-3 h-3 text-[#ffb703]" />}
                        {item.status}
                      </span>
                    </td>

                    {/* DEFECT */}
                    <td className="py-3.5 px-4 text-zinc-300">
                      {item.defectType ? (
                        <span className="text-[#ff0055] font-bold">{item.defectType}</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    {/* CONFIDENCE */}
                    <td className="py-3.5 px-4 font-bold text-white tabular-nums">
                      {(item.confidence * 100).toFixed(1)}%
                    </td>

                    {/* PROCESSING TIME */}
                    <td className="py-3.5 px-4 text-[#00f0ff] font-bold tabular-nums">
                      {item.processingTimeMs.toFixed(1)} ms
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          industrialAudio.playClick();
                          setSelectedRecord(item);
                        }}
                        className="p-1.5 bg-black border border-zinc-800 hover:border-[#00f0ff] text-zinc-400 hover:text-[#00f0ff] transition-colors"
                        title="View Scan Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border border-[#00f0ff] max-w-lg w-full p-6 space-y-4 font-mono shadow-[0_0_40px_rgba(0,240,255,0.25)] relative">
            <div className="corner-marker-tl"></div>
            <div className="corner-marker-tr"></div>
            <div className="corner-marker-bl"></div>
            <div className="corner-marker-br"></div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-zinc-800 pb-2">
              <span className="text-[10px] text-[#00f0ff] font-bold">[INSPECTION RECORD DETAILS]</span>
              <h3 className="text-base font-black text-white mt-0.5">{selectedRecord.id} // {selectedRecord.partId}</h3>
            </div>

            {selectedRecord.imageUrl && (
              <div className="aspect-video w-full bg-black border border-zinc-800 flex items-center justify-center p-2 overflow-hidden console-grid">
                <img src={selectedRecord.imageUrl} alt="Part Scan" className="max-h-full max-w-full object-contain" />
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-black border border-zinc-800">
                <span className="text-zinc-500 text-[10px] font-bold">[INSPECTION MODE]:</span>
                <div className={`font-bold text-xs mt-0.5 ${selectedRecord.isSimulated ? 'text-[#ffb703]' : 'text-[#00f0ff]'}`}>
                  {selectedRecord.isSimulated ? 'Simulated Demo Preset' : 'Genuine AI Inspection'}
                </div>
              </div>
              <div className="p-2.5 bg-black border border-zinc-800">
                <span className="text-zinc-500 text-[10px] font-bold">[STATUS]:</span>
                <div className={`font-black text-sm mt-0.5 ${
                  selectedRecord.status === 'PASS' ? 'text-[#00ff66]' : selectedRecord.status === 'DEFECT' ? 'text-[#ff0055]' : 'text-[#ffb703]'
                }`}>
                  {selectedRecord.status}
                </div>
              </div>
              <div className="p-2.5 bg-black border border-zinc-800">
                <span className="text-zinc-500 text-[10px] font-bold">[DEFECT]:</span>
                <div className="font-bold text-sm text-zinc-200 mt-0.5">{selectedRecord.defectType || 'None (Pass)'}</div>
              </div>
              <div className="p-2.5 bg-black border border-zinc-800">
                <span className="text-zinc-500 text-[10px] font-bold">[LATENCY]:</span>
                <div className="font-black text-sm text-[#00f0ff] mt-0.5 tabular-nums">{selectedRecord.processingTimeMs.toFixed(1)} ms</div>
              </div>
              <div className="p-2.5 bg-black border border-zinc-800">
                <span className="text-zinc-500 text-[10px] font-bold">[CONFIDENCE]:</span>
                <div className="font-black text-sm text-white mt-0.5 tabular-nums">{(selectedRecord.confidence * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div className="p-3 bg-black border border-zinc-800 text-xs space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase font-bold">[ENGINEERING OBSERVATIONS]:</div>
              {selectedRecord.observations.map((obs, i) => (
                <div key={i} className="text-zinc-300">• {obs}</div>
              ))}
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-2.5 bg-[#00f0ff] hover:bg-cyan-300 text-black font-black text-xs font-mono shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              [CLOSE RECORD]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

