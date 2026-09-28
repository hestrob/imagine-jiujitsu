import { Users, Broadcasts } from "@/lib/db";
import { BroadcastView } from "./BroadcastView";

export const metadata = { title: "Broadcast & Notifications — Admin" };

export default async function BroadcastPage() {
  const students = Users.students().map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone || "",
    group: s.group || "Adults",
  }));

  const history = Broadcasts.all();

  return <BroadcastView students={students} history={history} />;
}
