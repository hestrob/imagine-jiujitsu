import { Users, Broadcasts } from "@/lib/db";
import { getTwilioStatus } from "@/lib/twilio";
import { BroadcastView } from "./BroadcastView";

export const metadata = { title: "Broadcast & Notifications — Admin" };

export default async function BroadcastPage() {
  const students = Users.students().map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone || s.parentPhone || "",
    group: s.group || "Adults (13+)",
  }));

  const history = Broadcasts.all();
  const twilioStatus = await getTwilioStatus();

  return <BroadcastView students={students} history={history} twilioStatus={twilioStatus} />;
}
