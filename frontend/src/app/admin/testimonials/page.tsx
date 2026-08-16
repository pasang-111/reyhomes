"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminTestimonials, type Testimonial } from "@/lib/api/testimonials";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminTestimonials()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light">Testimonials</h1>
          <p className="mt-1 text-sm text-white/50">
            {loading ? "…" : `${items.length} reviews`}
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="rounded-lg bg-[#8C1D2C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#a02436]"
        >
          + Add testimonial
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Suburb</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                  No testimonials yet.
                </td>
              </tr>
            )}
            {items.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-white/60">{t.suburb || "—"}</td>
                <td className="px-4 py-3">{"★".repeat(t.rating || 0)}</td>
                <td className="px-4 py-3">{t.featured ? "Yes" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/testimonials/${t.id}`}
                    className="text-[#8C1D2C] hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
