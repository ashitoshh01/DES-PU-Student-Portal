// ============================================================
// Calendar Module — Mock Data
// ============================================================

export type EventCategory =
  | "my-events"
  | "assignments"
  | "exams"
  | "faculty-announcements"
  | "college-events"
  | "festivals-holidays"
  | "clubs-communities"
  | "project-deadlines"
  | "birthdays";

export type CalendarView = "day" | "week" | "month" | "agenda";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  allDay?: boolean;
  category: EventCategory;
  location?: string;
  organizer?: string;
  participants?: string[];
  recurring?: "daily" | "weekly" | "monthly" | "yearly" | null;
  attachments?: string[];
  registerable?: boolean;
  multiDay?: boolean;
  endDate?: string;
}

export interface CalendarCategory {
  id: EventCategory;
  label: string;
  color: string;
  bgColor: string;
  enabled: boolean;
  count: number;
}

export interface OtherCalendar {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
}

// ============================================================
// Category Definitions
// ============================================================

export const CALENDAR_CATEGORIES: CalendarCategory[] = [
  { id: "my-events", label: "My Events", color: "#3B82F6", bgColor: "#EFF6FF", enabled: true, count: 5 },
  { id: "assignments", label: "Assignments", color: "#E86E0A", bgColor: "#FFF4EB", enabled: true, count: 8 },
  { id: "exams", label: "Exams", color: "#EF4444", bgColor: "#FEF2F2", enabled: true, count: 4 },
  { id: "faculty-announcements", label: "Faculty Announcements", color: "#8B5CF6", bgColor: "#F5F3FF", enabled: true, count: 3 },
  { id: "college-events", label: "College Events", color: "#6366F1", bgColor: "#EEF2FF", enabled: true, count: 6 },
  { id: "festivals-holidays", label: "Festivals & Holidays", color: "#10B981", bgColor: "#ECFDF5", enabled: true, count: 7 },
  { id: "clubs-communities", label: "Clubs & Communities", color: "#06B6D4", bgColor: "#ECFEFF", enabled: true, count: 3 },
  { id: "project-deadlines", label: "Project Deadlines", color: "#F59E0B", bgColor: "#FFFBEB", enabled: true, count: 2 },
  { id: "birthdays", label: "Birthdays", color: "#EC4899", bgColor: "#FDF2F8", enabled: true, count: 4 },
];

export const OTHER_CALENDARS: OtherCalendar[] = [
  { id: "holidays-india", label: "Holidays in India", color: "#10B981", enabled: true },
];

// ============================================================
// Mock Events — May 2025 (matching screenshot)
// ============================================================

export const CALENDAR_EVENTS: CalendarEvent[] = [
  // === Week 1 (Apr 27 – May 3) ===
  {
    id: "e-1",
    title: "Study Session",
    date: "2025-05-01",
    startTime: "10:00",
    endTime: "12:00",
    category: "my-events",
    location: "Library - Section B",
  },
  {
    id: "e-2",
    title: "AI Club Meeting",
    date: "2025-05-02",
    startTime: "16:00",
    endTime: "17:30",
    category: "clubs-communities",
    location: "Lab 203",
  },
  {
    id: "e-3",
    title: "Maharashtra Day",
    date: "2025-05-03",
    allDay: true,
    category: "festivals-holidays",
  },

  // === Week 2 (May 4 – May 10) ===
  {
    id: "e-4",
    title: "DBMS Assignment",
    date: "2025-05-05",
    startTime: "11:59",
    endTime: "11:59",
    category: "assignments",
    description: "Submit DBMS Assignment 2 on portal",
  },
  {
    id: "e-5",
    title: "CN Lab Viva",
    date: "2025-05-06",
    startTime: "14:00",
    endTime: "16:00",
    category: "exams",
    location: "Lab 105",
  },
  {
    id: "e-6",
    title: "DBMS Midterm",
    date: "2025-05-07",
    startTime: "10:00",
    endTime: "12:00",
    category: "exams",
    location: "Exam Hall A",
  },
  {
    id: "e-7",
    title: "OS Assignment",
    date: "2025-05-08",
    startTime: "11:59",
    endTime: "11:59",
    category: "assignments",
    description: "Submit on DESPU",
  },
  {
    id: "e-8",
    title: "Tech Talk: AI",
    date: "2025-05-09",
    startTime: "15:00",
    endTime: "17:00",
    category: "college-events",
    location: "Seminar Hall",
    registerable: true,
  },

  // === Week 3 (May 11 – May 17) ===
  {
    id: "e-9",
    title: "Prepare OS Exam",
    date: "2025-05-12",
    startTime: "09:00",
    endTime: "12:00",
    category: "my-events",
  },
  {
    id: "e-10",
    title: "CN Theory Exam",
    date: "2025-05-14",
    startTime: "09:30",
    endTime: "11:30",
    category: "exams",
    location: "Exam Hall A",
  },
  {
    id: "e-11",
    title: "Faculty Meeting",
    date: "2025-05-15",
    startTime: "11:00",
    endTime: "12:00",
    category: "faculty-announcements",
    location: "Seminar Hall",
  },
  {
    id: "e-12",
    title: "Hackathon 2025",
    date: "2025-05-17",
    startTime: "09:00",
    endTime: "18:00",
    category: "college-events",
    location: "Main Auditorium",
    registerable: true,
    multiDay: true,
    endDate: "2025-05-18",
  },

  // === Week 4 (May 18 – May 24) ===
  {
    id: "e-13",
    title: "Python Assignment",
    date: "2025-05-19",
    startTime: "11:59",
    endTime: "11:59",
    category: "assignments",
  },
  {
    id: "e-14",
    title: "Library Visit",
    date: "2025-05-20",
    startTime: "15:00",
    endTime: "17:00",
    category: "my-events",
    location: "Central Library",
  },
  {
    id: "e-15",
    title: "OS Lab Exam",
    date: "2025-05-22",
    startTime: "14:00",
    endTime: "16:00",
    category: "exams",
    location: "Lab 201",
  },
  {
    id: "e-16",
    title: "Industry Visit",
    date: "2025-05-23",
    startTime: "08:00",
    endTime: "17:00",
    category: "college-events",
    location: "TCS Hinjewadi",
    registerable: true,
  },

  // === Week 5 (May 25 – May 31) ===
  {
    id: "e-17",
    title: "Ganesh Festival",
    date: "2025-05-25",
    allDay: true,
    category: "festivals-holidays",
    multiDay: true,
    endDate: "2025-05-27",
  },
  {
    id: "e-18",
    title: "DSA Assignment",
    date: "2025-05-28",
    startTime: "11:59",
    endTime: "11:59",
    category: "assignments",
  },
  {
    id: "e-19",
    title: "Project Meeting",
    date: "2025-05-29",
    startTime: "16:00",
    endTime: "17:00",
    category: "project-deadlines",
  },
  {
    id: "e-20",
    title: "Project Deadline",
    date: "2025-05-30",
    startTime: "11:59",
    endTime: "11:59",
    category: "project-deadlines",
  },

  // === Overflow into June ===
  {
    id: "e-21",
    title: "Bakri Eid",
    date: "2025-06-01",
    allDay: true,
    category: "festivals-holidays",
  },

  // Extra events for "+N more" indicators
  {
    id: "e-22",
    title: "DSA Lab",
    date: "2025-05-01",
    startTime: "14:00",
    endTime: "16:00",
    category: "my-events",
  },
  {
    id: "e-23",
    title: "CN Tutorial",
    date: "2025-05-01",
    startTime: "16:00",
    endTime: "17:00",
    category: "faculty-announcements",
  },
  {
    id: "e-24",
    title: "Math Quiz",
    date: "2025-05-01",
    startTime: "09:00",
    endTime: "10:00",
    category: "exams",
  },
  {
    id: "e-25",
    title: "OS Tutorial",
    date: "2025-05-14",
    startTime: "14:00",
    endTime: "15:00",
    category: "faculty-announcements",
  },
  {
    id: "e-26",
    title: "Study Session",
    date: "2025-05-15",
    startTime: "10:00",
    endTime: "12:00",
    category: "my-events",
    location: "Library - Section B",
  },
  {
    id: "e-27",
    title: "OS Assignment Deadline",
    date: "2025-05-15",
    startTime: "11:59",
    endTime: "11:59",
    category: "assignments",
    description: "Submit on DESPU",
  },
  {
    id: "e-28",
    title: "Workshop: React",
    date: "2025-05-23",
    startTime: "10:00",
    endTime: "13:00",
    category: "clubs-communities",
    location: "Lab 301",
  },
];

// ============================================================
// Legend items for bottom of calendar
// ============================================================

export const LEGEND_ITEMS = [
  { label: "My Events", color: "#3B82F6" },
  { label: "Assignments", color: "#E86E0A" },
  { label: "Exams", color: "#EF4444" },
  { label: "Faculty Announcements", color: "#8B5CF6" },
  { label: "College Events", color: "#6366F1" },
  { label: "Festivals & Holidays", color: "#10B981" },
  { label: "Project Deadlines", color: "#F59E0B" },
];

// ============================================================
// Upcoming events (for right sidebar)
// ============================================================

export interface UpcomingEventGroup {
  label: string;
  date: string;
  events: {
    id: string;
    title: string;
    time: string;
    location?: string;
    color: string;
  }[];
}

export const UPCOMING_EVENTS: UpcomingEventGroup[] = [
  {
    label: "Today",
    date: "Wed, 14 May",
    events: [
      { id: "u-1", title: "CN Theory Exam", time: "9:30 AM – 12:00 PM", location: "Exam Hall A", color: "#EF4444" },
      { id: "u-2", title: "Faculty Meeting", time: "11:00 AM – 12:00 PM", location: "Seminar Hall", color: "#8B5CF6" },
    ],
  },
  {
    label: "Tomorrow",
    date: "Thu, 15 May",
    events: [
      { id: "u-3", title: "Study Session", time: "10:00 AM – 12:00 PM", location: "Library - Section B", color: "#3B82F6" },
      { id: "u-4", title: "OS Assignment Deadline", time: "11:59 PM", location: "Submit on DESPU", color: "#E86E0A" },
    ],
  },
  {
    label: "Sat, 17 May",
    date: "",
    events: [
      { id: "u-5", title: "Hackathon 2025", time: "9:00 AM – Sun, 18 May", location: "Main Auditorium", color: "#6366F1" },
    ],
  },
];

// ============================================================
// Create menu items
// ============================================================

export const CREATE_MENU_ITEMS = [
  { id: "event", label: "Event", icon: "calendar" },
  { id: "reminder", label: "Reminder", icon: "bell" },
  { id: "task", label: "Task", icon: "check-square" },
  { id: "study-session", label: "Study Session", icon: "book-open" },
];
