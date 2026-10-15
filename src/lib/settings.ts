import { Settings } from "./db";
import { type ScheduleRow, parseSchedule, serializeSchedule } from "./constants";

export { type ScheduleRow, parseSchedule, serializeSchedule };

export async function getSettings(): Promise<Record<string, string>> {
  return Settings.all();
}


