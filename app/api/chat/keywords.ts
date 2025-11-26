import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { KEYWORD_EXTRACTION_PROMPT } from "./prompts";

const openai = createOpenAI({
  baseURL: "https://api.6r33n.kr/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

export const extractKeywords = async (text: string): Promise<string[]> => {
  try {
    const { text: response } = await generateText({
      model: openai.chat("gpt-5-mini"),
      prompt: KEYWORD_EXTRACTION_PROMPT(text),
    });

    const keywords = response
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0 && k.length < 20);

    return keywords.slice(0, 3);
  } catch (error) {
    console.error("Error extracting keywords:", error);
    return text
      .split(/\s+/)
      .filter((word) => word.length >= 2)
      .slice(0, 2);
  }
};
