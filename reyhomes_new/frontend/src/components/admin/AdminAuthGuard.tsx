"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getAdminToken,
  staffMe,
  staffLogout,
  type StaffUser,
} from "@/lib/api/staffAuth";

/**
 * Protects /admin/* except /admin/login.
 * Keeps previous content visible while revalidating so navigation never blanks.
 */
export default function AdminAuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  // Optimistic: if a token already exists, start as ready so we don't flash blank
  const [ready, setReady] = useState(() => {
    if (typeof window === "undefined") return false;
    if (pathname === "/admin/login") return true;
    return Boolean(getAdminToken());
  });
  const [user, setUser] = useState<StaffUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (isLoginPage) {
        if (getAdminToken()) {
          const me = await staffMe();
          if (!cancelled && me) {
            router.replace("/admin");
            return;
          }
        }
        if (!cancelled) setReady(true);
        return;
      }

      const token = getAdminToken();
      if (!token) {
        if (!cancelled) {
          setReady(false);
          router.replace("/admin/login");
        }
        return;
      }

      // Token present → keep showing content while we confirm staff
      if (!cancelled) setReady(true);

      const me = await staffMe();
      if (cancelled) return;
      if (!me || !me.is_staff) {
        await staffLogout();
        setReady(false);
        router.replace("/admin/login");
        return;
      }
      setUser(me);
      setReady(true);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0d10] text-white/50">
        Checking access…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0d10] text-white">
      <header className="border-b border-white/10 bg-black/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <a href="/admin" className="text-sm font-medium tracking-wide">
              ReyHomes <span className="text-white/40">Admin</span>
            </a>
            <nav className="hidden gap-1 md:flex">
              {[
                ["/admin", "Dashboard"],
                ["/admin/hero", "Hero"],
                ["/admin/home-designs", "Designs"],
                ["/admin/home-land", "Packages"],
                ["/admin/inclusions", "Inclusions"],
                ["/admin/testimonials", "Testimonials"],
                ["/admin/inclusions", "Inclusions"],
                ["/admin/clients", "Clients & Pro"],
                ["/admin/settings", "Settings"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    pathname === href || (href !== "/admin" && pathname.startsWith(href))
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/50">
            {user && <span>{user.username}</span>}
            <button
              type="button"
              className="rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/5"
              onClick={async () => {
                await staffLogout();
                router.replace("/admin/login");
              }}
            >
              Log out
            </button>
            <a href="/" className="hover:text-white">
              View site
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
