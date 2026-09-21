import React, { useState } from 'react';
import { Sliders, Sparkles, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface Preset {
  name: string;
  bands: number[]; // -10 to +10 dB
}

const PRESETS: Preset[] = [
  { name: 'Studio Flat', bands: [0, 0, 0, 0, 0] },
  { name: 'Bass Boost', bands: [7, 5, 1, 2, 0] },
  { name: 'Vocal Clarity', bands: [-2, 1, 6, 4, 2] },
  { name: 'Lo-Fi Warmth', bands: [4, 3, -1, -3, -5] },
  { name: 'Electronic Club', bands: [8, 4, 0, 5, 7] },
];

export const SoundEqualizerWidget: React.FC = () => {
  const [activePreset, setActivePreset] = useState<string>('Studio Flat');
  const [bands, setBands] = useState<number[]>([0, 0, 0, 0, 0]);
  const { showToast } = useToast();

  const frequencies = ['60 Hz', '250 Hz', '1 kHz', '4 kHz', '12 kHz'];

  const handleSelectPreset = (preset: Preset) => {
    setActivePreset(preset.name);
    setBands([...preset.bands]);
    showToast(`EQ Profile set to "${preset.name}"`, 'info');
  };

  const handleBandChange = (index: number, val: number) => {
    const updated = [...bands];
    updated[index] = val;
    setBands(updated);
    setActivePreset('Custom');
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#0e111a] border border-slate-200 dark:border-[#212638] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Audio Equalizer (EQ)
          </span>
        </div>
        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
          {activePreset}
        </span>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => handleSelectPreset(p)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all duration-200 active:scale-95 ${
              activePreset === p.name
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-white dark:bg-[#151926] border-slate-200 dark:border-[#22283a] text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white shadow-xs'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="flex justify-between items-end gap-2 pt-2 h-28">
        {bands.map((val, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1 h-full justify-between">
            <span className="text-[10px] font-mono text-purple-600 dark:text-purple-300 font-semibold">
              {val > 0 ? `+${val}` : val}
            </span>
            <input
              type="range"
              min={-10}
              max={10}
              step={1}
              value={val}
              onChange={(e) => handleBandChange(idx, Number(e.target.value))}
              className="h-16 w-1.5 appearance-none bg-slate-200 dark:bg-[#202538] rounded-full accent-purple-600 cursor-pointer -rotate-90 origin-center my-auto transition-all"
            />
            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-500 tracking-tighter mt-1">
              {frequencies[idx]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
