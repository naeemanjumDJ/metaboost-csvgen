import { CREDITS_PER_FILE_WITH_USER_VISION_API } from "@/config/api";
import { NextRequest, NextResponse } from "next/server";
import { generators } from "@/config/app";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import axios from "axios";
import {
  CREDITS_PER_FILE_WITH_OUR_API,
  CREDITS_PER_FILE_WITH_USER_API,
  CREDITS_PER_FILE_WITH_VISION_API,
} from "@/config/api";
import { checkApiKeyValidity, getUserApiConfig } from "@/lib/utils";
import { AiApi, User } from "@prisma/client";
import { processTask } from "@/utils/processing/processTask";

export async function POST(req: NextRequest) {
  const { files, generatorId, numKeywords, titleChars } = await req.json();
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { success: false, msg: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!files?.length) {
    return NextResponse.json(
      { success: false, msg: "No files provided" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, msg: "User not found" },
        { status: 404 },
      );
    }

    const { apiKey, apiType, ourApi } = await getUserApiConfig(user);
    const useVision = user.useAiVision;

    // Calculate required credits
    const creditsPerFile = ourApi
      ? useVision
        ? CREDITS_PER_FILE_WITH_VISION_API
        : CREDITS_PER_FILE_WITH_OUR_API
      : useVision
      ? CREDITS_PER_FILE_WITH_USER_VISION_API
      : CREDITS_PER_FILE_WITH_USER_API;

    const totalRequiredCredits = files.length * creditsPerFile;

    // Check if user has enough credits
    if (!user.credits || user.credits.balance < totalRequiredCredits) {
      return NextResponse.json(
        {
          success: false,
          msg: "Insufficient credits, buy now to keep generating",
        },
        { status: 402 },
      );
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        totalFiles: files.length,
        generator: "FREEPIK",
        creditsUsed: 0,
        ourKey: ourApi,
        useVision,
      },
    });

    // Create escrow record and transfer credits
    await prisma.credits.update({
      where: { userId: user.id },
      data: {
        balance: { decrement: totalRequiredCredits },
      },
    });

    await prisma.escrow.create({
      data: {
        userId: user.id,
        taskId: task.id,
        amount: totalRequiredCredits,
      },
    });

    // Start processing task
    processTask(
      task.id,
      files,
      generatorId,
      numKeywords,
      titleChars,
      user.id,
      apiKey,
      apiType,
      ourApi,
      useVision
    ).catch((error) => console.error("Error processing task:", error));

    return NextResponse.json(
      { success: true, taskId: task.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, msg: "Internal server error" },
      { status: 500 },
    );
  }
}
