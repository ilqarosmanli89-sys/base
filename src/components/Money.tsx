import { formatAzn } from "@/lib/engine";

export function Money({ value }: { value: number }) {
  return <>{formatAzn(value)}&nbsp;₼</>;
}
