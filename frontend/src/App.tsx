import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { Search } from './pages/Search';
import { Library } from './pages/Library';
import { Favorites } from './pages/Favorites';
import { History } from './pages/History';
import { MoodGenerator } from './pages/MoodGenerator';
import { Recommendations } from './pages/Recommendations';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { ArtistDetail } from './pages/ArtistDetail';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PlayerProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="discover" element={<Discover />} />
                <Route path="search" element={<Search />} />
                <Route path="library" element={<Library />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="history" element={<History />} />
                <Route path="mood-generator" element={<MoodGenerator />} />
                <Route path="recommendations" element={<Recommendations />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="playlist/:id" element={<PlaylistDetail />} />
                <Route path="artist/:id" element={<ArtistDetail />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </PlayerProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
