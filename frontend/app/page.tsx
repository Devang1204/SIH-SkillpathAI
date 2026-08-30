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

type SkillMatch = {
  student_id: string
  target_role: string
  student_skills: string[]
  required_skills: string[]
  matched_skills: string[]
  missing_skills: string[]
  match_percentage: number
}

export default function Page() {
  const [skillMatch, setSkillMatch] = useState<SkillMatch | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="sticky top-0 hidden h-screen lg:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-x-hidden px-5 py-6 md:px-8">
          <DashboardHeader />
          <div className="mt-6 text-muted-foreground">Loading...</div>
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
            <p className="text-lg font-semibold text-foreground">Upload your resume to get started</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Go to the Profile section and upload your resume to analyze your skills.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            <WelcomeRow />
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
                  <Strengths matchedSkills={skillMatch.matched_skills} />
                  <RecentActivity />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <RecommendedSkills missingSkills={skillMatch.missing_skills} />
                <RoadmapProgress />
                <AiRecommendation />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
