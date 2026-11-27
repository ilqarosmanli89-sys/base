import { VacationCalculator } from "@/components/VacationCalculator";

export const metadata = { title: "Məzuniyyət haqqı · Mühasibat" };

export default function Page() {
  return (
    <>
      <h1>Məzuniyyət haqqı</h1>
      <p className="sub">Əmək Məcəlləsinin 140-cı maddəsinə görə hesablama.</p>
      <VacationCalculator />
    </>
  );
}
