"use client";

import { useEffect, useRef, useState } from "react";
import { motion, MotionValue, useMotionValue, useTransform } from "framer-motion";

export type Slide = {
  id?: string;
  title: string;
  subtitle: string;
  video?: string;
  image?: string;
  poster?: string;
  href: string;
  button: string;
};

type Props = {
  slide: Slide;
  isActive: boolean;
  reduceMotion?: boolean;
  /** When true, active slide video plays with audio */
  soundOn?: boolean;
  parallaxX?: MotionValue<number>;
  parallaxY?: MotionValue<number>;
};

export default function HeroSlide({
  slide,
  isActive,
  reduceMotion = false,
  soundOn = false,
  parallaxX,
  parallaxY,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  const xSource = parallaxX ?? fallbackX;
  const ySource = parallaxY ?? fallbackY;

  const mediaX = useTransform(xSource, [-0.5, 0.5], reduceMotion ? [0, 0] : [-6, 6]);
  const mediaY = useTransform(ySource, [-0.5, 0.5], reduceMotion ? [0, 0] : [-4, 4]);

  const hasVideo = Boolean(slide.video);
  const posterSrc = slide.poster || slide.image;

  // Play / pause based on active slide
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !slide.video) return;
    if (isActive) {
      video.load();
      video.play()?.catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
      video.muted = true; // always mute inactive slides
    }
  }, [isActive, slide.video]);

  // Sound follows the active slide only
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive && soundOn) {
      video.muted = false;
      video.volume = 0.85;
      // Browsers may block unmute without gesture — try play again
      video.play()?.catch(() => {});
    } else {
      video.muted = true;
    }
  }, [isActive, soundOn, slide.video]);

  useEffect(() => setVideoReady(false), [slide.video]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -inset-[2.5%] will-change-transform"
        style={{ x: mediaX, y: mediaY, scale: isActive ? 1 : 1.08 }}
        transition={{ duration: 9, ease: [0.32, 0.72, 0, 1] }}
      >
        {posterSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterSrc}
            alt={slide.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading={isActive ? "eager" : "lazy"}
            fetchPriority={isActive ? "high" : "low"}
          />
        )}

        {hasVideo && (
          <video
            ref={videoRef}
            src={slide.video}
            poster={posterSrc}
            muted
            loop
            playsInline
            preload={isActive ? "auto" : "metadata"}
            onLoadedData={() => setVideoReady(true)}
            onCanPlay={() => setVideoReady(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {!hasVideo && !posterSrc && <div className="absolute inset-0 bg-[#0A1420]" />}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A1420]/75 via-transparent to-[#0A1420]/90" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0A1420]/70 via-[#0A1420]/25 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A1420]/80 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.35)_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(248,245,240,0.16), transparent 40%)",
        }}
      />
    </div>
  );
}
