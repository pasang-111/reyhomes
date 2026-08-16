"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DesignForm from "@/components/admin/DesignForm";
import { api, ApiError } from "@/lib/api/client";
import type { HomeDesign } from "@/types/home";

export default function EditDesignPage() {
  const params = useParams();
  const slug = String(params?.id || "");
  const [design, setDesign] = useState<HomeDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    api
      .get<HomeDesign>(`/designs/${encodeURIComponent(slug)}/`, { auth: true })
      .then(setDesign)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Design not found.");
        setDesign(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-white/40">Loading…</div>;
  if (error || !design)
    return <div className="text-white/50">{error || "Design not found."}</div>;

  return (
    <div>
      <h1 className="mb-8 text-3xl font-light">Edit: {design.name || design.title}</h1>
      <DesignForm mode="edit" initial={design as any} />
    </div>
  );
}
