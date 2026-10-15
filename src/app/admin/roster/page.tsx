import { AttendanceRepo, Users } from "@/lib/db";
import { RosterView } from "./RosterView";

export const metadata = { title: "Roster & Groups — Admin" };

export default async function RosterPage() {
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
    dob: s.dob || "",
    parentName: s.parentName || "",
    parentPhone: s.parentPhone || "",
    parentEmail: s.parentEmail || "",
    medicalNotes: s.medicalNotes || "",
    memberType: s.memberType || "EXISTING",
    familyId: s.familyId || "",
  }));

  return <RosterView students={students} />;
}
