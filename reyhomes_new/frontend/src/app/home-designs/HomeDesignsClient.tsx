"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion, LayoutGroup, useScroll, useTransform } from "framer-motion";
import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import DesignCard from "@/components/home/section/DesignCard";
import type { HomeDesignListItem } from "@/types/home";
import { Reveal, FloatGlow, luxeEase } from "@/components/common/motion";

const PRICE_BRACKETS = [
  { label: "Any budget", min: 0, max: Infinity },
  { label: "Under $450k", min: 0, max: 450000 },
  { label: "$450k – $550k", min: 450000, max: 550000 },
  { label: "$550k – $750k", min: 550000, max: 750000 },
  { label: "$750k+", min: 750000, max: Infinity },
];

const priceValue = (v: string) => Number(String(v).replace(/[^0-9.]/g, "")) || 0;
const bathValue = (v: number | string) => Number(v) || 0;

const layoutTransition = {
  layout: { duration: 0.48, ease: luxeEase },
  opacity: { duration: 0.32 },
};

export default function HomeDesignsClient({ designs }: { designs: HomeDesignListItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(designs.map((d) => d.category).filter(Boolean)))],
    [designs]
  );
  const beds = useMemo(() => [...new Set(designs.map((d) => d.beds))].sort((a, b) => a - b), [designs]);
  const baths = useMemo(
    () => [...new Set(designs.map((d) => bathValue(d.baths)))].filter(Boolean).sort((a, b) => a - b),
    [designs]
  );

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [minBeds, setMinBeds] = useState(searchParams.get("bedrooms") || "");
  const [minBaths, setMinBaths] = useState(searchParams.get("baths") || "");
  const [garage, setGarage] = useState(searchParams.get("garage") || "");
  const [price, setPrice] = useState(() => {
    const min = Number(searchParams.get("minPrice") || 0);
    const max = Number(searchParams.get("maxPrice") || Infinity);
    const idx = PRICE_BRACKETS.findIndex((b) => b.min === min && b.max === max);
    return idx >= 0 ? idx : 0;
  });
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");
  const [advanced, setAdvanced] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [debouncedQ, setDebouncedQ] = useState(q);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 280);
    return () => clearTimeout(t);
  }, [q]);

  const filtered = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    const bracket = PRICE_BRACKETS[price];

    let result = designs.filter((d) => {
      if (
        term &&
        ![d.name, d.title, d.subtitle, d.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      )
        return false;
      if (category !== "All" && d.category !== category) return false;
      if (minBeds && d.beds < Number(minBeds)) return false;
      if (minBaths && bathValue(d.baths) < Number(minBaths)) return false;
      if (garage && d.garage < Number(garage)) return false;
      const p = priceValue(d.price);
      if (p < bracket.min || p > bracket.max) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === "price-low") return priceValue(a.price) - priceValue(b.price);
      if (sort === "price-high") return priceValue(b.price) - priceValue(a.price);
      if (sort === "beds") return b.beds - a.beds;
      if (sort === "name") return a.name.localeCompare(b.name);
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [designs, debouncedQ, category, minBeds, minBaths, garage, price, sort]);

  // Active filter chips for animated display
  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; clear: () => void }[] = [];
    if (q) chips.push({ id: "q", label: `“${q}”`, clear: () => setQ("") });
    if (category !== "All")
      chips.push({ id: "cat", label: category, clear: () => setCategory("All") });
    if (minBeds)
      chips.push({ id: "beds", label: `${minBeds}+ beds`, clear: () => setMinBeds("") });
    if (minBaths)
      chips.push({ id: "baths", label: `${minBaths}+ baths`, clear: () => setMinBaths("") });
    if (garage)
      chips.push({ id: "garage", label: `${garage}+ car`, clear: () => setGarage("") });
    if (price !== 0)
      chips.push({
        id: "price",
        label: PRICE_BRACKETS[price].label,
        clear: () => setPrice(0),
      });
    return chips;
  }, [q, category, minBeds, minBaths, garage, price]);

  const syncUrl = useCallback(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category !== "All") p.set("category", category);
    if (minBeds) p.set("bedrooms", minBeds);
    if (minBaths) p.set("baths", minBaths);
    if (garage) p.set("garage", garage);
    if (price !== 0) {
      p.set("minPrice", String(PRICE_BRACKETS[price].min));
      if (PRICE_BRACKETS[price].max !== Infinity)
        p.set("maxPrice", String(PRICE_BRACKETS[price].max));
    }
    if (sort !== "featured") p.set("sort", sort);
    const qs = p.toString();
    router.replace(qs ? `/home-designs?${qs}` : "/home-designs", { scroll: false });
  }, [q, category, minBeds, minBaths, garage, price, sort, router]);

  useEffect(() => {
    syncUrl();
  }, [category, minBeds, minBaths, garage, price, sort]); // eslint-disable-line

  const clear = () => {
    setQ("");
    setCategory("All");
    setMinBeds("");
    setMinBaths("");
    setGarage("");
    setPrice(0);
    setSort("featured");
    router.replace("/home-designs");
  };

  // Sticky bar morph
  const { scrollY } = useScroll();
  const barPad = useTransform(scrollY, [0, 100], [16, 10]);
  const barShadow = useTransform(
    scrollY,
    [0, 100],
    ["0 0 0 rgba(0,0,0,0)", "0 12px 40px -12px rgba(7,26,46,0.14)"]
  );

  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#0A1628]">
      {/* Deep Hero */}
      <section className="relative overflow-hidden bg-[#071A2E] text-[#F5F0E6]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(26,90,140,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_70%,rgba(216,199,164,0.07),transparent_50%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <FloatGlow
          className="pointer-events-none absolute -right-48 -top-48 h-[700px] w-[700px] rounded-full bg-[#1A4A6E]/28 blur-[150px]"
          duration={24}
          x={-40}
          y={30}
        />
        <FloatGlow
          className="pointer-events-none absolute -left-40 bottom-[-10%] h-[480px] w-[480px] rounded-full bg-[#D8C7A4]/08 blur-[120px]"
          duration={28}
          x={25}
          y={-20}
        />

        <Reveal className="relative mx-auto max-w-7xl px-5 pb-20 pt-40 sm:px-8 lg:px-10 lg:pb-28 lg:pt-48">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-12 bg-[#D8C7A4]/70" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#D8C7A4]">
              The Residential Collection
            </p>
          </div>
          <h1 className="max-w-4xl font-display text-[clamp(3.4rem,7.5vw,7.2rem)] leading-[0.9] tracking-[-0.035em]">
            Home
            <br />
            <span className="italic text-[#D8C7A4]">Designs.</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-8 text-white/55 sm:text-lg">
            Discover considered residences shaped around space, light and enduring architectural character.
          </p>
        </Reveal>
      </section>

      {/* Sticky Filter Bar – morphs on scroll */}
      <motion.section
        style={{ paddingTop: barPad, paddingBottom: barPad, boxShadow: barShadow }}
        className="sticky top-0 z-40 border-b border-[#0A1628]/08 bg-[#F5F0E6]/95 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex gap-3">
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0A1628]/35" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && syncUrl()}
                placeholder="Search designs…"
                className="h-11 w-full rounded-full border border-[#0A1628]/10 bg-white/90 pl-11 pr-4 text-sm outline-none transition focus:border-[#D8C7A4] focus:ring-4 focus:ring-[#D8C7A4]/15"
              />
            </div>

            <button
              type="button"
              onClick={() => setAdvanced((v) => !v)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition sm:px-5 ${
                advanced
                  ? "bg-[#0A1628] text-[#F5F0E6]"
                  : "bg-white/90 text-[#0A1628] hover:bg-white"
              }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
              <AnimatePresence>
                {activeChips.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D8C7A4] px-1.5 text-[10px] font-bold text-[#0A1628]"
                  >
                    {activeChips.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* View toggle */}
            <div className="hidden items-center rounded-full border border-[#0A1628]/10 bg-white/90 p-1 sm:flex">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  view === "grid" ? "bg-[#0A1628] text-[#F5F0E6]" : "text-[#0A1628]/45"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  view === "list" ? "bg-[#0A1628] text-[#F5F0E6]" : "text-[#0A1628]/45"
                }`}
              >
                <List size={15} />
              </button>
            </div>
          </div>

          {/* Advanced filters */}
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
                  <Select label="Style" value={category} onChange={setCategory} options={categories} />
                  <Select label="Bedrooms" value={minBeds} onChange={setMinBeds} options={["", ...beds.map(String)]} empty="Any" />
                  <Select label="Bathrooms" value={minBaths} onChange={setMinBaths} options={["", ...baths.map(String)]} empty="Any" />
                  <Select label="Garage" value={garage} onChange={setGarage} options={["", "1", "2", "3", "4"]} empty="Any" />
                  <Select
                    label="Budget"
                    value={String(price)}
                    onChange={(v) => setPrice(Number(v))}
                    options={PRICE_BRACKETS.map((_, i) => String(i))}
                    labels={PRICE_BRACKETS.map((x) => x.label)}
                  />
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#0A1628]/08 pt-4">
                  <button
                    onClick={clear}
                    className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0A1628]/45 hover:text-[#0A1628]"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={syncUrl}
                    className="rounded-full bg-[#0A1628] px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#F5F0E6]"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category chips + Sort */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                    category === item
                      ? "bg-[#0A1628] text-[#F5F0E6]"
                      : "bg-white/70 text-[#0A1628]/45 hover:text-[#0A1628]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="flex shrink-0 items-center gap-2 text-xs text-[#0A1628]/45">
              <span className="hidden sm:inline">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-[#0A1628]/10 bg-white/70 px-3 py-2 outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low → high</option>
                <option value="price-high">Price: high → low</option>
                <option value="beds">Most bedrooms</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>

          {/* Animated active filter chips */}
          <AnimatePresence>
            {activeChips.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-4">
                  <AnimatePresence>
                    {activeChips.map((chip) => (
                      <motion.button
                        key={chip.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        onClick={chip.clear}
                        className="flex items-center gap-1.5 rounded-full bg-[#0A1628] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#F5F0E6]"
                      >
                        {chip.label}
                        <X size={11} />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Results – advanced layout */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-12 flex items-end justify-between gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">
                {filtered.length} {filtered.length === 1 ? "residence" : "residences"}
              </p>
              <h2 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
                Find your address.
              </h2>
            </div>
          </div>

          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {filtered.length ? (
                <motion.div
                  layout
                  className={
                    view === "grid"
                      ? "grid gap-7 md:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col gap-5"
                  }
                  transition={layoutTransition}
                >
                  {filtered.map((design, index) => (
                    <motion.div
                      key={design.id}
                      layout
                      initial={{ opacity: 0, y: 36, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                      transition={{
                        ...layoutTransition,
                        delay: Math.min(index, 8) * 0.04,
                      }}
                      className={view === "list" ? "w-full" : ""}
                    >
                      <DesignCard
                        id={design.id}
                        name={design.name}
                        slug={design.slug}
                        beds={design.beds}
                        baths={bathValue(design.baths)}
                        garage={design.garage}
                        image={design.hero_image_url || design.image || "/favicon.ico"}
                        price={design.price}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-[32px] border border-[#0A1628]/08 bg-white/70 px-8 py-24 text-center"
                >
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#0A1628]/05">
                    <Sparkles size={22} className="text-[#0A1628]/40" />
                  </div>
                  <p className="font-display text-3xl">Nothing matched the brief.</p>
                  <p className="mt-3 text-sm text-[#0A1628]/50">
                    Relax one filter and discover more of the collection.
                  </p>
                  <button
                    onClick={clear}
                    className="mt-8 rounded-full bg-[#0A1628] px-8 py-3.5 text-sm font-medium text-[#F5F0E6]"
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
      <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#0A1628]/35">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-2xl border border-[#0A1628]/10 bg-white/80 px-4 pr-9 text-sm outline-none focus:border-[#D8C7A4]"
        >
          {options.map((v, i) => (
            <option key={`${v}-${i}`} value={v}>
              {labels?.[i] ?? (v === "" ? empty : v)}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0A1628]/35"
        />
      </div>
    </label>
  );
}