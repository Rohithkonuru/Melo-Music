import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Play, Headphones } from 'lucide-react';
import { ListeningHistoryItem } from '../types';
import { userService } from '../services/userService';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { formatTime, formatDate } from '../utils/formatters';

export const History: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<ListeningHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { playSong } = usePlayer();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated) {
          const items = await userService.getHistory(50);
          setHistoryItems(items);
        } else {
          setHistoryItems([]);
        }
      } catch {
        setHistoryItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [isAuthenticated]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
          <HistoryIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>Listening History</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Your recently streamed tracks and playback timestamps.
        </p>
      </div>

      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 text-xs animate-pulse">
            Loading listening history...
          </div>
        ) : historyItems.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 dark:text-zinc-400">
            <Headphones className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No playback history yet</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Start playing songs to track your listening history and power AI recommendations.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {historyItems.map((item, idx) => {
              const song = item.song;
              if (!song) return null;

              return (
                <div
                  key={`${item._id}-${idx}`}
                  onClick={() => playSong(song)}
                  className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer border border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-700/50"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-11 h-11 rounded-lg object-cover shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                        {song.title}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {song.artistName} • {song.genre}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="hidden sm:block text-right">
                      <div className="text-zinc-700 dark:text-zinc-300 font-medium">{formatDate(item.playedAt)}</div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {new Date(item.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="font-mono text-zinc-400 dark:text-zinc-500 text-xs shrink-0">
                      {formatTime(item.durationPlayed || song.duration)}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playSong(song);
                      }}
                      className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/30 group-hover:bg-purple-600 text-purple-600 dark:text-purple-400 group-hover:text-white flex items-center justify-center transition-colors shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
