import React from 'react';
import { X, Trash2, Play, Music } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { formatTime } from '../../utils/formatters';

export const QueueDrawer: React.FC = () => {
  const {
    queue,
    currentSong,
    isQueueOpen,
    toggleQueueDrawer,
    playSong,
    removeFromQueue,
    clearQueue,
    isPlaying,
  } = usePlayer();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-[#0f121a]/95 backdrop-blur-2xl border-l border-[#1e2333] z-50 flex flex-col shadow-2xl animate-slide-in">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#1e2333] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-slate-100 font-['Outfit']">Play Queue</h3>
          <span className="text-xs text-slate-400 font-mono">({queue.length})</span>
        </div>
        <div className="flex items-center gap-1">
          {queue.length > 1 && (
            <button
              onClick={clearQueue}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#1a1f2e] rounded-lg transition-colors"
              title="Clear Queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={toggleQueueDrawer}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1a1f2e] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Currently Playing Card */}
        {currentSong && (
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider px-2">
              Now Playing
            </span>
            <div className="mt-1.5 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-11 h-11 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{currentSong.title}</div>
                <div className="text-xs text-purple-300/80 truncate">{currentSong.artistName}</div>
              </div>
              <span className="text-xs text-purple-400 font-mono">
                {formatTime(currentSong.duration)}
              </span>
            </div>
          </div>
        )}

        {/* Up Next List */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
            Up Next
          </span>
          <div className="mt-1.5 space-y-1">
            {queue.length <= 1 ? (
              <div className="text-xs text-slate-500 p-4 text-center">
                Queue is empty. Discover new music to add tracks!
              </div>
            ) : (
              queue.map((song, index) => {
                if (song._id === currentSong?._id) return null;
                return (
                  <div
                    key={`${song._id}-${index}`}
                    className="group flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[#181d2a] transition-colors"
                  >
                    <div
                      onClick={() => playSong(song)}
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-purple-400 transition-colors">
                          {song.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {song.artistName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500">
                        {formatTime(song.duration)}
                      </span>
                      <button
                        onClick={() => removeFromQueue(index)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                        title="Remove from queue"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
