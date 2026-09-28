export const GROUPS = ["Adults", "Kids", "Competition Team"] as const;
export type MemberGroup = (typeof GROUPS)[number];

export type BroadcastRow = {
  id: string;
  targetGroup: string; // "ALL" | "Adults" | "Kids" | "Competition Team"
  channel: string; // "SMS" | "EMAIL" | "ALL"
  title: string;
  message: string;
  recipientCount: number;
  sentAt: string;
};
