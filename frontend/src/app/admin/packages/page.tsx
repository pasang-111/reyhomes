import Link from "next/link";
import { getPackages } from "@/lib/api/packages";
import { safeList } from "@/lib/api/safe";
import ApiErrorBanner from "@/components/common/ApiErrorBanner";

export default async function AdminPackagesPage() {
  const { data: packages, error } = await safeList(() => getPackages());

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-light">Home & Land Packages</h1>
        <Link
          href="/admin/packages/new"
          className="rounded-lg bg-[#8C1D2C] px-5 py-2.5 text-sm text-white"
        >
          + Add package
        </Link>
      </div>
      <ApiErrorBanner message={error} className="mt-4" />
      <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase text-white/40">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3 text-white/50">{p.slug}</td>
                <td className="px-4 py-3">{p.price}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/packages/${p.slug}`}
                    className="text-[#8C1D2C]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {packages.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-white/40">
                  No packages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
