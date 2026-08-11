import Link from "next/link";
import { AttendanceRepo, Inquiries, Users } from "@/lib/db";

export const metadata = { title: "Admin — Imagine Jiu Jitsu" };

export default async function AdminHome() {
  const students = Users.countStudents();
  const activeCount = Users.countActive();
  const todayCount = AttendanceRepo.countToday();
  const openInquiries = Inquiries.countUnhandled();
  const cards = [
    [String(students), "Students", "/admin/roster"],
    [String(activeCount), "Active memberships", "/admin/roster"],
    [String(todayCount), "Check-ins today", "/admin/attendance"],
    [String(openInquiries), "New inquiries", "/admin/inquiries"],
  ] as const;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([n, label, href]) => (
        <Link key={label} href={href} className="border border-line bg-white p-6 hover:border-flow">
          <p className="font-display text-5xl">{n}</p>
          <p className="eyebrow text-ink/50 mt-1">{label}</p>
        </Link>
      ))}
      <p className="sm:col-span-2 lg:col-span-4 text-sm text-ink/60">
        Estimated monthly revenue: <span className="font-mono">${activeCount * 60}</span> ({activeCount} active × $60)
      </p>
    </div>
  );
}
