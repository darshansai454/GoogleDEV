import React, { useState } from 'react';
import { CampusNode, QRCheckpoint } from '../types/campus';
import { NODES } from '../data/campusData';
import { 
  MapPin, 
  Search, 
  ArrowRight, 
  Compass, 
  X, 
  CheckCircle, 
  Navigation, 
  Accessibility, 
  Building2, 
  Layers, 
  Sparkles,
  Camera
} from 'lucide-react';

interface DestinationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlace: {
    nodeId: string;
    name: string;
    buildingId?: string;
    floorId?: string;
  } | null;
  accessibleMode: boolean;
  onToggleAccessible: (enabled: boolean) => void;
  onSelectDestination: (destinationNodeId: string) => void;
}

export const DestinationPromptModal: React.FC<DestinationPromptModalProps> = ({
  isOpen,
  onClose,
  currentPlace,
  accessibleMode,
  onToggleAccessible,
  onSelectDestination
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'academic' | 'facility' | 'office'>('all');

  if (!isOpen || !currentPlace) return null;

  // Filter out the current node from destination choices
  const candidateDestinations = NODES.filter(n => 
    n.id !== currentPlace.nodeId &&
    (n.nodeType === 'classroom' || 
     n.nodeType === 'lab' || 
     n.nodeType === 'office' || 
     n.nodeType === 'facility' || 
     n.nodeType === 'entrance' ||
     n.nodeType === 'parking')
  );

  const filteredDestinations = candidateDestinations.filter(d => {
    const matchesQuery = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;

    if (filterType === 'academic') {
      return d.nodeType === 'classroom' || d.nodeType === 'lab';
    }
    if (filterType === 'facility') {
      return d.nodeType === 'facility' || d.nodeType === 'parking';
    }
    if (filterType === 'office') {
      return d.nodeType === 'office' || d.id === 'A-FACULTY';
    }

    return true;
  });

  const popularDestinations = [
    {
      id: 'computer-lab-a202',
      name: 'Computer Lab A-202 (AI & Coding)',
      building: 'Academic Block A',
      floor: 'Floor 1 (Level 1)',
      icon: '💻',
      badge: 'Popular'
    },
    {
      id: 'A-ROOM-101',
      name: 'Lecture Hall A-101',
      building: 'Academic Block A',
      floor: 'Ground Floor',
      icon: '🎓',
      badge: 'Classes'
    },
    {
      id: 'LIB-READING',
      name: 'Central Library Silent Hub',
      building: 'Central Library',
      floor: 'Ground Floor',
      icon: '📚',
      badge: 'Study'
    },
    {
      id: 'ADMISSIONS',
      name: 'Admissions & Registrar Desk',
      building: 'Admin Block',
      floor: 'Ground Floor',
      icon: '🏛️',
      badge: 'Inquiries'
    },
    {
      id: 'CAFE-ENTRANCE',
      name: 'Student Cafeteria & Food Court',
      building: 'Food Court',
      floor: 'Ground Floor',
      icon: '☕',
      badge: 'Dining'
    },
    {
      id: 'AUDIT-ENTRANCE',
      name: 'Grand Auditorium Entry',
      building: 'Auditorium',
      floor: 'Ground Floor',
      icon: '🎭',
      badge: 'Events'
    }
  ];

  const handleSelect = (destId: string) => {
    onSelectDestination(destId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Scanned Location Badge */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0 mt-0.5">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  QR Location Confirmed
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight mt-1">
                You are at: {currentPlace.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {currentPlace.buildingId ? currentPlace.buildingId.toUpperCase() : 'CAMPUS'} • {currentPlace.floorId === 'first' ? 'Floor 1' : 'Ground Level'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Question Callout */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Where would you like to go from here?
              </h4>
              <p className="text-xs text-slate-500">
                Choose a destination to launch turn-by-turn Live Camera AR wayfinding.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 focus-within:border-blue-600 p-2.5 transition">
              <Search className="w-4 h-4 text-slate-400 ml-1 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Search classroom, lab, auditorium, library, cafeteria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-0.5 text-xs sm:text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400 font-medium"
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
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Places ({candidateDestinations.length})
            </button>
            <button
              onClick={() => setFilterType('academic')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                filterType === 'academic'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Classrooms & Labs
            </button>
            <button
              onClick={() => setFilterType('office')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                filterType === 'office'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Offices & Faculty
            </button>
            <button
              onClick={() => setFilterType('facility')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                filterType === 'facility'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Facilities & Dining
            </button>
          </div>

          {/* Quick Popular Picks (if no search query) */}
          {!searchQuery.trim() && (
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                Popular Destinations:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {popularDestinations.map((pop) => (
                  <button
                    key={pop.id}
                    onClick={() => handleSelect(pop.id)}
                    className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/70 hover:border-blue-300 text-left transition flex items-center justify-between group shadow-subtle"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-xl shrink-0">{pop.icon}</span>
                      <div className="truncate">
                        <div className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 truncate">
                          {pop.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {pop.building} • {pop.floor}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results List */}
          {searchQuery.trim() && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Matching Results ({filteredDestinations.length}):
              </span>
              {filteredDestinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => handleSelect(dest.id)}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/70 hover:border-blue-400 text-left transition flex items-center justify-between group shadow-subtle"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                      {dest.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {dest.buildingId.toUpperCase()} • {dest.floorId === 'ground' ? 'Ground Floor' : 'Floor 1'}
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white font-bold transition flex items-center gap-1 shadow-sm">
                    <span>Navigate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}

              {filteredDestinations.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No campus destinations found matching "{searchQuery}".
                </div>
              )}
            </div>
          )}

          {/* Accessibility Option */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Accessibility className={`w-4 h-4 ${accessibleMode ? 'text-teal-600' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold text-slate-800">Wheelchair Accessible Route</div>
                <div className="text-[10px] text-slate-500">Uses elevators & ramps, avoids stairs</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={accessibleMode}
                onChange={(e) => onToggleAccessible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>Opens directly in Live Camera AR Mode</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 text-slate-500 hover:text-slate-800 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
