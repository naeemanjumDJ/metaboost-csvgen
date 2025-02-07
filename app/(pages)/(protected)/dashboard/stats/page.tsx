import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { auth } from "@/auth";
import { generators } from "@/config/app";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";

interface params {
  searchParams: {
    generator: string;
  };
}

const page = async ({ searchParams }: params) => {
  const session = await auth();
  const generator = searchParams.generator;

  // get all generator names from generators
  const generatorNames = generators.map((generator) => generator.title);

  // if generator is not in the list of generators
  if (generator && !generatorNames.includes(generator)) {
    return redirect("/dashboard");
  }

  // this month tasks
  const tasks = await prisma.task.aggregate({
    where: {
      userId: session?.user.id,
      ...(generator && { generator }),
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
    _sum: {
      totalFiles: true,
    },
  });

  // get last month totaFiles to compare
  const lastMonthTasks = await prisma.task.aggregate({
    where: {
      userId: session?.user.id,
      ...(generator && { generator }),
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
    _sum: {
      totalFiles: true,
    },
  });

  // total files created this month
  const totalFiles = tasks._sum.totalFiles || 0;

  // total files created last month
  const lastMonthTotalFiles = lastMonthTasks._sum.totalFiles || 0;

  // if last month total files is 0, then return 100% change to avoid division by 0 else calculate the percentage change
  const percentageChange =
    lastMonthTotalFiles === 0
      ? 100
      : ((totalFiles - lastMonthTotalFiles) / lastMonthTotalFiles) * 100;

  return (
    <>
      <h1 className="text-5xl font-semibold">Overview</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Let&apos;s see stats of your CSV creation{" "}
      </p>

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <div
          className="relative rounded-2xl bg-muted bg-cover bg-center p-5 text-white"
          style={{ backgroundImage: "url('/images/card-bg.jpg')" }}
        >
          <div className="flex items-center justify-between">
            <p>{!generator ? "Total Files" : `${generator} Files`}</p>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <p className="flex items-center gap-2 rounded-full bg-white/20 px-2 py-1 text-xs">
                  {generators.find(
                    (gen) => gen.title === searchParams.generator,
                  )?.title || "All"}
                  <ChevronDown size={16} />
                </p>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {generators.map((generator) => (
                  <DropdownMenuItem
                    defaultChecked={generator.title === searchParams.generator}
                    key={generator.id}
                    asChild
                  >
                    <Link href={`/dashboard?generator=${generator.title}`}>
                      {generator.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <h1 className="mt-8 text-4xl font-black">{totalFiles}</h1>
          <div className="mt-3 text-xs">
            <span
              className={cn(
                "rounded-full px-2 py-1 text-2xs",
                percentageChange >= 0 ? "bg-green-500" : "bg-red-500",
              )}
            >
              {percentageChange >= 0 ? "+" : "-"}
              {percentageChange.toFixed(2)}%
            </span>{" "}
            from last month
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
