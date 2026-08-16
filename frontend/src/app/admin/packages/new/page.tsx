import PackageForm from "@/components/admin/PackageForm";

export default function Page() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-light">Add Home & Land Package</h1>
      <PackageForm mode="create" />
    </div>
  );
}
