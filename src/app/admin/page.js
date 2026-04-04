"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const { player, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!player) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/scoring');
      }
    }
  }, [player, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  async function fetchData() {
    try {
      const [playersRes, teamsRes, roundsRes, coursesRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/teams'),
        fetch('/api/rounds'),
        fetch('/api/courses')
      ]);
      
      setPlayers(await playersRes.json());
      setTeams(await teamsRes.json());
      setRounds(await roundsRes.json());
      setCourses(await coursesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updatePlayer(playerId, updates) {
    try {
      await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update player:', error);
    }
  }

  async function updateTeam(teamId, updates) {
    try {
      await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update team:', error);
    }
  }

  async function updateRound(roundId, updates) {
    try {
      await fetch(`/api/rounds/${roundId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update round:', error);
    }
  }

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">⚙️ Admin Panel</h1>
          <p className="text-foreground/70 mt-2">Manage players, teams, and rounds</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['players', 'teams', 'rounds'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-foreground/70">Loading...</div>
        ) : (
          <>
            {/* Players Tab */}
            {activeTab === 'players' && (
              <div className="space-y-4">
                {players.map(p => (
                  <div key={p.id} className="rounded-2xl bg-secondary border border-white/10 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <label className="text-xs text-foreground/50 block mb-1">Name</label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => updatePlayer(p.id, { name: e.target.value })}
                          className="w-full bg-background rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-foreground/50 block mb-1">Handicap Index</label>
                        <input
                          type="number"
                          step="0.1"
                          value={p.handicapIndex}
                          onChange={(e) => updatePlayer(p.id, { handicapIndex: parseFloat(e.target.value) })}
                          className="w-full bg-background rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-foreground/50 block mb-1">Team</label>
                        <div className="text-foreground/70">{p.teamName || 'Unassigned'}</div>
                      </div>
                      <div>
                        <label className="text-xs text-foreground/50 block mb-1">PIN</label>
                        <div className="text-foreground/50 font-mono">{p.id.replace('player-', '') + p.id.replace('player-', '') + p.id.replace('player-', '') + p.id.replace('player-', '')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div className="space-y-4">
                {teams.map(team => (
                  <div key={team.id} className="rounded-2xl bg-secondary border border-white/10 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <div>
                        <label className="text-xs text-foreground/50 block mb-1">Team Name</label>
                        <input
                          type="text"
                          value={team.name}
                          onChange={(e) => updateTeam(team.id, { name: e.target.value })}
                          className="w-full bg-background rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-foreground/50 block mb-1">Player 1</label>
                        <select
                          value={team.playerIds[0] || ''}
                          onChange={(e) => {
                            const newIds = [...team.playerIds];
                            newIds[0] = e.target.value;
                            updateTeam(team.id, { playerIds: newIds });
                          }}
                          className="w-full bg-background rounded-lg px-3 py-2"
                        >
                          <option value="">Select player...</option>
                          {players.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-foreground/50 block mb-1">Player 2</label>
                        <select
                          value={team.playerIds[1] || ''}
                          onChange={(e) => {
                            const newIds = [...team.playerIds];
                            newIds[1] = e.target.value;
                            updateTeam(team.id, { playerIds: newIds });
                          }}
                          className="w-full bg-background rounded-lg px-3 py-2"
                        >
                          <option value="">Select player...</option>
                          {players.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-foreground/50">
                      Current: {team.players?.map(p => p.name).join(' & ') || 'No players assigned'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rounds Tab */}
            {activeTab === 'rounds' && (
              <div className="space-y-4">
                {rounds.map(round => (
                  <div key={round.id} className="rounded-2xl bg-secondary border border-white/10 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <div>
                        <label className="text-xs text-foreground/50 block mb-1">Round Name</label>
                        <input
                          type="text"
                          value={round.name}
                          onChange={(e) => updateRound(round.id, { name: e.target.value })}
                          className="w-full bg-background rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-foreground/50 block mb-1">Course</label>
                        <select
                          value={round.courseId || ''}
                          onChange={(e) => updateRound(round.id, { courseId: e.target.value, teeId: null })}
                          className="w-full bg-background rounded-lg px-3 py-2"
                        >
                          <option value="">Select course...</option>
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-foreground/50 block mb-1">Tee</label>
                        <select
                          value={round.teeId || ''}
                          onChange={(e) => updateRound(round.id, { teeId: e.target.value })}
                          className="w-full bg-background rounded-lg px-3 py-2"
                          disabled={!round.courseId}
                        >
                          <option value="">Select tee...</option>
                          {round.courseId && courses.find(c => c.id === round.courseId)?.tees.map(t => (
                            <option key={t.id} value={t.id}>{t.name} (Par {t.par})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {round.course && round.tee && (
                      <div className="mt-3 text-sm text-foreground/50">
                        {round.course.name} - {round.tee.name} • Par {round.tee.par} • Slope {courses.find(c => c.id === round.courseId)?.tees.find(t => t.id === round.teeId)?.slopeRating}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

