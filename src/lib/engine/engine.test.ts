import { describe, expect, it } from "vitest";
import { calcPayroll } from "./payroll";
import { calcSeverance, calcVacationPay, seniorityLeaveDays } from "./leave";
import { deadlines } from "./calendar";
import { formatAzn } from "./money";

describe("income tax (VM 101)", () => {
  const tax = (gross: number, sector: "private" | "state", date: string) =>
    calcPayroll({ gross, sector, date }).incomeTax;

  it("state sector: 14% up to 2500, then 350 + 25%", () => {
    expect(tax(2000, "state", "2026-05-01")).toBe(280);
    expect(tax(2500, "state", "2026-05-01")).toBe(350);
    expect(tax(3000, "state", "2026-05-01")).toBe(475);
  });

  it("private sector 2026 table: 3% / 75 + 10% / 625 + 14%", () => {
    expect(tax(2000, "private", "2026-05-01")).toBe(60);
    expect(tax(3200, "private", "2026-05-01")).toBe(145);
    expect(tax(8000, "private", "2026-05-01")).toBe(625);
    expect(tax(10000, "private", "2026-05-01")).toBe(905);
  });

  it("private sector switches table on 2027-01-01 and 2028-01-01", () => {
    expect(tax(8000, "private", "2026-12-31")).toBe(625);
    expect(tax(8000, "private", "2027-01-01")).toBe(675);
    expect(tax(8000, "private", "2028-01-01")).toBe(725);
    expect(calcPayroll({ gross: 1, sector: "private", date: "2027-06-01" }).incomeTaxRef).toBe("VM 101.1-1.2");
  });

  it("rejects dates before any schedule", () => {
    expect(() => tax(1000, "private", "2025-06-01")).toThrow();
  });
});

describe("payroll", () => {
  it("computes net and employer cost for 3200 AZN, private sector, 2026", () => {
    const r = calcPayroll({ gross: 3200, sector: "private", date: "2026-11-01" });
    expect(r.dsmfEmployee).toBe(306);
    expect(r.medicalEmployee).toBe(64);
    expect(r.unemploymentEmployee).toBe(16);
    expect(r.net).toBe(2669);
    expect(r.dsmfEmployer).toBe(494);
    expect(r.employerCost).toBe(3774);
    expect(r.toBudget).toBe(1105);
    expect(r.socialRatesVerified).toBe(false);
  });

  it("zero salary gives zero everything", () => {
    const r = calcPayroll({ gross: 0, sector: "state", date: "2026-01-01" });
    expect(r.net).toBe(0);
    expect(r.employerCost).toBe(0);
  });

  it("rejects negative salary", () => {
    expect(() => calcPayroll({ gross: -1, sector: "state", date: "2026-01-01" })).toThrow();
  });
});

describe("leave (ƏM 114, 116, 140)", () => {
  it("seniority days", () => {
    expect([4, 5, 9, 10, 15, 16].map(seniorityLeaveDays)).toEqual([0, 2, 2, 4, 4, 6]);
  });

  it("vacation pay = earnings / months / 30.4 × days", () => {
    const r = calcVacationPay({ earnings: 38400, months: 12, baseDays: 21, seniorityYears: 7 });
    expect(r.days).toBe(23);
    expect(r.pay).toBe(2421.05);
  });

  it("uses actual full months when under 12", () => {
    expect(calcVacationPay({ earnings: 6000, months: 3, baseDays: 21, seniorityYears: 0 }).avgMonthly).toBe(2000);
  });
});

describe("severance (ƏM 77, 144)", () => {
  it("redundancy after 3 years with unused leave", () => {
    const r = calcSeverance({ avgMonthly: 3200, years: 3, reason: "redundancy", payInLieuOfNotice: false, unusedLeaveDays: 10 });
    expect(r.noticeWeeks).toBe(4);
    expect(r.severance).toBe(4480);
    expect(r.leaveCompensation).toBe(1052.63);
    expect(r.total).toBe(5532.63);
  });

  it("tiers by years of service", () => {
    const mult = (years: number) =>
      calcSeverance({ avgMonthly: 1000, years, reason: "redundancy", payInLieuOfNotice: true, unusedLeaveDays: 0 });
    expect([0.5, 1, 5, 10].map((y) => mult(y).severanceMultiplier)).toEqual([1, 1.4, 1.7, 2]);
    expect(mult(12).inLieu).toBe(2000);
  });

  it("no severance when the employee resigns", () => {
    const r = calcSeverance({ avgMonthly: 1000, years: 8, reason: "employee", payInLieuOfNotice: true, unusedLeaveDays: 0 });
    expect(r.total).toBe(0);
  });
});

describe("tax calendar", () => {
  it("lists VAT-regime deadlines in order and only within 12 months", () => {
    const d = deadlines("2026-11-27", { regime: "vat", excise: false });
    expect(d[0].date).toBe("2026-12-20");
    expect(d.every((x) => x.date >= "2026-11-27" && x.date < "2027-11-27")).toBe(true);
    expect(d.some((x) => x.title.startsWith("ƏDV"))).toBe(true);
    expect(d.some((x) => x.title.startsWith("Sadələşdirilmiş"))).toBe(false);
    expect(d.find((x) => x.ref === "VM 149.2, 152")?.date).toBe("2027-03-31");
  });

  it("simplified regime has no VAT or profit tax deadlines", () => {
    const d = deadlines("2026-11-27", { regime: "simplified", excise: false });
    expect(d.some((x) => x.ref === "VM 177.2" || x.ref === "VM 151.1")).toBe(false);
    expect(d.filter((x) => x.ref === "VM 221.3").map((x) => x.date)).toEqual(["2027-01-20", "2027-04-20", "2027-07-20", "2027-10-20"]);
  });
});

describe("formatting", () => {
  it("groups thousands and uses a decimal comma", () => {
    expect(formatAzn(2669)).toBe("2 669,00");
    expect(formatAzn(-1234567.891)).toBe("−1 234 567,89");
  });
});
