import Link from "next/link";
import type { ReactNode } from "react";

export function Head({ title, sub, action, href }: { title: string; sub?: ReactNode; action?: string; href?: string }) {
  return (
    <div className="head">
      <div>
        <h1>{title}</h1>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {action && href && <Link className="btn" href={href}>{action}</Link>}
    </div>
  );
}
