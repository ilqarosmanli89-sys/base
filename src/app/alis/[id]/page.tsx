import { DocView } from "@/components/docPages";

export default function Page({ params }: PageProps<"/alis/[id]">) {
  return <DocView kind="purchase" params={params} />;
}
