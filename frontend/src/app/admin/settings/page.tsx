import SettingsForm from "@/components/admin/SettingsForm";
import { getSiteSettings } from "@/lib/api/settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  const initial = settings || {
    company_name: "ReyHomes",
    phone: "",
    email: "",
    address: "",
    instagram: "",
    facebook: "",
    youtube: "",
    linkedin: "",
  };
  return (
    <div>
      <h1 className="mb-2 text-3xl font-light">Site settings</h1>
      <p className="mb-8 text-sm text-white/50">Company details and social links used across the site.</p>
      <SettingsForm initial={initial} />
    </div>
  );
}
