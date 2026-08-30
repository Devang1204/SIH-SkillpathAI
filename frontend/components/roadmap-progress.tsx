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

interface RoadmapProgressProps {
  roadmap: Roadmap | null
  isLoading?: boolean
}

export function RoadmapProgress({
  roadmap,
  isLoading = false,
}: RoadmapProgressProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">
            Learning Roadmap Progress
          </h3>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Generating your personalized roadmap...
        </p>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
      </section>
    )
  }

  if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">
            Learning Roadmap Progress
          </h3>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Your personalized roadmap will appear here.
        </p>
      </section>
    )
  }

  const totalStages = roadmap.phases.length

  // Since newly generated roadmap steps are not completed yet,
  // the first stage is treated as the current stage.
  const currentStage = 1
  const progressPercentage = Math.round(
    ((currentStage - 1) / totalStages) * 100
  )

  const currentPhase = roadmap.phases[currentStage - 1]

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-foreground">
          Learning Roadmap Progress
        </h3>

        <button className="text-sm font-medium text-primary hover:underline">
          View Roadmap
        </button>
      </div>

      <p className="mt-4 text-sm font-medium text-foreground">
        Stage {currentStage} of {totalStages}: {currentPhase.title}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <span className="text-sm font-semibold text-foreground">
          {progressPercentage}%
        </span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {currentPhase.skills.length > 0
          ? `Focus: ${currentPhase.skills.join(", ")}`
          : currentPhase.duration}
      </p>

      <div className="mt-4 rounded-xl bg-secondary/40 p-3">
        <p className="text-xs font-semibold text-foreground">
          {currentPhase.duration}
        </p>

        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {currentPhase.project}
        </p>
      </div>
    </section>
  )
}