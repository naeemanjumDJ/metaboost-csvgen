-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "ourKey" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "useVision" BOOLEAN NOT NULL DEFAULT false;
