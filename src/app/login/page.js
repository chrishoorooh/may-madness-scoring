"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(pin);
      router.push('/scoring');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePinInput(digit) {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  }

  function handleBackspace() {
    setPin(prev => prev.slice(0, -1));
  }

  function handleClear() {
    setPin('');
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="May Madness" className="h-24 w-24 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold">Player Login</h1>
          <p className="text-foreground/70 mt-2">Enter your 4-digit PIN</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN Display */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="w-14 h-16 rounded-xl bg-secondary border-2 border-white/10 flex items-center justify-center text-3xl font-bold"
              >
                {pin[i] ? '•' : ''}
              </div>
            ))}
          </div>

          {error && (
            <div className="text-center text-red-400 text-sm">{error}</div>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePinInput(String(digit))}
                className="h-16 rounded-xl bg-secondary text-2xl font-semibold hover:bg-secondary/80 transition"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-16 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handlePinInput('0')}
              className="h-16 rounded-xl bg-secondary text-2xl font-semibold hover:bg-secondary/80 transition"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-16 rounded-xl bg-secondary text-xl hover:bg-secondary/80 transition"
            >
              ←
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={pin.length !== 4 || loading}
            className="w-full py-4 rounded-xl bg-primary font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-light transition"
          >
            {loading ? 'Logging in...' : 'Enter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-primary hover:underline text-sm">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}

