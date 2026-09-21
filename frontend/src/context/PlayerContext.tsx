import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Song } from '../types';
import { musicService } from '../services/musicService';
import { userService } from '../services/userService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface PlayerContextValue {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  queue: Song[];
  isQueueOpen: boolean;
  likedSongIds: Set<string>;
  playbackError: string | null;
  autoplay: boolean;
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleAutoplay: () => void;
  addToQueue: (song: Song) => void;
  playNextInQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleQueueDrawer: () => void;
  toggleLike: (songId: string) => Promise<void>;
  isLiked: (songId: string) => boolean;
  retryPlayback: () => void;
  clearPlaybackError: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('melomix_volume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState<boolean>(() => {
    return localStorage.getItem('melomix_autoplay') !== 'false';
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playStartTimeRef = useRef<number>(0);
  const currentSongRef = useRef<Song | null>(null);
  const queueRef = useRef<Song[]>([]);
  const autoplayRef = useRef<boolean>(autoplay);
  const isRepeatRef = useRef<boolean>(isRepeat);
  const isShuffleRef = useRef<boolean>(isShuffle);

  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  // Keep refs in sync with state for event listeners
  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  const recordPlayMetrics = useCallback((song: Song) => {
    musicService.recordPlay(song._id);
    if (isAuthenticated) {
      userService.recordHistory(song._id, song.duration);
    }
  }, [isAuthenticated]);

  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    if (!audioRef.current) return;

    setPlaybackError(null);

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
    } else if (!queueRef.current.some((s) => s._id === song._id)) {
      setQueue((prev) => [song, ...prev]);
    }

    setCurrentSong(song);
    audioRef.current.src = song.audioUrl;
    audioRef.current.currentTime = 0;
    playStartTimeRef.current = Date.now();

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        recordPlayMetrics(song);
      })
      .catch((err) => {
        console.warn('Playback error or user gesture required:', err);
        setIsPlaying(false);
      });
  }, [recordPlayMetrics]);

  const playNext = useCallback(() => {
    const q = queueRef.current;
    const song = currentSongRef.current;
    if (!q.length || !song) return;

    if (isRepeatRef.current && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    const currentIndex = q.findIndex((s) => s._id === song._id);
    let nextIndex = 0;

    if (isShuffleRef.current) {
      nextIndex = Math.floor(Math.random() * q.length);
    } else {
      nextIndex = currentIndex >= 0 && currentIndex < q.length - 1 ? currentIndex + 1 : 0;
    }

    const nextSong = q[nextIndex];
    if (nextSong) {
      playSong(nextSong);
    }
  }, [playSong]);

  const playPrevious = useCallback(() => {
    const q = queueRef.current;
    const song = currentSongRef.current;
    if (!q.length || !song || !audioRef.current) return;

    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = q.findIndex((s) => s._id === song._id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : q.length - 1;
    const prevSong = q[prevIndex];
    if (prevSong) {
      playSong(prevSong);
    }
  }, [playSong]);

  // Initialize HTML5 Audio instance
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setPlaybackError(null);
    };

    const onEnded = () => {
      // Check autoplay setting
      const q = queueRef.current;
      const song = currentSongRef.current;
      if (!autoplayRef.current && song && q.length > 0) {
        const idx = q.findIndex((s) => s._id === song._id);
        if (idx === q.length - 1 && !isRepeatRef.current) {
          setIsPlaying(false);
          return;
        }
      }
      playNext();
    };

    const onError = () => {
      setIsPlaying(false);
      setPlaybackError('Unable to play this track');
      console.warn('Audio playback encountered an error or format issue.');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, [playNext, volume]);

  // Sync user likes
  useEffect(() => {
    if (isAuthenticated) {
      userService.getFavorites().then((favs) => {
        setLikedSongIds(new Set(favs.map((s) => s._id)));
      }).catch(() => {});
    } else {
      setLikedSongIds(new Set());
    }
  }, [isAuthenticated, user]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setPlaybackError(null);
        })
        .catch(() => {
          setIsPlaying(false);
          setPlaybackError('Unable to play this track');
        });
    }
  }, [isPlaying, currentSong]);

  const retryPlayback = useCallback(() => {
    if (!audioRef.current || !currentSong) return;
    setPlaybackError(null);
    audioRef.current.src = currentSong.audioUrl;
    audioRef.current.load();
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
      setPlaybackError('Unable to play this track');
      setIsPlaying(false);
    });
  }, [currentSong]);

  const clearPlaybackError = useCallback(() => {
    setPlaybackError(null);
  }, []);

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(1, vol));
    audioRef.current.volume = clamped;
    setVolumeState(clamped);
    localStorage.setItem('melomix_volume', String(clamped));
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat((prev) => !prev);
  }, []);

  const toggleAutoplay = useCallback(() => {
    setAutoplay((prev) => {
      const next = !prev;
      localStorage.setItem('melomix_autoplay', String(next));
      return next;
    });
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => {
      if (prev.some((s) => s._id === song._id)) return prev;
      return [...prev, song];
    });
    showToast(`Added "${song.title}" to queue`, 'info');
  }, [showToast]);

  const playNextInQueue = useCallback((song: Song) => {
    if (!currentSong) {
      playSong(song);
      return;
    }
    setQueue((prev) => {
      const filtered = prev.filter((s) => s._id !== song._id);
      const currentIndex = filtered.findIndex((s) => s._id === currentSong._id);
      if (currentIndex === -1) {
        return [currentSong, song, ...filtered];
      }
      const updated = [...filtered];
      updated.splice(currentIndex + 1, 0, song);
      return updated;
    });
    showToast(`"${song.title}" will play next`, 'info');
  }, [currentSong, playSong, showToast]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    showToast('Removed from queue', 'info');
  }, [showToast]);

  const clearQueue = useCallback(() => {
    if (currentSong) {
      setQueue([currentSong]);
    } else {
      setQueue([]);
    }
    showToast('Queue cleared', 'info');
  }, [currentSong, showToast]);

  const toggleQueueDrawer = useCallback(() => {
    setIsQueueOpen((prev) => !prev);
  }, []);

  const toggleLike = useCallback(async (songId: string) => {
    if (!isAuthenticated) {
      showToast('Please log in to like songs and save favorites', 'info');
      return;
    }

    try {
      const res = await userService.toggleFavorite(songId);
      setLikedSongIds((prev) => {
        const next = new Set(prev);
        if (res.isLiked) {
          next.add(songId);
        } else {
          next.delete(songId);
        }
        return next;
      });
      showToast(res.isLiked ? 'Added to Liked Songs' : 'Removed from Liked Songs', 'success');
    } catch {
      showToast('Failed to update favorite', 'error');
    }
  }, [isAuthenticated, showToast]);

  const isLiked = useCallback((songId: string) => {
    return likedSongIds.has(songId);
  }, [likedSongIds]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        isRepeat,
        queue,
        isQueueOpen,
        likedSongIds,
        playbackError,
        autoplay,
        playSong,
        togglePlay,
        playNext,
        playPrevious,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        toggleAutoplay,
        addToQueue,
        playNextInQueue,
        removeFromQueue,
        clearQueue,
        toggleQueueDrawer,
        toggleLike,
        isLiked,
        retryPlayback,
        clearPlaybackError,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextValue => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
