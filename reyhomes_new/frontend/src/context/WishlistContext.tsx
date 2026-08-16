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
  wishlistId?: number; // Django WishlistItem id, once synced
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
};

const STORAGE_KEY = "sl_wishlist_local";
const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function readLocal(): WishlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WishlistEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: WishlistEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Guests: local storage. Logged in: hydrate from Django.
  useEffect(() => {
    if (!user) {
      setItems(readLocal());
      return;
    }
    setLoading(true);
    wishlistApi
      .list()
      .then((data: any) => {
        const results = Array.isArray(data) ? data : data.results ?? [];
        const mapped: WishlistEntry[] = results.map((w: any) => {
          if (w.home_design) {
            return {
              wishlistId: w.id,
              kind: "design" as const,
              id: w.home_design.id,
              slug: w.home_design.slug,
              name: w.home_design.name,
              image: w.home_design.image,
              price: w.home_design.price,
            };
          }
          return {
            wishlistId: w.id,
            kind: "land" as const,
            id: w.land_package.id,
            slug: w.land_package.slug,
            name: w.land_package.title,
            image: w.land_package.image,
            price: w.land_package.price,
          };
        });
        setItems(mapped);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  const persistLocal = useCallback(
    (next: WishlistEntry[]) => {
      setItems(next);
      if (!user) writeLocal(next);
    },
    [user]
  );

  const isSaved = useCallback(
    (kind: "design" | "land", id: number) => items.some((i) => i.kind === kind && i.id === id),
    [items]
  );

  const toggle = useCallback(
    async (entry: WishlistEntry) => {
      const already = items.find((i) => i.kind === entry.kind && i.id === entry.id);

      if (already) {
        await remove(already);
        return;
      }

      if (!user) {
        persistLocal([entry, ...items]);
        return;
      }

      const created: any =
        entry.kind === "design"
          ? await wishlistApi.addDesign(entry.id)
          : await wishlistApi.addLand(entry.id);
      persistLocal([{ ...entry, wishlistId: created.id }, ...items]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, user]
  );

  const remove = useCallback(
    async (entry: WishlistEntry) => {
      if (user && entry.wishlistId) {
        await wishlistApi.remove(entry.wishlistId);
      }
      persistLocal(items.filter((i) => !(i.kind === entry.kind && i.id === entry.id)));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, user]
  );

  const value = useMemo(
    () => ({ items, count: items.length, isSaved, toggle, remove, loading }),
    [items, isSaved, toggle, remove, loading]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
