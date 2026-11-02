/**
 * CampusNav AI - Google Maps Outdoor Navigation Service
 * Loads Google Maps JavaScript API with DirectionsService if key is available;
 * provides a labeled interactive campus vector map fallback if key is missing.
 */
import { CAMPUS_CENTER, BUILDINGS } from '../data/campusData';

declare global {
  interface Window {
    google?: any;
    initGoogleMapsCallback?: () => void;
  }
}

export const isGoogleMapsKeyAvailable = (): boolean => {
  const key = import.meta.env.VITE_MAPS_API_KEY;
  return Boolean(key && key.trim().length > 0 && !key.includes('your_google_maps_key'));
};

let mapsLoadingPromise: Promise<boolean> | null = null;

export function loadGoogleMapsScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.google?.maps) return Promise.resolve(true);
  if (!isGoogleMapsKeyAvailable()) return Promise.resolve(false);

  if (mapsLoadingPromise) return mapsLoadingPromise;

  mapsLoadingPromise = new Promise((resolve) => {
    const key = import.meta.env.VITE_MAPS_API_KEY;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geometry&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;

    window.initGoogleMapsCallback = () => {
      console.log('🗺️ Google Maps JavaScript API loaded successfully.');
      resolve(true);
    };

    script.onerror = () => {
      console.warn('⚠️ Google Maps script failed to load. Using demo vector map fallback.');
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return mapsLoadingPromise;
}
