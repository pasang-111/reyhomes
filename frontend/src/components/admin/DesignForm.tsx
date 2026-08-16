"use client";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TextInput, TextArea, Select, Checkbox, Section, MultiSelectChips } from "./FormFields";
import { ApiError, api } from "@/lib/api/client";
import type { InclusionItem, RelatedItem, LinkedInclusionItem, RelatedDesignItem } from "@/types/home";

type InclusionOption = { id: number; title: string };
type RelatedDesignOption = { id: number; title: string };

const CATEGORIES = [
  { value: "Single Storey", label: "Single Storey" },
  { value: "Double Storey", label: "Double Storey" },
  { value: "Dual Occupancy", label: "Dual Occupancy" },
  { value: "Knockdown Rebuild", label: "Knockdown Rebuild" },
];

function slugify(t: string) {
  return t.toLowerCase().replace(/^the\s+/i, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type Init = {
  id?: number; slug?: string; title?: string; name?: string; subtitle?: string;
  category?: string; status?: string; state?: string; suburb?: string;
  price?: string; price_value?: number | null; beds?: number; baths?: number | string;
  garage?: number; living?: number; study?: number; houseSize?: string; house_size?: string;
  frontage?: string; depth?: string; description?: string;
  // Detail endpoint now returns real linked records (id + title) once a design
  // has FK-based inclusions/related designs; may still be plain strings for
  // designs not yet migrated off the deprecated inclusion_list/related_slugs.
  inclusions?: InclusionItem[];
  related?: RelatedItem[];
  featured?: boolean; published?: boolean;
};

export default function DesignForm({ initial, mode }: { initial?: Init | null; mode: "create" | "edit" }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
  const [category, setCategory] = useState(initial?.category || "Single Storey");
  const [status, setStatus] = useState(initial?.status || "");
  const [price, setPrice] = useState(initial?.price || "");
  const [priceValue, setPriceValue] = useState(initial?.price_value != null ? String(initial.price_value) : "");
  const [beds, setBeds] = useState(String(initial?.beds ?? 4));
  const [baths, setBaths] = useState(String(initial?.baths ?? 2));
  const [garage, setGarage] = useState(String(initial?.garage ?? 2));
  const [houseSize, setHouseSize] = useState(initial?.houseSize || initial?.house_size || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [inclusionIds, setInclusionIds] = useState<number[]>(
    (initial?.inclusions || []).filter((i): i is LinkedInclusionItem => typeof i === "object").map((i) => i.id)
  );
  const [relatedIds, setRelatedIds] = useState<number[]>(
    (initial?.related || []).filter((r): r is RelatedDesignItem => typeof r === "object").map((r) => r.id)
  );
  const [inclusionOptions, setInclusionOptions] = useState<InclusionOption[]>([]);
  const [inclusionsLoading, setInclusionsLoading] = useState(true);
  const [inclusionsError, setInclusionsError] = useState<string | null>(null);
  const [designOptions, setDesignOptions] = useState<RelatedDesignOption[]>([]);
  const [designsLoading, setDesignsLoading] = useState(true);
  const [designsError, setDesignsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<{ results?: InclusionOption[] } | InclusionOption[]>("/inclusions/");
        if (!cancelled) setInclusionOptions(Array.isArray(data) ? data : data.results || []);
      } catch {
        if (!cancelled) setInclusionsError("Couldn't load inclusions. Retry later.");
      } finally {
        if (!cancelled) setInclusionsLoading(false);
      }
    })();
    (async () => {
      try {
        const data = await api.get<{ results?: RelatedDesignOption[] } | RelatedDesignOption[]>("/designs/");
        const list = Array.isArray(data) ? data : data.results || [];
        if (!cancelled) setDesignOptions(list.filter((d) => d.id !== initial?.id));
      } catch {
        if (!cancelled) setDesignsError("Couldn't load home designs. Retry later.");
      } finally {
        if (!cancelled) setDesignsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [initial?.id]);

  const [featured, setFeatured] = useState(!!initial?.featured);
  const [published, setPublished] = useState(initial?.published !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !price.trim()) { setError("Title and price are required."); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        subtitle: subtitle.trim(),
        category, status: status.trim(),
        price: price.trim(),
        price_value: priceValue ? Number(priceValue) : null,
        bedrooms: Number(beds) || 0,
        bathrooms: Number(baths) || 0,
        garage: Number(garage) || 0,
        house_size: houseSize.trim(),
        description: description.trim(),
        inclusion_ids: inclusionIds,
        related_design_ids: relatedIds,
        featured, published,
      };
      if (mode === "create") {
        const created = await api.post<{ slug: string }>("/designs/", payload, { auth: true });
        router.push(`/admin/home-designs/${created.slug}`);
      } else if (initial?.slug) {
        await api.patch(`/designs/${initial.slug}/`, payload, { auth: true });
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed. Staff login required.");
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Section title="Basic">
        <TextInput label="Title" value={title} onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} required />
        <TextInput label="Slug" value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }} hint="Auto from title" />
        <TextInput label="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES} />
        <TextInput label="Status badge" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Popular" />
        <TextInput label="Display price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$435,000" required />
        <TextInput label="Numeric price" type="number" value={priceValue} onChange={(e) => setPriceValue(e.target.value)} />
        <TextInput label="Bedrooms" type="number" value={beds} onChange={(e) => setBeds(e.target.value)} />
        <TextInput label="Bathrooms" type="number" step="0.5" value={baths} onChange={(e) => setBaths(e.target.value)} />
        <TextInput label="Garage" type="number" value={garage} onChange={(e) => setGarage(e.target.value)} />
        <TextInput label="House size" value={houseSize} onChange={(e) => setHouseSize(e.target.value)} />
      </Section>
      <Section title="Content">
        <div className="sm:col-span-2"><TextArea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="sm:col-span-2">
          <MultiSelectChips
            label="Inclusions"
            hint="Pick real inclusion records — replaces the old free-text list"
            options={inclusionOptions.map((o) => ({ id: o.id, label: o.title }))}
            selected={inclusionIds}
            onChange={setInclusionIds}
            loading={inclusionsLoading}
            error={inclusionsError}
          />
        </div>
        <div className="sm:col-span-2">
          <MultiSelectChips
            label="Related designs"
            hint={`Shown as "You may also like" on this design's page`}
            options={designOptions.map((o) => ({ id: o.id, label: o.title }))}
            selected={relatedIds}
            onChange={setRelatedIds}
            loading={designsLoading}
            error={designsError}
          />
        </div>
      </Section>
      <Section title="Publishing">
        <Checkbox label="Featured" checked={featured} onChange={setFeatured} />
        <Checkbox label="Published" checked={published} onChange={setPublished} />
      </Section>
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      <button type="submit" disabled={saving} className="rounded-lg bg-[#8C1D2C] px-6 py-2.5 text-sm text-white disabled:opacity-50">
        {saving ? "Saving…" : mode === "create" ? "Create design" : "Save changes"}
      </button>
    </form>
  );
}
