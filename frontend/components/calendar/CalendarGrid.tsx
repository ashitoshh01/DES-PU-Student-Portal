"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
} from "lucide-react";
import {
  CALENDAR_EVENTS,
  CALENDAR_CATEGORIES,
  LEGEND_ITEMS,
} from "@/lib/calendar-mock-data";
import { useCalendarStore } from "@/store/calendar.store";
import type { CalendarEvent, CalendarView } from "@/lib/calendar-mock-data";

// ============================================================
// Helpers
// ============================================================

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  // Previous month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrev - i,
      month: month - 1 < 0 ? 11 : month - 1,
      year: month - 1 < 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, isCurrentMonth: true });
  }

  // Next month fill
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      day: d,
      month: month + 1 > 11 ? 0 : month + 1,
      year: month + 1 > 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  return cells;
}

function dateToKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getCategoryColor(categoryId: string) {
  return CALENDAR_CATEGORIES.find((c) => c.id === categoryId)?.color || "#6B7280";
}

function getCategoryBg(categoryId: string) {
  return CALENDAR_CATEGORIES.find((c) => c.id === categoryId)?.bgColor || "#F3F4F6";
}

function formatTimeShort(time?: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${ampm}` : `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ============================================================
// Component
// ============================================================

export default function CalendarGrid() {
  const {
    currentDate,
    activeView,
    setActiveView,
    goToToday,
    goToPrev,
    goToNext,
    enabledCategories,
    setSelectedEventId,
    setCurrentDate,
    setMiniCalDate,
  } = useCalendarStore();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  // Group events by date key
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    CALENDAR_EVENTS.forEach((ev) => {
      if (!enabledCategories.has(ev.category)) return;
      const key = ev.date;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [enabledCategories]);

  const views: { id: CalendarView; label: string }[] = [
    { id: "day", label: "Day" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "agenda", label: "Agenda" },
  ];

  // "Today" reference (May 14, 2025 for mock)
  const todayKey = "2025-05-14";

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0">
      {/* Top Controls */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-shrink-0 flex-wrap">
        {/* Left: Today + nav + month label */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-xl border border-border text-[13px] font-semibold text-text-primary hover:bg-background transition-colors"
          >
            Today
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={goToPrev}
              className="p-1.5 rounded-lg hover:bg-background transition-colors"
            >
              <ChevronLeft size={18} className="text-text-secondary" />
            </button>
            <button
              onClick={goToNext}
              className="p-1.5 rounded-lg hover:bg-background transition-colors"
            >
              <ChevronRight size={18} className="text-text-secondary" />
            </button>
          </div>

          <h2 className="text-[18px] font-bold text-text-primary">
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>

        {/* Right: View toggles + filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-background rounded-xl border border-border/50 p-0.5">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={`
                  px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all
                  ${
                    activeView === v.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }
                `}
              >
                {v.label}
              </button>
            ))}
          </div>

          <button className="p-2 rounded-xl hover:bg-background border border-border/50 transition-colors">
            <Filter size={15} className="text-text-secondary" />
          </button>

          <button className="p-2 rounded-xl hover:bg-background border border-border/50 transition-colors">
            <MoreVertical size={15} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {activeView === "month" && (
        <MonthView
          grid={grid}
          eventsByDate={eventsByDate}
          todayKey={todayKey}
          year={year}
          month={month}
          onEventClick={setSelectedEventId}
          onDateClick={(d) => {
            setCurrentDate(d);
            setMiniCalDate(d);
          }}
        />
      )}

      {activeView === "week" && (
        <WeekView
          currentDate={currentDate}
          eventsByDate={eventsByDate}
          todayKey={todayKey}
          onEventClick={setSelectedEventId}
        />
      )}

      {activeView === "day" && (
        <DayView
          currentDate={currentDate}
          eventsByDate={eventsByDate}
          todayKey={todayKey}
          onEventClick={setSelectedEventId}
        />
      )}

      {activeView === "agenda" && (
        <AgendaView
          eventsByDate={eventsByDate}
          currentDate={currentDate}
          onEventClick={setSelectedEventId}
        />
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 pt-3 pb-1 flex-shrink-0 flex-wrap">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] font-medium text-text-secondary">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Month View
// ============================================================

function MonthView({
  grid,
  eventsByDate,
  todayKey,
  year,
  month,
  onEventClick,
  onDateClick,
}: {
  grid: { day: number; month: number; year: number; isCurrentMonth: boolean }[];
  eventsByDate: Record<string, CalendarEvent[]>;
  todayKey: string;
  year: number;
  month: number;
  onEventClick: (id: string) => void;
  onDateClick: (d: Date) => void;
}) {
  const MAX_VISIBLE = 2;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-border overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border/50">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="py-2.5 text-center text-[11px] font-bold text-text-secondary tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {grid.map((cell, i) => {
          const key = dateToKey(cell.year, cell.month, cell.day);
          const isToday = key === todayKey;
          const events = eventsByDate[key] || [];
          const visible = events.slice(0, MAX_VISIBLE);
          const moreCount = events.length - MAX_VISIBLE;

          return (
            <div
              key={i}
              onClick={() => onDateClick(new Date(cell.year, cell.month, cell.day))}
              className={`
                relative min-h-[100px] p-1.5 border-b border-r border-border/30 cursor-pointer transition-colors hover:bg-primary-light/20
                ${!cell.isCurrentMonth ? "bg-background/40" : ""}
              `}
            >
              {/* Day number */}
              <div className="flex justify-start mb-0.5">
                <span
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-semibold
                    ${isToday ? "bg-primary text-white" : ""}
                    ${!cell.isCurrentMonth ? "text-text-secondary/40" : "text-text-primary"}
                  `}
                >
                  {cell.day}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-0.5">
                {visible.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(ev.id);
                    }}
                    className="w-full text-left rounded-md px-1.5 py-[3px] text-[10px] font-semibold truncate transition-all hover:opacity-80"
                    style={{
                      backgroundColor: getCategoryColor(ev.category),
                      color: "#FFFFFF",
                    }}
                  >
                    {ev.allDay ? (
                      <span>{ev.title}<span className="ml-1 font-normal opacity-80">All Day</span></span>
                    ) : (
                      <span>
                        {ev.title}
                        {ev.startTime && (
                          <span className="ml-1 font-normal opacity-80">
                            {formatTimeShort(ev.startTime)}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                ))}
                {moreCount > 0 && (
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] font-semibold text-text-secondary hover:text-primary transition-colors pl-1"
                  >
                    + {moreCount} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Week View
// ============================================================

function WeekView({
  currentDate,
  eventsByDate,
  todayKey,
  onEventClick,
}: {
  currentDate: Date;
  eventsByDate: Record<string, CalendarEvent[]>;
  todayKey: string;
  onEventClick: (id: string) => void;
}) {
  const dayOfWeek = currentDate.getDay();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header with day names and dates */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/50">
        <div className="py-2.5 text-center text-[11px] font-bold text-text-secondary" />
        {weekDays.map((d, i) => {
          const key = dateToKey(d.getFullYear(), d.getMonth(), d.getDate());
          const isToday = key === todayKey;
          return (
            <div key={i} className="py-2.5 text-center">
              <span className="text-[10px] font-bold text-text-secondary tracking-wider">
                {DAY_HEADERS[i]}
              </span>
              <div className="mt-0.5">
                <span
                  className={`
                    inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold
                    ${isToday ? "bg-primary text-white" : "text-text-primary"}
                  `}
                >
                  {d.getDate()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[50px] border-b border-border/20">
            <div className="text-[10px] font-medium text-text-secondary text-right pr-2 pt-1">
              {hour % 12 || 12} {hour >= 12 ? "PM" : "AM"}
            </div>
            {weekDays.map((d, di) => {
              const key = dateToKey(d.getFullYear(), d.getMonth(), d.getDate());
              const dayEvents = eventsByDate[key] || [];
              const hourEvents = dayEvents.filter((ev) => {
                if (ev.allDay) return false;
                const h = ev.startTime ? parseInt(ev.startTime.split(":")[0]) : -1;
                return h === hour;
              });

              return (
                <div key={di} className="border-l border-border/20 relative px-0.5 py-0.5">
                  {hourEvents.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => onEventClick(ev.id)}
                      className="w-full text-left rounded px-1 py-0.5 text-[9px] font-semibold truncate mb-0.5"
                      style={{
                        backgroundColor: getCategoryBg(ev.category),
                        color: getCategoryColor(ev.category),
                        borderLeft: `2px solid ${getCategoryColor(ev.category)}`,
                      }}
                    >
                      {ev.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Day View
// ============================================================

function DayView({
  currentDate,
  eventsByDate,
  todayKey,
  onEventClick,
}: {
  currentDate: Date;
  eventsByDate: Record<string, CalendarEvent[]>;
  todayKey: string;
  onEventClick: (id: string) => void;
}) {
  const key = dateToKey(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const isToday = key === todayKey;
  const dayEvents = eventsByDate[key] || [];
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = currentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
        <span
          className={`
            inline-flex items-center justify-center w-10 h-10 rounded-full text-[16px] font-bold
            ${isToday ? "bg-primary text-white" : "bg-background text-text-primary"}
          `}
        >
          {currentDate.getDate()}
        </span>
        <div>
          <p className="text-[13px] font-bold text-text-primary">{dayName}</p>
          <p className="text-[11px] text-text-secondary">{dateLabel}</p>
        </div>
      </div>

      {/* All-day events */}
      {dayEvents.filter((ev) => ev.allDay).length > 0 && (
        <div className="px-4 py-2 border-b border-border/30">
          <span className="text-[10px] font-semibold text-text-secondary uppercase">All Day</span>
          <div className="mt-1 space-y-1">
            {dayEvents.filter((ev) => ev.allDay).map((ev) => (
              <button
                key={ev.id}
                onClick={() => onEventClick(ev.id)}
                className="w-full text-left rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white"
                style={{ backgroundColor: getCategoryColor(ev.category) }}
              >
                {ev.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hourly grid */}
      <div className="flex-1 overflow-y-auto">
        {hours.map((hour) => {
          const hourEvents = dayEvents.filter((ev) => {
            if (ev.allDay) return false;
            const h = ev.startTime ? parseInt(ev.startTime.split(":")[0]) : -1;
            return h === hour;
          });

          return (
            <div key={hour} className="flex min-h-[56px] border-b border-border/20">
              <div className="w-[60px] text-[10px] font-medium text-text-secondary text-right pr-3 pt-1 flex-shrink-0">
                {hour % 12 || 12} {hour >= 12 ? "PM" : "AM"}
              </div>
              <div className="flex-1 border-l border-border/20 px-2 py-1">
                {hourEvents.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => onEventClick(ev.id)}
                    className="w-full text-left rounded-lg px-3 py-2 mb-1 text-[12px] font-semibold"
                    style={{
                      backgroundColor: getCategoryBg(ev.category),
                      color: getCategoryColor(ev.category),
                      borderLeft: `3px solid ${getCategoryColor(ev.category)}`,
                    }}
                  >
                    <span>{ev.title}</span>
                    {ev.startTime && (
                      <span className="ml-2 text-[10px] opacity-70">
                        {formatTimeShort(ev.startTime)}
                        {ev.endTime && ` – ${formatTimeShort(ev.endTime)}`}
                      </span>
                    )}
                    {ev.location && (
                      <p className="text-[10px] opacity-60 mt-0.5">{ev.location}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Agenda View
// ============================================================

function AgendaView({
  eventsByDate,
  currentDate,
  onEventClick,
}: {
  eventsByDate: Record<string, CalendarEvent[]>;
  currentDate: Date;
  onEventClick: (id: string) => void;
}) {
  // Get all dates with events, sorted
  const sortedDates = Object.keys(eventsByDate).sort();

  const filteredDates = sortedDates.filter((d) => {
    const eventDate = new Date(d);
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return eventDate >= monthStart && eventDate <= monthEnd;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-border overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {filteredDates.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-text-secondary">
            No events this month
          </div>
        )}

        {filteredDates.map((dateKey) => {
          const d = new Date(dateKey + "T00:00:00");
          const events = eventsByDate[dateKey];
          const dayLabel = d.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });

          return (
            <div key={dateKey} className="border-b border-border/30">
              <div className="px-4 py-2.5 bg-background/50">
                <span className="text-[12px] font-bold text-text-primary">
                  {dayLabel}
                </span>
              </div>
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => onEventClick(ev.id)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-primary-light/20 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getCategoryColor(ev.category) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-text-primary truncate">
                      {ev.title}
                    </p>
                    {ev.description && (
                      <p className="text-[10px] text-text-secondary truncate">{ev.description}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] font-medium text-text-secondary">
                      {ev.allDay ? "All Day" : formatTimeShort(ev.startTime)}
                    </p>
                    {ev.location && (
                      <p className="text-[9px] text-text-secondary/60">{ev.location}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
