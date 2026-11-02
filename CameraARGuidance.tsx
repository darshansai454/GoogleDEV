import React, { useEffect, useRef, useState } from 'react';
import { NavigationRoute } from '../types/campus';
import { 
  Camera, 
  X, 
  ArrowUp, 
  CheckCircle, 
  ChevronRight, 
  Compass, 
  Layers, 
  Sparkles, 
  Image as ImageIcon, 
  Maximize2, 
  Minimize2,
  Scan
} from 'lucide-react';

interface CameraARGuidanceProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: NavigationRoute | null;
  onArrived?: () => void;
}

export const CameraARGuidance: React.FC<CameraARGuidanceProps> = ({
  isOpen,
  onClose,
  currentRoute,
  onArrived
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showPhotoOverlay, setShowPhotoOverlay] = useState<boolean>(true);
  const [isPhotoExpanded, setIsPhotoExpanded] = useState<boolean>(false);

  const instructions = currentRoute?.instructions || [];
  const activeStep = instructions[currentStepIndex] || null;
  const isFinalStep = currentStepIndex >= instructions.length - 1;

  // Active step photo fallback
  const currentPhoto = activeStep?.photoUrl || (
    isFinalStep 
      ? '/photos/lab-a202.jpg' 
      : activeStep?.type === 'elevator' 
      ? '/photos/elevator-foyer.jpg' 
      : '/photos/block-a-entrance.jpg'
  );

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError('Camera API not supported on this device/browser.');
      }
    } catch (err: any) {
      console.warn('Camera feed notice:', err.message);
      setCameraError('Camera access denied or unavailable. Simulating live AR HUD overlay with photographic waypoint alignment.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleNextStep = () => {
    if (currentStepIndex < instructions.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      if (onArrived) onArrived();
      onClose();
    }
  };

  if (!isOpen) return null;

  const getArrowRotation = () => {
    if (!activeStep) return 0;
    if (activeStep.type === 'left') return -45;
    if (activeStep.type === 'right') return 45;
    return 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-fadeIn overflow-hidden">
      {/* Live Video Camera Background */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          cameraActive ? 'opacity-100' : 'opacity-25'
        }`}
      />

      {/* Simulated Camera Background when camera feed unavailable */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 animate-pulse">
            <Camera className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold text-slate-300 max-w-sm mb-1">
            Camera-Based Directional Guidance
          </p>
          <p className="text-xs text-slate-500 max-w-xs">
            {cameraError || 'Point camera towards corridors for optical waypoint assistance.'}
          </p>
        </div>
      )}

      {/* Optical Reticle Box */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-72 h-72 border border-white/20 rounded-3xl relative flex items-center justify-center">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-xl" />
        </div>
      </div>

      {/* Top Header HUD */}
      <div className="relative z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AR Guidance Mode</span>
          </div>
          <span className="text-xs text-slate-300 font-medium">
            Step {currentStepIndex + 1} of {instructions.length || 1}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Real Photo Reference */}
          <button
            onClick={() => setShowPhotoOverlay(!showPhotoOverlay)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition border ${
              showPhotoOverlay
                ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                : 'bg-white/10 text-white border-white/20'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Real Photo</span>
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition border border-white/20 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* REAL PHOTOGRAPHIC WAYPOINT REFERENCE (Picture-in-Picture / Street View Match) */}
      {showPhotoOverlay && currentPhoto && (
        <div
          className={`relative z-20 mx-4 transition-all duration-300 ${
            isPhotoExpanded ? 'flex-1 max-h-[55vh]' : 'w-44 sm:w-56'
          }`}
        >
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border-2 border-blue-400/80 shadow-[0_4px_24px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="p-2 bg-slate-900 flex items-center justify-between text-[11px] font-bold text-blue-300 border-b border-slate-800">
              <span className="flex items-center gap-1 truncate">
                <Scan className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Landmark: {activeStep?.text.split('through')[1] || activeStep?.text || 'Target'}</span>
              </span>
              <button
                onClick={() => setIsPhotoExpanded(!isPhotoExpanded)}
                className="text-slate-400 hover:text-white p-0.5 ml-1"
                title={isPhotoExpanded ? 'Minimize' : 'Expand Photo'}
              >
                {isPhotoExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="relative group">
              <img
                src={currentPhoto}
                alt="Real Landmark Reference"
                className={`w-full object-cover transition-all ${
                  isPhotoExpanded ? 'h-[45vh]' : 'h-28 sm:h-36'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-[10px] font-semibold text-white/90 drop-shadow">
                  Match your camera view with this landmark
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Central 3D Directional AR Arrow Overlay */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative flex flex-col items-center justify-center animate-bounce">
          <div
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 p-1 shadow-[0_0_50px_rgba(37,99,235,0.8)] flex items-center justify-center transition-transform duration-500"
            style={{ transform: `rotate(${getArrowRotation()}deg)` }}
          >
            <div className="w-full h-full rounded-full bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
              <ArrowUp className="w-12 h-12 text-white drop-shadow-md" />
            </div>
          </div>

          <div className="mt-3 px-3 py-1 rounded-full bg-blue-600/40 border border-blue-400/50 backdrop-blur-md text-[11px] font-bold text-blue-200">
            {activeStep ? `${activeStep.distanceMeters} meters` : 'Follow path'}
          </div>
        </div>
      </div>

      {/* Bottom Instruction Card */}
      <div className="relative z-10 p-4 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="bg-white/95 backdrop-blur-md text-slate-900 p-4 rounded-3xl border border-slate-200 shadow-2xl space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                Target: {currentRoute?.destinationName || 'Destination'}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {activeStep?.text || 'Proceed along path'}
              </h4>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 ${
              isFinalStep
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
            }`}
          >
            {isFinalStep ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Complete Navigation (Destination Reached)</span>
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
  );
};
