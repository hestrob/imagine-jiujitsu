import Link from "next/link";
import { Gallery } from "@/lib/db";

export const metadata = { title: "Gallery — Imagine Jiu Jitsu Academy" };

export default async function GalleryPage() {
  const images = Gallery.all();
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-crimson">Inside the Woodland Dojo</p>
          <h1 className="display-tight mt-2 text-6xl sm:text-7xl">
            Life on the mat
          </h1>
          <div className="black-belt-bar mt-5 max-w-sm" aria-hidden />
        </div>
        <p className="max-w-md text-sm text-ink/70">
          Real training nights from our Kids (5–6), Juniors (7–12), and Adult Gi &amp; No-Gi
          classes at 2548 Allen Cir in Woodland, California.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <figure
            key={img.id}
            className="group border border-line bg-white overflow-hidden shadow-sm hover:border-ink transition-all flex flex-col justify-between"
          >
            <div className="aspect-[4/3] overflow-hidden bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.caption || "Imagine Jiu Jitsu"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {img.caption && (
              <figcaption className="flex items-center justify-between gap-3 px-4 py-3 border-t border-line bg-white">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink/80">
                  {img.caption}
                </span>
                <span className="font-mono text-[10px] text-crimson font-semibold shrink-0">
                  #{String(i + 1).padStart(2, "0")}
                </span>
              </figcaption>
            )}
          </figure>
        ))}
        {images.length === 0 && (
          <p className="text-ink/60">Photos are on the way.</p>
        )}
      </div>

      <div className="mt-14 border-2 border-ink bg-white p-8 flex flex-wrap items-center justify-between gap-6 shadow-editorial">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-seal-circle.png"
            alt="Imagine Jiu Jitsu Seal"
            className="h-14 w-14 rounded-full ring-1 ring-ink/15 hidden sm:block"
          />
          <div>
            <p className="eyebrow text-crimson">Step onto the mat</p>
            <h2 className="font-display text-3xl uppercase mt-0.5">
              Ready to jump into a class?
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn">
            Claim Your Free Week
          </Link>
          <Link href="/schedule" className="btn-ghost">
            View Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}
