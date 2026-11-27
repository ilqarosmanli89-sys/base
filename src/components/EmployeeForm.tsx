import { ActionForm } from "./ActionForm";
import { saveEmployee } from "@/lib/data/actions";
import type { Employee } from "@/lib/data/queries";

export function EmployeeForm({ e, today }: { e?: Employee; today: string }) {
  return (
    <ActionForm action={saveEmployee} cancel="/hr">
      {e && <input type="hidden" name="id" value={e.id} />}
      <div className="form2">
        <div className="f"><label htmlFor="full_name">Soyad, ad, ata adı</label><input id="full_name" name="full_name" required defaultValue={e?.full_name} /></div>
        <div className="f"><label htmlFor="fin">FİN</label><input id="fin" name="fin" maxLength={7} defaultValue={e?.fin ?? ""} /></div>
        <div className="f"><label htmlFor="position">Vəzifə</label><input id="position" name="position" required defaultValue={e?.position} /></div>
        <div className="f"><label htmlFor="department">Şöbə</label><input id="department" name="department" defaultValue={e?.department} /></div>
        <div className="f"><label htmlFor="hire_date">İşə qəbul tarixi</label><input id="hire_date" name="hire_date" type="date" required defaultValue={e?.hire_date ?? today} /></div>
        <div className="f"><label htmlFor="salary">Aylıq əmək haqqı (gross), AZN</label><input id="salary" name="salary" type="number" min={0} step="0.01" required defaultValue={e?.salary} /></div>
        {e && <>
          <div className="f"><label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={e.status}><option value="active">İşləyir</option><option value="left">İşdən çıxıb</option></select></div>
          <div className="f"><label htmlFor="leave_date">Çıxış tarixi</label><input id="leave_date" name="leave_date" type="date" defaultValue={e.leave_date ?? ""} /></div>
        </>}
      </div>
    </ActionForm>
  );
}
