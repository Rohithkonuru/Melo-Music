import React, { useState } from 'react';
import {
  X,
  Music2,
  Sliders,
  Activity,
  ListMusic,
  Heart,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { LyricsWidget } from '../Widgets/LyricsWidget';
import { SoundEqualizerWidget } from '../Widgets/SoundEqualizerWidget';
import { AudioVisualizer } from '../Widgets/AudioVisualizer';
import { formatTime } from '../../utils/formatters';

interface NowPlayingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NowPlayingDrawer: React.FC<NowPlayingDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'lyrics' | 'queue' | 'equalizer' | 'visualizer'>('lyrics');
  const {
    currentSong,
    isPlaying,
    queue,
    removeFromQueue,
    playSong,
    isLiked,
    toggleLike,
  } = usePlayer();

  if (!isOpen || !currentSong) return null;

  const liked = isLiked(currentSong._id);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-[#18181B] border-l border-[#E4E4E7] dark:border-[#27272A] shadow-xl flex flex-col transition-all">
      {/* Drawer Header */}
      <div className="h-16 px-5 border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Now Playing</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Track Overview Card */}
      <div className="p-5 border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center gap-4">
        <img
          src={currentSong.coverUrl}
          alt={currentSong.title}
          className="w-16 h-16 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
            {currentSong.title}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
            {currentSong.artistName}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md">
              {currentSong.mood}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {formatTime(currentSong.duration)}
            </span>
          </div>
        </div>
        <button
          onClick={() => toggleLike(currentSong._id)}
          className="p-2 text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shrink-0"
          title={liked ? 'Unlike' : 'Like'}
          aria-label="Like"
        >
          <Heart
            className={`w-5 h-5 ${liked ? 'fill-purple-600 text-purple-600' : ''}`}
          />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E4E4E7] dark:border-[#27272A] px-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('lyrics')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors ${
            activeTab === 'lyrics'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Music2 className="w-3.5 h-3.5" />
          <span>Lyrics</span>
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors ${
            activeTab === 'queue'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Queue ({queue.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('equalizer')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors ${
            activeTab === 'equalizer'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Equalizer</span>
        </button>
        <button
          onClick={() => setActiveTab('visualizer')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors ${
            activeTab === 'visualizer'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Visualizer</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'lyrics' && (
          <div className="h-full flex flex-col justify-center">
            <LyricsWidget song={currentSong} />
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-1">
            {queue.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-10">Queue is empty</p>
            ) : (
              queue.map((s, idx) => {
                const isCurrentInQueue = s._id === currentSong._id;
                return (
                  <div
                    key={`${s._id}-${idx}`}
                    onClick={() => playSong(s)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer ${
                      isCurrentInQueue
                        ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-medium'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img src={s.coverUrl} alt={s.title} className="w-8 h-8 rounded-md object-cover shrink-0" />
                      <div className="min-w-0 flex-1 truncate">
                        <div className="truncate font-medium">{s.title}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{s.artistName}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(idx);
                      }}
                      className="p-1 text-zinc-400 hover:text-red-500 ml-2"
                      title="Remove from queue"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'equalizer' && (
          <div>
            <SoundEqualizerWidget />
          </div>
        )}

        {activeTab === 'visualizer' && (
          <div className="space-y-4 py-4">
            <AudioVisualizer isPlaying={isPlaying} />
            <p className="text-xs text-zinc-400 text-center">
              Spectrum procedurally tuned to {currentSong.mood} acoustics
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
