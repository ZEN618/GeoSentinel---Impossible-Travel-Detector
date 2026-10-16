import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Globe2, 
  Wifi, 
  Lock,
  Check
} from 'lucide-react';
import { SessionRecord } from '../types';
import { motion } from 'motion/react';

interface SessionsTableProps {
  sessions: SessionRecord[];
  onTakeAction: (sessionId: number, action: 'ALLOW' | 'BLOCK') => void;
}

export const SessionsTable: React.FC<SessionsTableProps> = ({
  sessions,
  onTakeAction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ALLOWED' | 'BLOCKED'>('ALL');

  const filtered = sessions.filter((s) => {
    const matchesSearch =
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.isp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ip_address.includes(searchTerm);
    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  return (
    <div className="bg-[#18191c] border border-[#26272c] rounded-2xl overflow-hidden select-none">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-[#26272c] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="font-semibold text-white text-sm tracking-wide">
            Evaluated Login Events & Security Remediation Stream
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#22242c] text-[#9ca3af]">
            {filtered.length} Records
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search user, ISP, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1b1c20] border border-[#26272e] focus:border-[#4b5563] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#6b7280] focus:outline-none transition-colors w-44 md:w-56"
            />
          </div>

          {/* Status Filter with Smooth Animated Sliding Pill */}
          <div className="flex items-center bg-[#1b1c20] border border-[#26272e] rounded-xl p-0.5 text-xs">
            {(['ALL', 'PENDING', 'ALLOWED', 'BLOCKED'] as const).map((filter) => {
              const isSelected = statusFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`relative px-2.5 py-1 rounded-lg font-medium text-[11px] transition-colors cursor-pointer ${
                    isSelected ? 'text-white font-semibold' : 'text-[#6b7280] hover:text-[#d1d5db]'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="tableFilterPill"
                      className="absolute inset-0 bg-[#272932] border border-[#343744] rounded-lg -z-0"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{filter}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#141518] text-[#8b8e98] uppercase tracking-wider font-semibold text-[10px] border-b border-[#26272c]">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Location Delta</th>
              <th className="py-3 px-4">ISP / Network</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Reasons</th>
              <th className="py-3 px-4">Speed</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Remediation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#22242a]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-[#6b7280]">
                  No login sessions match the active filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const isAllow = s.action === 'ALLOW';
                const isFlag = s.action === 'FLAG';
                const isBlock = s.action === 'BLOCK';

                return (
                  <tr key={s.id} className="hover:bg-[#1d1f24] transition-colors">
                    {/* User */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{s.username}</div>
                      <div className="text-[10px] text-[#6b7280] font-mono mt-0.5">{s.ip_address}</div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-white">{s.distance_km.toFixed(1)} km</span>
                      <div className="text-[10px] text-[#6b7280]">
                        {s.lat !== undefined ? `${s.lat.toFixed(2)}, ${s.lon?.toFixed(2)}` : (s.latitude !== undefined ? `${s.latitude.toFixed(2)}, ${s.longitude?.toFixed(2)}` : '9.93, 76.26')}
                      </div>
                    </td>

                    {/* ISP & VPN */}
                    <td className="py-3.5 px-4">
                      <div className="text-[#d1d5db] font-medium">{s.isp}</div>
                      <div className="mt-0.5">
                        {s.vpn ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#281e13] text-[#fbbf24] border border-[#4d381c]">
                            <Lock className="w-2.5 h-2.5" /> VPN Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#6b7280]">Direct</span>
                        )}
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white w-6">{s.risk_score}</span>
                        <div className="w-16 h-1.5 bg-[#262830] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.risk_score >= 60 ? 'bg-[#ef4444]' : s.risk_score >= 30 ? 'bg-[#f59e0b]' : 'bg-[#22c55e]'
                            }`}
                            style={{ width: `${Math.max(8, s.risk_score)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] border ${
                          isBlock
                            ? 'bg-[#261719] text-[#f87171] border-[#4d1f23]'
                            : isFlag
                            ? 'bg-[#281e13] text-[#fbbf24] border-[#4d381c]'
                            : 'bg-[#15231a] text-[#4ade80] border-[#20402b]'
                        }`}
                      >
                        {s.action}
                      </span>
                    </td>

                    {/* Reasons */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {s.reasons && s.reasons.length > 0 ? (
                        <ul className="text-[11px] text-[#9ca3af] space-y-0.5 list-disc pl-3">
                          {s.reasons.slice(0, 2).map((r, i) => (
                            <li key={i} className="line-clamp-1">{r}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-[11px] text-[#4ade80]">Nominal velocity</span>
                      )}
                    </td>

                    {/* Speed */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className={s.speed_kmh > 900 ? 'text-[#f87171] font-bold' : 'text-white'}>
                        {Math.round(s.speed_kmh).toLocaleString()} km/h
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#8b8e98] whitespace-nowrap">
                      {s.timestamp}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 font-mono text-[10px] font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border ${
                          s.status === 'ALLOWED'
                            ? 'bg-[#15231a] text-[#4ade80] border-[#20402b]'
                            : s.status === 'BLOCKED'
                            ? 'bg-[#261719] text-[#f87171] border-[#4d1f23]'
                            : 'bg-[#202126] text-[#cbd5e1] border-[#2d303a]'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    {/* Remediation */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onTakeAction(s.id, 'ALLOW')}
                          disabled={s.status === 'ALLOWED'}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            s.status === 'ALLOWED'
                              ? 'bg-[#17181c] text-[#4b4e58] border-[#22242a] cursor-not-allowed'
                              : 'bg-[#15231a] hover:bg-[#1a3824] text-[#4ade80] border-[#20402b]'
                          }`}
                        >
                          ALLOW
                        </button>
                        <button
                          type="button"
                          onClick={() => onTakeAction(s.id, 'BLOCK')}
                          disabled={s.status === 'BLOCKED'}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            s.status === 'BLOCKED'
                              ? 'bg-[#17181c] text-[#4b4e58] border-[#22242a] cursor-not-allowed'
                              : 'bg-[#261719] hover:bg-[#3b191c] text-[#f87171] border-[#4d1f23]'
                          }`}
                        >
                          BLOCK
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
