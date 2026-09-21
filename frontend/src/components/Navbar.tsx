import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Menu,
  User as UserIcon,
  LogOut,
  Shield,
  Music,
  UserCheck,
  ChevronDown,
  Sun,
  Moon,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { musicService } from '../services/musicService';
import { usePlayer } from '../context/PlayerContext';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isBright, toggleTheme } = useTheme();
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  // Debounced live suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await musicService.getSuggestions(searchQuery);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = async (item: any) => {
    setShowSuggestions(false);
    setSearchQuery('');
    if (item.type === 'song') {
      try {
        const fullSong = await musicService.getSongById(item.id);
        playSong(fullSong);
      } catch {
        navigate(`/search?q=${encodeURIComponent(item.title)}`);
      }
    } else if (item.type === 'artist') {
      navigate(`/artist/${item.id}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md border-b border-[#E4E4E7] dark:border-[#27272A] px-4 md:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Mobile Menu Button */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Global Search Bar */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search songs, artists, albums..."
            className="w-full pl-9 pr-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors"
          />
        </form>

        {/* Live Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg shadow-lg p-1.5 z-50 max-h-80 overflow-y-auto">
            {suggestions.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleSuggestionClick(item)}
                className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors text-xs"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className={`w-8 h-8 object-cover ${
                    item.type === 'artist' ? 'rounded-full' : 'rounded-md'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.title}</div>
                  <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                    {item.type === 'song' ? (
                      <Music className="w-3 h-3 text-purple-600" />
                    ) : (
                      <UserCheck className="w-3 h-3 text-zinc-400" />
                    )}
                    <span>{item.subtitle}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={isBright ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle Theme"
        >
          {isBright ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {isAuthenticated && user ? (
          /* Profile Dropdown */
          <div ref={profileContainerRef} className="relative">
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="User menu"
            >
              <img
                src={
                  user.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
                }
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-300 dark:ring-zinc-700"
              />
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 max-w-[100px] truncate hidden sm:inline">
                {user.name}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg shadow-lg py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-[#E4E4E7] dark:border-[#27272A] mb-1">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{user.name}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{user.email}</div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-purple-600 dark:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-left border-t border-[#E4E4E7] dark:border-[#27272A] mt-1 pt-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium">
            <Link
              to="/login"
              className="px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
