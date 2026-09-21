import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  MoreHorizontal,
  Plus,
  ListPlus,
  Heart,
  User,
  ListStart,
} from 'lucide-react';
import { Song } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface SongCardProps {
  song: Song;
  playlistContext?: Song[];
  onAddToPlaylist?: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, playlistContext, onAddToPlaylist }) => {
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

  // Close menu on click outside
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
      className="group relative bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] hover:border-zinc-300 dark:hover:border-zinc-700 p-3 rounded-xl transition-all shadow-xs cursor-pointer flex flex-col justify-between"
    >
      {/* Artwork Container */}
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2.5 bg-zinc-100 dark:bg-zinc-800">
        <img
          src={song.coverUrl}
          alt={song.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {/* Play Action Button Overlay */}
        <div
          className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity ${
            isPlayingCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            onClick={handlePlayClick}
            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
            aria-label={isPlayingCurrent ? 'Pause' : 'Play'}
          >
            {isPlayingCurrent ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Like indicator on top right */}
        {liked && (
          <div className="absolute top-2 right-2">
            <Heart className="w-4 h-4 fill-purple-600 text-purple-600 drop-shadow-xs" />
          </div>
        )}
      </div>

      {/* Metadata & Working Menu */}
      <div className="flex items-start justify-between gap-2 pt-0.5">
        <div className="min-w-0 flex-1">
          <h4
            className={`text-sm font-medium truncate ${
              isCurrent ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {song.title}
          </h4>
          <p
            onClick={(e) => {
              if (artistId) {
                e.stopPropagation();
                navigate(`/artist/${artistId}`);
              }
            }}
            className="text-xs text-zinc-500 dark:text-zinc-400 truncate hover:text-zinc-800 dark:hover:text-zinc-200 mt-0.5 cursor-pointer"
          >
            {song.artistName}
          </p>
        </div>

        {/* Dropdown Menu Trigger */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="More options"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Clean Functional Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-1 w-44 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg shadow-lg py-1 z-50 text-xs">
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

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  toggleLike(song._id);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-purple-600 text-purple-600' : ''}`} />
                <span>{liked ? 'Unlike' : 'Like'}</span>
              </button>

              {artistId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    navigate(`/artist/${artistId}`);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left border-t border-[#E4E4E7] dark:border-[#27272A] mt-1 pt-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Go to artist</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
