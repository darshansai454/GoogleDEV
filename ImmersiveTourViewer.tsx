import React, { useState, useEffect, useRef } from 'react';
import { NavigationRoute, RouteInstruction } from '../types/campus';
import { 
  Compass, 
  ArrowUp, 
  ChevronRight, 
  ChevronLeft, 
  Navigation, 
  Maximize2, 
  Minimize2, 
  Layers, 
  ExternalLink,
  MapPin,
  Sparkles,
  Info,
  CheckCircle,
  Camera,
  ArrowLeft
} from 'lucide-react';

interface ImmersiveTourViewerProps {
  currentRoute: NavigationRoute | null;
  selectedBuilding: string | null;
  onBuildingSelect: (buildingId: string) => void;
  onCompleteNavigation?: () => void;
  onBackToCamera?: () => void;
}

export const ImmersiveTourViewer: React.FC<ImmersiveTourViewerProps> = ({
  currentRoute,
  selectedBuilding,
  onBuildingSelect,
  onCompleteNavigation,
  onBackToCamera
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showNavOverlay, setShowNavOverlay] = useState<boolean>(true);
  const [tourLoaded, setTourLoaded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const instructions: RouteInstruction[] = currentRoute?.instructions || [];
  const activeStep = instructions[currentStepIndex] || null;
  const isFinalStep = currentStepIndex >= instructions.length - 1;

  // Reset step when route changes
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [currentRoute?.destinationId]);

  const handleNextStep = () => {
    if (currentStepIndex < instructions.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      if (onCompleteNavigation) onCompleteNavigation();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Determine directional arrow rotation from active turn
  const getArrowRotation = () => {
    if (!activeStep) return 0;
    if (activeStep.type === 'left') return -45;
    if (activeStep.type === 'right') return 45;
    return 0; // straight / elevator / arrival
  };

  // Official tour hotspots from immersive virtual tour
  const TOUR_HOTSPOTS = [
    { id: 'academic-a', name: 'Learning Centre 1', short: 'LC 1 (Academic)', icon: '🎓' },
    { id: 'academic-a', name: 'Learning Centre 2', short: 'LC 2 (Labs)', icon: '💻' },
    { id: 'admin', name: 'Admin Block', short: 'Admin Block', icon: '🏛️' },
    { id: 'library', name: 'Central Library', short: 'Central Library', icon: '📚' },
    { id: 'cafeteria', name: 'Food Court & Alfresco', short: 'Food Court', icon: '☕' },
    { id: 'auditorium', name: 'Grand Auditorium', short: 'Auditorium', icon: '🎭' },
    { id: 'medical', name: 'Health Centre', short: 'Medical Clinic', icon: '🏥' },
    { id: 'GATE-01', name: 'Main Entrance', short: 'Main Entrance', icon: '🚪' }
  ];

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[550px] bg-slate-900 rounded-2xl border border-slate-200 overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Visual Reference Disclaimer Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 z-30 shadow-subtle">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Reference Purpose Only:</strong> This 360° virtual tour allows you to visually inspect campus aesthetics & buildings. For live wayfinding, use <strong>Live Camera AR Navigation</strong>.
          </span>
        </div>
        {onBackToCamera && (
          <button
            onClick={onBackToCamera}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ml-auto"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Return to Live Camera AR</span>
          </button>
        )}
      </div>

      {/* 360-Degree Virtual Tour Live Iframe */}
      <iframe
        src="https://www.immersivetourz.com/allianceuniversity/index.html"
        title="Alliance University Official 360 Immersive Tour"
        className="w-full flex-1 border-0"
        allow="accelerometer; gyroscope; magnetometer; xr-spatial-tracking; fullscreen"
        onLoad={() => setTourLoaded(true)}
      />

      {/* Loading Overlay */}
      {!tourLoaded && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 animate-spin">
            <Compass className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Loading 360° Immersive Campus Tour...</h4>
          <p className="text-xs text-slate-500">Connecting to Alliance University 360° Panoramas for Landmark Reference</p>
        </div>
      )}

      {/* HUD OVERLAY ON TOP OF 360 TOUR */}
      {showNavOverlay && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between gap-2 pointer-events-auto">
            <div className="bg-amber-50/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-card flex items-center gap-2 text-xs font-bold text-amber-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>360° Visual Reference Mode</span>
              {currentRoute && (
                <>
                  <span className="text-amber-300">•</span>
                  <span className="text-blue-700 font-extrabold">{currentRoute.distance} m to destination</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onBackToCamera && (
                <button
                  onClick={onBackToCamera}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                  title="Switch back to Live Camera AR mode"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live Camera AR</span>
                </button>
              )}
              <button
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:text-blue-600 transition"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Tour'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <a
                href="https://www.immersivetourz.com/allianceuniversity/index.html"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:text-blue-600 transition"
                title="Open Direct Full Tour"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Central 3D Directional Waypoint Indicator */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="relative flex flex-col items-center justify-center animate-bounce">
              <div
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 p-1 shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center transition-transform duration-500"
                style={{ transform: `rotate(${getArrowRotation()}deg)` }}
              >
                <div className="w-full h-full rounded-full bg-slate-950/80 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <ArrowUp className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
              </div>

              <div className="mt-2.5 px-3.5 py-1 rounded-full bg-blue-600/90 border border-blue-300/60 backdrop-blur-md text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />
                <span>
                  {activeStep ? `${activeStep.distanceMeters} m to next waypoint` : 'Following route'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Reference HUD Card */}
          <div className="pointer-events-auto max-w-xl mx-auto w-full">
            <div className="bg-white/95 backdrop-blur-md text-slate-900 p-4 rounded-3xl border border-slate-200 shadow-elevated space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    Target: {currentRoute?.destinationName || 'Computer Lab A-202'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Step {currentStepIndex + 1} of {instructions.length || 1}
                </span>
              </div>

              {/* Turn Text */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 font-bold text-sm">
                  {currentStepIndex + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                    {activeStep?.text || 'Continue forward along the main walkway.'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Floor: <span className="font-semibold text-slate-700">{activeStep?.floorId === 'ground' ? 'Ground Floor' : 'Floor 1'}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-xs font-bold flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <button
                  onClick={handleNextStep}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 ${
                    isFinalStep
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                  }`}
                >
                  {isFinalStep ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Arrived at Destination!</span>
                    </>
                  ) : (
                    <>
                      <span>Next Waypoint</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Hotspot Jump Bar */}
      <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar z-20">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-2 shrink-0">
          Campus Hotspots:
        </span>
        {TOUR_HOTSPOTS.map((h, i) => (
          <button
            key={i}
            onClick={() => onBuildingSelect(h.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 transition flex items-center gap-1.5 shrink-0 shadow-subtle"
          >
            <span>{h.icon}</span>
            <span>{h.short}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
