import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Heart, ListMusic, History, Play } from 'lucide-react';
import { Playlist, Song } from '../types';
import { musicService } from '../services/musicService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { SongRow } from '../components/SongRow';

export const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'liked' | 'playlists' | 'recent'>('playlists');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { onOpenPlaylistModal } = (useOutletContext<{ onOpenPlaylistModal?: () => void }>() || {});

  useEffect(() => {
    const loadLibraryData = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated && user) {
          const [plRes, favsRes, histRes] = await Promise.all([
            musicService.getPlaylists({ userId: user.id || user._id }),
            userService.getFavorites(),
            userService.getHistory(30),
          ]);
          setPlaylists(plRes.data);
          setLikedSongs(favsRes);
          setRecentlyPlayed(histRes.map((h: any) => h.song || h).filter(Boolean));
        } else {
          const publicPl = await musicService.getPlaylists({ limit: 12 });
          setPlaylists(publicPl.data);
        }
      } catch (err) {
        console.error('Failed to load library', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLibraryData();
  }, [isAuthenticated, user]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Your Library
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Liked songs, playlists, and listening history.
          </p>
        </div>

        {onOpenPlaylistModal && (
          <button
            onClick={onOpenPlaylistModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Playlist</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E4E4E7] dark:border-[#27272A] pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-colors ${
            activeTab === 'liked'
              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Liked Songs ({likedSongs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-colors ${
            activeTab === 'playlists'
              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Playlists ({playlists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recent')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-colors ${
            activeTab === 'recent'
              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Recently Played ({recentlyPlayed.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="space-y-2 py-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-zinc-200 dark:bg-zinc-800/60 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'liked' ? (
        /* Liked Songs */
        likedSongs.length > 0 ? (
          <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-1 divide-y divide-[#E4E4E7]/60 dark:divide-[#27272A]/60 shadow-xs">
            {likedSongs.map((song, idx) => (
              <SongRow
                key={song._id}
                song={song}
                index={idx}
                playlistContext={likedSongs}
                onAddToPlaylist={onOpenPlaylistModal ? () => onOpenPlaylistModal() : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No liked songs yet.</p>
            <p className="text-xs text-zinc-500">Discover music and save your favorites here.</p>
            <button
              onClick={() => navigate('/discover')}
              className="mt-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shadow-xs"
            >
              Discover Music
            </button>
          </div>
        )
      ) : activeTab === 'playlists' ? (
        /* Playlists Grid */
        playlists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {playlists.map((pl) => (
              <Link
                key={pl._id}
                to={`/playlist/${pl._id}`}
                className="group p-3 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition-colors"
              >
                <img
                  src={
                    pl.coverUrl ||
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'
                  }
                  alt={pl.name}
                  className="w-full aspect-square object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-2.5"
                />
                <h3 className="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {pl.name}
                </h3>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {pl.songs?.length || 0} tracks
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No playlists yet.</p>
            <p className="text-xs text-zinc-500">Create your first custom playlist to organize your music.</p>
            {onOpenPlaylistModal && (
              <button
                onClick={onOpenPlaylistModal}
                className="mt-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shadow-xs"
              >
                Create Playlist
              </button>
            )}
          </div>
        )
      ) : (
        /* Recently Played */
        recentlyPlayed.length > 0 ? (
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
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No recently played tracks.</p>
            <p className="text-xs text-zinc-500">Tracks you listen to will appear here automatically.</p>
            <button
              onClick={() => navigate('/discover')}
              className="mt-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shadow-xs"
            >
              Discover Music
            </button>
          </div>
        )
      )}
    </div>
  );
};
