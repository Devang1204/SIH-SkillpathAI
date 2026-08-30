"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { WelcomeRow } from "@/components/welcome-row"
import { StatCards } from "@/components/stat-cards"
import { SkillGapOverview } from "@/components/skill-gap-overview"
import { RecommendedSkills } from "@/components/recommended-skills"
import { RoadmapProgress } from "@/components/roadmap-progress"
import { AiRecommendation } from "@/components/ai-recommendation"
import { Strengths } from "@/components/strengths"
import { RecentActivity } from "@/components/recent-activity"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8002"

type SkillMatch = {
  student_id: string
  target_role: string
  student_skills: string[]
  required_skills: string[]
  matched_skills: string[]
  missing_skills: string[]
  match_percentage: number
}

type Student = {
  student_id: string
  name: string | null
}

type RoadmapPhase = {
  title: string
  duration: string
  skills: string[]
  topics: string[]
  project: string
}

type Roadmap = {
  status: string
  role: string
  phases: RoadmapPhase[]
}

type RoadmapResponse = {
  status: string
  student_id: string
  target_role: string
  roadmap_id?: string
  matched_skills: string[]
  missing_skills: string[]
  roadmap: Roadmap
}

export default function Page() {
  const [skillMatch, setSkillMatch] = useState<SkillMatch | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("skillMatch")

    if (stored) {
      try {
        setSkillMatch(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse skillMatch from localStorage", e)
      }
    }

    setIsLoading(false)
  }, [])

  // Fetch actual student information from the backend.
  useEffect(() => {
    if (!skillMatch?.student_id) {
      return
    }

    const fetchStudent = async () => {
      try {
        const response = await fetch(
          `${API_URL}/student/${skillMatch.student_id}`
        )

        if (!response.ok) {
          throw new Error(
            `Student API failed with status ${response.status}`
          )
        }

        const data: Student = await response.json()

        setStudent(data)
      } catch (error) {
        console.error("Failed to fetch student:", error)
      }
    }

    fetchStudent()
  }, [skillMatch])

  // Generate the personalized roadmap.
  useEffect(() => {
    if (!skillMatch) {
      return
    }

    const generateRoadmap = async () => {
      setIsRoadmapLoading(true)

      try {
        const response = await fetch(`${API_URL}/roadmap`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: skillMatch.student_id,
            target_role: skillMatch.target_role,
          }),
        })

        if (!response.ok) {
          throw new Error(
            `Roadmap API failed with status ${response.status}`
          )
        }

        const data: RoadmapResponse = await response.json()

        if (data.roadmap?.status === "ok") {
          setRoadmap(data.roadmap)
        } else {
          console.error("Roadmap generation failed:", data.roadmap)
        }
      } catch (error) {
        console.error("Failed to generate roadmap:", error)
      } finally {
        setIsRoadmapLoading(false)
      }
    }

    generateRoadmap()
  }, [skillMatch])

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="sticky top-0 hidden h-screen lg:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-x-hidden px-5 py-6 md:px-8">
          <DashboardHeader />

          <div className="mt-6 text-muted-foreground">
            Loading...
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-x-hidden px-5 py-6 md:px-8">
        <DashboardHeader />

        {!skillMatch ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-lg font-semibold text-foreground">
              Upload your resume to get started
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Go to the Profile section and upload your resume to analyze your
              skills.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            <WelcomeRow
              studentName={student?.name || "Student"}
              targetRole={skillMatch.target_role}
            />

            <StatCards
              matchPercentage={skillMatch.match_percentage}
              matchedSkillsCount={skillMatch.matched_skills.length}
              missingSkillsCount={skillMatch.missing_skills.length}
            />

            <div className="grid gap-5 xl:grid-cols-3">
              <div className="flex flex-col gap-5 xl:col-span-2">
                <SkillGapOverview
                  targetRole={skillMatch.target_role}
                  missingSkillsCount={skillMatch.missing_skills.length}
                  matchedSkillsCount={skillMatch.matched_skills.length}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <Strengths
                    matchedSkills={skillMatch.matched_skills}
                  />

                  <RecentActivity />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <RecommendedSkills
                  missingSkills={skillMatch.missing_skills}
                />

                <RoadmapProgress
                  roadmap={roadmap}
                  isLoading={isRoadmapLoading}
                />

                <AiRecommendation />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}