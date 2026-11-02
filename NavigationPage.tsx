import React, { useState, useEffect } from 'react';
import { UnityViewer } from '../components/UnityViewer';
import { IndoorFloorMap } from '../components/IndoorFloorMap';
import { GoogleMapsViewer } from '../components/GoogleMapsViewer';
import { ImmersiveTourViewer } from '../components/ImmersiveTourViewer';
import { LiveCameraARViewer } from '../components/LiveCameraARViewer';
import { QRScannerModal } from '../components/QRScannerModal';
import { QRGeneratorDirectory } from '../components/QRGeneratorDirectory';
import { LocationPromptModal } from '../components/LocationPromptModal';
import { DestinationPromptModal } from '../components/DestinationPromptModal';
import { CameraARGuidance } from '../components/CameraARGuidance';
import { calculateRoute } from '../algorithms/dijkstra';
import { unityBridge } from '../services/unityBridge';
import { CampusNode, NavigationRoute, QRCheckpoint } from '../types/campus';
import { NODES, BUILDINGS } from '../data/campusData';
import { 
  Search, 
  MapPin, 
  Navigation, 
  QrCode, 
  Accessibility, 
  Camera, 
  Layers, 
  Compass, 
  Box, 
  Map, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  CornerDownRight, 
  AlertCircle,
  RotateCcw,
  Sparkles,
  Globe,
  Crosshair,
  Printer,
  Target
} from 'lucide-react';

interface NavigationPageProps {
  initialStartId?: string;
  initialDestinationId?: string;
  initialTab?: 'camera' | 'maps' | 'indoor' | '3d' | 'tour';
}

export const NavigationPage: React.FC<NavigationPageProps> = ({
  initialStartId,
  initialDestinationId = 'computer-lab-a202',
  initialTab = 'maps' // Route map is displayed immediately!
}) => {
  // Navigation State
  const [currentLocationId, setCurrentLocationId] = useState<string>(initialStartId || 'GATE-01');
  const [destinationId, setDestinationId] = useState<string>(initialDestinationId);
  const [accessibleMode, setAccessibleMode] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'camera' | 'maps' | 'indoor' | '3d' | 'tour'>(initialTab);
  const [selectedFloor, setSelectedFloor] = useState<string>('ground');
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>('academic-a');

  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isQrDirectoryOpen, setIsQrDirectoryOpen] = useState<boolean>(false);
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState<boolean>(false);
  const [isDestinationPromptOpen, setIsDestinationPromptOpen] = useState<boolean>(false);
  const [isArModalOpen, setIsArModalOpen] = useState<boolean>(false);
  const [isArrived, setIsArrived] = useState<boolean>(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Active Route
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute | null>(null);

  // If initialStartId is supplied (e.g. from QR scan via phone camera), prompt for destination!
  useEffect(() => {
    if (initialStartId) {
      setCurrentLocationId(initialStartId);
      const matchedNode = NODES.find(n => n.id === initialStartId);
      if (matchedNode) {
        setSelectedBuilding(matchedNode.buildingId);
        if (matchedNode.floorId) setSelectedFloor(matchedNode.floorId);
      }
      setIsDestinationPromptOpen(true);
    }
  }, [initialStartId]);

  // Recompute route on location, destination, or accessibility toggle change
  useEffect(() => {
    if (currentLocationId && destinationId) {
      const route = calculateRoute(currentLocationId, destinationId, accessibleMode);
      setCurrentRoute(route);

      if (route) {
        unityBridge.setRoute(route);

        // Auto-switch indoor floor view if destination is on First Floor
        const destNode = NODES.find(n => n.id === destinationId);
        if (destNode && destNode.floorId) {
          setSelectedFloor(destNode.floorId);
          if (destNode.buildingId) {
            setSelectedBuilding(destNode.buildingId);
          }
        }
      }
    }
  }, [currentLocationId, destinationId, accessibleMode]);

  const destinationNode = NODES.find(n => n.id === destinationId);
  const startNode = NODES.find(n => n.id === currentLocationId);

  // Handlers
  const handleQrCheckpointScanned = (cp: QRCheckpoint) => {
    setCurrentLocationId(cp.nodeId);
    setSelectedBuilding(cp.buildingId);
    setSelectedFloor(cp.floorId);
    unityBridge.setCurrentLocation(cp.nodeId);
    setIsArrived(false);
    // User request: "IF WE SCAN THE QR IT SHOULD GO TO THE PLACE AND FROM THERE IT SHOULD ASK FOR THE DESTINATION IT WANT TO GO"
    setIsDestinationPromptOpen(true);
  };

  const handleSelectDestinationFromPrompt = (destId: string) => {
    setDestinationId(destId);

    // User request: "AFTER THAT ROUTE SHOULD BE DISPLAYED IMMEDIATELY RATHER THAN SHOWING THE CAMERA"
    const destNode = NODES.find(n => n.id === destId);
    const startNode = NODES.find(n => n.id === currentLocationId);

    if (startNode?.buildingId === 'academic-a' && destNode?.buildingId === 'academic-a') {
      setActiveViewTab('indoor');
      if (destNode.floorId) setSelectedFloor(destNode.floorId);
    } else {
      setActiveViewTab('maps');
    }

    setIsDestinationPromptOpen(false);
    setIsArrived(false);
  };

  const handleConfirmTripFromModal = (startId: string, destId: string, useGps: boolean) => {
    setCurrentLocationId(startId);
    setDestinationId(destId);

    const destNode = NODES.find(n => n.id === destId);
    const startNode = NODES.find(n => n.id === startId);

    if (startNode?.buildingId === 'academic-a' && destNode?.buildingId === 'academic-a') {
      setActiveViewTab('indoor');
      if (destNode.floorId) setSelectedFloor(destNode.floorId);
    } else {
      setActiveViewTab('maps');
    }

    setIsArrived(false);
  };

  const handleBuildingSelected = (bId: string) => {
    setSelectedBuilding(bId);
  };

  const searchableNodes = NODES.filter(
    n => n.nodeType === 'classroom' || n.nodeType === 'lab' || n.nodeType === 'office' || n.nodeType === 'facility'
  );

  const searchResults = searchQuery.trim()
    ? searchableNodes.filter(
        n =>
          n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row bg-[#F8FAFC] overflow-hidden">
      {/* =========================================================================
          LEFT CONTROL & ROUTE PANEL
          ========================================================================= */}
      <aside className="w-full lg:w-[420px] bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm overflow-y-auto max-h-[50vh] lg:max-h-[calc(100vh-64px)]">
        {/* Destination Search Box */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 sticky top-0 z-30">
          <div className="relative">
            <div className="flex items-center bg-white rounded-xl border border-slate-200 hover:border-blue-400 focus-within:border-blue-600 shadow-subtle p-2 transition">
              <Search className="w-4 h-4 text-slate-400 ml-1 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search campus destination..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full py-1 text-xs sm:text-sm bg-transparent outline-none text-slate-900 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Live Search Autocomplete Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-elevated z-40 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {searchResults.map(node => (
                  <button
                    key={node.id}
                    onClick={() => {
                      setDestinationId(node.id);
                      setSearchQuery('');
                      setIsSearchOpen(false);
                      setIsArrived(false);
                      const startNode = NODES.find(n => n.id === currentLocationId);
                      if (startNode?.buildingId === 'academic-a' && node.buildingId === 'academic-a') {
                        setActiveViewTab('indoor');
                      } else {
                        setActiveViewTab('maps');
                      }
                    }}
                    className="w-full p-2.5 hover:bg-blue-50/70 text-left transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{node.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {node.buildingId.toUpperCase()} • {node.floorId === 'ground' ? 'Ground' : 'Floor 1'}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold uppercase">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Starting Location Card */}
          <div className="mt-3 p-3 bg-white rounded-2xl border border-slate-200 text-xs shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Starting Location:</span>
              <button
                onClick={() => setIsLocationPromptOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 hover:underline"
              >
                <Crosshair className="w-3 h-3" />
                <span>Change Origin</span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-extrabold text-slate-800 truncate">
                  {startNode?.name || currentLocationId}
                </span>
              </div>
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition shrink-0"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Route Summary Card */}
        {currentRoute && (
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Active Route
                </span>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  {destinationNode?.name || 'Selected Destination'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Building: <span className="font-semibold text-slate-700">{destinationNode?.buildingId.toUpperCase()}</span> ({destinationNode?.floorId === 'ground' ? 'Ground Floor' : 'Floor 1'})
                </p>
              </div>

              {/* Destination Changer & AR View Button */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => setIsDestinationPromptOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center gap-1 transition border border-blue-200"
                  title="Choose or Change Destination"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Change Target</span>
                </button>
                <button
                  onClick={() => setActiveViewTab('camera')}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm hover:opacity-95 transition"
                  title="View Live Camera AR Directional Guidance"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Start Camera AR</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">{currentRoute.distance} meters</div>
                  <div className="text-[10px] text-slate-500">Walk Distance</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">~{currentRoute.estimatedMinutes} min</div>
                  <div className="text-[10px] text-slate-500">Est. Time</div>
                </div>
              </div>
            </div>

            {/* Accessibility Mode Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <Accessibility className={`w-4 h-4 ${accessibleMode ? 'text-teal-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold text-slate-800">Accessible Mode</div>
                  <div className="text-[10px] text-slate-500">Uses elevators & ramps only, avoids stairs</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessibleMode}
                  onChange={(e) => {
                    setAccessibleMode(e.target.checked);
                    unityBridge.setAccessibilityMode(e.target.checked);
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* Turn-by-Turn Guidance Steps List */}
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Turn-by-Turn Directions
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {currentRoute?.instructions.length || 0} steps
            </span>
          </div>

          {currentRoute?.instructions && currentRoute.instructions.length > 0 ? (
            <div className="space-y-2.5 relative before:absolute before:top-3 before:bottom-3 before:left-[17px] before:w-0.5 before:bg-slate-200">
              {currentRoute.instructions.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-3 text-xs group">
                  {/* Step Icon Badge */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border z-10 ${
                    step.type === 'arrive'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : step.type === 'elevator'
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : step.type === 'stairs'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-white text-blue-600 border-slate-200 shadow-subtle'
                  }`}>
                    {step.type === 'arrive' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : step.type === 'elevator' ? (
                      <Layers className="w-4 h-4" />
                    ) : (
                      <CornerDownRight className="w-4 h-4" />
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="flex-1 bg-slate-50/80 group-hover:bg-blue-50/50 p-2.5 rounded-xl border border-slate-200/60 transition">
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {step.text}
                    </p>
                    {step.distanceMeters > 0 && (
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Distance: {step.distanceMeters} meters
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              Select a destination to compute turn-by-turn guidance.
            </div>
          )}

          {/* Quick QR Badges Trigger Button */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => setIsQrDirectoryOpen(true)}
              className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-amber-600" />
              <span>Show All Checkpoint QRs</span>
            </button>
          </div>

          {/* Complete Navigation Button */}
          {currentRoute && (
            <button
              onClick={() => {
                setIsArrived(true);
                unityBridge.dispatchLocalEvent('unityNavigationCompleted', { status: 'arrived' });
              }}
              className="mt-3 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Destination Reached</span>
            </button>
          )}
        </div>
      </aside>

      {/* =========================================================================
          MAIN INTERACTIVE VIEWPORT (Google Maps / Indoor Floor Plan / Live Camera AR / 3D / Tour)
          ========================================================================= */}
      <main className="flex-1 flex flex-col p-4 overflow-hidden relative">
        {/* View Mode Switcher Header */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-subtle">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {/* Tab 1: Google Maps Outdoor Route */}
            <button
              onClick={() => setActiveViewTab('maps')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeViewTab === 'maps'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Google Maps Outdoor</span>
            </button>

            {/* Tab 2: Indoor Floor Plan */}
            <button
              onClick={() => setActiveViewTab('indoor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeViewTab === 'indoor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Indoor Floor Plan</span>
            </button>

            {/* Tab 3: Live Camera AR Guidance */}
            <button
              onClick={() => setActiveViewTab('camera')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeViewTab === 'camera'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera AR</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* Tab 4: Unity 3D Campus */}
            <button
              onClick={() => setActiveViewTab('3d')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeViewTab === '3d'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Unity 3D Campus</span>
            </button>

            {/* Tab 5: 360 Tour - Reference Only */}
            <button
              onClick={() => setActiveViewTab('tour')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeViewTab === 'tour'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="360 Virtual Tour (Visual Reference Only)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>360° Tour <span className="text-[10px] font-normal opacity-85">(Ref Only)</span></span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDestinationPromptOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Select where you want to go"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Where to?</span>
            </button>
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>Scan QR</span>
            </button>
            <button
              onClick={() => setActiveViewTab('camera')}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Start AR</span>
            </button>
          </div>
        </div>

        {/* Viewport Render Container */}
        <div className="flex-1 relative w-full h-full min-h-[480px]">
          {/* Outdoor Route Map (Default for outdoor paths) */}
          {activeViewTab === 'maps' && (
            <GoogleMapsViewer
              currentRoute={currentRoute}
              selectedBuilding={selectedBuilding}
              onBuildingSelect={handleBuildingSelected}
              onStartCameraAR={() => setActiveViewTab('camera')}
            />
          )}

          {/* Indoor Floor Plan Route (Default for Academic Block A rooms) */}
          {activeViewTab === 'indoor' && (
            <IndoorFloorMap
              floorId={selectedFloor}
              onFloorChange={(f) => {
                setSelectedFloor(f);
                unityBridge.setSelectedFloor(f);
              }}
              currentRoute={currentRoute}
              currentLocationId={currentLocationId}
              onStartCameraAR={() => setActiveViewTab('camera')}
            />
          )}

          {/* Live Camera AR Navigation */}
          {activeViewTab === 'camera' && (
            <LiveCameraARViewer
              currentRoute={currentRoute}
              onOpenQRScanner={() => setIsQrModalOpen(true)}
              onOpenTourReference={() => setActiveViewTab('tour')}
              onCompleteNavigation={() => setIsArrived(true)}
              onSwitchTab={(tab) => setActiveViewTab(tab)}
            />
          )}

          {/* Secondary View: 360 Tour for Visual Reference Only */}
          {activeViewTab === 'tour' && (
            <ImmersiveTourViewer
              currentRoute={currentRoute}
              selectedBuilding={selectedBuilding}
              onBuildingSelect={handleBuildingSelected}
              onCompleteNavigation={() => setIsArrived(true)}
              onBackToCamera={() => setActiveViewTab('camera')}
            />
          )}

          {/* Secondary View: Unity 3D Campus */}
          {activeViewTab === '3d' && (
            <UnityViewer
              currentRoute={currentRoute}
              selectedBuilding={selectedBuilding}
              selectedFloor={selectedFloor}
              onBuildingSelect={handleBuildingSelected}
              onNavigationComplete={() => setIsArrived(true)}
            />
          )}
        </div>

        {/* Arrival Toast / Modal Banner */}
        {isArrived && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-white p-4 rounded-2xl border border-emerald-200 shadow-elevated flex items-center gap-3 animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Destination Reached!</h4>
              <p className="text-xs text-slate-500">
                You have successfully arrived at {destinationNode?.name || 'your target'}.
              </p>
            </div>
            <button
              onClick={() => setIsArrived(false)}
              className="text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold transition ml-2"
            >
              Dismiss
            </button>
          </div>
        )}
      </main>

      {/* Post-QR Destination Selection Prompt Modal */}
      <DestinationPromptModal
        isOpen={isDestinationPromptOpen}
        onClose={() => setIsDestinationPromptOpen(false)}
        currentPlace={{
          nodeId: currentLocationId,
          name: startNode?.name || currentLocationId,
          buildingId: startNode?.buildingId || selectedBuilding || 'campus',
          floorId: startNode?.floorId || selectedFloor || 'ground'
        }}
        accessibleMode={accessibleMode}
        onToggleAccessible={(acc) => {
          setAccessibleMode(acc);
          unityBridge.setAccessibilityMode(acc);
        }}
        onSelectDestination={handleSelectDestinationFromPrompt}
      />

      {/* Origin & Trip Planning Wizard Modal */}
      <LocationPromptModal
        isOpen={isLocationPromptOpen}
        onClose={() => setIsLocationPromptOpen(false)}
        currentStartId={currentLocationId}
        currentDestId={destinationId}
        onConfirmTrip={handleConfirmTripFromModal}
        onOpenScanner={() => setIsQrModalOpen(true)}
      />

      {/* Camera QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onScanSuccess={handleQrCheckpointScanned}
      />

      {/* Printable QR Checkpoint Directory Modal */}
      <QRGeneratorDirectory
        isOpen={isQrDirectoryOpen}
        onClose={() => setIsQrDirectoryOpen(false)}
        onSelectCheckpoint={(nodeId) => {
          setCurrentLocationId(nodeId);
          setIsArrived(false);
          setIsDestinationPromptOpen(true);
        }}
      />

      {/* Fullscreen Camera AR Guidance Modal */}
      <CameraARGuidance
        isOpen={isArModalOpen}
        onClose={() => setIsArModalOpen(false)}
        currentRoute={currentRoute}
        onArrived={() => setIsArrived(true)}
      />
    </div>
  );
};
