import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

async function getRecentActivity() {
  const recentTasks = await prisma.task.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const recentTransactions = await prisma.transaction.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return { recentTasks, recentTransactions };
}

export default async function RecentActivity() {
  const { recentTasks, recentTransactions } = await getRecentActivity();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Recent Tasks</h3>
            <ul className="mt-2 space-y-2">
              {recentTasks.map((task) => (
                <li key={task.id} className="text-sm">
                  <span className="font-medium">{task.user.name}</span> created
                  a {task.generator} task
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <ul className="mt-2 space-y-2">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="text-sm">
                  <span className="font-medium">{transaction.user.name}</span>{" "}
                  made a {transaction.currency} {transaction.amount} transaction
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
