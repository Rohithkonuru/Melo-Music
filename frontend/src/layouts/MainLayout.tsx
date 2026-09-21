import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { BottomPlayer } from '../components/Player/BottomPlayer';
import { QueueDrawer } from '../components/Player/QueueDrawer';
import { NowPlayingDrawer } from '../components/Player/NowPlayingDrawer';
import { PlaylistModal } from '../components/Modals/PlaylistModal';
import { usePlayer } from '../context/PlayerContext';

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const { currentSong } = usePlayer();

  return (
    <div className="min-h-screen bg-[#F8F8FA] dark:bg-[#09090B] text-[#18181B] dark:text-[#FAFAFA] flex flex-col font-sans transition-colors">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreatePlaylist={() => setIsPlaylistModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-60 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Dynamic Page Routed Content */}
        <main className={`flex-1 p-4 md:p-8 ${currentSong ? 'pb-28' : 'pb-12'}`}>
          <div className="max-w-6xl mx-auto">
            <Outlet context={{ onOpenPlaylistModal: () => setIsPlaylistModalOpen(true) }} />
          </div>
        </main>
      </div>

      {/* Persistent Audio Player */}
      <BottomPlayer
        onToggleNowPlaying={() => setIsNowPlayingOpen((prev) => !prev)}
        isNowPlayingOpen={isNowPlayingOpen}
      />

      {/* Slide-out Play Queue Drawer */}
      <QueueDrawer />

      {/* Clean Now Playing Drawer (Lyrics, Queue, EQ, Visualizer) */}
      <NowPlayingDrawer
        isOpen={isNowPlayingOpen}
        onClose={() => setIsNowPlayingOpen(false)}
      />

      {/* Create / Add Playlist Modal */}
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        songToAdd={currentSong}
      />
    </div>
  );
};
