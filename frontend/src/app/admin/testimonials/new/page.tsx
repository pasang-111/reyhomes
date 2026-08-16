import TestimonialForm from "@/components/admin/TestimonialForm";
export default function NewTestimonialPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-light">Add Testimonial</h1>
      <TestimonialForm mode="create" />
    </div>
  );
}
