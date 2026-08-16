"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api/client";
import { getAdminToken, staffMe, staffLogout, type StaffUser } from "@/lib/api/staffAuth";

/**
 * Frontend /admin is no longer a full CMS.
 * Employees manage content in Django Admin (Unfold).
 * Clients use ReyHomes Pro at /pro/home.
 */
export default function StaffGatewayPage() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const djangoAdmin = `${API_BASE.replace(/\/$/, "")}/admin/`;

  useEffect(() => {
    if (!getAdminToken()) return;
    staffMe().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07080a] px-4 text-[#F5F0E6]">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#D8C7A4]">
          Staff
        </p>
        <h1 className="mt-3 font-display text-3xl text-white">
          Content management
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/55">
          Website content (designs, packages, inclusions, hero, testimonials)
          is managed in the <strong className="text-white/80">Django Admin</strong>{" "}
          — designed for fast data entry with frontend page references.
        </p>
        <p className="mt-3 text-sm text-white/55">
          Clients use the{" "}
          <Link href="/pro/home" className="text-[#D8C7A4] hover:underline">
            ReyHomes Pro portal
          </Link>{" "}
          at <code className="text-white/70">/pro/home</code>.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href={djangoAdmin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[#D8C7A4] px-6 py-3 text-sm font-medium text-[#0A1628]"
          >
            Open Django Admin →
          </a>
          <Link
            href="/pro/home"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm text-white/70 hover:border-[#D8C7A4]/40"
          >
            Client Pro portal
          </Link>
          {user ? (
            <button
              type="button"
              onClick={() => staffLogout().then(() => setUser(null))}
              className="text-xs text-white/40 hover:text-white/70"
            >
              Sign out staff session ({user.username || user.email})
            </button>
          ) : (
            <Link href="/admin/login" className="text-center text-xs text-white/40 hover:text-white/70">
              Staff login (token for API tools)
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
