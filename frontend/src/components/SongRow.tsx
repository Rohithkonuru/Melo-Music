import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  ListStart,
  Plus,
  ListPlus,
  Trash2,
  User,
} from 'lucide-react';
import { Song } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatters';

interface SongRowProps {
  song: Song;
  index: number;
  playlistContext?: Song[];
  showAlbum?: boolean;
  onRemove?: (songId: string) => void;
  onAddToPlaylist?: (song: Song) => void;
}

export const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  playlistContext,
  showAlbum = true,
  onRemove,
  onAddToPlaylist,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    playNextInQueue,
    addToQueue,
    isLiked,
    toggleLike,
  } = usePlayer();

  const isCurrent = currentSong?._id === song._id;
  const isPlayingCurrent = isCurrent && isPlaying;
  const liked = isLiked(song._id);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlistContext);
    }
  };

  const artistId = typeof song.artist === 'object' && song.artist?._id ? (song.artist as any)._id : song.artist;

  return (
    <div
      onClick={() => playSong(song, playlistContext)}
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer text-sm ${
        isCurrent
          ? 'bg-purple-50/60 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300'
          : 'text-zinc-700 dark:text-zinc-300'
      }`}
    >
      {/* Index or Play Icon */}
      <div className="w-6 text-center shrink-0 flex items-center justify-center">
        {isPlayingCurrent ? (
          <span className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 h-2 bg-purple-600 animate-bounce"></span>
            <span className="w-0.5 h-3 bg-purple-600 animate-bounce delay-75"></span>
            <span className="w-0.5 h-2 bg-purple-600 animate-bounce delay-150"></span>
          </span>
        ) : (
          <>
            <span className="group-hover:hidden text-xs font-mono text-zinc-400">
              {index + 1}
            </span>
            <button
              onClick={handlePlayClick}
              className="hidden group-hover:flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400"
              aria-label="Play song"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </>
        )}
      </div>

      {/* Artwork Thumbnail */}
      <img
        src={song.coverUrl}
        alt={song.title}
        className="w-10 h-10 rounded-md object-cover shrink-0 bg-zinc-200 dark:bg-zinc-800"
      />

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium truncate text-sm ${
            isCurrent ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-zinc-900 dark:text-zinc-100'
          }`}
        >
          {song.title}
        </div>
        <div
          onClick={(e) => {
            if (artistId) {
              e.stopPropagation();
              navigate(`/artist/${artistId}`);
            }
          }}
          className="text-xs text-zinc-500 dark:text-zinc-400 truncate hover:text-zinc-800 dark:hover:text-zinc-200 mt-0.5 cursor-pointer"
        >
          {song.artistName}
        </div>
      </div>

      {/* Album (optional) */}
      {showAlbum && (
        <div className="hidden md:block w-1/4 text-xs text-zinc-500 dark:text-zinc-400 truncate">
          {song.albumTitle || '—'}
        </div>
      )}

      {/* Duration */}
      <div className="w-12 text-right font-mono text-xs text-zinc-400 shrink-0">
        {formatTime(song.duration)}
      </div>

      {/* Like Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleLike(song._id);
        }}
        className="p-1.5 text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shrink-0"
        title={liked ? 'Unlike' : 'Like'}
        aria-label="Like"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            liked ? 'fill-purple-600 text-purple-600' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        />
      </button>

      {/* More Options Dropdown */}
      <div ref={menuRef} className="relative shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen((prev) => !prev);
          }}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          title="More options"
          aria-label="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg shadow-lg py-1 z-50 text-xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                playSong(song, playlistContext);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Play</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                playNextInQueue(song);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
            >
              <ListStart className="w-3.5 h-3.5" />
              <span>Play next</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                addToQueue(song);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to queue</span>
            </button>

            {onAddToPlaylist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onAddToPlaylist(song);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>Add to playlist</span>
              </button>
            )}

            {artistId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  navigate(`/artist/${artistId}`);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
              >
                <User className="w-3.5 h-3.5" />
                <span>Go to artist</span>
              </button>
            )}

            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onRemove(song._id);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-left border-t border-[#E4E4E7] dark:border-[#27272A] mt-1 pt-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove from playlist</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
