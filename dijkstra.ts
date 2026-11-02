import { CampusNode, CampusEdge, NavigationRoute, RouteInstruction } from '../types/campus';
import { NODES, EDGES } from '../data/campusData';

interface GraphAdjacency {
  nodeId: string;
  distance: number;
  edge: CampusEdge;
}

/**
 * Builds an undirected or directed adjacency graph from campus edges
 */
function buildGraph(edges: CampusEdge[], accessibleOnly: boolean): Map<string, GraphAdjacency[]> {
  const graph = new Map<string, GraphAdjacency[]>();

  for (const edge of edges) {
    if (accessibleOnly && !edge.accessible) {
      continue; // Filter out inaccessible edges (like stairs)
    }

    if (!graph.has(edge.from)) graph.set(edge.from, []);
    if (!graph.has(edge.to)) graph.set(edge.to, []);

    graph.get(edge.from)!.push({ nodeId: edge.to, distance: edge.distance, edge });
    graph.get(edge.to)!.push({ nodeId: edge.from, distance: edge.distance, edge }); // Two-way paths
  }

  return graph;
}

/**
 * Calculates the shortest path between startNodeId and destinationNodeId using Dijkstra's algorithm.
 */
export function calculateRoute(
  startNodeId: string,
  destinationNodeId: string,
  accessibleOnly: boolean = false,
  customNodes: CampusNode[] = NODES,
  customEdges: CampusEdge[] = EDGES
): NavigationRoute | null {
  if (startNodeId === destinationNodeId) {
    const node = customNodes.find(n => n.id === destinationNodeId);
    return {
      destinationId: destinationNodeId,
      destinationName: node ? node.name : destinationNodeId,
      nodes: [startNodeId],
      pathNodes: node ? [node] : [],
      distance: 0,
      estimatedMinutes: 0,
      instructions: [
        {
          step: 1,
          text: `You are already at your destination: ${node?.name || destinationNodeId}.`,
          type: 'arrive',
          distanceMeters: 0,
          nodeId: startNodeId,
          floorId: node?.floorId || 'ground'
        }
      ],
      accessible: accessibleOnly,
      requiresFloorChange: false
    };
  }

  const graph = buildGraph(customEdges, accessibleOnly);
  const nodeMap = new Map<string, CampusNode>(customNodes.map(n => [n.id, n]));

  // Priority queue / distances tracker
  const distances = new Map<string, number>();
  const previous = new Map<string, { nodeId: string; edge: CampusEdge }>();
  const unvisited = new Set<string>();

  for (const node of customNodes) {
    distances.set(node.id, Infinity);
    unvisited.add(node.id);
  }

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with lowest distance
    let currentId: string | null = null;
    let lowestDist = Infinity;

    for (const id of unvisited) {
      const d = distances.get(id) ?? Infinity;
      if (d < lowestDist) {
        lowestDist = d;
        currentId = id;
      }
    }

    if (!currentId || lowestDist === Infinity) {
      break; // Remaining nodes are unreachable
    }

    if (currentId === destinationNodeId) {
      break; // Reached target destination
    }

    unvisited.delete(currentId);

    const neighbors = graph.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.nodeId)) continue;

      const alt = lowestDist + neighbor.distance;
      if (alt < (distances.get(neighbor.nodeId) ?? Infinity)) {
        distances.set(neighbor.nodeId, alt);
        previous.set(neighbor.nodeId, { nodeId: currentId, edge: neighbor.edge });
      }
    }
  }

  // Reconstruct path
  if (!previous.has(destinationNodeId) && distances.get(destinationNodeId) === Infinity) {
    return null; // No available path found
  }

  const pathNodeIds: string[] = [];
  let curr: string | undefined = destinationNodeId;

  while (curr) {
    pathNodeIds.unshift(curr);
    curr = previous.get(curr)?.nodeId;
  }

  const totalDistance = distances.get(destinationNodeId) || 0;
  const pathNodes = pathNodeIds.map(id => nodeMap.get(id)!).filter(Boolean);
  const destinationNode = nodeMap.get(destinationNodeId);

  // Generate Turn-by-Turn Instructions
  const instructions = generateInstructions(pathNodes, previous);

  // Check if route transitions floors
  const floors = new Set(pathNodes.map(n => n.floorId));
  const requiresFloorChange = floors.size > 1;

  // Approx 1.2 m/s walk speed + floor change wait
  const walkingSpeedMetersPerMin = 70;
  const estimatedMinutes = Math.max(1, Math.round(totalDistance / walkingSpeedMetersPerMin) + (requiresFloorChange ? 1 : 0));

  return {
    destinationId: destinationNodeId,
    destinationName: destinationNode ? destinationNode.name : destinationNodeId,
    nodes: pathNodeIds,
    pathNodes,
    distance: Math.round(totalDistance),
    estimatedMinutes,
    instructions,
    accessible: accessibleOnly,
    requiresFloorChange
  };
}

/**
 * Translates an ordered sequence of nodes into human-readable turn-by-turn guidance
 */
function generateInstructions(
  pathNodes: CampusNode[],
  previous: Map<string, { nodeId: string; edge: CampusEdge }>
): RouteInstruction[] {
  const instructions: RouteInstruction[] = [];
  if (pathNodes.length < 2) return instructions;

  for (let i = 0; i < pathNodes.length; i++) {
    const current = pathNodes[i];

    if (i === 0) {
      const next = pathNodes[1];
      const edge = previous.get(next.id)?.edge;
      instructions.push({
        step: 1,
        text: `Start from ${current.name} and head towards ${next.name}.`,
        type: 'straight',
        distanceMeters: edge?.distance || 10,
        nodeId: current.id,
        floorId: current.floorId,
        photoUrl: current.photoUrl || next.photoUrl
      });
      continue;
    }

    if (i === pathNodes.length - 1) {
      instructions.push({
        step: instructions.length + 1,
        text: `Arrive at your destination: ${current.name} (${current.floorId === 'ground' ? 'Ground Floor' : 'Floor 1'}).`,
        type: 'arrive',
        distanceMeters: 0,
        nodeId: current.id,
        floorId: current.floorId,
        photoUrl: current.photoUrl
      });
      continue;
    }

    const prev = pathNodes[i - 1];
    const next = pathNodes[i + 1];
    const edge = previous.get(next.id)?.edge;
    const dist = edge?.distance || 10;

    // Floor transition detection
    if (current.nodeType === 'elevator' && next.floorId !== current.floorId) {
      const targetFloorName = next.floorId === 'ground' ? 'Ground Floor' : 'First Floor';
      instructions.push({
        step: instructions.length + 1,
        text: `Take the elevator up to ${targetFloorName}.`,
        type: 'elevator',
        distanceMeters: dist,
        nodeId: current.id,
        floorId: current.floorId,
        photoUrl: current.photoUrl || next.photoUrl
      });
      continue;
    }

    if (current.nodeType === 'stairs' && next.floorId !== current.floorId) {
      const targetFloorName = next.floorId === 'ground' ? 'Ground Floor' : 'First Floor';
      instructions.push({
        step: instructions.length + 1,
        text: `Walk up the central staircase to ${targetFloorName}.`,
        type: 'stairs',
        distanceMeters: dist,
        nodeId: current.id,
        floorId: current.floorId,
        photoUrl: current.photoUrl
      });
      continue;
    }

    if (current.nodeType === 'entrance') {
      instructions.push({
        step: instructions.length + 1,
        text: `Enter through ${current.name} into the foyer.`,
        type: 'straight',
        distanceMeters: dist,
        nodeId: current.id,
        floorId: current.floorId,
        photoUrl: current.photoUrl
      });
      continue;
    }

    // Directional orientation heuristic based on 2D coordinates
    const dx1 = current.x - prev.x;
    const dy1 = current.y - prev.y;
    const dx2 = next.x - current.x;
    const dy2 = next.y - current.y;

    const crossProduct = dx1 * dy2 - dy1 * dx2;
    let turnType: 'straight' | 'left' | 'right' = 'straight';

    if (crossProduct > 15) turnType = 'right';
    else if (crossProduct < -15) turnType = 'left';

    const turnWord = turnType === 'right' ? 'Turn right' : turnType === 'left' ? 'Turn left' : 'Continue straight';
    instructions.push({
      step: instructions.length + 1,
      text: `${turnWord} through ${current.name} towards ${next.name} (${dist} m).`,
      type: turnType,
      distanceMeters: dist,
      nodeId: current.id,
      floorId: current.floorId,
      photoUrl: current.photoUrl || next.photoUrl
    });
  }

  return instructions;
}
