import React from 'react';
import { Wifi, WifiOff, Globe } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { industrialAudio } from '../utils/audio';

interface OnlineOfflineToggleProps {
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  compact?: boolean;
}

export const OnlineOfflineToggle: React.FC<OnlineOfflineToggleProps> = ({
  isOffline,
  setIsOffline,
  compact = false,
}) => {
  const isBrowserOnline = useOnlineStatus();

  const handleToggle = (forceState?: boolean) => {
    const next = forceState !== undefined ? forceState : !isOffline;
    setIsOffline(next);
    if (next) {
      industrialAudio.playAlert();
    } else {
      industrialAudio.playPass();
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-0.5 bg-black border border-zinc-800 text-xs font-mono">
        <button
          onClick={() => handleToggle(false)}
          className={`flex items-center gap-1 px-2 py-0.5 transition-all text-[10px] font-bold ${
            !isOffline
              ? 'bg-black text-[#00f0ff] border border-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.4)]'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Enable Cloud Gemini 3.8 Flash multimodal inspection"
        >
          <Wifi className="w-3 h-3 text-[#00f0ff]" />
          <span>[ONLINE]</span>
        </button>

        <button
          onClick={() => handleToggle(true)}
          className={`flex items-center gap-1 px-2 py-0.5 transition-all text-[10px] font-bold ${
            isOffline
              ? 'bg-black text-[#ffb703] border border-[#ffb703] shadow-[0_0_8px_rgba(255,183,3,0.4)]'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Enable air-gapped offline preset demonstration mode"
        >
          <WifiOff className="w-3 h-3 text-[#ffb703]" />
          <span>[OFFLINE]</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-black border border-zinc-800 space-y-3 font-mono">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold">
          <Globe className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span>[PROCESSING & CONNECTIVITY MODE]</span>
        </div>

        {/* Physical hardware network status */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className={`w-2 h-2 ${isBrowserOnline ? 'bg-[#00ff66] shadow-[0_0_6px_#00ff66]' : 'bg-[#ff0055] animate-ping'}`}></span>
          <span className="text-zinc-400">
            NETWORK: <strong className={isBrowserOnline ? 'text-[#00ff66]' : 'text-[#ff0055]'}>{isBrowserOnline ? '[CONNECTED]' : '[DISCONNECTED]'}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Online Button */}
        <button
          onClick={() => handleToggle(false)}
          className={`p-3 border text-left transition-all flex flex-col justify-between ${
            !isOffline
              ? 'bg-black border-[#00f0ff] text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
              : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="font-bold text-xs flex items-center gap-1.5 text-white">
              <Wifi className="w-3.5 h-3.5 text-[#00f0ff]" />
              ONLINE HYBRID
            </span>
            {!isOffline && <span className="text-[10px] px-1.5 py-0.2 bg-black text-[#00f0ff] border border-[#00f0ff] font-bold">ACTIVE</span>}
          </div>
          <p className="text-[10px] font-mono text-zinc-400 leading-tight">
            Gemini 3.8 Flash Vision cloud inspection. Multimodal deep analysis.
          </p>
        </button>

        {/* Offline Button */}
        <button
          onClick={() => handleToggle(true)}
          className={`p-3 border text-left transition-all flex flex-col justify-between ${
            isOffline
              ? 'bg-black border-[#ffb703] text-white shadow-[0_0_15px_rgba(255,183,3,0.2)]'
              : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="font-bold text-xs flex items-center gap-1.5 text-white">
              <WifiOff className="w-3.5 h-3.5 text-[#ffb703]" />
              OFFLINE AIR-GAPPED
            </span>
            {isOffline && <span className="text-[10px] px-1.5 py-0.2 bg-black text-[#ffb703] border border-[#ffb703] font-bold">ACTIVE</span>}
          </div>
          <p className="text-[10px] font-mono text-zinc-400 leading-tight">
            Air-gapped operation. Zero cloud transmission. Preset simulator active (Local model not installed).
          </p>
        </button>
      </div>
    </div>
  );
};

