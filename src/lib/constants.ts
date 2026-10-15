export const GROUPS = ["Kids (5-6)", "Juniors (7-12)", "Adults (13+)"] as const;
export type MemberGroup = (typeof GROUPS)[number];

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type BroadcastRow = {
  id: string;
  targetGroup: string; // "ALL" | "Kids (5-6)" | "Juniors (7-12)" | "Adults (13+)"
  channel: string; // "IN_APP" | "SMS" | "EMAIL" | "ALL"
  title: string;
  message: string;
  recipientCount: number;
  recipientNames?: string[];
  isScheduleChange?: boolean;
  sentAt: string;
};

export type ScheduleRow = {
  day: string;
  time: string;
  label: string;
  group: string; // "ALL" | "Adults" | "Kids" | "Competition Team"
  note: string; // Optional schedule change alert/status note (e.g. "Moved to 6:30 PM this week")
};

export function parseSchedule(raw: string | undefined): ScheduleRow[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day = "", time = "", label = "", group = "ALL", note = ""] = line
        .split("|")
        .map((s) => s.trim());
      return {
        day,
        time,
        label,
        group: group || "ALL",
        note: note || "",
      };
    });
}

export type GroupTheme = {
  id: string;
  label: string;
  shortLabel: string;
  dot: string;
  bar: string;
  badgeSolid: string;
  badgeSoft: string;
  cardBg: string;
  cardBorder: string;
  cardAccentBorder: string;
  textAccent: string;
  filterActive: string;
};

export const GROUP_THEMES: Record<string, GroupTheme> = {
  "Kids (5-6)": {
    id: "Kids (5-6)",
    label: "Kids (5–6)",
    shortLabel: "Kids 5–6",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    badgeSolid: "bg-amber-500 text-white border-amber-600",
    badgeSoft: "bg-amber-100 text-amber-950 border-amber-300",
    cardBg: "bg-amber-50/70 hover:bg-amber-50",
    cardBorder: "border-amber-300",
    cardAccentBorder: "border-l-4 border-l-amber-500",
    textAccent: "text-amber-800",
    filterActive: "bg-amber-500 text-white border-amber-600 shadow-sm",
  },
  "Juniors (7-12)": {
    id: "Juniors (7-12)",
    label: "Juniors (7–12)",
    shortLabel: "Juniors 7–12",
    dot: "bg-purple-600",
    bar: "bg-purple-600",
    badgeSolid: "bg-purple-600 text-white border-purple-700",
    badgeSoft: "bg-purple-100 text-purple-950 border-purple-300",
    cardBg: "bg-purple-50/70 hover:bg-purple-50",
    cardBorder: "border-purple-300",
    cardAccentBorder: "border-l-4 border-l-purple-600",
    textAccent: "text-purple-800",
    filterActive: "bg-purple-600 text-white border-purple-700 shadow-sm",
  },
  "Adults (13+)": {
    id: "Adults (13+)",
    label: "Adults (13+)",
    shortLabel: "Adults 13+",
    dot: "bg-blue-600",
    bar: "bg-blue-600",
    badgeSolid: "bg-blue-600 text-white border-blue-700",
    badgeSoft: "bg-blue-100 text-blue-950 border-blue-300",
    cardBg: "bg-blue-50/70 hover:bg-blue-50",
    cardBorder: "border-blue-300",
    cardAccentBorder: "border-l-4 border-l-blue-600",
    textAccent: "text-blue-800",
    filterActive: "bg-blue-600 text-white border-blue-700 shadow-sm",
  },
  ALL: {
    id: "ALL",
    label: "All Groups / Open Mat",
    shortLabel: "All Groups",
    dot: "bg-emerald-600",
    bar: "bg-emerald-600",
    badgeSolid: "bg-emerald-600 text-white border-emerald-700",
    badgeSoft: "bg-emerald-100 text-emerald-950 border-emerald-300",
    cardBg: "bg-emerald-50/70 hover:bg-emerald-50",
    cardBorder: "border-emerald-300",
    cardAccentBorder: "border-l-4 border-l-emerald-600",
    textAccent: "text-emerald-800",
    filterActive: "bg-emerald-600 text-white border-emerald-700 shadow-sm",
  },
};

export function getGroupTheme(group: string | undefined): GroupTheme {
  if (!group || group === "ALL") return GROUP_THEMES.ALL;
  return GROUP_THEMES[group] || GROUP_THEMES.ALL;
}

export function serializeSchedule(rows: ScheduleRow[]): string {
  return rows
    .map(
      (r) =>
        `${r.day.trim()}|${r.time.trim()}|${r.label.trim()}|${(r.group || "ALL").trim()}|${(r.note || "").trim()}`
    )
    .join("\n");
}



