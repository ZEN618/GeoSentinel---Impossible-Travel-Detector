/**
 * GeoSentinel Detection Engine (TypeScript Client & Server Implementation)
 * Mirrors geosentinel/detector.py with exact Haversine distance and 3-step threat logic.
 */
import { DetectionResult, LoginEvent } from '../types';

/**
 * Calculates distance in km between two GPS coordinates using the Haversine formula.
 */
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0; // Earth's mean radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2.0) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2.0) ** 2;

  const clippedA = Math.min(1.0, Math.max(0.0, a));
  const c = 2.0 * Math.atan2(Math.sqrt(clippedA), Math.sqrt(1.0 - clippedA));

  return R * c;
}

/**
 * Parses timestamp string or number into Date.
 */
function parseTimestamp(ts: string | number | undefined): Date {
  if (!ts) return new Date();
  if (typeof ts === 'number') return new Date(ts);
  const parsed = new Date(ts);
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date();
}

/**
 * Evaluates risk between login1 (previous login) and login2 (current login).
 */
export function calculateRisk(
  login1: Partial<LoginEvent> | null | undefined,
  login2: Partial<LoginEvent>
): DetectionResult {
  // Handle case where user has no previous login history
  if (!login1) {
    return {
      risk_score: 0,
      speed_kmh: 0.0,
      distance_km: 0.0,
      reasons: ['No previous login history found'],
      action: 'ALLOW',
      keystroke_deviation: null,
    };
  }

  const lat1 = Number(login1.lat ?? login1.latitude ?? 0);
  const lon1 = Number(login1.lon ?? login1.longitude ?? 0);
  const lat2 = Number(login2.lat ?? login2.latitude ?? 0);
  const lon2 = Number(login2.lon ?? login2.longitude ?? 0);

  // Compute geodetic distance in km
  const distanceKm = haversine(lat1, lon1, lat2, lon2);

  // Time difference in hours
  const t1 = parseTimestamp(login1.timestamp);
  const t2 = parseTimestamp(login2.timestamp);
  let timeDiffSeconds = Math.abs((t2.getTime() - t1.getTime()) / 1000);
  if (timeDiffSeconds <= 0) {
    timeDiffSeconds = 1;
  }
  const timeDiffHours = timeDiffSeconds / 3600.0;

  // Travel speed in km/h
  let speedKmh = 0;
  if (distanceKm > 0.01) {
    speedKmh = distanceKm / timeDiffHours;
  }

  let riskScore = 0;
  const reasons: string[] = [];

  // CHECK 1 — Impossible Travel (> 900 km/h)
  if (speedKmh > 900) {
    riskScore += 60;
    reasons.push(`Impossible travel detected — speed ${Math.round(speedKmh)} km/h`);
  }

  // CHECK 2 — ISP Change
  const isp1 = (login1.isp || '').trim();
  const isp2 = (login2.isp || '').trim();
  if (isp1 && isp2 && isp1.toLowerCase() !== isp2.toLowerCase()) {
    riskScore += 25;
    reasons.push(`ISP changed from ${isp1} to ${isp2}`);
  }

  // CHECK 3 — Novel VPN
  const vpn1 = Boolean(login1.vpn);
  const vpn2 = Boolean(login2.vpn);
  if (vpn2 && !vpn1) {
    riskScore += 15;
    reasons.push('First time VPN usage detected');
  }

  // Cap at 100
  riskScore = Math.min(100, riskScore);

  // Determine Action
  let action: 'ALLOW' | 'FLAG' | 'BLOCK' = 'ALLOW';
  if (riskScore >= 60) {
    action = 'BLOCK';
  } else if (riskScore >= 15 || reasons.length > 0) {
    action = 'FLAG';
  } else {
    action = 'ALLOW';
  }

  // Keystroke deviation
  let keystrokeDeviation: number | null = null;
  if (login2.keystroke_timing && login2.keystroke_timing.length > 1) {
    const avg =
      login2.keystroke_timing.reduce((a, b) => a + b, 0) /
      login2.keystroke_timing.length;
    keystrokeDeviation = Math.round(avg * 10) / 10;
  }

  return {
    risk_score: riskScore,
    speed_kmh: Math.round(speedKmh * 10) / 10,
    distance_km: Math.round(distanceKm * 10) / 10,
    reasons,
    action,
    keystroke_deviation: keystrokeDeviation,
  };
}
