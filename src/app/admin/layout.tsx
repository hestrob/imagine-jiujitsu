import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/portal");
  const tabs = [
    ["/admin", "Overview"],
    ["/admin/attendance", "Attendance"],
    ["/admin/roster", "Roster"],
    ["/admin/gallery", "Gallery"],
    ["/admin/inquiries", "Inquiries"],
    ["/admin/settings", "Settings"],
  ] as const;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="eyebrow text-flow">Admin — signed in as {user.name}</p>
      <div className="mt-4 flex flex-wrap gap-2 border-b border-line pb-3 font-mono text-xs uppercase tracking-widest">
        {tabs.map(([href, label]) => (
          <Link key={href} href={href} className="border border-line bg-white px-3 py-1.5 hover:border-flow hover:text-flow">
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
