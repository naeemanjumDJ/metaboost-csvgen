import { GoogleAIFileManager } from "@google/generative-ai/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch";
import fs from "fs";

export const getMetadadataByFilename = async ({
  openAiApiKey,
  geminiApiKey,
  filename,
  metadataPrompt,
}: {
  filename: string;
  openAiApiKey?: string;
  geminiApiKey?: string;
  metadataPrompt: string;
}) => {
  if (openAiApiKey) {
    const client = new OpenAI({
      apiKey: openAiApiKey,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: metadataPrompt,
        },
        {
          role: "user",
          content: `Get metadata for ${filename}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    if (response.choices.length === 0) {
      return { success: false, msg: "No response from OpenAI" };
    }

    const metadata = response.choices[0].message.content;
    return { success: true, data: metadata };
  } else if (geminiApiKey) {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    try {
      const joinedPrompt = `${metadataPrompt}. /n Generate metadata for ${filename}`;
      const response = await model.generateContent(joinedPrompt);
      const chatResponse = response.response?.text() || "";
      return { success: true, data: chatResponse };
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Something went wrong" };
    }
  } else {
    return { success: false, msg: "No API key provided" };
  }
};

export const getMetadadataByImage = async ({
  openAiApiKey,
  geminiApiKey,
  base64,
  metadataPrompt,
}: {
  base64: string;
  openAiApiKey?: string;
  geminiApiKey?: string;
  metadataPrompt: string;
}) => {
  if (openAiApiKey) {
    const client = new OpenAI({
      apiKey: openAiApiKey,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: metadataPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyse this image and generate required metadata",
            },
            {
              type: "image_url",
              image_url: {
                url: base64,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    if (response.choices.length === 0) {
      return { success: false, msg: "No response from OpenAI" };
    }

    const metadata = response.choices[0].message.content;
    return { success: true, data: metadata };
  } else if (geminiApiKey) {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
      generationConfig: { responseMimeType: "application/json" },
    });

    try {
      const joinedPrompt = `${metadataPrompt}. /n Analyse this image and generate required metadata`;
      const response = await model.generateContent([
        {
          inlineData: {
            data: base64.split(',')[1],
            mimeType: "image/jpeg"
          }
        },
        {
          text: joinedPrompt,
        },
      ]);
      const chatResponse = response.response?.text() || "";
      return { success: true, data: chatResponse };
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Something went wrong" };
    }
  } else {
    return { success: false, msg: "No API key provided" };
  }
}; 