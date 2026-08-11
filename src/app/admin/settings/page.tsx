import { getSettings } from "@/lib/settings";
import { saveSettings } from "@/app/actions";

export const metadata = { title: "Settings — Admin" };

export default async function SettingsPage({ searchParams }: { searchParams: { saved?: string } }) {
  const s = await getSettings();
  return (
    <div className="max-w-3xl">
      <h1 className="display-tight text-3xl">Site settings</h1>
      <p className="mt-1 text-sm text-ink/60">Everything here updates the public site the moment you hit save.</p>
      {searchParams.saved && (
        <p className="mt-3 border border-flow bg-white px-4 py-2 font-mono text-xs uppercase tracking-widest text-flow">Saved</p>
      )}
      <form action={saveSettings} className="mt-6 space-y-6">
        <section className="border border-line bg-white p-4 space-y-3">
          <p className="eyebrow text-ink/50">Video wall</p>
          <div>
            <label className="label" htmlFor="videoUrl">Embed URL (YouTube: use the /embed/VIDEO_ID form)</label>
            <input id="videoUrl" name="videoUrl" className="field" defaultValue={s.videoUrl} />
          </div>
        </section>
        <section className="border border-line bg-white p-4 space-y-3">
          <p className="eyebrow text-ink/50">Contact &amp; socials</p>
          <div><label className="label" htmlFor="address">Address</label><input id="address" name="address" className="field" defaultValue={s.address} /></div>
          <div className="grid gap-3 md:grid-cols-2">
            <div><label className="label" htmlFor="phone">Phone</label><input id="phone" name="phone" className="field" defaultValue={s.phone} /></div>
            <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" className="field" defaultValue={s.email} /></div>
          </div>
          <div><label className="label" htmlFor="facebook">Facebook URL</label><input id="facebook" name="facebook" className="field" defaultValue={s.facebook} /></div>
          <div><label className="label" htmlFor="instagram">Instagram URL</label><input id="instagram" name="instagram" className="field" defaultValue={s.instagram} /></div>
          <div><label className="label" htmlFor="yelp">Yelp URL</label><input id="yelp" name="yelp" className="field" defaultValue={s.yelp} /></div>
        </section>
        <section className="border border-line bg-white p-4 space-y-3">
          <p className="eyebrow text-ink/50">Coach</p>
          <div><label className="label" htmlFor="coachName">Name</label><input id="coachName" name="coachName" className="field" defaultValue={s.coachName} /></div>
          <div><label className="label" htmlFor="coachBio">Bio</label><textarea id="coachBio" name="coachBio" rows={4} className="field" defaultValue={s.coachBio} /></div>
        </section>
        <section className="border border-line bg-white p-4 space-y-3">
          <p className="eyebrow text-ink/50">Schedule</p>
          <p className="text-xs text-ink/60">One class per line: <code>Day|Time|Class name</code></p>
          <textarea name="schedule" rows={6} className="field font-mono text-xs" defaultValue={s.schedule} />
        </section>
        <button className="btn">Save settings</button>
      </form>
    </div>
  );
}
