import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FeedbackStatus, FeedbackType } from "@prisma/client";
import { auth } from "@/auth";

export async function GET(request: Request) {

  


  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 9; // 3x3 grid
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") as FeedbackType | "ALL";
  const status = searchParams.get("status") as FeedbackStatus | "ALL";

  const skip = (page - 1) * limit;

  const where = {};

  const session = await auth();

  const userId = session?.user.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("feedbacks");
  try {
    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { name: true } },
          _count: { select: { upvotes: true } },
          upvotes: {
            where: { userId },
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.feedback.count({ where }),
    ]);
console.log("feedbacks2");
    const formattedFeedbacks = feedbacks.map((feedback) => ({
      ...feedback,
      hasUserUpvoted: feedback.upvotes.length > 0,
      upvotes: undefined, // Remove the upvotes array from the response
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ feedbacks: formattedFeedbacks, totalPages });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch feedbacks" },
      { status: 500 },
    );
  }
}
