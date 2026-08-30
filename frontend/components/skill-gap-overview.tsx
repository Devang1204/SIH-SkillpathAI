import { Button } from "@/components/ui/button"

interface SkillGapOverviewProps {
  targetRole?: string
  missingSkillsCount?: number
  matchedSkillsCount?: number
}

function Donut({
  total = 1,
  segments = [{ count: 0, color: "var(--secondary)" }],
}: {
  total?: number
  segments?: Array<{ count: number; color: string }>
}) {
  const r = 70
  const c = 2 * Math.PI * r
  const gap = 6

  let offset = 0

  return (
    <svg
      viewBox="0 0 180 180"
      className="size-44 -rotate-90"
      aria-hidden="true"
    >
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke="var(--secondary)"
        strokeWidth="16"
      />

      {segments.map((s, i) => {
        const len = (s.count / total) * c
        const dash = `${Math.max(len - gap, 0)} ${
          c - Math.max(len - gap, 0)
        }`

        const element = (
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

        return element
      })}
    </svg>
  )
}

export function SkillGapOverview({
  targetRole,
  missingSkillsCount = 0,
  matchedSkillsCount = 0,
}: SkillGapOverviewProps) {
  const totalSkills = matchedSkillsCount + missingSkillsCount || 1

  const matchPercentage =
    totalSkills > 0
      ? Math.round((matchedSkillsCount / totalSkills) * 100)
      : 0

  const gapPercentage = 100 - matchPercentage

  const priorities = [
    {
      label: "Matched",
      count: matchedSkillsCount,
      color: "var(--success)",
    },
    {
      label: "Missing",
      count: missingSkillsCount,
      color: "var(--danger)",
    },
  ]

  const segments = [
    {
      count: matchedSkillsCount,
      color: "var(--success)",
    },
    {
      count: missingSkillsCount,
      color: "var(--danger)",
    },
  ]

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-bold text-foreground">
        Skill Gap Overview{" "}
        {targetRole && `— ${targetRole}`}
      </h3>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <Donut
                total={totalSkills}
                segments={segments}
              />

              <div className="absolute flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-foreground">
                  {gapPercentage}%
                </span>

                <span className="text-xs text-muted-foreground">
                  Skills to
                  <br />
                  Improve
                </span>
              </div>
            </div>

            <ul className="flex flex-col gap-4">
              {priorities.map((p) => (
                <li
                  key={p.label}
                  className="flex items-center gap-3"
                >
                  <span
                    className="size-3 rounded-full"
                    style={{
                      backgroundColor: p.color,
                    }}
                  />

                  <span className="text-sm text-muted-foreground">
                    {p.label}
                  </span>

                  <span className="ml-auto text-sm font-semibold text-foreground">
                    {p.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
          >
            View All Skill Gaps
          </Button>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Match Summary
          </h4>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">
                  Overall Match
                </span>

                <span className="font-medium text-muted-foreground">
                  {matchPercentage}%
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{
                    width: `${matchPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                You have {matchedSkillsCount} matched skills out of{" "}
                {totalSkills} total.
              </p>

              {missingSkillsCount > 0 && (
                <p className="mt-1">
                  Focus on the {missingSkillsCount} missing skills
                  to improve your match.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}