"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { player, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setMobileMenuOpen(false);
    router.push('/');
  }

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <nav className="border-b border-white/10 px-6 py-4 relative">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="May Madness" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-primary hidden sm:block">May Madness</span>
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <a href="/leaderboard" className="text-foreground/70 hover:text-foreground transition">
            Leaderboard
          </a>
          
          {player ? (
            <>
              <a href="/scoring" className="text-foreground/70 hover:text-foreground transition">
                Score Entry
              </a>
              {isAdmin && (
                <a href="/admin" className="text-foreground/70 hover:text-foreground transition">
                  Admin
                </a>
              )}
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <span className="text-sm text-foreground/70">{player.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-400 hover:text-red-300 transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <a 
              href="/login" 
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light transition"
            >
              Login
            </a>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-foreground transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-foreground transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-foreground transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-white/10 z-50">
          <div className="flex flex-col p-4 gap-4">
            <a 
              href="/leaderboard" 
              onClick={closeMenu}
              className="text-foreground/70 hover:text-foreground transition py-2"
            >
              🏆 Leaderboard
            </a>
            
            {player ? (
              <>
                <a 
                  href="/scoring" 
                  onClick={closeMenu}
                  className="text-foreground/70 hover:text-foreground transition py-2"
                >
                  ⛳ Score Entry
                </a>
                {isAdmin && (
                  <a 
                    href="/admin" 
                    onClick={closeMenu}
                    className="text-foreground/70 hover:text-foreground transition py-2"
                  >
                    ⚙️ Admin
                  </a>
                )}
                <div className="border-t border-white/10 pt-4 mt-2">
                  <div className="text-sm text-foreground/50 mb-2">Logged in as</div>
                  <div className="font-semibold mb-3">{player.name}</div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <a 
                href="/login" 
                onClick={closeMenu}
                className="w-full py-3 rounded-lg bg-primary text-center font-semibold text-white hover:bg-primary-light transition"
              >
                Player Login
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
