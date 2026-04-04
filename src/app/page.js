"use client";

import FeatureCard from "@/components/FeatureCard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { player, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img src="/logo.png" alt="May Madness Spring Classic" className="h-48 w-48 object-contain" />
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              May Madness
            </span>
          </h1>
          <p className="mx-auto mb-2 text-2xl font-semibold text-silver">
            O.B.I. Spring Classic Golf Tournament
          </p>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-foreground/70">
            Track scores, and see where your team stands throughout
            the tournament. Tee it up and get started!
          </p>
          
          {player ? (
            <a href="/scoring" className="inline-block rounded-full bg-primary px-8 py-3 font-semibold text-white transition hover:bg-primary-light">
              Enter Scores
            </a>
          ) : (
            <a href="/login" className="inline-block rounded-full bg-primary px-8 py-3 font-semibold text-white transition hover:bg-primary-light">
              Player Login
            </a>
          )}
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          <a href="/leaderboard">
            <FeatureCard
              emoji="🏆"
              title="Live Leaderboard"
              description="Real-time team standings updated as scores come in."
            />
          </a>
          <a href={player ? "/scoring" : "/login"}>
            <FeatureCard
              emoji="⛳"
              title="Score Entry"
              description="Enter your scores hole-by-hole for each round."
            />
          </a>
          <a href={player?.isAdmin ? "/admin" : "/leaderboard"}>
            <FeatureCard
              emoji="👥"
              title="Teams"
              description="4 teams of 2 competing for the championship."
            />
          </a>
        </div>

        {/* Tournament Info */}
        <div className="mt-20 rounded-2xl bg-secondary border border-white/10 p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-primary mb-2">🏌️ Team Scoring</h3>
              <p className="text-foreground/70">
                8 golfers split into 4 teams of 2. For each hole, the best net score 
                between teammates counts toward the team total.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">📊 Net Scores</h3>
              <p className="text-foreground/70">
                Your handicap strokes are automatically calculated based on your 
                handicap index and the course slope rating.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">🎯 3 Rounds</h3>
              <p className="text-foreground/70">
                Each player completes 3 rounds of golf. Scores accumulate across 
                all rounds for the final team standings.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">📱 Live Updates</h3>
              <p className="text-foreground/70">
                The leaderboard updates in real-time as players enter their scores, 
                so everyone can follow along.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-foreground/50">
          <p>May Madness Spring Classic • Tee It Up ⛳</p>
        </div>
      </footer>
    </div>
  );
}
