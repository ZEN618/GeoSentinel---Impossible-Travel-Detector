import React from 'react';
import { 
  Activity, 
  Clock, 
  ShieldX, 
  ShieldCheck, 
  Users, 
  AlertTriangle 
} from 'lucide-react';
import { SecurityStats } from '../types';

interface StatCardsProps {
  stats: SecurityStats;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Total Logins',
      value: stats.total_logins,
      icon: Activity,
      color: 'text-cyan-400',
      border: 'hover:border-cyan-500/50',
      bgGlow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.12)]',
    },
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      color: 'text-slate-300',
      border: 'hover:border-slate-500/50',
      bgGlow: 'group-hover:shadow-[0_0_20px_rgba(148,163,184,0.12)]',
    },
    {
      label: 'Blocked Attacks',
      value: stats.blocked,
      icon: ShieldX,
      color: 'text-red-400',
      border: 'hover:border-red-500/50',
      bgGlow: 'group-hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    },
    {
      label: 'Allowed Clean',
      value: stats.allowed,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      border: 'hover:border-emerald-500/50',
      bgGlow: 'group-hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    },
    {
      label: 'Active Identities',
      value: stats.active_users,
      icon: Users,
      color: 'text-sky-400',
      border: 'hover:border-sky-500/50',
      bgGlow: 'group-hover:shadow-[0_0_20px_rgba(56,189,248,0.12)]',
    },
    {
      label: 'Total Flagged',
      value: stats.total_flagged,
      icon: AlertTriangle,
      color: 'text-amber-400',
      border: 'hover:border-amber-500/50',
      bgGlow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`group bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl p-4 transition-all duration-200 ${card.border} ${card.bgGlow}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-800/60 flex items-center justify-center">
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className={`text-2xl font-extrabold font-mono tracking-tight text-white ${card.color}`}>
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
