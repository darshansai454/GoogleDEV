/**
 * CampusNav AI - Unity WebGL Communication Bridge Service
 * Handles React <-> Unity WebGL two-way communication:
 * - Sends commands to Unity via unityInstance.SendMessage("ReactBridge", method, arg)
 * - Receives events dispatched from Unity WebGL via window CustomEvents
 */

export interface UnityInstance {
  SendMessage(gameObjectName: string, methodName: string, value?: string | number): void;
  Quit?(): Promise<void>;
}

export type UnityEventType =
  | 'unityLoaded'
  | 'unityBuildingSelected'
  | 'unityDestinationSelected'
  | 'unityNavigationStarted'
  | 'unityNavigationCompleted'
  | 'unityNavigationError';

type UnityEventListener = (data: any) => void;

class UnityBridgeService {
  private unityInstance: UnityInstance | null = null;
  private isLoaded: boolean = false;
  private messageQueue: { method: string; payload: string }[] = [];
  private listeners: Map<UnityEventType, Set<UnityEventListener>> = new Map();

  constructor() {
    this.setupWindowListeners();
  }

  private setupWindowListeners() {
    if (typeof window === 'undefined') return;

    const eventNames: UnityEventType[] = [
      'unityLoaded',
      'unityBuildingSelected',
      'unityDestinationSelected',
      'unityNavigationStarted',
      'unityNavigationCompleted',
      'unityNavigationError'
    ];

    eventNames.forEach(evt => {
      window.addEventListener(evt, (e: any) => {
        const detail = e.detail || {};
        console.log(`[UnityBridge] Received event '${evt}':`, detail);

        if (evt === 'unityLoaded') {
          this.isLoaded = true;
          this.flushQueue();
        }

        const listeners = this.listeners.get(evt);
        if (listeners) {
          listeners.forEach(fn => fn(detail));
        }
      });
    });
  }

  /**
   * Registers the loaded Unity WebGL instance
   */
  public registerInstance(instance: UnityInstance) {
    this.unityInstance = instance;
    this.isLoaded = true;
    console.info('🎮 Unity WebGL Instance registered with ReactBridge.');
    this.flushQueue();
    this.dispatchLocalEvent('unityLoaded', { status: 'ready' });
  }

  public unregisterInstance() {
    this.unityInstance = null;
    this.isLoaded = false;
  }

  public isReady(): boolean {
    return this.isLoaded && this.unityInstance !== null;
  }

  /**
   * Internal sender to Unity GameObject 'ReactBridge'
   */
  private send(method: string, payload: string = '') {
    if (this.unityInstance && this.isLoaded) {
      try {
        console.log(`[React -> Unity] SendMessage("ReactBridge", "${method}", payload)`);
        this.unityInstance.SendMessage('ReactBridge', method, payload);
      } catch (err) {
        console.error(`[UnityBridge] Error calling ${method}:`, err);
      }
    } else {
      console.warn(`[UnityBridge] Unity not ready. Queuing method: ${method}`);
      this.messageQueue.push({ method, payload });
    }
  }

  private flushQueue() {
    if (!this.unityInstance) return;
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      this.send(msg.method, msg.payload);
    }
  }

  // =========================================================================
  // PUBLIC REACT-TO-UNITY ACTIONS
  // =========================================================================

  public setDestination(destinationId: string) {
    this.send('SetDestination', destinationId);
    this.dispatchLocalEvent('unityDestinationSelected', { destinationId });
  }

  public setCurrentLocation(nodeId: string) {
    this.send('SetCurrentLocation', nodeId);
  }

  public setRoute(routeData: any) {
    const json = typeof routeData === 'string' ? routeData : JSON.stringify(routeData);
    this.send('SetRoute', json);
  }

  public setAccessibilityMode(enabled: boolean) {
    this.send('SetAccessibilityMode', enabled ? 'true' : 'false');
  }

  public setSelectedFloor(floorId: string) {
    this.send('SetSelectedFloor', floorId);
  }

  public focusBuilding(buildingId: string) {
    this.send('FocusBuilding', buildingId);
  }

  public setCameraFollow(enabled: boolean) {
    this.send('SetCameraFollow', enabled ? 'true' : 'false');
  }

  // =========================================================================
  // EVENT SUBSCRIPTIONS
  // =========================================================================

  public on(eventType: UnityEventType, listener: UnityEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    // Return unbind function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  /**
   * Allows simulated or local fallbacks to dispatch identical events
   */
  public dispatchLocalEvent(eventType: UnityEventType, detail: any) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventType, { detail }));
    }
  }
}

export const unityBridge = new UnityBridgeService();
