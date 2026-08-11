export const BELT_ORDER = ["WHITE", "BLUE", "PURPLE", "BROWN", "BLACK"] as const;
export type Belt = (typeof BELT_ORDER)[number];

export const BELT_COLORS: Record<string, string> = {
  WHITE: "#FAFAF7",
  BLUE: "#2E5EAA",
  PURPLE: "#6B4FA0",
  BROWN: "#7A4A2B",
  BLACK: "#17130F",
};

export const BELT_LABELS: Record<string, string> = {
  WHITE: "White belt",
  BLUE: "Blue belt",
  PURPLE: "Purple belt",
  BROWN: "Brown belt",
  BLACK: "Black belt",
};

export function nextBelt(belt: string): Belt | null {
  const i = BELT_ORDER.indexOf(belt as Belt);
  return i >= 0 && i < BELT_ORDER.length - 1 ? BELT_ORDER[i + 1] : null;
}
