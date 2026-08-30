"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, ClipboardCheck, Loader, Sparkles } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

type Question = {
  id: string
  skill: string
  difficulty: string
  question: string
  options: string[]
}

type Assessment = {
  assessment_id: string
  title: string
  duration_minutes: number
  required_skills: string[]
  questions: Question[]
}

type Result = {
  score: number
  correct_answers: number
  total_questions: number
  skill_scores: Array<{ skill: string; score: number }>
  strengths: string[]
  focus_areas: string[]
}

export default function AssessmentPage() {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = window.sessionStorage.getItem("skillpath-assessment")
    if (!saved) return
    try {
      setAssessment(JSON.parse(saved))
    } catch {
      window.sessionStorage.removeItem("skillpath-assessment")
    }
  }, [])

  async function submitAssessment() {
    if (!assessment || Object.keys(answers).length !== assessment.questions.length) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/assessment/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: assessment.assessment_id,
          answers: Object.entries(answers).map(([question_id, selected_option]) => ({
            question_id,
            selected_option,
          })),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Could not score this assessment.")
      setResult(data)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not score this assessment.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 hidden h-screen lg:block"><Sidebar active="Assessments" /></div>
      <main className="flex-1 overflow-x-hidden px-5 py-6 md:px-8">
        <DashboardHeader title="Technical Assessment" />

        {!assessment ? (
          <section className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
            <ClipboardCheck className="mx-auto size-10 text-primary" />
            <h2 className="mt-4 text-xl font-bold text-foreground">No assessment is ready yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Complete your profile first, and we’ll create a role-based assessment from your skills.</p>
            <Link href="/input" className="mt-5 inline-flex h-8 items-center justify-center rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">Build my profile</Link>
          </section>
        ) : result ? (
          <section className="mx-auto mt-6 max-w-3xl rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-center gap-3 text-success-foreground"><CheckCircle2 className="size-7" /><div><h2 className="text-xl font-bold text-foreground">Assessment complete</h2><p className="text-sm text-muted-foreground">Your personalized results are ready.</p></div></div>
            <div className="mt-7 rounded-2xl bg-primary/10 p-6 text-center"><p className="text-sm text-muted-foreground">Overall score</p><p className="mt-1 text-5xl font-bold text-primary">{result.score}%</p><p className="mt-2 text-sm text-muted-foreground">{result.correct_answers} of {result.total_questions} correct</p></div>
            <h3 className="mt-7 font-bold text-foreground">Skill breakdown</h3>
            <div className="mt-3 flex flex-col gap-3">{result.skill_scores.map((item) => <div key={item.skill}><div className="flex justify-between text-sm"><span className="text-foreground">{item.skill}</span><span className="font-semibold text-foreground">{item.score}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${item.score}%` }} /></div></div>)}</div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-success/10 p-4"><p className="font-semibold text-success-foreground">Strengths</p><p className="mt-1 text-sm text-muted-foreground">{result.strengths.join(", ") || "Keep practising to build your strengths."}</p></div><div className="rounded-xl bg-warning/15 p-4"><p className="font-semibold text-warning-foreground">Focus next</p><p className="mt-1 text-sm text-muted-foreground">{result.focus_areas.join(", ") || "Excellent work across all assessed skills."}</p></div></div>
          </section>
        ) : (
          <section className="mx-auto mt-6 max-w-3xl">
            <div className="rounded-2xl border border-border bg-card p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-primary">Personalized technical test</p><h2 className="mt-1 text-xl font-bold text-foreground">{assessment.title}</h2><p className="mt-2 text-sm text-muted-foreground">{assessment.questions.length} questions · about {assessment.duration_minutes} minutes · based on your target role and declared skills</p></div><Sparkles className="size-6 text-primary" /></div></div>
            <div className="mt-5 flex flex-col gap-5">{assessment.questions.map((question, index) => <section key={question.id} className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-wide text-primary">{question.skill} · {question.difficulty}</p><span className="text-xs text-muted-foreground">Question {index + 1}</span></div><h3 className="mt-3 font-semibold text-foreground">{question.question}</h3><div className="mt-4 grid gap-2">{question.options.map((option, optionIndex) => <label key={option} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors", answers[question.id] === optionIndex ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/40")}><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} className="accent-primary" />{option}</label>)}</div></section>)}</div>
            {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
            <div className="mt-5 flex items-center justify-between gap-4"><p className="text-sm text-muted-foreground">{Object.keys(answers).length} of {assessment.questions.length} answered</p><Button onClick={submitAssessment} disabled={loading || Object.keys(answers).length !== assessment.questions.length} className="rounded-xl">{loading && <Loader className="size-4 animate-spin" />}{loading ? "Scoring..." : "Submit assessment"}</Button></div>
          </section>
        )}
      </main>
    </div>
  )
}
