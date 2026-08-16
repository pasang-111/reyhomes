"use client";

import { useState } from "react";
import { Send, CheckCircle2, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitEnquiry } from "@/lib/api/enquiries";
import { Reveal, FloatGlow, luxeEase } from "@/components/common/motion";

const INTERESTS = [
  "Single Storey",
  "Double Storey",
  "Duplex",
  "Home & Land",
  "Knockdown Rebuild",
  "General Enquiry",
];

export default function EnquirePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    subject: "General Enquiry",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      await submitEnquiry({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
        source: "enquire-page",
      });
      setStatus("success");
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        subject: "General Enquiry",
        message: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#0C2A44] text-[#F5F0E6]">
      {/* Hero */}
      <section className="relative overflow-hidden pb-20 pt-40 lg:pb-28 lg:pt-48">
        <FloatGlow
          className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#D8C7A4]/10 blur-[140px]"
          duration={22}
        />
        <FloatGlow
          className="pointer-events-none absolute -left-32 bottom-0 h-[480px] w-[480px] rounded-full bg-[#1A4A6E]/25 blur-[130px]"
          duration={26}
          x={20}
          y={-15}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#D8C7A4]">
              Private Consultation
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Enquire
              <span className="mt-1 block italic text-[#D8C7A4]/90">With Us</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/55">
              Tell us about your vision, your block and the life you want to build.
              Our team will respond within one business day.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Content */}
      <section className="pb-28 lg:pb-36">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          {/* Contact info */}
          <Reveal className="space-y-10">
            {[
              { icon: Phone, label: "Phone", value: "1300 755 495", href: "tel:1300755495" },
              { icon: Mail, label: "Email", value: "hello@reyhomes.com.au", href: "mailto:hello@reyhomes.com.au" },
              { icon: MapPin, label: "Office", value: "3/39 Memorial Ave, Liverpool NSW 2170", href: "https://maps.google.com/?q=3/39+Memorial+Ave+Liverpool+NSW+2170" },
            ].map((item) => (
              <div key={item.label} className="group">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C7A4]/25 bg-[#D8C7A4]/10 text-[#D8C7A4]">
                    <item.icon size={16} />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                    {item.label}
                  </p>
                </div>
                <a
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="text-xl text-[#F5F0E6] transition hover:text-[#D8C7A4]"
                >
                  {item.value}
                </a>
              </div>
            ))}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D8C7A4]">
                Office Hours
              </p>
              <div className="mt-4 space-y-2 text-sm text-white/55">
                <div className="flex justify-between">
                  <span>Monday – Friday</span>
                  <span className="text-[#F5F0E6]">9:00am – 5:00pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="text-[#F5F0E6]">By appointment</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-white/40">Closed</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Form card */}
          <Reveal delay={0.1}>
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-10">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-16 text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D8C7A4]/15 text-[#D8C7A4]">
                      <CheckCircle2 size={32} />
                    </div>
                    <h2 className="mt-6 font-display text-3xl">Enquiry Sent</h2>
                    <p className="mt-3 max-w-sm text-white/55">
                      Thank you. A member of our team will be in touch shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus("idle")}
                      className="mt-8 text-sm text-[#D8C7A4] underline underline-offset-4 transition hover:text-[#F5F0E6]"
                    >
                      Send another enquiry
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="First name">
                        <input
                          required
                          name="first_name"
                          value={form.first_name}
                          onChange={handleChange}
                          className="field"
                          placeholder="Jane"
                        />
                      </Field>
                      <Field label="Last name">
                        <input
                          name="last_name"
                          value={form.last_name}
                          onChange={handleChange}
                          className="field"
                          placeholder="Smith"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Email">
                        <input
                          required
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className="field"
                          placeholder="jane@email.com"
                        />
                      </Field>
                      <Field label="Phone">
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className="field"
                          placeholder="04xx xxx xxx"
                        />
                      </Field>
                    </div>

                    <Field label="I’m interested in">
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="field"
                      >
                        {INTERESTS.map((i) => (
                          <option key={i} value={i} className="bg-[#0C2A44]">
                            {i}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Message">
                      <textarea
                        required
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        className="field !rounded-2xl resize-none"
                        placeholder="Tell us about your block, timeline, or questions…"
                      />
                    </Field>

                    {status === "error" && (
                      <p className="text-sm text-[#D8C7A4]">{errorMessage}</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#D8C7A4] px-8 py-4 text-sm font-semibold text-[#0C2A44] transition hover:bg-[#E8D9B8] disabled:opacity-60 sm:w-auto"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative">
                        {status === "loading" ? "Sending…" : "Submit Enquiry"}
                      </span>
                      {status !== "loading" && (
                        <ArrowRight size={16} className="relative transition group-hover:translate-x-0.5" />
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>

      <style jsx>{`
        :global(.field) {
          width: 100%;
          border-radius: 9999px;
          border: 1px solid rgba(248, 245, 240, 0.12);
          background: rgba(248, 245, 240, 0.04);
          padding: 0.9rem 1.3rem;
          color: #f5f0e6;
          outline: none;
          transition: border-color 0.25s ease, background 0.25s ease;
        }
        :global(.field:focus) {
          border-color: rgba(216, 199, 164, 0.55);
          background: rgba(248, 245, 240, 0.07);
        }
        :global(.field::placeholder) {
          color: rgba(248, 245, 240, 0.3);
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}