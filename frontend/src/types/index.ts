export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  favoriteGenres?: string[];
  favoriteArtists?: string[];
  likedSongs?: string[];
  followedArtists?: string[];
  createdAt?: string;
}

export interface Artist {
  _id: string;
  name: string;
  bio?: string;
  image: string;
  genres: string[];
  followers: number;
  songs?: Song[];
  albums?: Album[];
}

export interface Album {
  _id: string;
  title: string;
  artist: Artist | string;
  artistName: string;
  coverUrl: string;
  releaseDate: string;
  songs?: Song[];
}

export interface Song {
  _id: string;
  title: string;
  artist: Artist | string;
  artistName: string;
  album?: Album | string;
  albumTitle?: string;
  genre: string;
  duration: number; // seconds
  audioUrl: string;
  coverUrl: string;
  releaseDate?: string;
  mood: string;
  language: string;
  playCount: number;
  likeCount: number;
}

export interface Playlist {
  _id: string;
  name: string;
  description: string;
  coverUrl: string;
  owner: User | string;
  songs: Song[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListeningHistoryItem {
  _id: string;
  user: string;
  song: Song;
  playedAt: string;
  durationPlayed: number;
}

export interface UserAnalytics {
  totalListeningTimeSeconds: number;
  formattedListeningTime: string;
  totalSongsPlayed: number;
  topGenres: Array<{ name: string; value: number }>;
  topArtists: Array<{ name: string; plays: number }>;
  activityTimeline: Array<{ day: string; plays: number }>;
  mostPlayedSongs: Array<{ rank: number; plays: number; song: Song }>;
}

export interface AdminAnalytics {
  metrics: {
    totalUsers: number;
    totalSongs: number;
    totalArtists: number;
    totalPlaylists: number;
    totalPlays: number;
    activeUsers: number;
  };
  topGenres: Array<{ name: string; value: number; plays: number }>;
  topSongs: Song[];
  playsOverTime: Array<{ month: string; plays: number; activeUsers: number }>;
}

export interface RecommendationResponse {
  source: string;
  recommendations: Song[];
  algorithm: string;
}

export interface NLPSearchResult {
  originalQuery: string;
  detectedIntent: {
    mood?: string;
    genre?: string;
    language?: string;
    activity?: string;
  };
  songs: Song[];
}
