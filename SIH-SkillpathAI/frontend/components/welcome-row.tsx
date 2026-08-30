import { Target } from "lucide-react"

export function WelcomeRow() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xs">
            <h2 className="text-xl font-bold text-foreground">
              Hello, Ananya! <span aria-hidden="true">👋</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Let&apos;s bridge your skills gap and achieve your dream role.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Target className="size-7" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Target Role</p>
              <p className="text-lg font-bold text-foreground">Data Scientist</p>
              <button className="text-sm font-medium text-primary hover:underline">
                Change Role
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-medium text-muted-foreground">Profile Strength</p>
        <p className="mt-1 text-3xl font-bold text-foreground">72%</p>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: "72%" }} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Keep going!</p>
      </div>
    </div>
  )
}
