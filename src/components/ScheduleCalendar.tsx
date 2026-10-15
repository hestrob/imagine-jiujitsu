"use client";

import { useState, useEffect } from "react";
import {
  DAYS_OF_WEEK,
  GROUPS,
  GROUP_THEMES,
  getGroupTheme,
  type ScheduleRow,
} from "@/lib/constants";

function parseStartTimeMinutes(timeStr: string): number {
  // Parse strings like "4:00 – 4:45 PM", "6:30 – 9:00 AM", "5:00 - 6:00 PM"
  const normalized = timeStr.toUpperCase();
  const isPm = normalized.includes("PM");
  const isAm = normalized.includes("AM");
  const match = normalized.match(/(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 9999;
  let hours = parseInt(match[1], 10);
  const mins = match[2] ? parseInt(match[2], 10) : 0;

  // Handle cases like "11:30 AM – 1:00 PM" where the first part might have AM/PM
  const firstPart = normalized.split(/[–-]/)[0] || "";
  if (firstPart.includes("AM")) {
    if (hours === 12) hours = 0;
  } else if (firstPart.includes("PM")) {
    if (hours !== 12) hours += 12;
  } else if (isPm && !isAm) {
    if (hours !== 12) hours += 12;
  } else if (isAm && hours === 12) {
    hours = 0;
  }
  return hours * 60 + mins;
}

export function ScheduleCalendar({
  schedule,
  compact = false,
}: {
  schedule: ScheduleRow[];
  compact?: boolean;
}) {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL_CLASSES");
  const [todayName, setTodayName] = useState<string>("");

  useEffect(() => {
    const dayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, ...
    const map = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    setTodayName(map[dayIndex] || "");
  }, []);

  const filterGroups = [
    { id: "ALL_CLASSES", label: "Full Calendar", dot: "bg-ink" },
    ...GROUPS.map((g) => ({
      id: g,
      label: GROUP_THEMES[g].label,
      dot: GROUP_THEMES[g].dot,
    })),
    {
      id: "ALL",
      label: GROUP_THEMES.ALL.label,
      dot: GROUP_THEMES.ALL.dot,
    },
  ];

  const matchesFilter = (row: ScheduleRow) => {
    const rowGroup = !row.group || row.group === "ALL" ? "ALL" : row.group;
    if (selectedGroup === "ALL_CLASSES") return true;
    if (selectedGroup === "ALL") return rowGroup === "ALL";
    // When filtering for a specific age group, also include "ALL" (Open Mat) sessions
    return rowGroup === selectedGroup || rowGroup === "ALL";
  };

  const countForFilter = (filterId: string) => {
    if (filterId === "ALL_CLASSES") return schedule.length;
    if (filterId === "ALL") {
      return schedule.filter((r) => !r.group || r.group === "ALL").length;
    }
    return schedule.filter(
      (r) => r.group === filterId || !r.group || r.group === "ALL"
    ).length;
  };

  const daysData = DAYS_OF_WEEK.map((day) => {
    const dayClasses = schedule
      .filter((r) => r.day.toLowerCase() === day.toLowerCase())
      .filter(matchesFilter)
      .slice()
      .sort(
        (a, b) => parseStartTimeMinutes(a.time) - parseStartTimeMinutes(b.time)
      );
    return {
      day,
      shortDay: day.slice(0, 3),
      classes: dayClasses,
      isToday: todayName.toLowerCase() === day.toLowerCase(),
    };
  });

  const activeDaysData = daysData.filter((d) => d.classes.length > 0);

  return (
    <div className="space-y-5">
      {/* Group Color Legend & Interactive Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border border-line bg-white p-3.5 sm:px-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50 font-bold">
            Filter by Program Color:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterGroups.map((fg) => {
            const isActive = selectedGroup === fg.id;
            const theme =
              fg.id !== "ALL_CLASSES" ? getGroupTheme(fg.id) : null;
            const count = countForFilter(fg.id);

            return (
              <button
                key={fg.id}
                type="button"
                onClick={() => setSelectedGroup(fg.id)}
                className={`inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider font-bold transition-all ${
                  isActive
                    ? theme
                      ? theme.filterActive
                      : "bg-ink text-white border-ink shadow-sm"
                    : "bg-mat/50 text-ink/80 border-line hover:border-ink/40 hover:bg-white"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                    isActive && fg.id !== "ALL_CLASSES"
                      ? "bg-white"
                      : fg.dot
                  }`}
                />
                <span>{fg.label}</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[10px] ${
                    isActive
                      ? "bg-black/20 text-white"
                      : "bg-white text-ink/60 border border-line/80"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop 7-Day Weekly Calendar Grid (lg and up) */}
      <div className="hidden lg:grid lg:grid-cols-7 border-2 border-ink bg-white shadow-editorial divide-x divide-line">
        {daysData.map(({ day, classes, isToday }) => (
          <div
            key={day}
            className={`flex flex-col min-h-[320px] ${
              classes.length === 0 ? "bg-mat/35" : "bg-white"
            }`}
          >
            {/* Day Column Header */}
            <div
              className={`px-3 py-3 border-b-2 border-ink flex items-center justify-between ${
                isToday
                  ? "bg-crimson text-white"
                  : classes.length > 0
                  ? "bg-ink text-mat"
                  : "bg-ink/85 text-mat/70"
              }`}
            >
              <div>
                <p className="font-display uppercase text-xl tracking-wide leading-none">
                  {day}
                </p>
                <p
                  className={`font-mono text-[10px] uppercase tracking-widest mt-1 ${
                    isToday ? "text-white/90" : "text-mat/60"
                  }`}
                >
                  {classes.length === 0
                    ? "No Classes"
                    : `${classes.length} ${
                        classes.length === 1 ? "Session" : "Sessions"
                      }`}
                </p>
              </div>
              {isToday && (
                <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-crimson">
                  Today
                </span>
              )}
            </div>

            {/* Day Classes Stack */}
            <div className="flex-1 p-2.5 space-y-2.5 flex flex-col">
              {classes.length > 0 ? (
                classes.map((cls, idx) => {
                  const theme = getGroupTheme(cls.group);
                  return (
                    <div
                      key={cls.time + cls.label + idx}
                      className={`border ${theme.cardBorder} ${theme.cardAccentBorder} ${theme.cardBg} p-3 shadow-sm transition-all flex flex-col justify-between gap-2`}
                    >
                      <div className="space-y-1.5">
                        {/* Group Color Pill */}
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${theme.badgeSolid}`}
                          >
                            {theme.shortLabel}
                          </span>
                        </div>

                        {/* Time */}
                        <p
                          className={`font-mono text-xs font-bold tracking-tight ${theme.textAccent}`}
                        >
                          {cls.time}
                        </p>

                        {/* Class Title */}
                        <p className="font-body font-semibold text-sm text-ink leading-snug">
                          {cls.label}
                        </p>
                      </div>

                      {cls.note && (
                        <p className="rounded bg-amber-100 border border-amber-400 px-2 py-1 font-mono text-[10px] font-bold text-amber-950 leading-tight">
                          ⚠ {cls.note}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-line/80 bg-white/40">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/35 font-semibold">
                    Open / Recovery
                  </span>
                  {!compact && (
                    <p className="mt-1 text-[11px] text-ink/40 leading-tight">
                      No regular group classes scheduled
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile & Tablet Day-by-Day Calendar Layout (< lg) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {activeDaysData.map(({ day, classes, isToday }) => (
          <div
            key={day}
            className="border-2 border-ink bg-white shadow-editorial overflow-hidden flex flex-col"
          >
            <div
              className={`px-4 py-3 border-b border-ink flex items-center justify-between ${
                isToday ? "bg-crimson text-white" : "bg-ink text-mat"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <h3 className="font-display uppercase text-2xl tracking-wide leading-none">
                  {day}
                </h3>
                {isToday && (
                  <span className="rounded bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-crimson">
                    Today
                  </span>
                )}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-mat/70">
                {classes.length} {classes.length === 1 ? "Class" : "Classes"}
              </span>
            </div>

            <div className="p-3.5 space-y-2.5 flex-1">
              {classes.map((cls, idx) => {
                const theme = getGroupTheme(cls.group);
                return (
                  <div
                    key={cls.time + cls.label + idx}
                    className={`border ${theme.cardBorder} ${theme.cardAccentBorder} ${theme.cardBg} p-3.5 space-y-1.5`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`font-mono text-xs font-bold ${theme.textAccent}`}
                      >
                        {cls.time}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${theme.badgeSolid}`}
                      >
                        {theme.label}
                      </span>
                    </div>
                    <p className="font-semibold text-base text-ink">
                      {cls.label}
                    </p>
                    {cls.note && (
                      <p className="inline-block rounded bg-amber-100 border border-amber-400 px-2.5 py-1 font-mono text-[11px] font-bold text-amber-950">
                        ⚠ {cls.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
