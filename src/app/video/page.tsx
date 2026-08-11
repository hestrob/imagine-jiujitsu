import { getSettings } from "@/lib/settings";

export const metadata = { title: "The Wall — Imagine Jiu Jitsu" };

export default async function VideoPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <p className="eyebrow text-flow">The wall</p>
      <h1 className="display-tight mt-3 text-6xl">Watch the room work</h1>
      <div className="belt-line mt-6 max-w-sm" aria-hidden />
      <div className="mt-10 border border-ink bg-ink">
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
      <p className="mt-4 text-sm text-ink/60">
        Fresh footage rotates here — technique breakdowns, promotions, and competition highlights.
      </p>
    </div>
  );
}
