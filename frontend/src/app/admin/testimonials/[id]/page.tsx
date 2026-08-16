"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TestimonialForm from "@/components/admin/TestimonialForm";
import { getTestimonial, type Testimonial } from "@/lib/api/testimonials";

export default function EditTestimonialPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [item, setItem] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTestimonial(id)
      .then((t) => {
        if (!t) setMissing(true);
        else setItem(t);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-white/40">Loading…</div>;
  if (missing || !item) return <div className="text-white/50">Testimonial not found.</div>;

  return (
    <div>
      <h1 className="mb-8 text-3xl font-light">Edit: {item.name}</h1>
      <TestimonialForm mode="edit" initial={item} />
    </div>
  );
}
