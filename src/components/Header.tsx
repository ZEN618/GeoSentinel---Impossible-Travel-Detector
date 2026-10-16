import React from 'react';
import { 
  Search, 
  Bell, 
  RefreshCw, 
  Download, 
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { SecurityStats } from '../types';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  onQuickSimulate: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
  stats: SecurityStats;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onRefresh,
  onExportCSV,
  onQuickSimulate,
  isRefreshing,
  lastUpdated,
  stats,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'map', label: 'Live Threat Map' },
    { id: 'simulator', label: 'Threat Simulator' },
    { id: 'audit', label: 'Audit Log', count: stats.total_flagged },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <header className="bg-[#121316] border-b border-[#22242a] flex flex-col shrink-0 select-none">
      {/* Top Telemetry & User Bar */}
      <div className="px-6 py-2.5 flex items-center justify-between border-b border-[#1c1d22] text-xs">
        {/* Metric Pills (Solid, no gradients, no glows) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18191d] border border-[#262830] text-[#9ca3af]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-medium">Active <strong className="text-white font-mono">{stats.active_users}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18191d] border border-[#262830] text-[#9ca3af]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] font-medium">Flagged <strong className="text-white font-mono">{stats.pending}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18191d] border border-[#262830] text-[#9ca3af]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-[11px] font-medium">Blocked <strong className="text-white font-mono">{stats.blocked}</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18191d] border border-[#262830] text-[#9ca3af]">
            <span className="text-[11px] font-medium">Total Logins <strong className="text-white font-mono">{stats.total_logins}</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18191d] border border-[#262830] text-[#9ca3af]">
            <span className="text-[11px] font-medium">Velocity Threshold: <strong className="text-white font-mono">900 km/h</strong></span>
          </div>
        </div>

        {/* Right Search, Notification & User Avatar */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative hidden lg:flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search identities, IPs, trips..."
              className="bg-[#18191d] border border-[#262830] focus:border-[#4b5563] rounded-lg pl-8.5 pr-8 py-1.5 text-xs text-white placeholder-[#6b7280] focus:outline-none w-56 transition-colors"
            />
            <span className="absolute right-2 text-[10px] bg-[#22242c] text-[#9ca3af] px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </span>
          </div>

          {/* Notifications */}
          <button 
            type="button"
            className="relative w-8 h-8 rounded-full bg-[#18191d] border border-[#262830] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            {stats.pending > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f97316] text-[#0f1012] font-bold text-[9px] flex items-center justify-center">
                {stats.pending}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1 border-l border-[#22242a]">
            <div className="w-7 h-7 rounded-full bg-[#272932] border border-[#373a46] flex items-center justify-center text-xs font-semibold text-[#fef08a]">
              GS
            </div>
            <div className="hidden xl:flex flex-col text-left leading-none">
              <span className="text-xs font-medium text-white">GeoSentinel Admin</span>
              <span className="text-[10px] text-[#6b7280] mt-0.5">SecOps Operations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Operations Title & Action Buttons */}
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {currentTab === 'overview' && 'Operations Dashboard'}
              {currentTab === 'map' && 'Live Threat Map & Vector Tracking'}
              {currentTab === 'simulator' && 'Threat Vector Simulator'}
              {currentTab === 'audit' && 'Security Audit Stream'}
              {currentTab === 'analytics' && 'Security Threat Analytics'}
            </h2>
          </div>
          <p className="text-xs text-[#6b7280] mt-0.5 flex items-center gap-2">
            <span>Real-time anomalous travel mitigation</span>
            <span>•</span>
            <span className="font-mono text-[#9ca3af]">Telemetry sync: {lastUpdated || 'active'}</span>
          </p>
        </div>

        {/* Sub-Actions on the right */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#18191d] hover:bg-[#202227] text-[#d1d5db] border border-[#262830] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#fef08a]' : 'text-[#9ca3af]'}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#18191d] hover:bg-[#202227] text-[#d1d5db] border border-[#262830] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#9ca3af]" />
            <span>Export CSV</span>
          </button>

          {/* Signature Pale Yellow / Butter Action Button */}
          <button
            type="button"
            onClick={onQuickSimulate}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#fef08a] hover:bg-[#fef9c3] text-[#121316] transition-transform active:scale-95 cursor-pointer shadow-none"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Quick Attack Test</span>
          </button>
        </div>
      </div>

      {/* Horizontal Sub-Navigation Bar with Smooth Sliding Active Indicator */}
      <div className="px-6 flex items-center gap-1 border-t border-[#1c1d22] overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                isActive ? 'text-white font-semibold' : 'text-[#8b8e98] hover:text-[#d1d5db]'
              }`}
            >
              {/* Smooth sliding active background pill */}
              {isActive && (
                <motion.div
                  layoutId="headerActiveTabPill"
                  className="absolute inset-0 bg-[#202228] border border-[#2c2f38] rounded-lg z-0"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              <span className="relative z-10">{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className="relative z-10 text-[10px] px-1.5 py-0.2 rounded-full bg-[#272932] text-[#fef08a] font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
