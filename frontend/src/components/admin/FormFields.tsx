"use client";
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#8C1D2C]/60 focus:outline-none focus:ring-1 focus:ring-[#8C1D2C]/40";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-white/30">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const { label, hint, className, ...rest } = props;
  return (
    <Field label={label} hint={hint}>
      <input className={`${inputClass} ${className || ""}`} {...rest} />
    </Field>
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  const { label, hint, className, ...rest } = props;
  return (
    <Field label={label} hint={hint}>
      <textarea className={`${inputClass} min-h-[120px] ${className || ""}`} {...rest} />
    </Field>
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; options: { value: string; label: string }[] }) {
  const { label, hint, options, className, ...rest } = props;
  return (
    <Field label={label} hint={hint}>
      <select className={`${inputClass} ${className || ""}`} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

export function MultiSelectChips({
  label, hint, options, selected, onChange, loading, error,
}: {
  label: string;
  hint?: string;
  options: { id: number; label: string }[];
  selected: number[];
  onChange: (ids: number[]) => void;
  loading?: boolean;
  error?: string | null;
}) {
  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }
  return (
    <Field label={label} hint={hint}>
      {loading && <p className="text-sm text-white/40">Loading…</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {!loading && !error && options.length === 0 && (
        <p className="text-sm text-white/40">None available yet.</p>
      )}
      {!loading && !error && options.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const active = selected.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggle(o.id)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  active
                    ? "border-[#8C1D2C] bg-[#8C1D2C]/20 text-white"
                    : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </Field>
  );
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#8C1D2C]" />
      <span className="text-sm text-white/80">{label}</span>
    </label>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="mb-5 text-sm font-medium uppercase tracking-[3px] text-white/40">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}
