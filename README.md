# CareerAI — From Resume to Job Offer

Your personal AI Career Coach. Upload a resume, paste a job description, and get an end-to-end coaching report: ATS score, skill-gap analysis, an optimized resume, a personalized day-by-day roadmap, an interview question bank, an AI-evaluated mock interview, and a readiness dashboard — all in one place, no login required.

![Hero](screenshots/01-home.png)

## Features

Ten AI modules working together:

1. **Resume Analyzer** — parses your PDF resume, extracts skills, summary, strengths and weak areas.
2. **JD Analyzer** — pulls required/preferred skills, technologies, keywords and interview topics from any job description.
3. **ATS Engine** — match score, keyword score, skill score, plus matched vs missing lists.
4. **Skill Gap AI** — for each missing skill: why it matters, industry usage, importance, learning path, resume bullet example, interview relevance.
5. **Resume Optimizer** — ATS suggestions, keyword injections, better bullets (before/after), profile enhancements.
6. **Personalized Roadmap** — 1 week to 3 months, with weekly themes, mini-projects, and day-by-day tasks for week 1.
7. **Interview Prep** — technical, HR, resume-based, project-based and JD-based questions tailored to your role.
8. **AI Mock Interview** — type your answers; Gemini evaluates technical accuracy, communication, completeness, gives feedback and an ideal answer.
9. **Readiness Dashboard** — ATS, skill-gap, resume-quality, interview-readiness and overall scores with a summary.
10. **Curated Resources** — real free courses, docs, YouTube channels, practice platforms and project ideas per missing skill.

![Features](screenshots/02-mid.png)

## How it works

1. **Upload & describe** — drop your resume PDF and paste the job description.
2. **AI analyzes** — a single Gemini call (via the Lovable AI Gateway) returns the full structured coaching report.
3. **You execute** — follow the daily plan, rehearse in the mock interview, ship the offer.

![How it works](screenshots/03-bottom.png)

## Tech Stack

- **Framework** — TanStack Start (React 19, Vite 7, SSR-ready)
- **Styling** — Tailwind CSS v4 with a custom dark, midnight + teal/magenta design system
- **AI** — `google/gemini-3-flash-preview` via the Lovable AI Gateway (`ai` SDK)
- **PDF parsing** — `pdfjs-dist`, done client-side in the browser
- **Type safety** — TypeScript strict, Zod input validation on every server function

## Project Structure

```
src/
  routes/
    __root.tsx          # app shell, SEO metadata, providers
    index.tsx           # the entire CareerAI experience
  lib/
    ai.functions.ts     # analyzeCareer + evaluateAnswer server functions
    ai-gateway.server.ts# Lovable AI Gateway provider
    pdf-extract.ts      # client-side PDF text extraction
  styles.css            # design tokens (dark, teal + magenta)
```

## Local Development

```bash
bun install
bun run dev
```

The app runs at `http://localhost:8080`. The `LOVABLE_API_KEY` secret is provisioned automatically by Lovable Cloud — no external accounts needed.

## What CareerAI is NOT

- Not just an ATS checker — it goes from resume to interview readiness.
- No login, no signup, no payment gateway, no complex database — a single stateless flow driven by AI.

## Credits

Built with [Lovable](https://lovable.dev). Powered by the Lovable AI Gateway.
