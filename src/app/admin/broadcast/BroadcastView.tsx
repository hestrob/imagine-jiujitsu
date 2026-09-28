"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { sendBroadcast } from "@/app/actions";
import { GROUPS, type BroadcastRow } from "@/lib/constants";

type StudentData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  group: string;
};

function SubmitButton({ recipientCount }: { recipientCount: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="btn !py-3 !px-6 text-sm font-semibold tracking-wide flex items-center justify-center gap-2"
      disabled={pending || recipientCount === 0}
    >
      {pending ? (
        <span>Sending notification…</span>
      ) : (
        <span>Send Alert to {recipientCount} {recipientCount === 1 ? "Member" : "Members"}</span>
      )}
    </button>
  );
}

export function BroadcastView({
  students,
  history,
}: {
  students: StudentData[];
  history: BroadcastRow[];
}) {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [channel, setChannel] = useState<string>("ALL");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [state, formAction] = useFormState(sendBroadcast, undefined);

  const recipients = students.filter(
    (s) => selectedGroup === "ALL" || s.group === selectedGroup
  );

  const phoneList = recipients
    .map((s) => s.phone.replace(/[^0-9+]/g, ""))
    .filter(Boolean)
    .join(",");

  const smsLink = `sms:${phoneList}?&body=${encodeURIComponent(
    `[Imagine JJ] ${title ? title + ": " : ""}${message}`
  )}`;

  const templates = [
    {
      label: "Holiday Open Mat",
      title: "Holiday Open Mat Schedule",
      message:
        "Hey team! Open Mat will run tomorrow morning from 8:00 AM – 10:00 AM. All groups and experience levels welcome!",
    },
    {
      label: "Belt Promotions",
      title: "Upcoming Belt Promotion Ceremony",
      message:
        "Congratulations to all members who have been putting in mat hours! Our upcoming promotion ceremony is scheduled for this Friday at 6:30 PM.",
    },
    {
      label: "Class Schedule Change",
      title: "Schedule Notice: Class Time Shift",
      message:
        "Quick reminder: class tonight will start 30 minutes later at 6:30 PM. Please arrive 10 minutes early to warm up.",
    },
    {
      label: "Competition Sparring",
      title: "High-Intensity Competition Training",
      message:
        "Competition team: special 6-minute round tournament simulations tomorrow at 9:00 AM sharp. Bring gi & no-gi gear.",
    },
  ];

  const applyTemplate = (t: { title: string; message: string }) => {
    setTitle(t.title);
    setMessage(t.message);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="display-tight text-3xl">Broadcast &amp; Notifications</h1>
        <p className="mt-1 text-sm text-ink/60">
          Send SMS alerts and email announcements to individual groups or your entire academy at once.
        </p>
      </div>

      {state?.ok && (
        <div className="border-2 border-emerald-500 bg-emerald-50 p-4 text-emerald-900">
          <p className="font-display uppercase text-lg">Alert Broadcasted Successfully!</p>
          <p className="text-sm mt-1">
            Sent to {state.count} recipients. Broadcast has been logged in history.
          </p>
        </div>
      )}

      {state?.error && (
        <div className="border-2 border-rose-500 bg-rose-50 p-4 text-rose-900 text-sm">
          {state.error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Composer Form (Left 2 cols) */}
        <div className="lg:col-span-2">
          <form action={formAction} className="border border-line bg-white p-6 space-y-6 shadow-sm">
            {/* Quick Templates */}
            <div>
              <p className="eyebrow text-ink/50 mb-2">Quick Templates</p>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="border border-line bg-neutral-50 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-ink/70 hover:border-flow hover:text-flow hover:bg-white transition-colors"
                  >
                    + {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience Selector */}
            <div>
              <label className="label">Target Audience</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mt-1">
                <button
                  type="button"
                  onClick={() => setSelectedGroup("ALL")}
                  className={`p-3 text-left border font-mono text-xs transition-colors ${
                    selectedGroup === "ALL"
                      ? "border-flow bg-amber-50/50 text-flow font-semibold"
                      : "border-line bg-white hover:border-ink/50 text-ink/70"
                  }`}
                >
                  <p className="uppercase font-bold text-[11px]">All Members</p>
                  <p className="text-[10px] text-ink/50 mt-1">{students.length} students</p>
                </button>

                {GROUPS.map((g) => {
                  const count = students.filter((s) => s.group === g).length;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGroup(g)}
                      className={`p-3 text-left border font-mono text-xs transition-colors ${
                        selectedGroup === g
                          ? "border-flow bg-amber-50/50 text-flow font-semibold"
                          : "border-line bg-white hover:border-ink/50 text-ink/70"
                      }`}
                    >
                      <p className="uppercase font-bold text-[11px]">{g}</p>
                      <p className="text-[10px] text-ink/50 mt-1">{count} students</p>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="targetGroup" value={selectedGroup} />
            </div>

            {/* Delivery Channel */}
            <div>
              <label className="label">Delivery Channel</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  { id: "ALL", label: "SMS + Email", desc: "Highest reach" },
                  { id: "SMS", label: "SMS Text Blast", desc: "Instant text" },
                  { id: "EMAIL", label: "Email Blast", desc: "Detailed update" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id)}
                    className={`p-3 text-left border font-mono text-xs transition-colors ${
                      channel === c.id
                        ? "border-ink bg-neutral-900 text-white font-semibold"
                        : "border-line bg-white hover:border-ink/50 text-ink/70"
                    }`}
                  >
                    <p className="uppercase font-bold text-[11px]">{c.label}</p>
                    <p className={`text-[10px] mt-0.5 ${channel === c.id ? "text-neutral-400" : "text-ink/40"}`}>
                      {c.desc}
                    </p>
                  </button>
                ))}
              </div>
              <input type="hidden" name="channel" value={channel} />
            </div>

            {/* Subject / Title */}
            <div>
              <label className="label" htmlFor="title">
                Subject / Announcement Title
              </label>
              <input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Schedule update for Monday open mat"
                className="field"
                required
              />
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label !mb-0" htmlFor="message">
                  Message Content
                </label>
                <span className="font-mono text-[10px] text-ink/40">
                  {message.length} characters {channel !== "EMAIL" && `(~${Math.ceil((message.length || 1) / 160)} SMS segment)`}
                </span>
              </div>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message to the group here…"
                className="field"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-line">
              <SubmitButton recipientCount={recipients.length} />

              {/* Direct Native SMS Link */}
              {phoneList && (
                <a
                  href={smsLink}
                  className="border border-line bg-neutral-50 px-4 py-2 text-center font-mono text-xs uppercase tracking-wider text-ink/70 hover:border-ink hover:text-ink transition-colors"
                >
                  📱 Open in Messages App
                </a>
              )}
            </div>
          </form>
        </div>

        {/* Audience Preview (Right col) */}
        <div className="space-y-6">
          <div className="border border-line bg-white p-5 shadow-sm space-y-4">
            <div className="border-b border-line pb-2 flex items-center justify-between">
              <p className="font-display uppercase text-lg">Target Members</p>
              <span className="font-mono text-xs font-semibold text-flow">
                {recipients.length} total
              </span>
            </div>

            <p className="text-xs text-ink/60">
              Sending to members currently assigned to: <strong>{selectedGroup}</strong>
            </p>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-line/40">
              {recipients.map((s) => (
                <div key={s.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-ink">{s.name}</p>
                    <p className="font-mono text-[11px] text-ink/50">{s.phone || "No phone"}</p>
                  </div>
                  <span className="font-mono text-[10px] text-ink/40 uppercase bg-neutral-100 px-1.5 py-0.5 rounded">
                    {s.group}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Broadcast History */}
          <div className="border border-line bg-white p-5 shadow-sm space-y-3">
            <p className="font-display uppercase text-lg border-b border-line pb-2">
              Recent Broadcasts
            </p>

            {history.length === 0 ? (
              <p className="text-xs text-ink/50">No previous broadcasts sent.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {history.map((b) => (
                  <div key={b.id} className="border-b border-line/60 pb-3 last:border-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink">{b.title}</span>
                      <span className="font-mono text-[10px] text-ink/40">
                        {new Date(b.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-ink/70 line-clamp-2">{b.message}</p>
                    <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-ink/50">
                      <span className="bg-neutral-100 px-1 py-0.5 rounded">{b.targetGroup}</span>
                      <span>·</span>
                      <span>{b.channel}</span>
                      <span>·</span>
                      <span>{b.recipientCount} sent</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
