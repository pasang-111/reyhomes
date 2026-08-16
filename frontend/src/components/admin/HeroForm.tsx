"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TextInput, TextArea, Checkbox, Section } from "./FormFields";
import { createHeroSlide, updateHeroSlide, deleteHeroSlide } from "@/lib/api/hero";
import type { HeroSlide } from "@/lib/api/hero";
import { ApiError } from "@/lib/api/client";

type Props = { initial?: Partial<HeroSlide> | null; mode: "create" | "edit" };

export default function HeroForm({ initial, mode }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [buttonText, setButtonText] = useState(initial?.button_text || "Explore");
  const [buttonLink, setButtonLink] = useState(initial?.button_link || "/home-designs");
  const [order, setOrder] = useState(String(initial?.order ?? 0));
  const [active, setActive] = useState(initial?.active !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        button_text: buttonText.trim(),
        button_link: buttonLink.trim(),
        order: Number(order) || 0,
        active,
      };
      if (mode === "create") {
        const created = await createHeroSlide(payload);
        router.push(`/admin/hero/${created.id}`);
      } else if (initial?.id) {
        await updateHeroSlide(initial.id, payload);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed. Please log in as staff and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initial?.id || !confirm("Delete this hero slide?")) return;
    setSaving(true);
    try {
      await deleteHeroSlide(initial.id);
      router.push("/admin/hero");
    } catch {
      setError("Delete failed.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Section title="Hero content">
        <TextInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <TextInput label="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        <div className="sm:col-span-2">
          <TextArea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <TextInput label="Button text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
        <TextInput
          label="Button link"
          value={buttonLink}
          onChange={(e) => setButtonLink(e.target.value)}
          placeholder="/home-designs"
        />
        <TextInput
          label="Order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          hint="Lower numbers appear first."
        />
      </Section>
      <Section title="Publishing">
        <Checkbox label="Active (show on homepage)" checked={active} onChange={setActive} />
        <p className="text-xs text-white/40 sm:col-span-2">
          Video & poster: upload in Django admin → Hero Slides (Media section). Use a compressed
          MP4 under ~10 MB and always set a poster so the homepage shows content immediately.
        </p>
      </Section>
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#8C1D2C] px-6 py-2.5 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : mode === "create" ? "Create slide" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-500/40 px-6 py-2.5 text-sm text-red-300"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
