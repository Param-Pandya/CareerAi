# CareerAI 🚀

### AI-Powered Career Coach for Resume Analysis, ATS Optimization, Skill Gap Detection & Interview Preparation

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google&logoColor=white)
![TanStack Start](https://img.shields.io/badge/TanStack-Start-FF4154)

CareerAI is an AI-powered career coaching platform that transforms a resume and job description into a complete job preparation plan. It analyzes resume quality, measures ATS compatibility, identifies skill gaps, optimizes resume content, generates personalized learning roadmaps, creates interview questions, evaluates mock interview responses, and tracks career readiness—all through a single AI-powered workflow.

The goal is simple:

> **From Resume → Job Description → Interview → Job Offer**

---

# 📸 Preview

## Home

![Home](screenshots/01-home.png)

## AI Analysis Dashboard

![Dashboard](screenshots/02-mid.png)

## Interview Preparation & Career Roadmap

![Interview](screenshots/03-bottom.png)

---

# ✨ Features

CareerAI combines multiple AI-powered modules into a single end-to-end workflow.

### 📄 Resume Analyzer

- Extracts resume content from PDF
- Identifies technical skills
- Detects strengths & improvement areas
- Generates structured profile summary

### 🎯 Job Description Analyzer

- Extracts required technologies
- Finds keywords
- Identifies responsibilities
- Detects interview topics

### 📈 ATS Compatibility Engine

- ATS Match Score
- Skill Match Score
- Keyword Match Score
- Missing Skills Detection

### 🧠 Skill Gap Analysis

For every missing skill CareerAI provides:

- Why it matters
- Industry relevance
- Learning roadmap
- Resume bullet examples
- Interview importance

### ✍️ Resume Optimizer

- ATS-friendly improvements
- Better bullet points
- Keyword recommendations
- Professional summary enhancement

### 🗓 Personalized Learning Roadmap

- 1 Week Plan
- 1 Month Plan
- 3 Month Plan
- Daily learning schedule
- Project recommendations

### 💼 Interview Preparation

Generates

- Technical Questions
- HR Questions
- Resume-Based Questions
- Project Questions
- Role-Specific Questions

### 🎤 AI Mock Interview

Evaluates

- Technical Accuracy
- Communication
- Completeness
- Confidence
- Ideal Answer Comparison

### 📊 Career Readiness Dashboard

Summarizes

- Resume Quality
- ATS Compatibility
- Interview Readiness
- Skill Gap Score
- Overall Career Score

### 📚 Curated Learning Resources

Provides

- Documentation
- Free Courses
- YouTube Channels
- Practice Platforms
- Project Ideas

---

# 🏗 System Architecture

```text
               Resume PDF
                    +
          Job Description Input
                    │
                    ▼
       Client-side PDF Text Extraction
                    │
                    ▼
           Google Gemini AI Analysis
                    │
                    ▼
         Structured JSON Response
                    │
 ┌──────────────────┼────────────────────┐
 │                  │                    │
ATS Engine     Skill Gap AI      Resume Optimizer
 │                  │                    │
 ├──────────────────┼────────────────────┤
 ▼                  ▼                    ▼
Roadmap      Interview Prep      Mock Interview
                    │
                    ▼
      Career Readiness Dashboard
```

---

# 🛠 Tech Stack

| Category | Technology |
|-----------|------------|
| Frontend | React 19 |
| Framework | TanStack Start |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Google Gemini |
| Validation | Zod |
| PDF Parsing | pdfjs-dist |
| Build Tool | Vite 7 |
| Runtime | Bun |

---

# ⚡ Engineering Highlights

- Client-side PDF parsing using **pdfjs-dist**
- Structured LLM outputs validated using **Zod**
- Modular AI orchestration through server functions
- Fully type-safe architecture using **TypeScript**
- Responsive React 19 interface
- Modern UI built with **Tailwind CSS v4**
- SSR-ready application using **TanStack Start**
- Stateless architecture with no database dependency

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Param-Pandya/CareerAi.git
cd CareerAi
```

## Install Dependencies

```bash
bun install
```

## Start Development Server

```bash
bun run dev
```

The application runs locally at

```
http://localhost:8080
```

---

# 📂 Project Structure

```text
src/
│
├── routes/
│   ├── __root.tsx
│   └── index.tsx
│
├── lib/
│   ├── ai.functions.ts
│   ├── ai-gateway.server.ts
│   └── pdf-extract.ts
│
└── styles.css
```

---

# 🎯 Future Improvements

- Voice-based AI Mock Interviews
- AI Cover Letter Generator
- Resume Version Comparison
- Authentication & User Profiles
- Recruiter Analytics Dashboard
- Resume History Tracking
- Multi-language Support
- Personalized Career Recommendations

---

# 🎓 Project Goal

CareerAI demonstrates how Large Language Models can be integrated into modern web applications to solve real-world career preparation challenges.

The project combines document understanding, structured AI outputs, ATS optimization, personalized learning, interview evaluation, and intelligent career guidance into a single end-to-end AI workflow.

---

# 👨‍💻 Author

## Param Pandya

AI/ML Engineer passionate about

- Machine Learning
- Deep Learning
- Large Language Models (LLMs)
- Generative AI
- Computer Vision
- Natural Language Processing

**GitHub**

https://github.com/Param-Pandya

**LinkedIn**

https://www.linkedin.com/in/param-pandya/

---

# 🙏 Acknowledgements

Built using

- React 19
- TanStack Start
- TypeScript
- Tailwind CSS v4
- Google Gemini AI
- pdfjs-dist
- Zod
- Bun
- Vite
- Lovable AI Gateway
