import React from "react";
import TasksTable from "@/components/admin/TasksTable";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Tasks</h1>
      <TasksTable />
    </div>
  );
}
