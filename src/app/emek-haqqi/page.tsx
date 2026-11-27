import { PayrollCalculator } from "@/components/PayrollCalculator";

export const metadata = { title: "Əmək haqqı · Mühasibat və vergi" };

export default function Page() {
  return (
    <>
      <h1>Əmək haqqı</h1>
      <p className="sub">Aylıq əmək haqqından tutulan vergi və sosial ödənişlər, işəgötürənin xərci.</p>
      <PayrollCalculator />
    </>
  );
}
