import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Search,
  Heart,
  ListMusic,
  History,
  Sparkles,
  Smile,
  BarChart3,
  User,
  Settings,
  Shield,
  Users,
  Music,
  UserCheck,
  Disc,
  Plus,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCreatePlaylist?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose, onCreatePlaylist }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  const navItemClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
    }`;

  const isAdminTabActive = (tab: string) => {
    if (location.pathname !== '/admin') return false;
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'overview';
    return currentTab === tab;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-60 bg-white dark:bg-[#18181B] border-r border-[#E4E4E7] dark:border-[#27272A] flex flex-col z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#E4E4E7] dark:border-[#27272A]">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              M
            </div>
            <div>
              <span className="font-bold tracking-tight text-base text-zinc-900 dark:text-zinc-100 font-sans">
                MELOMIX
              </span>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 md:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Main Discover */}
          <div className="space-y-0.5">
            <NavLink to="/" className={({ isActive }) => navItemClass(isActive)} onClick={onClose} end>
              <Home className="w-4 h-4" />
              <span>Home</span>
            </NavLink>
            <NavLink to="/discover" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
              <Search className="w-4 h-4" />
              <span>Search</span>
            </NavLink>
          </div>

          {/* Library Section */}
          <div className="space-y-0.5">
            <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Your Library
            </div>
            <NavLink to="/favorites" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
              <Heart className="w-4 h-4" />
              <span>Liked Songs</span>
            </NavLink>
            <NavLink to="/library" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
              <ListMusic className="w-4 h-4" />
              <span>Playlists</span>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
              <History className="w-4 h-4" />
              <span>Recently Played</span>
            </NavLink>
          </div>

          {/* AI Features */}
          <div className="space-y-0.5">
            <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              AI
            </div>
            <NavLink to="/recommendations" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
              <Sparkles className="w-4 h-4" />
              <span>For You</span>
            </NavLink>
            <NavLink to="/mood-generator" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
              <Smile className="w-4 h-4" />
              <span>Mood Generator</span>
            </NavLink>
          </div>

          {/* Insights */}
          <div className="space-y-0.5">
            <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Insights
            </div>
            <NavLink to="/analytics" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </NavLink>
          </div>

          {/* Account */}
          <div className="space-y-0.5">
            <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Account
            </div>
            <NavLink to="/profile" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
              <User className="w-4 h-4" />
              <span>Profile</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </NavLink>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div className="space-y-0.5 pt-2 border-t border-[#E4E4E7] dark:border-[#27272A]">
              <div className="px-3 py-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Admin
              </div>
              <Link
                to="/admin"
                className={navItemClass(isAdminTabActive('overview'))}
                onClick={onClose}
              >
                <Shield className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin?tab=users"
                className={navItemClass(isAdminTabActive('users'))}
                onClick={onClose}
              >
                <Users className="w-4 h-4" />
                <span>Users</span>
              </Link>
              <Link
                to="/admin?tab=songs"
                className={navItemClass(isAdminTabActive('songs'))}
                onClick={onClose}
              >
                <Music className="w-4 h-4" />
                <span>Songs</span>
              </Link>
              <Link
                to="/admin?tab=artists"
                className={navItemClass(isAdminTabActive('artists'))}
                onClick={onClose}
              >
                <UserCheck className="w-4 h-4" />
                <span>Artists</span>
              </Link>
              <Link
                to="/admin?tab=albums"
                className={navItemClass(isAdminTabActive('albums'))}
                onClick={onClose}
              >
                <Disc className="w-4 h-4" />
                <span>Albums</span>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Playlist Action */}
        <div className="p-3 border-t border-[#E4E4E7] dark:border-[#27272A]">
          <button
            onClick={() => {
              if (onCreatePlaylist) onCreatePlaylist();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Playlist</span>
          </button>
        </div>
      </aside>
    </>
  );
};
