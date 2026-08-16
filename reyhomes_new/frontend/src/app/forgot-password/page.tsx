"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";

import AuthShell from "@/components/auth/AuthShell";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { BRAND_FONT, COLOR, EASE, EMAIL_RE, ErrorBanner, FloatingField } from "@/components/auth/AuthUI";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailValid = EMAIL_RE.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // NOTE: wire this to your backend's password-reset endpoint.
      // authApi.requestPasswordReset doesn't exist yet in the client shown —
      // add it there once the endpoint is live. For now this fails soft
      // and still shows the confirmation screen, since revealing whether
      // an email exists is itself a security leak.
      if (typeof (authApi as any).requestPasswordReset === "function") {
        await (authApi as any).requestPasswordReset(email);
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Reset Password"
      title="Forgot your password?"
      subtitle="Enter the email on your account and we'll send you a link to reset it."
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-6 text-center">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
              <CheckCircle2 size={36} style={{ color: COLOR.tide }} />
            </motion.div>
            <p className="mt-4 text-lg font-light" style={{ color: COLOR.cream, fontFamily: BRAND_FONT }}>
              Check your inbox
            </p>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed" style={{ color: COLOR.creamFaint }}>
              If an account exists for <span style={{ color: COLOR.brass }}>{email}</span>, a reset link is on its way.
            </p>
            <Link href="/login" className="mt-6 flex items-center gap-1.5 text-[12px]" style={{ color: COLOR.brass }}>
              <ArrowLeft size={13} />
              Back to sign in
            </Link>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} noValidate className="space-y-4">
            <FloatingField id="email" label="Email address" icon={<Mail size={16} />} type="email" value={email} onChange={setEmail} autoComplete="email" valid={emailValid} />

            <ErrorBanner message={error} />

            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-4 text-[13px] font-semibold uppercase tracking-[1.5px] text-[#0A1628] transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #F5F0E6, #E8D9B8, #D8C7A4)", boxShadow: "0 12px 32px -10px rgba(216,199,164,0.45)" }}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">{submitting ? "Sending…" : "Send reset link"}</span>
              {!submitting && <ArrowRight size={15} className="relative" />}
            </button>

            <p className="text-center text-sm" style={{ color: COLOR.creamFaint }}>
              <Link href="/login" style={{ color: COLOR.brass }}>Back to sign in</Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}