"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setPlayer(data.player);
    } catch (error) {
      console.error('Auth check failed:', error);
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(pin) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setPlayer(data.player);
    return data.player;
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setPlayer(null);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

