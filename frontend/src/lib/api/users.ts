import { api } from "./client";

export type AdminUserRole = "admin" | "staff" | "client" | "user";

export type AdminUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string | null;
  role: AdminUserRole;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_client: boolean;
  is_reypro: boolean;
  assigned_agent?: number | null;
  agent_name?: string | null;
  date_joined?: string;
  last_login?: string | null;
};

export type AdminUserStats = {
  total: number;
  admins: number;
  staff: number;
  clients: number;
  pro_clients: number;
  normal_users: number;
  new_last_30_days: number;
};

export type AdminUserListResponse = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: AdminUser[];
};

export async function getAdminUsers(params: {
  role?: AdminUserRole | "";
  search?: string;
  page?: number;
  page_size?: number;
} = {}): Promise<AdminUserListResponse> {
  const q = new URLSearchParams();
  if (params.role) q.set("role", params.role);
  if (params.search) q.set("search", params.search);
  if (params.page) q.set("page", String(params.page));
  if (params.page_size) q.set("page_size", String(params.page_size ?? 20));
  const qs = q.toString();
  return api.get<AdminUserListResponse>(`/admin/users/${qs ? `?${qs}` : ""}`, {
    auth: true,
  });
}

export async function getAdminUserStats(): Promise<AdminUserStats> {
  return api.get<AdminUserStats>(`/admin/users/stats/`, { auth: true });
}
