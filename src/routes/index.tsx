import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  ArrowRight,
  Upload,
  FileText,
  Sparkles,
  Target,
  Brain,
  Map,
  MessageSquare,
  Trophy,
  BookOpen,
  Loader2,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Briefcase,
  GraduationCap,
  Rocket,
  ExternalLink,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { analyzeCareer, evaluateAnswer } from "@/lib/ai.functions";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerAI — From Resume to Job Offer" },
      {
        name: "description",
        content:
          "AI Career Coach that guides you from resume analysis to interview readiness with personalized roadmaps and mock interviews.",
      },
    ],
  }),
  component: Page,
});

type Experience = "student" | "fresher" | "experienced";
type Timeline = "1week" | "2weeks" | "1month" | "2months" | "3months";

interface Analysis {
  resume: {
    summary: string;
    category: string;
    keySkills: string[];
    strengths: string[];
    weakAreas: string[];
  };
  jd: {
    requiredSkills: string[];
    preferredSkills: string[];
    technologies: string[];
    responsibilities: string[];
    keywords: string[];
    interviewTopics: string[];
  };
  ats: {
    atsMatchScore: number;
    skillMatchScore: number;
    keywordMatchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    matchedKeywords: string[];
    missingKeywords: string[];
  };
  skillGap: Array<{
    skill: string;
    whyItMatters: string;
    industryUsage: string;
    importance: string;
    learningPath: string;
    resumeBulletExample: string;
    interviewRelevance: string;
  }>;
  optimizer: {
    missingKeywords: string[];
    atsSuggestions: string[];
    resumeImprovements: string[];
    betterBullets: Array<{ before: string; after: string }>;
    profileEnhancements: string[];
  };
  roadmap: {
    title: string;
    totalDays: number;
    weeks: Array<{
      weekNumber: number;
      theme: string;
      goals: string[];
      learningTopics: string[];
      practiceTasks: string[];
      miniProject: string;
      days?: Array<{ day: number; focus: string; tasks: string[] }>;
    }>;
    portfolioWork: string[];
    interviewPrepPhase: string;
  };
  interview: {
    technical: string[];
    hr: string[];
    resumeBased: string[];
    projectBased: string[];
    jdBased: string[];
  };
  readiness: {
    atsScore: number;
    skillGapScore: number;
    resumeQualityScore: number;
    interviewReadinessScore: number;
    overallScore: number;
    summary: string;
  };
  resources: Array<{
    skill: string;
    freeCourses: Array<{ name: string; url: string }>;
    documentation: Array<{ name: string; url: string }>;
    youtube: Array<{ name: string; url: string }>;
    practicePlatforms: Array<{ name: string; url: string }>;
    projectIdeas: string[];
  }>;
}

const ROLES = [
  "Data Scientist",
  "Data Analyst",
  "AI Engineer",
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Product Manager",
];

function Page() {
  const runAnalyze = useServerFn(analyzeCareer);



  const [stage, setStage] = useState<"landing" | "input" | "dashboard">("landing");
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [jd, setJd] = useState("");
  const [role, setRole] = useState("Data Scientist");
  const [experience, setExperience] = useState<Experience>("fresher");
  const [timeline, setTimeline] = useState<Timeline>("1month");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPdf = useCallback(async (file: File) => {
    try {
      toast.loading("Reading PDF...", { id: "pdf" });
      const { extractPdfText } = await import("@/lib/pdf-extract");
      const text = await extractPdfText(file);
      setResumeText(text);
      setResumeFileName(file.name);
      toast.success(`Extracted ${text.length.toLocaleString()} characters`, { id: "pdf" });
    } catch (e) {
      console.error(e);
      toast.error("Could not read PDF. Paste the text instead.", { id: "pdf" });
    }
  }, []);

  const runAnalysis = async () => {
    if (resumeText.trim().length < 50) {
      toast.error("Please upload a resume PDF or paste resume text.");
      return;
    }
    if (jd.trim().length < 50) {
      toast.error("Please paste the job description.");
      return;
    }
    setLoading(true);
    toast.loading("Analyzing your profile...", { id: "ai" });
    try {
      const result = (await runAnalyze({
        data: { resumeText, jobDescription: jd, targetRole: role, experienceLevel: experience, timeline },
      })) as unknown as Analysis;
      setAnalysis(result);
      setStage("dashboard");
      toast.success("Analysis complete!", { id: "ai" });
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Analysis failed";
      toast.error(msg, { id: "ai" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-center" richColors />
      <Header onHome={() => setStage("landing")} />

      {stage === "landing" && <Landing onStart={() => setStage("input")} />}

      {stage === "input" && (
        <InputForm
          resumeText={resumeText}
          setResumeText={setResumeText}
          resumeFileName={resumeFileName}
          jd={jd}
          setJd={setJd}
          role={role}
          setRole={setRole}
          experience={experience}
          setExperience={setExperience}
          timeline={timeline}
          setTimeline={setTimeline}
          loading={loading}
          onPdf={onPdf}
          onRun={runAnalysis}
          fileRef={fileRef}
        />
      )}

      {stage === "dashboard" && analysis && (
        <Dashboard analysis={analysis} role={role} onRestart={() => setStage("input")} />
      )}

      <footer className="border-t border-border/40 mt-20 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CareerAI
      </footer>
    </div>
  );
}



function Header({ onHome }: { onHome: () => void }) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={onHome} className="flex items-center gap-2 group">
          <div className="size-9 rounded-xl bg-gradient-accent grid place-items-center shadow-glow">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div className="text-left">
            <div className="font-display font-bold text-lg leading-none">CareerAI</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Resume → Offer
            </div>
          </div>
        </button>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#how" className="hover:text-foreground transition">How it works</a>
        </nav>
      </div>
    </header>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  const features = [
    { icon: FileText, title: "Resume Analyzer", desc: "Deep parsing of skills, strengths and weak areas." },
    { icon: Target, title: "ATS Engine", desc: "Match scores plus matched & missing keywords." },
    { icon: Brain, title: "Skill Gap AI", desc: "Why each missing skill matters, with examples." },
    { icon: Map, title: "Personalized Roadmap", desc: "Day-by-day plan tailored to your timeline." },
    { icon: MessageSquare, title: "Mock Interview", desc: "AI evaluates technical accuracy & communication." },
    { icon: Trophy, title: "Readiness Score", desc: "Premium dashboard for your job readiness." },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6">
      <section className="pt-20 pb-16 text-center relative">
        <Badge className="bg-secondary/70 text-foreground border border-border mb-6">
          <Sparkles className="size-3 mr-1" /> AI-powered career coaching
        </Badge>
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] max-w-4xl mx-auto">
          From <span className="text-gradient">Resume</span> to <br className="hidden md:block" />
          <span className="text-gradient">Job Offer</span>.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Your personal AI career coach — analyzes your resume, scores you against any job, builds
          a personalized roadmap, and prepares you for interviews.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button size="lg" onClick={onStart} className="bg-gradient-accent text-primary-foreground shadow-glow hover:opacity-95 h-12 px-6 text-base">
            Start your analysis <ArrowRight className="size-4 ml-1" />
          </Button>
          <Button size="lg" variant="outline" asChild className="h-12 px-6">
            <a href="#features">Explore features</a>
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { k: "10", v: "AI Modules" },
            { k: "9", v: "Score Metrics" },
            { k: "5", v: "Timeline Plans" },
            { k: "∞", v: "Roles Covered" },
          ].map((s) => (
            <div key={s.v} className="glass rounded-2xl px-4 py-5">
              <div className="text-3xl font-display font-bold text-gradient">{s.k}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold">Everything in one place</h2>
          <p className="text-muted-foreground mt-3">Ten AI modules working together for your career.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title} className="bg-gradient-card border-border/60 p-6 hover:border-primary/40 transition group">
              <div className="size-11 rounded-xl bg-secondary grid place-items-center mb-4 group-hover:bg-primary/20 transition">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="how" className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { n: "01", icon: Upload, t: "Upload & describe", d: "Drop your resume PDF and paste the job description." },
            { n: "02", icon: Brain, t: "AI analyzes", d: "Gemini scores ATS fit, surfaces gaps, builds a roadmap." },
            { n: "03", icon: Rocket, t: "You execute", d: "Follow the daily plan and ace the interview." },
          ].map((s) => (
            <Card key={s.n} className="bg-gradient-card border-border/60 p-7">
              <div className="text-xs text-muted-foreground tracking-widest">STEP {s.n}</div>
              <s.icon className="size-7 text-primary mt-3" />
              <div className="font-display font-semibold text-xl mt-3">{s.t}</div>
              <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button size="lg" onClick={onStart} className="bg-gradient-accent text-primary-foreground shadow-glow h-12 px-6">
            Get started free <ArrowRight className="size-4 ml-1" />
          </Button>
        </div>
      </section>
    </main>
  );
}



function InputForm(props: {
  resumeText: string;
  setResumeText: (s: string) => void;
  resumeFileName: string | null;
  jd: string;
  setJd: (s: string) => void;
  role: string;
  setRole: (s: string) => void;
  experience: Experience;
  setExperience: (e: Experience) => void;
  timeline: Timeline;
  setTimeline: (t: Timeline) => void;
  loading: boolean;
  onPdf: (f: File) => void;
  onRun: () => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
}) {
  const {
    resumeText, setResumeText, resumeFileName, jd, setJd, role, setRole,
    experience, setExperience, timeline, setTimeline, loading, onPdf, onRun, fileRef,
  } = props;

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <Badge className="bg-secondary/70 border border-border mb-4">
          <FileText className="size-3 mr-1" /> Step 1 — Tell us about you
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold">Let&apos;s build your career plan</h1>
        <p className="text-muted-foreground mt-3">It takes ~30 seconds. Your data stays in your browser.</p>
      </div>

      <Card className="bg-gradient-card border-border/60 p-6 md:p-8 space-y-8">
        {/* Resume */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Resume</Label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-secondary/30 transition"
          >
            <Upload className="size-7 mx-auto text-primary mb-2" />
            <div className="font-medium">
              {resumeFileName ?? "Drop or click to upload your resume (PDF)"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {resumeText ? `${resumeText.length.toLocaleString()} characters extracted` : "We extract text in your browser — no upload required."}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPdf(f);
              }}
            />
          </div>
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">Or paste resume text</summary>
            <Textarea
              className="mt-3 min-h-[160px] bg-input/60"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </details>
        </div>

        {/* JD */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Job Description</Label>
          <Textarea
            className="min-h-[180px] bg-input/60"
            placeholder="Paste the full job description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label>Target Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              placeholder="Or type a custom role"
              className="bg-input/60"
              onBlur={(e) => e.target.value && setRole(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Experience Level</Label>
            <Select value={experience} onValueChange={(v) => setExperience(v as Experience)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="fresher">Fresher</SelectItem>
                <SelectItem value="experienced">Experienced Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preparation Timeline</Label>
            <Select value={timeline} onValueChange={(v) => setTimeline(v as Timeline)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1week">1 Week</SelectItem>
                <SelectItem value="2weeks">2 Weeks</SelectItem>
                <SelectItem value="1month">1 Month</SelectItem>
                <SelectItem value="2months">2 Months</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            size="lg"
            disabled={loading}
            onClick={onRun}
            className="bg-gradient-accent text-primary-foreground shadow-glow h-12 px-8"
          >
            {loading ? (
              <><Loader2 className="size-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <>Run analysis <Sparkles className="size-4 ml-2" /></>
            )}
          </Button>
        </div>
      </Card>
    </main>
  );
}



function Dashboard({
  analysis, role, onRestart,
}: { analysis: Analysis; role: string; onRestart: () => void }) {
  const r = analysis.readiness;
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <Badge className="bg-secondary/70 border border-border mb-2">
            <Briefcase className="size-3 mr-1" /> Target: {role}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">Your Job Readiness Dashboard</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{r.summary}</p>
        </div>
        <Button variant="outline" onClick={onRestart}>New analysis</Button>
      </div>

      {/* Readiness scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <ScoreCard label="Overall" value={r.overallScore} hero />
        <ScoreCard label="ATS Match" value={r.atsScore} />
        <ScoreCard label="Skill Gap" value={r.skillGapScore} />
        <ScoreCard label="Resume Quality" value={r.resumeQualityScore} />
        <ScoreCard label="Interview Ready" value={r.interviewReadinessScore} />
      </div>

      <Tabs defaultValue="resume" className="space-y-6">
        <TabsList className="bg-card/60 border border-border/60 p-1 h-auto flex-wrap justify-start gap-1">
          {[
            { v: "resume", l: "Resume", i: FileText },
            { v: "jd", l: "Job Desc", i: Briefcase },
            { v: "ats", l: "ATS", i: Target },
            { v: "gap", l: "Skill Gap", i: Brain },
            { v: "optimize", l: "Optimizer", i: Sparkles },
            { v: "roadmap", l: "Roadmap", i: Map },
            { v: "interview", l: "Interview Prep", i: MessageSquare },
            { v: "mock", l: "Mock Interview", i: GraduationCap },
            { v: "resources", l: "Resources", i: BookOpen },
          ].map((t) => (
            <TabsTrigger key={t.v} value={t.v} className="data-[state=active]:bg-gradient-accent data-[state=active]:text-primary-foreground gap-1.5">
              <t.i className="size-3.5" /> {t.l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="resume"><ResumeView a={analysis} /></TabsContent>
        <TabsContent value="jd"><JdView a={analysis} /></TabsContent>
        <TabsContent value="ats"><AtsView a={analysis} /></TabsContent>
        <TabsContent value="gap"><GapView a={analysis} /></TabsContent>
        <TabsContent value="optimize"><OptimizeView a={analysis} /></TabsContent>
        <TabsContent value="roadmap"><RoadmapView a={analysis} /></TabsContent>
        <TabsContent value="interview"><InterviewView a={analysis} /></TabsContent>
        <TabsContent value="mock"><MockInterview a={analysis} role={role} /></TabsContent>
        <TabsContent value="resources"><ResourcesView a={analysis} /></TabsContent>
      </Tabs>
    </main>
  );
}

function ScoreCard({ label, value, hero }: { label: string; value: number; hero?: boolean }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const color =
    v >= 80 ? "text-success" : v >= 60 ? "text-primary" : v >= 40 ? "text-warning" : "text-destructive";
  return (
    <Card className={`bg-gradient-card border-border/60 p-5 ${hero ? "ring-1 ring-primary/40 shadow-glow" : ""}`}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display font-bold mt-1 ${hero ? "text-5xl" : "text-3xl"} ${color}`}>
        {v}<span className="text-base text-muted-foreground font-normal">/100</span>
      </div>
      <Progress value={v} className="mt-3 h-1.5" />
    </Card>
  );
}


function Section({ title, icon: Icon, children, desc }: { title: string; icon: React.ElementType; children: React.ReactNode; desc?: string }) {
  return (
    <Card className="bg-gradient-card border-border/60 p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="size-9 rounded-lg bg-primary/15 grid place-items-center">
          <Icon className="size-4 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">{title}</h3>
          {desc && <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

function Chips({ items, variant = "default" }: { items: string[]; variant?: "default" | "success" | "danger" | "primary" }) {
  const cls = {
    default: "bg-secondary text-foreground",
    success: "bg-success/15 text-success border border-success/30",
    danger: "bg-destructive/15 text-destructive border border-destructive/30",
    primary: "bg-primary/15 text-primary border border-primary/30",
  }[variant];
  return (
    <div className="flex flex-wrap gap-2">
      {items?.map((it, i) => (
        <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${cls}`}>{it}</span>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items?.map((it, i) => (
        <li key={i} className="flex gap-2 text-sm">
          <span className="text-primary mt-1.5">•</span>
          <span className="text-foreground/90">{it}</span>
        </li>
      ))}
    </ul>
  );
}


function ResumeView({ a }: { a: Analysis }) {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Section title="Resume Summary" icon={FileText} desc={a.resume.category}>
        <p className="text-sm text-foreground/90 leading-relaxed">{a.resume.summary}</p>
        <div className="mt-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Key Skills</div>
          <Chips items={a.resume.keySkills} variant="primary" />
        </div>
      </Section>
      <Section title="Strengths" icon={CheckCircle2}>
        <BulletList items={a.resume.strengths} />
      </Section>
      <Section title="Weak Areas" icon={XCircle}>
        <BulletList items={a.resume.weakAreas} />
      </Section>
    </div>
  );
}

function JdView({ a }: { a: Analysis }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Section title="Required Skills" icon={Target}><Chips items={a.jd.requiredSkills} variant="primary" /></Section>
      <Section title="Preferred Skills" icon={Sparkles}><Chips items={a.jd.preferredSkills} /></Section>
      <Section title="Technologies" icon={Brain}><Chips items={a.jd.technologies} /></Section>
      <Section title="Key Keywords" icon={Lightbulb}><Chips items={a.jd.keywords} /></Section>
      <Section title="Responsibilities" icon={Briefcase}><BulletList items={a.jd.responsibilities} /></Section>
      <Section title="Interview Topics" icon={MessageSquare}><Chips items={a.jd.interviewTopics} variant="primary" /></Section>
    </div>
  );
}

function AtsView({ a }: { a: Analysis }) {
  const items = [
    { label: "ATS Match", v: a.ats.atsMatchScore },
    { label: "Skill Match", v: a.ats.skillMatchScore },
    { label: "Keyword Match", v: a.ats.keywordMatchScore },
  ];
  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-3 gap-5">
        {items.map((it) => (
          <Card key={it.label} className="bg-gradient-card border-border/60 p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{it.label}</div>
            <div className="mt-3 flex items-end gap-2">
              <div className="font-display font-bold text-5xl text-gradient">{Math.round(it.v)}</div>
              <div className="text-muted-foreground pb-2">/100</div>
            </div>
            <Progress value={it.v} className="mt-4 h-2" />
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <Section title="Matched Skills" icon={CheckCircle2}><Chips items={a.ats.matchedSkills} variant="success" /></Section>
        <Section title="Missing Skills" icon={XCircle}><Chips items={a.ats.missingSkills} variant="danger" /></Section>
        <Section title="Matched Keywords" icon={CheckCircle2}><Chips items={a.ats.matchedKeywords} variant="success" /></Section>
        <Section title="Missing Keywords" icon={XCircle}><Chips items={a.ats.missingKeywords} variant="danger" /></Section>
      </div>
    </div>
  );
}

function GapView({ a }: { a: Analysis }) {
  return (
    <div className="space-y-4">
      {a.skillGap.map((s, i) => (
        <Card key={i} className="bg-gradient-card border-border/60 p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-accent grid place-items-center text-primary-foreground font-bold">
                {s.skill[0]}
              </div>
              <div>
                <div className="font-display font-semibold text-lg">{s.skill}</div>
                <Badge variant="outline" className="mt-1 text-xs">{s.importance}</Badge>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <Field label="Why it matters">{s.whyItMatters}</Field>
            <Field label="Industry usage">{s.industryUsage}</Field>
            <Field label="Learning path">{s.learningPath}</Field>
            <Field label="Interview relevance">{s.interviewRelevance}</Field>
            <div className="md:col-span-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Resume bullet example</div>
              <div className="rounded-lg bg-secondary/60 p-3 border border-border/60 italic text-foreground/90">
                &quot;{s.resumeBulletExample}&quot;
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-foreground/90">{children}</div>
    </div>
  );
}

function OptimizeView({ a }: { a: Analysis }) {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Section title="Missing Keywords to Add" icon={Target}>
        <Chips items={a.optimizer.missingKeywords} variant="danger" />
      </Section>
      <Section title="ATS Optimization" icon={Sparkles}><BulletList items={a.optimizer.atsSuggestions} /></Section>
      <Section title="Resume Improvements" icon={Lightbulb}><BulletList items={a.optimizer.resumeImprovements} /></Section>
      <Section title="Profile Enhancements" icon={Rocket}><BulletList items={a.optimizer.profileEnhancements} /></Section>
      <Card className="bg-gradient-card border-border/60 p-6 lg:col-span-2">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="size-4 text-primary" /> Better Resume Bullets
        </h3>
        <div className="space-y-4">
          {a.optimizer.betterBullets?.map((b, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-3">
              <div className="rounded-lg p-3 bg-destructive/10 border border-destructive/30">
                <div className="text-xs uppercase tracking-wider text-destructive mb-1">Before</div>
                <div className="text-sm">{b.before}</div>
              </div>
              <div className="rounded-lg p-3 bg-success/10 border border-success/30">
                <div className="text-xs uppercase tracking-wider text-success mb-1">After</div>
                <div className="text-sm">{b.after}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RoadmapView({ a }: { a: Analysis }) {
  const r = a.roadmap;
  return (
    <div className="space-y-5">
      <Card className="bg-gradient-card border-border/60 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Your roadmap</div>
          <h3 className="font-display font-bold text-2xl mt-1">{r.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{r.totalDays} days · {r.weeks.length} weeks</p>
        </div>
        <Badge className="bg-gradient-accent text-primary-foreground border-0">{r.interviewPrepPhase}</Badge>
      </Card>

      <Accordion type="multiple" defaultValue={["w1"]} className="space-y-3">
        {r.weeks.map((w) => (
          <AccordionItem key={w.weekNumber} value={`w${w.weekNumber}`} className="border border-border/60 rounded-xl bg-gradient-card px-5">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="size-9 rounded-lg bg-primary/15 text-primary grid place-items-center font-bold text-sm">
                  W{w.weekNumber}
                </div>
                <div>
                  <div className="font-display font-semibold">{w.theme}</div>
                  <div className="text-xs text-muted-foreground">{w.goals?.length || 0} goals · {w.learningTopics?.length || 0} topics</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-5 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Weekly goals"><BulletList items={w.goals} /></Field>
                <Field label="Learning topics"><Chips items={w.learningTopics} variant="primary" /></Field>
                <Field label="Practice tasks"><BulletList items={w.practiceTasks} /></Field>
                <Field label="Mini project"><div className="rounded-lg bg-secondary/60 p-3 border border-border/60">{w.miniProject}</div></Field>
              </div>
              {w.days && w.days.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Daily plan</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {w.days.map((d) => (
                      <div key={d.day} className="rounded-lg p-3 border border-border/60 bg-secondary/40">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Day {d.day}</Badge>
                          <span className="text-sm font-medium">{d.focus}</span>
                        </div>
                        <ul className="text-xs space-y-1 text-foreground/80">
                          {d.tasks?.map((t, i) => <li key={i}>• {t}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Section title="Portfolio work" icon={Rocket}><BulletList items={r.portfolioWork} /></Section>
    </div>
  );
}

function InterviewView({ a }: { a: Analysis }) {
  const sections = [
    { t: "Technical", items: a.interview.technical, icon: Brain },
    { t: "Resume-Based", items: a.interview.resumeBased, icon: FileText },
    { t: "Project-Based", items: a.interview.projectBased, icon: Rocket },
    { t: "JD-Based", items: a.interview.jdBased, icon: Briefcase },
    { t: "HR / Behavioral", items: a.interview.hr, icon: MessageSquare },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {sections.map((s) => (
        <Section key={s.t} title={`${s.t} Questions`} icon={s.icon}>
          <ol className="space-y-2.5 list-decimal list-inside text-sm">
            {s.items?.map((q, i) => (
              <li key={i} className="text-foreground/90 leading-relaxed">{q}</li>
            ))}
          </ol>
        </Section>
      ))}
    </div>
  );
}

interface Eval {
  technicalAccuracy: number;
  communication: number;
  completeness: number;
  overall: number;
  feedback: string;
  improvements: string[];
  idealAnswer: string;
}

function MockInterview({ a, role }: { a: Analysis; role: string }) {
  const runEval = useServerFn(evaluateAnswer);
  const questions = useMemo(
    () => [
      ...a.interview.technical,
      ...a.interview.jdBased,
      ...a.interview.projectBased,
    ].filter(Boolean),
    [a],
  );
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Eval | null>(null);
  const [loading, setLoading] = useState(false);

  const current = questions[idx % questions.length];

  const submit = async () => {
    if (answer.trim().length < 5) {
      toast.error("Type your answer first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const out = (await runEval({ data: { question: current, answer, targetRole: role } })) as unknown as Eval;
      setResult(out);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    setIdx((i) => i + 1);
    setAnswer("");
    setResult(null);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card className="bg-gradient-card border-border/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline">Question {(idx % questions.length) + 1} of {questions.length}</Badge>
          <Button variant="ghost" size="sm" onClick={next}>Skip →</Button>
        </div>
        <h3 className="font-display font-semibold text-xl leading-snug">{current}</h3>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="mt-5 min-h-[200px] bg-input/60"
          placeholder="Type your answer as you would speak it in an interview..."
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={submit} disabled={loading} className="bg-gradient-accent text-primary-foreground shadow-glow">
            {loading ? <><Loader2 className="size-4 mr-2 animate-spin" /> Evaluating</> : <><Send className="size-4 mr-2" /> Submit answer</>}
          </Button>
        </div>
      </Card>

      <Card className="bg-gradient-card border-border/60 p-6 min-h-[400px]">
        {!result && !loading && (
          <div className="h-full grid place-items-center text-center text-muted-foreground">
            <div>
              <GraduationCap className="size-10 mx-auto mb-3 text-primary/60" />
              <p>Your feedback will appear here.</p>
            </div>
          </div>
        )}
        {loading && (
          <div className="h-full grid place-items-center text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}
        {result && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <MiniScore label="Technical" v={result.technicalAccuracy} />
              <MiniScore label="Communication" v={result.communication} />
              <MiniScore label="Completeness" v={result.completeness} />
              <MiniScore label="Overall" v={result.overall} hero />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Feedback</div>
              <p className="text-sm text-foreground/90">{result.feedback}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Improvements</div>
              <BulletList items={result.improvements} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Ideal answer</div>
              <div className="rounded-lg p-3 bg-success/10 border border-success/30 text-sm prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{result.idealAnswer}</ReactMarkdown>
              </div>
            </div>
            <Button variant="outline" onClick={next} className="w-full">Next question →</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function MiniScore({ label, v, hero }: { label: string; v: number; hero?: boolean }) {
  const val = Math.round(v);
  const color = val >= 80 ? "text-success" : val >= 60 ? "text-primary" : val >= 40 ? "text-warning" : "text-destructive";
  return (
    <div className={`rounded-lg p-3 border border-border/60 bg-secondary/40 ${hero ? "ring-1 ring-primary/40" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display font-bold text-2xl ${color}`}>{val}<span className="text-xs text-muted-foreground">/100</span></div>
      <Progress value={val} className="h-1 mt-2" />
    </div>
  );
}

function ResourcesView({ a }: { a: Analysis }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {a.resources?.map((r, i) => (
        <Card key={i} className="bg-gradient-card border-border/60 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="size-4 text-primary" />
            <h3 className="font-display font-semibold text-lg">{r.skill}</h3>
          </div>
          <ResourceList title="Free courses" items={r.freeCourses} />
          <ResourceList title="Documentation" items={r.documentation} />
          <ResourceList title="YouTube" items={r.youtube} />
          <ResourceList title="Practice" items={r.practicePlatforms} />
          {r.projectIdeas?.length > 0 && (
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Project ideas</div>
              <BulletList items={r.projectIdeas} />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function ResourceList({ title, items }: { title: string; items?: Array<{ name: string; url: string }> }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{title}</div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i}>
            <a
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-accent transition inline-flex items-center gap-1.5"
            >
              {it.name} <ExternalLink className="size-3" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
