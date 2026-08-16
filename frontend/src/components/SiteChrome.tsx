"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/common/Footer";
import Transition from "@/app/transition";
import { AuthToast } from "@/components/ui/AuthEffects";
import CinematicWelcome from "@/components/ui/CinematicWelcome";
import { RouteTransitionLoader } from "@/components/ui/CinematicLoader";
import { useAuth } from "@/context/AuthContext";

import type { HomeDesignListItem } from "@/types/home";
import type { HomeLandPackageListItem } from "@/types/land";
import type { Inclusion } from "@/lib/api/inclusions";
import type { SiteSettings } from "@/lib/api/settings";

type Props = {
  children: ReactNode;
  designs: HomeDesignListItem[];
  packages: HomeLandPackageListItem[];
  inclusions: Inclusion[];
  settings?: SiteSettings | null;
};

function AuthToasts() {
  const { authEvent, clearAuthEvent } = useAuth();
  const [localToast, setLocalToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const msg = sessionStorage.getItem("auth_toast");
      if (msg) {
        setLocalToast(msg);
        sessionStorage.removeItem("auth_toast");
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthToast
      message={authEvent?.message ?? localToast}
      onDone={() => {
        clearAuthEvent();
        setLocalToast(null);
      }}
      colors={{
        bg: "rgba(8, 32, 54, 0.97)",
        border: "rgba(248, 245, 240, 0.16)",
        text: "#F8F5F0",
      }}
    />
  );
}

/**
 * Cinematic + route loader only on the main site shell.
 * Never mount on /login — arm flag stays in sessionStorage until home mounts.
 */
function MainSiteEffects() {
  return (
    <>
      <AuthToasts />
      <CinematicWelcome logoSrc="/image/team/reyhomes.png" enableFirstVisit />
      <RouteTransitionLoader
        logoSrc="/image/team/reyhomes.png"
        minDuration={480}
        includeOnly
        includePaths={["/", "/account"]}
        excludePaths={["/login", "/register", "/forgot-password", "/admin", "/pro"]}
      />
    </>
  );
}

export default function SiteChrome({
  children,
  designs,
  packages,
  inclusions,
}: Props) {
  const pathname = usePathname() ?? "";

  const isAdmin = pathname.startsWith("/admin");
  const isPro = pathname.startsWith("/pro");
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");

  if (isAdmin || isPro) {
    return <>{children}</>;
  }

  if (isAuthPage) {
    return (
      <>
        <AuthToasts />
        {children}
      </>
    );
  }

  return (
    <>
      <MainSiteEffects />
      <Navbar designs={designs} packages={packages} inclusions={inclusions} />
      <Transition>{children}</Transition>
      <Footer />
    </>
  );
}
