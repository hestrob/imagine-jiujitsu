"use client";

import { useState } from "react";
import { BeltBadge } from "@/components/BeltBadge";
import { BELT_ORDER } from "@/lib/belts";
import { GROUPS } from "@/lib/constants";
import {
  changeStudentGroup,
  updateStudentDetails,
  addCompetition,
  addStudentMember,
} from "@/app/actions";

type StudentData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  group: string;
  belt: string;
  stripes: number;
  subscriptionStatus: string;
  classCount: number;
};

export function RosterView({ students }: { students: StudentData[] }) {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const filtered = students.filter((s) => {
    const matchesGroup = selectedGroup === "ALL" || s.group === selectedGroup;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q);
    return matchesGroup && matchesSearch;
  });

  const countByGroup = (group: string) => {
    if (group === "ALL") return students.length;
    return students.filter((s) => s.group === group).length;
  };

  const groupColor = (group: string) => {
    switch (group) {
      case "Adults":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "Kids":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "Competition Team":
        return "bg-purple-100 text-purple-900 border-purple-300";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="display-tight text-3xl">Roster &amp; Member Groups</h1>
          <p className="mt-1 text-sm text-ink/60">
            Manage members, phone numbers, and move students between groups with 1 click.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn !py-2 !px-4 text-xs font-mono uppercase tracking-wider self-start sm:self-auto"
        >
          {showAddForm ? "Cancel" : "+ Add Member"}
        </button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <form
          action={async (formData) => {
            await addStudentMember(formData);
            setShowAddForm(false);
          }}
          className="border-2 border-flow bg-white p-5 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-line pb-2">
            <p className="font-display uppercase text-lg">Add New Academy Member</p>
            <span className="font-mono text-xs text-ink/50">Password defaults to: osss</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="label">Full Name</label>
              <input name="name" className="field" placeholder="Marcus Almeida" required />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input name="phone" className="field" placeholder="(530) 555-0192" required />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input name="email" type="email" className="field" placeholder="member@gmail.com" required />
            </div>
            <div>
              <label className="label">Group</label>
              <select name="group" defaultValue="Adults" className="field">
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Starting Belt</label>
              <select name="belt" defaultValue="WHITE" className="field">
                {BELT_ORDER.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Initial Stripes</label>
              <input name="stripes" type="number" min={0} max={4} defaultValue={0} className="field" />
            </div>
          </div>
          <button className="btn !py-2.5 !px-6 text-sm">Save New Member</button>
        </form>
      )}

      {/* Group Filter Tabs & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-y border-line py-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGroup("ALL")}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-colors ${
              selectedGroup === "ALL"
                ? "bg-ink text-mat border-ink"
                : "bg-white text-ink/70 border-line hover:border-ink"
            }`}
          >
            All Members ({countByGroup("ALL")})
          </button>
          {GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-colors ${
                selectedGroup === group
                  ? "bg-ink text-mat border-ink"
                  : "bg-white text-ink/70 border-line hover:border-ink"
              }`}
            >
              {group} ({countByGroup(group)})
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, email…"
            className="field !py-1.5 !text-xs"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {filtered.map((s) => (
          <div key={s.id} className="border border-line bg-white shadow-sm transition-all hover:border-ink/40">
            {/* Main Row */}
            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              {/* Member Details */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg tracking-wide text-ink">{s.name}</span>
                  <span
                    className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${groupColor(
                      s.group
                    )}`}
                  >
                    {s.group}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-ink/50">
                    {s.classCount} classes · {s.subscriptionStatus.toLowerCase().replace("_", " ")}
                  </span>
                </div>

                {/* Contact info: Phone & Email */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  {s.phone ? (
                    <a
                      href={`tel:${s.phone.replace(/[^0-9+]/g, "")}`}
                      className="flex items-center gap-1 text-flow font-medium hover:underline"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {s.phone}
                    </a>
                  ) : (
                    <span className="text-ink/40">No phone</span>
                  )}

                  <a href={`mailto:${s.email}`} className="text-ink/70 hover:underline">
                    {s.email}
                  </a>
                </div>
              </div>

              {/* Belt & Quick Move Group Selector */}
              <div className="flex flex-wrap items-center gap-4 border-t border-line/60 pt-3 md:border-0 md:pt-0">
                <BeltBadge belt={s.belt} stripes={s.stripes} />

                {/* Instant 1-Click Group Switcher */}
                <form action={changeStudentGroup} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={s.id} />
                  <label htmlFor={`group-select-${s.id}`} className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
                    Group:
                  </label>
                  <select
                    id={`group-select-${s.id}`}
                    name="group"
                    defaultValue={s.group}
                    onChange={(e) => e.target.form?.requestSubmit()}
                    className="border border-line bg-neutral-50 px-2 py-1 font-mono text-xs font-medium focus:border-flow focus:bg-white focus:outline-none"
                  >
                    {GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </form>
              </div>
            </div>

            {/* Expandable Details for Full Edit & Competition Logging */}
            <details className="border-t border-line/70 bg-neutral-50/50">
              <summary className="cursor-pointer px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-ink/50 hover:text-ink">
                ▸ Edit Rank, Phone &amp; Log Competitions
              </summary>
              <div className="grid gap-6 border-t border-line bg-white p-4 md:grid-cols-2">
                {/* Edit Form */}
                <form action={updateStudentDetails} className="space-y-3">
                  <p className="eyebrow text-ink/50">Edit Member Information</p>
                  <input type="hidden" name="id" value={s.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label">Name</label>
                      <input name="name" defaultValue={s.name} className="field" required />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input name="phone" defaultValue={s.phone} className="field" placeholder="(530) 555-0000" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input name="email" type="email" defaultValue={s.email} className="field" required />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="label">Group</label>
                      <select name="group" defaultValue={s.group} className="field">
                        {GROUPS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="label">Belt</label>
                      <select name="belt" defaultValue={s.belt} className="field">
                        {BELT_ORDER.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <label className="label">Stripes</label>
                      <input
                        name="stripes"
                        type="number"
                        min={0}
                        max={4}
                        defaultValue={s.stripes}
                        className="field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Membership Status</label>
                    <select name="subscriptionStatus" defaultValue={s.subscriptionStatus} className="field">
                      {["TRIAL", "ACTIVE", "PAST_DUE", "CANCELED"].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="btn !py-2 !text-xs">Save Changes</button>
                </form>

                {/* Competition Logging */}
                <form action={addCompetition} className="space-y-3">
                  <p className="eyebrow text-ink/50">Log Competition for {s.name}</p>
                  <input type="hidden" name="userId" value={s.id} />
                  <div>
                    <label className="label">Event Name</label>
                    <input name="name" className="field" placeholder="Sacramento Open" required />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="label">Date</label>
                      <input name="date" type="date" className="field" required />
                    </div>
                    <div className="flex-1">
                      <label className="label">Result</label>
                      <select name="result" className="field">
                        {["Gold", "Silver", "Bronze", "Competed"].map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Division</label>
                    <input name="division" className="field" placeholder="Adult Blue / Feather" />
                  </div>
                  <button className="btn !py-2 !text-xs">Add Result</button>
                </form>
              </div>
            </details>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="border border-line bg-white p-8 text-center text-sm text-ink/60">
            No members found matching your search or group filter.
          </div>
        )}
      </div>
    </div>
  );
}
