import Link from "next/link";
import { getSettings } from "@/lib/settings";

export async function Footer() {
  const s = await getSettings();
  return (
    <footer className="gi-weave text-mat mt-24">
      <div className="belt-line" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-display uppercase text-2xl">Imagine Jiu Jitsu</p>
          <p className="mt-2 text-mat/70 text-sm">{s.address}</p>
          {s.phone && (
            <p className="text-mat/70 text-sm">
              <a href={`tel:${s.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-flow hover:underline transition-colors">
                {s.phone}
              </a>
            </p>
          )}
          {s.email && (
            <p className="text-mat/70 text-sm">
              <a href={`mailto:${s.email}`} className="hover:text-flow hover:underline transition-colors">
                {s.email}
              </a>
            </p>
          )}
        </div>
        <div className="font-mono text-xs uppercase tracking-widest space-y-2">
          <p className="text-mat/50">Mat</p>
          <p><Link className="hover:text-flow" href="/schedule">Schedule</Link></p>
          <p><Link className="hover:text-flow" href="/pricing">Pricing — $60/mo</Link></p>
          <p><Link className="hover:text-flow" href="/contact">Book a free class</Link></p>
        </div>
        <div className="font-mono text-xs uppercase tracking-widest space-y-2">
          <p className="text-mat/50">Follow</p>
          {s.facebook && <p><a className="hover:text-flow" href={s.facebook} target="_blank" rel="noreferrer">Facebook</a></p>}
          {s.instagram && <p><a className="hover:text-flow" href={s.instagram} target="_blank" rel="noreferrer">Instagram</a></p>}
          {s.yelp && <p><a className="hover:text-flow" href={s.yelp} target="_blank" rel="noreferrer">Yelp</a></p>}
        </div>
      </div>
      <p className="border-t border-mat/10 px-4 py-4 text-center font-mono text-[10px] uppercase tracking-widest text-mat/40">
        © {new Date().getFullYear()} Imagine Jiu Jitsu — Woodland, CA
      </p>
    </footer>
  );
}
