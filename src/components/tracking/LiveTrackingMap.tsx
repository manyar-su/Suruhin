import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin, Navigation, Compass, AlertTriangle, ShieldCheck, Wifi, RefreshCw } from 'lucide-react';
import { calculateDistance, formatDistance } from '../../lib/maps/distance';
import { getRoute, LatLng } from '../../lib/maps/routing';
import { calculateETA, formatETA } from '../../lib/maps/eta';
import { Booking, LiveLocation } from '../../types';
import { updateLiveLocation } from '../../data/mockExtensionData';

interface LiveTrackingMapProps {
  booking: Booking;
  role: 'customer' | 'talent' | 'admin';
  talentLoc: { latitude: number; longitude: number } | null;
  onTalentLocUpdate?: (lat: number, lon: number) => void;
  gpsStatus?: 'connected' | 'searching' | 'error';
}

export function LiveTrackingMap({
  booking,
  role,
  talentLoc,
  onTalentLocUpdate,
  gpsStatus = 'connected'
}: LiveTrackingMapProps) {
  // Map dimensions and container ref
  const [zoomLevel, setZoomLevel] = useState(14);
  const [isCentered, setIsCentered] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default coordinate offsets for rendering
  const meetingLat = booking.meetingLatitude || -7.3305;
  const meetingLon = booking.meetingLongitude || 108.2206;

  // Customer location (static, usually close to meeting point)
  const customerLat = meetingLat + 0.0008;
  const customerLon = meetingLon - 0.0005;

  // Current talent coordinates (fall back if not provided)
  const currentTalentLat = talentLoc?.latitude ?? (meetingLat - 0.015);
  const currentTalentLon = talentLoc?.longitude ?? (meetingLon - 0.012);

  // Generate simulated route points
  const routePoints = useMemo(() => {
    return getRoute(currentTalentLat, currentTalentLon, meetingLat, meetingLon, 25);
  }, [currentTalentLat, currentTalentLon, meetingLat, meetingLon]);

  // Calculate distance & ETA
  const distance = useMemo(() => {
    return calculateDistance(currentTalentLat, currentTalentLon, meetingLat, meetingLon);
  }, [currentTalentLat, currentTalentLon, meetingLat, meetingLon]);

  const etaMinutes = useMemo(() => {
    return calculateETA(distance);
  }, [distance]);

  // Map 2D coordinates projection helper
  // We project the relative Lat/Lon offsets into SVG pixels centered around the meeting point
  const projectCoords = (lat: number, lon: number) => {
    const scale = 22000 * (zoomLevel / 14); // pixels per degree
    const cx = 180; // center X
    const cy = 150; // center Y

    // Latitude goes up, Y goes down in SVG
    const x = cx + (lon - meetingLon) * scale;
    const y = cy - (lat - meetingLat) * scale;
    return { x, y };
  };

  const meetingPos = projectCoords(meetingLat, meetingLon);
  const customerPos = projectCoords(customerLat, customerLon);
  const talentPos = projectCoords(currentTalentLat, currentTalentLon);

  // Render SVG static map details (roads, background grids)
  // Let's draw some simulated road vectors centered around Tasikmalaya
  const roads = useMemo(() => {
    const list = [];
    const seed = 42;
    // Generate a beautiful grid of city streets
    for (let i = -4; i <= 4; i++) {
      // Horizontal streets
      const latOffset = i * 0.004;
      list.push({
        d: `M -100,${150 - latOffset * 22000} L 500,${150 - latOffset * 22000}`,
        color: '#f1f5f9',
        width: 4
      });
      // Vertical streets
      const lonOffset = i * 0.005;
      list.push({
        d: `M ${180 + lonOffset * 22000},-100 L ${180 + lonOffset * 22000},500`,
        color: '#f1f5f9',
        width: 4
      });
    }
    // Add primary highway passing diagonally
    list.push({
      d: 'M -100,-100 L 500,500',
      color: '#e2e8f0',
      width: 7
    });
    return list;
  }, []);

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] bg-[#E8F0FE] rounded-3xl overflow-hidden border border-slate-100 shadow-inner select-none flex flex-col justify-end">
      
      {/* Interactive Map Visual Stage (SVG Canvas) */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full">
        <svg className="w-full h-full" viewBox="0 0 360 300" preserveAspectRatio="xMidYMid slice">
          
          {/* Background grid representing green parks & water features */}
          <rect width="100%" height="100%" fill="#eaf2e8" />
          
          {/* Simulated Rivers or Lakes */}
          <path d="M -50,220 C 100,210 180,260 220,290 C 250,310 320,330 400,320" fill="none" stroke="#A5C9EB" strokeWidth="24" strokeLinecap="round" opacity="0.6" />
          
          {/* Central Park Area */}
          <circle cx={meetingPos.x - 20} cy={meetingPos.y + 10} r="45" fill="#C5E1A5" opacity="0.7" />

          {/* City Grid Roads */}
          {roads.map((road, idx) => (
            <path key={idx} d={road.d} fill="none" stroke={road.color} strokeWidth={road.width} />
          ))}

          {/* Polyline Route Path representing the journey */}
          {booking.status === 'TALENT_ON_THE_WAY' || booking.status === 'TALENT_NEARBY' ? (
            <>
              {/* Route Glow Shadow */}
              <path
                d={routePoints.map((pt, idx) => {
                  const p = projectCoords(pt.latitude, pt.longitude);
                  return `${idx === 0 ? 'M' : 'L'} ${p.x},${p.y}`;
                }).join(' ')}
                fill="none"
                stroke="#FF6500"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.15"
              />
              {/* Actual Polyline */}
              <path
                d={routePoints.map((pt, idx) => {
                  const p = projectCoords(pt.latitude, pt.longitude);
                  return `${idx === 0 ? 'M' : 'L'} ${p.x},${p.y}`;
                }).join(' ')}
                fill="none"
                stroke="#FF6500"
                strokeWidth="3.5"
                strokeDasharray="4,3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-dash"
              />
            </>
          ) : null}

          {/* 1. CUSTOMER LOCATION MARKER (Orange Circle pulse, hidden from public before paid) */}
          {booking.status !== 'WAITING_PAYMENT' && (
            <g className="cursor-pointer">
              <circle cx={customerPos.x} cy={customerPos.y} r="14" fill="#FF6500" fillOpacity="0.1" className="animate-ping" style={{ animationDuration: '3s' }} />
              <circle cx={customerPos.x} cy={customerPos.y} r="6" fill="#FF6500" stroke="#white" strokeWidth="1.5" />
            </g>
          )}

          {/* 2. MEETING POINT MARKER (White circle with orange outline and map pin icon) */}
          <g className="cursor-pointer">
            {/* Pulsing ring */}
            <circle cx={meetingPos.x} cy={meetingPos.y} r="18" fill="none" stroke="#FF6500" strokeWidth="1.5" strokeDasharray="3,2" className="animate-spin" style={{ animationDuration: '20s' }} />
            
            {/* Outer container */}
            <circle cx={meetingPos.x} cy={meetingPos.y} r="9" fill="#FFFFFF" stroke="#FF6500" strokeWidth="2" shadow-md="true" />
            <circle cx={meetingPos.x} cy={meetingPos.y} r="4" fill="#FF6500" />
            
            {/* Pin graphic floating above */}
            <g transform={`translate(${meetingPos.x - 7}, ${meetingPos.y - 20})`}>
              <path d="M 7,0 C 3,0 0,3 0,7 C 0,12 7,17 7,17 C 7,17 14,12 14,7 C 14,3 11,0 7,0 Z" fill="#FF6500" stroke="#FFFFFF" strokeWidth="1" />
              <circle cx="7" cy="6" r="2.5" fill="#FFFFFF" />
            </g>
          </g>

          {/* 3. TALENT LOCATION MARKER (Navy Blue circle with compass/car indicator) */}
          {booking.status === 'TALENT_ON_THE_WAY' || booking.status === 'TALENT_NEARBY' || booking.status === 'TALENT_ARRIVED' ? (
            <g className="cursor-pointer">
              {/* Navy blue tracking pulse */}
              <circle cx={talentPos.x} cy={talentPos.y} r="20" fill="#082B5C" fillOpacity="0.1" className="animate-ping" style={{ animationDuration: '2s' }} />
              
              {/* Outer circle ring */}
              <circle cx={talentPos.x} cy={talentPos.y} r="9" fill="#082B5C" stroke="#FFFFFF" strokeWidth="2.5" className="shadow-lg" />
              
              {/* Direction compass arrow inside */}
              <polygon points="-3.5,3 0,-4.5 3.5,3 0,1" fill="#FFFFFF" transform={`translate(${talentPos.x}, ${talentPos.y}) rotate(45)`} />
            </g>
          ) : null}

        </svg>
      </div>

      {/* FLOATING TOP BAR: GPS Status Indicator and Last update */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-100 pointer-events-auto">
          {gpsStatus === 'connected' ? (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-extrabold text-[#082B5C] uppercase tracking-wider flex items-center gap-1">
                GPS AKTIF • <Wifi size={10} className="text-emerald-500" /> 100%
              </span>
            </div>
          ) : gpsStatus === 'searching' ? (
            <div className="flex items-center gap-1.5">
              <RefreshCw size={12} className="text-amber-500 animate-spin" />
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">
                MENCARI SINYAL...
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-red-500 animate-bounce" />
              <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                GPS BERMASALAH
              </span>
            </div>
          )}
        </div>

        <div className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-100 text-[10px] font-bold text-gray-500 pointer-events-auto flex items-center gap-1">
          ⏱ Terakhir Diperbarui: <span className="font-extrabold text-[#082B5C]">Baru saja</span>
        </div>
      </div>

      {/* FLOATING ACTION OVERLAY: Quick recener map controls */}
      <div className="absolute right-4 bottom-14 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => {
            setZoomLevel(prev => Math.min(18, prev + 1));
          }}
          className="w-9 h-9 bg-white hover:bg-slate-50 text-[#082B5C] font-extrabold rounded-xl shadow-md flex items-center justify-center border border-slate-100 cursor-pointer text-sm transition-all active:scale-95"
          title="Zoom In"
        >
          ＋
        </button>
        <button
          onClick={() => {
            setZoomLevel(prev => Math.max(10, prev - 1));
          }}
          className="w-9 h-9 bg-white hover:bg-slate-50 text-[#082B5C] font-extrabold rounded-xl shadow-md flex items-center justify-center border border-slate-100 cursor-pointer text-sm transition-all active:scale-95"
          title="Zoom Out"
        >
          －
        </button>
        <button
          onClick={() => {
            setZoomLevel(14);
            setIsCentered(true);
          }}
          className={`w-9 h-9 rounded-xl shadow-md flex items-center justify-center border transition-all cursor-pointer active:scale-95 ${
            isCentered 
              ? 'bg-[#FF6500] border-[#FF6500] text-white' 
              : 'bg-white border-slate-100 text-[#082B5C] hover:bg-slate-50'
          }`}
          title="Recenter Map"
        >
          <Compass size={16} className={isCentered ? 'animate-pulse' : ''} />
        </button>
      </div>

      {/* MINIMALIST BOTTOM WATERMARK SHEET */}
      <div className="w-full bg-white/90 backdrop-blur-md border-t border-slate-100 px-4 py-2 flex items-center justify-between text-[9px] text-gray-400 font-semibold z-10">
        <span className="flex items-center gap-1">
          <ShieldCheck size={11} className="text-emerald-500" /> Proteksi Enkripsi Privasi Lokasi Aktif
        </span>
        <span>© OpenStreetMap / Leaflet Engine</span>
      </div>

    </div>
  );
}
