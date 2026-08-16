"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";

/* -------------------------------------------------------
   Cinematic entry — two aesthetics

   first_visit  → slow discovery: deep void, rising light, soft serif
   login        → warm return: brass rim light, thank-you pacing
------------------------------------------------------- */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const ARM_KEY = "reyhomes_cinematic_welcome";
const FIRST_VISIT_KEY = "reyhomes_first_visit_seen";
export const ARM_EVENT = "reyhomes:cinematic-welcome";

export type WelcomeVariant = "first_visit" | "login" | "register";

type Phase =
  | "idle"
  | "void"
  | "logo"
  | "eyebrow"
  | "title"
  | "subtitle"
  | "tagline"
  | "boom"
  | "exit";

type CopyBlock = {
  eyebrow: string;
  title: string;
  subtitle: string;
  tagline: string;
  speech: string;
};

/** Timing per variant — long enough to read every line. */
type Timing = {
  logo: number;
  eyebrow: number;
  title: number;
  subtitle: number;
  tagline: number;
  boom: number;
  finish: number;
  hardMax: number;
};

const COPY: Record<WelcomeVariant, CopyBlock> = {
  first_visit: {
    eyebrow: "Est. for those who build differently",
    title: "Welcome",
    subtitle: "A quieter way to discover homes — designs, land, and residences shaped with intention.",
    tagline: "Your luxury residential journey begins here",
    speech: "Welcome to Rey Homes. Architecture for the way you live.",
  },
  login: {
    eyebrow: "Thank you for signing in",
    title: "Welcome back",
    subtitle: "Your saved favourites, enquiries, and private residential space are ready whenever you are.",
    tagline: "Continue your luxury residential experience",
    speech: "Thank you for signing in. Welcome back to Rey Homes.",
  },
  register: {
    eyebrow: "You're one of us now",
    title: "Welcome to ReyHomes",
    subtitle: "Your private space for favourites, enquiries, and builds is ready.",
    tagline: "Save what you love. Build what matters.",
    speech: "Welcome to Rey Homes. Your journey home begins here.",
  },
};

const TIMING: Record<WelcomeVariant, Timing> = {
  // First land — slower, contemplative (~11s readable)
  first_visit: {
    logo: 900,
    eyebrow: 2400,
    title: 3600,
    subtitle: 5200,
    tagline: 7200,
    boom: 9000,
    finish: 10200,
    hardMax: 14000,
  },
  // After login — smooth, measured (~9.5s)
  login: {
    logo: 700,
    eyebrow: 1800,
    title: 3000,
    subtitle: 4600,
    tagline: 6400,
    boom: 8200,
    finish: 9400,
    hardMax: 13000,
  },
  register: {
    logo: 700,
    eyebrow: 1800,
    title: 3000,
    subtitle: 4600,
    tagline: 6400,
    boom: 8200,
    finish: 9400,
    hardMax: 13000,
  },
};

type CinematicWelcomeProps = {
  logoSrc?: string;
  onComplete?: () => void;
  enableFirstVisit?: boolean;
};

export function armCinematicWelcome(variant: WelcomeVariant = "login") {
  try {
    sessionStorage.setItem(ARM_KEY, variant);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(ARM_EVENT, { detail: { variant } })
    );
  }
}

function readArmFlag(): WelcomeVariant | null {
  try {
    const v = sessionStorage.getItem(ARM_KEY);
    if (v === "login" || v === "register" || v === "first_visit") return v;
    if (v === "1") return "login";
  } catch {
    /* ignore */
  }
  return null;
}

function clearArmFlag() {
  try {
    sessionStorage.removeItem(ARM_KEY);
  } catch {
    /* ignore */
  }
}

function shouldPlayFirstVisit(): boolean {
  try {
    if (localStorage.getItem(FIRST_VISIT_KEY)) return false;
    if (sessionStorage.getItem(FIRST_VISIT_KEY)) return false;
    return true;
  } catch {
    // Storage blocked — still try to show once via in-memory is handled by started ref
    return true;
  }
}

function markFirstVisitSeen() {
  try {
    localStorage.setItem(FIRST_VISIT_KEY, "1");
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.setItem(FIRST_VISIT_KEY, "1");
  } catch {
    /* ignore */
  }
}

function isAuthPath(pathname: string) {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/admin") || pathname.startsWith("/pro")
  );
}

/**
 * Browsers (Chrome, Safari, Firefox) block audio output from an AudioContext
 * until the page has received a genuine user gesture (click/tap/keydown).
 * The previous implementation created a brand-new AudioContext inside
 * runSequence() and called resume() without ever waiting on a gesture, so on
 * a fresh tab load (the "first_visit" variant) the context stayed
 * "suspended" and every oscillator scheduled against it was silent — this is
 * why "sound isn't being played in cinematic welcome".
 *
 * Fix: keep ONE shared AudioContext for the whole app, create it as early as
 * possible, and resume it on the very first pointer/key interaction anywhere
 * on the page (attached from module load, not from inside the timed
 * sequence). Any sequence that starts after that first interaction — which
 * covers the "login"/"register" variants (always triggered right after a
 * button click) and any first_visit sequence that starts after the user has
 * touched the page at all — will now actually produce sound. A sequence that
 * fires before any interaction (e.g. an automated first-visit with zero
 * clicks) will still correctly stay silent per browser policy; there is no
 * way to bypass that from JavaScript, only to stop silently swallowing it.
 */
let sharedAudioCtx: AudioContext | null = null;
let audioUnlockBound = false;

function getSharedAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    try {
      sharedAudioCtx = new AC();
    } catch {
      sharedAudioCtx = null;
    }
  }
  return sharedAudioCtx;
}

function bindAudioUnlockOnce() {
  if (typeof window === "undefined" || audioUnlockBound) return;
  audioUnlockBound = true;
  const unlock = () => {
    const ctx = getSharedAudioCtx();
    if (ctx?.state === "suspended") void ctx.resume().catch(() => {});
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
  window.addEventListener("touchstart", unlock, { once: true });
}

function createAudioCtx(): AudioContext | null {
  const ctx = getSharedAudioCtx();
  if (ctx?.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

function playWhoosh(ctx: AudioContext) {
  try {
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 1.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(120, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.7);
    filter.Q.value = 0.65;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + 1.4);
  } catch {
    /* ignore */
  }
}

function playLogoTone(ctx: AudioContext, warm = false) {
  try {
    const now = ctx.currentTime;
    const freqs = warm ? [174.61, 220.0, 261.63] : [196.0, 246.94, 293.66];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = warm ? "sine" : "triangle";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.05 - i * 0.008, now + 0.4 + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = warm ? 900 : 1200;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + 2.7);
    });
  } catch {
    /* ignore */
  }
}

function playSoftChime(ctx: AudioContext) {
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.5);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.5);
  } catch {
    /* ignore */
  }
}

function playBoom(ctx: AudioContext) {
  try {
    const now = ctx.currentTime;
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(55, now);
    sub.frequency.exponentialRampToValueAtTime(28, now + 0.7);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.exponentialRampToValueAtTime(0.35, now + 0.03);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 1.6);
  } catch {
    /* ignore */
  }
}

function speakLine(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.88;
    utter.pitch = 0.92;
    utter.volume = 0.7;
    window.speechSynthesis.speak(utter);
  } catch {
    /* ignore */
  }
}

/** Visual theme tokens per variant */
function themeFor(v: WelcomeVariant) {
  if (v === "login" || v === "register") {
    return {
      bg: "#0a121c",
      glow: "radial-gradient(circle, rgba(216,199,164,0.28) 0%, rgba(30,90,140,0.12) 45%, transparent 70%)",
      flash:
        "radial-gradient(circle at center, rgba(248,245,240,0.9) 0%, rgba(216,199,164,0.35) 40%, transparent 70%)",
      eyebrow: "rgba(216,199,164,0.9)",
      title: "#F8F5F0",
      subtitle: "rgba(248,245,240,0.78)",
      tagline: "rgba(216,199,164,0.6)",
      rule: "linear-gradient(90deg, transparent, #D8C7A4, transparent)",
      skip: "rgba(248,245,240,0.3)",
      warm: true,
    };
  }
  // first_visit — cool discovery
  return {
    bg: "#020810",
    glow: "radial-gradient(circle, rgba(30,110,170,0.38) 0%, transparent 70%)",
    flash:
      "radial-gradient(circle at center, rgba(248,245,240,0.95) 0%, rgba(30,110,170,0.4) 35%, transparent 70%)",
    eyebrow: "rgba(159,196,220,0.75)",
    title: "#F8F5F0",
    subtitle: "rgba(248,245,240,0.7)",
    tagline: "rgba(159,196,220,0.5)",
    rule: "linear-gradient(90deg, transparent, rgba(159,196,220,0.7), transparent)",
    skip: "rgba(248,245,240,0.28)",
    warm: false,
  };
}

export default function CinematicWelcome({
  logoSrc = "/image/team/reyhomes.png",
  onComplete,
  enableFirstVisit = true,
}: CinematicWelcomeProps) {
  const pathname = usePathname() || "/";
  const [phase, setPhase] = useState<Phase>("idle");
  const [visible, setVisible] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [variant, setVariant] = useState<WelcomeVariant>("first_visit");

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const started = useRef(false);
  const finished = useRef(false);
  const activeVariant = useRef<WelcomeVariant>("first_visit");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // Bind the one-time audio-unlock listener as early as this component
  // mounts (app shell), well before any welcome sequence timer fires, so
  // the shared AudioContext gets resumed on the user's first click/tap and
  // subsequent sequences (login/register, replayed first-visit) reliably
  // produce sound instead of silently failing under browser autoplay policy.
  useEffect(() => {
    bindAudioUnlockOnce();
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    clearTimers();
    clearArmFlag();
    if (activeVariant.current === "first_visit") markFirstVisitSeen();
    setPhase("exit");
    const t = setTimeout(() => {
      setVisible(false);
      setPhase("idle");
      started.current = false;
      onCompleteRef.current?.();
    }, 900);
    timers.current.push(t);
  }, [clearTimers]);

  const runSequence = useCallback(
    (v: WelcomeVariant) => {
      if (started.current) return;
      started.current = true;
      finished.current = false;
      activeVariant.current = v;
      setVariant(v);
      setVisible(true);
      setPhase("void");
      clearArmFlag();

      const lines = COPY[v];
      const timing = TIMING[v];
      const warm = v === "login" || v === "register";

      let ctx: AudioContext | null = null;
      try {
        ctx = createAudioCtx();
        if (ctx?.state === "suspended") void ctx.resume();
      } catch {
        ctx = null;
      }

      const at = (ms: number, fn: () => void) => {
        timers.current.push(setTimeout(fn, ms));
      };

      at(timing.logo, () => {
        setPhase("logo");
        if (ctx) {
          playWhoosh(ctx);
          playLogoTone(ctx, warm);
        }
      });
      at(timing.eyebrow, () => {
        setPhase("eyebrow");
        if (ctx) playSoftChime(ctx);
      });
      at(timing.title, () => {
        setPhase("title");
        speakLine(lines.speech);
      });
      at(timing.subtitle, () => setPhase("subtitle"));
      at(timing.tagline, () => setPhase("tagline"));
      at(timing.boom, () => {
        setPhase("boom");
        if (ctx) playBoom(ctx);
      });
      at(timing.finish, () => finish());
      at(timing.hardMax, () => finish());
    },
    [finish]
  );

  const evaluateAndPlay = useCallback(() => {
    if (typeof window === "undefined") return;
    if (started.current && !finished.current) return;
    if (isAuthPath(pathname)) return;

    // 1) Post-login / armed welcome (any main-site page)
    const armed = readArmFlag();
    if (armed === "login" || armed === "register") {
      started.current = false;
      finished.current = false;
      runSequence(armed);
      return;
    }

    // 2) First landing on HOME only — before login
    //    Plays once per browser until marked seen at end of sequence.
    const onHome = pathname === "/" || pathname === "";
    if (enableFirstVisit && onHome && shouldPlayFirstVisit()) {
      started.current = false;
      finished.current = false;
      runSequence("first_visit");
    }
  }, [pathname, enableFirstVisit, runSequence]);

  // Boot when chrome mounts or path changes (home first-visit + armed login)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isAuthPath(pathname)) return;

    const armedNow = readArmFlag();
    const onHome = pathname === "/" || pathname === "";
    const delay = armedNow ? 120 : onHome ? 400 : 200;

    const boot = window.setTimeout(() => {
      if (started.current && !finished.current) return;

      const armed = readArmFlag();
      if (armed === "login" || armed === "register") {
        started.current = false;
        finished.current = false;
        runSequence(armed);
        return;
      }

      // First enter landing page (before login)
      if (
        enableFirstVisit &&
        (pathname === "/" || pathname === "") &&
        shouldPlayFirstVisit()
      ) {
        started.current = false;
        finished.current = false;
        runSequence("first_visit");
      }
    }, delay);

    return () => window.clearTimeout(boot);
  }, [pathname, enableFirstVisit, runSequence]);

  // Unmount only: cancel audio; leave sequence alone on strict path flicker
  useEffect(() => {
    return () => {
      clearTimers();
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [clearTimers]);

  useEffect(() => {
    const onArm = () => {
      if (isAuthPath(pathname)) return;
      if (started.current && !finished.current) return;
      const v = readArmFlag() ?? "login";
      if (v === "first_visit") return; // first visit is path-driven only
      started.current = false;
      finished.current = false;
      runSequence(v);
    };
    window.addEventListener(ARM_EVENT, onArm);
    return () => window.removeEventListener(ARM_EVENT, onArm);
  }, [pathname, runSequence]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, finish]);

  const showLogo = phase === "logo" || phase === "eyebrow";
  const showEyebrow =
    phase === "eyebrow" ||
    phase === "title" ||
    phase === "subtitle" ||
    phase === "tagline";
  const showTitle =
    phase === "title" || phase === "subtitle" || phase === "tagline";
  const showSubtitle = phase === "subtitle" || phase === "tagline";
  const showTagline = phase === "tagline";
  const copy = COPY[variant];
  const theme = themeFor(variant);
  const isReturn = variant === "login" || variant === "register";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`cinematic-${variant}`}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: theme.bg }}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isReturn ? 0.85 : 1.1, ease: EASE_OUT }}
          onClick={() => finish()}
          role="dialog"
          aria-label={copy.title}
        >
          {/* Grain */}
          <div
            className="pointer-events-none absolute inset-0 mix-blend-overlay"
            style={{
              opacity: isReturn ? 0.05 : 0.08,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: isReturn
                ? "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.72) 100%)"
                : "radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,0.82) 100%)",
            }}
          />

          {/* Ambient glow — cool blue (first) vs warm brass (login) */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: theme.glow,
              filter: "blur(48px)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity:
                phase === "void" || phase === "exit"
                  ? 0
                  : phase === "boom"
                    ? 1
                    : 0.95,
              scale: phase === "boom" ? 2.6 : 1,
            }}
            transition={{ duration: 1.35, ease: EASE_OUT }}
          />

          {/* Login-only: soft brass ring */}
          {isReturn && (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[42vmin] w-[42vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{ borderColor: "rgba(216,199,164,0.18)" }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: phase === "void" || phase === "exit" || phase === "boom" ? 0 : 0.7,
                scale: phase === "tagline" ? 1.05 : 1,
              }}
              transition={{ duration: 1.2, ease: EASE_OUT }}
            />
          )}

          {/* Logo */}
          <AnimatePresence>
            {showLogo && (
              <motion.div
                key="logo"
                className="relative z-10 flex flex-col items-center"
                initial={{
                  opacity: 0,
                  scale: isReturn ? 0.88 : 0.7,
                  filter: "blur(14px)",
                  y: isReturn ? 12 : 28,
                }}
                animate={{
                  opacity: phase === "eyebrow" ? 0.25 : 1,
                  scale: phase === "eyebrow" ? 0.9 : 1,
                  filter: "blur(0px)",
                  y: phase === "eyebrow" ? -52 : 0,
                }}
                exit={{ opacity: 0, scale: 1.08, filter: "blur(10px)" }}
                transition={{ duration: isReturn ? 1.0 : 1.25, ease: EASE_OUT }}
              >
                {!logoFailed ? (
                  <Image
                    src={logoSrc}
                    alt="ReyHomes"
                    width={320}
                    height={96}
                    priority
                    className="h-16 w-auto object-contain sm:h-20 md:h-24"
                    style={{
                      maxWidth: "min(70vw, 340px)",
                      filter: isReturn
                        ? "drop-shadow(0 0 36px rgba(216,199,164,0.35))"
                        : "drop-shadow(0 0 40px rgba(30,110,170,0.35))",
                    }}
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <span
                    className="text-3xl font-light tracking-tight sm:text-4xl"
                    style={{
                      fontFamily:
                        '"Playfair Display", "Cormorant Garamond", Georgia, serif',
                      color: "#F8F5F0",
                    }}
                  >
                    ReyHomes
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Copy — longer hold, larger readable type */}
          <AnimatePresence>
            {(showEyebrow || showTitle) && (
              <motion.div
                key="copy"
                className="absolute inset-x-0 z-20 flex flex-col items-center px-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.65, ease: EASE_OUT }}
              >
                {showEyebrow && (
                  <motion.p
                    className="mb-5 max-w-md text-[10px] font-medium uppercase tracking-[0.42em] sm:text-[11px]"
                    style={{ color: theme.eyebrow }}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.85, ease: EASE_OUT }}
                  >
                    {copy.eyebrow}
                  </motion.p>
                )}
                {showTitle && (
                  <motion.h1
                    className="text-[clamp(2.4rem,7vw,5.25rem)] font-light leading-[1.05] tracking-tight"
                    style={{
                      fontFamily:
                        '"Playfair Display", "Cormorant Garamond", Georgia, serif',
                      color: theme.title,
                      textShadow: isReturn
                        ? "0 0 70px rgba(216,199,164,0.28)"
                        : "0 0 80px rgba(30,110,170,0.35)",
                    }}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.95, ease: EASE_OUT }}
                  >
                    {copy.title}
                  </motion.h1>
                )}
                {showTitle && (
                  <motion.div
                    className="mx-auto mt-7 h-px w-20"
                    style={{ background: theme.rule }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{
                      delay: 0.15,
                      duration: 0.85,
                      ease: EASE_OUT,
                    }}
                  />
                )}
                {showSubtitle && (
                  <motion.p
                    className="mt-7 max-w-xl text-[15px] font-light leading-[1.75] tracking-wide sm:text-[17px]"
                    style={{ color: theme.subtitle }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: EASE_OUT }}
                  >
                    {copy.subtitle}
                  </motion.p>
                )}
                {showTagline && (
                  <motion.p
                    className="mt-5 max-w-md text-[11px] font-medium uppercase tracking-[0.28em] sm:text-[12px]"
                    style={{ color: theme.tagline }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: EASE_OUT }}
                  >
                    {copy.tagline}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase === "boom" && (
              <motion.div
                key="flash"
                className="pointer-events-none absolute inset-0 z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0.12, 0] }}
                transition={{
                  duration: 1.0,
                  times: [0, 0.12, 0.4, 1],
                  ease: "easeOut",
                }}
                style={{ background: theme.flash }}
              />
            )}
          </AnimatePresence>

          <motion.p
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.35em]"
            style={{ color: theme.skip }}
            initial={{ opacity: 0 }}
            animate={{
              opacity:
                phase === "void" || phase === "exit" || phase === "boom"
                  ? 0
                  : 0.65,
            }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            Click or press Esc to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}