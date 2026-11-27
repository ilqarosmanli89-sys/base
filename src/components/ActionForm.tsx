"use client";

import { startTransition, useActionState, type ReactNode } from "react";
import type { FormState } from "@/lib/data/actions";

/** Form bound to a server action that returns `{ error }` on validation failure. */
export function ActionForm({ action, children, submit = "Yadda saxla", cancel }: {
  action: (s: FormState, f: FormData) => Promise<FormState>;
  children: ReactNode;
  submit?: string;
  cancel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    // Submitting through onSubmit (not the `action` prop) keeps what the user typed when the server returns an error,
    // since React resets forms bound with `action` after every submission.
    <form onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); startTransition(() => formAction(data)); }}>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      {children}
      <div className="actions">
        <button className="btn" disabled={pending}>{pending ? "Saxlanılır…" : submit}</button>
        {cancel && <a className="btn ghost" href={cancel}>Ləğv et</a>}
      </div>
    </form>
  );
}
