import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  TrendingUp, 
  Clock, 
  Globe2, 
  ShieldCheck, 
  Zap, 
  Check,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { SessionRecord, SecurityStats } from '../types';
import { StatCards } from './StatCards';

interface OperationsDashboardProps {
  sessions: SessionRecord[];
  stats: SecurityStats;
  onTakeAction: (sessionId: number, action: 'ALLOW' | 'BLOCK') => void;
  onNavigateToTab: (tab: string) => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  sessions,
  stats,
  onTakeAction,
  onNavigateToTab,
}) => {
  const pendingActions = sessions.filter((s) => s.status === 'PENDING');
  const recentActivities = sessions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* 6 High-Contrast Solid Stat Cards (No glassmorphism, no glows) */}
      <StatCards stats={stats} />

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigateToTab('map')}
          className="bg-[#18191c] border border-[#26272c] hover:border-[#3b3d45] rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#222328] flex items-center justify-center text-emerald-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Live Geolocation Map
              </h4>
              <p className="text-xs text-[#8b8e98]">
                View spatial vectors & telemetry arcs
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6b7280] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </div>

        <div 
          onClick={() => onNavigateToTab('simulator')}
          className="bg-[#18191c] border border-[#26272c] hover:border-[#3b3d45] rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#222328] flex items-center justify-center text-[#fef08a]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#fef9c3] transition-colors">
                Threat Simulator
              </h4>
              <p className="text-xs text-[#8b8e98]">
                Test impossible travel & VPN vectors
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6b7280] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </div>

        <div 
          onClick={() => onNavigateToTab('audit')}
          className="bg-[#18191c] border border-[#26272c] hover:border-[#3b3d45] rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#222328] flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                Full Security Audit
              </h4>
              <p className="text-xs text-[#8b8e98]">
                Filter, verify, and export sessions
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6b7280] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* Main Grid: Priority Action Queue & Threat Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Priority Action Queue */}
        <div className="lg:col-span-2 bg-[#18191c] border border-[#26272c] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#26272e] mb-4">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white">
                  Alert Priority Queue & Active Triage
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold text-[#8b8e98] bg-[#222328] px-2.5 py-0.5 rounded-full">
                {pendingActions.length} Pending Actions
              </span>
            </div>

            {pendingActions.length === 0 ? (
              <div className="py-12 text-center text-[#8b8e98] text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <span>Zero pending alerts. All session streams nominal.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingActions.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-[#26272e] bg-[#1d1e22] hover:bg-[#222328] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">
                          {s.username}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            s.action === 'BLOCK'
                              ? 'bg-red-950 text-red-400 border border-red-900/60'
                              : 'bg-amber-950 text-amber-400 border border-amber-900/60'
                          }`}
                        >
                          {s.action}
                        </span>
                        <span className="text-xs text-[#8b8e98] font-mono">
                          Risk: <strong className="text-white">{s.risk_score}</strong>/100
                        </span>
                      </div>

                      <div className="text-xs text-[#9ca3af]">
                        {s.reasons && s.reasons.length > 0
                          ? s.reasons[0]
                          : `High velocity anomaly: ${Math.round(s.speed_kmh)} km/h`}
                      </div>

                      <div className="text-[10px] text-[#6b7280] font-mono flex items-center gap-3">
                        <span>ISP: {s.isp}</span>
                        <span>IP: {s.ip_address}</span>
                        <span>VPN: {s.vpn ? 'Yes' : 'No'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onTakeAction(s.id, 'ALLOW')}
                        className="px-3 py-1.5 rounded-lg bg-[#27282e] hover:bg-emerald-950/70 hover:text-emerald-300 text-xs font-semibold text-white transition-colors"
                      >
                        Allow
                      </button>
                      <button
                        onClick={() => onTakeAction(s.id, 'BLOCK')}
                        className="px-3 py-1.5 rounded-lg bg-[#ef4444] hover:bg-red-600 text-xs font-semibold text-white transition-colors"
                      >
                        Block
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#26272e] flex items-center justify-between text-xs text-[#8b8e98] mt-4">
            <span>Automated behavioral telemetry checks every 500ms</span>
            <button
              onClick={() => onNavigateToTab('audit')}
              className="text-[#fef08a] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View all audit logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Threat Velocity Trend & Distribution */}
        <div className="bg-[#18191c] border border-[#26272c] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#26272e] mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#fef08a]" />
                <h3 className="text-sm font-bold text-white">
                  Threat Velocity Trend
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8b8e98]">Last 24h</span>
            </div>

            {/* Solid Latency Sparkline Graph (Solid Stroke, No Gradients, No AI Glow) */}
            <div className="bg-[#151619] border border-[#232429] rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-[#8b8e98]">Geodetic Speed Delta</span>
                <span className="font-mono text-emerald-400 font-bold">12.4k km/h peak</span>
              </div>

              {/* Clean solid SVG curve */}
              <svg className="w-full h-24 overflow-visible" viewBox="0 0 300 80">
                <path
                  d="M0,60 Q50,65 100,50 T200,30 T300,10"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="0" cy="60" r="3" fill="#22c55e" />
                <circle cx="100" cy="50" r="3" fill="#22c55e" />
                <circle cx="200" cy="30" r="3" fill="#f59e0b" />
                <circle cx="300" cy="10" r="4" fill="#ef4444" />
              </svg>

              <div className="flex justify-between text-[10px] font-mono text-[#6b7280] mt-2">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>Now</span>
              </div>
            </div>

            {/* Quick Policy Rule Status */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#202126] border border-[#27282f]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-white">Airliner Speed (&gt;900 km/h)</span>
                </div>
                <span className="font-mono font-bold text-red-400">+60 Risk</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#202126] border border-[#27282f]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-white">Carrier ISP Divergence</span>
                </div>
                <span className="font-mono font-bold text-amber-400">+25 Risk</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#202126] border border-[#27282f]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-white">Novel VPN Usage</span>
                </div>
                <span className="font-mono font-bold text-amber-400">+15 Risk</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#26272e] text-center">
            <span className="text-[11px] text-[#6b7280]">
              Zero-Trust continuous evaluation algorithm v2.4
            </span>
          </div>
        </div>
      </div>

      {/* Recent Authentication Activity Table */}
      <div className="bg-[#18191c] border border-[#26272c] rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#26272e] mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#fef08a]" />
            <h3 className="text-sm font-bold text-white">
              Recent Authentication Activity
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('audit')}
            className="text-xs text-[#8b8e98] hover:text-white transition-colors"
          >
            View all logs &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#8b8e98] uppercase font-mono text-[10px] tracking-wider border-b border-[#26272e]">
                <th className="pb-2.5">User</th>
                <th className="pb-2.5">Network / ISP</th>
                <th className="pb-2.5">IP Address</th>
                <th className="pb-2.5">Risk Score</th>
                <th className="pb-2.5">Calculated Speed</th>
                <th className="pb-2.5">Action</th>
                <th className="pb-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26272e]">
              {recentActivities.map((s) => (
                <tr key={s.id} className="hover:bg-[#202126] transition-colors">
                  <td className="py-2.5 font-bold font-mono text-white">
                    {s.username}
                  </td>
                  <td className="py-2.5 text-[#cbd5e1]">{s.isp}</td>
                  <td className="py-2.5 font-mono text-[#8b8e98]">{s.ip_address}</td>
                  <td className="py-2.5">
                    <span
                      className={`font-mono font-bold ${
                        s.risk_score >= 60
                          ? 'text-red-400'
                          : s.risk_score >= 15
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {s.risk_score}/100
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-[#cbd5e1]">
                    {s.speed_kmh > 0 ? `${Math.round(s.speed_kmh).toLocaleString()} km/h` : '0 km/h'}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        s.action === 'BLOCK'
                          ? 'bg-red-950 text-red-400'
                          : s.action === 'FLAG'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-emerald-950 text-emerald-400'
                      }`}
                    >
                      {s.action}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-[#6b7280]">
                    {s.timestamp.slice(11, 19) || s.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
