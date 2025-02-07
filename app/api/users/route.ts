import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role === "USER") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const searchTerm = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = searchTerm
    ? {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    include: {
      credits: {
        select: {
          balance: true,
        },
      },
    },
  });

  const total = await prisma.user.count({ where });
  const pageCount = Math.ceil(total / limit);

  return NextResponse.json(
    { success: true, users, pageCount },
    { status: 200 },
  );
}
