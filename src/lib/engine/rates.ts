import type { Band } from "./money";

/**
 * Employer sector, which selects the income tax schedule.
 * - "private": qeyri-neft qeyri-dövlət sektoru (Vergi Məcəlləsi 101.1-1)
 * - "state": dövlət və neft-qaz sektoru (Vergi Məcəlləsi 101.1)
 */
export type Sector = "private" | "state";

export interface Schedule {
  /** First day (inclusive) the schedule applies, ISO date. */
  from: string;
  bands: Band[];
  /** Legal reference shown to the user. */
  ref: string;
}

/** Monthly income tax on employment income (muzdlu işdən gəlir). */
export const INCOME_TAX: Record<Sector, Schedule[]> = {
  state: [
    {
      from: "2019-01-01",
      bands: [
        { from: 0, rate: 0.14 },
        { from: 2500, rate: 0.25 },
      ],
      ref: "VM 101.1",
    },
  ],
  private: [
    {
      from: "2026-01-01",
      bands: [
        { from: 0, rate: 0.03 },
        { from: 2500, rate: 0.1 },
        { from: 8000, rate: 0.14 },
      ],
      ref: "VM 101.1-1.1",
    },
    {
      from: "2027-01-01",
      bands: [
        { from: 0, rate: 0.05 },
        { from: 2500, rate: 0.1 },
        { from: 8000, rate: 0.14 },
      ],
      ref: "VM 101.1-1.2",
    },
    {
      from: "2028-01-01",
      bands: [
        { from: 0, rate: 0.07 },
        { from: 2500, rate: 0.1 },
        { from: 8000, rate: 0.14 },
      ],
      ref: "VM 101.1-1.3",
    },
  ],
};

/**
 * Social contributions. These are NOT in the Tax Code; they come from the laws on
 * social insurance, medical insurance and unemployment insurance.
 * UNVERIFIED defaults: confirm against the current official rates before production use.
 */
export interface SocialRates {
  dsmfEmployee: Band[];
  dsmfEmployer: Band[];
  medicalEmployee: Band[];
  medicalEmployer: Band[];
  unemploymentEmployee: Band[];
  unemploymentEmployer: Band[];
  verified: boolean;
}

const medical: Band[] = [
  { from: 0, rate: 0.02 },
  { from: 8000, rate: 0.005 },
];
const unemployment: Band[] = [{ from: 0, rate: 0.005 }];

export const SOCIAL: Record<Sector, SocialRates> = {
  private: {
    dsmfEmployee: [
      { from: 0, rate: 0.03 },
      { from: 200, rate: 0.1 },
    ],
    dsmfEmployer: [
      { from: 0, rate: 0.22 },
      { from: 200, rate: 0.15 },
    ],
    medicalEmployee: medical,
    medicalEmployer: medical,
    unemploymentEmployee: unemployment,
    unemploymentEmployer: unemployment,
    verified: false,
  },
  state: {
    dsmfEmployee: [{ from: 0, rate: 0.03 }],
    dsmfEmployer: [{ from: 0, rate: 0.22 }],
    medicalEmployee: medical,
    medicalEmployer: medical,
    unemploymentEmployee: unemployment,
    unemploymentEmployer: unemployment,
    verified: false,
  },
};

/** Picks the schedule in force on `date` (ISO yyyy-mm-dd). */
export function scheduleOn(schedules: Schedule[], date: string): Schedule {
  const found = [...schedules].reverse().find((s) => s.from <= date);
  if (!found) throw new Error(`No schedule in force on ${date}`);
  return found;
}
