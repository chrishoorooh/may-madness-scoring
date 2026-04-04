"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { formatScoreRelativeToPar } from '@/lib/golf-utils-client';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLeaderboard() {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard);
      setLastUpdated(new Date(data.lastUpdated));
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function getPositionStyle(position) {
    if (position === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    if (position === 2) return 'bg-gray-400/20 text-gray-300 border-gray-400/50';
    if (position === 3) return 'bg-orange-600/20 text-orange-400 border-orange-500/50';
    return 'bg-secondary border-white/10';
  }

  function getScoreColor(score) {
    if (score === null) return 'text-foreground/50';
    if (score < 0) return 'text-red-400'; // Under par - good!
    if (score > 0) return 'text-blue-400'; // Over par
    return 'text-foreground'; // Even
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
          <p className="text-foreground/70 mt-2">
            Live tournament standings
            {lastUpdated && (
              <span className="ml-2 text-sm">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-foreground/70">Loading leaderboard...</div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((team) => (
              <div
                key={team.teamId}
                className={`rounded-2xl border p-6 ${getPositionStyle(team.position)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold w-12 text-center">
                      {team.position}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{team.teamName}</h3>
                      <p className="text-sm text-foreground/70">
                        {team.players.map(p => p.name).join(' & ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getScoreColor(team.totalScore)}`}>
                      {team.totalScoreFormatted}
                    </div>
                    <p className="text-sm text-foreground/70">
                      {team.holesCompleted} holes
                    </p>
                  </div>
                </div>

                {/* Round breakdown */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-4">
                    {team.roundScores.map((round) => (
                      <div key={round.roundId} className="text-center">
                        <div className="text-xs text-foreground/50 mb-1">{round.roundName}</div>
                        <div className={`font-semibold ${getScoreColor(round.score)}`}>
                          {round.scoreFormatted}
                        </div>
                        <div className="text-xs text-foreground/50">
                          {round.holesCompleted}/18
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-secondary border border-white/10">
            <p className="text-foreground/70">No scores yet. Start playing!</p>
          </div>
        )}
      </main>
    </div>
  );
}

