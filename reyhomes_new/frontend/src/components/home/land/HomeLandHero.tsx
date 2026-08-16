"use client";

import Image from "next/image";
import {
  Heart,
  ArrowRight,
  BedDouble,
  Bath,
  CarFront,
  MapPin,
} from "lucide-react";
import { HomeLandPackage } from "@/types/land";

type Props = {
  land: HomeLandPackage;
};

export default function HomeLandHero({ land }: Props) {
  // Ensure src is always a string
  const heroSrc =
    land.heroImage ||
    (land as any).hero_image_url ||
    "/placeholder-hero.jpg";

  return (
    <section className="relative h-[92dvh] min-h-[560px] sm:min-h-[680px] md:min-h-[760px] overflow-hidden">
      {/* Background */}
      <Image
        src={heroSrc}
        alt={land.title}
        fill
        priority
        className="object-cover"
      />

      {/* Luxury Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 sm:px-6 pt-24 sm:pt-28 lg:pt-0 pb-10 sm:pb-16 md:pb-24">
        <div className="max-w-3xl w-full">
          {/* Badge */}
          {land.badge && (
            <span className="rounded-full border border-[#8C1D2C]/30 bg-[#8C1D2C]/10 px-3.5 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.45em] text-[#3D5A80]">
              {land.badge}
            </span>
          )}

          {/* Title */}
          <h1 className="mt-4 sm:mt-6 md:mt-8 font-display text-[clamp(2rem,6vw+0.5rem,4.5rem)] leading-[1.05] text-white">
            {land.title}
          </h1>

          {/* Estate */}
          <div className="mt-3 sm:mt-4 md:mt-6 flex items-center gap-2 sm:gap-3 text-white/80">
            <MapPin
              size={16}
              className="text-[#8C1D2C] shrink-0 sm:w-[18px] sm:h-[18px]"
            />
            <span className="uppercase tracking-[0.15em] sm:tracking-[0.25em] text-xs sm:text-sm truncate">
              {land.suburb}, {land.state}
            </span>
          </div>

          {/* Description */}
          <p className="mt-3 sm:mt-5 md:mt-8 max-w-2xl text-sm sm:text-base md:text-lg leading-6 sm:leading-7 md:leading-8 text-white/75 line-clamp-2 sm:line-clamp-3 md:line-clamp-none">
            {land.description}
          </p>

          {/* Specs */}
          <div className="mt-5 sm:mt-8 md:mt-12 grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-4 md:gap-5">
            <SpecCard
              icon={<BedDouble size={18} className="sm:w-[22px] sm:h-[22px]" />}
              title="Bedrooms"
              value={land.beds ?? "—"}
            />
            <SpecCard
              icon={<Bath size={18} className="sm:w-[22px] sm:h-[22px]" />}
              title="Bathrooms"
              value={land.baths ?? "—"}
            />
            <SpecCard
              icon={<CarFront size={18} className="sm:w-[22px] sm:h-[22px]" />}
              title="Garage"
              value={land.garage ?? "—"}
            />
            <SpecCard
              icon={<MapPin size={18} className="sm:w-[22px] sm:h-[22px]" />}
              title="Land"
              value={land.landSize ?? "—"}
            />
          </div>

          {/* Bottom */}
          <div className="mt-6 sm:mt-10 md:mt-14 flex flex-wrap items-center gap-3 sm:gap-5">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.35em] text-white/40">
                Package From
              </p>
              <h2 className="mt-1 sm:mt-2 font-display text-2xl sm:text-3xl md:text-5xl text-[#3D5A80]">
                {land.price}
              </h2>
            </div>

            <button className="sm:ml-4 flex items-center gap-2 sm:gap-3 rounded-full bg-[#8C1D2C] px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base font-medium text-black transition duration-300 hover:scale-105">
              Enquire Now
              <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            <button
              aria-label="Save"
              className="flex h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-[#D8C7A4]/35 bg-[#D8C7A4]/10 text-[#D8C7A4] transition hover:border-[#D8C7A4] hover:bg-[#D8C7A4]/20"
            >
              <Heart
                size={18}
                className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]"
                color="#D8C7A4"
                strokeWidth={1.8}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-3.5 sm:px-5 md:px-6 py-2.5 sm:py-3.5 md:py-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-[#8C1D2C] shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 truncate">
            {title}
          </p>
          <p className="text-sm sm:text-lg md:text-xl font-semibold text-white truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}