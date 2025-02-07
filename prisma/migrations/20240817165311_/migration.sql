-- CreateEnum
CREATE TYPE "Api" AS ENUM ('OPENAI', 'GEMINI');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "geminiApiKey" TEXT,
ADD COLUMN     "openAiApiKey" TEXT,
ADD COLUMN     "preferredApi" TEXT DEFAULT 'OPENAI';
