/*
  Warnings:

  - Changed the type of `generator` on the `tasks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "generator",
ADD COLUMN     "generator" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Generators";
