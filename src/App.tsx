/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { InspectionStudio } from './components/InspectionStudio';
import { TeachModelPage } from './components/TeachModelPage';
import { TeachNewDefectPage } from './components/TeachNewDefectPage';
import { BatchAnalyticsPage } from './components/BatchAnalyticsPage';
import { OfflineModePage } from './components/OfflineModePage';
import { HistoryPage } from './components/HistoryPage';
import { JudgeDemoWorkflow } from './components/JudgeDemoWorkflow';
import { ControlConsoleOverlay } from './components/ControlConsoleOverlay';
import { industrialAudio } from './utils/audio';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { ThemeProvider } from './context/ThemeContext';
import { WifiOff } from 'lucide-react';

export default function App() {
  const isBrowserOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<string>('command-center');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeProfile, setActiveProfile] = useState<string>('Precision Gear (PNZ-GEAR-M12)');
  const [teachDefectImage, setTeachDefectImage] = useState<string | undefined>(undefined);
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState<boolean>(false);

  // Transition from Inspection Studio to Killer Feature Page
  const handleNavigateToTeachDefect = (suspiciousImage: string) => {
    industrialAudio.playAlert();
    setTeachDefectImage(suspiciousImage);
    setActiveTab('teach-defect');
  };

  const handleLaunchJudgeDemo = () => {
    industrialAudio.playAlert();
    setIsJudgeDemoOpen(true);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-[#00f0ff]/30 selection:text-[#00f0ff] transition-colors duration-200 relative">
        {/* Full Viewport Industrial CRT Control Console Visual Overlay */}
        <ControlConsoleOverlay />

        {/* Top Industrial Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onLaunchJudgeDemo={handleLaunchJudgeDemo}
        activeProfile={activeProfile}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-5">
        {activeTab === 'command-center' && (
          <LandingPage
            onStartInspection={() => setActiveTab('inspection')}
            onLaunchJudgeDemo={handleLaunchJudgeDemo}
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            activeProfile={activeProfile}
          />
        )}

        {activeTab === 'inspection' && (
          <InspectionStudio
            onNavigateToTeachDefect={handleNavigateToTeachDefect}
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            activeProfile={activeProfile}
            setActiveProfile={setActiveProfile}
          />
        )}

        {activeTab === 'teach-model' && (
          <TeachModelPage
            onStartInspection={() => setActiveTab('inspection')}
            activeProfile={activeProfile}
          />
        )}

        {activeTab === 'teach-defect' && (
          <TeachNewDefectPage
            initialImage={teachDefectImage}
            onNavigateToInspection={() => setActiveTab('inspection')}
            isOffline={isOffline}
          />
        )}

        {activeTab === 'analytics' && <BatchAnalyticsPage />}

        {activeTab === 'offline-mode' && (
          <OfflineModePage
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            onNavigateToInspection={() => setActiveTab('inspection')}
          />
        )}

        {activeTab === 'history' && <HistoryPage />}
      </main>

      {/* Automated Judge Demo Modal (Page 8 Guided Walkthrough) */}
      <JudgeDemoWorkflow
        isOpen={isJudgeDemoOpen}
        onClose={() => setIsJudgeDemoOpen(false)}
        onApplyOfflineToggle={(val) => setIsOffline(val)}
      />

      {/* Industrial Footer with Core Brand Creed */}
      <footer className="mt-auto border-t border-zinc-800 bg-black py-6 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold">
              <span>PULSENET</span>
              <span className="text-[#00f0ff] neon-text-cyan">-ZERO</span>
              <span className="text-[10px] text-zinc-400 px-1.5 py-0.2 bg-black border border-zinc-700 font-mono">
                [SYS_VER: 2.4-CONSOLE]
              </span>
            </div>
            <p className="text-zinc-400 font-mono text-xs">
              &ldquo;Traditional machine vision is built for factories that have money and data. PulseNet-Zero is built for factories that don&apos;t.&rdquo;
            </p>
            <p className="text-[#00f0ff] font-mono text-[11px] font-bold">
              &gt;&gt; &ldquo;Learn from what you have — not what you don&apos;t.&rdquo;
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 text-[11px] text-zinc-400 font-mono">
            <div className="px-3 py-1 bg-black border border-zinc-800 text-center">
              <span className="text-zinc-500">[TRACK]: </span>
              <span className="text-[#00f0ff] font-semibold">National Student Ideation Challenge // MSME AOI</span>
            </div>
            <div className="text-center sm:text-right text-xs">
              <div className="text-zinc-300 font-bold">&lt;15ms Target Latency (Spec)</div>
              <div className="text-[#00ff66] font-bold">Offline Demo Capable</div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Offline / Edge Status Notification Banner */}
      {(isOffline || !isBrowserOnline) && (
        <aside
          aria-label="Offline Mode Notification"
          className="fixed bottom-4 left-4 z-40 flex items-center gap-3 p-2.5 px-4 bg-black border border-[#ffb703] text-xs font-mono text-[#ffb703] shadow-[0_0_20px_rgba(255,183,3,0.3)]"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#ffb703] animate-ping"></span>
            <WifiOff className="w-3.5 h-3.5 text-[#ffb703]" />
            <span className="font-bold">
              {!isBrowserOnline ? '[HARDWARE_OFFLINE]' : '[OFFLINE_EDGE_ACTIVE]'}
            </span>
          </div>
          <span className="text-zinc-400 text-[11px] hidden sm:inline">
            Offline demo mode active. Zero cloud packet transmission. (Local model runtime not installed; presets simulated).
          </span>
          <button
            onClick={() => {
              industrialAudio.playPass();
              setIsOffline(false);
            }}
            className="px-2 py-0.5 bg-black hover:bg-zinc-900 text-[#ffb703] border border-[#ffb703] text-[10px] font-bold tracking-wider"
          >
            [CONNECT CLOUD]
          </button>
        </aside>
      )}
    </div>
  </ThemeProvider>
  );
}
