import { Head } from "@/components/Head";
import { Live } from "@/components/Live";
import { EmployeeForm } from "@/components/EmployeeForm";
import { bakuToday } from "@/lib/today";

export const metadata = { title: "İşə qəbul · Mühasibat" };

export default function Page() {
  return (
    <>
      <Head title="İşə qəbul" sub="Yeni işçinin məlumatları." />
      <Live render={() => <EmployeeForm today={bakuToday()} />} />
    </>
  );
}
