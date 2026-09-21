import React, { useState } from 'react';
import { Sun, Moon, Volume2, Shield, RefreshCw, Check, Sliders } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const EQ_PRESETS = [
  { id: 'flat', name: 'Flat', desc: 'Neutral, uncolored audio profile' },
  { id: 'bass', name: 'Bass Boost', desc: 'Enhanced sub-frequencies (60Hz & 230Hz)' },
  { id: 'vocal', name: 'Vocal Boost', desc: 'Clear dialogue and prominent mids' },
  { id: 'electronic', name: 'Electronic', desc: 'Punchy lows and crisp high-end' },
  { id: 'acoustic', name: 'Acoustic', desc: 'Natural timbre for instruments and strings' },
];

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { autoplay, toggleAutoplay, setVolume } = usePlayer();
  const { showToast } = useToast();

  const [eqPreset, setEqPreset] = useState(() => {
    return localStorage.getItem('melomix_eq_preset') || 'flat';
  });

  const [defaultVol, setDefaultVol] = useState(() => {
    const saved = localStorage.getItem('melomix_volume');
    return saved ? parseFloat(saved) : 0.8;
  });

  const handleEqPresetChange = (presetId: string) => {
    setEqPreset(presetId);
    localStorage.setItem('melomix_eq_preset', presetId);
    showToast(`Equalizer profile set to ${presetId.toUpperCase()}`, 'info');
  };

  const handleDefaultVolChange = (vol: number, label: string) => {
    setDefaultVol(vol);
    setVolume(vol);
    showToast(`Default volume set to ${label}`, 'info');
  };

  const handleClearCache = () => {
    if (window.confirm('Clear local audio cache and playback preferences? Your account login will be kept.')) {
      localStorage.removeItem('melomix_autoplay');
      localStorage.removeItem('melomix_eq_preset');
      localStorage.removeItem('melomix_volume');
      localStorage.removeItem('melomix_recent_searches');
      showToast('Playback preferences cleared successfully', 'success');
      setTimeout(() => window.location.reload(), 600);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your playback preferences, equalizer presets, appearance, and account.
        </p>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
          <span>Appearance & Theme</span>
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
          Select between clean daylight mode or deep dark mode.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
              theme === 'light'
                ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 text-zinc-900 dark:text-zinc-100 ring-2 ring-purple-600/30'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold flex items-center justify-between">
                <span>Bright Light Theme</span>
                {theme === 'light' && <Check className="w-4 h-4 text-purple-600" />}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Clean daylight zinc palette (#F8F8FA)
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
              theme === 'dark'
                ? 'border-purple-500 bg-purple-950/30 text-zinc-100 ring-2 ring-purple-500/30'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-800 text-purple-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold flex items-center justify-between">
                <span>Deep Dark Theme</span>
                {theme === 'dark' && <Check className="w-4 h-4 text-purple-400" />}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Zinc black sleek appearance (#09090B)
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Audio Playback Settings */}
      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Audio & Playback Controls</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Tune hardware equalizer profiles, autoplay behavior, and default volume.
          </p>
        </div>

        {/* Equalizer Preset Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Default Equalizer Profile</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {EQ_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleEqPresetChange(preset.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  eqPreset === preset.id
                    ? 'border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 ring-1 ring-purple-600/30'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="text-xs font-semibold flex items-center justify-between">
                  <span>{preset.name}</span>
                  {eqPreset === preset.id && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {preset.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Default Volume Level */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            Default Playback Volume
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { val: 0.4, label: 'Low (40%)' },
              { val: 0.7, label: 'Medium (70%)' },
              { val: 0.9, label: 'High (90%)' },
            ].map((v) => (
              <button
                key={v.label}
                type="button"
                onClick={() => handleDefaultVolChange(v.val, v.label)}
                className={`py-2 px-3 rounded-xl border text-center text-xs font-medium transition-colors ${
                  Math.abs(defaultVol - v.val) < 0.1
                    ? 'border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Autoplay Toggle */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          <div className="py-2 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Continuous Autoplay
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Automatically transition to the next queue track when the current song completes.
              </div>
            </div>
            <button
              type="button"
              onClick={toggleAutoplay}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                autoplay ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  autoplay ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Account & Security</span>
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
          Your current session and profile credentials.
        </p>

        {user ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <img
                  src={
                    user.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
                  }
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-300 dark:ring-zinc-700"
                />
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {user.name}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user.email} • Role: <span className="font-semibold uppercase text-purple-600 dark:text-purple-400">{user.role}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/profile"
                className="px-3.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Edit Profile
              </Link>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={logout}
                className="text-xs font-semibold text-rose-600 hover:text-rose-500 transition-colors cursor-pointer"
              >
                Sign out of Melomix
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">You are browsing as Guest.</span>
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Cache & Diagnostics */}
      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Clear Playback Preferences
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Reset cached volume, saved equalizer presets, and autoplay preferences without logging you out.
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearCache}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Settings</span>
        </button>
      </div>
    </div>
  );
};
