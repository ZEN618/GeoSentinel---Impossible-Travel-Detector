/**
 * GeoSentinel Persistent Storage & State Management
 */
import { LoginEvent, SessionRecord, SecurityStats, DetectionResult } from '../types';
import { calculateRisk } from './detector';

const LOGINS_KEY = 'geosentinel_logins_v1';
const SESSIONS_KEY = 'geosentinel_sessions_v1';

// Seed initial baseline data
function getInitialLogins(): LoginEvent[] {
  const now = new Date();
  return [
    {
      id: 1,
      username: 'alice',
      timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      latitude: 9.9312,
      longitude: 76.2673,
      lat: 9.9312,
      lon: 76.2673,
      isp: 'Asianet Broadband',
      vpn: false,
      ip_address: '103.28.246.12',
    },
    {
      id: 2,
      username: 'bob_security',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      latitude: 51.5074,
      longitude: -0.1278,
      lat: 51.5074,
      lon: -0.1278,
      isp: 'BT Broadband',
      vpn: false,
      ip_address: '81.149.120.45',
    },
    {
      id: 3,
      username: 'charlie_admin',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      latitude: 35.6762,
      longitude: 139.6503,
      lat: 35.6762,
      lon: 139.6503,
      isp: 'NTT Communications',
      vpn: false,
      ip_address: '118.238.10.22',
    },
    {
      id: 4,
      username: 'david_dev',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      latitude: 1.3521,
      longitude: 103.8198,
      lat: 1.3521,
      lon: 103.8198,
      isp: 'Singtel',
      vpn: false,
      ip_address: '119.74.20.15',
    },
  ];
}

function getInitialSessions(): SessionRecord[] {
  const now = new Date();
  const tNow = now.toISOString().replace('T', ' ').slice(0, 19);
  const tMinus1 = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

  return [
    {
      id: 101,
      username: 'charlie_admin',
      timestamp: tNow,
      risk_score: 100,
      action: 'BLOCK',
      status: 'PENDING',
      reasons: [
        'Impossible travel detected — speed 12450 km/h',
        'ISP changed from NTT Communications to DigitalOcean',
        'First time VPN usage detected',
      ],
      speed_kmh: 12450.0,
      distance_km: 9700.0,
      ip_address: '167.99.12.8',
      isp: 'DigitalOcean',
      vpn: true,
      lat: 40.7128,
      lon: -74.006,
    },
    {
      id: 102,
      username: 'bob_security',
      timestamp: tNow,
      risk_score: 40,
      action: 'FLAG',
      status: 'PENDING',
      reasons: [
        'ISP changed from BT Broadband to Virgin Media',
        'First time VPN usage detected',
      ],
      speed_kmh: 0.0,
      distance_km: 0.0,
      ip_address: '194.72.238.11',
      isp: 'Virgin Media',
      vpn: true,
      lat: 51.5074,
      lon: -0.1278,
    },
    {
      id: 103,
      username: 'david_dev',
      timestamp: tMinus1,
      risk_score: 0,
      action: 'ALLOW',
      status: 'ALLOWED',
      reasons: [],
      speed_kmh: 0.0,
      distance_km: 0.0,
      ip_address: '119.74.20.15',
      isp: 'Singtel',
      vpn: false,
      lat: 1.3521,
      lon: 103.8198,
    },
  ];
}

export function loadLogins(): LoginEvent[] {
  try {
    const raw = localStorage.getItem(LOGINS_KEY);
    if (!raw) {
      const initial = getInitialLogins();
      saveLogins(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialLogins();
  }
}

export function saveLogins(logins: LoginEvent[]) {
  try {
    localStorage.setItem(LOGINS_KEY, JSON.stringify(logins));
  } catch (e) {
    console.error('Storage save error', e);
  }
}

export function loadSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      const initial = getInitialSessions();
      saveSessions(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialSessions();
  }
}

export function saveSessions(sessions: SessionRecord[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Storage save error', e);
  }
}

export function getLastUserLogin(username: string): LoginEvent | null {
  const logins = loadLogins();
  const userLogins = logins.filter(
    (l) => l.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (userLogins.length === 0) return null;
  return userLogins[userLogins.length - 1];
}

export function executeLogin(event: Partial<LoginEvent>): DetectionResult & { session: SessionRecord } {
  const username = event.username || 'anonymous';
  const prevLogin = getLastUserLogin(username);

  const currentLogin: LoginEvent = {
    id: Date.now(),
    username,
    timestamp: event.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19),
    latitude: Number(event.latitude ?? event.lat ?? 9.9312),
    longitude: Number(event.longitude ?? event.lon ?? 76.2673),
    lat: Number(event.latitude ?? event.lat ?? 9.9312),
    lon: Number(event.longitude ?? event.lon ?? 76.2673),
    isp: event.isp || 'Unknown',
    vpn: Boolean(event.vpn),
    ip_address: event.ip_address || '127.0.0.1',
    keystroke_timing: event.keystroke_timing || [],
  };

  const detection = calculateRisk(prevLogin, currentLogin);

  // Store login event into history
  const allLogins = loadLogins();
  allLogins.push(currentLogin);
  saveLogins(allLogins);

  // Store into sessions
  const allSessions = loadSessions();
  const newSession: SessionRecord = {
    id: Date.now(),
    username,
    timestamp: currentLogin.timestamp,
    risk_score: detection.risk_score,
    action: detection.action,
    status: detection.action === 'ALLOW' ? 'ALLOWED' : 'PENDING',
    reasons: detection.reasons,
    speed_kmh: detection.speed_kmh,
    distance_km: detection.distance_km,
    ip_address: currentLogin.ip_address || '127.0.0.1',
    isp: currentLogin.isp,
    vpn: currentLogin.vpn,
    lat: currentLogin.latitude,
    lon: currentLogin.longitude,
  };

  allSessions.unshift(newSession);
  saveSessions(allSessions);

  return {
    ...detection,
    session_id: newSession.id,
    session: newSession,
  };
}

export function updateSessionStatus(sessionId: number, action: 'ALLOW' | 'BLOCK'): boolean {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return false;

  session.status = action === 'ALLOW' ? 'ALLOWED' : 'BLOCKED';
  session.action = action;
  saveSessions(sessions);
  return true;
}

export function computeStats(): SecurityStats {
  const logins = loadLogins();
  const sessions = loadSessions();

  const totalLogins = logins.length;
  const uniqueUsers = new Set(logins.map((l) => l.username.toLowerCase())).size;

  const pending = sessions.filter((s) => s.status === 'PENDING').length;
  const blocked = sessions.filter(
    (s) => s.status === 'BLOCKED' || (s.status === 'PENDING' && s.action === 'BLOCK')
  ).length;
  const allowed = sessions.filter(
    (s) => s.status === 'ALLOWED' || (s.status === 'PENDING' && s.action === 'ALLOW')
  ).length;
  const totalFlagged = sessions.filter((s) => s.action === 'FLAG' || s.action === 'BLOCK').length;

  return {
    total_logins: totalLogins,
    pending,
    blocked,
    allowed,
    active_users: uniqueUsers,
    total_flagged: totalFlagged,
  };
}
