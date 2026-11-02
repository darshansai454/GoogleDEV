import React, { useState, useEffect, useRef } from 'react';
import { CampusNode, CampusEdge, QRCheckpoint } from '../types/campus';
import { BUILDINGS, NODES, EDGES, QR_CHECKPOINTS } from '../data/campusData';
import { addNode, deleteNode, resetDemoData, isFirebaseConfigured } from '../services/firebase';
import { photoManager, LANDMARK_DEFINITIONS, LandmarkPhotoMeta } from '../services/photoManager';
import { 
  Building2, 
  MapPin, 
  Link, 
  QrCode, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Accessibility, 
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  FolderOpen,
  Camera,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [nodes, setNodes] = useState<CampusNode[]>([...NODES]);
  const [edges, setEdges] = useState<CampusEdge[]>([...EDGES]);
  const [activeTab, setActiveTab] = useState<'photos' | 'nodes' | 'edges' | 'checkpoints'>('photos');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [photoUpdateTrigger, setPhotoUpdateTrigger] = useState<number>(0);

  // Hidden file input for uploading landmark photo
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // New Node Form State
  const [newNodeId, setNewNodeId] = useState('');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeBuilding, setNewNodeBuilding] = useState('academic-a');
  const [newNodeFloor, setNewNodeFloor] = useState('ground');
  const [newNodeType, setNewNodeType] = useState<any>('classroom');
  const [newNodeAccessible, setNewNodeAccessible] = useState(true);

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeId || !newNodeName) return;

    const node: CampusNode = {
      id: newNodeId.trim(),
      name: newNodeName.trim(),
      buildingId: newNodeBuilding,
      floorId: newNodeFloor,
      x: 50,
      y: 50,
      nodeType: newNodeType,
      accessible: newNodeAccessible,
      tags: [newNodeType, newNodeBuilding]
    };

    const updated = addNode(node);
    setNodes(updated);
    setNewNodeId('');
    setNewNodeName('');
    showStatus(`Node "${node.name}" created successfully.`);
  };

  const handleDeleteNode = (id: string) => {
    const updated = deleteNode(id);
    setNodes(updated);
    showStatus(`Node ${id} deleted.`);
  };

  const handleResetData = () => {
    if (confirm('Reset all nodes, edges, and checkpoints back to original seed data?')) {
      const data = resetDemoData();
      setNodes(data.nodes);
      setEdges(data.edges);
      showStatus('Campus dataset reset to factory seed.');
    }
  };

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Trigger file upload for a specific landmark
  const handleTriggerUpload = (landmarkId: string) => {
    setActiveUploadId(landmarkId);
    fileInputRef.current?.click();
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadId) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      photoManager.setCustomPhoto(activeUploadId, base64);
      setPhotoUpdateTrigger(prev => prev + 1);
      showStatus(`Photo updated for "${activeUploadId}". It is now active across the app!`);
      setActiveUploadId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = (landmarkId: string) => {
    photoManager.resetPhoto(landmarkId);
    setPhotoUpdateTrigger(prev => prev + 1);
    showStatus(`Photo for "${landmarkId}" reset to default asset.`);
  };

  return (
    <div className="w-full flex-1 max-w-6xl mx-auto p-6 bg-[#F8FAFC]">
      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handlePhotoFileChange}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900">Campus Administration</h1>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              isFirebaseConfigured()
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {isFirebaseConfigured() ? 'Cloud Firestore' : 'In-Memory Demo Engine'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Upload custom college photography, manage navigation waypoints, connectivity edges, and QR markers.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-subtle flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Factory Seed</span>
        </button>
      </div>

      {/* Toast Notification */}
      {statusMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-subtle animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'photos'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Campus Photos & Landmarks ({LANDMARK_DEFINITIONS.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('nodes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'nodes'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Nodes / Waypoints ({nodes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('edges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'edges'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Link className="w-4 h-4" />
          <span>Graph Edges ({edges.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('checkpoints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'checkpoints'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR Checkpoints ({QR_CHECKPOINTS.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: CAMPUS PHOTOS & LANDMARKS MANAGER
          ========================================================================= */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          {/* Instructions Guide Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-slate-900">
                  How to Add Your College Photos
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  You can upload your photos in two easy ways:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-slate-700">
                    <strong className="text-blue-900 block mb-1">Option 1: In-App Upload (Instant)</strong>
                    Click <strong>"Upload Photo"</strong> on any block below to select a photo from your phone or PC. It will be stored and used in Live Camera AR navigation immediately.
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900 block mb-1">Option 2: Direct File Drop</strong>
                    Place your photo files directly into this workspace folder:
                    <code className="block mt-1 p-1 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-800 break-all select-all">
                      C:\Users\darsh\.gemini\antigravity-ide\scratch\campusnav-ai\public\photos\
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Landmark Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LANDMARK_DEFINITIONS.map((landmark) => {
              const currentPhoto = photoManager.getPhoto(landmark.id);
              const isCustom = photoManager.isCustom(landmark.id);

              return (
                <div
                  key={landmark.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-subtle hover:shadow-card transition flex flex-col overflow-hidden"
                >
                  {/* Photo Preview */}
                  <div className="relative w-full h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={currentPhoto}
                      alt={landmark.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border ${
                        isCustom
                          ? 'bg-emerald-500/90 text-white border-emerald-400'
                          : 'bg-black/60 text-white/90 border-white/20'
                      }`}>
                        {isCustom ? 'Custom Upload Active' : 'Default Asset'}
                      </span>
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {landmark.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {landmark.description}
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-200/80">
                        File: <strong className="text-slate-900">{landmark.defaultPath.replace('/photos/', '')}</strong>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleTriggerUpload(landmark.id)}
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      {isCustom && (
                        <button
                          onClick={() => handleResetPhoto(landmark.id)}
                          className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                          title="Reset to default asset"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: NODES / WAYPOINTS
          ========================================================================= */}
      {activeTab === 'nodes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Node Form */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-subtle lg:col-span-1">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Add New Node</span>
            </h3>
            <form onSubmit={handleAddNode} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Node Identifier (Unique ID):</label>
                <input
                  type="text"
                  placeholder="e.g. A-ROOM-105"
                  value={newNodeId}
                  onChange={e => setNewNodeId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Location Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Robotics & IoT Lab"
                  value={newNodeName}
                  onChange={e => setNewNodeName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Building:</label>
                <select
                  value={newNodeBuilding}
                  onChange={e => setNewNodeBuilding(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                >
                  {BUILDINGS.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Floor Level:</label>
                <select
                  value={newNodeFloor}
                  onChange={e => setNewNodeFloor(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                >
                  <option value="ground">Ground Floor</option>
                  <option value="first">First Floor (Level 1)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Node Type:</label>
                <select
                  value={newNodeType}
                  onChange={e => setNewNodeType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                >
                  <option value="classroom">Classroom</option>
                  <option value="lab">Laboratory</option>
                  <option value="office">Office / Cabin</option>
                  <option value="corridor">Corridor Junction</option>
                  <option value="elevator">Elevator Foyer</option>
                  <option value="facility">Campus Facility</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="accNode"
                  checked={newNodeAccessible}
                  onChange={e => setNewNodeAccessible(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="accNode" className="font-semibold text-slate-700">
                  Wheelchair Accessible Node
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition"
              >
                Create Waypoint Node
              </button>
            </form>
          </div>

          {/* Node List Table */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-subtle lg:col-span-2 overflow-x-auto">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">
              Registered Campus Waypoints ({nodes.length})
            </h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Node ID</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Building</th>
                  <th className="pb-2">Floor</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {nodes.map(n => (
                  <tr key={n.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 font-mono font-bold text-slate-900">{n.id}</td>
                    <td className="py-2.5 font-semibold">{n.name}</td>
                    <td className="py-2.5 uppercase text-[11px] text-slate-500">{n.buildingId}</td>
                    <td className="py-2.5 capitalize text-[11px]">{n.floorId}</td>
                    <td className="py-2.5 capitalize text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {n.nodeType}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleDeleteNode(n.id)}
                        className="text-red-500 hover:text-red-700 p-1 transition"
                        title="Delete Node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: GRAPH EDGES
          ========================================================================= */}
      {activeTab === 'edges' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-subtle overflow-x-auto">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4">
            Dijkstra Connectivity Edges ({edges.length})
          </h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-2">From Node</th>
                <th className="pb-2">To Node</th>
                <th className="pb-2">Distance</th>
                <th className="pb-2">Connection Type</th>
                <th className="pb-2">Wheelchair Safe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {edges.map((e, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2.5 font-mono font-bold text-slate-900">{e.from}</td>
                  <td className="py-2.5 font-mono font-bold text-slate-900">{e.to}</td>
                  <td className="py-2.5">{e.distance} m</td>
                  <td className="py-2.5 capitalize">{e.connectionType}</td>
                  <td className="py-2.5">
                    {e.accessible ? (
                      <span className="text-teal-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Yes</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold">Stairs Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          TAB 4: QR CHECKPOINTS
          ========================================================================= */}
      {activeTab === 'checkpoints' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-subtle overflow-x-auto">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4">
            Configured QR Checkpoints ({QR_CHECKPOINTS.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {QR_CHECKPOINTS.map(cp => (
              <div key={cp.nodeId} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {cp.buildingId}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{cp.nodeId}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{cp.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Floor: {cp.floorId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
