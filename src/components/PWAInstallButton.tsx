import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { industrialAudio } from '../utils/audio';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as a standalone PWA, suppress
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
        <Check className="w-3 h-3 text-emerald-400" />
        <span>STANDALONE PWA ACTIVE</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={async () => {
          industrialAudio.playClick();
          await install();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
        title="Install PulseNet-Zero as an offline desktop/mobile application"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
        <span>INSTALL APP (PWA)</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => {
            industrialAudio.playClick();
            setShowIOSGuide(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>INSTALL ON IOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
            <div className="w-full max-w-sm rounded-2xl bg-[#0b0e17] border border-cyan-500/40 p-6 shadow-2xl relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                INSTALL ON IPHONE / IPAD
              </h3>
              <p className="mt-3 text-xs text-slate-300 font-sans leading-relaxed">
                1. Tap the <strong>Share</strong> button in the Safari toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                3. Launch directly from your home screen for 100% offline edge inspection.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-cyan-500 py-2.5 text-xs font-bold font-mono text-slate-950 hover:bg-cyan-400 transition"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback install button for desktop/mobile browser
  return (
    <button
      onClick={() => {
        industrialAudio.playClick();
        alert('To install PulseNet-Zero as a standalone PWA on desktop or mobile:\n- Chrome/Edge: Click the install icon in the address bar.\n- Android: Tap menu > Add to Home screen.\n- iOS: Tap Share > Add to Home Screen.');
      }}
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-mono transition-colors"
      title="Install as offline PWA"
    >
      <Laptop className="w-3.5 h-3.5 text-cyan-400" />
      <span>PWA READY</span>
    </button>
  );
};
