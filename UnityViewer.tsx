import React, { useEffect, useRef, useState } from 'react';
import { unityBridge } from '../services/unityBridge';
import { CampusBuilding, NavigationRoute } from '../types/campus';
import { BUILDINGS } from '../data/campusData';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Layers, 
  Eye, 
  Maximize2, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Navigation,
  Sparkles
} from 'lucide-react';

interface UnityViewerProps {
  currentRoute: NavigationRoute | null;
  selectedBuilding: string | null;
  selectedFloor: string;
  onBuildingSelect: (buildingId: string) => void;
  onNavigationComplete?: () => void;
}

export const UnityViewer: React.FC<UnityViewerProps> = ({
  currentRoute,
  selectedBuilding,
  selectedFloor,
  onBuildingSelect,
  onNavigationComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [loadStatus, setLoadStatus] = useState<string>('Initializing 3D Campus Engine...');
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cameraFollow, setCameraFollow] = useState<boolean>(true);
  const [viewAngle, setViewAngle] = useState<number>(35);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isRealUnityInstance, setIsRealUnityInstance] = useState<boolean>(false);

  // 3D Canvas Simulator state
  const simState = useRef({
    cameraYaw: 35,
    cameraPitch: 45,
    cameraZoom: 1.0,
    targetYaw: 35,
    targetPitch: 45,
    targetZoom: 1.0,
    panX: 0,
    panY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    activeRoute: null as NavigationRoute | null,
    focusedBuildingId: null as string | null,
    currentFloor: 'ground',
    animationFrameId: 0,
    dashOffset: 0,
    userProgressIndex: 0
  });

  // 1. ATTEMPT REAL UNITY WEBGL LOADER FIRST
  useEffect(() => {
    let isMounted = true;
    const loaderPath = '/unity/Build/CampusNavUnity.loader.js';

    const checkAndInitUnity = async () => {
      setIsLoading(true);
      setLoadProgress(10);
      setLoadStatus('Checking for Unity WebGL binaries...');

      try {
        const headCheck = await fetch(loaderPath, { method: 'HEAD' }).catch(() => null);

        if (headCheck && headCheck.ok) {
          setLoadStatus('Loading Unity WebGL Engine...');
          const script = document.createElement('script');
          script.src = loaderPath;
          script.async = true;

          script.onload = () => {
            if (!isMounted) return;
            const createUnityInstance = (window as any).createUnityInstance;
            if (createUnityInstance && canvasRef.current) {
              setLoadStatus('Compiling WebAssembly & Shaders...');
              const config = {
                dataUrl: '/unity/Build/CampusNavUnity.data',
                frameworkUrl: '/unity/Build/CampusNavUnity.framework.js',
                codeUrl: '/unity/Build/CampusNavUnity.wasm',
                streamingAssetsUrl: '/unity/StreamingAssets',
                companyName: 'AllianceUniversity',
                productName: 'CampusNavAI',
                productVersion: '1.0.0',
              };

              createUnityInstance(canvasRef.current, config, (progress: number) => {
                if (isMounted) setLoadProgress(Math.round(progress * 100));
              })
                .then((instance: any) => {
                  if (isMounted) {
                    unityBridge.registerInstance(instance);
                    setIsRealUnityInstance(true);
                    setIsLoading(false);
                    setLoadStatus('Ready');
                  }
                })
                .catch((err: any) => {
                  console.warn('Unity WebGL instance initialization note:', err);
                  fallbackToWebGLSimulator();
                });
            } else {
              fallbackToWebGLSimulator();
            }
          };

          script.onerror = () => {
            fallbackToWebGLSimulator();
          };

          document.body.appendChild(script);
        } else {
          // No pre-compiled Unity WebGL binary in /public yet -> Initialize interactive 3D WebGL simulator
          fallbackToWebGLSimulator();
        }
      } catch (e) {
        fallbackToWebGLSimulator();
      }
    };

    const fallbackToWebGLSimulator = () => {
      if (!isMounted) return;
      setLoadStatus('Spinning up interactive 3D Campus Viewport...');
      // Simulated realistic progressive asset load
      let p = 20;
      const interval = setInterval(() => {
        p += 25;
        if (p >= 100) {
          clearInterval(interval);
          if (isMounted) {
            setLoadProgress(100);
            setIsLoading(false);
            setLoadStatus('3D Campus Environment Ready');
            initCanvasRenderer();

            // Mock UnityBridge registration so React-to-Unity SendMessage calls route directly
            unityBridge.registerInstance({
              SendMessage: (obj: string, method: string, val?: any) => {
                console.log(`[Simulator Bridge] ${obj}.${method}(${val})`);
                if (method === 'FocusBuilding') {
                  handleFocusBuilding(val);
                } else if (method === 'SetSelectedFloor') {
                  simState.current.currentFloor = val;
                }
              }
            });
          }
        } else {
          if (isMounted) setLoadProgress(p);
        }
      }, 120);
    };

    checkAndInitUnity();

    return () => {
      isMounted = false;
      cancelAnimationFrame(simState.current.animationFrameId);
    };
  }, []);

  // Update route inside simulator when currentRoute changes
  useEffect(() => {
    simState.current.activeRoute = currentRoute;
    if (currentRoute && currentRoute.nodes.length > 0) {
      unityBridge.setRoute(currentRoute);
    }
  }, [currentRoute]);

  // Update building focus
  useEffect(() => {
    if (selectedBuilding) {
      handleFocusBuilding(selectedBuilding);
      unityBridge.focusBuilding(selectedBuilding);
    }
  }, [selectedBuilding]);

  // Update floor
  useEffect(() => {
    simState.current.currentFloor = selectedFloor;
    unityBridge.setSelectedFloor(selectedFloor);
  }, [selectedFloor]);

  const handleFocusBuilding = (buildingId: string) => {
    simState.current.focusedBuildingId = buildingId;
    const b = BUILDINGS.find(item => item.id === buildingId);
    if (b) {
      // Rotate view toward building
      simState.current.targetYaw = buildingId === 'academic-a' ? 20 : buildingId === 'academic-b' ? 80 : 45;
      simState.current.targetZoom = 1.35;
    }
  };

  // 2. INTERACTIVE 3D CANVAS CAMPUS ENGINE (Light Theme Optimized)
  const initCanvasRenderer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Handle canvas resize
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Smooth camera interpolation
      const s = simState.current;
      s.cameraYaw += (s.targetYaw - s.cameraYaw) * 0.1;
      s.cameraPitch += (s.targetPitch - s.cameraPitch) * 0.1;
      s.cameraZoom += (s.targetZoom - s.cameraZoom) * 0.1;
      s.dashOffset -= dt * 40;

      // Clear with bright daylight sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#E0F2FE'); // Light crisp daylight sky
      skyGrad.addColorStop(0.5, '#F0F9FF');
      skyGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      // Center coordinates
      ctx.translate(width / 2 + s.panX, height / 2 + s.panY + 40);
      ctx.scale(s.cameraZoom, s.cameraZoom);

      // Isomeric 3D projection parameters
      const yawRad = (s.cameraYaw * Math.PI) / 180;
      const pitchRad = (s.cameraPitch * Math.PI) / 180;

      // 3D to 2D projection function
      const project3D = (x: number, y: number, z: number) => {
        // Rotate around Y (yaw)
        const rx = x * Math.cos(yawRad) - z * Math.sin(yawRad);
        const rz = x * Math.sin(yawRad) + z * Math.cos(yawRad);
        // Pitch compression
        const px = rx * 7.5;
        const py = (rz * Math.sin(pitchRad) - y) * 7.5;
        return { x: px, y: py };
      };

      // Draw Campus Ground / Lawn (Crisp Emerald Green)
      ctx.beginPath();
      const c1 = project3D(-60, 0, -60);
      const c2 = project3D(60, 0, -60);
      const c3 = project3D(60, 0, 60);
      const c4 = project3D(-60, 0, 60);
      ctx.moveTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.lineTo(c3.x, c3.y);
      ctx.lineTo(c4.x, c4.y);
      ctx.closePath();
      ctx.fillStyle = '#E2E8F0';
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Grass zones
      ctx.beginPath();
      const g1 = project3D(-54, 0.05, -54);
      const g2 = project3D(54, 0.05, -54);
      const g3 = project3D(54, 0.05, 54);
      const g4 = project3D(-54, 0.05, 54);
      ctx.moveTo(g1.x, g1.y);
      ctx.lineTo(g2.x, g2.y);
      ctx.lineTo(g3.x, g3.y);
      ctx.lineTo(g4.x, g4.y);
      ctx.closePath();
      ctx.fillStyle = '#DCFCE7'; // Soft lawn green
      ctx.fill();

      // Draw Campus Pathways (Light clean concrete)
      const pathways = [
        // Main avenue
        [{ x: 0, y: 0.1, z: -48 }, { x: 0, y: 0.1, z: 40 }],
        // Cross avenue
        [{ x: -45, y: 0.1, z: 0 }, { x: 45, y: 0.1, z: 0 }],
        // Quad ring
        [{ x: -25, y: 0.1, z: -25 }, { x: 25, y: 0.1, z: -25 }],
        [{ x: 25, y: 0.1, z: -25 }, { x: 25, y: 0.1, z: 25 }],
        [{ x: 25, y: 0.1, z: 25 }, { x: -25, y: 0.1, z: 25 }],
        [{ x: -25, y: 0.1, z: 25 }, { x: -25, y: 0.1, z: -25 }]
      ];

      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#F1F5F9';
      pathways.forEach(p => {
        ctx.beginPath();
        const start = project3D(p[0].x, p[0].y, p[0].z);
        const end = project3D(p[1].x, p[1].y, p[1].z);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      });

      // Draw 3D Campus Buildings
      const buildingModels = [
        { id: 'GATE-01', name: 'Main Campus Gate', x: 0, z: -46, w: 14, d: 4, h: 6, color: '#3B82F6', roofColor: '#1D4ED8' },
        { id: 'academic-a', name: 'Academic Block A', x: -22, z: 6, w: 18, d: 24, h: 16, color: '#FFFFFF', roofColor: '#2563EB', isMultiFloor: true },
        { id: 'academic-b', name: 'Academic Block B', x: 22, z: 6, w: 18, d: 20, h: 14, color: '#FFFFFF', roofColor: '#0D9488' },
        { id: 'library', name: 'Central Library', x: -24, z: 34, w: 16, d: 16, h: 12, color: '#FFFFFF', roofColor: '#6366F1' },
        { id: 'admin', name: 'Administration', x: 0, z: 38, w: 18, d: 14, h: 18, color: '#FFFFFF', roofColor: '#475569' },
        { id: 'auditorium', name: 'Grand Auditorium', x: 24, z: 30, w: 18, d: 16, h: 12, color: '#FFFFFF', roofColor: '#E11D48' },
        { id: 'cafeteria', name: 'Cafeteria & Food Court', x: 28, z: -16, w: 16, d: 16, h: 9, color: '#FFFFFF', roofColor: '#EA580C' },
        { id: 'medical', name: 'Medical Centre', x: -28, z: -28, w: 14, d: 12, h: 8, color: '#FFFFFF', roofColor: '#16A34A' },
        { id: 'parking', name: 'Visitor Parking', x: 28, z: -36, w: 20, d: 16, h: 2, color: '#E2E8F0', roofColor: '#94A3B8' }
      ];

      // Sort buildings back-to-front (depth sorting)
      buildingModels.sort((a, b) => {
        const distA = a.x * Math.sin(yawRad) + a.z * Math.cos(yawRad);
        const distB = b.x * Math.sin(yawRad) + b.z * Math.cos(yawRad);
        return distB - distA;
      });

      // Render each 3D building box
      buildingModels.forEach(b => {
        const isHighlighted = (selectedBuilding === b.id) || (s.focusedBuildingId === b.id);
        const hw = b.w / 2;
        const hd = b.d / 2;
        const h = b.h;

        // Base 4 points
        const p1 = project3D(b.x - hw, 0, b.z - hd);
        const p2 = project3D(b.x + hw, 0, b.z - hd);
        const p3 = project3D(b.x + hw, 0, b.z + hd);
        const p4 = project3D(b.x - hw, 0, b.z + hd);

        // Top 4 points
        const t1 = project3D(b.x - hw, h, b.z - hd);
        const t2 = project3D(b.x + hw, h, b.z - hd);
        const t3 = project3D(b.x + hw, h, b.z + hd);
        const t4 = project3D(b.x - hw, h, b.z + hd);

        // Building Walls
        ctx.fillStyle = isHighlighted ? '#EFF6FF' : '#FFFFFF';
        ctx.strokeStyle = isHighlighted ? '#2563EB' : '#CBD5E1';
        ctx.lineWidth = isHighlighted ? 2.5 : 1.2;

        // Front Face
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Left Face
        ctx.fillStyle = isHighlighted ? '#DBEAFE' : '#F1F5F9';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.lineTo(t4.x, t4.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Roof Face
        ctx.fillStyle = isHighlighted ? '#2563EB' : b.roofColor;
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t4.x, t4.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Building Label Plaque
        const topCenter = project3D(b.x, h + 2.5, b.z);
        ctx.save();
        ctx.font = '600 11px Inter, sans-serif';
        const textWidth = ctx.measureText(b.name).width;

        // Label Card
        ctx.fillStyle = isHighlighted ? '#1E40AF' : 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = isHighlighted ? '#60A5FA' : '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(topCenter.x - textWidth / 2 - 8, topCenter.y - 12, textWidth + 16, 20, 6);
        ctx.fill();
        ctx.stroke();

        // Label Text
        ctx.fillStyle = isHighlighted ? '#FFFFFF' : '#1E293B';
        ctx.textAlign = 'center';
        ctx.fillText(b.name, topCenter.x, topCenter.y + 2);
        ctx.restore();
      });

      // 4. RENDER NAVIGATION ROUTE PATH & ANIMATED DIRECTIONAL ARROWS
      if (s.activeRoute && s.activeRoute.pathNodes.length > 1) {
        const nodes = s.activeRoute.pathNodes;

        // Coordinate mapper from graph nodes to 3D simulation
        const getNode3D = (node: any) => {
          let x = (node.x - 50) * 0.9;
          let z = (node.y - 50) * -0.9;
          let y = 0.5;

          if (node.buildingId === 'academic-a') {
            x = -22 + (node.x - 50) * 0.3;
            z = 6 + (node.y - 50) * -0.3;
            if (node.floorId === 'first') y = 10;
          }
          return { x, y, z };
        };

        const projectedPoints = nodes.map(n => {
          const pos = getNode3D(n);
          return project3D(pos.x, pos.y, pos.z);
        });

        // Glowing Route Path Underlay
        ctx.beginPath();
        ctx.moveTo(projectedPoints[0].x, projectedPoints[0].y);
        for (let i = 1; i < projectedPoints.length; i++) {
          ctx.lineTo(projectedPoints[i].x, projectedPoints[i].y);
        }
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Animated Dash Route
        ctx.beginPath();
        ctx.moveTo(projectedPoints[0].x, projectedPoints[0].y);
        for (let i = 1; i < projectedPoints.length; i++) {
          ctx.lineTo(projectedPoints[i].x, projectedPoints[i].y);
        }
        ctx.strokeStyle = s.activeRoute.accessible ? '#0D9488' : '#2563EB';
        ctx.lineWidth = 5;
        ctx.setLineDash([12, 8]);
        ctx.lineDashOffset = s.dashOffset;
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Start Position Marker (Pulsing Green Pin)
        const startPoint = projectedPoints[0];
        ctx.save();
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#16A34A';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();

        // Destination Marker (Bobbing Red Beacon / Flag)
        const destPoint = projectedPoints[projectedPoints.length - 1];
        const bob = Math.sin(time * 0.005) * 5;
        ctx.save();
        // Pin shadow
        ctx.beginPath();
        ctx.ellipse(destPoint.x, destPoint.y, 10, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();

        // Pin body
        ctx.beginPath();
        ctx.arc(destPoint.x, destPoint.y - 20 + bob, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pin needle
        ctx.beginPath();
        ctx.moveTo(destPoint.x - 7, destPoint.y - 14 + bob);
        ctx.lineTo(destPoint.x, destPoint.y);
        ctx.lineTo(destPoint.x + 7, destPoint.y - 14 + bob);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      s.animationFrameId = requestAnimationFrame(render);
    };

    simState.current.animationFrameId = requestAnimationFrame(render);
  };

  // Mouse & Touch Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    simState.current.isDragging = true;
    simState.current.dragStartX = e.clientX;
    simState.current.dragStartY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!simState.current.isDragging) return;
    const dx = e.clientX - simState.current.dragStartX;
    const dy = e.clientY - simState.current.dragStartY;
    simState.current.dragStartX = e.clientX;
    simState.current.dragStartY = e.clientY;

    if (e.buttons === 1) {
      // Orbit
      simState.current.targetYaw += dx * 0.4;
      simState.current.targetPitch = Math.max(20, Math.min(75, simState.current.targetPitch - dy * 0.3));
      setViewAngle(Math.round(simState.current.targetYaw % 360));
    } else if (e.buttons === 2) {
      // Pan
      simState.current.panX += dx;
      simState.current.panY += dy;
    }
  };

  const handleMouseUp = () => {
    simState.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0015;
    const newZoom = Math.max(0.6, Math.min(2.5, simState.current.targetZoom + zoomDelta));
    simState.current.targetZoom = newZoom;
    setZoomLevel(Number(newZoom.toFixed(1)));
  };

  const resetView = () => {
    simState.current.targetYaw = 35;
    simState.current.targetPitch = 45;
    simState.current.targetZoom = 1.0;
    simState.current.panX = 0;
    simState.current.panY = 0;
    setViewAngle(35);
    setZoomLevel(1.0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] bg-slate-50 overflow-hidden select-none rounded-2xl border border-slate-200 shadow-sm"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        id="unity-canvas"
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 shadow-sm animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">CampusNav AI 3D Engine</h3>
          <p className="text-sm text-slate-500 mb-5">{loadStatus}</p>

          <div className="w-64 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-400 mt-2">{loadProgress}%</span>
        </div>
      )}

      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{isRealUnityInstance ? 'Unity WebGL' : '3D Campus Viewport'}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{zoomLevel}x</span>
        </div>

        {currentRoute && (
          <div className="bg-blue-50/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-200 shadow-sm flex items-center gap-2 text-xs font-semibold text-blue-700 animate-fadeIn">
            <Navigation className="w-3.5 h-3.5" />
            <span>Path: {currentRoute.distance} m ({currentRoute.estimatedMinutes} min)</span>
          </div>
        )}
      </div>

      {/* Right Controls Bar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => {
            simState.current.targetYaw += 45;
            setViewAngle(Math.round(simState.current.targetYaw % 360));
          }}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:bg-white hover:text-blue-600 transition"
          title="Rotate Campus"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const z = Math.min(2.5, simState.current.targetZoom + 0.2);
            simState.current.targetZoom = z;
            setZoomLevel(Number(z.toFixed(1)));
          }}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:bg-white hover:text-blue-600 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const z = Math.max(0.6, simState.current.targetZoom - 0.2);
            simState.current.targetZoom = z;
            setZoomLevel(Number(z.toFixed(1)));
          }}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:bg-white hover:text-blue-600 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:bg-white hover:text-blue-600 transition"
          title="Reset View"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Building Quick-Focus Carousel */}
      <div className="absolute bottom-4 left-4 right-4 z-20 overflow-x-auto no-scrollbar flex items-center gap-2 py-1">
        {BUILDINGS.map(b => (
          <button
            key={b.id}
            onClick={() => {
              onBuildingSelect(b.id);
              handleFocusBuilding(b.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm border ${
              selectedBuilding === b.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                : 'bg-white/90 backdrop-blur-md text-slate-700 border-slate-200/80 hover:bg-white hover:border-slate-300'
            }`}
          >
            {b.shortName}
          </button>
        ))}
      </div>
    </div>
  );
};
