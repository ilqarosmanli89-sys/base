import { notFound } from "next/navigation";
import { Head } from "@/components/Head";
import { Live } from "@/components/Live";
import { EmployeeForm } from "@/components/EmployeeForm";
import { getEmployee } from "@/lib/data/queries";
import { bakuToday } from "@/lib/today";

export default function Page({ params }: PageProps<"/hr/[id]">) {
  return (
    <Live render={async () => {
      const e = getEmployee(Number((await params).id));
      if (!e) notFound();
      return (
        <>
          <Head title={e.full_name} sub={`${e.position}${e.department ? ", " + e.department : ""}`} />
          <EmployeeForm e={e} today={bakuToday()} />
        </>
      );
    }} />
  );
}
