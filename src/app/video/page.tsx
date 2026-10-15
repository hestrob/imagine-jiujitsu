import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "The Wall — Imagine Jiu Jitsu Academy" };

export default async function VideoPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-crimson">The Wall · Technique &amp; Highlights</p>
          <h1 className="display-tight mt-2 text-6xl sm:text-7xl">
            Watch the room work
          </h1>
          <div className="black-belt-bar mt-5 max-w-sm" aria-hidden />
        </div>
        <Link href="/contact" className="btn">
          Train With Us This Week
        </Link>
      </div>

      <div className="mt-10 border-2 border-ink bg-ink shadow-editorial-lg">
        <div className="aspect-video">
          {s.videoUrl ? (
            <iframe
              className="h-full w-full"
              src={s.videoUrl}
              title="Imagine Jiu Jitsu video wall"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center text-mat/50 font-mono text-xs uppercase tracking-widest">
              Video coming soon
            </div>
          )}
        </div>
      </div>
      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink/60">
        Fresh footage rotates here — technique breakdowns, belt promotions, and competition highlights.
      </p>
    </div>
  );
}
