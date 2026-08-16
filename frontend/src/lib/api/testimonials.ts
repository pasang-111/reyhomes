import { api } from "./client";

export type Testimonial = {
  id: number;
  name: string;
  role?: string;
  suburb?: string;
  design?: string;
  review: string;
  rating: number;
  photo_url?: string | null;
  video_file_url?: string | null;
  video_url?: string | null;
  featured: boolean;
  published?: boolean;
};

export type TestimonialWrite = {
  name: string;
  role?: string;
  suburb?: string;
  design?: string;
  review?: string;
  rating?: number;
  video_url?: string;
  featured?: boolean;
  published?: boolean;
};

export async function getTestimonials(
  featuredOnly = false
): Promise<Testimonial[]> {
  const qs = featuredOnly ? "?featured=true" : "";
  try {
    const data = await api.get<Testimonial[] | { results: Testimonial[] }>(
      `/testimonials/${qs}`,
      { next: { revalidate: 120 } }
    );
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (err) {
    throw err;
  }
}

export async function getAdminTestimonials(): Promise<Testimonial[]> {
  try {
    const data = await api.get<Testimonial[] | { results: Testimonial[] }>(
      "/testimonials/",
      { auth: true }
    );
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (err) {
    throw err;
  }
}

export async function getTestimonial(id: number): Promise<Testimonial | null> {
  try {
    return await api.get<Testimonial>(`/testimonials/${id}/`, { auth: true });
  } catch {
    return null;
  }
}

export async function createTestimonial(
  payload: TestimonialWrite
): Promise<Testimonial> {
  return api.post<Testimonial>("/testimonials/", payload, { auth: true });
}

export async function updateTestimonial(
  id: number,
  payload: Partial<TestimonialWrite>
): Promise<Testimonial> {
  return api.patch<Testimonial>(`/testimonials/${id}/`, payload, { auth: true });
}

export async function deleteTestimonial(id: number): Promise<void> {
  await api.delete(`/testimonials/${id}/`, { auth: true });
}
