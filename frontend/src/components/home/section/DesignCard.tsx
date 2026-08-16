"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BedDouble, Bath, Car, ArrowRight } from "lucide-react";
import WishlistButton from "@/components/auth/WishlistButton";
import { luxeEase } from "@/components/common/motion";

type Props = {
  id?: number;
  name: string;
  slug: string;
  beds: number;
  baths: number;
  garage: number;
  image: string;
  price?: string;
};

export default function DesignCard({
  id,
  name,
  slug,
  beds,
  baths,
  garage,
  image,
  price = "From $495,000",
}: Props) {
  const router = useRouter();

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: luxeEase }}
      className="group relative overflow-hidden rounded-[28px] border border-[#0A1628]/08 bg-[#F5F0E6] shadow-[0_20px_50px_rgba(10,22,40,0.07)] transition-shadow duration-500 hover:border-[#0A1628]/18 hover:shadow-[0_32px_80px_rgba(10,22,40,0.14)]"
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#D8C7A4] via-[#0A1628] to-[#D8C7A4] transition-transform duration-500 ease-out group-hover:scale-x-100" />

      {/* Image */}
      <div className="relative h-[380px] overflow-hidden sm:h-[420px]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/85 via-[#0A1628]/25 to-transparent" />

        {/* Badge */}
        <div className="absolute left-5 top-5 rounded-full bg-[#0A1628] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D8C7A4]">
          New
        </div>

        <div className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
          <WishlistButton
            size="sm"
            entry={{
              kind: "design",
              id: id ?? 0,
              slug,
              name,
              image: image || "",
              price: price || "",
            }}
          />
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-7 left-6 right-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D8C7A4]/90">
            Modern Collection
          </p>
          <h3 className="mt-1.5 font-display text-3xl font-light leading-tight text-white sm:text-4xl">
            {name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 p-6 sm:p-7">
        {/* Specs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: BedDouble, value: beds, label: "Beds" },
            { icon: Bath, value: baths, label: "Baths" },
            { icon: Car, value: garage, label: "Garage" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#0A1628]/08 bg-white/60 py-3.5 text-center transition group-hover:border-[#D8C7A4]/40"
            >
              <item.icon size={18} className="mx-auto text-[#806D48]" />
              <p className="mt-1.5 text-lg font-semibold text-[#0A1628]">{item.value}</p>
              <span className="text-[10px] uppercase tracking-wider text-[#0A1628]/45">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#0A1628]/12 to-transparent" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#0A1628]/45">
              Starting From
            </p>
            <p className="mt-1 font-display text-2xl text-[#0A1628] sm:text-3xl">
              {price}
            </p>
          </div>

          <button
            onClick={() => router.push(`/home-designs/${slug}`)}
            className="group/btn relative flex items-center gap-2.5 overflow-hidden rounded-full bg-[#0A1628] px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#F5F0E6] transition hover:bg-[#0A1628]/90"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            <span className="relative">View</span>
            <ArrowRight
              size={16}
              className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </motion.article>
  );
}