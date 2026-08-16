import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDesigns, getDesignBySlug } from "@/lib/api/designs";

import HomeHero from "@/components/home/details/HomeHero";
import HomeGallery from "@/components/home/details/HomeGallery";
import HomeFeatures from "@/components/home/details/HomeFeatures";
import HomeSpecs from "@/components/home/details/HomeSpecs";
import HomeInclusions from "@/components/home/details/HomeInclusions";
import FloorPlan from "@/components/home/details/FloorPlan";
import RelatedHomes from "@/components/home/details/RelatedHomes";
import EnquiryCTA from "@/components/home/details/EnquiryCTA";

type Params = { slug: string };

export async function generateStaticParams() {
  const designs = await getDesigns();
  return designs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const home = await getDesignBySlug(slug);

  if (!home) {
    return { title: "Home Design Not Found" };
  }

  const description =
    home.description ??
    `Explore the ${home.name} home design featuring ${home.beds} bedrooms, ${home.baths} bathrooms and ${home.garage} car garage.`;

  const image = home.hero_image_url ?? home.image ?? undefined;

  return {
    title: `${home.name} | Home Designs`,
    description,
    openGraph: {
      title: home.name,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function HomeDesignDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const [home, designs] = await Promise.all([
    getDesignBySlug(slug),
    getDesigns(),
  ]);

  if (!home) {
    notFound();
  }

  return (
    <>
      <HomeHero home={home} />
      <HomeGallery home={home} />
      <HomeFeatures home={home} />
      <HomeSpecs home={home} />
      <HomeInclusions home={home} />
      <FloorPlan home={home} />
      <RelatedHomes home={home} designs={designs} />
      <EnquiryCTA />
    </>
  );
}
