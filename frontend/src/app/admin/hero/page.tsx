"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminHeroSlides, type HeroSlide } from "@/lib/api/hero";

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminHeroSlides()
      .then(setSlides)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light">Hero slides</h1>
          <p className="mt-1 text-sm text-white/50">
            Homepage carousel — {loading ? "…" : `${slides.length} slides`}
          </p>
        </div>
        <Link
          href="/admin/hero/new"
          className="rounded-lg bg-[#8C1D2C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#a02436]"
        >
          + Add slide
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Media</th>
              <th className="px-4 py-3">Button</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/40">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && slides.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/40">
                  No hero slides yet. Add one, or upload video/poster in Django admin.
                </td>
              </tr>
            )}
            {slides.map((s) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3">{s.order}</td>
                <td className="px-4 py-3 font-medium">{s.title}</td>
                <td className="px-4 py-3 text-white/60">
                  {s.video_url ? "Video" : s.image_url ? "Image" : "—"}
                  {s.poster_url ? " + poster" : ""}
                </td>
                <td className="px-4 py-3 text-white/60">{s.button_text}</td>
                <td className="px-4 py-3">{s.active ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/hero/${s.id}`} className="text-[#8C1D2C] hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-white/30">
        Tip: Upload the hero video and poster image in Django admin (Hero Slides → Media).
        Keep the video under ~10 MB (H.264 MP4) and always set a poster so the homepage
        shows something instantly.
      </p>
    </div>
  );
}
