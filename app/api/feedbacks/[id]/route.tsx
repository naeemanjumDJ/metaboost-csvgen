import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { FeedbackStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
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

  const id = params.id;
  const data = await request.json();

  if (!id) {
    return NextResponse.json(
      { success: false, msg: "Missing feedback id" },
      { status: 400 },
    );
  }

  try {
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        status: data.status as FeedbackStatus,
        // You can add more fields to update here if needed
      },
    });

    return NextResponse.json(
      { success: true, feedback: updatedFeedback },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to update feedback:", error);
    return NextResponse.json(
      { success: false, msg: "Failed to update feedback" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

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

  if (!id) {
    return NextResponse.json(
      { success: false, msg: "Missing feedback id" },
      { status: 400 },
    );
  }

  try {
    await prisma.feedback.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete feedback:", error);
    return NextResponse.json(
      { success: false, msg: "Failed to delete feedback" },
      { status: 500 },
    );
  }
}
