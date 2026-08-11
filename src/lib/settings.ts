import { Settings } from "./db";

export async function getSettings(): Promise<Record<string, string>> {
  return Settings.all();
}

export type ScheduleRow = { day: string; time: string; label: string };

export function parseSchedule(raw: string | undefined): ScheduleRow[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day = "", time = "", label = ""] = line.split("|").map((s) => s.trim());
      return { day, time, label };
    });
}
