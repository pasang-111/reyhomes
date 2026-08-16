"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useSpring, LayoutGroup } from "framer-motion";
import { softSpring, magneticSpring } from "@/lib/spring";

type Props = {
  title: string;
  subtitle: string;
  href: string;
  button: string;
  isActive: boolean;
  reduceMotion: boolean;
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: softSpring,
  },
};

function MagneticButton({
  href,
  children,
  variant,
  reduceMotion,
}: {
  href: string;
  children: React.ReactNode;
  variant: "solid" | "glass";
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, magneticSpring);
  const springY = useSpring(y, magneticSpring);

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.22);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.22);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    variant === "solid"
      ? "border border-[#F8F5F0]/70 bg-[#F8F5F0] text-[#0F1C2E] shadow-[0_18px_50px_-18px_rgba(248,245,240,0.4)] hover:bg-white"
      : "border border-[#F8F5F0]/20 bg-black/25 text-[#F8F5F0]/90 backdrop-blur-xl hover:border-[#F8F5F0]/45 hover:bg-white/[0.08]";

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      layout
      className={`group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-500 hover:-translate-y-0.5 ${base}`}
    >
      <span className="relative z-10">{children}</span>
      <ArrowUpRight
        size={15}
        strokeWidth={1.8}
        className="relative z-10 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
      {variant === "solid" && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      )}
    </motion.a>
  );
}

export default function HeroContent({
  title,
  subtitle,
  href,
  button,
  isActive,
  reduceMotion,
}: Props) {
  return (
    <LayoutGroup>
      <motion.div
        variants={container}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="max-w-5xl"
      >
        <motion.div variants={item} className="mb-5 flex items-center gap-3 sm:mb-7">
          <span className="h-px w-8 bg-[#F8F5F0]/60 sm:w-12" />
          <span className="text-[9px] font-medium uppercase tracking-[0.38em] text-[#F8F5F0]/80 sm:text-[10px]">
            ReyHomes · Bespoke Living
          </span>
        </motion.div>

        <motion.h1
          layout
          variants={item}
          className="max-w-5xl text-[clamp(3.6rem,8vw,8.5rem)] font-extralight leading-[0.88] tracking-[-0.055em] text-[#F8F5F0]"
        >
          {title}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-[clamp(1rem,1.3vw,1.25rem)] font-light leading-[1.7] text-[#F8F5F0]/60 sm:mt-8"
        >
          {subtitle}
        </motion.p>

        <motion.div variants={item} className="mt-8 flex flex-wrap gap-3 sm:mt-10">
          <MagneticButton href={href} variant="solid" reduceMotion={reduceMotion}>
            {button}
          </MagneticButton>
          <MagneticButton href="/contact" variant="glass" reduceMotion={reduceMotion}>
            Private Consultation
          </MagneticButton>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-7 flex items-center gap-3 text-[9px] uppercase tracking-[0.28em] text-[#F8F5F0]/30"
        >
          <span className="h-1 w-1 rounded-full bg-[#F8F5F0]" />
          Architecture · Craft · Legacy
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}