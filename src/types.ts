export interface LoginEvent {
  id?: number;
  username: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  lat?: number;
  lon?: number;
  isp: string;
  vpn: boolean;
  ip_address?: string;
  keystroke_timing?: number[];
}

export interface SessionRecord {
  id: number;
  username: string;
  timestamp: string;
  risk_score: number;
  action: 'ALLOW' | 'FLAG' | 'BLOCK';
  status: 'PENDING' | 'ALLOWED' | 'BLOCKED';
  reasons: string[];
  speed_kmh: number;
  distance_km: number;
  ip_address: string;
  isp: string;
  vpn: boolean;
  lat?: number;
  lon?: number;
  latitude?: number;
  longitude?: number;
}

export interface DetectionResult {
  risk_score: number;
  speed_kmh: number;
  distance_km: number;
  reasons: string[];
  action: 'ALLOW' | 'FLAG' | 'BLOCK';
  keystroke_deviation: number | null;
  session_id?: number;
}

export interface SecurityStats {
  total_logins: number;
  pending: number;
  blocked: number;
  allowed: number;
  active_users: number;
  total_flagged: number;
}
