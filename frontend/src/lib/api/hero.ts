import { api } from "./client";

export type HeroSlide = {
  id: number;
  title: string;
  subtitle: string;
  description?: string;
  button_text: string;
  button_link: string;
  image_url?: string | null;
  mobile_image_url?: string | null;
  video_url?: string | null;
  poster_url?: string | null;
  order: number;
  active: boolean;
};

export type HeroSlideWrite = {
  title: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_link?: string;
  order?: number;
  active?: boolean;
};

/** Public active slides for the homepage. */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const data = await api.get<HeroSlide[] | { results: HeroSlide[] }>(
      "/hero/",
      { next: { revalidate: 60 } }
    );
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (err) {
    throw err;
  }
}

/** All slides (including inactive) for the admin dashboard. */
export async function getAdminHeroSlides(): Promise<HeroSlide[]> {
  try {
    const data = await api.get<HeroSlide[] | { results: HeroSlide[] }>(
      "/hero-slides/",
      { auth: true }
    );
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (err) {
    throw err;
  }
}

export async function getHeroSlide(id: number): Promise<HeroSlide | null> {
  try {
    return await api.get<HeroSlide>(`/hero-slides/${id}/`, { auth: true });
  } catch {
    return null;
  }
}

export async function createHeroSlide(payload: HeroSlideWrite): Promise<HeroSlide> {
  return api.post<HeroSlide>("/hero-slides/", payload, { auth: true });
}

export async function updateHeroSlide(
  id: number,
  payload: Partial<HeroSlideWrite>
): Promise<HeroSlide> {
  return api.patch<HeroSlide>(`/hero-slides/${id}/`, payload, { auth: true });
}

export async function deleteHeroSlide(id: number): Promise<void> {
  await api.delete(`/hero-slides/${id}/`, { auth: true });
}
