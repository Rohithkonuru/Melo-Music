import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Shuffle,
  Clock,
  Trash2,
  Edit2,
  Share2,
  Lock,
  Globe,
  Check,
  X,
} from 'lucide-react';
import { Playlist, Song } from '../types';
import { musicService } from '../services/musicService';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SongRow } from '../components/SongRow';
import { formatTime } from '../utils/formatters';

export const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const { playSong } = usePlayer();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadPlaylist = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const pl = await musicService.getPlaylistById(id);
      setPlaylist(pl);
      setEditName(pl.name);
      setEditDesc(pl.description || '');
    } catch {
      showToast('Playlist not found', 'error');
      navigate('/library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  if (isLoading || !playlist) {
    return (
      <div className="py-24 text-center text-zinc-400 text-xs animate-pulse">Loading playlist...</div>
    );
  }

  const songs: Song[] = playlist.songs || [];
  const totalDuration = songs.reduce((acc, curr) => acc + (curr?.duration || 0), 0);
  const ownerId = typeof playlist.owner === 'object' ? (playlist.owner as any)?._id : playlist.owner;
  const isOwner = (user && (user.id === ownerId || user._id === ownerId)) || isAdmin;

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const handleShuffle = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    try {
      await musicService.removeSongFromPlaylist(playlist._id, songId);
      setPlaylist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          songs: prev.songs.filter((s) => s._id !== songId),
        };
      });
      showToast('Removed song from playlist', 'info');
    } catch {
      showToast('Failed to remove song', 'error');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm(`Delete "${playlist.name}"?`)) return;
    try {
      await musicService.deletePlaylist(playlist._id);
      showToast('Playlist deleted', 'info');
      navigate('/library');
    } catch {
      showToast('Failed to delete playlist', 'error');
    }
  };

  const handleTogglePrivacy = async () => {
    try {
      const updated = await musicService.updatePlaylist(playlist._id, {
        isPublic: !playlist.isPublic,
      });
      setPlaylist(updated);
      showToast(updated.isPublic ? 'Playlist is now public' : 'Playlist is now private', 'success');
    } catch {
      showToast('Failed to update privacy', 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    try {
      const updated = await musicService.updatePlaylist(playlist._id, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setPlaylist(updated);
      setIsEditing(false);
      showToast('Playlist details updated', 'success');
    } catch {
      showToast('Failed to update playlist', 'error');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Playlist link copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="p-6 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-2xl flex flex-col sm:flex-row sm:items-end gap-5 shadow-xs">
        <img
          src={
            playlist.coverUrl ||
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'
          }
          alt={playlist.name}
          className="w-32 h-32 md:w-36 md:h-36 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider font-semibold">
            <span>Playlist</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {playlist.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {playlist.isPublic ? 'Public' : 'Private'}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-lg font-bold text-zinc-900 dark:text-zinc-100"
                placeholder="Playlist name"
              />
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3 py-1 bg-zinc-50 dark:bg-zinc-800 border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-xs text-zinc-600 dark:text-zinc-400"
                placeholder="Description (optional)"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  {playlist.description}
                </p>
              )}
            </>
          )}

          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2">
            <span>{songs.length} songs</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(totalDuration)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play</span>
          </button>

          <button
            onClick={handleShuffle}
            disabled={songs.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={handleShare}
            className="p-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            title="Share playlist link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {isOwner && (
            <>
              <button
                onClick={() => setIsEditing((prev) => !prev)}
                className="p-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                title="Rename playlist"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePrivacy}
                className="p-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                title={playlist.isPublic ? 'Make Private' : 'Make Public'}
              >
                {playlist.isPublic ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDeletePlaylist}
                className="p-2 rounded-lg border border-red-200 dark:border-red-950/60 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600"
                title="Delete playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Track List */}
      {songs.length > 0 ? (
        <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-1 divide-y divide-[#E4E4E7]/60 dark:divide-[#27272A]/60 shadow-xs">
          {songs.map((song, idx) => (
            <SongRow
              key={`${song._id}-${idx}`}
              song={song}
              index={idx}
              playlistContext={songs}
              onRemove={isOwner ? handleRemoveSong : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-2 border border-dashed border-[#E4E4E7] dark:border-[#27272A] rounded-xl">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">This playlist is empty.</p>
          <p className="text-xs text-zinc-500">Find tracks and use "Add to playlist" to build your collection.</p>
          <button
            onClick={() => navigate('/discover')}
            className="mt-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shadow-xs"
          >
            Discover Songs
          </button>
        </div>
      )}
    </div>
  );
};
