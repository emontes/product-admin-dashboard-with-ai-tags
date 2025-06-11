
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure API_KEY is set in your environment variables for this to work.
// For example, in a .env file: API_KEY=YOUR_GEMINI_API_KEY
// In a Vite project, you'd use import.meta.env.VITE_API_KEY
// For this environment, we assume process.env.API_KEY is available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn(
    "Gemini API key not found. Please set API_KEY environment variable. Tag suggestions will not work."
  );
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
const modelName = 'gemini-2.5-flash-preview-04-17'; // Correct model for text generation

export const suggestTags = async (productName: string, productDescription: string): Promise<string[]> => {
  if (!ai) {
    console.error("Gemini AI client not initialized. API Key might be missing.");
    // Fallback: return empty array or throw error
    // For a better UX, return a predefined set or an empty array.
    // To demonstrate functionality even without API key for testing UI:
    // return ["mock_tag1", "mock_tag2", "mock_suggestion"];
    throw new Error("AI service is not available. Check API key configuration.");
  }

  const prompt = `
    Given the following product information:
    Product Name: "${productName}"
    Product Description: "${productDescription}"

    Suggest between 3 to 7 relevant e-commerce tags for this product.
    The tags should be concise, lowercase, and suitable for filtering and searching.
    Return the tags as a JSON array of strings. For example: ["tag1", "tag2", "tag3"].
    Do not include any other text or explanation outside the JSON array.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5, // Lower temperature for more focused suggestions
      }
    });
    
    let jsonStr = response.text.trim();
    
    // Remove markdown fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
        return parsedData as string[];
      } else {
        console.error("Gemini API returned JSON but not in the expected format (array of strings):", parsedData);
        throw new Error("AI response format is incorrect.");
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini API:", parseError);
      console.error("Raw Gemini response text:", response.text);
      throw new Error(`AI returned malformed data. Raw response: ${response.text.substring(0,100)}...`);
    }

  } catch (error) {
    console.error("Error calling Gemini API for tag suggestion:", error);
    if (error instanceof Error) {
        // Check for specific API related errors if possible from the SDK or error structure
        if (error.message.includes("API key not valid")) {
             throw new Error("Invalid Gemini API Key. Please check your configuration.");
        }
    }
    throw new Error("Failed to get tag suggestions from AI.");
  }
};
