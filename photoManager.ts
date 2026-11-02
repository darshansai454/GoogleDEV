// Photo Manager Service for Campus Landmark and Building Photography

export interface LandmarkPhotoMeta {
  id: string;
  name: string;
  category: 'building' | 'interior' | 'gate';
  defaultPath: string;
  description: string;
  recommendedResolution: string;
}

export const LANDMARK_DEFINITIONS: LandmarkPhotoMeta[] = [
  {
    id: 'academic-a',
    name: 'Academic Block A (Main Entrance)',
    category: 'building',
    defaultPath: '/photos/block-a-entrance.jpg',
    description: 'Front facade, entrance portico, or main doorway of Academic Block A.',
    recommendedResolution: '1280x720 or 1920x1080 (Landscape 16:9 or 4:3)'
  },
  {
    id: 'computer-lab-a202',
    name: 'Computer Lab A-202 (Floor 1)',
    category: 'interior',
    defaultPath: '/photos/lab-a202.jpg',
    description: 'Entrance door with "A-202" sign, computers, and workstations inside.',
    recommendedResolution: '1280x720 (Landscape)'
  },
  {
    id: 'elevator-foyer',
    name: 'Elevator & Staircase Foyer',
    category: 'interior',
    defaultPath: '/photos/elevator-foyer.jpg',
    description: 'Elevator doors and staircase junction in Academic Block A.',
    recommendedResolution: '1280x720 (Landscape)'
  },
  {
    id: 'academic-b',
    name: 'Academic Block B',
    category: 'building',
    defaultPath: '/photos/block-b.jpg',
    description: 'Front exterior of Block B (School of Business / Management).',
    recommendedResolution: '1280x720 (Landscape)'
  },
  {
    id: 'library',
    name: 'Central Library & Knowledge Hub',
    category: 'building',
    defaultPath: '/photos/library.jpg',
    description: 'Library entrance glass doors, circulation desk, or front building view.',
    recommendedResolution: '1280x720 (Landscape)'
  },
  {
    id: 'admin',
    name: 'Administration & Admissions Block',
    category: 'building',
    defaultPath: '/photos/admin-block.jpg',
    description: 'Registrar office portico, admissions lounge, or front lawn.',
    recommendedResolution: '1280x720 (Landscape)'
  },
  {
    id: 'cafeteria',
    name: 'Student Cafeteria & Food Court',
    category: 'building',
    defaultPath: '/photos/cafeteria.jpg',
    description: 'Dining hall entrance, food kiosks, or outdoor seating area.',
    recommendedResolution: '1280x720 (Landscape)'
  },
  {
    id: 'auditorium',
    name: 'Grand Plenary Auditorium',
    category: 'building',
    defaultPath: '/photos/auditorium.jpg',
    description: 'Main auditorium entrance, glass foyer, or event stage.',
    recommendedResolution: '1280x720 (Landscape)'
  },
  {
    id: 'medical',
    name: 'Health Centre & Medical Clinic',
    category: 'building',
    defaultPath: '/photos/medical-clinic.jpg',
    description: 'Clinic entrance, infirmary reception, or first aid sign.',
    recommendedResolution: '1280x720 (Landscape)'
  },
  {
    id: 'GATE-01',
    name: 'Main Campus Entrance Gate',
    category: 'gate',
    defaultPath: '/photos/main-gate.jpg',
    description: 'Main security archway, boom barrier, or visitor reception entry.',
    recommendedResolution: '1280x720 (Landscape)'
  }
];

const STORAGE_KEY = 'campusnav_custom_photos';

export const photoManager = {
  // Get active photo for a landmark ID (checks localStorage upload first, then default file)
  getPhoto(id: string): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[id]) {
          return parsed[id];
        }
      }
    } catch (e) {}

    const def = LANDMARK_DEFINITIONS.find(l => l.id === id);
    return def ? def.defaultPath : '/photos/block-a-entrance.jpg';
  },

  // Store user-uploaded photo (as Base64 Data URL)
  setCustomPhoto(id: string, base64Url: string) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[id] = base64Url;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      window.dispatchEvent(new CustomEvent('campus_photos_updated', { detail: { id, base64Url } }));
    } catch (e) {
      console.error('Error saving custom photo:', e);
    }
  },

  // Reset a photo to default file
  resetPhoto(id: string) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        delete parsed[id];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        window.dispatchEvent(new CustomEvent('campus_photos_updated', { detail: { id } }));
      }
    } catch (e) {}
  },

  // Reset all uploaded photos
  resetAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('campus_photos_updated', { detail: {} }));
    } catch (e) {}
  },

  // Check if a specific photo is custom-uploaded
  isCustom(id: string): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Boolean(parsed[id]);
      }
    } catch (e) {}
    return false;
  }
};
