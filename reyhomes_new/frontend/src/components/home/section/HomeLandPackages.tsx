"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  BedDouble,
  Bath,
  CarFront,
  Ruler,
} from "lucide-react";

import PackageCard from "./PackageCard";
import {
  Reveal,
  FloatGlow,
  luxeEase,
} from "@/components/common/motion";

import type { HomeLandPackage } from "@/types/land";

type Props = {
  packages: HomeLandPackage[];
};

export default function HomeLandPackages({
  packages,
}: Props) {
  const [activeCategory, setActiveCategory] =
    useState<string>("All");

  const categories = [
    "All",
    ...Array.from(
      new Set(
        packages
          .map((pkg) => pkg.category)
          .filter(Boolean)
      )
    ),
  ];

  const filteredPackages =
    activeCategory === "All"
      ? packages
      : packages.filter(
          (pkg) => pkg.category === activeCategory
        );

  return (
    <section className="relative overflow-hidden bg-[#F8F6F3] py-24 sm:py-28 md:py-32">
      {/* =====================================================
          BACKGROUND GLOWS
      ====================================================== */}

      <FloatGlow
        className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#8C1D2C]/[0.04] blur-[140px]"
        duration={18}
        x={30}
        y={20}
      />

      <FloatGlow
        className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#2C4870]/[0.05] blur-[140px]"
        duration={22}
        x={-24}
        y={-16}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <Reveal className="text-center">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#8C1D2C]/60" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8C1D2C]">
              Home & Land Packages
            </p>

            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#8C1D2C]/60" />
          </div>

          <h2 className="mx-auto max-w-4xl font-display text-4xl font-light leading-tight text-[#0A1628] sm:text-5xl md:text-6xl">
            Complete Living.
            <br />
            Beautifully Planned.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#0A1628]/60 sm:text-lg sm:leading-8">
            Discover carefully selected home and land packages
            designed to make premium family living simple,
            seamless and achievable.
          </p>
        </Reveal>

        {/* =====================================================
            CATEGORY FILTERS
        ====================================================== */}

        {categories.length > 1 && (
          <Reveal
            delay={0.1}
            className="mt-12 flex flex-wrap justify-center gap-3 sm:mt-14"
          >
            {categories.map((category) => {
              const isActive =
                activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setActiveCategory(category)
                  }
                  className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 sm:px-6 sm:py-3 ${
                    isActive
                      ? "bg-[#0A1628] text-white shadow-lg"
                      : "border border-[#0A1628]/10 bg-white text-[#0A1628]/60 hover:border-[#0A1628]/20 hover:text-[#0A1628]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </Reveal>
        )}

        {/* =====================================================
            PACKAGE GRID
        ====================================================== */}

        {filteredPackages.length > 0 ? (
          <div className="mt-14 grid gap-6 sm:mt-16 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{
                  opacity: 0,
                  y: 35,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.7,
                  delay: Math.min(index, 5) * 0.08,
                  ease: luxeEase,
                }}
                className="group relative"
              >
                {/* Hover shine */}
                <span className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100" />

                {/* Top accent */}
                <span className="pointer-events-none absolute inset-x-4 top-0 z-20 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-transparent via-[#0F1C2E] to-transparent transition-transform duration-500 ease-out group-hover:scale-x-100" />

                {/* =================================================
                    PACKAGE CARD

                    Backend-safe normalization:
                    suburb can be undefined, but PackageCard
                    requires a string.
                ================================================== */}

                <PackageCard
                  {...pkg}
                  suburb={pkg.suburb ?? "—"}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <Reveal className="mt-16">
            <div className="rounded-[28px] border border-[#0A1628]/10 bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-[#8C1D2C]">
                Coming Soon
              </p>

              <h3 className="mt-3 font-display text-2xl text-[#0A1628] sm:text-3xl">
                No packages available
              </h3>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#0A1628]/55 sm:text-base">
                We currently don't have any home and land
                packages available in this category.
              </p>
            </div>
          </Reveal>
        )}

        {/* =====================================================
            VIEW ALL
        ====================================================== */}

        {filteredPackages.length > 0 && (
          <Reveal
            delay={0.15}
            className="mt-14 flex justify-center sm:mt-16"
          >
            <Link
              href="/home-land-packages"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#0A1628] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:bg-[#16243A] hover:shadow-xl sm:px-8 sm:py-4"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              <span className="relative">
                View All Packages
              </span>

              <ArrowRight
                size={17}
                className="relative transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}