import { LOGIN_REWARD } from "@/config/user";
import prisma from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

export async function awardFreeCreditsToUser(
  userId: string,
  freeCreditsAmount: number = LOGIN_REWARD,
) {
  try {
    // Check if the user already has a Credits record
    const existingCredits = await prisma.credits.findUnique({
      where: { userId },
    });

    if (!existingCredits) {
      // If no Credits record exists, create one with the free credits
      await prisma.credits.create({
        data: {
          userId,
          balance: freeCreditsAmount,
        },
      });

      // Create a CreditTransaction record for the free credits
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount: freeCreditsAmount,
          type: "REWARD", // or create a new type like "FREE_CREDIT" if needed
        },
      });

      console.log(`Added ${freeCreditsAmount} free credits to user ${userId}`);
    } else {
      console.log(`User ${userId} already has a Credits record`);
    }
  } catch (error) {
    console.error("Error adding free credits:", error);
  }
}

export const checkUserCreditsLeft = async (userId: string) => {
  try {
    const credits = await prisma.credits.findUnique({
      where: { userId },
    });

    if (!credits) {
      return 0;
    }

    return credits.balance;
  } catch (error) {
    console.error("Error checking credits:", error);
    return 0;
  }
};

export const updateUserCredits = async (
  userId: string,
  amount: number,
  type: TransactionType,
) => {
  try {
    const credits = await prisma.credits.findUnique({
      where: { userId },
    });

    if (!credits) {
      throw new Error(`User ${userId} does not have a Credits record`);
    }

    const addOrSubtract = type === "USAGE" ? -1 : 1;

    const newBalance = credits.balance + amount * addOrSubtract;

    await prisma.credits.update({
      where: { userId },
      data: {
        balance: newBalance,
      },
    });

    await prisma.creditTransaction.create({
      data: {
        userId,
        amount,
        type,
      },
    });

    console.log(`Updated credits for user ${userId}: ${amount}`);
    return newBalance;
  } catch (error) {
    console.error("Error updating credits:", error);
    return null;
  }
};
