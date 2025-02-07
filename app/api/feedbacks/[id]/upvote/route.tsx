import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {

  
  const feedbackId = params.id;
  const session = await auth();

  const userId = session?.user.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!feedbackId) {
    return NextResponse.json({ error: "Missing feedback id" }, { status: 400 });
  }

  try {
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        feedbackId_userId: {
          feedbackId,
          userId,
        },
      },
    });

    let upvoteCount;
    let hasUserUpvoted;

    if (existingUpvote) {
      // Remove upvote
      await prisma.upvote.delete({
        where: {
          feedbackId_userId: {
            feedbackId,
            userId,
          },
        },
      });
      hasUserUpvoted = false;
    } else {
      // Add upvote
      await prisma.upvote.create({
        data: {
          feedbackId,
          userId,
        },
      });
      hasUserUpvoted = true;
    }

    // Get the updated upvote count
    upvoteCount = await prisma.upvote.count({
      where: { feedbackId },
    });

    return NextResponse.json({ upvoteCount, hasUserUpvoted });
  } catch (error) {
    console.error("Failed to toggle upvote:", error);
    return NextResponse.json(
      { error: "Failed to toggle upvote" },
      { status: 500 },
    );
  }
}
