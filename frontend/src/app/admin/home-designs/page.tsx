import Link from "next/link";
import { getDesigns } from "@/lib/api/designs";
export default async function Page() {
  const designs = await getDesigns();
  return (
    <div>
      <div className="flex justify-between gap-4">
        <h1 className="text-3xl font-light">Home Designs</h1>
        <Link href="/admin/home-designs/new" className="rounded-lg bg-[#8C1D2C] px-5 py-2.5 text-sm text-white">+ Add design</Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase text-white/40"><tr>
            <th className="px-4 py-3">Name</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Price</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {designs.map((d) => (
              <tr key={d.id} className="border-b border-white/5">
                <td className="px-4 py-3">{d.name}</td>
                <td className="px-4 py-3 text-white/50">{d.slug}</td>
                <td className="px-4 py-3">{d.price}</td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/home-designs/${d.slug}`} className="text-[#8C1D2C]">Edit</Link></td>
              </tr>
            ))}
            {designs.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-white/40">No designs yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
