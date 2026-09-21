import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  ListMusic,
  Maximize2,
  AlertCircle,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { formatTime } from '../../utils/formatters';

interface BottomPlayerProps {
  onToggleNowPlaying?: () => void;
  isNowPlayingOpen?: boolean;
}

export const BottomPlayer: React.FC<BottomPlayerProps> = ({
  onToggleNowPlaying,
  isNowPlayingOpen,
}) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    playbackError,
    retryPlayback,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleQueueDrawer,
    isLiked,
    toggleLike,
  } = usePlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  if (!currentSong) return null;

  const liked = isLiked(currentSong._id);
  const effectiveProgress = isSeeking ? seekValue : currentTime;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSeeking(true);
    setSeekValue(Number(e.target.value));
  };

  const handleSeekCommit = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    setIsSeeking(false);
    seek(Number((e.target as HTMLInputElement).value));
  };

  const artistId = typeof currentSong.artist === 'object' && currentSong.artist?._id ? (currentSong.artist as any)._id : currentSong.artist;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#18181B] border-t border-[#E4E4E7] dark:border-[#27272A] px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm transition-colors">
      {/* Playback Error Alert Toast */}
      {playbackError && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3.5 py-1.5 bg-rose-600 text-white text-[11px] font-medium rounded-full shadow-lg flex items-center gap-2.5 z-50 animate-fade-in whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Unable to play this track</span>
          <button
            onClick={retryPlayback}
            className="underline font-bold hover:text-zinc-100 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={playNext}
            className="underline text-zinc-200 hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Track Details */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-2/5 sm:w-1/4">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {currentSong.title}
            </div>
            <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {artistId ? (
                <Link to={`/artist/${artistId}`} className="hover:underline hover:text-zinc-800 dark:hover:text-zinc-200">
                  {currentSong.artistName}
                </Link>
              ) : (
                <span>{currentSong.artistName}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => toggleLike(currentSong._id)}
            className="p-1.5 text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shrink-0"
            title={liked ? 'Unlike' : 'Like'}
            aria-label="Like"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${liked ? 'fill-purple-600 text-purple-600' : ''}`} />
          </button>
        </div>

        {/* Center: Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center max-w-lg flex-1 sm:w-2/4 px-1">
          <div className="flex items-center gap-2 sm:gap-4 mb-0.5 sm:mb-1">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded transition-colors hidden sm:block ${
                isShuffle ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Shuffle"
              aria-label="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={playPrevious}
              className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="Previous"
              aria-label="Previous"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="Next"
              aria-label="Next"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded transition-colors hidden sm:block ${
                isRepeat ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Repeat"
              aria-label="Repeat"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrubbable Progress Bar */}
          <div className="w-full flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            <span className="w-7 sm:w-8 text-right shrink-0">{formatTime(effectiveProgress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={effectiveProgress}
              onChange={handleSeekChange}
              onMouseUp={handleSeekCommit}
              onTouchEnd={handleSeekCommit}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              aria-label="Seek track"
            />
            <span className="w-7 sm:w-8 shrink-0">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Now Playing Actions */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 w-auto sm:w-1/4">
          {/* Now Playing Drawer Button */}
          {onToggleNowPlaying && (
            <button
              onClick={onToggleNowPlaying}
              className={`p-1.5 rounded-md transition-colors ${
                isNowPlayingOpen
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Now Playing"
              aria-label="Now Playing"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          {/* Queue Drawer Button */}
          <button
            onClick={toggleQueueDrawer}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            title="Queue"
            aria-label="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              aria-label="Toggle mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-zinc-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
