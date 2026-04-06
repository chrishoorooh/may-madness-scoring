"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { calculateCourseHandicap, distributeStrokes, formatScoreRelativeToPar } from "@/lib/golf-utils-client";

/**
 * @param {object} props
 * @param {string} props.roundId
 * @param {{ id: string, name: string, handicapIndex: number }} props.subjectPlayer — player whose handicap/scores apply
 * @param {string | null} [props.targetPlayerIdForApi] — when set, POST /api/scores includes targetPlayerId (admin entry)
 * @param {string} props.backHref
 * @param {string} props.backLabel
 * @param {string} [props.banner] — optional notice above header (e.g. admin mode)
 */
export default function RoundScoringForm({
  roundId,
  subjectPlayer,
  targetPlayerIdForApi = null,
  backHref,
  backLabel,
  banner = null,
}) {
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
    if (subjectPlayer && roundId) {
      fetchRoundData();
    }
  }, [subjectPlayer?.id, roundId]);

  useEffect(() => {
    if (holeButtonsRef.current[currentHole]) {
      holeButtonsRef.current[currentHole].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentHole]);

  async function fetchRoundData() {
    try {
      const roundRes = await fetch(`/api/rounds/${roundId}`);
      const roundData = await roundRes.json();
      setRound(roundData);

      if (!roundData.courseId || !roundData.teeId) {
        setLoading(false);
        return;
      }

      const courseRes = await fetch(`/api/courses/${roundData.courseId}/${roundData.teeId}`);
      const courseInfo = await courseRes.json();
      setCourseData(courseInfo);

      const ch = calculateCourseHandicap(
        subjectPlayer.handicapIndex,
        courseInfo.tee.slopeRating,
        courseInfo.tee.courseRating,
        courseInfo.tee.par
      );
      setCourseHandicap(ch);

      const holeHandicaps = courseInfo.holes.map((h) => h.handicap);
      const strokeDist = distributeStrokes(ch, holeHandicaps);
      setStrokes(strokeDist);

      const scoresRes = await fetch(`/api/scores?roundId=${roundId}`);
      const scoresData = await scoresRes.json();
      const row = scoresData.find((s) => s.playerId === subjectPlayer.id);
      if (row?.holes) {
        setScores(row.holes);
        const firstEmpty = row.holes.findIndex((s) => s === null);
        setCurrentHole(firstEmpty === -1 ? 0 : firstEmpty);
      }
    } catch (error) {
      console.error("Failed to fetch round data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveScores(scoresToSave) {
    setSaving(true);
    try {
      const body = {
        roundId,
        holes: scoresToSave,
        ...(targetPlayerIdForApi ? { targetPlayerId: targetPlayerIdForApi } : {}),
      };
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error("Failed to save scores:", error);
    } finally {
      setSaving(false);
    }
  }

  function handleScoreChange(holeIndex, value) {
    const newScores = [...scores];
    newScores[holeIndex] = value === "" ? null : parseInt(value, 10);
    setScores(newScores);
    saveScores(newScores);
  }

  function handleQuickScore(holeIndex, score) {
    const newScores = [...scores];
    newScores[holeIndex] = score;
    setScores(newScores);

    if (score !== null && holeIndex < 17) {
      setCurrentHole(holeIndex + 1);
    }

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
      holesPlayed,
    };
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  if (!round?.courseId) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Round Not Available</h1>
        <p className="text-foreground/70">This round hasn&apos;t been configured with a course yet.</p>
        <Link href={backHref} prefetch={false} className="mt-4 inline-block text-primary hover:underline">
          {backLabel}
        </Link>
      </main>
    );
  }

  const totals = calculateTotals();
  const currentHoleData = courseData?.holes?.[currentHole];

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      {banner ? (
        <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {banner}
        </div>
      ) : null}

      <div className="mb-6">
        <Link href={backHref} prefetch={false} className="text-sm text-primary hover:underline">
          {backLabel}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{round.name}</h1>
        <p className="text-foreground/70">
          {courseData?.course?.name} - {courseData?.tee?.name}
        </p>
        <p className="mt-1 text-sm text-foreground/50">
          {subjectPlayer.name} — course handicap: {courseHandicap} ({subjectPlayer.handicapIndex} index)
        </p>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-secondary p-4 text-center">
          <div className="text-sm text-foreground/50">Gross</div>
          <div className="text-2xl font-bold">{totals.gross || "-"}</div>
        </div>
        <div className="rounded-xl bg-secondary p-4 text-center">
          <div className="text-sm text-foreground/50">Net</div>
          <div className="text-2xl font-bold">{totals.net || "-"}</div>
        </div>
        <div className="rounded-xl bg-secondary p-4 text-center">
          <div className="text-sm text-foreground/50">vs Par</div>
          <div
            className={`text-2xl font-bold ${
              totals.relativeToPar < 0 ? "text-red-400" : totals.relativeToPar > 0 ? "text-blue-400" : ""
            }`}
          >
            {totals.holesPlayed > 0 ? formatScoreRelativeToPar(totals.relativeToPar) : "-"}
          </div>
        </div>
        <div className="rounded-xl bg-secondary p-4 text-center">
          <div className="text-sm text-foreground/50">Holes</div>
          <div className="text-2xl font-bold">{totals.holesPlayed}/18</div>
        </div>
      </div>

      <div className="mb-2 text-sm font-medium text-foreground/70">
        Select Hole # <span className="ml-2 text-primary">● = stroke hole</span>
      </div>
      <div className="mb-6 flex gap-1 overflow-x-auto pb-2">
        {courseData?.holes?.map((hole, i) => (
          <button
            key={i}
            ref={(el) => {
              holeButtonsRef.current[i] = el;
            }}
            type="button"
            onClick={() => setCurrentHole(i)}
            className={`relative flex h-12 w-10 flex-shrink-0 flex-col items-center justify-center rounded-lg text-sm font-semibold transition ${
              currentHole === i
                ? "bg-primary text-white"
                : scores[i] !== null
                  ? "bg-accent/20 text-accent"
                  : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <span>{i + 1}</span>
            {strokes[i] > 0 && (
              <span
                className={`text-[8px] leading-none ${currentHole === i ? "text-white" : "text-primary"}`}
              >
                {strokes[i] > 1 ? "●●" : "●"}
              </span>
            )}
          </button>
        ))}
      </div>

      {currentHoleData && (
        <div className="mb-6 rounded-2xl border border-primary/50 bg-secondary p-6">
          <div className="mb-4 text-center">
            <div className="text-sm text-foreground/50">Hole {currentHole + 1}</div>
            <div className="text-lg">
              Par {currentHoleData.par} • {currentHoleData.yards} yds
              {strokes[currentHole] > 0 && (
                <span className="ml-2 text-primary">
                  ({strokes[currentHole]} stroke{strokes[currentHole] > 1 ? "s" : ""})
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => handleQuickScore(currentHole, score)}
                className={`h-12 w-12 rounded-xl font-bold transition ${
                  scores[currentHole] === score
                    ? "bg-primary text-white"
                    : "bg-background hover:bg-background/80"
                } ${score === currentHoleData.par ? "ring-2 ring-primary/50" : ""}`}
              >
                {score}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleQuickScore(currentHole, null)}
              className="h-12 w-12 rounded-xl bg-red-500/20 font-bold text-red-400 transition hover:bg-red-500/30"
              title="Clear score"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-secondary">
        <div className="border-b border-white/10 p-4">
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
                  className={`cursor-pointer border-b border-white/5 ${currentHole === i ? "bg-primary/10" : ""}`}
                  onClick={() => setCurrentHole(i)}
                >
                  <td className="px-3 py-2 font-semibold">{hole.number}</td>
                  <td className="px-3 py-2 text-center">{hole.par}</td>
                  <td className="px-3 py-2 text-center text-foreground/50">{hole.handicap}</td>
                  <td className="px-3 py-2 text-center text-primary">{strokes[i] > 0 ? strokes[i] : "-"}</td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={scores[i] ?? ""}
                      onChange={(e) => handleScoreChange(i, e.target.value)}
                      className="w-12 rounded bg-background px-2 py-1 text-center"
                    />
                  </td>
                  <td className="px-3 py-2 text-center font-semibold">
                    {scores[i] !== null ? scores[i] - strokes[i] : "-"}
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
                <td className="px-3 py-2 text-center">{totals.gross || "-"}</td>
                <td className="px-3 py-2 text-center">{totals.net || "-"}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {saving && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-primary px-4 py-2 text-white">
          Saving...
        </div>
      )}
    </main>
  );
}
