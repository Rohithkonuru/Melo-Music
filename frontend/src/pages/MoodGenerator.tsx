import React, { useState } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Play, BookmarkPlus, RefreshCw } from 'lucide-react';
import { Song } from '../types';
import { aiService } from '../services/aiService';
import { musicService } from '../services/musicService';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SongRow } from '../components/SongRow';

export const MoodGenerator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMood = searchParams.get('mood') || 'Chill';
  const { onOpenPlaylistModal } = (useOutletContext<{ onOpenPlaylistModal?: () => void }>() || {});

  const [mood, setMood] = useState(initialMood);
  const [genre, setGenre] = useState('Any');
  const [language, setLanguage] = useState('Any');
  const [count, setCount] = useState(10);
  const [generatedSongs, setGeneratedSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { playSong } = usePlayer();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const moods = ['Chill', 'Happy', 'Focus', 'Energetic', 'Romantic', 'Workout'];
  const genres = ['Any', 'Lo-Fi', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Hip-Hop', 'Indie'];
  const languages = ['Any', 'English', 'Hindi', 'Instrumental'];

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await aiService.generateMoodPlaylist({
        mood,
        genre: genre !== 'Any' ? genre : undefined,
        language: language !== 'Any' ? language : undefined,
        count,
      });

      setGeneratedSongs(res.songs || []);
      showToast(`Generated ${res.songs.length} tracks matching "${mood}"!`, 'success');
    } catch {
      showToast('Failed to generate mood playlist', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlaylist = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to save this playlist to your library', 'info');
      return;
    }
    if (generatedSongs.length === 0) return;

    setIsSaving(true);
    try {
      const created = await musicService.createPlaylist({
        name: `${mood} Vibes (${genre !== 'Any' ? genre : 'Mix'})`,
        description: `Curated AI playlist for ${mood.toLowerCase()} moments.`,
        isPublic: true,
      });

      for (const s of generatedSongs) {
        await musicService.addSongToPlaylist(created._id, s._id);
      }

      showToast(`Saved playlist "${created.name}" to your library!`, 'success');
      navigate(`/playlist/${created._id}`);
    } catch {
      showToast('Failed to save playlist', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayAll = () => {
    if (generatedSongs.length > 0) {
      playSong(generatedSongs[0], generatedSongs);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Create a playlist
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Custom playlists tuned to your feeling.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-5 sm:p-6 space-y-6 shadow-xs">
        {/* Mood Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            How are you feeling?
          </label>
          <div className="flex flex-wrap gap-2">
            {moods.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  mood === m
                    ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-[#E4E4E7] dark:border-[#27272A] text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns & Count */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Genre */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-600 dark:focus:border-purple-500"
            >
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-600 dark:focus:border-purple-500"
            >
              {languages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Song Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex justify-between">
              <span>Songs</span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">{count}</span>
            </label>
            <input
              type="range"
              min={5}
              max={20}
              step={5}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-600 mt-2"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Generate Playlist</span>
          </button>
        </div>
      </div>

      {/* Results View */}
      {generatedSongs.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Your playlist is ready 🎧
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {generatedSongs.length} tracks matching "{mood}"
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play All</span>
              </button>

              <button
                onClick={handleSavePlaylist}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save to Library'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-1 divide-y divide-[#E4E4E7]/60 dark:divide-[#27272A]/60 shadow-xs">
            {generatedSongs.map((song, idx) => (
              <SongRow
                key={song._id}
                song={song}
                index={idx}
                playlistContext={generatedSongs}
                onAddToPlaylist={onOpenPlaylistModal ? () => onOpenPlaylistModal() : undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
