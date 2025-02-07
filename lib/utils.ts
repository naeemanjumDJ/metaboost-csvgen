import {
  CREDITS_PER_FILE_WITH_USER_API,
  CREDITS_PER_FILE_WITH_USER_VISION_API,
} from "./../config/api";
import {
  BASE_DISCOUNT_PERCENTAGE,
  CREDIT_VALUE,
  CREDITS_PER_FILE_WITH_OUR_API,
  CREDITS_PER_FILE_WITH_VISION_API,
  MAX_DISCOUNT_PERCENTAGE,
  MIN_CREDITS_FOR_DISCOUNT,
} from "@/config/api";
import { ExtendedFile, Generator } from "@/types";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { AiApi, User } from "@prisma/client";
import { APICallError, generateText } from "ai";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { type ClassValue, clsx } from "clsx";
import { Parser } from "json2csv";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const trimFileName = (name: string, length: number) => {
  const [fileName, fileExt] = name.split(".");
  if (fileName.length > length) {
    return `${fileName.slice(0, length)}...${fileExt}`;
  }
  return name;
};

export async function checkApiKeyValidity(
  apiType: AiApi,
  apiKey: string,
): Promise<{ success: boolean; msg: string }> {
  try {
    const provider =
      apiType === "OPENAI"
        ? createOpenAI({ apiKey })
        : createGoogleGenerativeAI({ apiKey });

    const { text } = await generateText({
      model: provider(
        apiType === "OPENAI" ? "gpt-3.5-turbo" : "models/gemini-1.5-flash",
      ),
      prompt: ` Reply with only  "hi"  `,
    });
    console.log({ text });
    return { success: true, msg: "API key is valid" };
  } catch (error: any) {
    console.error("API key validation error:", error);
    return {
      success: false,
      msg: "Failed to validate API key. Please check your key and try again.",
    };
  }
}

export const saveAs = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
};

export const formUrlQuery = (type: string, value: string | number) => {
  console.log(`Filter changed: ${type} -> ${value}`);

  const newParams = new URLSearchParams(window.location.search);
  if (value === "all") {
    newParams.delete(type);
  } else {
    newParams.set(type, value.toString());
  }
  // get the current url with pathname
  const currentPath = window.location.pathname;
  return `${currentPath}?${newParams.toString()}`;
};

export const truncateString = (str: string, num: number) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
};

export function calculateCreditPrice(numberOfCredits: number): {
  price: number;
  discount: number;
} {
  if (numberOfCredits <= 0) return { price: 0, discount: 0 };

  let finalPrice = numberOfCredits * CREDIT_VALUE;
  const discountAmount = calculateDiscount(numberOfCredits);
  finalPrice -= discountAmount;

  return {
    price: parseFloat(finalPrice.toFixed(2)),
    discount: parseFloat(discountAmount.toFixed(2)),
  };
}

export function calculateDiscount(numberOfCredits: number): number {
  if (numberOfCredits <= MIN_CREDITS_FOR_DISCOUNT) return 0;

  const basePrice = numberOfCredits * CREDIT_VALUE;
  let discountPercentage = BASE_DISCOUNT_PERCENTAGE;

  // Increase discount percentage for larger purchases
  const additionalDiscount =
    Math.floor((numberOfCredits - MIN_CREDITS_FOR_DISCOUNT) / 15000) * 5;
  discountPercentage = Math.min(
    discountPercentage + additionalDiscount,
    MAX_DISCOUNT_PERCENTAGE,
  );

  const discountAmount = (basePrice * discountPercentage) / 100;
  return parseFloat(discountAmount.toFixed(2));
}

export function calculateCustomPackageData(
  input: number,
  inputType: "credits" | "price" | "images",
  ourKey: boolean,
): {
  price: number;
  discount: number;
  credits: number;
  images: number;
  visionImages: number;
} {
  let credits = 0;
  let images = 0;
  let visionImages = 0;

  if (inputType === "credits") {
    credits = input;
  } else if (inputType === "price") {
    credits = Math.floor(input / CREDIT_VALUE);
  } else if (inputType === "images") {
    images = input;
    credits =
      images *
      (ourKey ? CREDITS_PER_FILE_WITH_OUR_API : CREDITS_PER_FILE_WITH_USER_API);
    visionImages = Math.floor(
      credits /
        (ourKey
          ? CREDITS_PER_FILE_WITH_VISION_API
          : CREDITS_PER_FILE_WITH_USER_VISION_API),
    );
  }

  if (credits <= 0) {
    return { price: 0, discount: 0, credits: 0, images: 0, visionImages: 0 };
  }

  let finalPrice = credits * CREDIT_VALUE;
  const discountAmount = calculateDiscount(credits);
  finalPrice -= discountAmount;

  images = Math.floor(
    credits /
      (ourKey ? CREDITS_PER_FILE_WITH_OUR_API : CREDITS_PER_FILE_WITH_USER_API),
  );
  visionImages = Math.floor(
    credits /
      (ourKey
        ? CREDITS_PER_FILE_WITH_VISION_API
        : CREDITS_PER_FILE_WITH_USER_VISION_API),
  );

  return {
    price: parseFloat(finalPrice.toFixed(2)),
    discount: parseFloat(discountAmount.toFixed(2)),
    credits: credits,
    images: images,
    visionImages: visionImages,
  };
}

export const handleDownload = async ({
  metadata,
  generator,
}: {
  metadata: any;
  generator: Generator;
}) => {
  if (!generator) {
    toast.error("Something went wrong, please try again");
    return;
  }

  const processedMetadata = metadata.map((m: any) => {
    const processedItem: { [key: string]: any } = {};

    generator.csvRequirements.structure.forEach((field) => {
      if (field === "Categories") {
        processedItem[field] = m[field]
          ? m[field]
              .map(
                (catId: number) =>
                  generator.categories?.find((c) => c.id === catId)?.name,
              )
              .filter(Boolean)
              .join(", ")
          : "";
      } else if (field === "Keywords") {
        // Join keywords with commas, without quotes
        processedItem[field] = Array.isArray(m[field])
          ? m[field].join(", ")
          : m[field];
      } else {
        processedItem[field] = m[field] || "";
      }
    });

    return processedItem;
  });

  const fields = generator.csvRequirements.structure;
  const opts = {
    fields,
    delimiter: generator.csvRequirements.delimiter,
    quote: "",
  };

  try {
    const parser = new Parser(opts);
    const csv = parser.parse(processedMetadata);

    const escapedCsv = csv
      .split("\n")
      .map((row) =>
        row
          .split(generator.csvRequirements.delimiter)
          .map((field) =>
            field.includes(generator.csvRequirements.delimiter)
              ? `"${field}"`
              : field,
          )
          .join(generator.csvRequirements.delimiter),
      )
      .join("\n");

    const blob = new Blob([escapedCsv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${generator.title}_MetaBoost.csv`);
    toast.success("Download Started");
  } catch (err) {
    console.error(err);
    toast.error("Error generating CSV");
  }
};

async function resizeImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: Math.max(1024, 1024),
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return new File([compressedFile], file.name, {
      type: compressedFile.type,
    });
  } catch (error) {
    console.error("Error compressing image:", error);
    return file; // Return original file if compression fails
  }
}

export async function uploadMultipleImages(
  files: ExtendedFile[],
): Promise<ExtendedFile[]> {
  const uploadedFiles: ExtendedFile[] = [];

  for (const file of files) {
    try {
      // Get presigned URL
      const resizedImage = await resizeImage(file.file);

      const presignedUrlResponse = await axios.get("/api/presigned", {
        params: {
          fileName: file.filename,
          contentType: file.file.type,
        },
      });

      if (!presignedUrlResponse.data.success) {
        throw new Error("Failed to get presigned URL");
      }

      const { signedUrl } = presignedUrlResponse.data;

      // Upload file to S3
      await axios.put(signedUrl, resizedImage, {
        headers: {
          "Content-Type": resizedImage.type,
        },
      });

      // Add the S3 URL to the file object
      const s3Url = signedUrl.split("?")[0];

      uploadedFiles.push({
        ...file,
        url: s3Url,
      });
    } catch (error) {
      console.error(`Error uploading file ${file.filename}:`, error);
      // You might want to handle this error differently based on your requirements
    }
  }

  return uploadedFiles;
}

export async function getUserApiConfig(user: User): Promise<{
  apiKey: string;
  apiType: AiApi;
  ourApi: boolean;
}> {
  if (user.openAiApiKey && user.geminiApiKey) {
    return {
      apiKey:
        user.preferredApi === "GEMINI" ? user.geminiApiKey : user.openAiApiKey,
      apiType: user.preferredApi as AiApi,
      ourApi: false,
    };
  } else if (user.openAiApiKey) {
    return { apiKey: user.openAiApiKey, apiType: "OPENAI", ourApi: false };
  } else if (user.geminiApiKey) {
    return { apiKey: user.geminiApiKey, apiType: "GEMINI", ourApi: false };
  }
  return {
    apiKey: process.env.OPENAI_API_KEY!,
    apiType: "OPENAI",
    ourApi: true,
  };
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};
