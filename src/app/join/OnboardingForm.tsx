"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import {
  submitOnboarding,
  type OnboardStudentPayload,
  type OnboardingActionState,
} from "@/app/actions";
import {
  BELT_ORDER,
  BELT_LABELS,
  calculateAge,
  suggestGroupFromAge,
  getBirthdayPromotionInfo,
} from "@/lib/belts";
import { GROUPS } from "@/lib/constants";
import { BeltBadge } from "@/components/BeltBadge";

function SubmitButton({ studentCount, isAdminMode }: { studentCount: number; isAdminMode?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn w-full sm:w-auto !py-3.5 !px-8 text-sm font-semibold tracking-wide"
    >
      {pending
        ? "Saving Student & Family Profile…"
        : isAdminMode
        ? `Save ${studentCount} ${studentCount === 1 ? "Student" : "Family Members"} to Roster`
        : `Complete Onboarding (${studentCount} ${studentCount === 1 ? "Student" : "Students"})`}
    </button>
  );
}

const createEmptyStudent = (defaultType: "NEW" | "EXISTING"): OnboardStudentPayload => ({
  name: "",
  dob: "",
  group: "Adults (13+)",
  memberType: defaultType,
  belt: "WHITE",
  stripes: 0,
  startDate: "",
  studentEmail: "",
  studentPhone: "",
  medicalNotes: "",
});

export function OnboardingForm({
  isAdminMode = false,
  onSuccess,
}: {
  isAdminMode?: boolean;
  onSuccess?: () => void;
}) {
  const [onboardingMode, setOnboardingMode] = useState<"NEW" | "EXISTING">("NEW");
  const [students, setStudents] = useState<OnboardStudentPayload[]>([
    createEmptyStudent("NEW"),
  ]);
  const [parentName, setParentName] = useState<string>("");
  const [parentPhone, setParentPhone] = useState<string>("");
  const [parentEmail, setParentEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [state, formAction] = useFormState<OnboardingActionState | undefined, FormData>(
    submitOnboarding,
    undefined
  );

  useEffect(() => {
    if (state?.ok && onSuccess) {
      onSuccess();
    }
  }, [state, onSuccess]);

  const switchTopMode = (mode: "NEW" | "EXISTING") => {
    setOnboardingMode(mode);
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        memberType: mode,
      }))
    );
  };

  const updateStudent = (index: number, patch: Partial<OnboardStudentPayload>) => {
    setStudents((prev) =>
      prev.map((student, i) => {
        if (i !== index) return student;
        const updated = { ...student, ...patch };
        // Auto-suggest group when DOB changes
        if (patch.dob !== undefined && patch.dob) {
          const age = calculateAge(patch.dob);
          if (age !== null) {
            updated.group = suggestGroupFromAge(age);
          }
        }
        return updated;
      })
    );
  };

  const addAnotherStudent = () => {
    setStudents((prev) => [...prev, createEmptyStudent(onboardingMode)]);
  };

  const removeStudent = (index: number) => {
    if (students.length <= 1) return;
    setStudents((prev) => prev.filter((_, i) => i !== index));
  };

  const anyUnder18 = students.some((s) => {
    const age = calculateAge(s.dob);
    return age !== null && age < 18;
  });

  const isMultiStudent = students.length > 1;

  if (state?.ok && state.onboarded && !isAdminMode) {
    return (
      <div className="border-2 border-emerald-600 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-line pb-4">
          <p className="eyebrow text-emerald-700">Onboarding Complete</p>
          <h2 className="display-tight mt-1 text-3xl sm:text-4xl">
            Welcome to the Mat!
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            We&apos;ve saved your student profile{state.onboarded.length > 1 ? "s" : ""}, birthday promotion tracking, and billing contact info.
          </p>
        </div>

        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
            Onboarded Students ({state.onboarded.length})
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {state.onboarded.map((s) => (
              <div
                key={s.id}
                className="border border-line bg-neutral-50/70 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-xl uppercase">{s.name}</span>
                  <span className="rounded border border-line bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                    {s.group}
                  </span>
                </div>
                <BeltBadge belt={s.belt} stripes={s.stripes} />
                <div className="text-xs font-mono text-ink/60 space-y-0.5 pt-1 border-t border-line/60">
                  <p>
                    DOB: {s.dob} {s.age !== null ? `(Age ${s.age})` : ""}
                  </p>
                  {s.parentName && <p>Parent/Guardian: {s.parentName}</p>}
                  <p>Contact: {s.phone} · {s.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href="/portal" className="btn !py-3 !px-6 text-sm">
            Go to My Mat Portal →
          </Link>
          <Link
            href="/schedule"
            className="border border-line bg-neutral-50 px-5 py-3 font-mono text-xs uppercase tracking-wider hover:border-ink"
          >
            View Class Schedule
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <input
        type="hidden"
        name="studentsJson"
        value={JSON.stringify(students)}
      />

      {/* Mode Switcher: New Family vs Existing Student */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => switchTopMode("NEW")}
          className={`border p-4 text-left transition-all ${
            onboardingMode === "NEW"
              ? "border-flow bg-ink text-mat shadow-sm"
              : "border-line bg-white text-ink hover:border-ink/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-display uppercase text-lg tracking-wide">
              New Family / New Student
            </span>
            {onboardingMode === "NEW" && (
              <span className="rounded bg-flow px-2 py-0.5 font-mono text-[10px] uppercase text-white">
                Selected
              </span>
            )}
          </div>
          <p
            className={`mt-1 text-xs ${
              onboardingMode === "NEW" ? "text-mat/75" : "text-ink/60"
            }`}
          >
            First time at Imagine Jiu Jitsu. Onboard 1 or more family members &amp; set up billing contact.
          </p>
        </button>

        <button
          type="button"
          onClick={() => switchTopMode("EXISTING")}
          className={`border p-4 text-left transition-all ${
            onboardingMode === "EXISTING"
              ? "border-flow bg-ink text-mat shadow-sm"
              : "border-line bg-white text-ink hover:border-ink/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-display uppercase text-lg tracking-wide">
              Existing Student Check-In
            </span>
            {onboardingMode === "EXISTING" && (
              <span className="rounded bg-flow px-2 py-0.5 font-mono text-[10px] uppercase text-white">
                Selected
              </span>
            )}
          </div>
          <p
            className={`mt-1 text-xs ${
              onboardingMode === "EXISTING" ? "text-mat/75" : "text-ink/60"
            }`}
          >
            Already training with us? Add your DOB, current belt &amp; stripes, and parent/billing contact.
          </p>
        </button>
      </div>

      {state?.error && (
        <div className="border-2 border-rose-600 bg-rose-50 p-4 text-sm text-rose-900 font-medium">
          {state.error}
        </div>
      )}

      {/* Section 1: Student Profiles */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
          <div>
            <p className="eyebrow text-flow">Step 1 · Student Information</p>
            <h2 className="font-display uppercase text-2xl">
              {students.length === 1 ? "Student Profile" : `Family Students (${students.length})`}
            </h2>
          </div>
          <button
            type="button"
            onClick={addAnotherStudent}
            className="border border-flow bg-amber-50/70 px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-flow hover:bg-flow hover:text-white transition-colors"
          >
            + Add Another Student / Sibling
          </button>
        </div>

        <div className="space-y-5">
          {students.map((student, index) => {
            const age = calculateAge(student.dob);
            const bdayInfo = getBirthdayPromotionInfo(
              student.dob,
              student.group,
              student.belt
            );
            const isMinor = age !== null && age < 18;

            return (
              <div
                key={index}
                className="border border-line bg-white p-5 sm:p-6 shadow-sm space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display uppercase text-xl text-ink">
                      Student #{index + 1}
                      {student.name ? ` — ${student.name}` : ""}
                    </span>
                    {age !== null && (
                      <span
                        className={`rounded border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase ${
                          isMinor
                            ? "border-amber-300 bg-amber-100 text-amber-900"
                            : "border-blue-300 bg-blue-100 text-blue-900"
                        }`}
                      >
                        Age {age} · {isMinor ? "Under 18 (Parent Required)" : "Adult 18+"}
                      </span>
                    )}
                    {bdayInfo && (
                      <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-[11px] text-ink/70">
                        🎂 Next B-Day: {bdayInfo.nextBirthdayFormatted} (Turns {bdayInfo.turningAge})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Individual student New vs Existing toggle */}
                    <div className="inline-flex border border-line bg-neutral-50 p-0.5 font-mono text-[10px] uppercase">
                      <button
                        type="button"
                        onClick={() =>
                          updateStudent(index, {
                            memberType: "NEW",
                            belt: "WHITE",
                            stripes: 0,
                          })
                        }
                        className={`px-2 py-1 transition-colors ${
                          student.memberType === "NEW"
                            ? "bg-ink text-mat font-semibold"
                            : "text-ink/60 hover:text-ink"
                        }`}
                      >
                        New
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStudent(index, { memberType: "EXISTING" })}
                        className={`px-2 py-1 transition-colors ${
                          student.memberType === "EXISTING"
                            ? "bg-ink text-mat font-semibold"
                            : "text-ink/60 hover:text-ink"
                        }`}
                      >
                        Existing
                      </button>
                    </div>

                    {students.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStudent(index)}
                        className="font-mono text-xs uppercase text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Core Student Fields: Name, DOB, Auto-Assigned Group */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="label">Student Full Name *</label>
                    <input
                      value={student.name}
                      onChange={(e) => updateStudent(index, { name: e.target.value })}
                      placeholder="e.g. Leo Martinez"
                      className="field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Date of Birth (DOB) *</label>
                    <input
                      type="date"
                      value={student.dob}
                      onChange={(e) => updateStudent(index, { dob: e.target.value })}
                      className="field font-mono"
                      required
                    />
                    <p className="mt-1 font-mono text-[10px] text-ink/50">
                      Used to track birthday &amp; age promotions
                    </p>
                  </div>

                  <div>
                    <label className="label">
                      Class Group {age !== null ? "(Auto-matched by age)" : ""}
                    </label>
                    <select
                      value={student.group}
                      onChange={(e) => updateStudent(index, { group: e.target.value })}
                      className="field"
                    >
                      {GROUPS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    {bdayInfo?.promotionMilestone && (
                      <p className="mt-1 font-mono text-[10px] text-flow font-semibold">
                        ★ {bdayInfo.promotionMilestone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Existing Student Rank & Start Date Fields */}
                {student.memberType === "EXISTING" && (
                  <div className="border border-amber-300 bg-amber-50/40 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
                        Existing Student Current Rank &amp; Experience
                      </p>
                      <BeltBadge belt={student.belt} stripes={student.stripes} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="label">Current Belt Rank</label>
                        <select
                          value={student.belt}
                          onChange={(e) =>
                            updateStudent(index, { belt: e.target.value })
                          }
                          className="field bg-white"
                        >
                          {BELT_ORDER.map((b) => (
                            <option key={b} value={b}>
                              {BELT_LABELS[b] || b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="label">Current Stripes (0–4)</label>
                        <select
                          value={student.stripes}
                          onChange={(e) =>
                            updateStudent(index, {
                              stripes: Number(e.target.value),
                            })
                          }
                          className="field bg-white"
                        >
                          {[0, 1, 2, 3, 4].map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? "stripe" : "stripes"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="label">Approx. Start Date (Optional)</label>
                        <input
                          type="date"
                          value={student.startDate || ""}
                          onChange={(e) =>
                            updateStudent(index, { startDate: e.target.value })
                          }
                          className="field bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Medical Notes / Allergies / Injuries */}
                <div>
                  <label className="label">
                    Medical Notes, Allergies, or Past Injuries (Optional)
                  </label>
                  <input
                    value={student.medicalNotes || ""}
                    onChange={(e) =>
                      updateStudent(index, { medicalNotes: e.target.value })
                    }
                    placeholder="e.g. None, asthma inhaler in gym bag, prior knee injury…"
                    className="field"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {students.length > 0 && (
          <button
            type="button"
            onClick={addAnotherStudent}
            className="w-full border-2 border-dashed border-line bg-white/60 py-3 font-mono text-xs uppercase tracking-wider text-ink/70 hover:border-flow hover:text-flow transition-colors"
          >
            + Add Another Student or Family Member to This Form
          </button>
        )}
      </div>

      {/* Section 2: Parent / Guardian & Billing Contact Info */}
      <div className="border-2 border-ink bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
          <div>
            <p className="eyebrow text-flow">
              Step 2 · {anyUnder18 || isMultiStudent ? "Parent & Family Billing Contact" : "Contact & Billing Setup"}
            </p>
            <h2 className="font-display uppercase text-2xl">
              {anyUnder18
                ? "Parent / Guardian & Billing Details"
                : "Primary Contact & Billing Details"}
            </h2>
            <p className="mt-1 text-xs text-ink/60">
              {anyUnder18
                ? "Since one or more students are under 18, please provide parent/guardian contact details for class alerts and monthly billing."
                : "Used for schedule alerts, membership billing ($60/mo), and account access."}
            </p>
          </div>
          {anyUnder18 && (
            <span className="rounded border border-amber-400 bg-amber-100 px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-amber-950">
              Parent Info Required (Under 18)
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="parentName">
              {anyUnder18
                ? "Parent / Guardian Full Name *"
                : "Parent or Billing Contact Name (If applicable)"}
            </label>
            <input
              id="parentName"
              name="parentName"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder={
                anyUnder18 ? "e.g. Carlos Martinez" : "Leave blank if billing is in student's name"
              }
              className="field"
              required={anyUnder18}
            />
          </div>

          <div>
            <label className="label" htmlFor="parentPhone">
              {anyUnder18 ? "Parent Mobile Number *" : "Mobile Phone Number *"}
            </label>
            <input
              id="parentPhone"
              name="parentPhone"
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="(530) 555-0199"
              className="field"
              required
            />
            <p className="mt-1 font-mono text-[10px] text-ink/50">
              Used for SMS schedule changes &amp; billing contact
            </p>
          </div>

          <div>
            <label className="label" htmlFor="parentEmail">
              {anyUnder18 ? "Parent / Billing Email Address *" : "Email Address (Billing & Login) *"}
            </label>
            <input
              id="parentEmail"
              name="parentEmail"
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="family@example.com"
              className="field"
              required
            />
            <p className="mt-1 font-mono text-[10px] text-ink/50">
              Used for easy billing setup &amp; academy announcements
            </p>
          </div>

          {!isAdminMode && (
            <div>
              <label className="label" htmlFor="password">
                Create Portal Password (Optional)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6+ characters (defaults to: osss)"
                minLength={6}
                className="field"
              />
              <p className="mt-1 font-mono text-[10px] text-ink/50">
                Sign in anytime at /login to view belt progress &amp; attendance
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-line pt-4">
          <div className="text-xs text-ink/60">
            <span className="font-mono uppercase font-semibold text-ink">
              Membership Rate:
            </span>{" "}
            $60/mo per student · No contracts. Billing info saved for easy setup.
          </div>
          <SubmitButton studentCount={students.length} isAdminMode={isAdminMode} />
        </div>
      </div>
    </form>
  );
}
