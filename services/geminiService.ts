
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyDo0hVOtClkyq_DT9VIxOsp-I5jE_l1ahM" });

export const extractAadhaarData = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image
            }
          },
          {
            text: "Extract the 12-digit Aadhaar number and Date of Birth (DD/MM/YYYY) from this Aadhaar card image. If multiple dates exist, look for 'Birth' or 'DOB'. Return a JSON object with keys 'aadhaar' and 'dob'. Only return valid JSON."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aadhaar: { type: Type.STRING },
            dob: { type: Type.STRING }
          },
          required: ["aadhaar", "dob"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as { aadhaar: string; dob: string };
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    return null;
  }
};
