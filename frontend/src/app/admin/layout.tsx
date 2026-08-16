import type { ReactNode } from "react";

/** Staff gateway only — full CMS is Django Admin on the API host. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
