import type { GenerativeModel } from "@google/generative-ai";
import type { NormalizedSchema } from "../../types.js";
import { buildUserPrompt, buildSchemaDescription } from "./prompts.service.js";

export const generateSQLFromQuery = async (
  model: GenerativeModel,
  userQuery: string,
  schema: NormalizedSchema
): Promise<{ sql: string; explanation: string }> => {

  const schemaDescription = buildSchemaDescription(schema);
  const userPrompt = buildUserPrompt(schemaDescription, userQuery);

  try {
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No response from Gemini");
    }

    const parsed = JSON.parse(content);
    
    if (!parsed.sql) {
      throw new Error("Invalid response format: missing SQL query");
    }

    return {
      sql: parsed.sql.trim(),
      explanation: parsed.explanation || "No explanation provided",
    };
  } catch (error: any) {
    console.log("Gemini generation error:", error);
    throw error;
  }
};