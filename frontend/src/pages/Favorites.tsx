import React, { useState, useEffect } from 'react';
import { Heart, Play, Clock } from 'lucide-react';
import { Song } from '../types';
import { userService } from '../services/userService';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { SongRow } from '../components/SongRow';
import { formatTime } from '../utils/formatters';

export const Favorites: React.FC = () => {
  const [favoriteSongs, setFavoriteSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { playSong } = usePlayer();
  const { isAuthenticated } = useAuth();

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const songs = await userService.getFavorites();
        setFavoriteSongs(songs);
      } else {
        setFavoriteSongs([]);
      }
    } catch {
      setFavoriteSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated]);

  const handlePlayAll = () => {
    if (favoriteSongs.length > 0) {
      playSong(favoriteSongs[0], favoriteSongs);
    }
  };

  const totalDuration = favoriteSongs.reduce((acc, curr) => acc + (curr.duration || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Clean Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <Heart className="w-14 h-14 sm:w-16 sm:h-16 fill-current" />
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Playlist
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
            Liked Songs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2">
            Your personal collection of favorite tracks across Melomix.
          </p>

          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{favoriteSongs.length} songs</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(totalDuration)}</span>
            </span>
          </div>

          <div className="mt-4">
            <button
              onClick={handlePlayAll}
              disabled={favoriteSongs.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-xs transition-colors shadow-sm active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Song List */}
      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 text-xs animate-pulse">
            Loading your liked tracks...
          </div>
        ) : favoriteSongs.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 dark:text-zinc-400">
            <Heart className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No liked songs yet</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Hit the heart icon on any song you enjoy to build your Favorites collection.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {favoriteSongs.map((song, idx) => (
              <SongRow
                key={song._id}
                song={song}
                index={idx}
                playlistContext={favoriteSongs}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
