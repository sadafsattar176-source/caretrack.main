import React, { useEffect, useState } from 'react';
import { Stethoscope, ShieldCheck, HeartPulse } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 5000,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setSecondsRemaining(remaining);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [durationMs, onComplete]);

  return (
    <div
      id="caretrack-splash-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-10 select-none overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tagline */}
      <div className="w-full flex items-center justify-center pt-4 sm:pt-8 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-sky-200 text-xs font-semibold tracking-wide shadow-sm">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>CareTrack Health & Medication Management</span>
        </div>
      </div>

      {/* Center Logo & Branding */}
      <div className="flex flex-col items-center justify-center text-center z-10 max-w-md my-auto">
        {/* Animated App Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-sky-400 p-0.5 shadow-2xl shadow-cyan-500/30">
            <div className="w-full h-full rounded-[22px] bg-slate-900/90 backdrop-blur flex items-center justify-center">
              <Stethoscope className="w-12 h-12 sm:w-14 sm:h-14 text-cyan-400 animate-pulse" />
            </div>
          </div>
          {/* Subtle heartbeat badge */}
          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg text-white">
            <HeartPulse className="w-5 h-5 animate-bounce" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
          Care<span className="text-cyan-400">Track</span>
        </h1>

        {/* Tagline */}
        <p className="text-sky-200/90 text-sm sm:text-base mt-2.5 font-medium leading-relaxed">
          Your personal health, medication reminders, and medical consultation companion.
        </p>

        {/* Loading Indicator & Progress */}
        <div className="w-full max-w-xs mt-8 space-y-3">
          <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden backdrop-blur-sm p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full transition-all duration-100 ease-out shadow-sm shadow-cyan-400/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-sky-300/80 font-medium px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Initializing Dashboard...</span>
            </span>
            <span>{secondsRemaining}s</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full text-center pb-4 z-10">
        <p className="text-xs text-sky-300/60 font-medium">
          Secured healthcare organizer &bull; Ready in 5 seconds
        </p>
      </div>
    </div>
  );
};
