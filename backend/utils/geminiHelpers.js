import getGroqClient, { GROQ_MODELS } from "../config/groq.js";
import {
  buildInterviewerSystemPrompt,
  buildEvaluatorSystemPrompt,
} from "../prompts/index.js";

export const getNextQuestion = async ({ topic, resumeData, history }) => {
  const systemPrompt = buildInterviewerSystemPrompt(topic, resumeData);

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((h) => ({
      role: h.role === "model" ? "assistant" : "user",
      content: h.parts.map((p) => p.text).join("\n"),
    })),
    {
      role: "user",
      content:
        history.length === 0
          ? "Begin the interview."
          : "Continue the interview with the next question.",
    },
  ];

  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_MODELS.FAST,
    messages,
    temperature: 0.7,
  });

  return completion.choices[0].message.content.trim();
};

export const evaluateTranscript = async (fullTranscript, topic) => {
  const systemPrompt = buildEvaluatorSystemPrompt(topic);

  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_MODELS.SMART,
    temperature: 0.3,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Here is the full interview transcript:\n\n${fullTranscript}\n\nEvaluate it now.`,
      },
    ],
  });

  const raw = completion.choices[0].message.content.trim();
  const jsonString = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "");

  try {
    return { parsed: JSON.parse(jsonString), raw };
  } catch {
    throw new Error(`AI returned non-JSON output: ${raw.slice(0, 200)}`);
  }
};

export const parseResumeWithGemini = async (pdfText) => {
  const prompt = `You are a resume parser. Extract structured information from the resume text below.
Return ONLY valid JSON — no markdown, no explanation — in this exact shape:
{
  "skills": ["string"],
  "projects": [{ "name": "string", "description": "string", "techStack": ["string"] }],
  "experience": [{ "company": "string", "role": "string", "duration": "string", "description": "string" }],
  "education": [{ "institution": "string", "degree": "string", "field": "string", "year": "string", "cgpa": "string" }],
  "summary": "string"
}

Resume text:
${pdfText}`;

  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_MODELS.FAST,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = completion.choices[0].message.content.trim();
  const jsonString = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "");

  try {
    return JSON.parse(jsonString);
  } catch {
    throw new Error("Failed to parse resume JSON from AI");
  }
};