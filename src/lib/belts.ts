export const BELT_ORDER = [
  "WHITE",
  "GREY",
  "YELLOW",
  "ORANGE",
  "GREEN",
  "BLUE",
  "PURPLE",
  "BROWN",
  "BLACK",
] as const;

export const ADULT_BELT_ORDER = ["WHITE", "BLUE", "PURPLE", "BROWN", "BLACK"] as const;
export const YOUTH_BELT_ORDER = ["WHITE", "GREY", "YELLOW", "ORANGE", "GREEN"] as const;

export type Belt = (typeof BELT_ORDER)[number];

export const BELT_COLORS: Record<string, string> = {
  WHITE: "#FAFAF7",
  GREY: "#9CA3AF",
  YELLOW: "#FACC15",
  ORANGE: "#F97316",
  GREEN: "#16A34A",
  BLUE: "#2E5EAA",
  PURPLE: "#6B4FA0",
  BROWN: "#7A4A2B",
  BLACK: "#17130F",
};

export const BELT_LABELS: Record<string, string> = {
  WHITE: "White belt",
  GREY: "Grey belt (Youth)",
  YELLOW: "Yellow belt (Youth)",
  ORANGE: "Orange belt (Youth)",
  GREEN: "Green belt (Youth)",
  BLUE: "Blue belt",
  PURPLE: "Purple belt",
  BROWN: "Brown belt",
  BLACK: "Black belt",
};

export function isYouthBelt(belt: string): boolean {
  return ["GREY", "YELLOW", "ORANGE", "GREEN"].includes(belt);
}

export function nextBelt(belt: string, isYouth = false): Belt | null {
  if (isYouth || isYouthBelt(belt)) {
    const order = [...YOUTH_BELT_ORDER, "BLUE"] as const;
    const i = order.indexOf(belt as (typeof order)[number]);
    return i >= 0 && i < order.length - 1 ? (order[i + 1] as Belt) : null;
  }
  const i = ADULT_BELT_ORDER.indexOf(belt as (typeof ADULT_BELT_ORDER)[number]);
  return i >= 0 && i < ADULT_BELT_ORDER.length - 1 ? ADULT_BELT_ORDER[i + 1] : null;
}

export function calculateAge(dob?: string, referenceDate: Date = new Date()): number | null {
  if (!dob) return null;
  const parts = dob.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [year, month, day] = parts;
  let age = referenceDate.getFullYear() - year;
  const m = referenceDate.getMonth() + 1 - month;
  if (m < 0 || (m === 0 && referenceDate.getDate() < day)) {
    age--;
  }
  return age >= 0 ? age : null;
}

export function suggestGroupFromAge(age: number | null): "Kids (5-6)" | "Juniors (7-12)" | "Adults (13+)" {
  if (age === null) return "Adults (13+)";
  if (age <= 6) return "Kids (5-6)";
  if (age <= 12) return "Juniors (7-12)";
  return "Adults (13+)";
}

export type BirthdayPromotionInfo = {
  age: number;
  turningAge: number;
  nextBirthdayIso: string;
  nextBirthdayFormatted: string;
  daysUntilBirthday: number;
  isUnder18: boolean;
  suggestedGroup: "Kids (5-6)" | "Juniors (7-12)" | "Adults (13+)";
  groupMoveAlert: string | null;
  promotionMilestone: string | null;
};

export function getBirthdayPromotionInfo(
  dob?: string,
  currentGroup?: string,
  currentBelt?: string,
  referenceDate: Date = new Date()
): BirthdayPromotionInfo | null {
  if (!dob) return null;
  const parts = dob.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [birthYear, birthMonth, birthDay] = parts;

  const age = calculateAge(dob, referenceDate);
  if (age === null) return null;

  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  let nextBday = new Date(today.getFullYear(), birthMonth - 1, birthDay);
  if (nextBday < today) {
    nextBday = new Date(today.getFullYear() + 1, birthMonth - 1, birthDay);
  }

  const diffMs = nextBday.getTime() - today.getTime();
  const daysUntilBirthday = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const turningAge = nextBday.getFullYear() - birthYear;
  const isUnder18 = age < 18;
  const suggestedGroup = suggestGroupFromAge(age);

  let groupMoveAlert: string | null = null;
  if (currentGroup && currentGroup !== suggestedGroup) {
    if (currentGroup === "Kids (5-6)" && age >= 7) {
      groupMoveAlert = `Age ${age}: Ready to move up from Kids (5-6) to ${suggestedGroup}`;
    } else if (currentGroup === "Juniors (7-12)" && age >= 13) {
      groupMoveAlert = `Age ${age}: Ready to move up from Juniors (7-12) to Adults (13+)`;
    }
  } else if (daysUntilBirthday <= 45) {
    if (turningAge === 7 && currentGroup === "Kids (5-6)") {
      groupMoveAlert = `Turning 7 in ${daysUntilBirthday}d: Ready to move up to Juniors (7-12)`;
    } else if (turningAge === 13 && currentGroup === "Juniors (7-12)") {
      groupMoveAlert = `Turning 13 in ${daysUntilBirthday}d: Ready to move up to Adults (13+)`;
    }
  }

  let promotionMilestone: string | null = null;
  if (age >= 16 && currentBelt && isYouthBelt(currentBelt)) {
    promotionMilestone = `Age ${age} with Youth Belt: Eligible for Adult Blue Belt promotion`;
  } else if (daysUntilBirthday <= 60) {
    if (turningAge === 7) {
      promotionMilestone = "Turning 7: Juniors group & Grey/Yellow belt track";
    } else if (turningAge === 10) {
      promotionMilestone = "Turning 10: Eligible for Youth Yellow/Orange belt rank";
    } else if (turningAge === 13) {
      promotionMilestone = "Turning 13: Adults (13+) class & Green belt eligibility";
    } else if (turningAge === 16) {
      promotionMilestone = "Turning 16: Eligible for Adult Blue Belt promotion!";
    } else if (turningAge === 18) {
      promotionMilestone = "Turning 18: Adult account & Brown/Black belt age track";
    }
  }

  const nextBirthdayFormatted = nextBday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return {
    age,
    turningAge,
    nextBirthdayIso: nextBday.toISOString().slice(0, 10),
    nextBirthdayFormatted,
    daysUntilBirthday,
    isUnder18,
    suggestedGroup,
    groupMoveAlert,
    promotionMilestone,
  };
}

