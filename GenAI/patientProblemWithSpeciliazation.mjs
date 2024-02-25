import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);

async function findSpecifications(patientProblems, specilizations) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = specilizations + " map specilizations of doctor who can solve " + patientProblems + "problem, give output as comma separated which contain only spcecilizations";

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const specifications = text;
  console.log("Result from Gemini-Pro : " + text);
  return specifications;
}
export { findSpecifications };
