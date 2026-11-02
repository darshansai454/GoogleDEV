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

