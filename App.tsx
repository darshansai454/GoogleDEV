import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { NavigationPage } from './pages/NavigationPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { QRGeneratorDirectory } from './components/QRGeneratorDirectory';
import { 
  Compass, 
  MapPin, 
  Box, 
  ShieldCheck, 
  Sparkles,
  QrCode,
  ExternalLink,
  Camera,
  CheckCircle2
} from 'lucide-react';

export function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'navigation' | 'admin'>('landing');
  const [selectedDestination, setSelectedDestination] = useState<string>('computer-lab-a202');
  const [initialStartId, setInitialStartId] = useState<string | undefined>(undefined);
  const [isQrDirectoryOpen, setIsQrDirectoryOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check URL query parameters on initial page load (e.g. from mobile phone camera scan)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const checkpoint = params.get('checkpoint') || params.get('start') || params.get('nodeId') || params.get('node');
    const dest = params.get('destination') || params.get('dest');

    if (dest) {
      setSelectedDestination(dest);
    }

    if (checkpoint) {
      setInitialStartId(checkpoint);
      setCurrentPage('navigation');
      setToastMessage(`📍 Checkpoint Identified: ${checkpoint}`);
      setTimeout(() => setToastMessage(null), 5000);
    }
  }, []);

  const handleStartNavigation = (destinationId: string = 'computer-lab-a202') => {
    setSelectedDestination(destinationId);
    setCurrentPage('navigation');
  };

  const handleCheckpointSelectedFromQR = (nodeId: string) => {
    setInitialStartId(nodeId);
    setSelectedDestination('computer-lab-a202');
    setCurrentPage('navigation');
    setToastMessage(`📍 Checkpoint Selected: ${nodeId}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172554] flex flex-col font-sans">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div 
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-blue-600">
                <Compass className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-base font-extrabold text-[#172554] flex items-center gap-1.5">
                <span>CampusNav AI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live AR Camera
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Alliance University • Smart Campus</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentPage('landing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                currentPage === 'landing'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('navigation')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentPage === 'navigation'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live AR Navigation</span>
            </button>
            <button
              onClick={() => setIsQrDirectoryOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-sm transition flex items-center gap-1.5"
              title="View & Print All Campus QR Checkpoints"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-600" />
              <span>Printable QR Badges</span>
            </button>
            <button
              onClick={() => setCurrentPage('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentPage === 'admin'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Floating Checkpoint Detection Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-elevated flex items-center gap-2.5 text-xs font-bold animate-fadeIn border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col">
        {currentPage === 'landing' && (
          <LandingPage
            onStartNavigation={handleStartNavigation}
            onOpen3DCampus={() => setCurrentPage('navigation')}
          />
        )}
        {currentPage === 'navigation' && (
          <NavigationPage 
            initialStartId={initialStartId}
            initialDestinationId={selectedDestination} 
          />
        )}
        {currentPage === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Printable QR Checkpoint Badges Modal */}
      <QRGeneratorDirectory
        isOpen={isQrDirectoryOpen}
        onClose={() => setIsQrDirectoryOpen(false)}
        onSelectCheckpoint={handleCheckpointSelectedFromQR}
      />
    </div>
  );
}

export default App;
