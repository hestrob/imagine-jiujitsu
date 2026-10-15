import { AttendanceRepo, Broadcasts, Users } from "@/lib/db";
import { getSettings, parseSchedule } from "@/lib/settings";
import { ScheduleConsoleView } from "./ScheduleConsoleView";

export const metadata = { title: "Schedule & Group Console — Admin" };

export default async function AdminSchedulePage() {
  const settings = await getSettings();
  const initialSchedule = parseSchedule(settings.schedule);

  const students = Users.students().map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone || "",
    group: s.group || "Adults (13+)",
    belt: s.belt,
    stripes: s.stripes,
    subscriptionStatus: s.subscriptionStatus,
    classCount: AttendanceRepo.countForUser(s.id),
  }));

  const recentChanges = Broadcasts.all();

  return (
    <ScheduleConsoleView
      initialSchedule={initialSchedule}
      students={students}
      recentChanges={recentChanges}
    />
  );
}
