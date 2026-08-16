"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Lightweight enter fade without remounting children via key={pathname}.
 * Remounting the whole tree was causing broken / flaky client routing.
 */
export default function Transition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(false);
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      className="min-h-[50vh] transition-opacity duration-300 ease-out"
      style={{ opacity: show ? 1 : 0.96 }}
    >
      {children}
    </div>
  );
}
