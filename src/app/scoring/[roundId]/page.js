"use client";

import { use, useEffect } from "react";
import Navbar from "@/components/Navbar";
import RoundScoringForm from "@/components/RoundScoringForm";
import { useAuth } from "@/context/AuthContext";
import { goToLogin } from "@/lib/goToLogin";

export default function RoundScoringPage({ params }) {
  const { roundId } = use(params);
  const { player, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !player) {
      goToLogin();
    }
  }, [player, authLoading]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground/70">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <RoundScoringForm
        roundId={roundId}
        subjectPlayer={player}
        backHref="/scoring"
        backLabel="← Back to Rounds"
      />
    </div>
  );
}
