import Groq from "groq-sdk";

export const GROQ_MODELS = {
  FAST: "llama-3.1-8b-instant",
  SMART: "llama-3.3-70b-versatile",
};

let _groq = null;

const getGroqClient = () => {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
};

export default getGroqClient;