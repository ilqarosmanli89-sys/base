import { notFound } from "next/navigation";
import { Head } from "@/components/Head";

const PLANNED: Record<string, { title: string; items: string[] }> = {
  "hesablar-plani": { title: "Hesablar planı", items: ["Milli Mühasibat Uçotu Standartlarına uyğun hesablar planı", "Hər sənəddən avtomatik müxabirləşmələr (debet/kredit)", "Baş kitab və dövriyyə-saldo cədvəli"] },
  "esas-vesaitler": { title: "Əsas vəsaitlər", items: ["Əsas vəsaitlərin uçotu və inventar kartları", "Amortizasiya: VM 114.3 normaları ilə", "Əmlak vergisinin hesablanması (VM 198.2, 201)"] },
  bank: { title: "Bank", items: ["Bank hesabları", "Ödəniş tapşırıqları və hesabdan çıxarışlar", "Müştəri və təchizatçı borclarının bağlanması"] },
  hesabatlar: { title: "Maliyyə hesabatları", items: ["Mənfəət və zərər hesabatı", "Balans", "Debitor və kreditor borclar", "Vergi bəyannamələrinin hazırlanması"] },
  tenzimlemeler: { title: "Tənzimləmələr", items: ["Şirkət məlumatları (ad, VÖEN, sektor, vergi rejimi)", "İstifadəçilər və giriş", "Rollar: direktor, mühasib, HR, anbardar"] },
};

export function generateStaticParams() {
  return Object.keys(PLANNED).map((slug) => ({ slug }));
}

export default async function Page({ params }: PageProps<"/tezlikle/[slug]">) {
  const p = PLANNED[(await params).slug];
  if (!p) notFound();
  return (
    <>
      <Head title={p.title} sub="Bu bölmə növbəti mərhələdə hazırlanacaq. Planlaşdırılan funksiyalar:" />
      <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
    </>
  );
}
