import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { Track } from '@core/types';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export interface AppShellContext {
  currentTrack: Track;
  setTrack: (track: Track) => void;
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect track from URL path if present, otherwise default to 'school'
  const [currentTrack, setCurrentTrack] = useState<Track>(() => {
    if (location.pathname.startsWith('/college')) return 'college';
    return 'school';
  });

  useEffect(() => {
    if (location.pathname.startsWith('/college')) {
      setCurrentTrack('college');
    } else if (location.pathname.startsWith('/school')) {
      setCurrentTrack('school');
    }
  }, [location.pathname]);

  const handleTrackChange = (nextTrack: Track) => {
    setCurrentTrack(nextTrack);
    // If on landing page, stay on landing page
    if (location.pathname === '/') return;
    // If on a module, switch to track root or navigate to landing page
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
      {/* Top Header */}
      <TopBar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTrack={currentTrack}
          onTrackChange={handleTrackChange}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 min-h-0">
          <Outlet context={{ currentTrack, setTrack: handleTrackChange }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTrack={currentTrack}
        onTrackChange={handleTrackChange}
      />
    </div>
  );
}
