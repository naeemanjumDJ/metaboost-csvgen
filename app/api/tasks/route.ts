import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const isAdmin = searchParams.get("isAdmin") === "true";
  const skip = (page - 1) * limit;

  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { success: false, msg: "Unauthorized" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, msg: "Unauthorized" },
      { status: 401 },
    );
  }
  let tasks = [];
  let total = 0;
  // if not isadmin only show tasks for the user else check if user role is admin
  if (!isAdmin || (isAdmin && user.role === "USER")) {
    const [userTasks, userTotal] = await prisma.$transaction([
      prisma.task.findMany({
        where: { userId: user.id },
        skip,
        take: limit,
        include: { user: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.count({ where: { userId: user.id } }),
    ]);
    tasks = userTasks;
    total = userTotal;
  } else {
    const [totalTasks, allTotal] = await prisma.$transaction([
      prisma.task.findMany({
        skip,
        take: limit,
        include: { user: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.count(),
    ]);
    tasks = totalTasks;
    total = allTotal;
  }
  const pageCount = Math.ceil(total / limit);
  return NextResponse.json(
    {
      success: true,
      tasks,
      pageCount,
    },
    { status: 200 },
  );
}
