import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Song, Artist } from '../types';
import { musicService } from '../services/musicService';
import { SongCard } from '../components/SongCard';
import { SongRow } from '../components/SongRow';
import { ArtistCard } from '../components/ArtistCard';

export const Discover: React.FC = () => {
  const { onOpenPlaylistModal } = (useOutletContext<{ onOpenPlaylistModal?: () => void }>() || {});

  const [trending, setTrending] = useState<Song[]>([]);
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSongs, setMoodSongs] = useState<Song[]>([]);
  const [isLoadingMood, setIsLoadingMood] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const moods = ['All', 'Chill', 'Focus', 'Happy', 'Workout', 'Romantic', 'Energetic', 'Sad', 'Sleep'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [trendRes, newRes, artistsRes] = await Promise.all([
          musicService.getTrendingSongs(6),
          musicService.getNewReleases(6),
          musicService.getPopularArtists(6),
        ]);
        setTrending(trendRes);
        setNewReleases(newRes);
        setPopularArtists(artistsRes);
      } catch (e) {
        console.error('Failed to load discovery data', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMoodSelect = async (mood: string) => {
    if (mood === 'All' || selectedMood === mood) {
      setSelectedMood(null);
      setMoodSongs([]);
      return;
    }

    setSelectedMood(mood);
    setIsLoadingMood(true);
    try {
      const res = await musicService.getSongs({ mood, limit: 12 });
      setMoodSongs(res.data);
    } catch {
      setMoodSongs([]);
    } finally {
      setIsLoadingMood(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Discover
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Find something you'll love.
        </p>
      </div>

      {/* Moods Section */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Moods
        </h2>

        <div className="flex flex-wrap gap-2">
          {moods.map((m) => {
            const isSelected = (m === 'All' && !selectedMood) || selectedMood === m;
            return (
              <button
                key={m}
                onClick={() => handleMoodSelect(m)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#18181B] border-[#E4E4E7] dark:border-[#27272A] text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* Filtered Mood Songs (Only shown when a specific mood is active) */}
        {selectedMood && (
          <div className="pt-2 space-y-3">
            <h3 className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              {selectedMood} Tracks ({moodSongs.length})
            </h3>
            {isLoadingMood ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-zinc-200 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : moodSongs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {moodSongs.map((song) => (
                  <SongCard
                    key={song._id}
                    song={song}
                    playlistContext={moodSongs}
                    onAddToPlaylist={onOpenPlaylistModal ? () => onOpenPlaylistModal() : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-[#E4E4E7] dark:border-[#27272A] rounded-xl text-xs text-zinc-500">
                No songs tagged with "{selectedMood}" found.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Trending Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Trending
        </h2>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-zinc-200 dark:bg-zinc-800/60 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : trending.length > 0 ? (
          <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-1 divide-y divide-[#E4E4E7]/60 dark:divide-[#27272A]/60 shadow-xs">
            {trending.map((song, idx) => (
              <SongRow
                key={song._id}
                song={song}
                index={idx}
                playlistContext={trending}
                onAddToPlaylist={onOpenPlaylistModal ? () => onOpenPlaylistModal() : undefined}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No trending songs available.</p>
        )}
      </section>

      {/* New Releases Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          New Releases
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-200 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : newReleases.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {newReleases.map((song) => (
              <SongCard
                key={song._id}
                song={song}
                playlistContext={newReleases}
                onAddToPlaylist={onOpenPlaylistModal ? () => onOpenPlaylistModal() : undefined}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No new releases available.</p>
        )}
      </section>

      {/* Popular Artists Section */}
      <section className="space-y-3 pb-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Popular Artists
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-200 dark:bg-zinc-800/60 rounded-full animate-pulse" />
            ))}
          </div>
        ) : popularArtists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {popularArtists.map((artist) => (
              <ArtistCard key={artist._id} artist={artist} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No artists available.</p>
        )}
      </section>
    </div>
  );
};
