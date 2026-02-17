
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { ChannelResponse } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches channel information by querying the Gemini-3-flash-preview model.
 * The model acts as an intelligent router mapping user queries to technical CDN specifications.
 */
export const fetchChannelInfo = async (query: string): Promise<ChannelResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            channel_name: { type: Type.STRING },
            multicast_ip: { type: Type.STRING },
            headend_id: { type: Type.STRING },
            stream_url_https: { type: Type.STRING },
            stream_url_local: { type: Type.STRING },
            status: { type: Type.STRING },
            message: { type: Type.STRING },
          },
          required: ["channel_name", "multicast_ip", "headend_id", "stream_url_https", "status"],
        },
      },
    });

    // The .text property directly returns the string output. Do not use text().
    const text = response.text;
    if (!text) throw new Error("Empty response from API");
    return JSON.parse(text) as ChannelResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
