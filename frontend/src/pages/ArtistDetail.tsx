import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { UserCheck, UserPlus, Play } from 'lucide-react';
import { Artist, Song, Album } from '../types';
import { musicService } from '../services/musicService';
import { userService } from '../services/userService';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SongRow } from '../components/SongRow';
import { formatNumber } from '../utils/formatters';

export const ArtistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { playSong } = usePlayer();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const { onOpenPlaylistModal } = (useOutletContext<{ onOpenPlaylistModal?: () => void }>() || {});

  useEffect(() => {
    const loadArtist = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await musicService.getArtistById(id);
        setArtist(data);

        if (isAuthenticated && user?.followedArtists) {
          setIsFollowing(user.followedArtists.includes(id));
        }
      } catch {
        showToast('Artist not found', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadArtist();
  }, [id, isAuthenticated, user]);

  if (isLoading || !artist) {
    return (
      <div className="py-24 text-center text-zinc-400 text-xs animate-pulse">Loading artist profile...</div>
    );
  }

  const songs: Song[] = artist.songs || [];
  const albums: Album[] = artist.albums || [];

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to follow artists', 'info');
      return;
    }
    try {
      const res = await userService.toggleFollowArtist(artist._id);
      setIsFollowing(res.isFollowing);
      setArtist((prev) => (prev ? { ...prev, followers: res.artistFollowers } : prev));
      showToast(res.isFollowing ? `Following ${artist.name}` : `Unfollowed ${artist.name}`, 'info');
    } catch {
      showToast('Failed to update follow status', 'error');
    }
  };

  const handlePlayPopular = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Clean Artist Header */}
      <div className="p-6 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-2xl flex flex-col sm:flex-row sm:items-center gap-5 shadow-xs">
        <img
          src={artist.image}
          alt={artist.name}
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Verified Artist</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
            {artist.name}
          </h1>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {formatNumber(artist.followers)} followers
          </p>

          <div className="flex items-center gap-2.5 mt-4">
            <button
              onClick={handlePlayPopular}
              disabled={songs.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play</span>
            </button>

            <button
              onClick={handleToggleFollow}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                isFollowing
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                  : 'bg-white dark:bg-[#18181B] border-[#E4E4E7] dark:border-[#27272A] text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Popular Songs Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Popular Songs
        </h2>

        {songs.length > 0 ? (
          <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-1 divide-y divide-[#E4E4E7]/60 dark:divide-[#27272A]/60 shadow-xs">
            {songs.map((song, idx) => (
              <SongRow
                key={song._id}
                song={song}
                index={idx}
                playlistContext={songs}
                onAddToPlaylist={onOpenPlaylistModal ? () => onOpenPlaylistModal() : undefined}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">No tracks available for this artist.</p>
        )}
      </section>

      {/* Discography / Albums Section */}
      {albums.length > 0 && (
        <section className="space-y-3 pb-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Albums
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {albums.map((album) => (
              <div
                key={album._id}
                className="p-3 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl shadow-xs"
              >
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full aspect-square object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-2"
                />
                <h3 className="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate">{album.title}</h3>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {album.releaseDate ? new Date(album.releaseDate).getFullYear() : ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
