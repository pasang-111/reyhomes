"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useWishlist, WishlistEntry } from "@/context/WishlistContext";
import LoginRequiredDialog from "@/components/auth/LoginRequiredDialog";

export const WISHLIST_ACCENT = "#D8C7A4";

export default function WishlistButton({
  entry,
  className = "",
  size = "md",
}: {
  entry: WishlistEntry;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { user, loading: authLoading } = useAuth();
  const { isSaved, toggle } = useWishlist();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const saved = isSaved(entry.kind, entry.id);

  const dims =
    size === "lg"
      ? "h-12 w-12 sm:h-14 sm:w-14"
      : size === "sm"
        ? "h-10 w-10"
        : "h-11 w-11";
  const icon = size === "lg" ? 20 : size === "sm" ? 17 : 18;

  return (
    <>
      <button
        type="button"
        disabled={busy || authLoading}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (busy) return;
          if (!user) {
            setLoginOpen(true);
            return;
          }
          if (!entry.id) return;
          setBusy(true);
          try {
            await toggle(entry);
          } finally {
            setBusy(false);
          }
        }}
        aria-pressed={saved}
        aria-label={
          !user
            ? "Log in to save to wishlist"
            : saved
              ? "Remove from wishlist"
              : "Save to wishlist"
        }
        title={!user ? "Log in to save" : saved ? "Saved" : "Add to wishlist"}
        className={`group relative inline-flex ${dims} items-center justify-center rounded-full border transition-all duration-300 disabled:opacity-60
          shadow-[0_8px_24px_rgba(0,0,0,0.35)]
          ${
            saved
              ? "border-[#D8C7A4] bg-[#D8C7A4] text-[#0A1628] scale-105"
              : "border-[#D8C7A4]/70 bg-[#0A1628]/75 text-[#D8C7A4] backdrop-blur-md hover:border-[#D8C7A4] hover:bg-[#D8C7A4]/25 hover:scale-105"
          }
          ${className}`}
      >
        <Heart
          size={icon}
          className={saved ? "text-[#0A1628]" : "text-[#D8C7A4] group-hover:text-[#E8D9B8]"}
          fill={saved ? "#0A1628" : "none"}
          stroke={saved ? "#0A1628" : "currentColor"}
          strokeWidth={2}
        />
      </button>

      <LoginRequiredDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        nextPath={pathname || "/wishlist"}
        message="Please log in to add this property to your wishlist."
      />
    </>
  );
}
