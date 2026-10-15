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

export function serializeSchedule(rows: ScheduleRow[]): string {
  return rows
    .map(
      (r) =>
        `${r.day.trim()}|${r.time.trim()}|${r.label.trim()}|${(r.group || "ALL").trim()}|${(r.note || "").trim()}`
    )
    .join("\n");
}


