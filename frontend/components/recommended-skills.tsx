const skills = [
  { rank: 1, label: "Python Advanced", level: "High" },
  { rank: 2, label: "Machine Learning", level: "High" },
  { rank: 3, label: "SQL for Data Science", level: "Medium" },
  { rank: 4, label: "Statistics & Probability", level: "Medium" },
]

function LevelBadge({ level }: { level: string }) {
  const styles =
    level === "High"
      ? "bg-primary/10 text-primary"
      : "bg-warning/20 text-warning-foreground"
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles}`}>{level}</span>
  )
}

export function RecommendedSkills() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">Recommended Next Skills</h3>
        <button className="text-sm font-medium text-primary hover:underline">View All</button>
      </div>

      <ul className="mt-4 flex flex-col">
        {skills.map((s) => (
          <li
            key={s.rank}
            className="flex items-center gap-3 border-b border-border py-3 last:border-0"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
              {s.rank}
            </span>
            <span className="text-sm font-medium text-foreground">{s.label}</span>
            <span className="ml-auto">
              <LevelBadge level={s.level} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
