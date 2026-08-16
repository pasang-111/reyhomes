"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import PackageCard from "@/components/home/section/PackageCard";
import type { HomeLandPackageListItem } from "@/types/land";
import { Reveal, FloatGlow, luxeEase } from "@/components/common/motion";

const PRICE_BRACKETS = [
  { label: "Any budget", min: 0, max: Infinity },
  { label: "Under $600k", min: 0, max: 600000 },
  { label: "$600k – $800k", min: 600000, max: 800000 },
  { label: "$800k – $1m", min: 800000, max: 1000000 },
  { label: "$1m+", min: 1000000, max: Infinity },
];

const priceValue = (v: string) => Number(String(v).replace(/[^0-9.]/g, "")) || 0;
const bathValue = (v: number | string) => Number(v) || 0;

export default function HomeLandClient({ packages }: { packages: HomeLandPackageListItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const estates = useMemo(
    () => ["All", ...Array.from(new Set(packages.map((p) => p.estate_name).filter(Boolean) as string[]))],
    [packages]
  );
  const suburbs = useMemo(
    () => Array.from(new Set(packages.map((p) => p.suburb).filter(Boolean) as string[])),
    [packages]
  );
  const beds = useMemo(() => [...new Set(packages.map((p) => p.beds))].sort((a, b) => a - b), [packages]);
  const baths = useMemo(
    () => [...new Set(packages.map((p) => bathValue(p.baths)))].filter(Boolean).sort((a, b) => a - b),
    [packages]
  );

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [estate, setEstate] = useState(searchParams.get("category") || "All");
  const [suburb, setSuburb] = useState(searchParams.get("suburb") || "");
  const [minBeds, setMinBeds] = useState(searchParams.get("bedrooms") || "");
  const [minBaths, setMinBaths] = useState(searchParams.get("baths") || "");
  const [price, setPrice] = useState(() => {
    const min = Number(searchParams.get("minPrice") || 0);
    const max = Number(searchParams.get("maxPrice") || Infinity);
    const idx = PRICE_BRACKETS.findIndex((b) => b.min === min && b.max === max);
    return idx >= 0 ? idx : 0;
  });
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");
  const [advanced, setAdvanced] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState(q);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 280);
    return () => clearTimeout(t);
  }, [q]);

  const filtered = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    const bracket = PRICE_BRACKETS[price];

    return packages
      .filter((p) => {
        if (
          term &&
          ![p.title, p.suburb, p.estate_name]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(term)
        )
          return false;
        if (estate !== "All" && p.estate_name !== estate) return false;
        if (suburb && p.suburb !== suburb) return false;
        if (minBeds && p.beds < Number(minBeds)) return false;
        if (minBaths && bathValue(p.baths) < Number(minBaths)) return false;
        const value = priceValue(p.price);
        return value >= bracket.min && value <= bracket.max;
      })
      .sort((a, b) => {
        if (sort === "price-low") return priceValue(a.price) - priceValue(b.price);
        if (sort === "price-high") return priceValue(b.price) - priceValue(a.price);
        if (sort === "beds") return b.beds - a.beds;
        if (sort === "name") return a.title.localeCompare(b.title);
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      });
  }, [packages, debouncedQ, estate, suburb, minBeds, minBaths, price, sort]);

  const activeFilters = [
    q,
    estate !== "All" ? estate : "",
    suburb,
    minBeds,
    minBaths,
    price !== 0 ? String(price) : "",
  ].filter(Boolean).length;

  const syncUrl = useCallback(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (estate !== "All") p.set("category", estate);
    if (suburb) p.set("suburb", suburb);
    if (minBeds) p.set("bedrooms", minBeds);
    if (minBaths) p.set("baths", minBaths);
    if (price !== 0) {
      p.set("minPrice", String(PRICE_BRACKETS[price].min));
      if (PRICE_BRACKETS[price].max !== Infinity) p.set("maxPrice", String(PRICE_BRACKETS[price].max));
    }
    if (sort !== "featured") p.set("sort", sort);
    const qs = p.toString();
    router.replace(qs ? `/home-land?${qs}` : "/home-land", { scroll: false });
  }, [q, estate, suburb, minBeds, minBaths, price, sort, router]);

  useEffect(() => {
    syncUrl();
  }, [estate, suburb, minBeds, minBaths, price, sort]); // eslint-disable-line

  const clear = () => {
    setQ("");
    setEstate("All");
    setSuburb("");
    setMinBeds("");
    setMinBaths("");
    setPrice(0);
    setSort("featured");
    router.replace("/home-land");
  };

  return (
    <main className="min-h-screen bg-[#0A1628] text-[#F5F0E6]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <FloatGlow
          className="pointer-events-none absolute -right-48 -top-48 h-[700px] w-[700px] rounded-full bg-[#D8C7A4]/12 blur-[140px]"
          duration={22}
          x={-40}
          y={30}
        />
        <FloatGlow
          className="pointer-events-none absolute -left-32 bottom-0 h-[480px] w-[480px] rounded-full bg-[#D8C7A4]/08 blur-[120px]"
          duration={26}
          x={25}
          y={-18}
        />

        <Reveal className="relative mx-auto max-w-7xl px-5 pb-20 pt-36 sm:px-8 lg:px-10 lg:pb-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#D8C7A4]">
            Curated Estates
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(3.1rem,7vw,6.6rem)] leading-[0.92] tracking-[-0.03em]">
            Home &amp; Land <span className="italic text-[#D8C7A4]/90">Packages.</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
            Pair a considered residence with a carefully selected address and create a complete vision for modern luxury living.
          </p>
        </Reveal>
      </section>

      {/* Sticky Filters */}
      <section className="sticky top-0 z-40 border-y border-white/10 bg-[#0A1628]/94 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex gap-3">
            <div className="relative min-w-0 flex-1">
              <Search size={17} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && syncUrl()}
                placeholder="Search estate, suburb or package…"
                className="h-12 w-full rounded-full border border-white/10 bg-white/[0.06] pl-12 pr-5 text-sm text-white outline-none transition focus:border-[#D8C7A4]/50"
              />
            </div>

            <button
              type="button"
              onClick={() => setAdvanced((v) => !v)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-0 text-sm font-medium transition sm:px-5 ${
                advanced ? "bg-[#D8C7A4] text-[#0A1628]" : "bg-white/[0.06] text-white"
              }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilters > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0A1628] px-1.5 text-[10px] font-bold text-[#D8C7A4]">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {advanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: luxeEase }}
                className="overflow-hidden"
              >
                <div className="grid gap-3 pt-5 sm:grid-cols-2 lg:grid-cols-5">
                  <Select label="Estate" value={estate} onChange={setEstate} options={estates} />
                  <Select label="Suburb" value={suburb} onChange={setSuburb} options={["", ...suburbs]} empty="Any suburb" />
                  <Select label="Bedrooms" value={minBeds} onChange={setMinBeds} options={["", ...beds.map(String)]} empty="Any" />
                  <Select label="Bathrooms" value={minBaths} onChange={setMinBaths} options={["", ...baths.map(String)]} empty="Any" />
                  <Select
                    label="Budget"
                    value={String(price)}
                    onChange={(v) => setPrice(Number(v))}
                    options={PRICE_BRACKETS.map((_, i) => String(i))}
                    labels={PRICE_BRACKETS.map((x) => x.label)}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <button
                    onClick={clear}
                    className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 transition hover:text-white"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={syncUrl}
                    className="rounded-full bg-[#D8C7A4] px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#0A1628]"
                  >
                    Apply filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {estates.map((item) => (
                <button
                  key={item}
                  onClick={() => setEstate(item)}
                  className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                    estate === item
                      ? "bg-[#F5F0E6] text-[#0A1628]"
                      : "bg-white/[0.06] text-white/45 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/70 outline-none"
            >
              <option className="bg-[#0A1628]" value="featured">Featured</option>
              <option className="bg-[#0A1628]" value="price-low">Price: low → high</option>
              <option className="bg-[#0A1628]" value="price-high">Price: high → low</option>
              <option className="bg-[#0A1628]" value="beds">Most bedrooms</option>
              <option className="bg-[#0A1628]" value="name">Name A–Z</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-12 flex items-end justify-between gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#D8C7A4]">
                {filtered.length} {filtered.length === 1 ? "package" : "packages"}
              </p>
              <h2 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">The right address.</h2>
            </div>
            {activeFilters > 0 && (
              <button
                onClick={clear}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/40 transition hover:text-white"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>

          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {filtered.length ? (
                <motion.div layout className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      layout
                      initial={{ opacity: 0, y: 32 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{
                        duration: 0.55,
                        delay: Math.min(index, 9) * 0.05,
                        ease: luxeEase,
                      }}
                    >
                      <PackageCard
                        id={pkg.id}
                        slug={pkg.slug}
                        title={pkg.title}
                        suburb={pkg.suburb || ""}
                        state={pkg.state || ""}
                        image={pkg.hero_image_url || pkg.heroImage || pkg.image || "/favicon.ico"}
                        badge={pkg.badge || pkg.estate_name || "Premium"}
                        price={pkg.price}
                        landSize={pkg.landSize}
                        houseSize={pkg.houseSize}
                        beds={pkg.beds}
                        baths={bathValue(pkg.baths)}
                        garage={pkg.garage}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[32px] border border-white/10 bg-white/[0.03] px-8 py-24 text-center"
                >
                  <p className="font-display text-3xl">No package matched the brief.</p>
                  <p className="mt-3 text-sm text-white/40">Adjust a filter and explore the collection again.</p>
                  <button
                    onClick={clear}
                    className="mt-8 rounded-full bg-[#D8C7A4] px-8 py-3.5 text-sm font-medium text-[#0A1628]"
                  >
                    Reset search
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </section>
    </main>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labels,
  empty = "All",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: string[];
  empty?: string;
}) {
  return (
    <label className="relative block">
      <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 pr-9 text-sm text-white outline-none focus:border-[#D8C7A4]/50"
        >
          {options.map((v, i) => (
            <option key={`${v}-${i}`} value={v} className="bg-[#0A1628]">
              {labels?.[i] ?? (v === "" ? empty : v)}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
      </div>
    </label>
  );
}