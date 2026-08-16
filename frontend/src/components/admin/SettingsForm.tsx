"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TextInput, TextArea, Section } from "./FormFields";
import { updateSiteSettings } from "@/lib/api/settings";
import type { SiteSettings } from "@/lib/api/settings";
import { ApiError } from "@/lib/api/client";

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [company, setCompany] = useState(initial.company_name || "ReyHomes");
  const [phone, setPhone] = useState(initial.phone || "");
  const [email, setEmail] = useState(initial.email || "");
  const [address, setAddress] = useState(initial.address || "");
  const [instagram, setInstagram] = useState(initial.instagram || "");
  const [facebook, setFacebook] = useState(initial.facebook || "");
  const [youtube, setYoutube] = useState(initial.youtube || "");
  const [linkedin, setLinkedin] = useState(initial.linkedin || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await updateSiteSettings({
        company_name: company.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        instagram: instagram.trim(),
        facebook: facebook.trim(),
        youtube: youtube.trim(),
        linkedin: linkedin.trim(),
      });
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed. Staff login required.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Section title="Company">
        <TextInput label="Company name" value={company} onChange={(e) => setCompany(e.target.value)} />
        <TextInput label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="sm:col-span-2">
          <TextArea label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </Section>
      <Section title="Social links">
        <TextInput label="Instagram URL" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        <TextInput label="Facebook URL" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
        <TextInput label="YouTube URL" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
        <TextInput label="LinkedIn URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
      </Section>
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Settings saved.</div>}
      <button type="submit" disabled={saving} className="rounded-lg bg-[#8C1D2C] px-6 py-2.5 text-sm text-white disabled:opacity-50">
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
