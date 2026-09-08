"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Search, Users as UsersIcon } from "lucide-react";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD, TableActionLink } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPaginationFooter } from "@/components/admin/AdminPaginationFooter";
import { usePagination } from "@/lib/hooks/usePagination";
import { InlineLoader } from "@/components/ui/InlineLoader";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const json = await res.json();
    setUsers(json.data?.users ?? []);
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const { page, setPage, totalPages, paged } = usePagination(users ?? [], 10);

  useEffect(() => {
    setPage(1);
  }, [q, status, setPage]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-ink-900">Users</h1>
      </div>

      <AdminFilterBar>
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-2xl border border-ink-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40 shrink-0">
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </AdminFilterBar>

      {!users ? (
        <InlineLoader />
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" description="Try adjusting your search or filters." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Mobile</TH>
              <TH>Joined</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {paged.map((u) => (
              <TR key={u._id}>
                <TD className="font-medium">{u.name}</TD>
                <TD>{u.email}</TD>
                <TD>{u.mobile || "—"}</TD>
                <TD>{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</TD>
                <TD>
                  <Badge tone={u.status === "ACTIVE" ? "success" : "neutral"}>{u.status}</Badge>
                </TD>
                <TD>
                  <TableActionLink href={`/admin/users/${u._id}`} className="hover:text-primary-600" aria-label="View user">
                    <Eye size={15} />
                  </TableActionLink>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <AdminPaginationFooter page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
