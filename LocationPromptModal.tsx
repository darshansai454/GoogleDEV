import React, { useState } from 'react';
import { CampusNode } from '../types/campus';
import { NODES, BUILDINGS, CAMPUS_CENTER } from '../data/campusData';
import { 
  Navigation, 
  MapPin, 
  QrCode, 
  Compass, 
  X, 
  CheckCircle, 
  ArrowRight, 
  Crosshair, 
  Loader2,
  Sparkles
} from 'lucide-react';

interface LocationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStartId: string;
  currentDestId: string;
  onConfirmTrip: (startId: string, destId: string, useGps: boolean) => void;
  onOpenScanner: () => void;
}

export const LocationPromptModal: React.FC<LocationPromptModalProps> = ({
  isOpen,
  onClose,
  currentStartId,
  currentDestId,
  onConfirmTrip,
  onOpenScanner
}) => {
  const [selectedStart, setSelectedStart] = useState<string>(currentStartId || 'GATE-01');
  const [selectedDest, setSelectedDest] = useState<string>(currentDestId || 'computer-lab-a202');
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Browser Geolocation Detection
  const handleDetectGPS = () => {
    setIsDetectingGps(true);
    setGpsStatus('Requesting satellite GPS coordinates...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetectingGps(false);
          setGpsStatus(`GPS Acquired: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          // Set start to Main Campus Entrance Gate
          setSelectedStart('GATE-01');
        },
        (error) => {
          setIsDetectingGps(false);
          setGpsStatus('GPS permission blocked or simulated. Positioned at Main Campus Entrance Gate.');
          setSelectedStart('GATE-01');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsDetectingGps(false);
      setGpsStatus('Geolocation not supported. Positioned at Main Campus Entrance Gate.');
      setSelectedStart('GATE-01');
    }
  };

  const handleStartTrip = () => {
    onConfirmTrip(selectedStart, selectedDest, Boolean(gpsStatus));
    onClose();
  };

  const startCheckpoints = [
    { id: 'GATE-01', name: 'Main Campus Entrance Gate', icon: '🚪' },
    { id: 'PARK-01', name: 'Visitor Parking Lot', icon: '🅿️' },
    { id: 'A-ENTRANCE', name: 'Academic Block A Entrance', icon: '🎓' },
    { id: 'A-G-01', name: 'Block A Ground Foyer Checkpoint', icon: '📍' },
    { id: 'LIB-ENTRANCE', name: 'Central Library Entrance', icon: '📚' },
    { id: 'ADMIN-ENTRANCE', name: 'Administration Building', icon: '🏛️' }
  ];

  const destinationOptions = [
    { id: 'computer-lab-a202', name: 'Computer Lab A-202 (Floor 1)', building: 'Academic Block A' },
    { id: 'A-ROOM-101', name: 'Lecture Hall A-101 (Ground)', building: 'Academic Block A' },
    { id: 'A-FACULTY', name: 'Faculty & Dean Cabin', building: 'Academic Block A' },
    { id: 'LIB-READING', name: 'Library Silent Reading Hall', building: 'Central Library' },
    { id: 'ADMISSIONS', name: 'Admissions & Registrar Desk', building: 'Admin Block' },
    { id: 'CAFE-ENTRANCE', name: 'Cafeteria & Food Court', building: 'Food Court' },
    { id: 'AUDIT-ENTRANCE', name: 'Grand Auditorium', building: 'Auditorium' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Plan Campus Trip</h3>
              <p className="text-xs text-slate-500">Detect your starting location & pick your destination</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* STEP 1: CURRENT LOCATION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">1</span>
                <span>Where are you right now? (Current Location)</span>
              </label>
            </div>

            {/* Location Detection Actions */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetectingGps}
                className="p-3 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-800 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                {isDetectingGps ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Crosshair className="w-4 h-4 text-blue-600" />
                )}
                <span>Detect GPS Location</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenScanner();
                }}
                className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2 shadow-subtle"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Scan Wall QR Code</span>
              </button>
            </div>

            {gpsStatus && (
              <div className="p-2.5 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{gpsStatus}</span>
              </div>
            )}

            {/* Checkpoint Pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Or select a campus checkpoint:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {startCheckpoints.map(cp => (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => setSelectedStart(cp.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                      selectedStart === cp.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{cp.icon}</span>
                    <span className="truncate">{cp.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2: DESTINATION */}
          <div className="border-t border-slate-100 pt-4">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">2</span>
              <span>Where do you want to go? (Destination)</span>
            </label>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {destinationOptions.map(dest => (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => setSelectedDest(dest.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedDest === dest.id
                      ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{dest.name}</div>
                    <div className="text-[11px] text-slate-400">{dest.building}</div>
                  </div>
                  {selectedDest === dest.id && (
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStartTrip}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Start Live Outdoor + Indoor Navigation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
