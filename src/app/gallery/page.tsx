import { Gallery } from "@/lib/db";

export const metadata = { title: "Gallery — Imagine Jiu Jitsu" };

export default async function GalleryPage() {
  const images = Gallery.all();
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="eyebrow text-flow">Gallery</p>
      <h1 className="display-tight mt-3 text-6xl">Life on the mat</h1>
      <div className="belt-line mt-6 max-w-sm" aria-hidden />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <figure key={img.id} className="border border-line bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.caption || "Imagine Jiu Jitsu"} className="aspect-[4/3] w-full object-cover" />
            {img.caption && (
              <figcaption className="px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-ink/60">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
        {images.length === 0 && <p className="text-ink/60">Photos are on the way.</p>}
      </div>
    </div>
  );
}
