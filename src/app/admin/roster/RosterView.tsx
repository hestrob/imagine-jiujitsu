"use client";

import { useState } from "react";
import Link from "next/link";
import { BeltBadge } from "@/components/BeltBadge";
import {
  BELT_ORDER,
  BELT_LABELS,
  getBirthdayPromotionInfo,
} from "@/lib/belts";
import { GROUPS } from "@/lib/constants";
import {
  changeStudentGroup,
  updateStudentDetails,
  addCompetition,
  deleteStudent,
} from "@/app/actions";
import { OnboardingForm } from "@/app/join/OnboardingForm";

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
  dob: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  medicalNotes: string;
  memberType: "NEW" | "EXISTING";
  familyId: string;
};

export function RosterView({ students }: { students: StudentData[] }) {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const enrichedStudents = students.map((s) => ({
    ...s,
    bdayInfo: getBirthdayPromotionInfo(s.dob, s.group, s.belt),
  }));

  const upcomingBirthdaysAndPromos = enrichedStudents
    .filter(
      (s) =>
        s.bdayInfo &&
        (s.bdayInfo.daysUntilBirthday <= 60 ||
          s.bdayInfo.groupMoveAlert ||
          s.bdayInfo.promotionMilestone)
    )
    .sort(
      (a, b) =>
        (a.bdayInfo?.daysUntilBirthday ?? 999) -
        (b.bdayInfo?.daysUntilBirthday ?? 999)
    );

  const filtered = enrichedStudents.filter((s) => {
    const matchesGroup =
      selectedGroup === "ALL"
        ? true
        : selectedGroup === "BIRTHDAYS"
        ? Boolean(
            s.bdayInfo &&
              (s.bdayInfo.daysUntilBirthday <= 60 ||
                s.bdayInfo.groupMoveAlert ||
                s.bdayInfo.promotionMilestone)
          )
        : s.group === selectedGroup;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.parentName.toLowerCase().includes(q) ||
      s.parentPhone.toLowerCase().includes(q) ||
      s.parentEmail.toLowerCase().includes(q);
    return matchesGroup && matchesSearch;
  });

  const countByGroup = (group: string) => {
    if (group === "ALL") return students.length;
    return students.filter((s) => s.group === group).length;
  };

  const groupColor = (group: string) => {
    switch (group) {
      case "Kids (5-6)":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "Juniors (7-12)":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "Adults (13+)":
        return "bg-blue-100 text-blue-900 border-blue-300";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-300";
    }
  };

  const copyOnboardLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/join`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="display-tight text-3xl">
            Roster, Families &amp; Birthday Promotions
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Track student DOBs for age-up promotions, parent contacts for billing, and manage groups with 1 click.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={copyOnboardLink}
            className="border border-line bg-white px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-ink hover:border-flow hover:text-flow transition-colors"
          >
            {copiedLink ? "✓ Link Copied (/join)" : "🔗 Copy Onboarding Link"}
          </button>
          <Link
            href="/join"
            className="border border-line bg-white px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-ink hover:border-flow hover:text-flow transition-colors"
          >
            View Public Form ↗
          </Link>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn !py-2 !px-4 text-xs font-mono uppercase tracking-wider"
          >
            {showAddForm ? "Close Form" : "+ Onboard Family / Student"}
          </button>
        </div>
      </div>

      {/* Embedded Multi-Student / Family Onboarding Form */}
      {showAddForm && (
        <div className="border-2 border-flow bg-neutral-50/70 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <p className="eyebrow text-flow">Admin Quick Onboarding</p>
              <h2 className="font-display uppercase text-2xl">
                Onboard New Family or Existing Student
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="font-mono text-xs uppercase text-ink/60 hover:text-ink"
            >
              ✕ Close
            </button>
          </div>
          <OnboardingForm
            isAdminMode
            onSuccess={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Upcoming Birthdays & Age-Up Promotion Tracker Widget */}
      {upcomingBirthdaysAndPromos.length > 0 && (
        <div className="border-2 border-amber-400 bg-amber-50/40 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                🎂
              </span>
              <div>
                <p className="font-display uppercase text-lg text-ink">
                  Upcoming Birthdays &amp; Age-Up Promotion Tracker
                </p>
                <p className="text-xs text-ink/70">
                  Students with birthdays in the next 60 days or ready to move up by age (Kids 5–6 → Juniors 7–12 → Adults 13+ / 16+ Blue Belt).
                </p>
              </div>
            </div>
            <span className="rounded bg-amber-200/80 px-2.5 py-1 font-mono text-xs font-bold uppercase text-amber-950">
              {upcomingBirthdaysAndPromos.length} Action{" "}
              {upcomingBirthdaysAndPromos.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingBirthdaysAndPromos.map((s) => {
              const info = s.bdayInfo!;
              return (
                <div
                  key={s.id}
                  className="border border-amber-300 bg-white p-3.5 shadow-sm flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display uppercase text-base text-ink">
                        {s.name}
                      </span>
                      <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-900">
                        {info.daysUntilBirthday === 0
                          ? "🎉 Birthday Today!"
                          : `In ${info.daysUntilBirthday}d (${info.nextBirthdayFormatted})`}
                      </span>
                    </div>

                    <p className="font-mono text-xs text-ink/70">
                      Current Age: <strong>{info.age}</strong> → Turning{" "}
                      <strong>{info.turningAge}</strong> · DOB: {s.dob}
                    </p>

                    <div className="pt-1">
                      <BeltBadge belt={s.belt} stripes={s.stripes} />
                    </div>

                    {info.groupMoveAlert && (
                      <p className="rounded border border-purple-300 bg-purple-50 px-2 py-1 font-mono text-[11px] font-semibold text-purple-900">
                        ⬆ {info.groupMoveAlert}
                      </p>
                    )}

                    {info.promotionMilestone && (
                      <p className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 font-mono text-[11px] font-semibold text-emerald-900">
                        🥋 {info.promotionMilestone}
                      </p>
                    )}
                  </div>

                  {info.suggestedGroup !== s.group && (
                    <form action={changeStudentGroup}>
                      <input type="hidden" name="id" value={s.id} />
                      <input
                        type="hidden"
                        name="group"
                        value={info.suggestedGroup}
                      />
                      <button className="w-full border border-flow bg-amber-50/70 px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-flow hover:bg-flow hover:text-white transition-colors">
                        Move to {info.suggestedGroup} →
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
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
          <button
            onClick={() => setSelectedGroup("BIRTHDAYS")}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-colors ${
              selectedGroup === "BIRTHDAYS"
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-amber-50 text-amber-950 border-amber-300 hover:border-amber-600"
            }`}
          >
            🎂 Birthdays &amp; Age-Ups ({upcomingBirthdaysAndPromos.length})
          </button>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, parent, phone, email…"
            className="field !py-1.5 !text-xs"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {filtered.map((s) => {
          const info = s.bdayInfo;
          const displayPhone = s.parentPhone || s.phone;
          const displayEmail = s.parentEmail || s.email;

          return (
            <div
              key={s.id}
              className="border border-line bg-white shadow-sm transition-all hover:border-ink/40"
            >
              {/* Main Row */}
              <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                {/* Member Details */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg tracking-wide text-ink">
                      {s.name}
                    </span>
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${groupColor(
                        s.group
                      )}`}
                    >
                      {s.group}
                    </span>
                    {info && (
                      <span className="inline-flex items-center rounded border border-line bg-neutral-50 px-2 py-0.5 font-mono text-[11px] text-ink/80">
                        Age {info.age} · DOB {s.dob}
                      </span>
                    )}
                    {info && info.daysUntilBirthday <= 45 && (
                      <span className="inline-flex items-center rounded border border-amber-300 bg-amber-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-950">
                        🎂 Turns {info.turningAge} on {info.nextBirthdayFormatted} ({info.daysUntilBirthday}d)
                      </span>
                    )}
                    <span className="font-mono text-xs uppercase tracking-widest text-ink/50">
                      {s.classCount} classes ·{" "}
                      {s.subscriptionStatus.toLowerCase().replace("_", " ")}
                    </span>
                  </div>

                  {/* Promotion / Age-Up Alert Banner */}
                  {(info?.groupMoveAlert || info?.promotionMilestone) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {info.groupMoveAlert && (
                        <span className="rounded border border-purple-300 bg-purple-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-purple-900">
                          ⬆ {info.groupMoveAlert}
                        </span>
                      )}
                      {info.promotionMilestone && (
                        <span className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-900">
                          🥋 {info.promotionMilestone}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Parent / Billing Contact & Phone / Email */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono pt-0.5">
                    {s.parentName && (
                      <span className="text-ink font-semibold">
                        Parent/Billing: {s.parentName}
                      </span>
                    )}

                    {displayPhone ? (
                      <a
                        href={`tel:${displayPhone.replace(/[^0-9+]/g, "")}`}
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
                        {displayPhone}
                      </a>
                    ) : (
                      <span className="text-ink/40">No phone</span>
                    )}

                    <a
                      href={`mailto:${displayEmail}`}
                      className="text-ink/70 hover:underline"
                    >
                      {displayEmail}
                    </a>

                    {s.medicalNotes && (
                      <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] text-rose-800">
                        ⚕ Note: {s.medicalNotes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Belt & Quick Move Group Selector */}
                <div className="flex flex-wrap items-center gap-4 border-t border-line/60 pt-3 md:border-0 md:pt-0">
                  <BeltBadge belt={s.belt} stripes={s.stripes} />

                  {/* Instant 1-Click Group Switcher */}
                  <form
                    action={changeStudentGroup}
                    className="flex items-center gap-1.5"
                  >
                    <input type="hidden" name="id" value={s.id} />
                    <label
                      htmlFor={`group-select-${s.id}`}
                      className="font-mono text-[10px] uppercase tracking-wider text-ink/50"
                    >
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
                  ▸ Edit DOB, Parent/Billing Contact, Rank &amp; Log Competitions
                </summary>
                <div className="grid gap-6 border-t border-line bg-white p-4 md:grid-cols-2">
                  {/* Edit Form */}
                  <form action={updateStudentDetails} className="space-y-3">
                    <p className="eyebrow text-ink/50">
                      Edit Student &amp; Billing Information
                    </p>
                    <input type="hidden" name="id" value={s.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="label">Student Name</label>
                        <input
                          name="name"
                          defaultValue={s.name}
                          className="field"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Date of Birth (DOB)</label>
                        <input
                          name="dob"
                          type="date"
                          defaultValue={s.dob}
                          className="field font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="label">
                          Parent / Guardian Name (If under 18)
                        </label>
                        <input
                          name="parentName"
                          defaultValue={s.parentName}
                          className="field"
                          placeholder="Parent full name"
                        />
                      </div>
                      <div>
                        <label className="label">
                          Parent / Primary Phone (Billing &amp; SMS)
                        </label>
                        <input
                          name="parentPhone"
                          defaultValue={s.parentPhone || s.phone}
                          className="field"
                          placeholder="(530) 555-0000"
                        />
                        <input
                          type="hidden"
                          name="phone"
                          value={s.parentPhone || s.phone}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="label">
                          Primary / Billing Email
                        </label>
                        <input
                          name="email"
                          type="email"
                          defaultValue={s.email}
                          className="field"
                          required
                        />
                        <input
                          type="hidden"
                          name="parentEmail"
                          value={s.parentEmail || s.email}
                        />
                      </div>
                      <div>
                        <label className="label">
                          Medical Notes / Allergies
                        </label>
                        <input
                          name="medicalNotes"
                          defaultValue={s.medicalNotes}
                          className="field"
                          placeholder="Optional medical or injury notes"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="label">Group</label>
                        <select
                          name="group"
                          defaultValue={s.group}
                          className="field"
                        >
                          {GROUPS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="label">Belt</label>
                        <select
                          name="belt"
                          defaultValue={s.belt}
                          className="field"
                        >
                          {BELT_ORDER.map((b) => (
                            <option key={b} value={b}>
                              {BELT_LABELS[b] || b}
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
                      <label className="label">Membership / Billing Status</label>
                      <select
                        name="subscriptionStatus"
                        defaultValue={s.subscriptionStatus}
                        className="field"
                      >
                        {["TRIAL", "ACTIVE", "PAST_DUE", "CANCELED"].map(
                          (v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <button className="btn !py-2 !text-xs">Save Changes</button>
                  </form>

                  {/* Competition Logging */}
                  <form action={addCompetition} className="space-y-3">
                    <p className="eyebrow text-ink/50">
                      Log Competition for {s.name}
                    </p>
                    <input type="hidden" name="userId" value={s.id} />
                    <div>
                      <label className="label">Event Name</label>
                      <input
                        name="name"
                        className="field"
                        placeholder="Sacramento Open"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="label">Date</label>
                        <input
                          name="date"
                          type="date"
                          className="field"
                          required
                        />
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
                      <input
                        name="division"
                        className="field"
                        placeholder="Adult Blue / Feather"
                      />
                    </div>
                    <button className="btn !py-2 !text-xs">Add Result</button>
                  </form>

                  <div className="md:col-span-2 border-t border-line pt-3 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-ink/50">
                      Need to remove {s.name} from the academy roster?
                    </span>
                    <form action={deleteStudent}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="border border-rose-300 bg-rose-50 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-rose-700 hover:bg-rose-600 hover:text-white transition-colors"
                      >
                        Remove Student
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="border border-line bg-white p-8 text-center text-sm text-ink/60">
            No members found matching your search or filter.
          </div>
        )}
      </div>
    </div>
  );
}
