import React, { useState, useEffect } from 'react';
import { User as UserIcon, Save, Mail, Shield, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face',
];

const ALL_GENRES = ['Lo-Fi', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Hip-Hop', 'Indie'];

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || PRESET_AVATARS[0]);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(user?.favoriteGenres || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      if (user.avatar) setAvatar(user.avatar);
      if (user.favoriteGenres) setFavoriteGenres(user.favoriteGenres);
    }
  }, [user]);

  const toggleGenre = (genre: string) => {
    setFavoriteGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await authService.updateProfile({
        name: name.trim(),
        avatar,
        favoriteGenres,
      });

      updateUser(updated);
      showToast('Profile updated successfully!', 'success');
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
          <UserIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>Profile & Preferences</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Customize your Melomix identity and discovery preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Avatar Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-3">
            Choose Your Avatar
          </label>
          <div className="flex items-center gap-4 flex-wrap">
            <img
              src={avatar}
              alt="Current Avatar"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-purple-600 shadow-sm"
            />

            <div className="flex gap-2">
              {PRESET_AVATARS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(preset)}
                  className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                    avatar === preset ? 'border-purple-600 ring-2 ring-purple-600/30' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-600 dark:focus:border-purple-500"
          />
        </div>

        {/* Email Field (Read-Only) */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-zinc-400" />
            <span>Email Address</span>
          </label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full bg-zinc-100/60 dark:bg-zinc-900/40 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 rounded-xl px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
          />
        </div>

        {/* Role & Member info */}
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Account Role:</span>
            <span className="text-xs font-semibold uppercase text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
              {user?.role || 'user'}
            </span>
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Member Since: <strong className="text-zinc-800 dark:text-zinc-200">{formatDate(user?.createdAt)}</strong>
          </div>
        </div>

        {/* Favorite Genres Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Favorite Genres (Tuning AI Recommendations)</span>
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {ALL_GENRES.map((genre) => {
              const isSelected = favoriteGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{genre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
