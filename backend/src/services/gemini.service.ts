import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../config/env.js";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

export const summarizeMessages = async (messages: any[]) => {
  if (!ENV.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  // Use the recommended model for text tasks
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  const formattedMessages = messages
    .map((msg) => `${msg.user?.name || msg.user?.id}: ${msg.text}`)
    .join("\n");

  const prompt = `
    Please provide a concise, bulleted summary of the following chat messages.
    Focus on the key decisions, action items, and main topics discussed.
    Do not mention who said what unless it's an assigned action item.
    Keep it brief and easy to read.

    Messages:
    ${formattedMessages}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary.");
  }
};

export const generateSmartReplies = async (messages: any[]) => {
  if (!ENV.GEMINI_API_KEY) {
    return []; // Return empty array if not configured to fail gracefully
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // Only take the last 5 messages for context to keep it fast and relevant
  const recentMessages = messages.slice(-5);
  const formattedMessages = recentMessages
    .map((msg) => `${msg.user?.name || msg.user?.id}: ${msg.text}`)
    .join("\n");

  const prompt = `
    Based on the following recent chat messages, suggest exactly 3 short, context-aware replies that the user could send next.
    Format the response as a JSON array of strings. Do not include any markdown formatting like \`\`\`json.
    Keep the replies brief, natural, and helpful.

    Messages:
    ${formattedMessages}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Parse the JSON array. Handle potential markdown wrappers if the model includes them despite instructions.
    const cleanText = text.replace(/```json\n?|\n?```/g, "");
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error generating smart replies:", error);
    return []; // Fail gracefully
  }
};
