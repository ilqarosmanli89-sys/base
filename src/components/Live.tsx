import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";

async function Inner({ render }: { render: () => Promise<ReactNode> | ReactNode }) {
  await connection();
  return <>{await render()}</>;
}

/** Renders database-backed content on every request. */
export function Live({ render }: { render: () => Promise<ReactNode> | ReactNode }) {
  return (
    <Suspense fallback={<p className="cap">Yüklənir…</p>}>
      <Inner render={render} />
    </Suspense>
  );
}
