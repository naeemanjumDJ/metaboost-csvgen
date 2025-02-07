import { PrismaClient } from "@prisma/client";
import { ExtendedFile, Generator } from "@/types";
import { getMetadadataByFilename, getMetadadataByImage } from "./apiUtils";
import {
  CREDITS_PER_FILE_WITH_OUR_API,
  CREDITS_PER_FILE_WITH_USER_API,
  CREDITS_PER_FILE_WITH_USER_VISION_API,
  CREDITS_PER_FILE_WITH_VISION_API,
} from "@/config/api";
import { generators } from "@/config/app";
import { generatePrompt } from "./promptUtils";

const prisma = new PrismaClient();

export async function processTask(
  taskId: string,
  files: {
    id: string;
    title: string;
    base64?: string;
  }[],
  generatorId: number,
  numKeywords: number,
  titleChars: number,
  userId: string,
  apiKey: string,
  apiType: "OPENAI" | "GEMINI",
  ourApi: boolean,
  useVision: boolean
) {
  try {
    const creditsEscrow = await prisma.escrow.findFirst({
      where: { taskId },
    });

    if (!creditsEscrow) {
      throw new Error("No credits escrow found");
    }

    const generator = generators.find((g) => g.id === generatorId);
    if (!generator) {
      throw new Error("Invalid generator ID");
    }

    let results: any[] = [];
    let processedImages = 0;
    let failedImages = 0;

    const processSingleFile = async (file: any, retryCount = 0) => {
      try {
        const prompt = generatePrompt(generator, numKeywords, titleChars);
        let result;
        if (useVision && file.base64) {
          result = await getMetadadataByImage({
            base64: file.base64,
            [apiType === "OPENAI" ? "openAiApiKey" : "geminiApiKey"]: apiKey,
            metadataPrompt: prompt,
          });
        } else {
          result = await getMetadadataByFilename({
            filename: file.title,
            [apiType === "OPENAI" ? "openAiApiKey" : "geminiApiKey"]: apiKey,
            metadataPrompt: prompt,
          });
        }
        if (!result.success) {
          throw new Error(result.msg);
        }
        processedImages++;
        const processedMetadata = processMetadata(result.data, file, generator);
        results.push({
          id: file.id,
          metadata: { ...processedMetadata, status: true },
        });
      } catch (error) {
        console.log("Error processing file:", file.title, error);

        if (retryCount < 2) {
          await processSingleFile(file, retryCount + 1);
        } else {
          failedImages++;
          results.push({
            id: file.id,
            metadata: { status: false },
          });
        }
      }

      await prisma.task.update({
        where: { id: taskId },
        data: {
          progress: processedImages,
          result: results,
          status:
            processedImages + failedImages === files.length
              ? "COMPLETED"
              : "PROCESSING",
        },
      });
    };

    try {
      if (apiType === "GEMINI") {
        const delay = 4000;
        for (let i = 0; i < files.length; i++) {
          await processSingleFile(files[i]);
          if (i < files.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      } else {
        await Promise.all(files.map((file) => processSingleFile(file)));
      }

      const creditsUsed =
        processedImages *
        (ourApi
          ? useVision
            ? CREDITS_PER_FILE_WITH_VISION_API
            : CREDITS_PER_FILE_WITH_OUR_API
          : useVision
          ? CREDITS_PER_FILE_WITH_USER_VISION_API
          : CREDITS_PER_FILE_WITH_USER_API);

      await prisma.escrow.delete({
        where: {
          id: creditsEscrow.id,
        },
      });

      if (failedImages !== 0) {
        const creditsToAddBack = creditsEscrow.amount - creditsUsed;
        await prisma.credits.update({
          where: { userId },
          data: {
            balance: {
              increment: creditsToAddBack,
            },
          },
        });
      }

      await prisma.task.update({
        where: { id: taskId },
        data: { 
          creditsUsed,
          status: "COMPLETED"
        },
      });
    } catch (error) {
      console.error("Error processing files:", error);
      if (failedImages === files.length) {
        await prisma.task.update({
          where: { id: taskId },
          data: { status: "FAILED" },
        });
      }
    }
  } catch (error) {
    console.error("Error processing task:", error);
    await prisma.task.update({
      where: { id: taskId },
      data: { status: "FAILED" },
    });
  }
}

function processMetadata(
  metadata: any,
  file: any,
  generator: Generator
) {
  if (typeof metadata === "string") {
    try {
      if (metadata.indexOf("{") !== -1 && metadata.indexOf("}") !== -1) {
        const jsonString = metadata.match(/\{([^}]+)\}/)?.[0];
        metadata = JSON.parse(jsonString ?? "{}");
        if (metadata.Keywords && typeof metadata.Keywords === "string") {
          metadata.Keywords = metadata.Keywords.split(",");
        }
      } else {
        throw new Error("Metadata is not in JSON format");
      }
    } catch (error) {
      console.error("Error parsing metadata:", error);
      metadata = {};
    }
  }

  let fileName = file.filename;
  if (generator.id === 4) {
    fileName = fileName.replace(/_/g, "");
    fileName = fileName.replace(/\s+/g, "_");
    fileName = fileName.replace(/\(/g, "_");
    fileName = fileName.replace(/\)/g, "_");
  }

  const baseMetadata: { [key: string]: any } = {
    [generator.csvRequirements.structure[0]]: fileName,
  };

  generator.csvRequirements.generate.forEach((field) => {
    if (metadata[field]) {
      baseMetadata[field] = metadata[field];
    }
  });

  switch (generator.id) {
    case 1:
      baseMetadata.Category = metadata.Category ?? 8;
      break;
    case 3:
      baseMetadata.Prompt = metadata.Title;
      baseMetadata.Model = "Midjourney 5";
      break;
    case 6:
      baseMetadata.Category1 = 0;
      baseMetadata.Category2 = 0;
      baseMetadata.Category3 = 0;
      break;
  }

  return baseMetadata;
} 