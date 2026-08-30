"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader,
  Target,
  Wrench,
} from "lucide-react"

import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8002"

interface RoadmapPhase {
  title: string
  duration: string
  skills: string[]
  topics: string[]
  project: string
}

interface Roadmap {
  status: string
  role: string
  phases: RoadmapPhase[]
}

interface RoadmapResponse {
  status: string
  student_id: string
  target_role: string
  roadmap_id?: string
  matched_skills: string[]
  missing_skills: string[]
  roadmap: Roadmap
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] =
    useState<Roadmap | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const storedMatch =
          localStorage.getItem("skillMatch")

        const storedStudentId =
          localStorage.getItem("studentId")

        const storedRole =
          localStorage.getItem("targetRole")

        let studentId = storedStudentId
        let targetRole = storedRole

        /*
         * If studentId/role are not separately stored,
         * try to recover them from skillMatch.
         */
        if (storedMatch) {
          try {
            const match = JSON.parse(storedMatch)

            if (!studentId) {
              studentId = match.student_id
            }

            if (!targetRole) {
              targetRole = match.target_role
            }
          } catch {
            console.error(
              "Could not read stored skill match"
            )
          }
        }

        if (!studentId || !targetRole) {
          setError(
            "Please upload your resume and analyze your profile first."
          )
          setLoading(false)
          return
        }

        const response = await fetch(
          `${API_URL}/roadmap`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              student_id: studentId,
              target_role: targetRole,
            }),
          }
        )

        if (!response.ok) {
          throw new Error(
            `Roadmap API failed with status ${response.status}`
          )
        }

        const data: RoadmapResponse =
          await response.json()

        if (
          data.roadmap &&
          data.roadmap.status === "ok"
        ) {
          setRoadmap(data.roadmap)
        } else {
          setError(
            "The roadmap could not be generated right now."
          )
        }
      } catch (err) {
        console.error(
          "Failed to load roadmap:",
          err
        )

        setError(
          "Unable to connect to the roadmap service."
        )
      } finally {
        setLoading(false)
      }
    }

    loadRoadmap()
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar active="Roadmap" />
      </div>

      <main className="flex-1 overflow-x-hidden px-5 py-6 md:px-8">
        <DashboardHeader title="Learning Roadmap" />

        <div className="mx-auto mt-6 max-w-5xl">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>

          {loading && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card">
              <Loader className="size-8 animate-spin text-primary" />

              <p className="mt-4 text-sm font-medium text-foreground">
                Generating your personalized roadmap...
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                This may take a few moments.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Target className="mx-auto size-10 text-muted-foreground" />

              <h2 className="mt-4 text-lg font-bold text-foreground">
                Roadmap unavailable
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {error}
              </p>

              <Link
                href="/input"
                className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Go to Profile
              </Link>
            </div>
          )}

          {!loading &&
            !error &&
            roadmap && (
              <div className="flex flex-col gap-5">
                {/* Header */}
                <section className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Personalized Roadmap
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-foreground">
                        {roadmap.role}
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        A personalized learning path based
                        on your current skills and target
                        career.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                      <Target className="size-4" />

                      {roadmap.phases.length} Learning Stages
                    </div>
                  </div>
                </section>

                {/* Timeline */}
                <div className="flex flex-col gap-4">
                  {roadmap.phases.map(
                    (phase, index) => (
                      <section
                        key={`${phase.title}-${index}`}
                        className="relative rounded-2xl border border-border bg-card p-6"
                      >
                        <div className="flex gap-4">
                          {/* Number */}
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                  Stage {index + 1}
                                </p>

                                <h3 className="mt-1 text-lg font-bold text-foreground">
                                  {phase.title}
                                </h3>
                              </div>

                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Clock className="size-4" />

                                {phase.duration}
                              </div>
                            </div>

                            {/* Skills */}
                            {phase.skills &&
                              phase.skills.length >
                                0 && (
                                <div className="mt-5">
                                  <div className="flex items-center gap-2">
                                    <Wrench className="size-4 text-primary" />

                                    <h4 className="text-sm font-semibold text-foreground">
                                      Skills
                                    </h4>
                                  </div>

                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {phase.skills.map(
                                      (skill) => (
                                        <span
                                          key={
                                            skill
                                          }
                                          className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                                        >
                                          {skill}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Topics */}
                            {phase.topics &&
                              phase.topics.length >
                                0 && (
                                <div className="mt-5">
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="size-4 text-primary" />

                                    <h4 className="text-sm font-semibold text-foreground">
                                      Topics to Learn
                                    </h4>
                                  </div>

                                  <ul className="mt-2 grid gap-2 md:grid-cols-2">
                                    {phase.topics.map(
                                      (topic) => (
                                        <li
                                          key={
                                            topic
                                          }
                                          className="flex items-start gap-2 text-sm text-muted-foreground"
                                        >
                                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />

                                          {topic}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Project */}
                            {phase.project && (
                              <div className="mt-5 rounded-xl bg-secondary/40 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Recommended Project
                                </p>

                                <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">
                                  {phase.project}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </main>
    </div>
  )
}
