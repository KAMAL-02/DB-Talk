import type { GenerativeModel } from "@google/generative-ai";
import type { NormalizedSchema } from "../../types.js";
import { buildUserPrompt } from "./prompts.service.js";

export const generateQuery = async (
  model: GenerativeModel,
  userQuery: string,
  schema: NormalizedSchema,
): Promise<{ query: string; explanation: string }> => {
  const userPrompt = buildUserPrompt(schema, userQuery);

  try {
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No response from Gemini");
    }
    console.log("Gemini raw response content:", content);

    const parsed = JSON.parse(content);

    if (!parsed.query) {
      throw new Error("Invalid response format: missing query");
    }

    return {
      query: parsed.query.trim(),
      explanation: parsed.explanation || "No explanation provided",
    };
  } catch (error: any) {
    console.log("Gemini generation error:", error);
    throw error;
  }
};
