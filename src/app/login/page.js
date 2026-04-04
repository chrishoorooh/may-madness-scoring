"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function digitsOnly(s) {
  return s.replace(/\D/g, "");
}

function LoginPinForm() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const inputRef = useRef(null);
  const loadingRef = useRef(false);
  loadingRef.current = loading;

  const canSubmit = pin.length === 4 && !loading;

  function readPinFromInput() {
    return digitsOnly(inputRef.current?.value ?? "").slice(0, 4);
  }

  function syncPinFromDom() {
    const el = inputRef.current;
    if (!el || loadingRef.current) return;
    let v = digitsOnly(el.value).slice(0, 4);
    if (el.value !== v) el.value = v;
    setPin(v);
  }

  /** Capture phase so dots update even when React’s delegated handlers misbehave (iOS Safari + dev). */
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handler = () => syncPinFromDom();
    el.addEventListener("input", handler, true);
    el.addEventListener("paste", handler, true);
    return () => {
      el.removeEventListener("input", handler, true);
      el.removeEventListener("paste", handler, true);
    };
  }, [loading]);

  useEffect(() => {
    setError("");
    setPin("");
    const el = inputRef.current;
    if (el) el.value = "";
    const id = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(id);
  }, []);

  async function handleFormSubmit(e) {
    e.preventDefault();
    syncPinFromDom();
    const code = readPinFromInput();
    if (code.length !== 4) {
      setError("Enter all 4 digits");
      return;
    }
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await login(code);
      window.setTimeout(() => router.push("/scoring"), 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function clearPin() {
    setPin("");
    setError("");
    const el = inputRef.current;
    if (el) el.value = "";
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <form id="login-form" onSubmit={handleFormSubmit} className="relative z-10 space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-center gap-2" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex h-3 w-3 items-center justify-center rounded-full border border-white/20 ${
                pin[i] ? "border-primary bg-primary/40" : "bg-white/10"
              }`}
            >
              {pin[i] ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
            </div>
          ))}
        </div>

        <label htmlFor="pin-input" className="sr-only">
          Four digit PIN — type all digits in this field
        </label>
        <input
          ref={inputRef}
          id="pin-input"
          name="pin"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={4}
          defaultValue=""
          disabled={loading}
          onInput={syncPinFromDom}
          onChange={syncPinFromDom}
          className="box-border min-h-[3rem] w-full max-w-[13rem] rounded-xl border-2 border-white/10 bg-secondary px-3 py-3 text-center text-[1.125rem] font-bold tracking-[0.55em] text-foreground caret-primary [font-variant-numeric:tabular-nums] touch-manipulation [-webkit-tap-highlight-color:transparent] disabled:opacity-60 sm:text-2xl sm:tracking-[0.65em]"
        />

        <p className="max-w-xs text-center text-xs leading-snug text-foreground/50">
          Tap the field once, then type four numbers on the keyboard — no extra taps between digits.
        </p>
      </div>

      {error ? <div className="text-center text-sm text-red-400">{error}</div> : null}

      <div className="relative z-10 flex flex-col gap-3">
        <button
          type="submit"
          disabled={loading}
          className={`w-full touch-manipulation rounded-xl border-0 py-4 font-semibold text-white transition [-webkit-tap-highlight-color:transparent] ${
            canSubmit
              ? "cursor-pointer bg-primary hover:bg-primary-light active:opacity-90"
              : "cursor-pointer bg-primary/40 opacity-80"
          }`}
        >
          {loading ? "Logging in..." : "Enter"}
        </button>
        <button
          type="button"
          onClick={clearPin}
          disabled={loading}
          className="w-full cursor-pointer touch-manipulation rounded-xl border-0 bg-red-500/20 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/30 active:opacity-90 disabled:opacity-50 [-webkit-tap-highlight-color:transparent]"
        >
          Clear PIN
        </button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh min-h-screen flex-col items-center justify-center bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src="/logo.png"
            alt="May Madness"
            className="pointer-events-none mx-auto mb-4 h-24 w-24 object-contain"
          />
          <h1 className="text-2xl font-bold">Player Login</h1>
          <p className="mt-2 text-foreground/70">Enter your 4-digit PIN</p>
        </div>

        <LoginPinForm />

        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-block cursor-pointer touch-manipulation py-2 text-sm text-primary hover:underline [-webkit-tap-highlight-color:transparent]"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
