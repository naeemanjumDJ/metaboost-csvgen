/*
  Warnings:

  - You are about to drop the column `images` on the `credits` table. All the data in the column will be lost.
  - Added the required column `creditsUsed` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `generator` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Generators" AS ENUM ('ADOBESTOCK', 'SHUTTERSTOCK', 'FREEPIK', 'VECTEEZY', 'RF123', 'DREAMSTIME');

-- AlterTable
ALTER TABLE "credits" DROP COLUMN "images";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "creditsUsed" INTEGER NOT NULL,
ADD COLUMN     "generator" "Generators" NOT NULL;
