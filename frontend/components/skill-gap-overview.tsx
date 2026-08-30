import { Button } from "@/components/ui/button"

const priorities = [
  { label: "High Priority", count: 6, color: "var(--danger)" },
  { label: "Medium Priority", count: 7, color: "var(--warning)" },
  { label: "Low Priority", count: 4, color: "var(--success)" },
]

const topGaps = [
  { label: "Machine Learning", value: 20, color: "var(--danger)" },
  { label: "Deep Learning", value: 15, color: "var(--danger)" },
  { label: "SQL", value: 30, color: "var(--warning)" },
  { label: "Data Visualization", value: 40, color: "var(--warning)" },
  { label: "Statistics", value: 50, color: "var(--warning)" },
]

function Donut() {
  const r = 70
  const c = 2 * Math.PI * r
  const total = 17
  const gap = 6
  const segments = [
    { count: 6, color: "var(--danger)" },
    { count: 7, color: "var(--warning)" },
    { count: 4, color: "var(--success)" },
  ]

  let offset = 0
  return (
    <svg viewBox="0 0 180 180" className="size-44 -rotate-90" aria-hidden="true">
      <circle cx="90" cy="90" r={r} fill="none" stroke="var(--secondary)" strokeWidth="16" />
      {segments.map((s, i) => {
        const len = (s.count / total) * c
        const dash = `${Math.max(len - gap, 0)} ${c - Math.max(len - gap, 0)}`
        const el = (
          <circle
            key={i}
            cx="90"
            cy="90"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={dash}
            strokeDashoffset={-offset}
          />
        )
        offset += len
        return el
      })}
    </svg>
  )
}

export function SkillGapOverview() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-bold text-foreground">Skill Gap Overview</h3>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <Donut />
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-foreground">17</span>
                <span className="text-xs text-muted-foreground">
                  Skills to
                  <br />
                  Improve
                </span>
              </div>
            </div>

            <ul className="flex flex-col gap-4">
              {priorities.map((p) => (
                <li key={p.label} className="flex items-center gap-3">
                  <span className="size-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-sm text-muted-foreground">{p.label}</span>
                  <span className="ml-auto text-sm font-semibold text-foreground">{p.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button variant="outline" className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/5 hover:text-primary">
            View All Skill Gaps
          </Button>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Top Skill Gaps</h4>
          <ul className="mt-4 flex flex-col gap-4">
            {topGaps.map((g) => (
              <li key={g.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{g.label}</span>
                  <span className="font-medium text-muted-foreground">{g.value}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${g.value}%`, backgroundColor: g.color }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
