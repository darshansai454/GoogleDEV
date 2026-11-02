import React from 'react';
import { CampusNode, NavigationRoute } from '../types/campus';
import { Layers, ArrowUp, ArrowDown, MapPin, Accessibility, Camera } from 'lucide-react';

interface IndoorFloorMapProps {
  floorId: string;
  onFloorChange: (floorId: string) => void;
  currentRoute: NavigationRoute | null;
  currentLocationId: string;
  onStartCameraAR?: () => void;
}

export const IndoorFloorMap: React.FC<IndoorFloorMapProps> = ({
  floorId,
  onFloorChange,
  currentRoute,
  currentLocationId,
  onStartCameraAR
}) => {
  const isGround = floorId === 'ground';

  // Filter nodes for the current floor in Academic Block A
  const floorNodes = currentRoute?.pathNodes.filter(
    n => n.buildingId === 'academic-a' && n.floorId === floorId
  ) || [];

  return (
    <div className="relative w-full h-full min-h-[500px] bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Floor Switcher Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Academic Block A Indoor Plan</h4>
            <p className="text-xs text-slate-500">
              {isGround ? 'Ground Floor (Level 1)' : 'First Floor (Level 2)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => onFloorChange('ground')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isGround ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ground Floor
          </button>
          <button
            onClick={() => onFloorChange('first')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !isGround ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            First Floor
          </button>
        </div>
      </div>

      {/* SVG Floorplan Canvas */}
      <div className="flex-1 relative p-6 flex items-center justify-center bg-slate-50/30">
        <svg viewBox="0 0 800 600" className="w-full h-full max-h-[500px]">
          <defs>
            <pattern id="indoorGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="800" height="600" fill="#F8FAFC" />
          <rect width="800" height="600" fill="url(#indoorGrid)" />

          {/* Outer Boundary Wall */}
          <rect x="60" y="40" width="680" height="520" rx="20" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="4" />

          {/* Hallways / Corridors */}
          <path
            d="M 400 540 L 400 300 M 180 300 L 620 300 M 400 300 L 400 120 M 200 120 L 600 120"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="50"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {isGround ? (
            /* GROUND FLOOR ROOMS */
            <g id="ground-rooms">
              {/* Lecture Hall A-101 */}
              <rect x="90" y="180" width="200" height="200" rx="12" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
              <text x="190" y="275" fill="#1E293B" fontSize="15" fontWeight="700" textAnchor="middle">
                LECTURE HALL A-101
              </text>
              <text x="190" y="300" fill="#64748B" fontSize="12" textAnchor="middle">
                100 Seats • Smart Board
              </text>

              {/* Faculty Cabins */}
              <rect x="510" y="180" width="200" height="200" rx="12" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
              <text x="610" y="275" fill="#1E293B" fontSize="15" fontWeight="700" textAnchor="middle">
                FACULTY CABINS
              </text>
              <text x="610" y="300" fill="#64748B" fontSize="12" textAnchor="middle">
                Dean & Professor Suite
              </text>

              {/* Ground Foyer */}
              <rect x="280" y="350" width="240" height="100" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
              <text x="400" y="405" fill="#475569" fontSize="14" fontWeight="600" textAnchor="middle">
                GROUND FOYER CHECKPOINT
              </text>

              {/* Main Entrance Door */}
              <rect x="340" y="520" width="120" height="40" rx="8" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2" />
              <text x="400" y="545" fill="#1D4ED8" fontSize="13" fontWeight="700" textAnchor="middle">
                MAIN ENTRANCE
              </text>

              {/* Elevator Ground */}
              <rect x="470" y="270" width="60" height="60" rx="8" fill="#ECFDF5" stroke="#10B981" strokeWidth="2" />
              <text x="500" y="305" fill="#047857" fontSize="12" fontWeight="700" textAnchor="middle">
                LIFT
              </text>

              {/* Stairs Ground */}
              <rect x="270" y="270" width="60" height="60" rx="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
              <text x="300" y="305" fill="#B45309" fontSize="12" fontWeight="700" textAnchor="middle">
                STAIRS
              </text>
            </g>
          ) : (
            /* FIRST FLOOR ROOMS */
            <g id="first-rooms">
              {/* Computer Lab A-202 (HIGHLIGHTED TARGET) */}
              <rect
                x="80"
                y="80"
                width="240"
                height="180"
                rx="14"
                fill={currentRoute?.destinationId === 'computer-lab-a202' ? '#EFF6FF' : '#F8FAFC'}
                stroke={currentRoute?.destinationId === 'computer-lab-a202' ? '#2563EB' : '#94A3B8'}
                strokeWidth={currentRoute?.destinationId === 'computer-lab-a202' ? 3 : 2}
              />
              <text x="200" y="160" fill="#1E293B" fontSize="16" fontWeight="800" textAnchor="middle">
                COMPUTER LAB A-202
              </text>
              <text x="200" y="185" fill="#2563EB" fontSize="12" fontWeight="600" textAnchor="middle">
                🎯 Target Destination • 60 PCs
              </text>

              {/* Classroom A-201 */}
              <rect x="480" y="80" width="240" height="180" rx="14" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
              <text x="600" y="160" fill="#1E293B" fontSize="16" fontWeight="700" textAnchor="middle">
                CLASSROOM A-201
              </text>
              <text x="600" y="185" fill="#64748B" fontSize="12" textAnchor="middle">
                80 Seats • Interactive Screen
              </text>

              {/* Level 1 Hallway */}
              <rect x="280" y="350" width="240" height="100" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
              <text x="400" y="405" fill="#475569" fontSize="14" fontWeight="600" textAnchor="middle">
                FLOOR 1 CENTRAL FOYER
              </text>

              {/* Elevator First Floor */}
              <rect x="470" y="270" width="60" height="60" rx="8" fill="#ECFDF5" stroke="#10B981" strokeWidth="2" />
              <text x="500" y="305" fill="#047857" fontSize="12" fontWeight="700" textAnchor="middle">
                LIFT L2
              </text>

              {/* Stairs First Floor */}
              <rect x="270" y="270" width="60" height="60" rx="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
              <text x="300" y="305" fill="#B45309" fontSize="12" fontWeight="700" textAnchor="middle">
                STAIRS L2
              </text>
            </g>
          )}

          {/* Active Navigation Route Path on Floor */}
          {floorNodes.length > 1 && (
            <g id="route-path">
              <polyline
                points={floorNodes.map(n => `${(n.x / 100) * 800},${(n.y / 100) * 600}`).join(' ')}
                fill="none"
                stroke="rgba(37, 99, 235, 0.3)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={floorNodes.map(n => `${(n.x / 100) * 800},${(n.y / 100) * 600}`).join(' ')}
                fill="none"
                stroke={currentRoute?.accessible ? '#0D9488' : '#2563EB'}
                strokeWidth="5"
                strokeDasharray="10 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {floorNodes.map((n, i) => (
                <circle
                  key={n.id}
                  cx={(n.x / 100) * 800}
                  cy={(n.y / 100) * 600}
                  r={i === 0 || i === floorNodes.length - 1 ? 8 : 5}
                  fill={i === 0 ? '#16A34A' : i === floorNodes.length - 1 ? '#EF4444' : '#2563EB'}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
              ))}
            </g>
          )}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Elevator (Accessible)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Stairs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Nav Route</span>
          </div>
        </div>

        {/* Floating Start Live Camera AR Button */}
        {onStartCameraAR && currentRoute && (
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={onStartCameraAR}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-95 text-white font-extrabold text-xs shadow-elevated flex items-center gap-2 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Start Live Camera AR</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
