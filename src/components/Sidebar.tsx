import React from 'react';
import { 
  LayoutGrid, 
  Map, 
  SlidersHorizontal, 
  BarChart3, 
  Table2, 
  LogIn
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLoginModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenLoginModal,
}) => {
  const navItems = [
    { id: 'overview', label: 'Operations Overview', icon: LayoutGrid },
    { id: 'map', label: 'Live Threat Map & HUD', icon: Map },
    { id: 'simulator', label: 'Threat Simulator', icon: SlidersHorizontal },
    { id: 'audit', label: 'Audit Log Stream', icon: Table2 },
    { id: 'analytics', label: 'Security Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-18 bg-[#121316] border-r border-[#22242a] flex flex-col items-center py-5 justify-between shrink-0 select-none z-40">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-6">
        <button 
          type="button"
          onClick={() => onSelectTab('overview')}
          className="w-10 h-10 rounded-xl bg-[#fef08a] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
          title="GeoSentinel Threat Engine"
        >
          {/* Custom geometric cross icon matching reference */}
          <div className="w-5 h-5 relative flex items-center justify-center">
            <div className="absolute w-2 h-5 bg-[#18191c] rounded-sm" />
            <div className="absolute w-5 h-2 bg-[#18191c] rounded-sm" />
          </div>
        </button>

        {/* Main Navigation Icons with Smooth Sliding Active Pill */}
        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center relative transition-colors cursor-pointer ${
                    isActive ? 'text-[#121316]' : 'text-[#8b8e98] hover:text-white hover:bg-[#1a1b20]'
                  }`}
                  aria-label={item.label}
                >
                  {/* Smooth sliding active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="absolute inset-0 bg-white rounded-full z-0"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <Icon className="w-4 h-4 stroke-[2] relative z-10" />

                  {/* Right edge active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarRightNotch"
                      className="absolute -right-[15px] w-1 h-5 bg-[#fef08a] rounded-l z-20"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                </button>

                {/* Tooltip on hover */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                  <div className="bg-[#1f2026] text-xs text-white px-2.5 py-1.5 rounded-lg border border-[#2d2f38] shadow-lg whitespace-nowrap font-medium">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-3">
        {/* Test Login Portal Modal Trigger */}
        <div className="relative group">
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#8b8e98] hover:text-[#fef08a] hover:bg-[#1a1b20] transition-colors cursor-pointer"
            title="Launch Test Login Portal"
          >
            <LogIn className="w-4 h-4" />
          </button>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
            <div className="bg-[#1f2026] text-xs text-white px-2.5 py-1.5 rounded-lg border border-[#2d2f38] shadow-lg whitespace-nowrap font-medium">
              Test Login Portal
            </div>
          </div>
        </div>

        {/* Engine Status Indicator */}
        <div 
          className="w-9 h-9 rounded-full bg-[#18191c] border border-[#26272e] flex items-center justify-center"
          title="Telemetry Engine: Online"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>
    </aside>
  );
};
