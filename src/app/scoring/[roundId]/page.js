"use client";

import { useState, useEffect, use, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { goToLogin } from '@/lib/goToLogin';
import { calculateCourseHandicap, distributeStrokes, formatScoreRelativeToPar } from '@/lib/golf-utils-client';

export default function RoundScoringPage({ params }) {
  const { roundId } = use(params);
  const { player, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [round, setRound] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [scores, setScores] = useState(new Array(18).fill(null));
  const [courseHandicap, setCourseHandicap] = useState(0);
  const [strokes, setStrokes] = useState(new Array(18).fill(0));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentHole, setCurrentHole] = useState(0);
  const holeButtonsRef = useRef([]);

  useEffect(() => {
    if (!authLoading && !player) {
      goToLogin();
    }
  }, [player, authLoading]);

  useEffect(() => {
    if (player && roundId) {
      fetchRoundData();
    }
  }, [player, roundId]);

  // Auto-scroll hole navigation to keep current hole visible
  useEffect(() => {
    if (holeButtonsRef.current[currentHole]) {
      holeButtonsRef.current[currentHole].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentHole]);

  async function fetchRoundData() {
    try {
      // Fetch round info
      const roundRes = await fetch(`/api/rounds/${roundId}`);
      const roundData = await roundRes.json();
      setRound(roundData);

      if (!roundData.courseId || !roundData.teeId) {
        setLoading(false);
        return;
      }

      // Fetch course/tee data
      const courseRes = await fetch(`/api/courses/${roundData.courseId}/${roundData.teeId}`);
      const courseInfo = await courseRes.json();
      setCourseData(courseInfo);

      // Calculate handicap strokes
      const ch = calculateCourseHandicap(
        player.handicapIndex,
        courseInfo.tee.slopeRating,
        courseInfo.tee.courseRating,
        courseInfo.tee.par
      );
      setCourseHandicap(ch);

      const holeHandicaps = courseInfo.holes.map(h => h.handicap);
      const strokeDist = distributeStrokes(ch, holeHandicaps);
      setStrokes(strokeDist);

      // Fetch existing scores
      const scoresRes = await fetch(`/api/scores?roundId=${roundId}`);
      const scoresData = await scoresRes.json();
      const myScore = scoresData.find(s => s.playerId === player.id);
      if (myScore?.holes) {
        setScores(myScore.holes);
        // Find first incomplete hole
        const firstEmpty = myScore.holes.findIndex(s => s === null);
        setCurrentHole(firstEmpty === -1 ? 0 : firstEmpty);
      }
    } catch (error) {
      console.error('Failed to fetch round data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveScores(scoresToSave) {
    setSaving(true);
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId, holes: scoresToSave })
      });
    } catch (error) {
      console.error('Failed to save scores:', error);
    } finally {
      setSaving(false);
    }
  }

  function handleScoreChange(holeIndex, value) {
    const newScores = [...scores];
    newScores[holeIndex] = value === '' ? null : parseInt(value);
    setScores(newScores);
    // Auto-save with the new scores
    saveScores(newScores);
  }

  function handleQuickScore(holeIndex, score) {
    const newScores = [...scores];
    newScores[holeIndex] = score;
    setScores(newScores);
    
    // Auto-advance to next hole (only if entering a score, not clearing)
    if (score !== null && holeIndex < 17) {
      setCurrentHole(holeIndex + 1);
    }
    
    // Auto-save with the new scores (not stale state)
    saveScores(newScores);
  }

  function calculateTotals() {
    let totalGross = 0;
    let totalNet = 0;
    let totalPar = 0;
    let holesPlayed = 0;

    scores.forEach((score, i) => {
      if (score !== null && courseData?.holes?.[i]) {
        totalGross += score;
        totalNet += score - strokes[i];
        totalPar += courseData.holes[i].par;
        holesPlayed++;
      }
    });

    return {
      gross: totalGross,
      net: totalNet,
      par: totalPar,
      relativeToPar: totalNet - totalPar,
      holesPlayed
    };
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/70">Redirecting to login...</p>
      </div>
    );
  }

  if (!round?.courseId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Round Not Available</h1>
          <p className="text-foreground/70">This round hasn't been configured with a course yet.</p>
          <Link href="/scoring" prefetch={false} className="text-primary hover:underline mt-4 inline-block">← Back to Rounds</Link>
        </main>
      </div>
    );
  }

  const totals = calculateTotals();
  const currentHoleData = courseData?.holes?.[currentHole];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/scoring" prefetch={false} className="text-primary hover:underline text-sm">← Back to Rounds</Link>
          <h1 className="text-2xl font-bold mt-2">{round.name}</h1>
          <p className="text-foreground/70">
            {courseData?.course?.name} - {courseData?.tee?.name}
          </p>
          <p className="text-sm text-foreground/50 mt-1">
            Your course handicap: {courseHandicap} ({player.handicapIndex} index)
          </p>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl bg-secondary p-4 text-center">
            <div className="text-sm text-foreground/50">Gross</div>
            <div className="text-2xl font-bold">{totals.gross || '-'}</div>
          </div>
          <div className="rounded-xl bg-secondary p-4 text-center">
            <div className="text-sm text-foreground/50">Net</div>
            <div className="text-2xl font-bold">{totals.net || '-'}</div>
          </div>
          <div className="rounded-xl bg-secondary p-4 text-center">
            <div className="text-sm text-foreground/50">vs Par</div>
            <div className={`text-2xl font-bold ${
              totals.relativeToPar < 0 ? 'text-red-400' : 
              totals.relativeToPar > 0 ? 'text-blue-400' : ''
            }`}>
              {totals.holesPlayed > 0 ? formatScoreRelativeToPar(totals.relativeToPar) : '-'}
            </div>
          </div>
          <div className="rounded-xl bg-secondary p-4 text-center">
            <div className="text-sm text-foreground/50">Holes</div>
            <div className="text-2xl font-bold">{totals.holesPlayed}/18</div>
          </div>
        </div>

        {/* Hole Navigation */}
        <div className="mb-2 text-sm text-foreground/70 font-medium">
          Select Hole # <span className="text-primary ml-2">● = stroke hole</span>
        </div>
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {courseData?.holes?.map((hole, i) => (
            <button
              key={i}
              ref={el => holeButtonsRef.current[i] = el}
              onClick={() => setCurrentHole(i)}
              className={`relative flex-shrink-0 w-10 h-12 rounded-lg text-sm font-semibold transition flex flex-col items-center justify-center ${
                currentHole === i
                  ? 'bg-primary text-white'
                  : scores[i] !== null
                  ? 'bg-accent/20 text-accent'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <span>{i + 1}</span>
              {strokes[i] > 0 && (
                <span className={`text-[8px] leading-none ${currentHole === i ? 'text-white' : 'text-primary'}`}>
                  {strokes[i] > 1 ? '●●' : '●'}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Quick Entry for Current Hole */}
        {currentHoleData && (
          <div className="rounded-2xl bg-secondary border border-primary/50 p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-sm text-foreground/50">Hole {currentHole + 1}</div>
              <div className="text-lg">
                Par {currentHoleData.par} • {currentHoleData.yards} yds
                {strokes[currentHole] > 0 && (
                  <span className="ml-2 text-primary">
                    ({strokes[currentHole]} stroke{strokes[currentHole] > 1 ? 's' : ''})
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-center gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                <button
                  key={score}
                  onClick={() => handleQuickScore(currentHole, score)}
                  className={`w-12 h-12 rounded-xl font-bold transition ${
                    scores[currentHole] === score
                      ? 'bg-primary text-white'
                      : 'bg-background hover:bg-background/80'
                  } ${
                    score === currentHoleData.par ? 'ring-2 ring-primary/50' : ''
                  }`}
                >
                  {score}
                </button>
              ))}
              <button
                onClick={() => handleQuickScore(currentHole, null)}
                className={`w-12 h-12 rounded-xl font-bold transition bg-red-500/20 text-red-400 hover:bg-red-500/30`}
                title="Clear score"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Full Scorecard */}
        <div className="rounded-2xl bg-secondary border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold">Full Scorecard</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-3 py-2 text-left">Hole</th>
                  <th className="px-3 py-2 text-center">Par</th>
                  <th className="px-3 py-2 text-center">Hdcp</th>
                  <th className="px-3 py-2 text-center">Strk</th>
                  <th className="px-3 py-2 text-center">Score</th>
                  <th className="px-3 py-2 text-center">Net</th>
                </tr>
              </thead>
              <tbody>
                {courseData?.holes?.map((hole, i) => (
                  <tr 
                    key={i} 
                    className={`border-b border-white/5 ${currentHole === i ? 'bg-primary/10' : ''}`}
                    onClick={() => setCurrentHole(i)}
                  >
                    <td className="px-3 py-2 font-semibold">{hole.number}</td>
                    <td className="px-3 py-2 text-center">{hole.par}</td>
                    <td className="px-3 py-2 text-center text-foreground/50">{hole.handicap}</td>
                    <td className="px-3 py-2 text-center text-primary">
                      {strokes[i] > 0 ? strokes[i] : '-'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="1"
                        max="15"
                        value={scores[i] ?? ''}
                        onChange={(e) => handleScoreChange(i, e.target.value)}
                        className="w-12 bg-background rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="px-3 py-2 text-center font-semibold">
                      {scores[i] !== null ? scores[i] - strokes[i] : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10 font-semibold">
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-center">{courseData?.tee?.par}</td>
                  <td className="px-3 py-2 text-center">-</td>
                  <td className="px-3 py-2 text-center text-primary">{strokes.reduce((a, b) => a + b, 0)}</td>
                  <td className="px-3 py-2 text-center">{totals.gross || '-'}</td>
                  <td className="px-3 py-2 text-center">{totals.net || '-'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Save indicator */}
        {saving && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-lg">
            Saving...
          </div>
        )}
      </main>
    </div>
  );
}

