import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, CameraDevice } from 'html5-qrcode';
import { QRCheckpoint } from '../types/campus';
import { QR_CHECKPOINTS, NODES } from '../data/campusData';
import { 
  QrCode, 
  X, 
  Camera, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Upload, 
  RefreshCw,
  Search,
  FlipHorizontal
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (checkpoint: QRCheckpoint) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState<boolean>(false);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState<number>(0);
  const [demoSearchQuery, setDemoSearchQuery] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Parse scanned payload: URL, JSON, query parameter, or raw node ID
  const parsePayload = (text: string): QRCheckpoint | null => {
    let resolvedNodeId = text.trim();

    // 1. URL parsing (e.g., http://10.2.19.118:5174/?checkpoint=A-ENTRANCE)
    if (text.startsWith('http://') || text.startsWith('https://') || text.includes('?')) {
      try {
        const urlObj = new URL(text, window.location.origin);
        const cpParam = urlObj.searchParams.get('checkpoint') ||
                        urlObj.searchParams.get('start') ||
                        urlObj.searchParams.get('nodeId') ||
                        urlObj.searchParams.get('node');
        if (cpParam) {
          resolvedNodeId = cpParam;
        }
      } catch (e) {
        const match = text.match(/[?&](checkpoint|start|nodeId|node)=([^&]+)/i);
        if (match && match[2]) {
          resolvedNodeId = decodeURIComponent(match[2]);
        }
      }
    }

    // 2. JSON parsing (e.g., {"nodeId":"A-ENTRANCE"})
    if (text.startsWith('{')) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.nodeId) resolvedNodeId = parsed.nodeId;
      } catch (e) {}
    }

    // 3. Match against known checkpoints and nodes
    const foundCheckpoint = QR_CHECKPOINTS.find(c => c.nodeId === resolvedNodeId);
    if (foundCheckpoint) return foundCheckpoint;

    const foundNode = NODES.find(n => n.id === resolvedNodeId);
    if (foundNode) {
      return {
        campusId: 'alliance-central',
        buildingId: foundNode.buildingId,
        floorId: foundNode.floorId || 'ground',
        nodeId: foundNode.id,
        name: foundNode.name
      };
    }

    return {
      campusId: 'alliance-central',
      buildingId: 'academic-a',
      floorId: 'ground',
      nodeId: resolvedNodeId,
      name: `Checkpoint ${resolvedNodeId}`
    };
  };

  const handleDecoded = (decodedText: string) => {
    setScannedResult(decodedText);
    const checkpoint = parsePayload(decodedText);
    if (checkpoint) {
      stopCamera();
      onScanSuccess(checkpoint);
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (e) {}
      setIsScanningActive(false);
    }
  };

  // Start live camera scanning
  const startCameraScan = async () => {
    setScannerError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-container', {
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          },
          verbose: false
        });
      }

      const qrInstance = html5QrCodeRef.current;
      if (qrInstance.isScanning) {
        await qrInstance.stop();
      }

      // Check available cameras
      let cameras: CameraDevice[] = [];
      try {
        cameras = await Html5Qrcode.getCameras();
        setAvailableCameras(cameras);
      } catch (e) {
        console.warn('Could not enumerate cameras:', e);
      }

      let cameraConfig: any = { facingMode: 'environment' };

      if (cameras && cameras.length > 0) {
        // Find rear/back camera
        const backCamera = cameras.find(c => 
          c.label.toLowerCase().includes('back') || 
          c.label.toLowerCase().includes('rear') || 
          c.label.toLowerCase().includes('environment')
        );
        const activeCam = backCamera || cameras[selectedCameraIndex] || cameras[0];
        cameraConfig = activeCam.id;
      }

      await qrInstance.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: { width: 220, height: 220 }
        },
        (decodedText: string) => {
          handleDecoded(decodedText);
        },
        () => {
          // Scanner tick
        }
      );
      setIsScanningActive(true);
    } catch (err: any) {
      console.warn('QR camera start notice:', err);
      setIsScanningActive(false);
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        setScannerError('Camera permission not granted. Please allow camera access in browser, upload a photo, or tap a checkpoint below.');
      } else {
        setScannerError('Live video scan unavailable in this browser context. You can upload a photo of the QR or tap a checkpoint below.');
      }
    }
  };

  // Switch camera if multiple cameras are detected
  const handleSwitchCamera = async () => {
    if (availableCameras.length > 1) {
      const nextIndex = (selectedCameraIndex + 1) % availableCameras.length;
      setSelectedCameraIndex(nextIndex);
      await stopCamera();
      setTimeout(startCameraScan, 200);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    setScannerError(null);
    setScannedResult(null);

    const timer = setTimeout(() => {
      startCameraScan();
    }, 250);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [isOpen]);

  // File upload scanner fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScannerError(null);
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-container');
      }

      await stopCamera();
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      handleDecoded(decodedText);
    } catch (err: any) {
      console.warn('File QR decode notice:', err);
      setScannerError('Could not decode QR from that photo. Try holding closer or select from checkpoints below.');
    }
  };

  if (!isOpen) return null;

  // Filter demo checkpoints
  const filteredCheckpoints = QR_CHECKPOINTS.filter(cp =>
    cp.name.toLowerCase().includes(demoSearchQuery.toLowerCase()) ||
    cp.nodeId.toLowerCase().includes(demoSearchQuery.toLowerCase()) ||
    cp.buildingId.toLowerCase().includes(demoSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Scan Campus Checkpoint
              </h3>
              <p className="text-xs text-slate-500">Scan QR codes on walls, gates, or classrooms</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Scanner Viewport */}
          <div className="relative bg-slate-950 rounded-2xl p-2 border border-slate-800 overflow-hidden text-center min-h-[250px] flex flex-col items-center justify-center">
            {/* HTML5 QR Container */}
            <div id="qr-reader-container" className="w-full max-w-[280px] overflow-hidden rounded-xl" />

            {/* Error or Notice Banner */}
            {scannerError && (
              <div className="p-3 my-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2 text-left max-w-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{scannerError}</span>
              </div>
            )}

            {/* Success Overlay */}
            {scannedResult && (
              <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20 animate-fadeIn">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-lg">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white">QR Code Detected!</h4>
                <p className="text-xs text-emerald-200 mt-1 max-w-xs truncate">
                  {scannedResult}
                </p>
                <span className="text-[11px] text-emerald-300 mt-2 font-medium">
                  Setting your location and asking for destination...
                </span>
              </div>
            )}

            {/* Scanner Controls Under Video */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2 z-10">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-white/20 backdrop-blur-md"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload / Snap Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />

              {availableCameras.length > 1 && (
                <button
                  onClick={handleSwitchCamera}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-white/20 backdrop-blur-md"
                  title="Switch camera"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Switch Cam</span>
                </button>
              )}

              {!isScanningActive && (
                <button
                  onClick={startCameraScan}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restart Camera</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Checkpoint Selector with Search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Or Tap Current Location
              </span>
              <span className="text-[11px] text-blue-600 font-bold">1-Tap Select</span>
            </div>

            {/* Checkpoint Search Box */}
            <div className="relative mb-2">
              <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-2">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter checkpoints..."
                  value={demoSearchQuery}
                  onChange={(e) => setDemoSearchQuery(e.target.value)}
                  className="w-full text-xs bg-transparent outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {filteredCheckpoints.map((cp) => (
                <button
                  key={cp.nodeId}
                  onClick={() => {
                    stopCamera();
                    onScanSuccess(cp);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/70 hover:border-blue-400 text-left transition flex items-center justify-between group shadow-subtle"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                      {cp.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Node: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-semibold">{cp.nodeId}</code> • {cp.buildingId.toUpperCase()} ({cp.floorId})
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
