import { CampusBuilding, CampusNode, CampusEdge, QRCheckpoint } from '../types/campus';

export const CAMPUS_CENTER = {
  lat: 12.7280165,
  lng: 77.7118602,
  name: "Alliance University, Central Campus",
  zoom: 18
};

export const BUILDINGS: CampusBuilding[] = [
  {
    id: "academic-a",
    name: "Academic Block A",
    shortName: "Block A",
    description: "Computing sciences, classrooms, AI laboratories and faculty cabins.",
    lat: 12.728450,
    lng: 77.711920,
    floors: [
      { id: "ground", name: "Ground Floor" },
      { id: "first", name: "First Floor (Level 1)" }
    ]
  },
  {
    id: "academic-b",
    name: "Academic Block B",
    shortName: "Block B",
    description: "Management studies, humanities, lecture theaters and seminar rooms.",
    lat: 12.728350,
    lng: 77.712600,
    floors: [
      { id: "ground", name: "Main Level" }
    ]
  },
  {
    id: "library",
    name: "Central Library & Knowledge Hub",
    shortName: "Library",
    description: "Silent study zones, digital research labs, periodicals and circulation desk.",
    lat: 12.727650,
    lng: 77.712400,
    floors: [
      { id: "ground", name: "Ground Level" }
    ]
  },
  {
    id: "admin",
    name: "Administration & Admissions Block",
    shortName: "Admin Block",
    description: "Registrar's office, student accounts, admissions counseling and dean's suite.",
    lat: 12.728750,
    lng: 77.711650,
    floors: [
      { id: "ground", name: "Ground Floor" }
    ]
  },
  {
    id: "auditorium",
    name: "University Grand Auditorium",
    shortName: "Auditorium",
    description: "700-seat plenary hall for guest lectures, cultural fests and convocation.",
    lat: 12.727950,
    lng: 77.712850,
    floors: [
      { id: "ground", name: "Ground Floor" }
    ]
  },
  {
    id: "cafeteria",
    name: "Student Cafeteria & Food Court",
    shortName: "Food Court",
    description: "Multi-cuisine dining, snack counters, coffee bars and open terrace seating.",
    lat: 12.729100,
    lng: 77.711200,
    floors: [
      { id: "ground", name: "Ground Floor" }
    ]
  },
  {
    id: "medical",
    name: "Campus Health & Medical Centre",
    shortName: "Medical Centre",
    description: "24/7 resident doctor, emergency first aid, pharmacy and resting beds.",
    lat: 12.727400,
    lng: 77.711300,
    floors: [
      { id: "ground", name: "Ground Floor" }
    ]
  },
  {
    id: "parking",
    name: "Visitor & Faculty Parking Lot",
    shortName: "Parking",
    description: "Covered two-wheeler & four-wheeler parking bays with EV charging.",
    lat: 12.727150,
    lng: 77.712100,
    floors: [
      { id: "ground", name: "Ground Level" }
    ]
  }
];

export const NODES: CampusNode[] = [
  // Outdoor & Campus Perimeter Nodes
  {
    id: "GATE-01",
    name: "Main Campus Entrance Gate",
    buildingId: "campus",
    floorId: "ground",
    x: 50,
    y: 92,
    nodeType: "gate",
    accessible: true,
    description: "Security checkpost, visitor registration and campus bus stop.",
    tags: ["gate", "entrance", "security", "bus", "entry"]
  },
  {
    id: "PATH-01",
    name: "South Central Avenue Junction",
    buildingId: "campus",
    floorId: "ground",
    x: 50,
    y: 75,
    nodeType: "corridor",
    accessible: true,
    description: "Walkway junction connecting Main Gate to Academic Blocks.",
    tags: ["junction", "path", "walkway"]
  },
  {
    id: "PATH-02",
    name: "Central Quad Crossroads",
    buildingId: "campus",
    floorId: "ground",
    x: 50,
    y: 50,
    nodeType: "corridor",
    accessible: true,
    description: "Primary campus square with landmark fountain and directional signs.",
    tags: ["junction", "plaza", "center", "square"]
  },
  {
    id: "PATH-03",
    name: "North Promenade Junction",
    buildingId: "campus",
    floorId: "ground",
    x: 50,
    y: 25,
    nodeType: "corridor",
    accessible: true,
    description: "Pathway leading towards Cafeteria and Administration.",
    tags: ["junction", "north"]
  },

  // Academic Block A - Ground Floor
  {
    id: "A-ENTRANCE",
    name: "Academic Block A Entrance",
    buildingId: "academic-a",
    floorId: "ground",
    x: 50,
    y: 90,
    nodeType: "entrance",
    accessible: true,
    description: "Wide glass entrance doors with ADA ramp access.",
    tags: ["entrance", "block a", "door", "ramp", "accessible"],
    photoUrl: "/photos/block-a-entrance.jpg"
  },
  {
    id: "A-G-01",
    name: "Block A Ground Foyer Checkpoint",
    buildingId: "academic-a",
    floorId: "ground",
    x: 50,
    y: 72,
    nodeType: "corridor",
    accessible: true,
    description: "Primary indoor lobby with digital campus directory and QR checkpoint.",
    tags: ["foyer", "lobby", "checkpoint", "qr", "info"],
    photoUrl: "/photos/elevator-foyer.jpg"
  },
  {
    id: "A-G-02",
    name: "Block A Central Hallway (L1)",
    buildingId: "academic-a",
    floorId: "ground",
    x: 50,
    y: 52,
    nodeType: "corridor",
    accessible: true,
    description: "Main corridor providing access to elevator, stairs, and classrooms.",
    tags: ["corridor", "hallway"],
    photoUrl: "/photos/elevator-foyer.jpg"
  },
  {
    id: "A-ELEVATOR",
    name: "Block A Elevator (Ground Floor)",
    buildingId: "academic-a",
    floorId: "ground",
    x: 65,
    y: 52,
    nodeType: "elevator",
    accessible: true,
    description: "Accessible automatic passenger lift serving Ground and First Floor.",
    tags: ["elevator", "lift", "accessible", "wheelchair", "up", "first floor"],
    photoUrl: "/photos/elevator-foyer.jpg"
  },
  {
    id: "A-STAIRS",
    name: "Block A Central Staircase (Ground)",
    buildingId: "academic-a",
    floorId: "ground",
    x: 35,
    y: 52,
    nodeType: "stairs",
    accessible: false,
    description: "Wide stairwell connecting Ground Floor to Level 1.",
    tags: ["stairs", "steps", "stairwell"]
  },
  {
    id: "A-ROOM-101",
    name: "Lecture Hall A-101",
    buildingId: "academic-a",
    floorId: "ground",
    x: 22,
    y: 35,
    nodeType: "classroom",
    accessible: true,
    description: "Tiered 100-seat classroom equipped with smart projectors.",
    tags: ["class", "lecture", "hall", "101", "room"]
  },
  {
    id: "A-FACULTY",
    name: "Faculty Room & Dean's Associate",
    buildingId: "academic-a",
    floorId: "ground",
    x: 78,
    y: 35,
    nodeType: "office",
    accessible: true,
    description: "Staff consultation cabins for computer science department.",
    tags: ["office", "faculty", "professors", "teachers", "staff"]
  },

  // Academic Block A - First Floor
  {
    id: "A-F1-ELEV",
    name: "Block A Elevator (First Floor)",
    buildingId: "academic-a",
    floorId: "first",
    x: 65,
    y: 52,
    nodeType: "elevator",
    accessible: true,
    description: "Elevator door exit on Floor 1, step-free access to labs.",
    tags: ["elevator", "lift", "accessible", "exit"]
  },
  {
    id: "A-F1-STAIR",
    name: "Block A Stair Landing (First Floor)",
    buildingId: "academic-a",
    floorId: "first",
    x: 35,
    y: 52,
    nodeType: "stairs",
    accessible: false,
    description: "Stairwell arrival landing on First Floor.",
    tags: ["stairs", "landing"]
  },
  {
    id: "A-F1-01",
    name: "Block A Level 1 Foyer",
    buildingId: "academic-a",
    floorId: "first",
    x: 50,
    y: 52,
    nodeType: "corridor",
    accessible: true,
    description: "First floor elevator & stair lobby with seating lounge.",
    tags: ["foyer", "floor 1", "lobby"]
  },
  {
    id: "A-F1-02",
    name: "Block A Level 1 North Hallway",
    buildingId: "academic-a",
    floorId: "first",
    x: 50,
    y: 32,
    nodeType: "corridor",
    accessible: true,
    description: "Corridor leading to Computer Lab A-202 and Classroom A-201.",
    tags: ["corridor", "hallway", "labs"]
  },
  {
    id: "computer-lab-a202",
    name: "Computer Lab A-202",
    buildingId: "academic-a",
    floorId: "first",
    x: 20,
    y: 20,
    nodeType: "lab",
    accessible: true,
    description: "Advanced Computing & AI Lab with 60 high-performance workstations.",
    tags: ["lab", "computer", "coding", "a-202", "a202", "ai", "hackathon", "programming"],
    photoUrl: "/photos/lab-a202.jpg"
  },
  {
    id: "A-ROOM-201",
    name: "Classroom A-201",
    buildingId: "academic-a",
    floorId: "first",
    x: 80,
    y: 20,
    nodeType: "classroom",
    accessible: true,
    description: "Smart classroom with interactive touchscreen whiteboard.",
    tags: ["class", "room", "a201", "201", "lecture"]
  },

  // Academic Block B
  {
    id: "B-ENTRANCE",
    name: "Academic Block B Entrance",
    buildingId: "academic-b",
    floorId: "ground",
    x: 75,
    y: 55,
    nodeType: "entrance",
    accessible: true,
    description: "Main foyer of Block B with student display boards.",
    tags: ["block b", "entrance", "management"]
  },
  {
    id: "B-G-01",
    name: "Block B Central Atrium",
    buildingId: "academic-b",
    floorId: "ground",
    x: 85,
    y: 55,
    nodeType: "corridor",
    accessible: true,
    description: "Atrium hub for Block B lecture rooms.",
    tags: ["atrium", "hallway"]
  },

  // Central Library
  {
    id: "LIB-ENTRANCE",
    name: "Central Library Main Gate",
    buildingId: "library",
    floorId: "ground",
    x: 30,
    y: 40,
    nodeType: "entrance",
    accessible: true,
    description: "Turnstile entry and bag deposit counter.",
    tags: ["library", "books", "entrance", "reading", "study"]
  },
  {
    id: "LIB-READING",
    name: "Library Silent Reading & Digital Hub",
    buildingId: "library",
    floorId: "ground",
    x: 20,
    y: 35,
    nodeType: "facility",
    accessible: true,
    description: "Quiet reading hall with individual study cubicles and print station.",
    tags: ["reading", "study", "silent", "printer", "e-library"]
  },

  // Administration & Admissions
  {
    id: "ADMIN-ENTRANCE",
    name: "Administration Building Entry",
    buildingId: "admin",
    floorId: "ground",
    x: 50,
    y: 18,
    nodeType: "entrance",
    accessible: true,
    description: "Front portico of Administration Block.",
    tags: ["admin", "office", "entrance"]
  },
  {
    id: "ADMISSIONS",
    name: "Admissions & Registrar Office",
    buildingId: "admin",
    floorId: "ground",
    x: 50,
    y: 10,
    nodeType: "office",
    accessible: true,
    description: "Official student enrollment desk, verification and fee inquiries.",
    tags: ["admissions", "registrar", "fees", "registration", "helpdesk"]
  },

  // Auditorium
  {
    id: "AUDIT-ENTRANCE",
    name: "Grand Auditorium Entry Plaza",
    buildingId: "auditorium",
    floorId: "ground",
    x: 75,
    y: 35,
    nodeType: "facility",
    accessible: true,
    description: "Auditorium double-door foyer with event registration booths.",
    tags: ["auditorium", "event", "hall", "speaker", "seminar"]
  },

  // Cafeteria
  {
    id: "CAFE-ENTRANCE",
    name: "Student Cafeteria & Food Court",
    buildingId: "cafeteria",
    floorId: "ground",
    x: 80,
    y: 18,
    nodeType: "facility",
    accessible: true,
    description: "Cafeteria food stations, coffee kiosks, snacks and washrooms.",
    tags: ["food", "canteen", "cafe", "lunch", "coffee", "eating", "meals"]
  },

  // Medical Centre
  {
    id: "MED-ENTRANCE",
    name: "Campus Health & First Aid Clinic",
    buildingId: "medical",
    floorId: "ground",
    x: 25,
    y: 75,
    nodeType: "facility",
    accessible: true,
    description: "Infirmary with emergency medical assistance.",
    tags: ["medical", "clinic", "doctor", "first aid", "health", "nurse"]
  },

  // Parking
  {
    id: "PARK-01",
    name: "Main Visitor Parking Bay",
    buildingId: "parking",
    floorId: "ground",
    x: 80,
    y: 85,
    nodeType: "parking",
    accessible: true,
    description: "Paved parking area with accessible stalls closest to entrance.",
    tags: ["parking", "car", "bike", "vehicle"]
  }
];

export const EDGES: CampusEdge[] = [
  // Outdoor Spine Connections
  { from: "GATE-01", to: "PATH-01", distance: 30, connectionType: "outdoor", accessible: true },
  { from: "PATH-01", to: "PATH-02", distance: 35, connectionType: "outdoor", accessible: true },
  { from: "PATH-02", to: "PATH-03", distance: 35, connectionType: "outdoor", accessible: true },

  // Outdoor branches to buildings
  { from: "PATH-01", to: "MED-ENTRANCE", distance: 25, connectionType: "outdoor", accessible: true },
  { from: "PATH-01", to: "PARK-01", distance: 30, connectionType: "outdoor", accessible: true },

  { from: "PATH-02", to: "A-ENTRANCE", distance: 20, connectionType: "outdoor", accessible: true },
  { from: "PATH-02", to: "B-ENTRANCE", distance: 25, connectionType: "outdoor", accessible: true },
  { from: "PATH-02", to: "LIB-ENTRANCE", distance: 28, connectionType: "outdoor", accessible: true },
  { from: "PATH-02", to: "AUDIT-ENTRANCE", distance: 32, connectionType: "outdoor", accessible: true },

  { from: "PATH-03", to: "ADMIN-ENTRANCE", distance: 20, connectionType: "outdoor", accessible: true },
  { from: "PATH-03", to: "CAFE-ENTRANCE", distance: 28, connectionType: "outdoor", accessible: true },

  // Academic Block A - Ground Floor indoor
  { from: "A-ENTRANCE", to: "A-G-01", distance: 8, connectionType: "corridor", accessible: true },
  { from: "A-G-01", to: "A-G-02", distance: 12, connectionType: "corridor", accessible: true },
  { from: "A-G-02", to: "A-ELEVATOR", distance: 6, connectionType: "corridor", accessible: true },
  { from: "A-G-02", to: "A-STAIRS", distance: 6, connectionType: "corridor", accessible: true },
  { from: "A-G-02", to: "A-ROOM-101", distance: 14, connectionType: "corridor", accessible: true },
  { from: "A-G-02", to: "A-FACULTY", distance: 14, connectionType: "corridor", accessible: true },

  // Floor Transitions (Academic Block A)
  // Elevator is accessible; Stairs are NOT accessible
  { from: "A-ELEVATOR", to: "A-F1-ELEV", distance: 4, connectionType: "elevator", accessible: true },
  { from: "A-STAIRS", to: "A-F1-STAIR", distance: 8, connectionType: "staircase", accessible: false },

  // Academic Block A - First Floor indoor
  { from: "A-F1-ELEV", to: "A-F1-01", distance: 6, connectionType: "corridor", accessible: true },
  { from: "A-F1-STAIR", to: "A-F1-01", distance: 6, connectionType: "corridor", accessible: true },
  { from: "A-F1-01", to: "A-F1-02", distance: 10, connectionType: "corridor", accessible: true },
  { from: "A-F1-02", to: "computer-lab-a202", distance: 12, connectionType: "corridor", accessible: true },
  { from: "A-F1-02", to: "A-ROOM-201", distance: 12, connectionType: "corridor", accessible: true },

  // Block B Indoor
  { from: "B-ENTRANCE", to: "B-G-01", distance: 10, connectionType: "corridor", accessible: true },

  // Library Indoor
  { from: "LIB-ENTRANCE", to: "LIB-READING", distance: 12, connectionType: "corridor", accessible: true },

  // Admin Indoor
  { from: "ADMIN-ENTRANCE", to: "ADMISSIONS", distance: 10, connectionType: "corridor", accessible: true }
];

export const QR_CHECKPOINTS: QRCheckpoint[] = [
  {
    campusId: "alliance-central",
    buildingId: "academic-a",
    floorId: "ground",
    nodeId: "A-G-01",
    name: "Block A Ground Foyer Checkpoint"
  },
  {
    campusId: "alliance-central",
    buildingId: "academic-a",
    floorId: "first",
    nodeId: "A-F1-01",
    name: "Block A Floor 1 Elevator Lobby"
  },
  {
    campusId: "alliance-central",
    buildingId: "campus",
    floorId: "ground",
    nodeId: "GATE-01",
    name: "Main Campus Entrance Gate"
  },
  {
    campusId: "alliance-central",
    buildingId: "library",
    floorId: "ground",
    nodeId: "LIB-ENTRANCE",
    name: "Central Library Entrance"
  },
  {
    campusId: "alliance-central",
    buildingId: "cafeteria",
    floorId: "ground",
    nodeId: "CAFE-ENTRANCE",
    name: "Cafeteria Main Entrance"
  }
];
