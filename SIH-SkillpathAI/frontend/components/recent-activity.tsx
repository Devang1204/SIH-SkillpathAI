const activity = [
  { label: "Completed Assessment: Python Basics", time: "2 days ago" },
  { label: "Completed Project: Sales Data Analysis", time: "5 days ago" },
  { label: "Started Course: SQL for Data Science", time: "1 week ago" },
]

export function RecentActivity() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
        <button className="text-sm font-medium text-primary hover:underline">View All</button>
      </div>

      <ul className="mt-4 flex flex-col">
        {activity.map((a) => (
          <li
            key={a.label}
            className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0"
          >
            <span className="text-sm text-foreground">{a.label}</span>
            <span className="whitespace-nowrap text-xs text-muted-foreground">{a.time}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
