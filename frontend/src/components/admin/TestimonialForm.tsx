"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { TextInput, TextArea, Checkbox, Section } from "./FormFields";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type Testimonial,
} from "@/lib/api/testimonials";
import { ApiError, API_BASE } from "@/lib/api/client";

type Props = { initial?: Partial<Testimonial> | null; mode: "create" | "edit" };

export default function TestimonialForm({ initial, mode }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name || "");
  const [role, setRole] = useState(initial?.role || "");
  const [suburb, setSuburb] = useState(initial?.suburb || "");
  const [design, setDesign] = useState(initial?.design || "");
  const [review, setReview] = useState(initial?.review || "");
  const [rating, setRating] = useState(String(initial?.rating ?? 5));
  const [videoUrl, setVideoUrl] = useState(initial?.video_url || "");
  const [featured, setFeatured] = useState(!!initial?.featured);
  const [published, setPublished] = useState(initial?.published !== false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    try {
      // Use FormData whenever files are present so multipart works
      const hasFiles = !!(photoFile || videoFile);
      if (hasFiles) {
        const fd = new FormData();
        fd.append("name", name.trim());
        fd.append("role", role.trim());
        fd.append("suburb", suburb.trim());
        fd.append("design", design.trim());
        fd.append("review", review.trim());
        fd.append("rating", String(Number(rating) || 5));
        fd.append("video_url", videoUrl.trim());
        fd.append("featured", featured ? "true" : "false");
        fd.append("published", published ? "true" : "false");
        if (photoFile) fd.append("photo", photoFile);
        if (videoFile) fd.append("video", videoFile);

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("rh_admin_token") || localStorage.getItem("sl_access_token")
            : null;
        const path =
          mode === "create"
            ? `${API_BASE}/api/testimonials/`
            : `${API_BASE}/api/testimonials/${initial?.id}/`;
        const res = await fetch(path, {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Token ${token}` } : {}),
          },
          body: fd,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new ApiError(
            (body as { detail?: string }).detail || `Upload failed (${res.status})`,
            res.status,
            body
          );
        }
        const data = await res.json();
        if (mode === "create") router.push(`/admin/testimonials/${data.id}`);
        else router.refresh();
      } else {
        const payload = {
          name: name.trim(),
          role: role.trim(),
          suburb: suburb.trim(),
          design: design.trim(),
          review: review.trim(),
          rating: Number(rating) || 5,
          video_url: videoUrl.trim(),
          featured,
          published,
        };
        if (mode === "create") {
          const created = await createTestimonial(payload);
          router.push(`/admin/testimonials/${created.id}`);
        } else if (initial?.id) {
          await updateTestimonial(initial.id, payload);
          router.refresh();
        }
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Save failed. Staff login required."
      );
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initial?.id || !confirm("Delete this testimonial?")) return;
    setSaving(true);
    try {
      await deleteTestimonial(initial.id);
      router.push("/admin/testimonials");
    } catch {
      setError("Delete failed.");
      setSaving(false);
    }
  }

  function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    setPhotoFile(e.target.files?.[0] || null);
  }
  function onVideoChange(e: ChangeEvent<HTMLInputElement>) {
    setVideoFile(e.target.files?.[0] || null);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Section title="Customer">
        <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextInput
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Homeowner, Suburb NSW"
        />
        <TextInput label="Suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} />
        <TextInput
          label="Design / package"
          value={design}
          onChange={(e) => setDesign(e.target.value)}
          placeholder="The Malaga"
        />
        <TextInput
          label="Rating (1–5)"
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        />
      </Section>

      <Section title="Review">
        <div className="sm:col-span-2">
          <TextArea label="Review text" value={review} onChange={(e) => setReview(e.target.value)} />
        </div>
      </Section>

      <Section title="Media">
        <div className="sm:col-span-2 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              Photo
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              className="w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-[#8C1D2C] file:px-4 file:py-2 file:text-sm file:text-white"
            />
            {initial?.photo_url && !photoFile && (
              <p className="mt-1 text-xs text-white/40">Current photo on file. Choose a new file to replace.</p>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              Upload video (MP4)
            </span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/*"
              onChange={onVideoChange}
              className="w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-[#8C1D2C] file:px-4 file:py-2 file:text-sm file:text-white"
            />
            {initial?.video_file_url && !videoFile && (
              <p className="mt-1 text-xs text-white/40">Current uploaded video on file. Choose a new file to replace.</p>
            )}
            <p className="mt-1 text-xs text-white/30">
              Prefer a short compressed MP4 (under ~20 MB). This plays on the homepage without YouTube.
            </p>
          </label>

          <TextInput
            label="Or YouTube / Vimeo URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            hint="Used only if no video file is uploaded."
          />
        </div>
      </Section>

      <Section title="Publishing">
        <Checkbox label="Featured" checked={featured} onChange={setFeatured} />
        <Checkbox label="Published" checked={published} onChange={setPublished} />
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
          {saving ? "Saving…" : mode === "create" ? "Create testimonial" : "Save changes"}
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
