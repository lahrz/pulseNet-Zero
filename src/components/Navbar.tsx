import React from 'react';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Layers,
  BarChart3,
  History,
  Scan,
  Compass
} from 'lucide-react';
import { industrialAudio } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';
import { OnlineOfflineToggle } from './OnlineOfflineToggle';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onLaunchJudgeDemo: () => void;
  activeProfile: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOffline,
  setIsOffline,
  soundEnabled,
  setSoundEnabled,
  onLaunchJudgeDemo,
  activeProfile,
}) => {
  const tabs = [
    { id: 'command-center', label: 'Command Center', icon: Compass },
    { id: 'inspection', label: 'AI Inspection', icon: Scan },
    { id: 'teach-model', label: 'Teach Model', icon: Layers },
    { id: 'teach-defect', label: 'Teach New Defect', icon: Sparkles, highlight: true },
    { id: 'analytics', label: 'Batch Analytics', icon: BarChart3 },
    { id: 'offline-mode', label: 'Offline Mode', icon: isOffline ? WifiOff : Wifi },
    { id: 'history', label: 'History', icon: History },
  ];

  const handleTabClick = (id: string) => {
    industrialAudio.playClick();
    setActiveTab(id);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    industrialAudio.enabled = next;
    setSoundEnabled(next);
    if (next) industrialAudio.playPass();
  };

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-cyan-500/40 shadow-[0_4px_30px_rgba(0,240,255,0.12)]">
      {/* Top High-Density Technical Telemetry Bar */}
      <div className="px-4 py-1 bg-black border-b border-cyan-900/60 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">[SYS_ENGINE]:</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-black text-[#00ff66] border border-[#00ff66]/80 shadow-[0_0_8px_rgba(0,255,102,0.3)] font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse"></span>
              ONLINE_READY
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">[MODE]:</span>
            <OnlineOfflineToggle isOffline={isOffline} setIsOffline={setIsOffline} compact />
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-500">[PROFILE]:</span>
            <span className="text-cyan-300 font-bold bg-cyan-950/40 px-1.5 py-0.5 border border-cyan-500/30 rounded text-[10px]">{activeProfile}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400">
            <span className="text-slate-600">//</span>
            <span className="text-cyan-400 font-mono">SPEC: &lt;15MS</span>
            <span className="text-slate-600">//</span>
            <span className="text-emerald-400 font-mono">DEMO_HUD: ACTIVE</span>
            <span className="text-slate-600">//</span>
            <span className="text-[#00f0ff] font-mono flex items-center gap-1">
              <span className="w-1 h-1 bg-[#00f0ff] animate-ping"></span>
              CRT_HUD: ACTIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeSelector />

          <div className="hidden xl:flex items-center gap-1.5 text-slate-400 text-[10px]">
            <span className="text-cyan-400 font-bold">[CHALLENGE]:</span>
            <span className="text-white font-medium">MSME Zero-Shot AOI Track</span>
          </div>

          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Industrial Audio' : 'Enable Industrial Audio'}
            className="p-1 rounded text-cyan-400 hover:text-white border border-cyan-500/40 hover:border-cyan-400 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Main Control Console Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Logo / Brand */}
        <div 
          onClick={() => handleTabClick('command-center')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-md bg-black border border-cyan-400 flex items-center justify-center relative shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-all">
            <Cpu className="w-5 h-5 text-[#00f0ff] relative z-10" />
            <div className="absolute inset-0 bg-cyan-400/20 blur-[2px]"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-widest text-white font-mono uppercase">
                PULSENET<span className="text-[#00f0ff] neon-text-cyan">-ZERO</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black text-cyan-300 border border-cyan-500/60 font-mono font-bold">
                AOI-v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-mono hidden sm:block">AI Optical Quality Console</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'wireframe-cyan text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)] bg-black'
                    : tab.highlight
                    ? 'text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 bg-amber-950/20'
                    : 'text-slate-400 hover:text-white border border-transparent hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00f0ff]' : tab.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.highlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Button: PWA Install & Judge Demo */}
        <div className="flex items-center gap-2">
          <PWAInstallButton />

          <button
            onClick={() => {
              industrialAudio.playAlert();
              onLaunchJudgeDemo();
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-black hover:bg-zinc-900 text-[#ffb703] border border-[#ffb703] text-xs font-mono font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(255,183,3,0.3)] group"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ffb703] group-hover:rotate-12 transition-transform" />
            <span>[JUDGE DEMO]</span>
          </button>

          {/* Quick tab dropdown for mobile */}
          <div className="lg:hidden">
            <select
              value={activeTab}
              onChange={(e) => handleTabClick(e.target.value)}
              className="bg-black border border-zinc-700 text-[#00f0ff] text-xs px-2 py-1.5 font-mono focus:outline-none focus:border-[#00f0ff]"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id} className="bg-black text-white">
                  [{tab.label.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
