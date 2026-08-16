"use client";

import { Check } from "lucide-react";
import { HomeDesign, inclusionLabel } from "@/types/home";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/motion";
import ReviewTrigger from "@/components/review/ReviewTrigger";

type Props = { home: HomeDesign };

export default function HomeInclusions({ home }: Props) {
  const inclusions = home.inclusions || [];

  if (!inclusions.length) return null;

  return (
    <section className="bg-[#F5F0E6] py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">Inclusions</p>
          <h2 className="mt-4 font-display text-4xl text-[#0A1628] sm:text-5xl">What’s Included</h2>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2" stagger={0.06}>
          {inclusions.map((item, i) => (
            <RevealItem key={typeof item === "object" ? item.id : i}>
              <div className="flex items-start gap-4 rounded-2xl border border-[#0A1628]/08 bg-white/80 px-5 py-4 transition hover:border-[#D8C7A4]/50">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D8C7A4]/25">
                  <Check size={14} className="text-[#806D48]" strokeWidth={2.5} />
                </div>
                <span className="text-[#0A1628]/85">{inclusionLabel(item)}</span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
            {home.slug ? (
          <div className="mt-12 flex justify-center">
            <ReviewTrigger kind="design" slug={home.slug} variant="light" label="Review floor plan & inclusions" />
          </div>
        ) : null}
    </section>
  );
}