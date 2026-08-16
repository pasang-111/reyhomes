"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Trash2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import EmptyWishlist from "@/components/home/wishlist/EmptyWishlist";
import LoginRequiredDialog from "@/components/auth/LoginRequiredDialog";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, remove, loading, count } = useWishlist();
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setLoginOpen(true);
    }
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <main className="min-h-[70vh] bg-[#07080a] px-5 py-24 text-center text-white/50">
        Loading…
      </main>
    );
  }

  if (!user) {
    return (
      <main className="relative min-h-[70vh] bg-[#07080a] px-5 py-24">
        <div className="mx-auto max-w-lg rounded-[28px] border border-white/10 bg-white/[0.03] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D8C7A4]/35 bg-[#D8C7A4]/10">
            <Heart size={24} className="text-[#D8C7A4]" />
          </div>
          <h1 className="mt-6 font-display text-3xl text-[#F5F0E6]">Wishlist</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Please log in to view and manage your saved homes and land packages.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?next=/wishlist"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#E8EAED] via-[#C8CCD4] to-[#9CA3AF] px-7 py-3.5 text-sm font-semibold text-[#0A1628]"
            >
              Log in
            </Link>
            <Link
              href="/register?next=/wishlist"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-sm text-white/80"
            >
              Create account
            </Link>
          </div>
        </div>
        <LoginRequiredDialog
          open={loginOpen}
          onClose={() => {
            setLoginOpen(false);
            router.push("/");
          }}
          nextPath="/wishlist"
          message="Please log in to view your wishlist."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07080a] text-[#F5F0E6]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[#D8C7A4]">Saved</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">My Wishlist</h1>
        <p className="mt-3 text-sm text-white/50">
          {count} saved {count === 1 ? "property" : "properties"}
        </p>

        {loading ? (
          <p className="mt-16 text-white/40">Loading your saves…</p>
        ) : items.length === 0 ? (
          <div className="mt-16">
            <EmptyWishlist />
          </div>
        ) : (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const href =
                item.kind === "design"
                  ? `/home-designs/${item.slug}`
                  : `/home-land/${item.slug}`;
              return (
                <li
                  key={`${item.kind}-${item.id}`}
                  className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]"
                >
                  <Link href={href} className="block">
                    <div className="relative aspect-[4/3]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-105"
                          sizes="(max-width:768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#0A1628]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-12">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#D8C7A4]">
                          {item.kind === "design" ? "Home design" : "Home & land"}
                        </p>
                        <h2 className="mt-1 font-display text-xl">{item.name}</h2>
                        {item.price && (
                          <p className="mt-1 text-sm text-white/70">{item.price}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    aria-label="Remove from wishlist"
                    onClick={() => remove(item)}
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 backdrop-blur transition hover:border-red-400/50 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
