import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Music,
  Disc3,
  TrendingUp,
  PieChart as PieIcon,
  Search,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AdminAnalytics, User, Song, Artist, Album } from '../../types';
import { analyticsService } from '../../services/analyticsService';
import { adminService } from '../../services/adminService';
import { musicService } from '../../services/musicService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatNumber, formatDate } from '../../utils/formatters';

const GENRE_COLORS = ['#7C3AED', '#2563EB', '#0D9488', '#EA580C', '#DB2777', '#4F46E5'];

type AdminTab = 'overview' | 'users' | 'songs' | 'artists' | 'albums';

export const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as AdminTab;
  const activeTab: AdminTab = ['overview', 'users', 'songs', 'artists', 'albums'].includes(rawTab)
    ? rawTab
    : 'overview';

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { user: currentUser, isAdmin, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const handleTabChange = (tab: AdminTab) => {
    setSearchParams({ tab });
    setSearchQuery('');
  };

  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        const [anRes, userRes, songRes, artistRes, albumRes] = await Promise.all([
          analyticsService.getAdminAnalytics(),
          adminService.getUsers({ limit: 50 }),
          musicService.getSongs({ limit: 50 }),
          musicService.getArtists({ limit: 50 }),
          musicService.getAlbums({ limit: 50 }),
        ]);

        setAnalytics(anRes);
        setUsers(userRes.data);
        setSongs(songRes.data);
        setArtists(artistRes.data);
        setAlbums(albumRes.data);
      } catch (err) {
        console.error('Failed to load admin data', err);
        showToast('Failed to load some admin data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [isAdmin, showToast]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId && u.id !== userId));
      showToast(`User ${userName} deleted`, 'info');
    } catch {
      showToast('Failed to delete user', 'error');
    }
  };

  const handleRoleToggle = async (userObj: User) => {
    const newRole = userObj.role === 'admin' ? 'user' : 'admin';
    try {
      const targetId = (userObj.id || userObj._id) as string;
      await adminService.updateUser(targetId, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetId || u._id === targetId ? { ...u, role: newRole } : u))
      );
      showToast(`User role updated to ${newRole}`, 'success');
    } catch {
      showToast('Failed to change user role', 'error');
    }
  };

  const handleDeleteSong = async (songId: string, songTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete track "${songTitle}"?`)) return;
    try {
      await musicService.deleteSong(songId);
      setSongs((prev) => prev.filter((s) => s._id !== songId));
      showToast(`Track "${songTitle}" deleted successfully`, 'info');
    } catch {
      showToast('Failed to delete track', 'error');
    }
  };

  // Filtered collections
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSongs = songs.filter((s) =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArtists = artists.filter((a) =>
    a.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAlbums = albums.filter((al) =>
    al.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    al.artistName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isAuthLoading) {
    return (
      <div className="py-24 text-center text-zinc-400 dark:text-zinc-500 text-xs animate-pulse">
        Checking admin permissions...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Access Restricted</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          The Admin Dashboard is only accessible to users with administrator privileges.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Platform performance statistics, catalog data, and user management.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none text-xs font-medium">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: `Users (${users.length})` },
            { id: 'songs', label: `Songs (${songs.length})` },
            { id: 'artists', label: `Artists (${artists.length})` },
            { id: 'albums', label: `Albums (${albums.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as AdminTab)}
              className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !analytics ? (
        <div className="py-24 text-center text-zinc-400 dark:text-zinc-500 text-xs animate-pulse">
          Loading administration metrics...
        </div>
      ) : activeTab === 'overview' ? (
        /* Tab 1: Overview & Metrics */
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Users</span>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                {analytics.metrics.totalUsers}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Songs</span>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                {analytics.metrics.totalSongs}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Artists</span>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                {analytics.metrics.totalArtists}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Playlists</span>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                {analytics.metrics.totalPlaylists}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Plays</span>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 mt-1">
                {formatNumber(analytics.metrics.totalPlays)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active Users</span>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                {analytics.metrics.activeUsers}
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plays Over Time Area Chart */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Plays Over Time</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.playsOverTime}>
                    <defs>
                      <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#18181B',
                        borderColor: '#27272A',
                        borderRadius: '10px',
                        color: '#FAFAFA',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="plays"
                      stroke="#7C3AED"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#adminGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Popular Genres Platform-wide */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Catalog Genres Distribution</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.topGenres}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analytics.topGenres.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={GENRE_COLORS[index % GENRE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#18181B',
                        borderColor: '#27272A',
                        borderRadius: '10px',
                        color: '#FAFAFA',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {analytics.topGenres.map((genre, idx) => (
                  <div key={genre.name} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: GENRE_COLORS[idx % GENRE_COLORS.length] }}
                    />
                    <span>{genre.name}</span>
                    <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[11px]">({genre.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tabs 2-5: Tables */
        <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
          {/* Table Search Bar */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Users Table */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                <thead className="text-[11px] uppercase bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">User</th>
                    <th className="px-5 py-3.5 font-semibold">Email</th>
                    <th className="px-5 py-3.5 font-semibold">Role</th>
                    <th className="px-5 py-3.5 font-semibold">Joined</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-xs text-zinc-400">
                        No users found matching "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const uid = (u.id || u._id) as string;
                      const isSelf = currentUser?._id === uid || currentUser?.email === u.email;

                      return (
                        <tr key={uid} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                          <td className="px-5 py-3.5 flex items-center gap-3">
                            <img
                              src={
                                u.avatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
                              }
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                            />
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{u.name}</span>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => handleRoleToggle(u)}
                              className={`text-[11px] px-2.5 py-0.5 rounded-md font-semibold uppercase transition-colors ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                              }`}
                            >
                              {u.role}
                            </button>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">{formatDate(u.createdAt)}</td>
                          <td className="px-5 py-3.5 text-right">
                            {!isSelf && u.email !== 'admin@melomix.com' && (
                              <button
                                onClick={() => handleDeleteUser(uid, u.name)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Songs Table */}
          {activeTab === 'songs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                <thead className="text-[11px] uppercase bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Title</th>
                    <th className="px-5 py-3.5 font-semibold">Artist</th>
                    <th className="px-5 py-3.5 font-semibold">Genre</th>
                    <th className="px-5 py-3.5 font-semibold">Mood</th>
                    <th className="px-5 py-3.5 font-semibold">Plays</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredSongs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-xs text-zinc-400">
                        No songs found matching "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredSongs.map((s) => (
                      <tr key={s._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <img
                            src={s.coverUrl}
                            alt={s.title}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{s.title}</span>
                        </td>
                        <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">{s.artistName}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium border border-zinc-200 dark:border-zinc-700">
                            {s.genre}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-800">
                            {s.mood}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">{formatNumber(s.playCount)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteSong(s._id, s.title)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete track"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Artists Table */}
          {activeTab === 'artists' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                <thead className="text-[11px] uppercase bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Artist</th>
                    <th className="px-5 py-3.5 font-semibold">Genres</th>
                    <th className="px-5 py-3.5 font-semibold">Followers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredArtists.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-10 text-center text-xs text-zinc-400">
                        No artists found matching "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredArtists.map((a) => (
                      <tr key={a._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <img
                            src={a.image}
                            alt={a.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-700"
                          />
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{a.name}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">
                          {a.genres?.join(', ') || '—'}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                          {formatNumber(a.followers)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Albums Table */}
          {activeTab === 'albums' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                <thead className="text-[11px] uppercase bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Album</th>
                    <th className="px-5 py-3.5 font-semibold">Artist</th>
                    <th className="px-5 py-3.5 font-semibold">Release Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredAlbums.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-10 text-center text-xs text-zinc-400">
                        No albums found matching "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredAlbums.map((al) => (
                      <tr key={al._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <img
                            src={al.coverUrl}
                            alt={al.title}
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{al.title}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-zinc-600 dark:text-zinc-400">
                          {al.artistName}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                          {formatDate(al.releaseDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
