import React, { useState } from 'react';
import { 
  Flame, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Activity, 
  MapPin, 
  Network, 
  Zap, 
  Check, 
  Sparkles,
  Lock,
  Clock
} from 'lucide-react';
import { DetectionResult, LoginEvent } from '../types';
import { calculateRisk } from '../services/detector';
import { getLastUserLogin } from '../services/storage';

interface ThreatSimulatorProps {
  onSimulationRecorded?: (result: DetectionResult) => void;
}

export const ThreatSimulator: React.FC<ThreatSimulatorProps> = ({
  onSimulationRecorded,
}) => {
  // Preset types
  type PresetType = 'clean' | 'vpn' | 'impossible' | 'custom';
  const [activePreset, setActivePreset] = useState<PresetType>('impossible');

  // Form State
  const [username, setUsername] = useState('alice');
  const [latitude, setLatitude] = useState('40.71');
  const [longitude, setLongitude] = useState('-74.00');
  const [isp, setIsp] = useState('Comcast');
  const [ipAddress, setIpAddress] = useState('162.243.10.4');
  const [vpn, setVpn] = useState(true);
  const [timeDiffMinutes, setTimeDiffMinutes] = useState('5');

  // Result State
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [evaluatedContext, setEvaluatedContext] = useState<{
    previous: Partial<LoginEvent> | null;
    current: Partial<LoginEvent>;
  } | null>(null);

  // Load Presets
  const applyPreset = (type: PresetType) => {
    setActivePreset(type);
    if (type === 'clean') {
      setUsername('alice');
      setLatitude('9.93');
      setLongitude('76.26');
      setIsp('Asianet Broadband');
      setIpAddress('103.28.246.12');
      setVpn(false);
      setTimeDiffMinutes('60');
    } else if (type === 'vpn') {
      setUsername('alice');
      setLatitude('9.93');
      setLongitude('76.26');
      setIsp('Asianet Broadband');
      setIpAddress('103.28.246.12');
      setVpn(true);
      setTimeDiffMinutes('30');
    } else if (type === 'impossible') {
      setUsername('alice');
      setLatitude('40.71');
      setLongitude('-74.00');
      setIsp('Comcast');
      setIpAddress('162.243.10.4');
      setVpn(true);
      setTimeDiffMinutes('5');
    }
  };

  const handleSimulate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const now = new Date();
    const mins = parseFloat(timeDiffMinutes) || 5;
    const prevTime = new Date(now.getTime() - mins * 60 * 1000);

    // Build current login event
    const currentEvent: Partial<LoginEvent> = {
      username: username.trim(),
      timestamp: now.toISOString().replace('T', ' ').slice(0, 19),
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
      lat: parseFloat(latitude) || 0,
      lon: parseFloat(longitude) || 0,
      isp: isp.trim(),
      vpn: Boolean(vpn),
      ip_address: ipAddress.trim(),
      keystroke_timing: [120, 145, 110, 130, 95], // simulated biometrics
    };

    // Determine baseline/previous login
    let prevLogin: Partial<LoginEvent> | null = getLastUserLogin(currentEvent.username || '');

    if (activePreset === 'clean' || activePreset === 'vpn' || activePreset === 'impossible') {
      // Alice's trusted baseline in Kochi, Kerala
      prevLogin = {
        username: 'alice',
        timestamp: prevTime.toISOString().replace('T', ' ').slice(0, 19),
        latitude: 9.93,
        longitude: 76.26,
        lat: 9.93,
        lon: 76.26,
        isp: 'Asianet Broadband',
        vpn: false,
        ip_address: '103.28.246.12',
      };
    } else if (prevLogin) {
      // Modify timestamp for time elapsed
      prevLogin = {
        ...prevLogin,
        timestamp: prevTime.toISOString().replace('T', ' ').slice(0, 19),
      };
    }

    const evaluation = calculateRisk(prevLogin, currentEvent);
    setResult(evaluation);
    setEvaluatedContext({
      previous: prevLogin,
      current: currentEvent,
    });

    if (onSimulationRecorded) {
      onSimulationRecorded(evaluation);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl p-6 shadow-xl space-y-6">
      {/* Title & Presets Bar */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Threat Vector Simulation Engine
              </h3>
              <p className="text-xs text-slate-400">
                Zero-persistence sandboxed execution for impossible travel, ISP migration, and VPN anomaly detection
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-md">
            SANDBOX MODE
          </span>
        </div>

        {/* 3 Presets Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => {
              applyPreset('clean');
            }}
            className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden ${
              activePreset === 'clean'
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Preset 1: Clean Login
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                Score: 0 &bull; ALLOW
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Kerala &rarr; Kerala (1 hr, Asianet, No VPN)
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              applyPreset('vpn');
            }}
            className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden ${
              activePreset === 'vpn'
                ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Preset 2: Novel VPN
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">
                Score: 15 &bull; FLAG
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Kerala &rarr; Kerala (30 min, Asianet, VPN ON)
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              applyPreset('impossible');
            }}
            className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden ${
              activePreset === 'impossible'
                ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                Preset 3: Impossible Travel
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-300">
                Score: 100 &bull; BLOCK
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Kerala &rarr; NYC (5 min, Comcast, VPN ON)
            </p>
          </button>
        </div>
      </div>

      {/* Simulator Form */}
      <form onSubmit={handleSimulate} className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Username */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setActivePreset('custom');
              }}
              required
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => {
                setLatitude(e.target.value);
                setActivePreset('custom');
              }}
              required
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none transition-colors"
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => {
                setLongitude(e.target.value);
                setActivePreset('custom');
              }}
              required
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none transition-colors"
            />
          </div>

          {/* ISP */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              ISP Provider
            </label>
            <input
              type="text"
              value={isp}
              onChange={(e) => {
                setIsp(e.target.value);
                setActivePreset('custom');
              }}
              required
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* IP Address */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              IP Address
            </label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => {
                setIpAddress(e.target.value);
                setActivePreset('custom');
              }}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none transition-colors"
            />
          </div>

          {/* Time Delta (Minutes) */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Minutes Elapsed</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.1"
              value={timeDiffMinutes}
              onChange={(e) => {
                setTimeDiffMinutes(e.target.value);
                setActivePreset('custom');
              }}
              required
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none transition-colors"
            />
          </div>

          {/* VPN Toggle */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-lg hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={vpn}
                onChange={(e) => {
                  setVpn(e.target.checked);
                  setActivePreset('custom');
                }}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
              />
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-cyan-400" />
                VPN ON
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-400 font-mono">
            Evaluating velocity against threshold (&gt; 900 km/h) &bull; ISP match &bull; Novel VPN signature
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Run Threat Detection</span>
          </button>
        </div>
      </form>

      {/* Result Panel (STRICTLY FORMATTED - NO RAW JSON) */}
      {result && (
        <div
          className={`border rounded-xl p-5 transition-all duration-300 ${
            result.action === 'BLOCK'
              ? 'bg-red-950/30 border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.15)]'
              : result.action === 'FLAG'
              ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
              : 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_25px_rgba(34,197,94,0.15)]'
          }`}
        >
          {/* Header Verdict */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-xs font-mono font-extrabold px-3 py-1 rounded-md tracking-wider ${
                    result.action === 'BLOCK'
                      ? 'bg-red-500 text-slate-950 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      : result.action === 'FLAG'
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                  }`}
                >
                  VERDICT: {result.action}
                </span>
                <span className="text-sm font-bold text-white">
                  Risk Score: {result.risk_score} / 100
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {result.action === 'BLOCK'
                  ? 'Critical anomaly: Travel speed or multiple concurrent anomalies violate zero-trust boundaries.'
                  : result.action === 'FLAG'
                  ? 'Suspicious anomaly: Non-standard network parameters or novel VPN detected.'
                  : 'Clean verification: All geographic and network checks within nominal parameters.'}
              </p>
            </div>

            {/* Score Pill */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Score Range
              </span>
              <div className="font-mono text-xs text-slate-300">
                0-29 Allow | 30-59 Flag | 60-100 Block
              </div>
            </div>
          </div>

          {/* Risk Meter Bar */}
          <div className="py-4 border-b border-slate-800/80">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span>Threat Level Gauge</span>
              <span className="font-bold text-white">{result.risk_score}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  result.risk_score >= 60
                    ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                    : result.risk_score >= 15
                    ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                    : 'bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'
                }`}
                style={{ width: `${Math.max(6, Math.min(100, result.risk_score))}%` }}
              />
            </div>
          </div>

          {/* Formatted Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 border-b border-slate-800/80">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Geodetic Distance
              </span>
              <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                {result.distance_km.toLocaleString()} km
              </div>
              <div className="text-[10px] text-slate-500">Haversine formula</div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Calculated Travel Speed
              </span>
              <div
                className={`text-base font-bold font-mono mt-0.5 ${
                  result.speed_kmh > 900 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {Math.round(result.speed_kmh).toLocaleString()} km/h
              </div>
              <div className="text-[10px] text-slate-500">Threshold: 900 km/h</div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Keystroke Flight Dynamics
              </span>
              <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                {result.keystroke_deviation ? `${result.keystroke_deviation} ms` : 'Nominal'}
              </div>
              <div className="text-[10px] text-slate-500">Biometric interval</div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Enforcement Status
              </span>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {result.action === 'BLOCK' ? 'IMMEDIATE TERMINATION' : result.action === 'FLAG' ? 'STEP-UP 2FA / SOC' : 'AUTHORIZED'}
              </div>
              <div className="text-[10px] text-slate-500">Automated policy</div>
            </div>
          </div>

          {/* Formatted Reasons List */}
          <div className="pt-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span>Detection Reasons & Threat Findings</span>
            </h4>
            {result.reasons && result.reasons.length > 0 ? (
              <ul className="space-y-1.5">
                {result.reasons.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-200 bg-slate-900/70 border border-slate-800 px-3 py-2 rounded-lg"
                  >
                    <span className="text-red-400 font-bold shrink-0 mt-0.5">✕</span>
                    <span className="font-medium">{r}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/30 px-3 py-2 rounded-lg">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>No anomalous travel, ISP shift, or novel VPN patterns detected.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
