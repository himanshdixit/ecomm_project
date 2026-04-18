"use client";

import { useMemo, useState } from "react";
import { FaUsers } from "react-icons/fa";

import AdminMiniStat from "@/components/admin/AdminMiniStat";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSectionCard from "@/components/admin/AdminSectionCard";
import AdminTable from "@/components/admin/AdminTable";
import {
  adminBadgeClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/adminStyles";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/api";

const sortUsers = (items) => [...items].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

export default function AdminUsersClient({ initialUsers = [], currentAdminId }) {
  const [users, setUsers] = useState(sortUsers(initialUsers));
  const [roleDrafts, setRoleDrafts] = useState(() => Object.fromEntries(initialUsers.map((user) => [user.id, user.role])));
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [pendingUserId, setPendingUserId] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (!query) {
        return true;
      }

      const normalizedQuery = query.toLowerCase();
      return user.name.toLowerCase().includes(normalizedQuery) || user.email.toLowerCase().includes(normalizedQuery);
    });
  }, [users, query]);

  const adminCount = users.filter((user) => user.role === "admin").length;
  const shopperCount = users.filter((user) => user.role === "user").length;
  const joinedThisMonth = users.filter((user) => {
    const createdAt = new Date(user.createdAt);
    const now = new Date();

    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length;

  const updateRole = async (userId) => {
    const nextRole = roleDrafts[userId];
    setPendingUserId(userId);
    setFeedback(null);

    try {
      const user = await adminService.updateUserRole(userId, nextRole);

      setUsers((currentUsers) => sortUsers(currentUsers.map((item) => (item.id === user.id ? user : item))));
      setRoleDrafts((currentDrafts) => ({ ...currentDrafts, [user.id]: user.role }));
      setFeedback({ type: "success", message: `Updated ${user.name}'s role to ${user.role}.` });
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Unable to update this user role right now.") });
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Access control"
        title="Manage users"
        description="Review accounts, promote teammates, and keep admin access tightly controlled with better mobile handling."
        action={
          <div className={adminPrimaryButtonClass}>
            <FaUsers className="h-4 w-4" />
            {users.length} users
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMiniStat label="Users" value={users.length.toLocaleString("en-IN")} helper={`${filteredUsers.length} in current view`} tone="emerald" />
        <AdminMiniStat label="Admins" value={adminCount.toLocaleString("en-IN")} helper="Privileged team members" tone="violet" />
        <AdminMiniStat label="Shoppers" value={shopperCount.toLocaleString("en-IN")} helper="Customer accounts" tone="blue" />
        <AdminMiniStat label="Joined this month" value={joinedThisMonth.toLocaleString("en-IN")} helper="Fresh sign-ups" tone="amber" />
      </div>

      <AdminSectionCard
        title="User directory"
        description="Only admins can change roles. The current signed-in admin cannot demote themselves from this panel."
        action={
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={`${adminInputClass} md:w-[18rem]`}
            placeholder="Search users"
          />
        }
      >
        {feedback ? (
          <div
            className={cn(
              "mb-4 rounded-[1.2rem] px-4 py-3 text-sm font-medium",
              feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            )}
          >
            {feedback.message}
          </div>
        ) : null}

        <AdminTable
          minWidthClassName="min-w-[820px]"
          columns={[
            { key: "user", label: "User" },
            { key: "joined", label: "Joined" },
            { key: "currentRole", label: "Current role" },
            { key: "access", label: "Access control" },
          ]}
          emptyMessage="No users found."
        >
          {filteredUsers.length
            ? filteredUsers.map((user) => {
                const isCurrentAdmin = user.id === currentAdminId;
                const nextRole = roleDrafts[user.id] || user.role;

                return (
                  <tr key={user.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-4 first:pl-5 last:pr-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-gradient-to-br from-slate-950 to-slate-700 text-sm font-black text-white">
                          {user.name?.slice(0, 2)?.toUpperCase() || "US"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-950">{user.name}</p>
                          <p className="truncate text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 first:pl-5 last:pr-5 text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-4 first:pl-5 last:pr-5">
                      <span className={cn(adminBadgeClass, user.role === "admin" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-700")}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 first:pl-5 last:pr-5">
                      <div className="flex min-w-[260px] flex-col gap-3 lg:flex-row lg:items-center">
                        <select
                          value={nextRole}
                          disabled={isCurrentAdmin}
                          onChange={(event) => setRoleDrafts((currentDrafts) => ({ ...currentDrafts, [user.id]: event.target.value }))}
                          className={`${adminInputClass} lg:w-[10rem]`}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                        <button
                          type="button"
                          disabled={isCurrentAdmin || pendingUserId === user.id || nextRole === user.role}
                          onClick={() => updateRole(user.id)}
                          className={isCurrentAdmin ? adminSecondaryButtonClass : adminPrimaryButtonClass}
                        >
                          {isCurrentAdmin ? "Current admin" : pendingUserId === user.id ? "Updating..." : "Update role"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            : null}
        </AdminTable>
      </AdminSectionCard>
    </div>
  );
}
