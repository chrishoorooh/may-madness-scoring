"use client";

import { useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { goToLoginPageClick } from "@/lib/goToLogin";

export default function Navbar() {
  const { player, logout, isAdmin } = useAuth();
  const menuRef = useRef(null);

  function closeMenu() {
    menuRef.current?.removeAttribute("open");
  }

  async function handleLogout() {
    closeMenu();
    await logout();
    /* logout() ends with window.location.assign("/") for a clean WebKit / RSC state */
  }

  return (
    <nav className="relative z-[200] border-b border-white/10 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3 touch-manipulation" prefetch={false}>
          <img src="/logo.png" alt="May Madness" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-primary hidden sm:block">May Madness</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/leaderboard" className="text-foreground/70 hover:text-foreground transition" prefetch={false}>
            Leaderboard
          </Link>

          {player ? (
            <>
              <Link href="/scoring" className="text-foreground/70 hover:text-foreground transition" prefetch={false}>
                Score Entry
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-foreground/70 hover:text-foreground transition" prefetch={false}>
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <span className="text-sm text-foreground/70">{player.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-red-400 hover:text-red-300 transition touch-manipulation [-webkit-tap-highlight-color:transparent]"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <a
              href="/login"
              onClick={goToLoginPageClick}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light transition touch-manipulation"
            >
              Login
            </a>
          )}
        </div>

        {/* Native <details> toggle — Safari handles open/close without relying on React click on the old hamburger */}
        <details
          ref={menuRef}
          className="md:hidden relative group/menu [-webkit-tap-highlight-color:transparent]"
        >
          <summary className="list-none cursor-pointer touch-manipulation flex flex-col gap-1.5 p-2 [&::-webkit-details-marker]:hidden">
            <span className="block h-0.5 w-6 bg-foreground transition-transform group-open/menu:translate-y-2 group-open/menu:rotate-45" />
            <span className="block h-0.5 w-6 bg-foreground transition-opacity group-open/menu:opacity-0" />
            <span className="block h-0.5 w-6 bg-foreground transition-transform group-open/menu:-translate-y-2 group-open/menu:-rotate-45" />
            <span className="sr-only">Open menu</span>
          </summary>

          {/* hidden unless open: WebKit can leave position:fixed descendants of closed <details> in hit-testing; group-open matches <details open> */}
          <div className="fixed inset-x-0 top-[calc(4.5rem+1px)] z-[250] hidden max-h-[calc(100dvh-4.5rem-1px)] overflow-y-auto overflow-x-hidden border-b border-white/10 bg-background shadow-lg pb-[max(1rem,env(safe-area-inset-bottom))] group-open/menu:block">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
              <Link
                href="/leaderboard"
                onClick={closeMenu}
                className="touch-manipulation py-3 text-foreground/70 hover:text-foreground transition"
                prefetch={false}
              >
                🏆 Leaderboard
              </Link>

              {player ? (
                <>
                  <Link
                    href="/scoring"
                    onClick={closeMenu}
                    className="touch-manipulation py-3 text-foreground/70 hover:text-foreground transition"
                    prefetch={false}
                  >
                    ⛳ Score Entry
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      className="touch-manipulation py-3 text-foreground/70 hover:text-foreground transition"
                      prefetch={false}
                    >
                      ⚙️ Admin
                    </Link>
                  )}
                  <div className="mt-2 border-t border-white/10 pt-4">
                    <div className="text-sm text-foreground/50 mb-2">Logged in as</div>
                    <div className="font-semibold mb-3">{player.name}</div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full touch-manipulation rounded-lg bg-red-500/20 py-3 font-semibold text-red-400 hover:bg-red-500/30 transition [-webkit-tap-highlight-color:transparent]"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <a
                  href="/login"
                  onClick={(e) => {
                    closeMenu();
                    goToLoginPageClick(e);
                  }}
                  className="touch-manipulation mt-1 rounded-lg bg-primary py-3 text-center font-semibold text-white hover:bg-primary-light transition"
                >
                  Player Login
                </a>
              )}
            </div>
          </div>
        </details>
      </div>
    </nav>
  );
}
