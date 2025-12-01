import { OCRResult } from "../types";

// REFACTORED: Now uses local Tesseract.js for client-side OCR instead of Gemini API.
// This allows the app to run without an API key and keeps images on the device.

declare global {
  interface Window {
    Tesseract: any;
  }
}

export const analyzeBikeImage = async (base64Image: string): Promise<OCRResult> => {
  // Ensure Tesseract is loaded
  if (!window.Tesseract) {
    console.error("Tesseract.js not loaded");
    return {
      number: null,
      confidence: 0,
      isBikeNumber: false
    };
  }

  try {
    // Perform OCR locally using Tesseract.js
    // We use the 'eng' model which is good for alphanumeric registration codes.
    const result = await window.Tesseract.recognize(
      base64Image,
      'eng',
      {
        // Whitelist common characters in registration numbers to improve accuracy
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-'
      }
    );

    const text = result.data.text;
    const confidenceScore = result.data.confidence; // 0 to 100

    // Filter and formatting logic
    // 1. Remove newlines and spaces
    const cleanText = text.replace(/[\n\s]/g, '').toUpperCase();
    
    // 2. Simple validation for a bike registration number
    // Typically 5+ chars, alphanumeric.
    const isValidLength = cleanText.length >= 5;
    const isConfident = confidenceScore > 60;

    return {
      number: isValidLength ? cleanText : null,
      confidence: confidenceScore / 100, // Normalize to 0-1
      isBikeNumber: isValidLength && isConfident
    };

  } catch (error) {
    console.error("Local OCR Error:", error);
    return {
      number: null,
      confidence: 0,
      isBikeNumber: false
    };
  }
};
