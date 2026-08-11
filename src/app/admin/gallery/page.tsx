import { Gallery } from "@/lib/db";
import { uploadPhoto, deletePhoto } from "@/app/actions";

export const metadata = { title: "Gallery — Admin" };

export default async function AdminGalleryPage() {
  const images = Gallery.all();
  return (
    <div>
      <h1 className="display-tight text-3xl">Gallery</h1>
      <p className="mt-1 text-sm text-ink/60">Upload photos and they appear on the public gallery instantly. Delete removes them just as fast.</p>
      <form action={uploadPhoto} className="mt-4 flex flex-wrap items-end gap-3 border border-line bg-white p-4">
        <div>
          <label className="label" htmlFor="photo">Photo</label>
          <input id="photo" name="photo" type="file" accept="image/*" required className="text-sm" />
        </div>
        <div className="flex-1 min-w-48">
          <label className="label" htmlFor="caption">Caption (optional)</label>
          <input id="caption" name="caption" className="field" placeholder="Belt promotion night" />
        </div>
        <button className="btn !py-2 !text-xs">Add photo</button>
      </form>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <figure key={img.id} className="border border-line bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.caption} className="aspect-[4/3] w-full object-cover" />
            <figcaption className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="font-mono text-[11px] uppercase tracking-widest text-ink/60">{img.caption || "—"}</span>
              <form action={deletePhoto}>
                <input type="hidden" name="id" value={img.id} />
                <button className="font-mono text-xs uppercase tracking-widest text-red-700 hover:underline">Delete</button>
              </form>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
