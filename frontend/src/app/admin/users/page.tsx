"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAdminUsers,
  getAdminUserStats,
  type AdminUser,
  type AdminUserRole,
  type AdminUserStats,
} from "@/lib/api/users";
import { api, ApiError } from "@/lib/api/client";

const TABS: { id: AdminUserRole | ""; label: string; hint: string }[] = [
  { id: "", label: "All", hint: "Every account" },
  { id: "admin", label: "Administrators", hint: "Superusers" },
  { id: "staff", label: "Staff", hint: "Staff, not superuser" },
  { id: "client", label: "Clients", hint: "Approved clients" },
  { id: "user", label: "Registered users", hint: "Not yet clients" },
];

type Agent = { id: number; name: string };

export default function AdminUsersPage() {
  const [role, setRole] = useState<AdminUserRole | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [count, setCount] = useState(0);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, st] = await Promise.all([
        getAdminUsers({ role, search, page, page_size: 20 }),
        getAdminUserStats(),
      ]);
      setUsers(list.results || []);
      setCount(list.count || 0);
      setStats(st);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [role, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api
      .get<Agent[]>("/admin/agents/", { auth: true })
      .then(setAgents)
      .catch(() =>
        api
          .get<Agent[]>("/pro/admin/agents/", { auth: true })
          .then(setAgents)
          .catch(() => setAgents([]))
      );
  }, []);

  async function patchClient(userId: number, body: Record<string, unknown>) {
    setSaving(userId);
    setError("");
    try {
      await api.patch(`/pro/admin/clients/${userId}/`, body, { auth: true });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setSaving(null);
    }
  }

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[.35em] text-white/30">
            Users & access
          </p>
          <h1 className="mt-2 text-3xl font-light">All accounts</h1>
          <p className="mt-2 max-w-xl text-sm text-white/45">
            Four levels only: Administrator, Staff, Client, and Registered user.
            ReyHomes Pro is a separate flag that can only be enabled for Clients.
          </p>
        </div>
      </div>

      {stats ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Total", stats.total],
            ["Admins", stats.admins],
            ["Staff", stats.staff],
            ["Clients", stats.clients],
            ["Pro", stats.pro_clients],
            ["Registered", stats.normal_users],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3"
            >
              <p className="text-[10px] uppercase tracking-wider text-white/35">
                {label}
              </p>
              <p className="mt-1 text-2xl font-light text-white">{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id || "all"}
            type="button"
            onClick={() => {
              setRole(tab.id);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-xs transition ${
              role === tab.id
                ? "bg-[#D8C7A4] text-[#0A1628]"
                : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
            }`}
            title={tab.hint}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search name or email…"
          className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-[#111820] px-4 py-2.5 text-sm text-white placeholder:text-white/30"
        />
        <button
          type="button"
          onClick={() => load()}
          className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/5"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[.02] text-[10px] uppercase tracking-wider text-white/35">
            <tr>
              <th className="px-5 py-4">Account</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Client</th>
              <th className="px-5 py-4">Agent</th>
              <th className="px-5 py-4">ReyPro</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-white/40">
                  Loading users…
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{u.full_name}</div>
                    <div className="mt-1 text-xs text-white/40">{u.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs capitalize text-white/70">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {u.role === "admin" || u.role === "staff" ? (
                      <span className="text-xs text-white/30">—</span>
                    ) : (
                      <button
                        type="button"
                        disabled={saving === u.id}
                        onClick={() =>
                          patchClient(u.id, { is_client: !u.is_client })
                        }
                        className={`rounded-full px-3 py-1.5 text-xs ${
                          u.is_client
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-white/5 text-white/40"
                        }`}
                      >
                        {u.is_client ? "Client" : "Normal user"}
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {u.is_client ? (
                      <select
                        value={u.assigned_agent ?? ""}
                        disabled={saving === u.id}
                        onChange={(e) =>
                          patchClient(u.id, {
                            assigned_agent: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-[#111820] px-3 py-2 text-xs text-white"
                      >
                        <option value="">Unassigned</option>
                        {agents.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-white/30">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {u.is_client ? (
                      <button
                        type="button"
                        disabled={saving === u.id}
                        onClick={() =>
                          patchClient(u.id, { is_reypro: !u.is_reypro })
                        }
                        className={`rounded-full px-4 py-2 text-xs font-medium ${
                          u.is_reypro
                            ? "bg-[#D8C7A4] text-[#0A1628]"
                            : "border border-white/10 bg-white/5 text-white/50"
                        }`}
                      >
                        {u.is_reypro ? "Enabled" : "Enable Pro"}
                      </button>
                    ) : (
                      <span className="text-xs text-white/30">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
            {!loading && !users.length ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-white/40">
                  No accounts in this view.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/45">
        <span>
          {count} account{count === 1 ? "" : "s"}
          {stats ? ` · ${stats.new_last_30_days} new in last 30 days` : ""}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-30"
          >
            Previous
          </button>
          <span className="px-2 py-1.5">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
