import React from "react";
import prisma from "@/lib/prisma";
import StatsOverview from "@/components/admin/StatsOverview";
import RecentActivity from "@/components/admin/RecentActivity";
import GeneratorDistribution from "@/components/admin/GeneratorDistribution";
const page = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
      <StatsOverview />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <RecentActivity />
        <GeneratorDistribution />
      </div>
    </div>
  );
};

export default page;
