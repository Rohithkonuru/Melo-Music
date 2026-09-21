import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Search as SearchIcon,
  Sparkles,
  Music,
  UserCheck,
  Disc,
  ListMusic,
} from 'lucide-react';
import { Song, Artist, Album, Playlist } from '../types';
import { musicService } from '../services/musicService';
import { aiService } from '../services/aiService';
import { SongRow } from '../components/SongRow';
import { ArtistCard } from '../components/ArtistCard';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { onOpenPlaylistModal } = (useOutletContext<{ onOpenPlaylistModal?: () => void }>() || {});
  const navigate = useNavigate();

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'artists' | 'albums' | 'playlists'>('all');
  const [isNLPSearch, setIsNLPSearch] = useState(false);

  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [nlpIntent, setNlpIntent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null && qParam !== query) {
      setQuery(qParam);
    }
  }, [searchParams]);

  // Execute search with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setSongs([]);
      setArtists([]);
      setAlbums([]);
      setPlaylists([]);
      setNlpIntent(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        if (isNLPSearch) {
          const nlpRes = await aiService.naturalLanguageSearch(query);
          setNlpIntent(nlpRes.detectedIntent);
          setSongs(nlpRes.songs || []);
          setArtists([]);
          setAlbums([]);
          setPlaylists([]);
        } else {
          setNlpIntent(null);
          const res = await musicService.searchGlobal(query, activeTab);
          setSongs(res.songs || []);
          setArtists(res.artists || []);
          setAlbums(res.albums || []);
          setPlaylists(res.playlists || []);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query, activeTab, isNLPSearch]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSearchParams(val ? { q: val } : {});
  };

  const totalResults = songs.length + artists.length + albums.length + playlists.length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header & Search Bar */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Search
        </h1>

        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-purple-600 dark:focus:border-purple-500 shadow-xs transition-colors"
          />

          {/* AI NLP Mode Toggle Button */}
          <button
            onClick={() => setIsNLPSearch((prev) => !prev)}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              isNLPSearch
                ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
            title="Search using natural intent like 'calm study music' or 'late night workout'"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Mode</span>
          </button>
        </div>

        {/* NLP Intent Badge */}
        {isNLPSearch && nlpIntent && (
          <div className="text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 px-3 py-1.5 rounded-lg">
            AI detected intent: <span className="font-semibold">{JSON.stringify(nlpIntent)}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      {!isNLPSearch && query.trim() && (
        <div className="flex gap-1.5 border-b border-[#E4E4E7] dark:border-[#27272A] pb-2 text-xs font-medium">
          {(['all', 'songs', 'artists', 'albums', 'playlists'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Results View */}
      {isLoading ? (
        <div className="space-y-2 py-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-zinc-200 dark:bg-zinc-800/60 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !query.trim() ? (
        <div className="py-16 text-center text-zinc-400 text-xs">
          Type to search songs, artists, albums, or playlists.
        </div>
      ) : totalResults === 0 ? (
        <div className="py-16 text-center space-y-1">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            No results found for "{query}"
          </p>
          <p className="text-xs text-zinc-400">
            Try checking for spelling errors or searching for a different keyword.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Songs Results */}
          {(activeTab === 'all' || activeTab === 'songs') && songs.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Music className="w-4 h-4 text-zinc-400" />
                <span>Songs</span>
              </h2>
              <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-1 divide-y divide-[#E4E4E7]/60 dark:divide-[#27272A]/60 shadow-xs">
                {songs.map((song, idx) => (
                  <SongRow
                    key={song._id}
                    song={song}
                    index={idx}
                    playlistContext={songs}
                    onAddToPlaylist={onOpenPlaylistModal ? () => onOpenPlaylistModal() : undefined}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Artists Results */}
          {(activeTab === 'all' || activeTab === 'artists') && artists.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-zinc-400" />
                <span>Artists</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {artists.map((artist) => (
                  <ArtistCard key={artist._id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {/* Albums Results */}
          {(activeTab === 'all' || activeTab === 'albums') && albums.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Disc className="w-4 h-4 text-zinc-400" />
                <span>Albums</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {albums.map((album) => (
                  <div
                    key={album._id}
                    onClick={() => {
                      if (album.artist) {
                        const aId = typeof album.artist === 'object' ? (album.artist as any)._id : album.artist;
                        navigate(`/artist/${aId}`);
                      }
                    }}
                    className="p-3 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer shadow-xs"
                  >
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="w-full aspect-square object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-2"
                    />
                    <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate">{album.title}</div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {album.releaseDate ? new Date(album.releaseDate).getFullYear() : ''}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Playlists Results */}
          {(activeTab === 'all' || activeTab === 'playlists') && playlists.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-zinc-400" />
                <span>Playlists</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {playlists.map((playlist) => (
                  <div
                    key={playlist._id}
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    className="p-3 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer shadow-xs"
                  >
                    <img
                      src={playlist.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'}
                      alt={playlist.name}
                      className="w-full aspect-square object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-2"
                    />
                    <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate">{playlist.name}</div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">{playlist.songs?.length || 0} songs</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
