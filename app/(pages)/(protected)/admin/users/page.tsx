import UserTable from "@/components/admin/UserTable";
import React from "react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">User Management</h1>
      <UserTable />
    </div>
  );
}
