"use client";

import { useState, useEffect } from 'react';
import { formatScoreRelativeToPar } from '@/lib/golf-utils-client';

export default function LeaderboardPanel({ isOpen, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
      // Poll for updates every 10 seconds while open
      const interval = setInterval(fetchLeaderboard, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

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

  function getScoreColor(score) {
    if (score === null) return 'text-foreground/50';
    if (score < 0) return 'text-red-400';
    if (score > 0) return 'text-blue-400';
    return 'text-foreground';
  }

  function getPositionEmoji(position) {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `${position}.`;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-white/10 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold">🏆 Leaderboard</h2>
            {lastUpdated && (
              <p className="text-xs text-foreground/50">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-80px)] p-4">
          {loading ? (
            <div className="text-center py-8 text-foreground/70">Loading...</div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((team) => (
                <div
                  key={team.teamId}
                  className={`rounded-xl p-4 ${
                    team.position === 1 
                      ? 'bg-yellow-500/10 border border-yellow-500/30' 
                      : 'bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getPositionEmoji(team.position)}</span>
                      <div>
                        <div className="font-semibold">{team.teamName}</div>
                        <div className="text-xs text-foreground/50">
                          {team.players.map(p => p.name.split(' ')[0]).join(' & ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(team.totalScore)}`}>
                        {team.totalScoreFormatted}
                      </div>
                      <div className="text-xs text-foreground/50">
                        {team.holesCompleted} holes
                      </div>
                    </div>
                  </div>

                  {/* Round breakdown */}
                  <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
                    {team.roundScores.map((round) => (
                      <div key={round.roundId} className="flex-1 text-center">
                        <div className="text-[10px] text-foreground/40">{round.roundName}</div>
                        <div className={`text-sm font-semibold ${getScoreColor(round.score)}`}>
                          {round.scoreFormatted}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && leaderboard.length === 0 && (
            <div className="text-center py-8 text-foreground/70">
              No scores yet. Start playing!
            </div>
          )}
        </div>
      </div>
    </>
  );
}

