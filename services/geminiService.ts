import { GoogleGenAI, Type } from "@google/genai";
import { OCRResult } from "../types";

// Initialize Gemini Client
// In a real production app, you might proxy this through a backend to hide the key, 
// or require the user to input their own key if it's a BYOK app.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const analyzeBikeImage = async (base64Image: string): Promise<OCRResult> => {
  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }

  // Remove data URL prefix if present
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: `Analyze this image for a bicycle security registration sticker (防犯登録). 
            Extract the registration number. It is usually a combination of letters and numbers.
            Also estimate your confidence (0-1) and whether you are sure it is a bike registration number.
            Ignore random text like brand names unless it looks like a serial ID.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            number: { type: Type.STRING, description: "The extracted registration number or serial number." },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1." },
            isBikeNumber: { type: Type.BOOLEAN, description: "True if the identified text looks like a registration number." }
          },
          required: ["confidence", "isBikeNumber"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(resultText) as OCRResult;
    return data;

  } catch (error) {
    console.error("Gemini OCR Error:", error);
    return {
      number: null,
      confidence: 0,
      isBikeNumber: false
    };
  }
};