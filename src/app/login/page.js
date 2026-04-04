"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * iOS Safari often fails to deliver click to controls inside <form>.
 * Keypad is outside the form; use one pointer path (Pointer Events cover touch + mouse).
 */
function KeypadKey({ label, className, onPress }) {
  const run = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <div
      role="button"
      tabIndex={0}
      className={className}
      style={{ WebkitTapHighlightColor: "transparent" }}
      onPointerUp={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        run();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          run();
        }
      }}
    >
      {label}
    </div>
  );
}

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const lastInputAt = useRef(0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(pin);
      router.push("/scoring");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePinInput(digit) {
    const t = Date.now();
    if (t - lastInputAt.current < 45) return;
    lastInputAt.current = t;
    setPin((prev) => (prev.length < 4 ? prev + digit : prev));
  }

  function handleBackspace() {
    const t = Date.now();
    if (t - lastInputAt.current < 45) return;
    lastInputAt.current = t;
    setPin((prev) => prev.slice(0, -1));
  }

  function handleClear() {
    const t = Date.now();
    if (t - lastInputAt.current < 45) return;
    lastInputAt.current = t;
    setPin("");
  }

  const keyClass =
    "flex h-16 select-none items-center justify-center rounded-xl bg-secondary text-2xl font-semibold touch-manipulation cursor-pointer active:opacity-80";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="relative z-[60] isolate w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="May Madness"
            className="h-24 w-24 mx-auto mb-4 object-contain pointer-events-none"
          />
          <h1 className="text-2xl font-bold">Player Login</h1>
          <p className="text-foreground/70 mt-2">Enter your 4-digit PIN</p>
        </div>

        <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex h-16 w-14 items-center justify-center rounded-xl border-2 border-white/10 bg-secondary text-3xl font-bold"
              >
                {pin[i] ? "•" : ""}
              </div>
            ))}
          </div>

          {error && (
            <div className="text-center text-sm text-red-400">{error}</div>
          )}
        </form>

        {/* Outside <form>: avoids iOS Safari swallowing taps on keypad controls */}
        <div
          className="mt-6 grid grid-cols-3 gap-3"
          role="group"
          aria-label="PIN keypad"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <KeypadKey
              key={digit}
              label={String(digit)}
              onPress={() => handlePinInput(String(digit))}
              className={keyClass}
            />
          ))}
          <KeypadKey
            label="Clear"
            onPress={handleClear}
            className="flex h-16 select-none cursor-pointer items-center justify-center rounded-xl bg-red-500/20 text-sm font-semibold text-red-400 touch-manipulation active:opacity-80"
          />
          <KeypadKey
            label="0"
            onPress={() => handlePinInput("0")}
            className={keyClass}
          />
          <KeypadKey
            label="←"
            onPress={handleBackspace}
            className="flex h-16 select-none cursor-pointer items-center justify-center rounded-xl bg-secondary text-xl touch-manipulation active:opacity-80"
          />
        </div>

        <div className="mt-6">
          <button
            type="submit"
            form="login-form"
            disabled={pin.length !== 4 || loading}
            className="w-full cursor-pointer rounded-xl bg-primary py-4 font-semibold text-white transition hover:bg-primary-light touch-manipulation active:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Enter"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-primary hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
