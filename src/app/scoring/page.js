"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { goToLogin } from '@/lib/goToLogin';

export default function ScoringPage() {
  const { player, loading: authLoading } = useAuth();
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !player) {
      goToLogin();
    }
  }, [player, authLoading]);

  useEffect(() => {
    if (player) {
      fetchRounds();
    }
  }, [player]);

  async function fetchRounds() {
    try {
      const response = await fetch('/api/rounds');
      const data = await response.json();
      setRounds(data);
    } catch (error) {
      console.error('Failed to fetch rounds:', error);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">⛳ Score Entry</h1>
          <p className="text-foreground/70 mt-2">
            Welcome, {player.name}! Select a round to enter your scores.
          </p>
          <p className="text-sm text-foreground/50 mt-1">
            Your handicap index: {player.handicapIndex}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-foreground/70">Loading rounds...</div>
        ) : (
          <div className="space-y-4">
            {rounds.map((round) => (
              <a
                key={round.id}
                href={round.courseId ? `/scoring/${round.id}` : '#'}
                className={`block rounded-2xl border p-6 transition ${
                  round.courseId
                    ? 'border-white/10 bg-secondary hover:border-primary/50'
                    : 'border-white/5 bg-secondary/50 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{round.name}</h3>
                    {round.course ? (
                      <p className="text-foreground/70 mt-1">
                        {round.course.name} - {round.tee?.name || 'TBD'}
                      </p>
                    ) : (
                      <p className="text-foreground/50 mt-1">Course not yet assigned</p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    {round.courseId ? (
                      <>
                        <div className="text-primary font-semibold">Enter Scores →</div>
                        <p className="text-sm text-foreground/50">Par {round.tee?.par}</p>
                      </>
                    ) : (
                      <div className="text-foreground/50">Not Available</div>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {!loading && rounds.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-secondary border border-white/10">
            <p className="text-foreground/70">No rounds configured yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}

