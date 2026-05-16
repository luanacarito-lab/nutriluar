import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const apiKey = process.env.GOOGLE_API_KEY;
  console.log("API Key found:", apiKey ? "Yes" : "No");
  
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Olá, responda apenas 'OK' se estiver funcionando.");
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
