import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import { initializePrompt } from "../services/gemini/prompts.service.js";

declare module 'fastify' {
    interface FastifyInstance {
        gemini: GenerativeModel;
    }
}

export const geminiPlugin = fp(async (app: FastifyInstance) => {
    const apiKey = app.config.AI_API_KEY;
    
    if (!apiKey || apiKey.trim().length === 0) {
        app.log.warn("AI_API_KEY not configured. Gemini LLM features will be disabled.");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: {
                role: "system",
                parts: [{
                    text: initializePrompt
                }]
            },
            generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
                responseMimeType: "application/json",
            },
        });

        app.decorate("gemini", model);
    } catch (error) {
        app.log.error(error, "Failed to initialize Gemini service");
        throw error;
    }
});