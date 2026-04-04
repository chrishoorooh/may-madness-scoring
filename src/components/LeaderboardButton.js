"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import LeaderboardPanel from './LeaderboardPanel';

export default function LeaderboardButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Don't show on the leaderboard page since we're already viewing it
  if (pathname === '/leaderboard') {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-2xl hover:bg-primary-light hover:scale-110 transition-all duration-200"
        aria-label="Open Leaderboard"
      >
        🏆
      </button>

      {/* Leaderboard Panel */}
      <LeaderboardPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

