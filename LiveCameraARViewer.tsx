import React, { useState, useEffect, useRef } from 'react';
import { NavigationRoute, RouteInstruction } from '../types/campus';
import { photoManager } from '../services/photoManager';
import { 
  Camera, 
  ArrowUp, 
  ChevronRight, 
  ChevronLeft, 
  Compass, 
  CheckCircle, 
  QrCode, 
  Maximize2, 
  Minimize2, 
  AlertCircle, 
  Sparkles, 
  Globe, 
  Layers,
  Scan,
  RefreshCw,
  Map,
  Eye,
  Sliders
} from 'lucide-react';

interface LiveCameraARViewerProps {
  currentRoute: NavigationRoute | null;
  onOpenQRScanner: () => void;
  onOpenTourReference: () => void;
  onCompleteNavigation?: () => void;
  onSwitchTab?: (tab: 'camera' | 'maps' | 'indoor' | '3d' | 'tour') => void;
}

export const LiveCameraARViewer: React.FC<LiveCameraARViewerProps> = ({
  currentRoute,
  onOpenQRScanner,
  onOpenTourReference,
  onCompleteNavigation,
  onSwitchTab
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showPhotoRef, setShowPhotoRef] = useState<boolean>(true);
  const [simulateCameraFeed, setSimulateCameraFeed] = useState<boolean>(false);

  const instructions: RouteInstruction[] = currentRoute?.instructions || [];
  const activeStep = instructions[currentStepIndex] || null;
  const isFinalStep = currentStepIndex >= instructions.length - 1;

  const [photoUpdateVersion, setPhotoUpdateVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setPhotoUpdateVersion(v => v + 1);
    window.addEventListener('campus_photos_updated', handleUpdate);
    return () => window.removeEventListener('campus_photos_updated', handleUpdate);
  }, []);

  // Resolve active landmark photo dynamically from photoManager
  const getActivePhoto = () => {
    if (activeStep?.photoUrl) return activeStep.photoUrl;
    if (isFinalStep) {
      return photoManager.getPhoto(currentRoute?.destinationId || 'computer-lab-a202');
    }
    if (activeStep?.type === 'elevator') {
      return photoManager.getPhoto('elevator-foyer');
    }
    const destNode = currentRoute?.pathNodes[currentRoute.pathNodes.length - 1];
    if (destNode && destNode.buildingId) {
      return photoManager.getPhoto(destNode.buildingId);
    }
    return photoManager.getPhoto('academic-a');
  };

  const currentPhoto = getActivePhoto();

  // Initialize and maintain camera feed
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      setCameraError(null);
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' }, // Rear world-facing camera on mobile
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });

          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
            setCameraActive(true);
            setSimulateCameraFeed(false);
          }
        } else {
          setCameraError('Camera API not accessible in this context. Use simulated corridor mode.');
          setSimulateCameraFeed(true);
        }
      } catch (err: any) {
        console.warn('Camera stream notice:', err.name, err.message);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera permission was denied. Tap "Simulate Camera" or enable permissions in browser.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No physical camera detected. Simulated corridor active.');
        } else {
          setCameraError('Camera stream unavailable. Running live AR simulation.');
        }
        setCameraActive(false);
        setSimulateCameraFeed(true);
      }
    };

    startCamera();

    // Listen to DeviceOrientationEvent compass on mobile if available
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setCompassHeading(Math.round(e.alpha));
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  // Reset step index when route changes
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

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[550px] bg-slate-950 rounded-2xl border border-slate-200 overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Real Live Video Camera Background */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          cameraActive && !simulateCameraFeed ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Simulated Live Corridor Feed (Active if webcam denied/unavailable or explicitly toggled) */}
      {(!cameraActive || simulateCameraFeed) && (
        <div className="absolute inset-0 overflow-hidden bg-slate-900">
          <img
            src="/photos/block-a-entrance.jpg"
            alt="Simulated Campus Corridor Feed"
            className="w-full h-full object-cover opacity-60 scale-105 filter blur-[0.5px]"
          />
          {/* Animated scanning line overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-blue-500/10 animate-pulse pointer-events-none" />
        </div>
      )}

      {/* Optical Reticle Box & HUD Spatial Grid */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-64 h-64 sm:w-80 sm:h-80 border border-white/20 rounded-3xl relative flex items-center justify-center">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-xl" />
          
          <div className="text-[10px] uppercase font-extrabold tracking-widest text-white/70 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Spatial AR Tracking Active</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TOP STATUS BAR & ACTION CONTROLS
          ========================================================================= */}
      <div className="relative z-10 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/85 via-black/50 to-transparent">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-extrabold text-emerald-400 flex items-center gap-2 shadow-sm backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE CAMERA AR</span>
          </div>

          {currentRoute && (
            <span className="text-xs text-white/90 font-bold bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 hidden sm:inline">
              Step {currentStepIndex + 1} of {instructions.length || 1}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Checkpoint QR Scanner */}
          <button
            onClick={onOpenQRScanner}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm border border-blue-400"
            title="Scan QR Checkpoint on Wall"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan Checkpoint</span>
          </button>

          {/* Quick Return to Map Route */}
          {onSwitchTab && (
            <button
              onClick={() => onSwitchTab('maps')}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-white/25 backdrop-blur-md"
              title="View full 2D map route overview"
            >
              <Map className="w-3.5 h-3.5 text-emerald-300" />
              <span>Map Route</span>
            </button>
          )}

          {/* Quick 360 Tour Reference Button */}
          <button
            onClick={onOpenTourReference}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-white/20 backdrop-blur-md"
            title="Open 360 Campus Tour for Visual Reference Only"
          >
            <Globe className="w-3.5 h-3.5 text-blue-300" />
            <span className="hidden md:inline">360° Tour (Ref Only)</span>
          </button>

          {/* Camera Simulator Toggle */}
          <button
            onClick={() => setSimulateCameraFeed(!simulateCameraFeed)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border backdrop-blur-md ${
              simulateCameraFeed
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
            }`}
            title="Toggle Live Camera vs Simulated Corridor"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{simulateCameraFeed ? 'Simulated' : 'Webcam'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/20 backdrop-blur-md"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen AR'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Picture-in-Picture Landmark Reference Card */}
      {showPhotoRef && currentPhoto && (
        <div className="relative z-10 px-4 pt-1">
          <div className="w-48 sm:w-56 bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-blue-400 shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-2 bg-slate-900 flex items-center justify-between text-[11px] font-bold text-blue-300 border-b border-slate-800">
              <span className="flex items-center gap-1 truncate">
                <Scan className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Look for this landmark</span>
              </span>
              <button
                onClick={() => setShowPhotoRef(false)}
                className="text-slate-400 hover:text-white text-xs px-1"
                title="Hide thumbnail"
              >
                ✕
              </button>
            </div>
            <div className="relative">
              <img
                src={currentPhoto}
                alt="Landmark photographic reference"
                className="w-full h-28 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-[10px] font-bold text-white drop-shadow">
                  {activeStep?.text.split('through')[1] || activeStep?.text || 'Target Landmark'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Central 3D Animated Directional AR Arrow Overlay */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative flex flex-col items-center justify-center animate-bounce">
          {/* Glowing Outer Radial Disc with Dynamic Turn Rotation */}
          <div
            className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 p-1 shadow-[0_0_50px_rgba(37,99,235,0.85)] flex items-center justify-center transition-transform duration-500"
            style={{ transform: `rotate(${getArrowRotation()}deg)` }}
          >
            <div className="w-full h-full rounded-full bg-slate-950/85 backdrop-blur-md flex items-center justify-center border border-white/40">
              <ArrowUp className="w-14 h-14 text-white drop-shadow-xl" />
            </div>
          </div>

          {/* Distance & Turn Instruction Pill */}
          <div className="mt-3 px-4 py-1.5 rounded-full bg-blue-600/90 border border-blue-300/60 backdrop-blur-md text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-200" />
            <span>
              {activeStep ? `${activeStep.distanceMeters} m to next waypoint` : 'Follow arrow along route'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Turn-by-Turn Instruction HUD Card */}
      <div className="relative z-10 p-4 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="bg-white/95 backdrop-blur-md text-slate-900 p-4 rounded-3xl border border-slate-200 shadow-2xl space-y-3 max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">
                Target Destination
              </span>
              <span className="text-sm font-extrabold text-slate-900 truncate">
                {currentRoute?.destinationName || 'Computer Lab A-202'}
              </span>
            </div>
            <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
              Step {currentStepIndex + 1} of {instructions.length || 1}
            </span>
          </div>

          {/* Instruction Text */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 font-bold">
              {currentStepIndex + 1}
            </div>
            <div className="flex-1">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                {activeStep?.text || 'Continue forward along the path.'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Floor: <span className="font-semibold text-slate-700">{activeStep?.floorId === 'ground' ? 'Ground Floor' : 'Floor 1'}</span>
              </p>
            </div>
          </div>

          {/* Navigation Progression Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-xs font-bold flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            <button
              onClick={handleNextStep}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 ${
                isFinalStep
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
              }`}
            >
              {isFinalStep ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Destination Reached!</span>
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
  );
};
