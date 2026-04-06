"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import RoundScoringForm from "@/components/RoundScoringForm";
import { useAuth } from "@/context/AuthContext";
import { goToLogin } from "@/lib/goToLogin";
import Link from "next/link";

export default function AdminRoundScoring({ params }) {
  const { roundId } = use(params);
  const searchParams = useSearchParams();
  const forPlayerId = searchParams.get("forPlayer");
  const router = useRouter();
  const { player, isAdmin, loading: authLoading } = useAuth();

  const [subjectPlayer, setSubjectPlayer] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loadingPlayer, setLoadingPlayer] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!player) goToLogin();
      else if (!isAdmin) router.replace("/scoring");
    }
  }, [player, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!forPlayerId || !isAdmin) {
      setLoadingPlayer(false);
      if (!forPlayerId) setLoadError("Missing player. Go back to Admin → Enter scores and pick a player.");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingPlayer(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/players/${forPlayerId}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setSubjectPlayer({
            id: data.id,
            name: data.name,
            handicapIndex: data.handicapIndex,
          });
        }
      } catch (e) {
        if (!cancelled) setLoadError(e.message || "Failed to load player");
      } finally {
        if (!cancelled) setLoadingPlayer(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [forPlayerId, isAdmin]);

  if (authLoading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  if (loadingPlayer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-foreground/70">Loading player…</p>
        </div>
      </div>
    );
  }

  if (loadError || !subjectPlayer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-lg px-6 py-12 text-center">
          <p className="text-red-400">{loadError || "Player not found"}</p>
          <Link href="/admin" className="mt-6 inline-block text-primary hover:underline">
            ← Back to Admin
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <RoundScoringForm
        roundId={roundId}
        subjectPlayer={subjectPlayer}
        targetPlayerIdForApi={subjectPlayer.id}
        backHref="/admin"
        backLabel="← Back to Admin"
        banner={`You are entering scores for ${subjectPlayer.name} as an admin.`}
      />
    </div>
  );
}
