/**
 * Root layout — fonts load via CSS (no next/font/google) so CI/Vercel builds
 * do not depend on fonts.gstatic.com at compile time.
 */
import type { Metadata } from "next";
import "./globals.css";

import LuxuryCursor from "@/components/common/LuxuryCursor";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";
import SiteChrome from "@/components/SiteChrome";

import { getDesigns } from "@/lib/api/designs";
import { getPackages } from "@/lib/api/packages";
import { getInclusions } from "@/lib/api/inclusions";
import { getSiteSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "ReyHomes | Luxury Homes & Land",
  description: "Bespoke house & land packages and luxury residences.",
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Tolerate a sleeping/unreachable backend so CI build and cold starts do not 500 the whole site
  const [designs, packages, inclusions, settings] = await Promise.all([
    getDesigns().catch(() => []),
    getPackages().catch(() => []),
    getInclusions().catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  return (
    <html lang="en" className="font-sans" suppressHydrationWarning>
      <head>
        {/* Browser-only font load — does not run during next build / CI */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('reyhomes_theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);document.documentElement.classList.add(t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
          }}
        />
      </head>
      <body className="bg-[var(--theme-bg,#07080a)] text-[var(--theme-fg,#fbf7e6)] antialiased overflow-x-hidden font-sans">
        <LuxuryCursor />
        <ThemeProvider>
          <AuthProvider>
            <WishlistProvider>
              <SiteChrome
                designs={designs}
                packages={packages}
                inclusions={inclusions}
                settings={settings}
              >
                {children}
              </SiteChrome>
            </WishlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
