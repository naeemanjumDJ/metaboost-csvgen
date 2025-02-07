"use client";

import React from "react";
import TasksTable from "@/components/admin/TasksTable";

const TasksPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-5xl font-semibold">Tasks</h1>
      <TasksTable isAdmin={false} />
    </div>
  );
};

export default TasksPage as unknown as typeof TasksPage;
