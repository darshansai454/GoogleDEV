import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript, isGoogleMapsKeyAvailable } from '../services/maps';
import { CAMPUS_CENTER, BUILDINGS, NODES } from '../data/campusData';
import { NavigationRoute } from '../types/campus';
import { Map, MapPin, Navigation, Info, ExternalLink, Camera } from 'lucide-react';

interface GoogleMapsViewerProps {
  currentRoute: NavigationRoute | null;
  selectedBuilding: string | null;
  onBuildingSelect: (buildingId: string) => void;
  onStartCameraAR?: () => void;
}

export const GoogleMapsViewer: React.FC<GoogleMapsViewerProps> = ({
  currentRoute,
  selectedBuilding,
  onBuildingSelect,
  onStartCameraAR
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState<boolean>(false);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let active = true;

    if (isGoogleMapsKeyAvailable()) {
      loadGoogleMapsScript().then(loaded => {
        if (loaded && active && mapContainerRef.current) {
          initGoogleMap();
          setIsGoogleMapsReady(true);
        }
      });
    }

    return () => {
      active = false;
    };
  }, []);

  const initGoogleMap = () => {
    if (!window.google?.maps || !mapContainerRef.current) return;

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: CAMPUS_CENTER.lat, lng: CAMPUS_CENTER.lng },
      zoom: CAMPUS_CENTER.zoom,
      mapTypeId: 'roadmap',
      styles: [
        { featureType: 'poi.school', stylers: [{ visibility: 'on' }] },
        { featureType: 'poi.business', stylers: [{ visibility: 'simplified' }] }
      ]
    });

    mapInstance.current = map;

    // Add building markers
    BUILDINGS.forEach(b => {
      const marker = new window.google.maps.Marker({
        position: { lat: b.lat, lng: b.lng },
        map,
        title: b.name,
        label: {
          text: b.shortName,
          color: '#1E293B',
          fontSize: '11px',
          fontWeight: 'bold'
        }
      });

      marker.addListener('click', () => {
        onBuildingSelect(b.id);
      });

      markersRef.current.push(marker);
    });
  };

  // Dynamic Route Line Calculation for Vector Campus Map
  const getRouteSvgData = () => {
    if (!currentRoute || currentRoute.pathNodes.length < 2) return null;

    const startNode = currentRoute.pathNodes[0];
    const endNode = currentRoute.pathNodes[currentRoute.pathNodes.length - 1];

    const buildingCenters: Record<string, { x: number; y: number }> = {
      'GATE-01': { x: 400, y: 530 },
      'PARK-01': { x: 400, y: 470 },
      'academic-a': { x: 240, y: 270 },
      'academic-b': { x: 560, y: 270 },
      'library': { x: 235, y: 425 },
      'admin': { x: 400, y: 175 },
      'auditorium': { x: 560, y: 425 },
      'cafeteria': { x: 560, y: 170 },
      'medical': { x: 225, y: 165 }
    };

    const startPos = buildingCenters[startNode.id] || buildingCenters[startNode.buildingId] || { x: 400, y: 530 };
    const endPos = buildingCenters[endNode.id] || buildingCenters[endNode.buildingId] || { x: 240, y: 270 };

    // Draw ortholine pathway along campus spine (x: 400)
    let d = `M ${startPos.x} ${startPos.y}`;
    if (startPos.x !== 400) {
      d += ` L 400 ${startPos.y}`;
    }
    d += ` L 400 ${endPos.y}`;
    if (endPos.x !== 400) {
      d += ` L ${endPos.x} ${endPos.y}`;
    }

    return { d, startPos, endPos };
  };

  const routeData = getRouteSvgData();

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Top Banner Notice */}
      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs font-medium text-slate-600 z-10">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-blue-600" />
          <span>
            {isGoogleMapsReady
              ? 'Google Maps JavaScript API (Live Campus Walking Map)'
              : 'Interactive Campus Outdoor Route Map'}
          </span>
        </div>
        {currentRoute && (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Route Active: {currentRoute.distance} m (~{currentRoute.estimatedMinutes} min)</span>
          </span>
        )}
      </div>

      {/* Main Map Viewport */}
      {isGoogleMapsReady ? (
        <div ref={mapContainerRef} className="w-full flex-1" />
      ) : (
        /* Clean Vector Map with Dynamic Highlighted Route */
        <div className="flex-1 relative bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
          <svg viewBox="0 0 800 600" className="w-full h-full max-h-[520px]">
            {/* Campus Grounds Background */}
            <rect width="800" height="600" fill="#F8FAFC" />
            
            {/* Main Campus Ring Road */}
            <rect x="80" y="60" width="640" height="480" rx="40" fill="#DCFCE7" stroke="#CBD5E1" strokeWidth="18" />
            <rect x="120" y="100" width="560" height="400" rx="30" fill="#F0FDF4" stroke="#E2E8F0" strokeWidth="2" />

            {/* Central Avenue Spine */}
            <line x1="400" y1="540" x2="400" y2="100" stroke="#CBD5E1" strokeWidth="16" strokeLinecap="round" />
            <line x1="120" y1="300" x2="680" y2="300" stroke="#CBD5E1" strokeWidth="16" strokeLinecap="round" />

            {/* Buildings Outlines */}
            {BUILDINGS.map((b, i) => {
              const positions: Record<string, { x: number; y: number; w: number; h: number; color: string }> = {
                'GATE-01': { x: 350, y: 510, w: 100, h: 40, color: '#3B82F6' },
                'academic-a': { x: 170, y: 220, w: 140, h: 100, color: '#2563EB' },
                'academic-b': { x: 490, y: 220, w: 140, h: 100, color: '#0D9488' },
                'library': { x: 170, y: 380, w: 130, h: 90, color: '#6366F1' },
                'admin': { x: 340, y: 130, w: 120, h: 90, color: '#475569' },
                'auditorium': { x: 490, y: 380, w: 140, h: 90, color: '#E11D48' },
                'cafeteria': { x: 500, y: 130, w: 120, h: 80, color: '#EA580C' },
                'medical': { x: 170, y: 130, w: 110, h: 70, color: '#16A34A' },
                'parking': { x: 340, y: 440, w: 120, h: 60, color: '#94A3B8' }
              };

              const pos = positions[b.id] || { x: 200 + (i % 3) * 150, y: 150 + Math.floor(i / 3) * 100, w: 100, h: 70, color: '#3B82F6' };
              const isSelected = selectedBuilding === b.id;

              return (
                <g key={b.id} onClick={() => onBuildingSelect(b.id)} className="cursor-pointer group">
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={pos.w}
                    height={pos.h}
                    rx="10"
                    fill={isSelected ? '#EFF6FF' : '#FFFFFF'}
                    stroke={isSelected ? '#2563EB' : '#CBD5E1'}
                    strokeWidth={isSelected ? '3' : '1.5'}
                    className="transition-all duration-200"
                  />
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={pos.w}
                    height="8"
                    rx="4"
                    fill={pos.color}
                  />
                  <text
                    x={pos.x + pos.w / 2}
                    y={pos.y + pos.h / 2 + 3}
                    fill={isSelected ? '#1D4ED8' : '#1E293B'}
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {b.shortName}
                  </text>
                </g>
              );
            })}

            {/* Active Highlighted Route Pathway */}
            {routeData && (
              <g id="dynamic-outdoor-route">
                {/* Route Glow Casing */}
                <path
                  d={routeData.d}
                  fill="none"
                  stroke="rgba(37, 99, 235, 0.25)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Route Main Animated Dashed Line */}
                <path
                  d={routeData.d}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="5"
                  strokeDasharray="10 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Origin Marker (Green) */}
                <circle
                  cx={routeData.startPos.x}
                  cy={routeData.startPos.y}
                  r="10"
                  fill="#16A34A"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
                <text
                  x={routeData.startPos.x}
                  y={routeData.startPos.y - 14}
                  fill="#15803D"
                  fontSize="10"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  START
                </text>

                {/* Destination Marker (Red) */}
                <circle
                  cx={routeData.endPos.x}
                  cy={routeData.endPos.y}
                  r="10"
                  fill="#DC2626"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
                <text
                  x={routeData.endPos.x}
                  y={routeData.endPos.y - 14}
                  fill="#B91C1C"
                  fontSize="10"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  DESTINATION
                </text>
              </g>
            )}
          </svg>

          {/* Floating Action Button: Launch Camera AR Guidance */}
          {onStartCameraAR && currentRoute && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={onStartCameraAR}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-95 text-white font-extrabold text-xs shadow-elevated flex items-center gap-2 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Start Live Camera AR Guidance</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
