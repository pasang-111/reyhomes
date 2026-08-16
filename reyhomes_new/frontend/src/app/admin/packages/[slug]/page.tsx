"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PackageForm from "@/components/admin/PackageForm";
import { api, ApiError } from "@/lib/api/client";
import type { HomeLandPackage } from "@/types/land";

export default function EditPackagePage() {
  const params = useParams();
  const slug = String(params?.slug || "");
  const [pkg, setPkg] = useState<HomeLandPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    // Staff auth so unpublished packages still load in admin
    api
      .get<HomeLandPackage>(`/packages/${encodeURIComponent(slug)}/`, {
        auth: true,
      })
      .then(setPkg)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Package not found."
        );
        setPkg(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-white/40">Loading…</div>;
  if (error || !pkg)
    return <div className="text-white/50">{error || "Package not found."}</div>;

  return (
    <div>
      <h1 className="mb-8 text-3xl font-light">Edit: {pkg.title}</h1>
      <PackageForm mode="edit" initial={pkg as any} />
    </div>
  );
}
