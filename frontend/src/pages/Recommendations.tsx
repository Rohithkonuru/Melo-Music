import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Play, RefreshCw, Compass } from 'lucide-react';
import { Song } from '../types';
import { aiService } from '../services/aiService';
import { musicService } from '../services/musicService';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { SongRow } from '../components/SongRow';

export const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [fallbackSongs, setFallbackSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { playSong } = usePlayer();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { onOpenPlaylistModal } = (useOutletContext<{ onOpenPlaylistModal?: () => void }>() || {});

  const fetchRecommendations = async () => {
    setIsRefreshing(true);
    try {
      const res = await aiService.getRecommendations(15);
      const recs = res.recommendations || [];
      setRecommendations(recs);

      // If recommendations are empty, fetch fallback trending songs
      if (recs.length === 0) {
        const fallbacks = await musicService.getTrendingSongs(10);
        setFallbackSongs(fallbacks);
      }
    } catch {
      const fallbacks = await musicService.getTrendingSongs(10);
      setFallbackSongs(fallbacks);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [isAuthenticated]);

  const activeSongs = recommendations.length > 0 ? recommendations : fallbackSongs;

  const handlePlayAll = () => {
    if (activeSongs.length > 0) {
      playSong(activeSongs[0], activeSongs);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            For You
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Made for you based on your listening.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePlayAll}
            disabled={activeSongs.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play All</span>
          </button>

          <button
            onClick={fetchRecommendations}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notice if displaying fallback */}
      {recommendations.length === 0 && !isLoading && (
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-zinc-600 dark:text-zinc-400">
            Start listening to get personalized recommendations. Here are some trending songs to start with:
          </span>
          <button
            onClick={() => navigate('/discover')}
            className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium hover:underline shrink-0"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover music</span>
          </button>
        </div>
      )}

      {/* Songs List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-zinc-200 dark:bg-zinc-800/60 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : activeSongs.length > 0 ? (
        <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-1 divide-y divide-[#E4E4E7]/60 dark:divide-[#27272A]/60 shadow-xs">
          {activeSongs.map((song, idx) => (
            <SongRow
              key={song._id}
              song={song}
              index={idx}
              playlistContext={activeSongs}
              onAddToPlaylist={onOpenPlaylistModal ? () => onOpenPlaylistModal() : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-zinc-400 text-xs">
          No recommendations available at this time.
        </div>
      )}
    </div>
  );
};
