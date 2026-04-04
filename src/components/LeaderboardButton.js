"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import LeaderboardPanel from './LeaderboardPanel';

function normalizeRoute(path) {
  if (path == null || path === "") return "/";
  const noQuery = path.split("?")[0].split("#")[0];
  const trimmed = noQuery.replace(/\/+$/, "") || "/";
  return trimmed;
}

export default function LeaderboardButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const route = normalizeRoute(pathname);

  // Don't show on the leaderboard page since we're already viewing it
  if (route === "/leaderboard") {
    return null;
  }

  // Login uses full-screen touch targets; skip FAB + panel entirely on this route
  if (route === "/login") {
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

      {/* Mount only when open — avoids fixed full-viewport layers (backdrop/panel) sitting above page content on iOS when “closed”. */}
      {isOpen && <LeaderboardPanel onClose={() => setIsOpen(false)} />}
    </>
  );
}

