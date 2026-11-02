import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { NODES, BUILDINGS, QR_CHECKPOINTS } from '../data/campusData';
import { CampusNode } from '../types/campus';
import { 
  QrCode, 
  Printer, 
  Download, 
  Check, 
  MapPin, 
  Layers, 
  Building2, 
  X, 
  Sparkles,
  ExternalLink,
  Smartphone,
  Copy,
  CheckCircle,
  Compass
} from 'lucide-react';

interface QRGeneratorDirectoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCheckpoint?: (nodeId: string) => void;
}

interface GeneratedQRItem {
  node: CampusNode;
  dataUrl: string;
  mobileUrl: string;
  payloadJson: string;
}

export const QRGeneratorDirectory: React.FC<QRGeneratorDirectoryProps> = ({
  isOpen,
  onClose,
  onSelectCheckpoint
}) => {
  const [qrItems, setQrItems] = useState<GeneratedQRItem[]>([]);
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Default to LAN IP if on localhost so mobile phone camera scans resolve to the host PC
  const defaultHost = typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://10.2.19.118:5174'
      : window.location.origin
    : 'http://10.2.19.118:5174';

  const [scanBaseUrl, setScanBaseUrl] = useState<string>(defaultHost);

  // Generate real QR codes on mount or when base URL changes
  useEffect(() => {
    const generateAllQRs = async () => {
      // Pick all entrances, checkpoints, classrooms, labs, offices, and facilities
      const relevantNodes = NODES.filter(
        n => n.nodeType === 'entrance' || 
             n.nodeType === 'elevator' || 
             n.nodeType === 'corridor' || 
             n.nodeType === 'lab' || 
             n.nodeType === 'classroom' || 
             n.nodeType === 'office' || 
             n.nodeType === 'gate' || 
             n.nodeType === 'facility' || 
             n.nodeType === 'parking'
      );

      const items: GeneratedQRItem[] = [];

      for (const node of relevantNodes) {
        // Build clean mobile-scannable web URL
        const cleanBase = scanBaseUrl.replace(/\/+$/, '');
        const mobileTargetUrl = `${cleanBase}/?checkpoint=${encodeURIComponent(node.id)}&building=${encodeURIComponent(node.buildingId)}&floor=${encodeURIComponent(node.floorId || 'ground')}`;

        const payloadObj = {
          campusId: 'alliance-central',
          buildingId: node.buildingId,
          floorId: node.floorId || 'ground',
          nodeId: node.id,
          name: node.name,
          url: mobileTargetUrl
        };
        const payloadString = JSON.stringify(payloadObj);

        try {
          // Encode the mobileTargetUrl so ANY smartphone camera app (iOS Camera, Google Lens) opens it!
          const url = await QRCode.toDataURL(mobileTargetUrl, {
            width: 256,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: {
              dark: '#0F172A',
              light: '#FFFFFF'
            }
          });

          items.push({
            node,
            dataUrl: url,
            mobileUrl: mobileTargetUrl,
            payloadJson: payloadString
          });
        } catch (e) {
          console.error('QR generation error for node:', node.id, e);
        }
      }

      setQrItems(items);
    };

    if (isOpen) {
      generateAllQRs();
    }
  }, [isOpen, scanBaseUrl]);

  if (!isOpen) return null;

  const filteredItems = filterBuilding === 'all'
    ? qrItems
    : qrItems.filter(item => item.node.buildingId === filterBuilding);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = (item: GeneratedQRItem) => {
    navigator.clipboard.writeText(item.mobileUrl);
    setCopiedId(item.node.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSimulateScan = (nodeId: string) => {
    if (onSelectCheckpoint) {
      onSelectCheckpoint(nodeId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                  Mobile QR Checkpoint Badges
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Phone Camera Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Print or scan on a mobile phone to jump straight to live navigation
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-subtle"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print All Badges</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Scanning Base URL Configuration Bar */}
        <div className="px-5 py-3 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-bold">Mobile Target Host:</span>
            <input
              type="text"
              value={scanBaseUrl}
              onChange={(e) => setScanBaseUrl(e.target.value)}
              className="px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs font-mono font-medium text-slate-900 w-60 sm:w-72 outline-none focus:border-blue-500"
              placeholder="http://10.2.19.118:5174"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setScanBaseUrl('http://10.2.19.118:5174')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition text-[11px] ${
                scanBaseUrl === 'http://10.2.19.118:5174'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Wi-Fi LAN (10.2.19.118)
            </button>
            <button
              onClick={() => setScanBaseUrl(window.location.origin)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition text-[11px] ${
                scanBaseUrl === window.location.origin
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Current Browser Host
            </button>
          </div>
        </div>

        {/* Building Filter Tabs */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Filter:
          </span>
          <button
            onClick={() => setFilterBuilding('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
              filterBuilding === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Checkpoints ({qrItems.length})
          </button>
          <button
            onClick={() => setFilterBuilding('academic-a')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
              filterBuilding === 'academic-a'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Academic Block A
          </button>
          <button
            onClick={() => setFilterBuilding('campus')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
              filterBuilding === 'campus'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Gates & Outdoor Spine
          </button>
          <button
            onClick={() => setFilterBuilding('library')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
              filterBuilding === 'library'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setFilterBuilding('cafeteria')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
              filterBuilding === 'cafeteria'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cafeteria
          </button>
          <button
            onClick={() => setFilterBuilding('admin')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
              filterBuilding === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Admin Block
          </button>
        </div>

        {/* QR Badges Grid Container */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.node.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle hover:shadow-card transition flex flex-col items-center text-center relative group"
              >
                {/* Node Type Badge */}
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {item.node.buildingId.toUpperCase()} • {item.node.floorId === 'first' ? 'Floor 1' : 'Ground'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">
                    {item.node.id}
                  </span>
                </div>

                {/* Scannable QR Code Image */}
                <div className="w-48 h-48 bg-white p-2 border-2 border-slate-200 rounded-2xl shadow-sm flex items-center justify-center my-2 group-hover:border-blue-400 transition">
                  <img
                    src={item.dataUrl}
                    alt={`QR Code for ${item.node.name}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Location Name & Details */}
                <h4 className="text-sm font-extrabold text-slate-900 leading-tight mt-1 mb-1 line-clamp-1">
                  {item.node.name}
                </h4>
                <p className="text-[11px] text-slate-500 mb-3 line-clamp-2">
                  {item.node.description || 'Scan with phone camera to begin live navigation.'}
                </p>

                {/* Mobile scan URL hint */}
                <div className="w-full bg-slate-50 p-1.5 rounded-lg border border-slate-200/80 text-[10px] text-slate-500 font-mono truncate mb-3 text-left">
                  {item.mobileUrl}
                </div>

                {/* Actions Footer */}
                <div className="w-full flex items-center gap-1.5 mt-auto pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleSimulateScan(item.node.id)}
                    className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold shadow-sm transition flex items-center justify-center gap-1"
                    title="Simulate scanning this checkpoint on this device"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Test Scan</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(item)}
                    className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 ${
                      copiedId === item.node.id
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title="Copy direct mobile URL"
                  >
                    {copiedId === item.node.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Help Banner */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              <strong>Tip:</strong> Open your iPhone or Android <strong>Camera app</strong> and point it at any badge above. It will detect the link instantly!
            </span>
          </div>
          <span className="text-slate-400 font-medium hidden sm:inline">
            Total {filteredItems.length} active checkpoint badges
          </span>
        </div>
      </div>
    </div>
  );
};
