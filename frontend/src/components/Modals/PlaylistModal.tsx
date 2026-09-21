import React, { useState, useEffect } from 'react';
import { X, Plus, FolderPlus } from 'lucide-react';
import { Playlist, Song } from '../../types';
import { musicService } from '../../services/musicService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  songToAdd?: Song | null;
  onPlaylistCreated?: (playlist: Playlist) => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  songToAdd,
  onPlaylistCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'add'>(songToAdd ? 'add' : 'create');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      musicService.getPlaylists({ userId: user.id || user._id }).then((res) => {
        setUserPlaylists(res.data);
      }).catch(() => {});
    }
    if (songToAdd) {
      setActiveTab('add');
    }
  }, [isOpen, isAuthenticated, user, songToAdd]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!isAuthenticated) {
      showToast('Please log in to create playlists', 'info');
      return;
    }

    setIsLoading(true);
    try {
      const newPlaylist = await musicService.createPlaylist({
        name: name.trim(),
        description: description.trim(),
        isPublic,
      });

      if (songToAdd) {
        await musicService.addSongToPlaylist(newPlaylist._id, songToAdd._id);
      }

      showToast(`Playlist "${newPlaylist.name}" created!`, 'success');
      if (onPlaylistCreated) onPlaylistCreated(newPlaylist);
      setName('');
      setDescription('');
      onClose();
    } catch {
      showToast('Failed to create playlist', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToExisting = async (playlistId: string, playlistName: string) => {
    if (!songToAdd) return;
    try {
      await musicService.addSongToPlaylist(playlistId, songToAdd._id);
      showToast(`Added "${songToAdd.title}" to ${playlistName}!`, 'success');
      onClose();
    } catch {
      showToast('Failed to add song to playlist', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {songToAdd ? 'Add to Playlist' : 'Create Playlist'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher if songToAdd is present */}
        {songToAdd && (
          <div className="flex border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-2.5 text-center transition-colors ${
                activeTab === 'add'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 bg-purple-50/50 dark:bg-purple-950/20'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Choose Existing
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2.5 text-center transition-colors ${
                activeTab === 'create'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 bg-purple-50/50 dark:bg-purple-950/20'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              New Playlist
            </button>
          </div>
        )}

        {/* Tab: Add to Existing Playlist */}
        {activeTab === 'add' && songToAdd ? (
          <div className="p-4 max-h-72 overflow-y-auto space-y-1.5">
            {userPlaylists.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500 dark:text-zinc-400">
                You don't have any playlists yet.
                <button
                  onClick={() => setActiveTab('create')}
                  className="block mx-auto mt-2 text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                >
                  Create your first playlist
                </button>
              </div>
            ) : (
              userPlaylists.map((pl) => (
                <button
                  key={pl._id}
                  onClick={() => handleAddToExisting(pl._id, pl.name)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800/80 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={pl.coverUrl}
                      alt={pl.name}
                      className="w-9 h-9 rounded-lg object-cover shadow-2xs"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {pl.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {pl.songs?.length || 0} tracks
                      </div>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                </button>
              ))
            )}
          </div>
        ) : (
          /* Tab: Create New Playlist */
          <form onSubmit={handleCreate} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Playlist Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chill Focus Mix"
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is the mood of this playlist?"
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-600 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-zinc-300 dark:border-zinc-700"
              />
              <label htmlFor="isPublic" className="text-xs text-zinc-600 dark:text-zinc-400 select-none cursor-pointer">
                Public playlist (visible in discovery)
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-semibold text-white shadow-xs transition-all"
              >
                {isLoading ? 'Creating...' : 'Create Playlist'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
