import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SessionRecord } from '../types';
import { 
  Globe, 
  Navigation, 
  Gauge, 
  ShieldAlert, 
  Compass, 
  MapPin, 
  Zap, 
  X,
  Layers,
  ChevronRight,
  Sliders,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveMapProps {
  sessions: SessionRecord[];
  onTakeAction?: (sessionId: number, action: 'ALLOW' | 'BLOCK') => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({ sessions, onTakeAction }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const linesLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Selected session for the floating Speedometer HUD Card (defaults to the most critical or recent session)
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(() => {
    return sessions.find((s) => s.action === 'BLOCK') || sessions[0] || null;
  });

  const [activeBaseMap, setActiveBaseMap] = useState<'arcgis-dark' | 'satellite' | 'osm-dark'>('arcgis-dark');
  const [showFlightVectors, setShowFlightVectors] = useState(true);

  // Switch Base Tiles
  const switchBaseMap = (type: 'arcgis-dark' | 'satellite' | 'osm-dark') => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (baseTileLayerRef.current) map.removeLayer(baseTileLayerRef.current);
    if (labelTileLayerRef.current) map.removeLayer(labelTileLayerRef.current);

    if (type === 'arcgis-dark') {
      baseTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { attribution: '&copy; Esri, DeLorme, NAVTEQ', maxZoom: 16 }
      ).addTo(map);

      labelTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16, opacity: 0.8 }
      ).addTo(map);
    } else if (type === 'satellite') {
      baseTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '&copy; Esri, Maxar', maxZoom: 18 }
      ).addTo(map);
      labelTileLayerRef.current = null;
    } else {
      baseTileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { attribution: '&copy; OSM', className: 'osm-dark-tiles', maxZoom: 19 }
      ).addTo(map);
      labelTileLayerRef.current = null;
    }

    setActiveBaseMap(type);
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25, 20],
        zoom: 2,
        minZoom: 2,
        maxZoom: 16,
        zoomControl: false, // Custom placed zoom or default
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean ArcGIS Dark Gray
      baseTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { attribution: '&copy; Esri', maxZoom: 16 }
      ).addTo(map);

      labelTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16, opacity: 0.85 }
      ).addTo(map);

      markersLayerGroupRef.current = L.layerGroup().addTo(map);
      linesLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    const linesGroup = linesLayerGroupRef.current;

    if (markersGroup) markersGroup.clearLayers();
    if (linesGroup) linesGroup.clearLayers();

    const getCoords = (session: SessionRecord): [number, number] => {
      if (session.lat && session.lon) return [session.lat, session.lon];
      if (session.speed_kmh > 1000) return [40.7128, -74.006]; // NYC
      if (session.isp.toLowerCase().includes('bt')) return [51.5074, -0.1278]; // London
      if (session.isp.toLowerCase().includes('ntt')) return [35.6762, 139.6503]; // Tokyo
      if (session.isp.toLowerCase().includes('singtel')) return [1.3521, 103.8198]; // Singapore
      return [9.9312, 76.2673]; // Kochi
    };

    const keralaCoord: [number, number] = [9.9312, 76.2673];

    sessions.forEach((s) => {
      const [lat, lon] = getCoords(s);

      let markerColor = '#22c55e';
      if (s.action === 'BLOCK') markerColor = '#ef4444';
      else if (s.action === 'FLAG') markerColor = '#f59e0b';

      // Connect flight vector line for impossible travel
      if (showFlightVectors && s.speed_kmh > 900 && linesGroup) {
        L.polyline([keralaCoord, [lat, lon]], {
          color: '#ef4444',
          weight: 2,
          opacity: 0.85,
          dashArray: '5, 8',
        }).addTo(linesGroup);
      }

      if (markersGroup) {
        // Outer pulsing ring for critical alerts
        if (s.action === 'BLOCK') {
          L.circleMarker([lat, lon], {
            radius: 14,
            fillColor: markerColor,
            color: markerColor,
            weight: 1,
            opacity: 0.4,
            fillOpacity: 0.1,
          }).addTo(markersGroup);
        }

        const marker = L.circleMarker([lat, lon], {
          radius: s.action === 'BLOCK' ? 9 : 7,
          fillColor: markerColor,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95,
        }).addTo(markersGroup);

        marker.on('click', () => {
          setSelectedSession(s);
          map.flyTo([lat, lon], Math.max(map.getZoom(), 4), { duration: 1.2 });
        });
      }
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [sessions, showFlightVectors]);

  // Compute speed gauge arc rotation
  const speed = selectedSession ? selectedSession.speed_kmh : 0;
  // Cap visual speed gauge percentage between 0 and 100
  const speedPercent = Math.min(100, Math.max(0, (speed / 1000) * 100));
  const riskPercent = selectedSession ? selectedSession.risk_score : 0;

  return (
    <div className="relative w-full h-[640px] rounded-2xl overflow-hidden border border-[#26272c] bg-[#121316]">
      {/* MAP VIEWPORT */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* TOP CONTROLS OVERLAY (Matching Video) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-[#18191cf0] border border-[#2b2d35] rounded-xl p-1 flex items-center gap-1 shadow-lg">
          <button
            onClick={() => switchBaseMap('arcgis-dark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeBaseMap === 'arcgis-dark' ? 'bg-[#272932] text-white font-bold' : 'text-[#8b8e98] hover:text-white'
            }`}
          >
            Dark Vector
          </button>
          <button
            onClick={() => switchBaseMap('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeBaseMap === 'satellite' ? 'bg-[#272932] text-white font-bold' : 'text-[#8b8e98] hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => switchBaseMap('osm-dark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeBaseMap === 'osm-dark' ? 'bg-[#272932] text-white font-bold' : 'text-[#8b8e98] hover:text-white'
            }`}
          >
            OSM
          </button>
        </div>

        <button
          onClick={() => setShowFlightVectors(!showFlightVectors)}
          className={`px-3 py-2 rounded-xl text-xs font-medium border shadow-lg transition-colors flex items-center gap-1.5 ${
            showFlightVectors
              ? 'bg-[#18191cf0] border-[#ef4444]/60 text-red-400 font-bold'
              : 'bg-[#18191cf0] border-[#2b2d35] text-[#8b8e98] hover:text-white'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Trajectories</span>
        </button>
      </div>

      {/* COMPASS DIAL (Top-Right of Map matching the video!) */}
      <div className="absolute top-4 right-4 z-20 bg-[#18191ce6] border border-[#2b2d35] w-24 h-24 rounded-full flex items-center justify-center shadow-xl select-none pointer-events-none">
        <div className="relative w-20 h-20 rounded-full border border-[#32343e] flex items-center justify-center">
          {/* Compass labels */}
          <span className="absolute top-1 text-[9px] font-bold text-[#818cf8] font-mono">N</span>
          <span className="absolute right-1 text-[9px] font-bold text-[#6b7280] font-mono">E</span>
          <span className="absolute bottom-1 text-[9px] font-bold text-[#6b7280] font-mono">S</span>
          <span className="absolute left-1 text-[9px] font-bold text-[#6b7280] font-mono">W</span>

          {/* Center compass readout */}
          <div className="text-center">
            <span className="text-xs font-bold font-mono text-white block leading-none">NW</span>
            <span className="text-[9px] font-mono text-[#818cf8] block mt-0.5">312°</span>
          </div>

          {/* Compass needle */}
          <div className="absolute w-full h-full flex items-center justify-center transform -rotate-45">
            <div className="w-0.5 h-14 bg-[#ef4444] rounded-full" />
          </div>
        </div>
      </div>

      {/* FLOATING SPEEDOMETER TELEMETRY HUD CARD (Matching Video Left Overlay!) */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-4 bottom-4 z-20 w-[380px] bg-[#18191cf2] border border-[#2b2d35] rounded-2xl p-4 shadow-2xl backdrop-blur-none text-xs"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#26272e]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white font-mono">
                    {selectedSession.username.toUpperCase()}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      selectedSession.action === 'BLOCK'
                        ? 'bg-red-950 text-red-400'
                        : selectedSession.action === 'FLAG'
                        ? 'bg-amber-950 text-amber-400'
                        : 'bg-emerald-950 text-emerald-400'
                    }`}
                  >
                    • {selectedSession.action}
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] font-mono mt-0.5">
                  IP: {selectedSession.ip_address} &bull; ISP: {selectedSession.isp}
                </div>
              </div>

              <button
                onClick={() => setSelectedSession(null)}
                className="w-6 h-6 rounded-lg bg-[#23242a] hover:bg-[#2c2e36] text-[#8b8e98] hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Route & Distance Delta Line */}
            <div className="py-2.5 flex items-center justify-between text-[11px] font-mono border-b border-[#26272e] text-[#9ca3af]">
              <div>
                <span className="text-white font-semibold">KERALA, IN</span> &rarr;{' '}
                <span className="text-white font-semibold">
                  {selectedSession.lat ? selectedSession.lat.toFixed(1) : '40.7'},{' '}
                  {selectedSession.lon ? selectedSession.lon.toFixed(1) : '-74.0'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#fef08a] font-bold">
                  {selectedSession.distance_km > 0 ? `${selectedSession.distance_km.toFixed(1)} km` : 'Local / 0 km'}
                </span>
              </div>
            </div>

            {/* DUAL GAUGES (Speedometer & Risk Gauge matching the video!) */}
            <div className="grid grid-cols-2 gap-3 py-3 border-b border-[#26272e]">
              {/* 1. Speedometer Dial */}
              <div className="bg-[#202126] border border-[#2b2d35] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-[#8b8e98] uppercase font-semibold tracking-wider">
                  Velocity
                </span>
                <div className="relative w-20 h-20 my-1 flex items-center justify-center">
                  {/* Gauge Arc SVG */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#2b2d35]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={selectedSession.speed_kmh > 900 ? 'text-red-500' : 'text-emerald-400'}
                      strokeDasharray={`${Math.min(100, Math.max(8, speedPercent))}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center leading-none">
                    <span className="font-extrabold font-mono text-xs text-white block">
                      {Math.round(selectedSession.speed_kmh).toLocaleString()}
                    </span>
                    <span className="text-[8px] font-mono text-[#8b8e98]">km/h</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#8b8e98]">
                  {selectedSession.speed_kmh > 900 ? 'Airliner Breach' : 'Nominal'}
                </span>
              </div>

              {/* 2. Threat Risk Gauge */}
              <div className="bg-[#202126] border border-[#2b2d35] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-[#8b8e98] uppercase font-semibold tracking-wider">
                  Risk Score
                </span>
                <div className="relative w-20 h-20 my-1 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#2b2d35]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={
                        selectedSession.risk_score >= 60
                          ? 'text-red-500'
                          : selectedSession.risk_score >= 15
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                      strokeDasharray={`${Math.min(100, Math.max(5, riskPercent))}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center leading-none">
                    <span className="font-extrabold font-mono text-base text-white block">
                      {selectedSession.risk_score}
                    </span>
                    <span className="text-[8px] font-mono text-[#8b8e98]">/ 100</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#8b8e98]">
                  {selectedSession.vpn ? 'VPN Active' : 'Direct ISP'}
                </span>
              </div>
            </div>

            {/* Bottom Required Action Banner (Matching Video!) */}
            <div className="mt-2.5 p-2 rounded-xl bg-[#23242b] border border-[#2e303b] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-[#f3f4f6]">
                <ShieldAlert className="w-3.5 h-3.5 text-[#fef08a] shrink-0" />
                <span className="truncate">
                  {selectedSession.action === 'BLOCK'
                    ? 'Required: Terminate Session (Zero-trust breach)'
                    : selectedSession.action === 'FLAG'
                    ? 'Required: Step-Up 2FA Challenge'
                    : 'Verified Safe Identity Stream'}
                </span>
              </div>

              {/* Remediation button */}
              {onTakeAction && selectedSession.status === 'PENDING' && (
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => onTakeAction(selectedSession.id, 'ALLOW')}
                    className="px-2 py-1 rounded bg-[#2c2e36] hover:bg-emerald-900/60 hover:text-emerald-300 text-xs font-semibold text-white transition-colors"
                  >
                    Allow
                  </button>
                  <button
                    onClick={() => onTakeAction(selectedSession.id, 'BLOCK')}
                    className="px-2 py-1 rounded bg-[#ef4444] hover:bg-red-600 text-xs font-semibold text-white transition-colors"
                  >
                    Block
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
