export function RoadmapProgress() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">Learning Roadmap Progress</h3>
        <button className="text-sm font-medium text-primary hover:underline">View Roadmap</button>
      </div>

      <p className="mt-4 text-sm font-medium text-foreground">Stage 2 of 5: Core Data Science</p>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: "40%" }} />
        </div>
        <span className="text-sm font-semibold text-foreground">40%</span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">2 of 5 skills completed in this stage</p>
    </section>
  )
}
