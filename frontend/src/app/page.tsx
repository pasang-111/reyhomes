import { getHeroSlides } from "@/lib/api/hero";
import { getDesigns } from "@/lib/api/designs";
import { getPackages } from "@/lib/api/packages";
import { getInclusions } from "@/lib/api/inclusions";
import { getTestimonials } from "@/lib/api/testimonials";
import { getProjects } from "@/lib/api/projects";

import HeroCarousel from "@/components/home/hero/HeroCarousel";
import FeaturedDesigns from "@/components/home/section/FeaturedDesigns";
import HomeLandPackages from "@/components/home/section/HomeLandPackages";
import InclusionsPreview from "@/components/home/section/InclusionsPreview";
import VideoCarousel from "@/components/home/section/VideoCarousel";
import Stats from "@/components/home/section/Stats";
import Testimonials from "@/components/home/section/Testimonials";
import UpcomingProjectsPreview from "@/components/home/section/UpcomingProjectsPreview";

export default async function HomePage() {
  const [
    heroSlides,
    designs,
    packages,
    inclusions,
    testimonials,
    upcomingProjects,
  ] = await Promise.all([
    getHeroSlides().catch(() => []),
    getDesigns().catch(() => []),
    getPackages().catch(() => []),
    getInclusions().catch(() => []),
    getTestimonials().catch(() => []),
    getProjects({ status: "upcoming" }).catch(() => []),
  ]);

  return (
    <>
      <HeroCarousel
        slides={heroSlides ?? []}
        designs={designs ?? []}
        packages={packages ?? []}
      />

      <FeaturedDesigns designs={designs ?? []} />

      <HomeLandPackages packages={packages ?? []} />

      <InclusionsPreview inclusions={inclusions ?? []} />

      <UpcomingProjectsPreview projects={upcomingProjects ?? []} />

      <VideoCarousel testimonials={testimonials ?? []} />

      <Stats />

      <Testimonials testimonials={testimonials ?? []} />
    </>
  );
}