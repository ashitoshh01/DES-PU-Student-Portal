// ============================================================
// Resources Module — Mock Data
// ============================================================

export interface Department {
  id: string;
  name: string;
  years: Year[];
}

export interface Year {
  id: string;
  name: string;
  semesters: Semester[];
}

export interface Semester {
  id: string;
  name: string;
  number: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  faculty: string;
  resources: number;
  downloads: number;
  color: string;
  bg: string;
  icon: string; // emoji or icon key
  semesterId: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  subject: string;
  subjectId: string;
  type: ResourceType;
  uploadedBy: string;
  uploaderAvatar: string;
  uploaderRole: string;
  upvotes: number;
  downloads: number;
  rating: number;
  uploadDate: string;
  badges: Badge[];
  fileSize: string;
  fileType: string;
  semesterId: string;
  bookmarked?: boolean;
}

export type ResourceType =
  | "Notes"
  | "PPTs"
  | "Assignments"
  | "Lab Manuals"
  | "PYQ Papers"
  | "Books"
  | "Faculty Resources";

export type Badge = "Topper" | "Faculty" | "Verified" | "PYQ" | "Popular";

export interface Contributor {
  id: string;
  name: string;
  avatar: string;
  resources: number;
  color: string;
}

export interface ResourceRequest {
  id: string;
  title: string;
  subject: string;
  description: string;
  requestedBy: string;
  date: string;
  fulfilled: boolean;
}

// ============================================================
// Department Tree
// ============================================================

export const DEPARTMENTS: Department[] = [
  {
    id: "cse",
    name: "Computer Science",
    years: [
      {
        id: "cse-1",
        name: "First Year",
        semesters: [
          { id: "cse-1-1", name: "Semester 1", number: 1 },
          { id: "cse-1-2", name: "Semester 2", number: 2 },
        ],
      },
      {
        id: "cse-2",
        name: "Second Year",
        semesters: [
          { id: "cse-2-3", name: "Semester 3", number: 3 },
          { id: "cse-2-4", name: "Semester 4", number: 4 },
        ],
      },
      {
        id: "cse-3",
        name: "Third Year",
        semesters: [
          { id: "cse-3-5", name: "Semester 5", number: 5 },
          { id: "cse-3-6", name: "Semester 6", number: 6 },
        ],
      },
      {
        id: "cse-4",
        name: "Final Year",
        semesters: [
          { id: "cse-4-7", name: "Semester 7", number: 7 },
          { id: "cse-4-8", name: "Semester 8", number: 8 },
        ],
      },
    ],
  },
  {
    id: "ece",
    name: "Electronics & Telecom",
    years: [
      {
        id: "ece-1",
        name: "First Year",
        semesters: [
          { id: "ece-1-1", name: "Semester 1", number: 1 },
          { id: "ece-1-2", name: "Semester 2", number: 2 },
        ],
      },
      {
        id: "ece-2",
        name: "Second Year",
        semesters: [
          { id: "ece-2-3", name: "Semester 3", number: 3 },
          { id: "ece-2-4", name: "Semester 4", number: 4 },
        ],
      },
      {
        id: "ece-3",
        name: "Third Year",
        semesters: [
          { id: "ece-3-5", name: "Semester 5", number: 5 },
          { id: "ece-3-6", name: "Semester 6", number: 6 },
        ],
      },
      {
        id: "ece-4",
        name: "Final Year",
        semesters: [
          { id: "ece-4-7", name: "Semester 7", number: 7 },
          { id: "ece-4-8", name: "Semester 8", number: 8 },
        ],
      },
    ],
  },
  {
    id: "mech",
    name: "Mechanical Engineering",
    years: [
      {
        id: "mech-1",
        name: "First Year",
        semesters: [
          { id: "mech-1-1", name: "Semester 1", number: 1 },
          { id: "mech-1-2", name: "Semester 2", number: 2 },
        ],
      },
      {
        id: "mech-2",
        name: "Second Year",
        semesters: [
          { id: "mech-2-3", name: "Semester 3", number: 3 },
          { id: "mech-2-4", name: "Semester 4", number: 4 },
        ],
      },
      {
        id: "mech-3",
        name: "Third Year",
        semesters: [
          { id: "mech-3-5", name: "Semester 5", number: 5 },
          { id: "mech-3-6", name: "Semester 6", number: 6 },
        ],
      },
      {
        id: "mech-4",
        name: "Final Year",
        semesters: [
          { id: "mech-4-7", name: "Semester 7", number: 7 },
          { id: "mech-4-8", name: "Semester 8", number: 8 },
        ],
      },
    ],
  },
  {
    id: "civil",
    name: "Civil Engineering",
    years: [
      {
        id: "civil-1",
        name: "First Year",
        semesters: [
          { id: "civil-1-1", name: "Semester 1", number: 1 },
          { id: "civil-1-2", name: "Semester 2", number: 2 },
        ],
      },
      {
        id: "civil-2",
        name: "Second Year",
        semesters: [
          { id: "civil-2-3", name: "Semester 3", number: 3 },
          { id: "civil-2-4", name: "Semester 4", number: 4 },
        ],
      },
      {
        id: "civil-3",
        name: "Third Year",
        semesters: [
          { id: "civil-3-5", name: "Semester 5", number: 5 },
          { id: "civil-3-6", name: "Semester 6", number: 6 },
        ],
      },
      {
        id: "civil-4",
        name: "Final Year",
        semesters: [
          { id: "civil-4-7", name: "Semester 7", number: 7 },
          { id: "civil-4-8", name: "Semester 8", number: 8 },
        ],
      },
    ],
  },
  {
    id: "it",
    name: "Information Technology",
    years: [
      {
        id: "it-1",
        name: "First Year",
        semesters: [
          { id: "it-1-1", name: "Semester 1", number: 1 },
          { id: "it-1-2", name: "Semester 2", number: 2 },
        ],
      },
      {
        id: "it-2",
        name: "Second Year",
        semesters: [
          { id: "it-2-3", name: "Semester 3", number: 3 },
          { id: "it-2-4", name: "Semester 4", number: 4 },
        ],
      },
      {
        id: "it-3",
        name: "Third Year",
        semesters: [
          { id: "it-3-5", name: "Semester 5", number: 5 },
          { id: "it-3-6", name: "Semester 6", number: 6 },
        ],
      },
      {
        id: "it-4",
        name: "Final Year",
        semesters: [
          { id: "it-4-7", name: "Semester 7", number: 7 },
          { id: "it-4-8", name: "Semester 8", number: 8 },
        ],
      },
    ],
  },
];

// ============================================================
// Subjects for CSE Semester 3
// ============================================================

export const SUBJECTS: Subject[] = [
  {
    id: "sub-dbms",
    name: "DBMS",
    code: "CS301",
    faculty: "Database Management Systems",
    resources: 56,
    downloads: 1200,
    color: "#E86E0A",
    bg: "#FFF4EB",
    icon: "database",
    semesterId: "cse-2-3",
  },
  {
    id: "sub-dsa",
    name: "DSA",
    code: "CS302",
    faculty: "Data Structures & Algorithms",
    resources: 42,
    downloads: 980,
    color: "#10B981",
    bg: "#ECFDF5",
    icon: "code",
    semesterId: "cse-2-3",
  },
  {
    id: "sub-cn",
    name: "Computer Networks",
    code: "CS303",
    faculty: "Computer Networks",
    resources: 38,
    downloads: 864,
    color: "#3B82F6",
    bg: "#EFF6FF",
    icon: "network",
    semesterId: "cse-2-3",
  },
  {
    id: "sub-math3",
    name: "Mathematics-III",
    code: "MA301",
    faculty: "Mathematics for CSE",
    resources: 28,
    downloads: 645,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    icon: "calculator",
    semesterId: "cse-2-3",
  },
  {
    id: "sub-os",
    name: "Operating Systems",
    code: "CS304",
    faculty: "Operating Systems",
    resources: 31,
    downloads: 710,
    color: "#EC4899",
    bg: "#FDF2F8",
    icon: "monitor",
    semesterId: "cse-2-3",
  },
];

// ============================================================
// Resources
// ============================================================

export const RESOURCES: Resource[] = [
  {
    id: "r-1",
    title: "DBMS Unit 2 Notes - ER Model",
    description: "Comprehensive notes on ER Model with examples",
    subject: "DBMS",
    subjectId: "sub-dbms",
    type: "Notes",
    uploadedBy: "Neha Joshi",
    uploaderAvatar: "NJ",
    uploaderRole: "TY CSE",
    upvotes: 45,
    downloads: 230,
    rating: 4.8,
    uploadDate: "2 hours ago",
    badges: ["Topper", "Verified"],
    fileSize: "2.4 MB",
    fileType: "pdf",
    semesterId: "cse-2-3",
  },
  {
    id: "r-2",
    title: "Computer Networks - Unit 1 PPT",
    description: "Introduction to Computer Networks",
    subject: "CN",
    subjectId: "sub-cn",
    type: "PPTs",
    uploadedBy: "Prof. R. K. Patil",
    uploaderAvatar: "RP",
    uploaderRole: "Faculty",
    upvotes: 32,
    downloads: 198,
    rating: 4.5,
    uploadDate: "5 hours ago",
    badges: ["Faculty"],
    fileSize: "8.1 MB",
    fileType: "pptx",
    semesterId: "cse-2-3",
  },
  {
    id: "r-3",
    title: "DSA Assignment 2 Solution",
    description: "Solutions to Assignment 2",
    subject: "DSA",
    subjectId: "sub-dsa",
    type: "Assignments",
    uploadedBy: "Amit Verma",
    uploaderAvatar: "AV",
    uploaderRole: "TY CSE",
    upvotes: 28,
    downloads: 156,
    rating: 4.3,
    uploadDate: "Yesterday",
    badges: ["Verified"],
    fileSize: "1.2 MB",
    fileType: "pdf",
    semesterId: "cse-2-3",
  },
  {
    id: "r-4",
    title: "OS Lab Manual",
    description: "Complete Lab Manual with programs",
    subject: "OS",
    subjectId: "sub-os",
    type: "Lab Manuals",
    uploadedBy: "Prof. S. A. Kulkarni",
    uploaderAvatar: "SK",
    uploaderRole: "Faculty",
    upvotes: 40,
    downloads: 312,
    rating: 4.9,
    uploadDate: "2 days ago",
    badges: ["Faculty", "Verified"],
    fileSize: "5.6 MB",
    fileType: "pdf",
    semesterId: "cse-2-3",
  },
  {
    id: "r-5",
    title: "DBMS Previous Year Papers (2019-23)",
    description: "5 Years Previous Year Question Papers",
    subject: "DBMS",
    subjectId: "sub-dbms",
    type: "PYQ Papers",
    uploadedBy: "Rahul Patil",
    uploaderAvatar: "RP",
    uploaderRole: "Final Year CSE",
    upvotes: 55,
    downloads: 512,
    rating: 4.7,
    uploadDate: "2 days ago",
    badges: ["PYQ", "Popular"],
    fileSize: "12.3 MB",
    fileType: "pdf",
    semesterId: "cse-2-3",
  },
  {
    id: "r-6",
    title: "Mathematics-III Textbook Notes",
    description: "Chapter-wise handwritten notes covering all units",
    subject: "Maths",
    subjectId: "sub-math3",
    type: "Notes",
    uploadedBy: "Sneha Deshmukh",
    uploaderAvatar: "SD",
    uploaderRole: "TY CSE",
    upvotes: 38,
    downloads: 245,
    rating: 4.6,
    uploadDate: "3 days ago",
    badges: ["Topper"],
    fileSize: "18.2 MB",
    fileType: "pdf",
    semesterId: "cse-2-3",
  },
  {
    id: "r-7",
    title: "CN Lab Manual - Socket Programming",
    description: "Complete socket programming lab experiments",
    subject: "CN",
    subjectId: "sub-cn",
    type: "Lab Manuals",
    uploadedBy: "Prof. R. K. Patil",
    uploaderAvatar: "RP",
    uploaderRole: "Faculty",
    upvotes: 22,
    downloads: 178,
    rating: 4.4,
    uploadDate: "4 days ago",
    badges: ["Faculty"],
    fileSize: "3.8 MB",
    fileType: "pdf",
    semesterId: "cse-2-3",
  },
  {
    id: "r-8",
    title: "DSA Reference Book - Cormen",
    description: "Introduction to Algorithms by CLRS - Key chapters summary",
    subject: "DSA",
    subjectId: "sub-dsa",
    type: "Books",
    uploadedBy: "Library",
    uploaderAvatar: "LB",
    uploaderRole: "Library",
    upvotes: 67,
    downloads: 890,
    rating: 4.9,
    uploadDate: "1 week ago",
    badges: ["Verified", "Popular"],
    fileSize: "45.2 MB",
    fileType: "pdf",
    semesterId: "cse-2-3",
  },
];

// ============================================================
// Top Contributors
// ============================================================

export const CONTRIBUTORS: Contributor[] = [
  {
    id: "c-1",
    name: "Neha Joshi",
    avatar: "NJ",
    resources: 1200,
    color: "#E86E0A",
  },
  {
    id: "c-2",
    name: "Amit Verma",
    avatar: "AV",
    resources: 905,
    color: "#3B82F6",
  },
  {
    id: "c-3",
    name: "Rahul Patil",
    avatar: "RP",
    resources: 732,
    color: "#10B981",
  },
];

// ============================================================
// User Profile (current user context)
// ============================================================

export const CURRENT_USER = {
  name: "Ashitosh",
  fullName: "Ashitosh Lavhate",
  department: "CSE",
  departmentFull: "Computer Science Engineering",
  year: "Second Year",
  semester: 3,
  semesterId: "cse-2-3",
  avatar: "AL",
};

// ============================================================
// Stats
// ============================================================

export const RESOURCE_STATS = {
  totalResources: 128,
  downloads: 2400,
  upvotes: 312,
  avgRating: 4.8,
};

// ============================================================
// Resource Types for filter
// ============================================================

export const RESOURCE_TYPES: { label: ResourceType; count: number }[] = [
  { label: "Notes", count: 66 },
  { label: "PPTs", count: 24 },
  { label: "Assignments", count: 15 },
  { label: "Lab Manuals", count: 10 },
  { label: "PYQ Papers", count: 8 },
  { label: "Books", count: 3 },
  { label: "Faculty Resources", count: 20 },
];
