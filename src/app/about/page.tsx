import { getSettings } from "@/lib/settings";

export const metadata = { title: "About — Imagine Jiu Jitsu" };

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="eyebrow text-flow">About the academy</p>
      <h1 className="display-tight mt-3 text-6xl">The imagination is the first rep</h1>
      <div className="belt-line mt-6 max-w-sm" aria-hidden />
      <div className="mt-8 space-y-5 text-lg text-ink/80">
        <p>
          Imagine Jiu Jitsu is a martial arts academy in Woodland, California
          that blends traditional and Brazilian Jiu Jitsu with an emphasis on
          self defense, building community, and personal growth.
        </p>
        <p>
          The name is the method. Before any technique works, you have to be
          able to picture yourself doing it — surviving the bad position,
          finishing the sweep, showing up on a rainy Wednesday. We train the
          picture, then we train the body to match it.
        </p>
        <p>
          The room stays clean, the culture stays ego-free, and everyone from
          first-timers to competitors shares the same mat.
        </p>
      </div>
      <div className="mt-12 border border-line bg-white p-6">
        <p className="eyebrow text-flow">Head instructor</p>
        <h2 className="display-tight mt-2 text-4xl">{s.coachName}</h2>
        <p className="mt-3 text-ink/75">{s.coachBio}</p>
      </div>
    </div>
  );
}
