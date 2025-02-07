import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, FileText, Zap } from "lucide-react";
import prisma from "@/lib/prisma";

async function getStats() {
  const userCount = await prisma.user.count();
  const totalProcessed = await prisma.task.aggregate({
    _sum: { progress: true },
  });
  const totalTasks = await prisma.task.count();
  const completedTasks = await prisma.task.count({
    where: { status: "COMPLETED" },
  });

  return {
    userCount,
    totalProcessed: totalProcessed._sum.progress || 0,
    totalTasks,
    completedTasks,
  };
}

export default async function StatsOverview() {
  const stats = await getStats();

  const statCards = [
    {
      title: "Total Users",
      value: stats.userCount,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Files Processed",
      value: stats.totalProcessed,
      icon: CreditCard,
      color: "text-green-600",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: FileText,
      color: "text-yellow-600",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: Zap,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
