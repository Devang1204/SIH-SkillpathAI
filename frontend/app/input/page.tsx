import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProfileInputForm } from "@/components/profile-input-form"

export default function InputPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar active="Profile" />
      </div>

      <main className="flex-1 overflow-x-hidden px-5 py-6 md:px-8">
        <DashboardHeader title="Build Your Profile" />

        <div className="mx-auto mt-6 max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground text-balance">
              Tell us about yourself
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The more you share, the sharper your personalized skill gap analysis and roadmap will
              be. All fields are optional, but a complete profile gives the best results.
            </p>
          </div>

          <div className="mt-5">
            <ProfileInputForm />
          </div>
        </div>
      </main>
    </div>
  )
}
