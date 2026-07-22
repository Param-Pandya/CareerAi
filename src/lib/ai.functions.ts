import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

function extractJson(text: string): unknown {
  let t = text.trim();
  // Strip markdown fences
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }
  // Find first { or [
  const start = Math.min(
    ...["{", "["].map((c) => {
      const i = t.indexOf(c);
      return i === -1 ? Infinity : i;
    }),
  );
  if (start === Infinity) throw new Error("No JSON found in model response");
  // Find matching last } or ]
  const last = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  const slice = t.slice(start, last + 1);
  return JSON.parse(slice);
}

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

async function callJson(system: string, prompt: string): Promise<Json> {
  const gateway = getGateway();
  const { text } = await generateText({
    model: gateway(MODEL),
    system:
      system +
      "\n\nReturn ONLY valid minified JSON. No markdown, no commentary, no code fences.",
    prompt,
  });
  return extractJson(text) as Json;
}

const AnalyzeInput = z.object({
  resumeText: z.string().min(20),
  jobDescription: z.string().min(20),
  targetRole: z.string().min(1),
  experienceLevel: z.enum(["student", "fresher", "experienced"]),
  timeline: z.enum(["1week", "2weeks", "1month", "2months", "3months"]),
});

export const analyzeCareer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AnalyzeInput.parse(d))
  .handler(async ({ data }) => {
    const sys = `You are CareerAI, an expert AI career coach. Analyze resumes vs job descriptions and produce structured guidance. Be specific, candid, and actionable.`;
    const prompt = `Analyze this candidate's fit for the target role and produce a comprehensive career coaching report.

TARGET ROLE: ${data.targetRole}
EXPERIENCE LEVEL: ${data.experienceLevel}
TIMELINE: ${data.timeline}

=== RESUME ===
${data.resumeText.slice(0, 12000)}

=== JOB DESCRIPTION ===
${data.jobDescription.slice(0, 6000)}

Return JSON matching EXACTLY this TypeScript shape:
{
  "resume": {
    "summary": string,                  // 2-3 sentence professional summary
    "category": string,                 // e.g. "Entry-level Data Analyst"
    "keySkills": string[],              // 8-15 skills extracted from resume
    "strengths": string[],              // 4-6 bullet strengths
    "weakAreas": string[]               // 3-5 weak areas
  },
  "jd": {
    "requiredSkills": string[],
    "preferredSkills": string[],
    "technologies": string[],
    "responsibilities": string[],
    "keywords": string[],
    "interviewTopics": string[]
  },
  "ats": {
    "atsMatchScore": number,            // 0-100
    "skillMatchScore": number,          // 0-100
    "keywordMatchScore": number,        // 0-100
    "matchedSkills": string[],
    "missingSkills": string[],
    "matchedKeywords": string[],
    "missingKeywords": string[]
  },
  "skillGap": [
    {
      "skill": string,
      "whyItMatters": string,
      "industryUsage": string,
      "importance": "Critical" | "High" | "Medium",
      "learningPath": string,           // 2-3 sentences
      "resumeBulletExample": string,
      "interviewRelevance": string
    }
  ],
  "optimizer": {
    "missingKeywords": string[],
    "atsSuggestions": string[],
    "resumeImprovements": string[],
    "betterBullets": [ { "before": string, "after": string } ],
    "profileEnhancements": string[]
  },
  "roadmap": {
    "title": string,
    "totalDays": number,
    "weeks": [
      {
        "weekNumber": number,
        "theme": string,
        "goals": string[],
        "learningTopics": string[],
        "practiceTasks": string[],
        "miniProject": string,
        "days": [
          { "day": number, "focus": string, "tasks": string[] }
        ]
      }
    ],
    "portfolioWork": string[],
    "interviewPrepPhase": string
  },
  "interview": {
    "technical": string[],              // 8-12 questions
    "hr": string[],                     // 5-8
    "resumeBased": string[],            // 4-6
    "projectBased": string[],           // 4-6
    "jdBased": string[]                 // 6-8
  },
  "readiness": {
    "atsScore": number,
    "skillGapScore": number,            // higher = smaller gap
    "resumeQualityScore": number,
    "interviewReadinessScore": number,
    "overallScore": number,
    "summary": string
  },
  "resources": [
    {
      "skill": string,
      "freeCourses": [ { "name": string, "url": string } ],
      "documentation": [ { "name": string, "url": string } ],
      "youtube": [ { "name": string, "url": string } ],
      "practicePlatforms": [ { "name": string, "url": string } ],
      "projectIdeas": string[]
    }
  ]
}

Roadmap rules:
- 1week -> 1 week, 7 days. 2weeks -> 2 weeks. 1month -> 4 weeks. 2months -> 8 weeks. 3months -> 12 weeks.
- Include daily tasks for the FIRST week only (to keep response compact). For other weeks omit "days" or use [].
- Personalize to target role, missing skills, and experience level.

Provide skillGap entries for the top 5-8 missing skills. Provide resources for top 4-6 missing skills. Use real, well-known free resources (freeCodeCamp, Coursera audit, Khan Academy, MDN, official docs, popular YouTube channels like freeCodeCamp, Krish Naik, etc.) with real URLs.`;

    return (await callJson(sys, prompt)) as Json;
  });

const MockInput = z.object({
  question: z.string().min(3),
  answer: z.string().min(1),
  targetRole: z.string().min(1),
});

export const evaluateAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MockInput.parse(d))
  .handler(async ({ data }) => {
    const sys = `You are an expert technical interviewer evaluating a candidate's answer.`;
    const prompt = `Role: ${data.targetRole}
Question: ${data.question}
Candidate Answer: ${data.answer}

Evaluate and return JSON:
{
  "technicalAccuracy": number,   // 0-100
  "communication": number,       // 0-100
  "completeness": number,        // 0-100
  "overall": number,             // 0-100
  "feedback": string,            // 2-4 sentences of constructive feedback
  "improvements": string[],      // 3-5 specific suggestions
  "idealAnswer": string          // a model answer, 4-8 sentences
}`;
    return (await callJson(sys, prompt)) as Json;
  });
