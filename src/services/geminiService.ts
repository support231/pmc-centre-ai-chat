
import { GoogleGenAI } from "@google/genai";
import { Citation } from '../types';

// Per Gemini API guidelines, API key must be from process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are a highly knowledgeable technical consultant specializing in Paper Machine Clothing (PMC). Your expertise covers Forming fabrics, Press Felts, and Dryer fabrics. Your primary goal is to provide accurate, helpful guidance to paper makers and PMC manufacturers. When answering, prioritize information from pmccentre.com and pmccentre.com/blog. You may also use other highly reputable technical websites. ALWAYS cite your sources at the end of your response using the provided grounding information. Format the response in Markdown.`;

export const getChatResponse = async (
  prompt: string,
  history: { role: 'user' | 'model', parts: string }[]
): Promise<{ text: string; citations: Citation[] }> => {
  try {
    // The 'contents' for `generateContent` must be an array of Content objects,
    // where each 'parts' property is an array of Part objects (e.g., [{ text: '...' }]).
    const contents = [
      ...history.map((h) => ({ role: h.role, parts: [{ text: h.parts }] })),
      { role: 'user', parts: [{ text: prompt }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        tools: [{googleSearch: {}}],
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const citations: Citation[] = groundingChunks
      .map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title,
      }))
      .filter((citation: any) => citation.uri && citation.title);

    // Deduplicate citations
    const uniqueCitations = Array.from(new Map(citations.map(c => [c.uri, c])).values());

    return { text, citations: uniqueCitations };
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    return {
      text: "Sorry, I encountered an error while processing your request. Please check your API key and try again.",
      citations: [],
    };
  }
};
