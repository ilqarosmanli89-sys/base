import { SeveranceCalculator } from "@/components/SeveranceCalculator";

export const metadata = { title: "İşdən çıxma · Mühasibat və vergi" };

export default function Page() {
  return (
    <>
      <h1>İşdən çıxma</h1>
      <p className="sub">Əmək müqaviləsinə xitam verilərkən ödənişlər.</p>
      <SeveranceCalculator />
    </>
  );
}
