import React from 'react';
import { Palette, Moon, Sun, Flame, Check } from 'lucide-react';
import { useUITheme, UITheme } from '../context/ThemeContext';
import { industrialAudio } from '../utils/audio';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useUITheme();

  const themes: Array<{ id: UITheme; label: string; icon: any; color: string; border: string }> = [
    { id: 'neon', label: 'NEON-CYAN', icon: Moon, color: 'text-[#00f0ff]', border: 'border-[#00f0ff]' },
    { id: 'amber', label: 'AMBER-CRT', icon: Flame, color: 'text-[#ffb703]', border: 'border-[#ffb703]' },
    { id: 'emerald', label: 'MATRIX-EMR', icon: Sun, color: 'text-[#00ff66]', border: 'border-[#00ff66]' },
  ];

  const currentTheme = theme === 'cleanroom' ? 'emerald' : theme === 'obsidian' ? 'neon' : theme;

  const handleSelect = (nextTheme: UITheme) => {
    industrialAudio.playClick();
    setTheme(nextTheme);
  };

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-sm bg-black border border-zinc-800 text-xs font-mono">
      <span className="text-[10px] text-zinc-500 px-1.5 hidden sm:inline font-bold">[CONSOLE]:</span>
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = currentTheme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-wider transition-all ${
              isActive
                ? `bg-black ${t.color} ${t.border} border shadow-[0_0_10px_rgba(0,240,255,0.25)]`
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
            title={`Switch to ${t.label} Console HUD`}
          >
            <Icon className={`w-2.5 h-2.5 ${t.color}`} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
