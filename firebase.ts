/**
 * CampusNav AI - Firebase Integration & Offline Resilience Service
 * Connects to Cloud Firestore if credentials exist; automatically provides
 * guaranteed in-memory demo data with CRUD operations when offline.
 */
import { CampusBuilding, CampusNode, CampusEdge, QRCheckpoint } from '../types/campus';
import { BUILDINGS, NODES, EDGES, QR_CHECKPOINTS } from '../data/campusData';

// Local reactive storage for demo CRUD
let localBuildings: CampusBuilding[] = [...BUILDINGS];
let localNodes: CampusNode[] = [...NODES];
let localEdges: CampusEdge[] = [...EDGES];
let localCheckpoints: QRCheckpoint[] = [...QR_CHECKPOINTS];

export const isFirebaseConfigured = (): boolean => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return Boolean(key && key.trim().length > 0 && !key.includes('Dummy'));
};

export async function fetchCampusData() {
  if (isFirebaseConfigured()) {
    try {
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');

      const app = getApps().length === 0 ? initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      }) : getApps()[0];

      const db = getFirestore(app);
      const [bSnap, nSnap] = await Promise.all([
        getDocs(collection(db, 'buildings')),
        getDocs(collection(db, 'nodes'))
      ]);

      if (!bSnap.empty && !nSnap.empty) {
        return {
          buildings: bSnap.docs.map((d: any) => d.data() as CampusBuilding),
          nodes: nSnap.docs.map((d: any) => d.data() as CampusNode),
          edges: localEdges,
          checkpoints: localCheckpoints,
          source: 'firestore' as const
        };
      }
    } catch (err: any) {
      console.warn('⚠️ Cloud Firestore sync error, falling back to local dataset:', err.message);
    }
  }

  return {
    buildings: localBuildings,
    nodes: localNodes,
    edges: localEdges,
    checkpoints: localCheckpoints,
    source: 'local' as const
  };
}

// =========================================================================
// DEMO CRUD OPERATIONS (Supports Admin Dashboard)
// =========================================================================

export function addNode(node: CampusNode) {
  localNodes = [node, ...localNodes.filter(n => n.id !== node.id)];
  return localNodes;
}

export function updateNode(node: CampusNode) {
  localNodes = localNodes.map(n => n.id === node.id ? node : n);
  return localNodes;
}

export function deleteNode(nodeId: string) {
  localNodes = localNodes.filter(n => n.id !== nodeId);
  localEdges = localEdges.filter(e => e.from !== nodeId && e.to !== nodeId);
  return localNodes;
}

export function addEdge(edge: CampusEdge) {
  localEdges = [...localEdges, edge];
  return localEdges;
}

export function deleteEdge(from: string, to: string) {
  localEdges = localEdges.filter(e => !(e.from === from && e.to === to) && !(e.from === to && e.to === from));
  return localEdges;
}

export function resetDemoData() {
  localBuildings = [...BUILDINGS];
  localNodes = [...NODES];
  localEdges = [...EDGES];
  localCheckpoints = [...QR_CHECKPOINTS];
  return {
    buildings: localBuildings,
    nodes: localNodes,
    edges: localEdges,
    checkpoints: localCheckpoints
  };
}
