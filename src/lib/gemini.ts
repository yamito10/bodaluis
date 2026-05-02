import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function extractPaymentInfo(file: File) {
  try {
    const base64 = await fileToBase64(file);
    const result = await geminiModel.generateContent([
      "Extract the following information from this payment receipt image: 'monto' (number), 'fecha' (YYYY-MM-DD or readable format), 'codigoAutorizacion' (string). Return ONLY a JSON object with these keys. No markdown blocks, just the JSON.",
      {
        inlineData: {
          data: base64.split(",")[1],
          mimeType: file.type
        }
      }
    ]);
    const text = result.response.text();
    // Parse potentially markdown wrapped JSON
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to extract information from image.");
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
