"use client"

import { Bell, ChevronDown } from "lucide-react"

export function DashboardHeader({ title = "Dashboard" }: { title?: string }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Bell className="size-5" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-danger ring-2 ring-background" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-secondary"
        >
          <img
            src="/avatar-ananya.png"
            alt="Ananya"
            className="size-9 rounded-full object-cover"
          />
          <span className="text-sm font-semibold text-foreground">Ananya</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}
