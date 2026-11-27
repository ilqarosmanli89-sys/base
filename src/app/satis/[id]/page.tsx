import { DocView } from "@/components/docPages";

export default function Page({ params }: PageProps<"/satis/[id]">) {
  return <DocView kind="sale" params={params} />;
}
