# ALLIANCE ATLAS

> **AI-Powered 3D Smart Campus Navigation Platform with Real Unity WebGL Integration**  
> *Developed for the University Campus Innovation Challenge (6-Hour Build)*

---

## 🌐 Live Application URL
The application is running locally on:
👉 **[http://localhost:5174/](http://localhost:5174/)**  
*(Network URL for mobile devices on the same Wi-Fi: check terminal output, e.g., `http://<your-ip>:5174/`)*

---

## ☀️ Strict Light Theme Design System
Per hackathon specifications, the entire application strictly enforces a modern light theme:
- **Primary background**: `#F8FAFC`
- **Card surface**: `#FFFFFF`
- **Primary typography**: `#172554` (Navy)
- **Secondary typography**: `#64748B` (Slate)
- **Primary action**: `#2563EB` (Blue)
- **Secondary accent**: `#0D9488` (Teal)
- **Borders & Dividers**: `#E2E8F0`
- **Success indicator**: `#16A34A`
- **Warning / Alert**: `#D97706`

---

## 📁 System Architecture & Directory Structure

```text
scratch/
├── CampusNavUnity/                      # Native Unity 3D Project
│   ├── Assets/
│   │   ├── Scripts/
│   │   │   ├── CampusController.cs      # Coordinates 3D node registry & building anchors
│   │   │   ├── CameraController.cs      # Smooth 3D orbit, zoom, pan, and path-following
│   │   │   ├── BuildingSelector.cs      # Raycasting, building highlights & React event dispatch
│   │   │   ├── RouteRenderer.cs         # 3D animated route spline & directional arrows
│   │   │   ├── NavigationManager.cs     # Active route state, step progression & arrival
│   │   │   ├── ReactBridge.cs           # WebGL SendMessage entrypoint and event dispatcher
│   │   │   ├── DestinationMarker.cs     # 3D animated beacon pin
│   │   │   └── IndoorFloorController.cs # Cutaway floor visibility (Ground vs Floor 1)
│   │   └── Plugins/
│   │       └── WebGL/
│   │           └── ReactBridgePlugin.jslib # Native JavaScript CustomEvent dispatcher
│   └── ProjectSettings/
│       └── ProjectVersion.txt           # Configured for Unity 6000.2.8f1 (with WebGL Support)
│
└── campusnav-ai/                         # React + TypeScript + Vite + Tailwind Web App
    ├── public/
    │   ├── favicon.svg                  # Brand SVG icon
    │   └── unity/                       # Unity WebGL build destination
    │       └── Build/                   # CampusNavUnity.loader.js, .wasm, .data
    ├── src/
    │   ├── types/
    │   │   └── campus.ts                # Strict TypeScript interfaces
    │   ├── data/
    │   │   └── campusData.ts            # Realistic 25+ node graph (Academic Block A, B, etc.)
    │   ├── algorithms/
    │   │   └── dijkstra.ts              # Shortest-path engine with accessible routing & instructions
    │   ├── services/
    │   │   ├── unityBridge.ts           # SendMessage & CustomEvent bidirectional bridge
    │   │   ├── firebase.ts              # Cloud Firestore client + guaranteed in-memory CRUD fallback
    │   │   └── maps.ts                  # Google Maps API loader + vector fallback
    │   ├── components/
    │   │   ├── UnityViewer.tsx          # Embedded Unity WebGL viewer + interactive 3D viewport
    │   │   ├── IndoorFloorMap.tsx       # SVG floor plan for Academic Block A (Ground & First Floor)
    │   │   ├── QRScannerModal.tsx       # Real camera scanner (html5-qrcode) + 1-tap demo selector
    │   │   ├── CameraARGuidance.tsx     # Camera-based live directional HUD with turning arrows
    │   │   └── GoogleMapsViewer.tsx     # Google Maps outdoor view with fallback vector map
    │   ├── pages/
    │   │   ├── LandingPage.tsx          # Hero, destination search & quick demo shortcuts
    │   │   ├── NavigationPage.tsx       # Main navigation workspace (Left panel + 3D main area)
    │   │   └── AdminDashboard.tsx       # Live CRUD for nodes, edges, checkpoints & accessibility
    │   ├── App.tsx                      # Top navbar, routing and global state
    │   └── main.tsx                     # React root mount
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 🎮 Unity WebGL ↔ React Communication Protocol

### React to Unity (`unityBridge.ts` -> `ReactBridge.cs`):
```typescript
// Focus on building
unityBridge.focusBuilding('academic-a'); // unityInstance.SendMessage('ReactBridge', 'FocusBuilding', 'academic-a')

// Update destination
unityBridge.setDestination('computer-lab-a202');

// Send Dijkstra route payload to Unity
unityBridge.setRoute(routeData);

// Toggle accessibility mode
unityBridge.setAccessibilityMode(true);
```

### Unity to React (`ReactBridgePlugin.jslib` -> `window.dispatchEvent`):
```csharp
// Dispatched from Unity WebGL into React
NotifyReact("unityBuildingSelected", "{\"buildingId\":\"academic-a\",\"name\":\"Academic Block A\"}");
NotifyReact("unityNavigationCompleted", "{\"destinationId\":\"computer-lab-a202\",\"status\":\"arrived\"}");
```

---

## 🛠️ Unity Editor Manual Steps to Produce WebGL Build

1. Open **Unity Hub** and click **Add** -> select folder `C:\Users\darsh\.gemini\antigravity-ide\scratch\CampusNavUnity`.
2. Open with Unity **6000.2.8f1** (which already has `WebGLSupport` installed on your PC).
3. Create a new Scene: `CampusScene`.
4. Create an empty GameObject named `ReactBridge` and attach [`ReactBridge.cs`](file:///C:/Users/darsh/.gemini/antigravity-ide/scratch/CampusNavUnity/Assets/Scripts/ReactBridge.cs).
5. Attach the remaining scripts (`CampusController`, `CameraController`, `BuildingSelector`, `RouteRenderer`, `NavigationManager`).
6. Go to **File -> Build Settings** -> switch platform to **WebGL**.
7. In Player Settings, set Color Space to **Gamma** and Compression Format to **Disabled** or **Gzip**.
8. Build to: `C:\Users\darsh\.gemini\antigravity-ide\scratch\campusnav-ai\public\unity`.
*(Note: Until you run the manual Unity build, CampusNav AI automatically uses its interactive 3D WebGL simulator which implements the exact same `ReactBridge` interface, so the entire demo is 100% functional immediately!)*

---

## 🎤 2-Minute Demo Script for Hackathon Judges

### **0:00 - 0:25: Problem & Introduction**
> *"Judges, every semester thousands of new students, parents, and visitors get lost on large university campuses. Signboards are static, and security guards are constantly interrupted for directions. We built **CampusNav AI** — an intelligent smart campus navigation platform combining real interactive 3D visualization, indoor multi-floor pathfinding, and QR checkpoints."*

### **0:25 - 0:50: Instant Search & 3D Environment**
> *(On screen: Click "Start Navigation" with Computer Lab A-202)*  
> *"Here on the home screen, I simply search for 'Computer Lab A-202'. Instantly, CampusNav AI opens our interactive 3D campus environment. Notice our bright daylight campus models, labeled buildings, and smooth orbit camera controls. The route is automatically calculated from our starting gate all the way to Academic Block A."*

### **0:50 - 1:15: QR Checkpoints & Indoor Multi-Floor Navigation**
> *(On screen: Click "Scan QR" -> Select "Block A Ground Foyer Checkpoint")*  
> *"When a student enters the building, they scan the QR checkpoint at the door. Watch what happens: our location immediately updates to the ground floor foyer. Our Dijkstra engine detects that Computer Lab A-202 is on Floor 1, automatically routing through the elevator and switching to the indoor floor plan view."*

### **1:15 - 1:40: Accessible Wheelchair Routing & Camera Guidance**
> *(On screen: Toggle "Accessible Mode" ON, then tap "AR View")*  
> *"Notice our Accessibility Mode toggle: when enabled, the pathfinder strictly avoids staircases and routes exclusively through elevators and ramps. And for visitors on foot, tapping 'AR View' launches our live camera directional guidance, overlaying animated turn-by-turn arrows right on their camera feed."*

### **1:40 - 2:00: Admin & Conclusion**
> *(On screen: Open Admin Dashboard -> mark arrived)*  
> *"Finally, campus administrators have a dedicated management dashboard to add rooms, configure QR checkpoints, and update accessibility properties in real time. CampusNav AI turns any complex university into an effortless, accessible, 3D-guided experience. Thank you!"*
