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

export default function Page() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-x-hidden px-5 py-6 md:px-8">
        <DashboardHeader />

        <div className="mt-6 flex flex-col gap-5">
          <WelcomeRow />
          <StatCards />

          <div className="grid gap-5 xl:grid-cols-3">
            <div className="flex flex-col gap-5 xl:col-span-2">
              <SkillGapOverview />
              <div className="grid gap-5 md:grid-cols-2">
                <Strengths />
                <RecentActivity />
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <RecommendedSkills />
              <RoadmapProgress />
              <AiRecommendation />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
