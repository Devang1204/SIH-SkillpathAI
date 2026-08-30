import { Briefcase, TrendingUp, BookOpen } from "lucide-react"

function Sparkline() {
  return (
    <svg viewBox="0 0 120 48" className="h-12 w-24 text-primary" fill="none" aria-hidden="true">
      <path
        d="M2 34 C 14 34, 18 20, 30 22 S 46 38, 58 30 S 74 10, 86 16 S 104 30, 118 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function StatCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-medium text-muted-foreground">Overall Skill Match</p>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">61%</p>
            <p className="mt-1 text-xs text-muted-foreground">You&apos;re making progress!</p>
          </div>
          <Sparkline />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Skills You Have</p>
            <p className="mt-2 text-3xl font-bold text-foreground">28</p>
            <p className="mt-1 text-xs text-muted-foreground">Out of 52</p>
          </div>
          <span className="flex size-11 items-center justify-center rounded-xl bg-success/15 text-success-foreground">
            <Briefcase className="size-5" />
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Skills to Improve</p>
            <p className="mt-2 text-3xl font-bold text-foreground">17</p>
            <p className="mt-1 text-xs text-muted-foreground">High priority</p>
          </div>
          <span className="flex size-11 items-center justify-center rounded-xl bg-warning/20 text-warning-foreground">
            <TrendingUp className="size-5" />
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Recommended Next</p>
            <p className="mt-2 text-lg font-bold text-foreground">Python Advanced</p>
            <p className="mt-1 text-xs text-muted-foreground">Start learning</p>
          </div>
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </span>
        </div>
      </div>
    </div>
  )
}
