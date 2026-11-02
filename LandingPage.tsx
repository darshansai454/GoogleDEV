import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  ArrowRight, 
  Box, 
  MapPin, 
  QrCode, 
  Accessibility, 
  Camera, 
  Layers, 
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { NODES } from '../data/campusData';

interface LandingPageProps {
  onStartNavigation: (destinationId?: string) => void;
  onOpen3DCampus: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartNavigation,
  onOpen3DCampus
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const destinations = NODES.filter(
    n => n.nodeType === 'classroom' || n.nodeType === 'lab' || n.nodeType === 'office' || n.nodeType === 'facility'
  );

  const filteredDestinations = searchQuery.trim()
    ? destinations.filter(
        d =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="w-full bg-[#F8FAFC] text-[#172554] flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl px-6 pt-16 pb-20 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Campus Innovation Challenge 2026 Prototype</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#172554] max-w-3xl leading-[1.15] mb-6">
          Navigate Any Campus with{' '}
          <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Real 3D Wayfinding
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#64748B] max-w-2xl font-normal leading-relaxed mb-8">
          CampusNav AI blends interactive Unity 3D WebGL, indoor multi-floor pathfinding,
          QR checkpoint localization, and accessible step-by-step guidance.
        </p>

        {/* Central Search Bar */}
        <div className="w-full max-w-xl relative mb-6">
          <div className="flex items-center bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 focus-within:border-blue-600 shadow-card p-2 transition">
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search classrooms, labs, admissions, library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-sm font-medium"
            />
            <button
              onClick={() => onStartNavigation(searchQuery ? filteredDestinations[0]?.id : 'computer-lab-a202')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide shadow-sm transition flex items-center gap-1.5 shrink-0"
            >
              <span>Find</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search Suggestions Dropdown */}
          {filteredDestinations.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-elevated z-30 overflow-hidden text-left divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {filteredDestinations.slice(0, 5).map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => onStartNavigation(dest.id)}
                  className="w-full px-4 py-3 hover:bg-blue-50/70 flex items-center justify-between text-left group transition"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                      {dest.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {dest.buildingId.toUpperCase()} • {dest.floorId === 'ground' ? 'Ground Floor' : 'Floor 1'}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button
            onClick={() => onStartNavigation('computer-lab-a202')}
            className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Start Navigation (Demo Target: Lab A-202)</span>
          </button>
          <button
            onClick={onOpen3DCampus}
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-card hover:border-slate-300 transition flex items-center gap-2"
          >
            <Box className="w-4 h-4 text-blue-600" />
            <span>Explore 3D Campus Environment</span>
          </button>
        </div>

        {/* Popular Destination Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-400">Popular:</span>
          <button
            onClick={() => onStartNavigation('computer-lab-a202')}
            className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition shadow-subtle"
          >
            🎯 Computer Lab A-202
          </button>
          <button
            onClick={() => onStartNavigation('LIB-READING')}
            className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition shadow-subtle"
          >
            📚 Central Library
          </button>
          <button
            onClick={() => onStartNavigation('ADMISSIONS')}
            className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition shadow-subtle"
          >
            🏢 Admissions & Registrar
          </button>
          <button
            onClick={() => onStartNavigation('CAFE-ENTRANCE')}
            className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition shadow-subtle"
          >
            ☕ Student Cafeteria
          </button>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="w-full max-w-6xl px-6 py-16 border-t border-slate-200/60">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172554] mb-3">
            Built for Modern Smart Campuses
          </h2>
          <p className="text-sm text-[#64748B] max-w-xl mx-auto">
            Everything new students, visitors, and parents need to find any facility in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card hover:shadow-elevated transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4">
              <Box className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Unity 3D Campus Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore buildings, roads, and outdoor pathways in real-time 3D with smooth orbit rotation,
              animated route paths, and directional beacons.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card hover:shadow-elevated transition">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Indoor Multi-Floor Dijkstra</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Seamlessly navigate between floors using stairs or elevators, with full indoor floor plan
              overlays for complex buildings like Academic Block A.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card hover:shadow-elevated transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
              <Accessibility className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Accessible Wheelchair Routing</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              1-tap accessibility mode recomputes Dijkstra paths to strictly prefer ramps and elevators
              while avoiding all staircases.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card hover:shadow-elevated transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Instant QR Checkpoints</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Scan door or corridor QR codes with your device camera to instantly localize yourself
              and dynamically update the 3D route.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card hover:shadow-elevated transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AR-Style Camera Guidance</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Follow animated directional arrows directly over the live camera feed with next-step turn
              banners and distance meters.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card hover:shadow-elevated transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Dual Firebase & Local Fallback</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Built for production with Firestore data sync, plus guaranteed offline in-memory fallback
              so your hackathon demo never breaks.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-4xl px-6 py-16 border-t border-slate-200/60 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-10">4 Steps to Your Destination</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">1</div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Pick Destination</h4>
            <p className="text-xs text-slate-500">Search room name or tap on 3D building.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">2</div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Scan Checkpoint</h4>
            <p className="text-xs text-slate-500">Scan QR on wall to detect your location.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">3</div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Follow 3D Route</h4>
            <p className="text-xs text-slate-500">Watch animated path & elevator transitions.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">4</div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Arrive Safely</h4>
            <p className="text-xs text-slate-500">Receive turn-by-turn or AR camera guidance.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
