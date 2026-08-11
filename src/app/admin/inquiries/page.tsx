import { Inquiries } from "@/lib/db";
import { markInquiryHandled } from "@/app/actions";

export const metadata = { title: "Inquiries — Admin" };

export default async function InquiriesPage() {
  const inquiries = Inquiries.all();
  return (
    <div>
      <h1 className="display-tight text-3xl">Free-class inquiries</h1>
      <p className="mt-1 text-sm text-ink/60">Everyone who asked for a first class through the site.</p>
      <ul className="mt-4 space-y-3">
        {inquiries.map((q) => (
          <li key={q.id} className={`border bg-white p-4 ${q.handled ? "border-line opacity-60" : "border-flow"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">
                {q.name}{" "}
                <span className="text-ink/50 text-sm">
                  — <a href={`mailto:${q.email}`} className="hover:underline">{q.email}</a>
                  {q.phone ? (
                    <>
                      {" · "}
                      <a href={`tel:${q.phone.replace(/[^0-9+]/g, "")}`} className="hover:underline">
                        {q.phone}
                      </a>
                    </>
                  ) : (
                    ""
                  )}
                </span>
              </p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink/40">{new Date(q.createdAt).toLocaleDateString()}</span>
                {!q.handled && (
                  <form action={markInquiryHandled}>
                    <input type="hidden" name="id" value={q.id} />
                    <button className="btn !px-3 !py-1.5 !text-xs">Mark handled</button>
                  </form>
                )}
              </div>
            </div>
            {q.message && <p className="mt-2 text-sm text-ink/75">{q.message}</p>}
          </li>
        ))}
        {inquiries.length === 0 && <li className="text-sm text-ink/60">No inquiries yet.</li>}
      </ul>
    </div>
  );
}
