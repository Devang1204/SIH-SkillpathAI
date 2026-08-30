import { CheckCircle2 } from "lucide-react"

const strengths = ["Python Basics", "Data Analysis", "Excel"]

export function Strengths() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">Your Strengths</h3>
        <button className="text-sm font-medium text-primary hover:underline">View All</button>
      </div>

      <ul className="mt-4 flex flex-col">
        {strengths.map((s) => (
          <li
            key={s}
            className="flex items-center gap-3 border-b border-border py-3 last:border-0"
          >
            <CheckCircle2 className="size-5 text-success" />
            <span className="text-sm font-medium text-foreground">{s}</span>
            <span className="ml-auto rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success-foreground">
              Strong
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
