import { GoogleGenerativeAI } from '@google/generative-ai'
import conf from '../conf/conf.js';


const genAI = new GoogleGenerativeAI(conf.geminiAPIKey);

export async function findSpecialization(patientProblems, specilizations) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = specilizations + " map specilizations of doctor who can solve " + patientProblems + "problem, give output as comma separated which contain only spcecilizations";

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const specialization
      = text;
    return specialization;
  } catch (error) {
    return null;
  }
}
