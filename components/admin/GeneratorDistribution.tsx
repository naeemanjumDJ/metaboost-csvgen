import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import prisma from "@/lib/prisma";
import DistributionChart from "./DistributionChart";

async function getGeneratorDistribution() {
  const genratorsUsed = await prisma.task.groupBy({
    by: ["generator"],
    _count: { totalFiles: true },
  });

  return genratorsUsed.map((generator) => ({
    name: generator.generator,
    value: generator._count.totalFiles,
  }));
}

export default async function GeneratorDistribution() {
  const data = await getGeneratorDistribution();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generators Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <DistributionChart data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
