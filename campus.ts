export type NodeType =
  | 'entrance'
  | 'classroom'
  | 'lab'
  | 'office'
  | 'elevator'
  | 'stairs'
  | 'corridor'
  | 'gate'
  | 'facility'
  | 'parking';

export type ConnectionType =
  | 'corridor'
  | 'outdoor'
  | 'staircase'
  | 'elevator'
  | 'ramp';

export interface CampusNode {
  id: string;
  name: string;
  buildingId: string;
  floorId: string;
  x: number;
  y: number;
  nodeType: NodeType;
  accessible: boolean;
  description?: string;
  tags?: string[];
  photoUrl?: string; // Real-world photographic reference
}

export interface CampusEdge {
  from: string;
  to: string;
  distance: number;
  connectionType: ConnectionType;
  accessible: boolean;
}

export interface CampusBuilding {
  id: string;
  name: string;
  shortName: string;
  description: string;
  lat: number;
  lng: number;
  floors: {
    id: string;
    name: string;
  }[];
}

export interface QRCheckpoint {
  campusId: string;
  buildingId: string;
  floorId: string;
  nodeId: string;
  name: string;
}

export interface RouteInstruction {
  step: number;
  text: string;
  type: 'straight' | 'left' | 'right' | 'elevator' | 'stairs' | 'ramp' | 'arrive';
  distanceMeters: number;
  nodeId: string;
  floorId: string;
  photoUrl?: string;
}

export interface NavigationRoute {
  destinationId: string;
  destinationName: string;
  nodes: string[];
  pathNodes: CampusNode[];
  distance: number;
  estimatedMinutes: number;
  instructions: RouteInstruction[];
  accessible: boolean;
  requiresFloorChange: boolean;
}
