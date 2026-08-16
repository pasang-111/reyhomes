"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { motion } from "framer-motion";
import { snappySpring } from "@/lib/spring";

type Slide = { id?: string; title: string };

type Props = {
  slides: Slide[];
  active: number;
  onChange: (index: number) => void;
  autoplayMs?: number;
  paused?: boolean;
  onTogglePause?: () => void;
};

export default function HeroNavigation({
  slides,
  active,
  onChange,
  autoplayMs = 9000,
  paused = false,
  onTogglePause,
}: Props) {
  if (!slides.length) return null;

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      <button
        type="button"
        onClick={() => onChange((active - 1 + slides.length) % slides.length)}
        aria-label="Previous hero slide"
        className="group flex h-9 w-9 items-center justify-center rounded-full border border-[#F8F5F0]/15 bg-black/25 text-[#F8F5F0]/60 backdrop-blur-xl transition-all duration-300 hover:border-[#F8F5F0]/40 hover:bg-white/[0.08] hover:text-[#F8F5F0] sm:h-10 sm:w-10"
      >
        <ChevronLeft size={15} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
      </button>

      <div className="hidden items-center gap-5 md:flex">
        {slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <button
              key={slide.id ?? index}
              type="button"
              onClick={() => onChange(index)}
              aria-label={`Go to slide ${index + 1}: ${slide.title}`}
              aria-current={isActive ? "true" : undefined}
              className="group flex items-center gap-3"
            >
              <span
                className={`text-[9px] font-medium tracking-[0.2em] transition-colors duration-500 ${
                  isActive ? "text-[#F8F5F0]" : "text-white/25 group-hover:text-white/55"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <span
                className={`relative h-px overflow-hidden transition-all duration-500 ${
                  isActive ? "w-16 bg-white/15 sm:w-20" : "w-8 bg-white/10"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="hero-nav-progress"
                    className="absolute inset-y-0 left-0 bg-[#F8F5F0]"
                    initial={{ width: "0%" }}
                    animate={{ width: paused ? "45%" : "100%" }}
                    transition={{
                      duration: paused ? 0.3 : autoplayMs / 1000,
                      ease: "linear",
                    }}
                  />
                )}
              </span>

              <span
                className={`hidden max-w-[12ch] truncate text-[9px] font-light tracking-wide lg:inline ${
                  isActive ? "text-white/60" : "text-white/20 group-hover:text-white/40"
                }`}
              >
                {slide.title}
              </span>
            </button>
          );
        })}
      </div>

      {onTogglePause && (
        <button
          type="button"
          onClick={onTogglePause}
          aria-label={paused ? "Resume hero slides" : "Pause hero slides"}
          className="group flex h-9 w-9 items-center justify-center rounded-full border border-[#F8F5F0]/15 bg-black/25 text-[#F8F5F0]/60 backdrop-blur-xl transition-all duration-300 hover:border-[#F8F5F0]/40 hover:bg-white/[0.08] hover:text-[#F8F5F0] sm:h-10 sm:w-10"
        >
          {paused ? (
            <Play size={12} fill="currentColor" strokeWidth={1.5} />
          ) : (
            <Pause size={12} strokeWidth={1.5} />
          )}
        </button>
      )}

      <button
        type="button"
        onClick={() => onChange((active + 1) % slides.length)}
        aria-label="Next hero slide"
        className="group flex h-9 w-9 items-center justify-center rounded-full border border-[#F8F5F0]/15 bg-black/25 text-[#F8F5F0]/60 backdrop-blur-xl transition-all duration-300 hover:border-[#F8F5F0]/40 hover:bg-white/[0.08] hover:text-[#F8F5F0] sm:h-10 sm:w-10"
      >
        <ChevronRight size={15} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>

      <div className="ml-1 hidden items-baseline sm:flex">
        <span className="text-3xl font-extralight tracking-[-0.05em] text-[#F8F5F0]/40">
          {String(active + 1).padStart(2, "0")}
        </span>
        <span className="ml-1 text-[10px] text-[#F8F5F0]/25">
          / {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}