import { round2 } from "./money";

/** Average calendar days per month used for leave pay (Əmək Məcəlləsi 140.3). */
export const DAYS_PER_MONTH = 30.4;

/** Extra leave days for length of service (ƏM 116.1). */
export function seniorityLeaveDays(years: number): number {
  if (years > 15) return 6;
  if (years >= 10) return 4;
  if (years >= 5) return 2;
  return 0;
}

export interface VacationInput {
  /** Sum of earnings for the months considered (normally the last 12 calendar months). */
  earnings: number;
  /** Full calendar months worked in that period, 1–12 (ƏM 140.2). */
  months: number;
  /** Basic leave: 21 or 30 days (ƏM 114). */
  baseDays: number;
  seniorityYears: number;
  otherDays?: number;
}

export interface VacationResult {
  avgMonthly: number;
  daily: number;
  seniorityDays: number;
  days: number;
  pay: number;
}

export function calcVacationPay(i: VacationInput): VacationResult {
  const months = Math.min(Math.max(Math.floor(i.months), 1), 12);
  const avgMonthly = i.earnings / months;
  const daily = avgMonthly / DAYS_PER_MONTH;
  const seniorityDays = seniorityLeaveDays(i.seniorityYears);
  const days = i.baseDays + seniorityDays + (i.otherDays ?? 0);
  return {
    avgMonthly: round2(avgMonthly),
    daily: round2(daily),
    seniorityDays,
    days,
    pay: round2(daily * days),
  };
}

export type TerminationReason = "redundancy" | "employee";

export interface SeveranceInput {
  avgMonthly: number;
  /** Years of service with this employer. */
  years: number;
  reason: TerminationReason;
  /** Pay money instead of the notice period, with the employee's consent (ƏM 77.4). */
  payInLieuOfNotice: boolean;
  unusedLeaveDays: number;
}

export interface SeveranceResult {
  noticeWeeks: number;
  severanceMultiplier: number;
  severance: number;
  inLieuMultiplier: number;
  inLieu: number;
  leaveCompensation: number;
  total: number;
}

const TIERS = [
  { maxYears: 1, weeks: 2, sev: 1, inLieu: 0.5 },
  { maxYears: 5, weeks: 4, sev: 1.4, inLieu: 0.9 },
  { maxYears: 10, weeks: 6, sev: 1.7, inLieu: 1.4 },
  { maxYears: Infinity, weeks: 9, sev: 2, inLieu: 2 },
];

/** Final settlement on termination (ƏM 77, 144). */
export function calcSeverance(i: SeveranceInput): SeveranceResult {
  const tier = TIERS.find((t) => i.years < t.maxYears)!;
  const redundancy = i.reason === "redundancy";
  const severance = redundancy ? i.avgMonthly * tier.sev : 0;
  const inLieu = redundancy && i.payInLieuOfNotice ? i.avgMonthly * tier.inLieu : 0;
  const leaveCompensation = (i.unusedLeaveDays * i.avgMonthly) / DAYS_PER_MONTH;
  return {
    noticeWeeks: tier.weeks,
    severanceMultiplier: tier.sev,
    severance: round2(severance),
    inLieuMultiplier: tier.inLieu,
    inLieu: round2(inLieu),
    leaveCompensation: round2(leaveCompensation),
    total: round2(severance + inLieu + leaveCompensation),
  };
}
