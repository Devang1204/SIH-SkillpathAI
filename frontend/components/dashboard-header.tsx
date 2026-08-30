"use client"

export function DashboardHeader({
  title = "Dashboard",
}: {
  title?: string
}) {
  return (
    <header className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
    </header>
  )
}