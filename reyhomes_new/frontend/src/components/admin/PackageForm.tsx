"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TextInput,
  TextArea,
  Select,
  Checkbox,
  Section,
  MultiSelectChips,
} from "./FormFields";
import { ApiError, api } from "@/lib/api/client";
import type { InclusionItem, LinkedInclusionItem } from "@/types/home";

type InclusionOption = { id: number; title: string };
type EstateOption = { id: number; name: string };

const CATEGORIES = [
  { value: "House & Land", label: "House & Land" },
  { value: "Display Home", label: "Display Home" },
  { value: "Land Only", label: "Land Only" },
];

function slugify(t: string) {
  return t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Init = {
  id?: number;
  slug?: string;
  title?: string;
  estate?: number | null;
  estate_name?: string;
  category?: string;
  state?: string;
  suburb?: string;
  price?: string;
  price_value?: number | null;
  beds?: number;
  baths?: number | string;
  garage?: number;
  landSize?: string;
  land_size?: string;
  houseSize?: string;
  house_size?: string;
  frontage?: string;
  depth?: string;
  description?: string;
  badge?: string;
  inclusions?: InclusionItem[];
  featured?: boolean;
  published?: boolean;
};

export default function PackageForm({
  initial,
  mode,
}: {
  initial?: Init | null;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [category, setCategory] = useState(initial?.category || "House & Land");
  const [state, setState] = useState(initial?.state || "NSW");
  const [suburb, setSuburb] = useState(initial?.suburb || "");
  const [price, setPrice] = useState(initial?.price || "");
  const [priceValue, setPriceValue] = useState(
    initial?.price_value != null ? String(initial.price_value) : ""
  );
  const [beds, setBeds] = useState(String(initial?.beds ?? 4));
  const [baths, setBaths] = useState(String(initial?.baths ?? 2));
  const [garage, setGarage] = useState(String(initial?.garage ?? 2));
  const [landSize, setLandSize] = useState(
    initial?.landSize || initial?.land_size || ""
  );
  const [houseSize, setHouseSize] = useState(
    initial?.houseSize || initial?.house_size || ""
  );
  const [frontage, setFrontage] = useState(initial?.frontage || "");
  const [depth, setDepth] = useState(initial?.depth || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [badge, setBadge] = useState(initial?.badge || "");
  const [estateId, setEstateId] = useState<number | "">(
    initial?.estate ?? ""
  );
  const [featured, setFeatured] = useState(!!initial?.featured);
  const [published, setPublished] = useState(initial?.published !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inclusionIds, setInclusionIds] = useState<number[]>(
    (initial?.inclusions || [])
      .filter((i): i is LinkedInclusionItem => typeof i === "object")
      .map((i) => i.id)
  );
  const [inclusionOptions, setInclusionOptions] = useState<InclusionOption[]>(
    []
  );
  const [inclusionsLoading, setInclusionsLoading] = useState(true);
  const [inclusionsError, setInclusionsError] = useState<string | null>(null);
  const [estates, setEstates] = useState<EstateOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<
          { results?: InclusionOption[] } | InclusionOption[]
        >("/inclusions/", { auth: true });
        const list = Array.isArray(data) ? data : data.results ?? [];
        if (!cancelled) setInclusionOptions(list);
      } catch {
        if (!cancelled)
          setInclusionsError("Couldn't load inclusions. Retry later.");
      } finally {
        if (!cancelled) setInclusionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<
          { results?: EstateOption[] } | EstateOption[]
        >("/estates/", { auth: true });
        const list = Array.isArray(data) ? data : data.results ?? [];
        if (!cancelled)
          setEstates(
            list.map((e: any) => ({
              id: e.id,
              name: e.name || e.title || `Estate #${e.id}`,
            }))
          );
      } catch {
        /* estates optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !price.trim()) {
      setError("Title and price are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        category,
        state: state.trim(),
        suburb: suburb.trim(),
        price: price.trim(),
        price_value: priceValue ? Number(priceValue) : null,
        bedrooms: Number(beds) || 0,
        bathrooms: Number(baths) || 0,
        garage: Number(garage) || 0,
        land_size: landSize.trim(),
        house_size: houseSize.trim(),
        frontage: frontage.trim(),
        depth: depth.trim(),
        description: description.trim(),
        badge: badge.trim(),
        estate: estateId === "" ? null : Number(estateId),
        inclusion_ids: inclusionIds,
        featured,
        published,
      };
      if (mode === "create") {
        const created = await api.post<{ slug: string }>(
          "/packages/",
          payload,
          { auth: true }
        );
        router.push(`/admin/packages/${created.slug}`);
      } else if (initial?.slug) {
        await api.patch(`/packages/${initial.slug}/`, payload, { auth: true });
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Save failed. Staff login required."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Section title="Basic">
        <TextInput
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          required
        />
        <TextInput
          label="Slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
          }}
          hint="Auto from title"
        />
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORIES}
        />
        <TextInput
          label="Badge"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          placeholder="e.g. New Release"
        />
        <TextInput
          label="Display price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="$649,000"
          required
        />
        <TextInput
          label="Numeric price"
          type="number"
          value={priceValue}
          onChange={(e) => setPriceValue(e.target.value)}
        />
      </Section>

      <Section title="Location & estate">
        <TextInput
          label="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
        <TextInput
          label="Suburb"
          value={suburb}
          onChange={(e) => setSuburb(e.target.value)}
        />
        <Select
          label="Estate"
          value={estateId === "" ? "" : String(estateId)}
          onChange={(e) =>
            setEstateId(e.target.value ? Number(e.target.value) : "")
          }
          options={[
            { value: "", label: "— None —" },
            ...estates.map((e) => ({
              value: String(e.id),
              label: e.name,
            })),
          ]}
        />
      </Section>

      <Section title="Specs">
        <TextInput
          label="Bedrooms"
          type="number"
          value={beds}
          onChange={(e) => setBeds(e.target.value)}
        />
        <TextInput
          label="Bathrooms"
          type="number"
          step="0.5"
          value={baths}
          onChange={(e) => setBaths(e.target.value)}
        />
        <TextInput
          label="Garage"
          type="number"
          value={garage}
          onChange={(e) => setGarage(e.target.value)}
        />
        <TextInput
          label="Land size"
          value={landSize}
          onChange={(e) => setLandSize(e.target.value)}
        />
        <TextInput
          label="House size"
          value={houseSize}
          onChange={(e) => setHouseSize(e.target.value)}
        />
        <TextInput
          label="Frontage"
          value={frontage}
          onChange={(e) => setFrontage(e.target.value)}
        />
        <TextInput
          label="Depth"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
        />
      </Section>

      <Section title="Content">
        <div className="sm:col-span-2">
          <TextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <MultiSelectChips
            label="Inclusions"
            hint="Pick real inclusion records from the library — not free text"
            options={inclusionOptions.map((o) => ({
              id: o.id,
              label: o.title,
            }))}
            selected={inclusionIds}
            onChange={setInclusionIds}
            loading={inclusionsLoading}
            error={inclusionsError}
          />
        </div>
      </Section>

      <Section title="Visibility">
        <Checkbox
          label="Featured on homepage"
          checked={featured}
          onChange={setFeatured}
        />
        <Checkbox
          label="Published (visible on site)"
          checked={published}
          onChange={setPublished}
        />
      </Section>

      {error ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#8C1D2C] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : mode === "create" ? "Create package" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/packages")}
          className="rounded-lg border border-white/15 px-6 py-2.5 text-sm text-white/70"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
