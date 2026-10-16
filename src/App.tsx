/**
 * GeoSentinel - AI-Based Impossible Travel Detector
 * Operations Control Center
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OperationsDashboard } from './components/OperationsDashboard';
import { SessionsTable } from './components/SessionsTable';
import { ThreatSimulator } from './components/ThreatSimulator';
import { LiveMap } from './components/LiveMap';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { LoginPortal } from './components/LoginPortal';
import { 
  loadSessions, 
  loadLogins, 
  computeStats, 
  updateSessionStatus, 
  executeLogin 
} from './services/storage';
import { SessionRecord, SecurityStats, DetectionResult } from './types';
import { CheckCircle2, AlertTriangle, XCircle, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'map', 'simulator', 'audit', 'analytics'].includes(hash)) {
        return hash;
      }
    }
    return 'overview';
  });

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    total_logins: 0,
    pending: 0,
    blocked: 0,
    allowed: 0,
    active_users: 0,
    total_flagged: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Toast dispatch
  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Synchronize telemetry state
  const syncData = useCallback((silent = false) => {
    setIsRefreshing(true);
    try {
      const sess = loadSessions();
      const st = computeStats();
      setSessions(sess);
      setStats(st);
      setLastUpdated(new Date().toLocaleTimeString());
      if (!silent) {
        showToast('Telemetry stream synchronized with database', 'success');
      }
    } catch (e) {
      console.error(e);
      if (!silent) {
        showToast('Error refreshing data', 'danger');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  // Initial load and 30-second interval auto-refresh
  useEffect(() => {
    syncData(true);
    const interval = setInterval(() => {
      syncData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [syncData]);

  // Change tab with URL hash update
  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  };

  // Allow or Block remediation action
  const handleTakeAction = (sessionId: number, action: 'ALLOW' | 'BLOCK') => {
    const success = updateSessionStatus(sessionId, action);
    if (success) {
      syncData(true);
      showToast(
        `Session #${sessionId} was marked as ${action}ED`,
        action === 'ALLOW' ? 'success' : 'danger'
      );
    } else {
      showToast('Failed to update session record', 'danger');
    }
  };

  // Quick simulate an impossible travel attack from the header
  const handleQuickSimulate = () => {
    const res = executeLogin({
      username: 'alice',
      latitude: 40.7128,
      longitude: -74.006,
      isp: 'Comcast Business',
      vpn: true,
      ip_address: '162.243.10.4',
    });
    syncData(true);
    showToast(`Attack Simulated: Impossible Travel (100% Risk - BLOCKED)`, 'danger');
    handleSelectTab('map');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (sessions.length === 0) {
      showToast('No sessions recorded to export', 'warning');
      return;
    }

    const headers = [
      'ID',
      'Username',
      'Timestamp',
      'Risk Score',
      'Action',
      'Status',
      'Speed km/h',
      'Distance km',
      'ISP',
      'VPN',
      'Reasons',
    ];

    const rows = sessions.map((s) => [
      s.id,
      `"${s.username}"`,
      `"${s.timestamp}"`,
      s.risk_score,
      s.action,
      s.status,
      s.speed_kmh,
      s.distance_km,
      `"${s.isp}"`,
      s.vpn ? 'YES' : 'NO',
      `"${(s.reasons || []).join('; ').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `geosentinel_audit_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Security audit CSV exported successfully', 'success');
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#0f1012] text-[#f3f4f6] font-sans">
      {/* Sleek Vertical Icon Rail */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenLoginModal={() => setShowLoginModal(true)}
      />

      {/* Main Operations Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header with pill metrics and tabs */}
        <Header
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          onRefresh={() => syncData(false)}
          onExportCSV={handleExportCSV}
          onQuickSimulate={handleQuickSimulate}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          stats={stats}
        />

        {/* Dynamic Animated Content Body */}
        <main className="p-5 md:p-6 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <OperationsDashboard
                  sessions={sessions}
                  stats={stats}
                  onTakeAction={handleTakeAction}
                  onNavigateToTab={handleSelectTab}
                />
              </motion.div>
            )}

            {currentTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <LiveMap 
                  sessions={sessions} 
                  onTakeAction={handleTakeAction}
                />
              </motion.div>
            )}

            {currentTab === 'simulator' && (
              <motion.div
                key="simulator"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <ThreatSimulator
                  onSimulationRecorded={() => {
                    syncData(true);
                  }}
                  onNavigateToMap={() => handleSelectTab('map')}
                />
              </motion.div>
            )}

            {currentTab === 'audit' && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <SessionsTable
                  sessions={sessions}
                  onTakeAction={handleTakeAction}
                />
              </motion.div>
            )}

            {currentTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <AnalyticsCharts sessions={sessions} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Interactive Login Portal Modal */}
      {showLoginModal && (
        <LoginPortal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(res: DetectionResult) => {
            syncData(true);
            showToast(
              `Authentication evaluated: ${res.action} (Risk ${res.risk_score})`,
              res.action === 'BLOCK' ? 'danger' : res.action === 'FLAG' ? 'warning' : 'success'
            );
          }}
        />
      )}

      {/* Clean Solid Toast Notifications (No glows) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#2b2d35] bg-[#18191c] text-xs font-medium shadow-2xl text-white transition-all"
          >
            {t.type === 'success' && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
            {t.type === 'warning' && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />}
            {t.type === 'danger' && <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />}
            {t.type === 'info' && <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />}
            <span className="leading-snug">{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
