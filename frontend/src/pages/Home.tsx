import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Song } from '../types';
import { musicService } from '../services/musicService';
import { aiService } from '../services/aiService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { SongCard } from '../components/SongCard';
import { SongRow } from '../components/SongRow';

export const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { onOpenPlaylistModal } = (useOutletContext<{ onOpenPlaylistModal?: () => void }>() || {});

  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoading(true);
      try {
        const [trendRes, recRes, newReleasesRes] = await Promise.all([
          musicService.getTrendingSongs(6),
          aiService.getRecommendations(6),
          musicService.getNewReleases(5),
        ]);

        setTrending(trendRes);
        setRecommendations(recRes.recommendations || []);

        if (isAuthenticated) {
          try {
            const histRes = await userService.getHistory(5);
            if (histRes && histRes.length > 0) {
              setRecentlyPlayed(histRes.map((h: any) => h.song || h).filter(Boolean));
            } else {
              setRecentlyPlayed(newReleasesRes);
            }
          } catch {
            setRecentlyPlayed(newReleasesRes);
          }
        } else {
          setRecentlyPlayed(newReleasesRes);
        }
      } catch (err) {
        console.error('Failed to load home feed', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, [isAuthenticated]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Greeting & Search */}
      <section className="space-y-4 pt-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {getGreeting()} 👋
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            What do you want to listen to?
          </p>
        </div>

        {/* Clean Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search music, artists, albums..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-purple-600 dark:focus:border-purple-500 shadow-xs transition-colors"
          />
        </form>
      </section>

      {/* Made For You (Compact Cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Made for you
          </h2>
          <button
            onClick={() => navigate('/recommendations')}
            className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
          >
            See all
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-200 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recommendations.slice(0, 6).map((song) => (
              <SongCard
                key={song._id}
                song={song}
                playlistContext={recommendations}
                onAddToPlaylist={onOpenPlaylistModal ? () => onOpenPlaylistModal() : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-[#E4E4E7] dark:border-[#27272A] rounded-xl text-xs text-zinc-500">
            Start listening to get personalized recommendations.
          </div>
        )}
      </section>

      {/* Recently Played (Compact Rows) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Recently played
          </h2>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
          >
            Full history
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-zinc-200 dark:bg-zinc-800/60 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentlyPlayed.length > 0 ? (
          <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-1 divide-y divide-[#E4E4E7]/60 dark:divide-[#27272A]/60 shadow-xs">
            {recentlyPlayed.map((song, idx) => (
              <SongRow
                key={`${song._id}-${idx}`}
                song={song}
                index={idx}
                playlistContext={recentlyPlayed}
                onAddToPlaylist={onOpenPlaylistModal ? () => onOpenPlaylistModal() : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-[#E4E4E7] dark:border-[#27272A] rounded-xl text-xs text-zinc-500">
            No recently played songs yet.
          </div>
        )}
      </section>

      {/* Trending Now (Compact Rows) */}
      <section className="space-y-3 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Trending now
          </h2>
          <button
            onClick={() => navigate('/discover')}
            className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
          >
            Discover more
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-zinc-200 dark:bg-zinc-800/60 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : trending.length > 0 ? (
          <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-1 divide-y divide-[#E4E4E7]/60 dark:divide-[#27272A]/60 shadow-xs">
            {trending.map((song, idx) => (
              <SongRow
                key={song._id}
                song={song}
                index={idx}
                playlistContext={trending}
                onAddToPlaylist={onOpenPlaylistModal ? () => onOpenPlaylistModal() : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-[#E4E4E7] dark:border-[#27272A] rounded-xl text-xs text-zinc-500">
            No trending songs found.
          </div>
        )}
      </section>
    </div>
  );
};
