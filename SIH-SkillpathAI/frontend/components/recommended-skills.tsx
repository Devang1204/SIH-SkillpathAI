function LevelBadge({ level }: { level: string }) {
  const styles =
    level === "High"
      ? "bg-primary/10 text-primary"
      : "bg-warning/20 text-warning-foreground"
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles}`}>{level}</span>
  )
}

interface RecommendedSkillsProps {
  missingSkills?: string[]
}

export function RecommendedSkills({ missingSkills = [] }: RecommendedSkillsProps) {
  const displaySkills = missingSkills.slice(0, 4).map((skill, idx) => ({
    rank: idx + 1,
    label: skill,
    level: idx < 2 ? "High" : "Medium",
  }))

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">Recommended Next Skills</h3>
        {displaySkills.length > 0 && <button className="text-sm font-medium text-primary hover:underline">View All</button>}
      </div>

      {displaySkills.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No missing skills. You&apos;re all set!</p>
      ) : (
        <ul className="mt-4 flex flex-col">
          {displaySkills.map((s) => (
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
      )}
    </section>
  )
}
