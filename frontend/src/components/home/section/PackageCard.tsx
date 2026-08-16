"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  BedDouble,
  Bath,
  CarFront,
  Ruler,
  ArrowRight,
} from "lucide-react";

import WishlistButton from "@/components/auth/WishlistButton";
import { luxeEase } from "@/components/common/motion";

type Props = {
  id?: number;
  slug: string;
  title: string;

  suburb?: string | null;
  state?: string | null;

  image?: string | null;

  badge?: string | null;
  price: string;

  landSize?: string | number | null;
  houseSize?: string | number | null;

  beds: number | string;
  baths: number | string;
  garage: number | string;
};

export default function PackageCard({
  id,
  slug,
  title,
  suburb,
  state,
  image,
  badge,
  price,
  landSize,
  houseSize,
  beds,
  baths,
  garage,
}: Props) {
  const safeSuburb = suburb ?? "—";
  const safeState = state ?? "—";

  const safeImage =
    image ??
    "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1200"
          height="800"
          viewBox="0 0 1200 800"
        >
          <rect width="1200" height="800" fill="#0A1628"/>
          <text
            x="600"
            y="400"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#D8C7A4"
            font-family="Arial, sans-serif"
            font-size="42"
          >
            REY HOMES
          </text>
        </svg>
      `);

  const safeLandSize =
    landSize === null ||
    landSize === undefined ||
    landSize === ""
      ? "—"
      : landSize;

  const safeBeds =
    beds === null ||
    beds === undefined ||
    beds === ""
      ? "—"
      : beds;

  const safeBaths =
    baths === null ||
    baths === undefined ||
    baths === ""
      ? "—"
      : baths;

  const safeGarage =
    garage === null ||
    garage === undefined ||
    garage === ""
      ? "—"
      : garage;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{
        duration: 0.4,
        ease: luxeEase,
      }}
      className="group relative overflow-hidden rounded-[28px] border border-[#0A1628]/08 bg-white shadow-[0_20px_50px_rgba(10,22,40,0.07)] transition-shadow duration-500 hover:border-[#0A1628]/18 hover:shadow-[0_32px_80px_rgba(10,22,40,0.14)]"
    >
      {/* =====================================================
          TOP ACCENT
      ====================================================== */}

      <div className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#D8C7A4] via-[#0A1628] to-[#D8C7A4] transition-transform duration-500 ease-out group-hover:scale-x-100" />

      {/* =====================================================
          IMAGE
      ====================================================== */}

      <div className="relative h-[280px] overflow-hidden sm:h-[300px]">
        <Image
          src={safeImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/75 via-[#0A1628]/15 to-transparent" />

        {/* Wishlist */}

        <div className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
          <WishlistButton
            size="sm"
            entry={{
              kind: "land",
              id: id ?? 0,
              slug,
              name: title || slug,
              image: image || "",
              price: price || "",
            }}
          />
        </div>

        {/* Badge */}

        {badge && (
          <span className="absolute left-5 top-5 rounded-full bg-[#0A1628] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D8C7A4]">
            {badge}
          </span>
        )}
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="p-6 sm:p-7">
        {/* ===================================================
            TITLE + LOCATION + PRICE
        ==================================================== */}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-display text-xl text-[#0A1628] sm:text-2xl">
              {title}
            </h3>

            <div className="mt-2 flex items-center gap-1.5 text-[#0A1628]/55">
              <MapPin
                size={14}
                className="shrink-0 text-[#806D48]"
              />

              <span className="truncate text-sm">
                {safeSuburb}, {safeState}
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#0A1628]/40">
              From
            </p>

            <p className="mt-0.5 text-xl font-semibold text-[#0A1628] sm:text-2xl">
              {price}
            </p>
          </div>
        </div>

        {/* ===================================================
            SPECS GRID
        ==================================================== */}

        <div className="mt-6 grid grid-cols-4 gap-2 rounded-2xl border border-[#0A1628]/08 bg-[#F5F0E6]/70 p-4 transition group-hover:border-[#D8C7A4]/35">
          {/* Beds */}

          <div className="text-center">
            <BedDouble
              className="mx-auto text-[#806D48]"
              size={17}
            />

            <p className="mt-1.5 text-sm font-semibold text-[#0A1628]">
              {safeBeds}
            </p>

            <p className="text-[10px] text-[#0A1628]/45">
              Beds
            </p>
          </div>

          {/* Baths */}

          <div className="text-center">
            <Bath
              className="mx-auto text-[#806D48]"
              size={17}
            />

            <p className="mt-1.5 text-sm font-semibold text-[#0A1628]">
              {safeBaths}
            </p>

            <p className="text-[10px] text-[#0A1628]/45">
              Baths
            </p>
          </div>

          {/* Garage */}

          <div className="text-center">
            <CarFront
              className="mx-auto text-[#806D48]"
              size={17}
            />

            <p className="mt-1.5 text-sm font-semibold text-[#0A1628]">
              {safeGarage}
            </p>

            <p className="text-[10px] text-[#0A1628]/45">
              Garage
            </p>
          </div>

          {/* Land */}

          <div className="text-center">
            <Ruler
              className="mx-auto text-[#806D48]"
              size={17}
            />

            <p className="mt-1.5 text-sm font-semibold text-[#0A1628]">
              {safeLandSize}
            </p>

            <p className="text-[10px] text-[#0A1628]/45">
              Land
            </p>
          </div>
        </div>

        {/* ===================================================
            HOUSE SIZE
        ==================================================== */}

        {houseSize !== null &&
          houseSize !== undefined &&
          houseSize !== "" && (
            <div className="mt-5 flex items-center justify-between border-b border-[#0A1628]/08 pb-5 text-sm">
              <span className="text-[#0A1628]/50">
                House Size
              </span>

              <span className="font-medium text-[#0A1628]">
                {houseSize}
              </span>
            </div>
          )}

        {/* ===================================================
            CTA
        ==================================================== */}

        <div className="mt-5">
          <Link
            href={`/home-land/${slug}`}
            className="group/btn relative flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#0A1628] py-3.5 text-sm font-medium text-[#F5F0E6] transition hover:bg-[#0A1628]/90"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />

            <span className="relative">
              Explore Package
            </span>

            <ArrowRight
              size={16}
              className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}