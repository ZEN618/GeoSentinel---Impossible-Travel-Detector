import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  X, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { executeLogin } from '../services/storage';
import { DetectionResult } from '../types';

interface LoginPortalProps {
  onClose?: () => void;
  onLoginSuccess?: (result: DetectionResult) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('SentinelDemo#2026');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  // Keystroke intervals
  const keystrokeTimings = useRef<number[]>([]);
  const lastKeyTime = useRef<number | null>(null);

  const handleKeyDown = () => {
    const now = performance.now();
    if (lastKeyTime.current !== null) {
      const interval = Math.round(now - lastKeyTime.current);
      keystrokeTimings.current.push(interval);
    }
    lastKeyTime.current = now;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    // Simulate network authentication round-trip
    setTimeout(() => {
      // Default coordinates from specification: lat 9.93, lon 76.26, ISP Unknown, VPN false
      const res = executeLogin({
        username: username.trim(),
        latitude: 9.93,
        longitude: 76.26,
        isp: 'Unknown',
        vpn: false,
        keystroke_timing: [...keystrokeTimings.current],
      });

      setResult(res);
      setIsLoading(false);

      // Reset biometric timing buffer for next submission
      keystrokeTimings.current = [];
      lastKeyTime.current = null;

      if (onLoginSuccess) {
        onLoginSuccess(res);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-700 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.35)] mb-3">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            GeoSentinel Gateway
          </h2>
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mt-0.5">
            Behavioral Telemetry Verification
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                placeholder="••••••••••••"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Keystroke flight dynamics automatically captured in real time.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Behavioral Telemetry...</span>
              </>
            ) : (
              <span>Authenticate Session</span>
            )}
          </button>
        </form>

        {/* Detection Result Box */}
        {result && (
          <div
            className={`mt-5 p-4 rounded-xl border transition-all animate-in fade-in duration-300 ${
              result.action === 'ALLOW'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : result.action === 'FLAG'
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                : 'bg-red-950/30 border-red-500/40 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1">
              {result.action === 'ALLOW' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {result.action === 'FLAG' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {result.action === 'BLOCK' && <XCircle className="w-4 h-4 text-red-400" />}
              <span>
                {result.action === 'ALLOW'
                  ? 'Access Granted (Allowed)'
                  : result.action === 'FLAG'
                  ? 'Challenge Required (Flagged)'
                  : 'Access Blocked (Critical Anomaly)'}
              </span>
            </div>

            <p className="text-xs opacity-90 mb-2">
              {result.action === 'ALLOW'
                ? 'Identity telemetry verified. Velocity and ISP verified against baseline security profile.'
                : result.action === 'FLAG'
                ? 'Suspicious vector detected. Session routed to Security Operations Center for pending review.'
                : 'Impossible travel or critical security policy breach detected. Session blocked immediately.'}
            </p>

            <div className="font-mono text-[11px] pt-2 border-t border-slate-800/80 text-slate-300 flex flex-wrap gap-x-3 gap-y-1">
              <span>Risk: <strong>{result.risk_score}/100</strong></span>
              <span>Speed: <strong>{Math.round(result.speed_kmh)} km/h</strong></span>
              <span>
                Keystroke: <strong>{result.keystroke_deviation ? `${result.keystroke_deviation} ms` : 'Nominal'}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
