const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

const TOKEN_KEY = "rh_admin_token";
const USER_KEY = "rh_admin_user";

export type StaffUser = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
};

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdminUser(): StaffUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StaffUser;
  } catch {
    return null;
  }
}

export function isAdminLoggedIn(): boolean {
  return Boolean(getAdminToken());
}

export function setAdminSession(token: string, user: StaffUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function staffLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/staff/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { detail?: string }).detail || "Invalid credentials or not staff."
    );
  }
  setAdminSession(data.token, data.user);
  return data as { token: string; user: StaffUser };
}

export async function staffLogout() {
  const token = getAdminToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/api/staff/auth/logout/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          Accept: "application/json",
        },
      });
    } catch {
      /* ignore network errors on logout */
    }
  }
  clearAdminSession();
}

export async function staffMe(): Promise<StaffUser | null> {
  const token = getAdminToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/api/staff/auth/me/`, {
    headers: { Authorization: `Token ${token}`, Accept: "application/json" },
  });
  if (!res.ok) {
    clearAdminSession();
    return null;
  }
  return res.json();
}
