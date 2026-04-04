"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const AuthContext = createContext(null);

const ME_ATTEMPTS = 6;

/** Same host as the page (important when testing from phone via http://192.168.x.x:3000). */
function apiUrl(path) {
  if (typeof window === "undefined") return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${p}`;
}

const fetchOpts = { credentials: "include", cache: "no-store" };

export function AuthProvider({ children }) {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  /** Mirrors `player` for checkAuth without stale closures (retry when /me is briefly null after soft nav). */
  const playerRef = useRef(null);
  playerRef.current = player;
  /** Skip one pathname-driven /me fetch right after login() so WebKit can’t race Set-Cookie vs /api/auth/me. */
  const skipNextPathnameAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    let lastError = null;
    try {
      for (let attempt = 0; attempt < ME_ATTEMPTS; attempt++) {
        try {
          const response = await fetch(apiUrl("/api/auth/me"), fetchOpts);
          if (response.status === 401 || response.status === 403) {
            setPlayer(null);
            return;
          }
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const data = await response.json();
          const nextPlayer = data.player ?? null;
          if (nextPlayer != null) {
            setPlayer(nextPlayer);
            return;
          }
          /* Server says no cookie/session — but client still shows logged-in after login → soft nav
             (Safari often lags sending the new cookie on the first /me). Retry before clearing. */
          if (playerRef.current != null && attempt < ME_ATTEMPTS - 1) {
            await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
            continue;
          }
          setPlayer(null);
          return;
        } catch (error) {
          lastError = error;
          if (attempt < ME_ATTEMPTS - 1) {
            await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
          }
        }
      }
      console.warn(
        "Auth check failed (network) after retries:",
        lastError?.message || String(lastError),
        "— Same Wi‑Fi? Mac LAN URL (e.g. http://192.168.x.x:3000)? iOS: Settings → Apps → Safari → Local Network ON for this device."
      );
      /* Do not setPlayer(null): 5xx / network blips are not “logged out”. Clearing here made
         every soft nav (e.g. logo → home) look like logout when /me failed once. */
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-check session on every client navigation so a soft-loaded page matches cookies (Safari).
  useEffect(() => {
    if (skipNextPathnameAuth.current) {
      skipNextPathnameAuth.current = false;
      return;
    }
    checkAuth();
  }, [pathname, checkAuth]);

  // BFCache restore (back/forward): session may need a fresh read.
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted) checkAuth();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [checkAuth]);

  async function login(pin) {
    const response = await fetch(apiUrl("/api/auth/login"), {
      ...fetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    skipNextPathnameAuth.current = true;
    setPlayer(data.player);
    return data.player;
  }

  async function logout() {
    try {
      await fetch(apiUrl("/api/auth/logout"), { ...fetchOpts, method: "POST" });
    } catch {
      /* still drop client session */
    }
    setPlayer(null);
    if (typeof window !== "undefined") {
      window.location.assign("/");
    }
  }

  async function refreshPlayer() {
    await checkAuth();
  }

  return (
    <AuthContext.Provider value={{ player, loading, login, logout, refreshPlayer, isAdmin: player?.isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
