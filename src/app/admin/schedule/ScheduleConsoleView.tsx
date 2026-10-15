"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { BeltBadge } from "@/components/BeltBadge";
import {
  GROUPS,
  DAYS_OF_WEEK,
  type BroadcastRow,
  type ScheduleRow,
  serializeSchedule,
} from "@/lib/constants";
import { saveScheduleConsole, changeStudentGroup } from "@/app/actions";

export type ScheduleMember = {
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

function SaveButton({
  notifyMembers,
  selectedCount,
}: {
  notifyMembers: boolean;
  selectedCount: number;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || (notifyMembers && selectedCount === 0)}
      className="btn !py-3 !px-6 text-sm font-semibold tracking-wide w-full sm:w-auto flex items-center justify-center gap-2"
    >
      {pending ? (
        <span>Saving Schedule &amp; Updating App…</span>
      ) : notifyMembers ? (
        <span>
          Save Schedule &amp; Alert {selectedCount}{" "}
          {selectedCount === 1 ? "Member" : "Members"}
        </span>
      ) : (
        <span>Save Schedule Changes</span>
      )}
    </button>
  );
}

export function ScheduleConsoleView({
  initialSchedule,
  students,
  recentChanges,
}: {
  initialSchedule: ScheduleRow[];
  students: ScheduleMember[];
  recentChanges: BroadcastRow[];
}) {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [rows, setRows] = useState<ScheduleRow[]>(initialSchedule);
  const [memberSearch, setMemberSearch] = useState<string>("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(
    () => new Set(students.map((s) => s.id))
  );

  // Notification composer state
  const [notifyMembers, setNotifyMembers] = useState<boolean>(true);
  const [channel, setChannel] = useState<string>("ALL");
  const [title, setTitle] = useState<string>("Schedule Change Notice");
  const [message, setMessage] = useState<string>("");

  // Add new class form state
  const [showAddClass, setShowAddClass] = useState<boolean>(false);
  const [newDay, setNewDay] = useState<string>("Monday");
  const [newTime, setNewTime] = useState<string>("6:00 – 7:30 PM");
  const [newLabel, setNewLabel] = useState<string>("");
  const [newGroup, setNewGroup] = useState<string>("Adults (13+)");
  const [newNote, setNewNote] = useState<string>("");

  const [state, formAction] = useFormState(saveScheduleConsole, undefined);

  // Members belonging to the currently selected group tab
  const groupMembers = students.filter(
    (s) => selectedGroup === "ALL" || s.group === selectedGroup
  );

  const visibleMembers = groupMembers.filter((s) => {
    const q = memberSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.group.toLowerCase().includes(q)
    );
  });

  // Whenever the selected group tab changes, select all members in that group by default
  useEffect(() => {
    const idsInGroup = students
      .filter((s) => selectedGroup === "ALL" || s.group === selectedGroup)
      .map((s) => s.id);
    setSelectedMemberIds(new Set(idsInGroup));
  }, [selectedGroup, students]);

  const activeSelectedMembers = groupMembers.filter((m) =>
    selectedMemberIds.has(m.id)
  );

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllInGroup = () => {
    setSelectedMemberIds(new Set(groupMembers.map((m) => m.id)));
  };

  const clearSelectionInGroup = () => {
    setSelectedMemberIds(new Set());
  };

  const updateRow = (index: number, patch: Partial<ScheduleRow>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const removeRow = (index: number) => {
    const target = rows[index];
    setRows((prev) => prev.filter((_, i) => i !== index));
    if (target) {
      if (target.group && target.group !== "ALL") {
        setSelectedGroup(target.group);
      }
      setNotifyMembers(true);
      setTitle(`Class Removed: ${target.day} ${target.label}`);
      setMessage(
        `Heads up ${
          target.group === "ALL" ? "team" : target.group + " group"
        }: ${target.day}'s ${target.label} (${target.time}) has been removed from the schedule.`
      );
    }
  };

  const applyQuickScheduleChange = (
    index: number,
    noteText: string,
    autoTitle: string,
    autoMessage: string
  ) => {
    const target = rows[index];
    if (!target) return;
    updateRow(index, { note: noteText });
    if (target.group && target.group !== "ALL") {
      setSelectedGroup(target.group);
    }
    setNotifyMembers(true);
    setTitle(autoTitle);
    setMessage(autoMessage);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    const added: ScheduleRow = {
      day: newDay,
      time: newTime.trim() || "6:00 – 7:30 PM",
      label: newLabel.trim(),
      group: newGroup,
      note: newNote.trim(),
    };
    setRows((prev) => [...prev, added]);
    if (newGroup !== "ALL") {
      setSelectedGroup(newGroup);
    }
    setNotifyMembers(true);
    setTitle(`New Class Added: ${added.day} ${added.label}`);
    setMessage(
      `New class on the schedule for ${
        added.group === "ALL" ? "all members" : added.group
      }: ${added.label} on ${added.day}s at ${added.time}.${
        added.note ? ` Note: ${added.note}` : ""
      }`
    );
    setNewLabel("");
    setNewNote("");
    setShowAddClass(false);
  };

  const visibleScheduleRows = rows
    .map((row, originalIndex) => ({ row, originalIndex }))
    .filter(
      ({ row }) =>
        selectedGroup === "ALL" ||
        row.group === "ALL" ||
        row.group === selectedGroup
    );

  const groupBadgeStyle = (group: string) => {
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

  const phoneList = activeSelectedMembers
    .map((s) => s.phone.replace(/[^0-9+]/g, ""))
    .filter(Boolean)
    .join(",");

  const smsLink = `sms:${phoneList}?&body=${encodeURIComponent(
    `[Imagine JJ] ${title ? title + ": " : ""}${message}`
  )}`;

  const serialized = serializeSchedule(rows);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="display-tight text-3xl">
            Group Schedule &amp; Member Console
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Select a group to view all members in that group, adjust class
            times, and push schedule changes directly to their in-app portal,
            SMS, or email.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (selectedGroup !== "ALL") setNewGroup(selectedGroup);
            setShowAddClass(!showAddClass);
          }}
          className="btn !py-2 !px-4 text-xs font-mono uppercase tracking-wider self-start sm:self-auto"
        >
          {showAddClass ? "Cancel" : "+ Add Class to Schedule"}
        </button>
      </div>

      {/* Feedback Banner */}
      {state?.ok && (
        <div className="border-2 border-emerald-500 bg-emerald-50 p-4 text-emerald-900">
          <p className="font-display uppercase text-lg">Schedule Updated!</p>
          <p className="text-sm mt-1">{state.message}</p>
        </div>
      )}
      {state?.error && (
        <div className="border-2 border-rose-500 bg-rose-50 p-4 text-rose-900 text-sm">
          {state.error}
        </div>
      )}

      {/* Group Selector Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setSelectedGroup("ALL")}
          className={`border p-4 text-left transition-all ${
            selectedGroup === "ALL"
              ? "border-flow bg-ink text-mat shadow-sm"
              : "border-line bg-white text-ink hover:border-ink/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest font-bold">
              All Groups
            </span>
            <span
              className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                selectedGroup === "ALL"
                  ? "bg-flow text-white"
                  : "bg-neutral-100 text-ink/70"
              }`}
            >
              {students.length} members
            </span>
          </div>
          <p
            className={`mt-2 text-xs font-mono ${
              selectedGroup === "ALL" ? "text-mat/70" : "text-ink/50"
            }`}
          >
            {rows.length} total classes
          </p>
        </button>

        {GROUPS.map((group) => {
          const memberCount = students.filter((s) => s.group === group).length;
          const classCount = rows.filter(
            (r) => r.group === group || r.group === "ALL"
          ).length;
          const isActive = selectedGroup === group;
          return (
            <button
              key={group}
              type="button"
              onClick={() => setSelectedGroup(group)}
              className={`border p-4 text-left transition-all ${
                isActive
                  ? "border-flow bg-ink text-mat shadow-sm"
                  : "border-line bg-white text-ink hover:border-ink/50"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs uppercase tracking-widest font-bold truncate">
                  {group}
                </span>
                <span
                  className={`font-mono text-[11px] px-1.5 py-0.5 rounded shrink-0 ${
                    isActive
                      ? "bg-flow text-white"
                      : "bg-neutral-100 text-ink/70"
                  }`}
                >
                  {memberCount} members
                </span>
              </div>
              <p
                className={`mt-2 text-xs font-mono ${
                  isActive ? "text-mat/70" : "text-ink/50"
                }`}
              >
                {classCount} group classes
              </p>
            </button>
          );
        })}
      </div>

      {/* Add Class Modal/Drawer */}
      {showAddClass && (
        <form
          onSubmit={handleAddClass}
          className="border-2 border-flow bg-white p-5 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-line pb-2">
            <p className="font-display uppercase text-lg">
              Add Class to Group Schedule
            </p>
            <span className="font-mono text-xs text-ink/50">
              Automatically pre-fills schedule notice
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            <div>
              <label className="label">Day</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                className="field"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Time Window</label>
              <input
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="field"
                placeholder="6:00 – 7:30 PM"
                required
              />
            </div>
            <div>
              <label className="label">Class Title</label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="field"
                placeholder="No-Gi Positional Sparring"
                required
              />
            </div>
            <div>
              <label className="label">Assigned Group</label>
              <select
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                className="field"
              >
                <option value="ALL">All Groups</option>
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status / Change Note</label>
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="field"
                placeholder="Optional (e.g. New time!)"
              />
            </div>
          </div>
          <button type="submit" className="btn !py-2 !px-5 text-xs">
            + Add Class Row
          </button>
        </form>
      )}

      {/* Main 2-Column Console */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: Group Schedule Classes Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <div>
              <h2 className="font-display uppercase text-xl">
                {selectedGroup === "ALL"
                  ? "Full Weekly Schedule"
                  : `${selectedGroup} — Group Schedule`}
              </h2>
              <p className="text-xs text-ink/60">
                Edit class times, assign groups, or flag a schedule change below.
              </p>
            </div>
            <span className="font-mono text-xs text-ink/50">
              {visibleScheduleRows.length}{" "}
              {visibleScheduleRows.length === 1 ? "class" : "classes"}
            </span>
          </div>

          <div className="space-y-3">
            {visibleScheduleRows.map(({ row, originalIndex }) => (
              <div
                key={originalIndex}
                className={`border bg-white p-4 shadow-sm transition-all space-y-3 ${
                  row.note
                    ? "border-amber-400 bg-amber-50/20"
                    : "border-line hover:border-ink/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display uppercase text-lg text-ink">
                      {row.day}
                    </span>
                    <span className="font-mono text-xs text-flow font-semibold">
                      {row.time}
                    </span>
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${groupBadgeStyle(
                        row.group
                      )}`}
                    >
                      {row.group === "ALL" ? "All Groups" : row.group}
                    </span>
                    {row.note && (
                      <span className="inline-flex items-center rounded bg-amber-200/80 text-amber-950 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">
                        ⚠ {row.note}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(originalIndex)}
                    className="font-mono text-[10px] uppercase tracking-wider text-ink/40 hover:text-rose-600"
                  >
                    Remove
                  </button>
                </div>

                {/* Inline Editable Fields */}
                <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
                  <div>
                    <label className="font-mono text-[10px] uppercase text-ink/50">
                      Day
                    </label>
                    <select
                      value={row.day}
                      onChange={(e) =>
                        updateRow(originalIndex, { day: e.target.value })
                      }
                      className="field !py-1.5 !text-xs"
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase text-ink/50">
                      Time
                    </label>
                    <input
                      value={row.time}
                      onChange={(e) => {
                        const newTimeVal = e.target.value;
                        updateRow(originalIndex, { time: newTimeVal });
                        setNotifyMembers(true);
                        setTitle(`Time Update: ${row.day} ${row.label}`);
                        setMessage(
                          `Schedule update for ${
                            row.group === "ALL" ? "everyone" : row.group
                          }: ${row.day}'s ${row.label} is now scheduled for ${newTimeVal}.`
                        );
                      }}
                      className="field !py-1.5 !text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase text-ink/50">
                      Class Name
                    </label>
                    <input
                      value={row.label}
                      onChange={(e) =>
                        updateRow(originalIndex, { label: e.target.value })
                      }
                      className="field !py-1.5 !text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase text-ink/50">
                      Group
                    </label>
                    <select
                      value={row.group || "ALL"}
                      onChange={(e) =>
                        updateRow(originalIndex, { group: e.target.value })
                      }
                      className="field !py-1.5 !text-xs"
                    >
                      <option value="ALL">All Groups</option>
                      {GROUPS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Schedule Change Note & 1-Click Presets */}
                <div className="pt-2 border-t border-line/60 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                  <div className="flex-1">
                    <input
                      value={row.note || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateRow(originalIndex, { note: val });
                        if (val) {
                          setNotifyMembers(true);
                          setTitle(`Schedule Notice: ${row.day} ${row.label}`);
                          setMessage(
                            `Update for ${
                              row.group === "ALL" ? "all members" : row.group
                            } (${row.day} ${row.label}, ${row.time}): ${val}`
                          );
                        }
                      }}
                      placeholder="Add schedule change banner (e.g. Moved to 6:30 PM tonight, Canceled, Open Mat instead)…"
                      className="field !py-1 !text-xs bg-neutral-50/70"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        applyQuickScheduleChange(
                          originalIndex,
                          "Delayed 30 mins tonight",
                          `Time Change: ${row.day} ${row.label}`,
                          `Heads up ${
                            row.group === "ALL" ? "team" : row.group
                          }! ${row.day}'s ${row.label} (${row.time}) is starting 30 minutes later tonight.`
                        )
                      }
                      className="border border-line bg-neutral-50 px-2 py-1 font-mono text-[10px] uppercase hover:border-flow hover:text-flow"
                    >
                      ⏰ +30m Shift
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyQuickScheduleChange(
                          originalIndex,
                          "Canceled today — Open Mat instead",
                          `Class Update: ${row.day} ${row.label}`,
                          `Notice for ${
                            row.group === "ALL" ? "all members" : row.group
                          }: ${row.day}'s ${row.label} (${row.time}) is canceled today. Open mat rounds instead!`
                        )
                      }
                      className="border border-line bg-neutral-50 px-2 py-1 font-mono text-[10px] uppercase hover:border-rose-500 hover:text-rose-600"
                    >
                      🚫 Cancel / Sub
                    </button>
                    {row.note && (
                      <button
                        type="button"
                        onClick={() => updateRow(originalIndex, { note: "" })}
                        className="border border-line bg-white px-2 py-1 font-mono text-[10px] uppercase text-ink/50 hover:text-ink"
                      >
                        Clear Note
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {visibleScheduleRows.length === 0 && (
              <div className="border border-line bg-white p-8 text-center text-sm text-ink/60">
                No classes assigned to {selectedGroup} yet. Click &ldquo;+ Add
                Class to Schedule&rdquo; above.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Members in Group + Schedule Change Notification Console (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Group Member Roster Card */}
          <div className="border border-line bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
              <div>
                <p className="eyebrow text-flow">Group Roster</p>
                <h3 className="font-display uppercase text-xl">
                  Members in{" "}
                  {selectedGroup === "ALL" ? "All Groups" : selectedGroup}
                </h3>
              </div>
              <span className="font-mono text-xs font-semibold bg-neutral-100 px-2.5 py-1 rounded">
                {activeSelectedMembers.length} of {groupMembers.length} selected
              </span>
            </div>

            {/* Search & Select All / None */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <input
                type="search"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder={`Filter ${
                  selectedGroup === "ALL" ? "all" : selectedGroup
                } members…`}
                className="field !py-1.5 !text-xs flex-1"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={selectAllInGroup}
                  className="border border-line bg-neutral-50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider hover:border-ink"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={clearSelectionInGroup}
                  className="border border-line bg-neutral-50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider hover:border-ink"
                >
                  None
                </button>
              </div>
            </div>

            {/* Listed Members in the Group */}
            <div className="max-h-80 overflow-y-auto divide-y divide-line border border-line/80 bg-neutral-50/30">
              {visibleMembers.map((member) => {
                const isChecked = selectedMemberIds.has(member.id);
                return (
                  <div
                    key={member.id}
                    className={`p-3 flex items-start justify-between gap-3 transition-colors ${
                      isChecked ? "bg-white" : "bg-neutral-50/60 opacity-60"
                    }`}
                  >
                    <label className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMember(member.id)}
                        className="mt-1 h-4 w-4 accent-amber-600 rounded border-line"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium text-sm text-ink truncate">
                            {member.name}
                          </span>
                          <span
                            className={`inline-flex items-center rounded border px-1.5 py-0.2 font-mono text-[10px] font-semibold uppercase ${groupBadgeStyle(
                              member.group
                            )}`}
                          >
                            {member.group}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-ink/60">
                          {member.phone ? (
                            <a
                              href={`tel:${member.phone.replace(/[^0-9+]/g, "")}`}
                              className="text-flow hover:underline"
                            >
                              {member.phone}
                            </a>
                          ) : (
                            <span className="text-ink/40">No phone</span>
                          )}
                          <a
                            href={`mailto:${member.email}`}
                            className="hover:underline truncate"
                          >
                            {member.email}
                          </a>
                        </div>
                      </div>
                    </label>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <BeltBadge belt={member.belt} stripes={member.stripes} />
                      {/* Quick Group Switcher inside Schedule Console */}
                      <form
                        action={changeStudentGroup}
                        className="flex items-center gap-1"
                      >
                        <input type="hidden" name="id" value={member.id} />
                        <select
                          name="group"
                          defaultValue={member.group}
                          onChange={(e) => e.target.form?.requestSubmit()}
                          title="Move member to another group"
                          className="border border-line bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px] text-ink/70 focus:border-flow focus:outline-none"
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
                );
              })}

              {visibleMembers.length === 0 && (
                <div className="p-6 text-center text-xs text-ink/50">
                  No members found in this group matching your filter.
                </div>
              )}
            </div>
          </div>

          {/* Save Schedule & Notify Selected Group Members Form */}
          <form
            action={formAction}
            className="border-2 border-ink bg-white p-5 shadow-sm space-y-4"
          >
            <input type="hidden" name="schedule" value={serialized} />
            <input type="hidden" name="targetGroup" value={selectedGroup} />
            <input
              type="hidden"
              name="notifyMembers"
              value={notifyMembers ? "true" : "false"}
            />
            <input type="hidden" name="channel" value={channel} />
            <input
              type="hidden"
              name="selectedMemberIds"
              value={Array.from(selectedMemberIds).join(",")}
            />

            <div className="flex items-center justify-between border-b border-line pb-2">
              <p className="font-display uppercase text-lg">
                Publish Schedule &amp; Notify Group
              </p>
              <label className="flex items-center gap-2 font-mono text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyMembers}
                  onChange={(e) => setNotifyMembers(e.target.checked)}
                  className="h-4 w-4 accent-amber-600"
                />
                <span>Send Schedule Alert</span>
              </label>
            </div>

            {notifyMembers && (
              <div className="space-y-3">
                <div>
                  <label className="label">Alert Channel</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "ALL", label: "In-App + SMS + Email" },
                      { id: "IN_APP", label: "In-App Portal Only" },
                      { id: "SMS", label: "In-App + SMS Text" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setChannel(c.id)}
                        className={`p-2 text-center border font-mono text-[10px] uppercase tracking-wider transition-colors ${
                          channel === c.id
                            ? "border-ink bg-ink text-mat font-bold"
                            : "border-line bg-neutral-50 text-ink/70 hover:border-ink/50"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Notice Title</label>
                  <input
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Schedule Change Notice"
                    className="field !py-1.5 !text-xs"
                    required={notifyMembers}
                  />
                </div>

                <div>
                  <label className="label">
                    Schedule Change Message (sent to{" "}
                    {activeSelectedMembers.length} selected{" "}
                    {activeSelectedMembers.length === 1 ? "member" : "members"})
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Hey ${
                      selectedGroup === "ALL" ? "team" : selectedGroup
                    }, we updated the class schedule for this week. Check the updated times on your portal!`}
                    className="field !text-xs"
                    required={notifyMembers}
                  />
                </div>

                {activeSelectedMembers.length > 0 && (
                  <div className="bg-neutral-50 border border-line/70 p-2.5 text-[11px] font-mono text-ink/70">
                    <span className="uppercase text-ink/40 block text-[10px] mb-1">
                      Notifying ({activeSelectedMembers.length}):
                    </span>
                    {activeSelectedMembers.map((m) => m.name).join(", ")}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <SaveButton
                notifyMembers={notifyMembers}
                selectedCount={activeSelectedMembers.length}
              />

              {notifyMembers && phoneList && (
                <a
                  href={smsLink}
                  className="border border-line bg-neutral-50 px-4 py-2 text-center font-mono text-xs uppercase tracking-wider text-ink/70 hover:border-ink hover:text-ink transition-colors"
                >
                  📱 Also Open Group Text in Messages App (
                  {activeSelectedMembers.length})
                </a>
              )}
            </div>
          </form>

          {/* Recent Schedule Changes Log */}
          <div className="border border-line bg-white p-5 shadow-sm space-y-3">
            <p className="font-display uppercase text-lg border-b border-line pb-2">
              Recent Schedule Notices
            </p>
            {recentChanges.length === 0 ? (
              <p className="text-xs text-ink/50">
                No schedule change alerts logged yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-line/60">
                {recentChanges.map((b) => (
                  <div key={b.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink">{b.title}</span>
                      <span className="font-mono text-[10px] text-ink/40">
                        {new Date(b.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-ink/70">{b.message}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px] text-ink/50">
                      <span className="bg-neutral-100 px-1.5 py-0.5 rounded font-semibold">
                        {b.targetGroup === "ALL" ? "All Groups" : b.targetGroup}
                      </span>
                      <span>·</span>
                      <span>{b.recipientCount} members notified</span>
                      {b.recipientNames && b.recipientNames.length > 0 && (
                        <span className="truncate max-w-[220px]" title={b.recipientNames.join(", ")}>
                          ({b.recipientNames.join(", ")})
                        </span>
                      )}
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
