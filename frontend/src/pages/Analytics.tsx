import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { UserAnalytics } from '../types';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated) {
          const res = await analyticsService.getUserAnalytics();
          setData(res);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error('Failed to load user analytics', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAuthenticated]);

  const timeString = data?.formattedListeningTime || '0m';

  const topGenresData = (data?.topGenres || []).map((g) => ({
    name: g.name,
    count: g.value,
  }));

  const listeningTrendsData = (data?.activityTimeline || []).map((t) => ({
    date: t.day,
    plays: t.plays,
  }));

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Your Listening
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Insights based on your play history.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-8">
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
        </div>
      ) : !data || data.totalSongsPlayed === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#E4E4E7] dark:border-[#27272A] rounded-xl space-y-1">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No listening data recorded yet.</p>
          <p className="text-xs text-zinc-500">Play tracks in Melomix to view your listening metrics and charts.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl shadow-xs">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Total Listening Time</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{timeString}</div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">Total time</div>
            </div>

            <div className="p-5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl shadow-xs">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Tracks Played</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{data.totalSongsPlayed}</div>
              <div className="text-[11px] text-zinc-400 mt-1">Stream sessions</div>
            </div>

            <div className="p-5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl shadow-xs">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Top Genre</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {data.topGenres?.[0]?.name || 'Eclectic'}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Most frequent style</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Genres Bar Chart */}
            <div className="p-5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl shadow-xs space-y-3">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Top Genres
              </h2>
              {topGenresData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topGenresData} layout="vertical" margin={{ left: 0, right: 16 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        tick={{ fontSize: 11, fill: '#71717A' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#18181B',
                          borderColor: '#27272A',
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#FAFAFA',
                        }}
                      />
                      <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 py-10 text-center">No genre data available</p>
              )}
            </div>

            {/* Listening Activity Area Chart */}
            <div className="p-5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl shadow-xs space-y-3">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Listening Activity (Past 7 Days)
              </h2>
              {listeningTrendsData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={listeningTrendsData} margin={{ left: -20, right: 0, top: 10 }}>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#71717A' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#71717A' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#18181B',
                          borderColor: '#27272A',
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#FAFAFA',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="plays"
                        stroke="#7C3AED"
                        fill="#7C3AED"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 py-10 text-center">No trend activity yet</p>
              )}
            </div>
          </div>

          {/* Top Artists & Most Played Songs Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Artists */}
            <div className="p-5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl shadow-xs space-y-3">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Top Artists
              </h2>
              <div className="divide-y divide-[#E4E4E7] dark:divide-[#27272A]">
                {(data.topArtists || []).slice(0, 5).map((a, i) => (
                  <div key={`${a.name}-${i}`} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{i + 1}. {a.name}</span>
                    <span className="text-zinc-400 font-mono">{a.plays} plays</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Played Songs */}
            <div className="p-5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl shadow-xs space-y-3">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Most Played Songs
              </h2>
              <div className="divide-y divide-[#E4E4E7] dark:divide-[#27272A]">
                {(data.mostPlayedSongs || []).slice(0, 5).map((item, i: number) => {
                  const song = item.song;
                  if (!song) return null;
                  return (
                    <div key={`${song._id || song.title}-${i}`} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 flex-1 truncate pr-2">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{song.title}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{song.artistName}</div>
                      </div>
                      <span className="text-zinc-400 font-mono shrink-0">{item.plays} plays</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
