"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Luxury two‑part cursor (ring + dot) that adapts to light/dark backgrounds.
 * Robust with fixed navbars, modals, and overlays.
 */
export default function LuxuryCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Move dot directly
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      // Adaptive theme based on background
      const topEl = document.elementFromPoint(mouseX, mouseY);
      const bg = topEl ? getEffectiveBackgroundColor(topEl as HTMLElement) : "rgb(0,0,0)";
      const onLight = isLight(bg);

      ring.setAttribute("data-theme", onLight ? "light" : "dark");
      dot.setAttribute("data-theme", onLight ? "light" : "dark");
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      // Clamp inside viewport to avoid scrollbars
      const rx = Math.max(0, Math.min(window.innerWidth, ringX));
      const ry = Math.max(0, Math.min(window.innerHeight, ringY));

      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const isInteractive = (el: Element | null): boolean => {
      if (!el) return false;
      return !!el.closest(
        'a, button, [role="button"], input, select, textarea, label, [data-cursor="pointer"], .cursor-pointer'
      );
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element;
      setIsPointer(isInteractive(target));
    };

    const onDown = () => setIsDown(true);
    const onUp = () => setIsDown(false);

    const onLeaveDoc = () => setVisible(false);
    const onEnterDoc = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeaveDoc);
    document.addEventListener("mouseenter", onEnterDoc);

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeaveDoc);
      document.removeEventListener("mouseenter", onEnterDoc);
    };
  }, []);

  return (
    <>
      {/* Ring */}
      <div
        ref={ringRef}
        id="lux-cursor-ring"
        aria-hidden
        data-pointer={isPointer ? "true" : "false"}
        data-down={isDown ? "true" : "false"}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          width: 44,
          height: 44,
          borderRadius: "50%",
          pointerEvents: "none",
          mixBlendMode: "normal",
          border: "1px solid rgba(255, 255, 255, 0.55)",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 45%, transparent 70%)",
          boxShadow:
            "0 0 22px rgba(255, 255, 255, 0.22), inset 0 0 10px rgba(255, 255, 255, 0.08)",
          transform: "translate3d(-50%, -50%, 0)",
          transition:
            "transform 120ms ease, width 220ms ease, height 220ms ease, border-color 220ms ease, background 220ms ease, box-shadow 220ms ease, opacity 200ms ease",
          opacity: 1,
        }}
        className="hidden md:block"
      />

      {/* Dot */}
      <div
        ref={dotRef}
        id="lux-cursor-dot"
        aria-hidden
        data-pointer={isPointer ? "true" : "false"}
        data-down={isDown ? "true" : "false"}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          width: 8,
          height: 8,
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(230,230,230,0.9) 100%)",
          boxShadow:
            "0 0 18px rgba(255, 255, 255, 0.55), 0 0 36px rgba(255, 255, 255, 0.25)",
          transform: "translate3d(-50%, -50%, 0)",
          transition:
            "transform 80ms ease, width 200ms ease, height 200ms ease, opacity 200ms ease, background 200ms ease, box-shadow 200ms ease",
          opacity: 1,
        }}
        className="hidden md:block"
      />

      <style jsx global>{`
        /* Light background theme */
        #lux-cursor-ring[data-theme="light"] {
          border-color: rgba(0, 0, 0, 0.55) !important;
          background:
            radial-gradient(
              circle,
              rgba(0, 0, 0, 0.08) 0%,
              rgba(0, 0, 0, 0.03) 45%,
              transparent 70%
            ) !important;
          box-shadow:
            0 0 18px rgba(0, 0, 0, 0.18),
            inset 0 0 10px rgba(0, 0, 0, 0.08) !important;
        }

        #lux-cursor-dot[data-theme="light"] {
          background:
            radial-gradient(
              circle,
              rgba(30, 30, 30, 0.95) 0%,
              rgba(60, 60, 60, 0.9) 100%
            ) !important;
          box-shadow:
            0 0 14px rgba(0, 0, 0, 0.35),
            0 0 28px rgba(0, 0, 0, 0.18) !important;
        }

        /* Pointer state */
        #lux-cursor-ring[data-pointer="true"] {
          width: 56px !important;
          height: 56px !important;
        }

        #lux-cursor-ring:not([data-theme="light"])[data-pointer="true"] {
          border-color: rgba(255, 255, 255, 0.85) !important;
          background:
            radial-gradient(
              circle,
              rgba(255, 255, 255, 0.14) 0%,
              rgba(255, 255, 255, 0.05) 45%,
              transparent 70%
            ) !important;
          box-shadow:
            0 0 28px rgba(255, 255, 255, 0.32),
            inset 0 0 14px rgba(255, 255, 255, 0.12) !important;
        }

        #lux-cursor-ring[data-theme="light"][data-pointer="true"] {
          border-color: rgba(0, 0, 0, 0.75) !important;
          background:
            radial-gradient(
              circle,
              rgba(0, 0, 0, 0.14) 0%,
              rgba(0, 0, 0, 0.05) 45%,
              transparent 70%
            ) !important;
          box-shadow:
            0 0 22px rgba(0, 0, 0, 0.22),
            inset 0 0 12px rgba(0, 0, 0, 0.1) !important;
        }

        #lux-cursor-dot[data-pointer="true"] {
          width: 6px !important;
          height: 6px !important;
        }

        /* Click state */
        #lux-cursor-ring[data-down="true"] {
          width: 36px !important;
          height: 36px !important;
        }

        #lux-cursor-ring:not([data-theme="light"])[data-down="true"] {
          border-color: rgba(255, 255, 255, 0.95) !important;
          background:
            radial-gradient(
              circle,
              rgba(255, 255, 255, 0.18) 0%,
              rgba(255, 255, 255, 0.07) 45%,
              transparent 70%
            ) !important;
          box-shadow:
            0 0 24px rgba(255, 255, 255, 0.38),
            inset 0 0 12px rgba(255, 255, 255, 0.14) !important;
        }

        #lux-cursor-ring[data-theme="light"][data-down="true"] {
          border-color: rgba(0, 0, 0, 0.85) !important;
          background:
            radial-gradient(
              circle,
              rgba(0, 0, 0, 0.18) 0%,
              rgba(0, 0, 0, 0.07) 45%,
              transparent 70%
            ) !important;
          box-shadow:
            0 0 20px rgba(0, 0, 0, 0.28),
            inset 0 0 10px rgba(0, 0, 0, 0.12) !important;
        }

        #lux-cursor-dot[data-down="true"] {
          width: 5px !important;
          height: 5px !important;
        }

        #lux-cursor-ring,
        #lux-cursor-dot {
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          #lux-cursor-ring,
          #lux-cursor-dot {
            transition: none !important;
            will-change: auto;
          }
        }
      `}</style>
    </>
  );
}

/**
 * Get effective background color of an element by walking up the tree
 * until we find a non‑transparent background or hit the root.
 */
function getEffectiveBackgroundColor(el: HTMLElement): string {
  let current: HTMLElement | null = el;

  while (current) {
    const style = window.getComputedStyle(current);
    const bg = style.backgroundColor;

    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      const m = bg.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
      if (m) {
        const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
        if (a > 0.5) {
          return bg;
        }
      } else {
        return bg;
      }
    }

    current = current.parentElement;
  }

  return "rgb(255, 255, 255)";
}

function isLight(rgbLike: string): boolean {
  const m = rgbLike.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (!m) return false;

  const r = parseInt(m[1], 10);
  const g = parseInt(m[2], 10);
  const b = parseInt(m[3], 10);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}