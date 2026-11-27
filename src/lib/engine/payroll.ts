import { progressive, round2 } from "./money";
import { INCOME_TAX, SOCIAL, scheduleOn, type Sector } from "./rates";

export interface PayrollInput {
  /** Hesablanmış aylıq əmək haqqı (gross), AZN. */
  gross: number;
  sector: Sector;
  /** Any date in the payroll month, ISO yyyy-mm-dd. */
  date: string;
}

export interface PayrollResult {
  gross: number;
  incomeTax: number;
  incomeTaxRef: string;
  dsmfEmployee: number;
  medicalEmployee: number;
  unemploymentEmployee: number;
  totalDeductions: number;
  net: number;
  dsmfEmployer: number;
  medicalEmployer: number;
  unemploymentEmployer: number;
  employerCost: number;
  /** Everything paid to the state budget and funds, employee and employer side. */
  toBudget: number;
  socialRatesVerified: boolean;
}

/** Monthly payroll for one employee. Income tax exemptions (VM 102) are not applied yet. */
export function calcPayroll({ gross, sector, date }: PayrollInput): PayrollResult {
  if (!(gross >= 0)) throw new Error("gross must be a non-negative number");
  const sched = scheduleOn(INCOME_TAX[sector], date);
  const s = SOCIAL[sector];

  const incomeTax = round2(progressive(gross, sched.bands));
  const dsmfEmployee = round2(progressive(gross, s.dsmfEmployee));
  const medicalEmployee = round2(progressive(gross, s.medicalEmployee));
  const unemploymentEmployee = round2(progressive(gross, s.unemploymentEmployee));
  const totalDeductions = round2(incomeTax + dsmfEmployee + medicalEmployee + unemploymentEmployee);

  const dsmfEmployer = round2(progressive(gross, s.dsmfEmployer));
  const medicalEmployer = round2(progressive(gross, s.medicalEmployer));
  const unemploymentEmployer = round2(progressive(gross, s.unemploymentEmployer));
  const employerSide = dsmfEmployer + medicalEmployer + unemploymentEmployer;

  return {
    gross,
    incomeTax,
    incomeTaxRef: sched.ref,
    dsmfEmployee,
    medicalEmployee,
    unemploymentEmployee,
    totalDeductions,
    net: round2(gross - totalDeductions),
    dsmfEmployer,
    medicalEmployer,
    unemploymentEmployer,
    employerCost: round2(gross + employerSide),
    toBudget: round2(totalDeductions + employerSide),
    socialRatesVerified: s.verified,
  };
}
