"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";
import { wishlistApi } from "@/lib/api/wishlist";

export type WishlistEntry = {
  wishlistId?: number;
  kind: "design" | "land";
  id: number;
  slug: string;
  name: string;
  image: string;
  price: string;
};

type WishlistContextValue = {
  items: WishlistEntry[];
  count: number;
  isSaved: (kind: "design" | "land", id: number) => boolean;
  toggle: (entry: WishlistEntry) => Promise<void>;
  remove: (entry: WishlistEntry) => Promise<void>;
  loading: boolean;
  /** Guests must log in — use with LoginRequiredDialog */
  requiresAuth: boolean;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    wishlistApi
      .list()
      .then((data: unknown) => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        const mapped: WishlistEntry[] = rows
          .map((w: any) => {
            if (w.home_design) {
              return {
                wishlistId: w.id,
                kind: "design" as const,
                id: w.home_design.id,
                slug: w.home_design.slug,
                name: w.home_design.name || w.home_design.title || "",
                image: w.home_design.hero_image_url || w.home_design.image || "",
                price: w.home_design.price || "",
              };
            }
            if (w.land_package) {
              return {
                wishlistId: w.id,
                kind: "land" as const,
                id: w.land_package.id,
                slug: w.land_package.slug,
                name: w.land_package.title || "",
                image:
                  w.land_package.hero_image_url ||
                  w.land_package.image ||
                  "",
                price: w.land_package.price || "",
              };
            }
            return null;
          })
          .filter(Boolean) as WishlistEntry[];
        setItems(mapped);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isSaved = useCallback(
    (kind: "design" | "land", id: number) =>
      items.some((i) => i.kind === kind && i.id === id),
    [items]
  );

  const remove = useCallback(
    async (entry: WishlistEntry) => {
      if (!user) return;
      const wid =
        entry.wishlistId ??
        items.find((i) => i.kind === entry.kind && i.id === entry.id)?.wishlistId;
      if (wid) {
        try {
          await wishlistApi.remove(wid);
        } catch {
          /* still drop locally */
        }
      }
      setItems((prev) =>
        prev.filter((i) => !(i.kind === entry.kind && i.id === entry.id))
      );
    },
    [items, user]
  );

  const toggle = useCallback(
    async (entry: WishlistEntry) => {
      if (!user) {
        throw new Error("LOGIN_REQUIRED");
      }
      const already = items.find(
        (i) => i.kind === entry.kind && i.id === entry.id
      );
      if (already) {
        await remove(already);
        return;
      }
      const created: any =
        entry.kind === "design"
          ? await wishlistApi.addDesign(entry.id)
          : await wishlistApi.addLand(entry.id);
      setItems((prev) => [
        { ...entry, wishlistId: created?.id ?? created?.pk },
        ...prev,
      ]);
    },
    [items, user, remove]
  );

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isSaved,
      toggle,
      remove,
      loading,
      requiresAuth: !user,
    }),
    [items, isSaved, toggle, remove, loading, user]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
