"use client"

import {
  LayoutDashboard,
  Target,
  Map,
  ClipboardCheck,
  FolderKanban,
  BookOpen,
  LineChart,
  User,
  Settings,
  BrainCircuit,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Skill Gap", icon: Target, href: "#" },
  { label: "Roadmap", icon: Map, href: "/roadmap" },
  { label: "Assessments", icon: ClipboardCheck, href: "#" },
  { label: "Projects", icon: FolderKanban, href: "#" },
  { label: "Resources", icon: BookOpen, href: "#" },
  { label: "Progress", icon: LineChart, href: "#" },
  { label: "Profile", icon: User, href: "/input" },
  { label: "Settings", icon: Settings, href: "#" },
]

export function Sidebar({
  active = "Dashboard",
}: {
  active?: string
}) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BrainCircuit className="size-5" />
        </span>

        <span className="text-lg font-bold tracking-tight text-primary">
          SkillGap AI
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {nav.map((item) => {
          const isActive = item.label === active

          return (
            <a
              key={item.label}
              href={item.href}
              aria-current={
                isActive ? "page" : undefined
              }
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-[18px]" />

              {item.label}
            </a>
          )
        })}
      </nav>

      <div className="m-4 rounded-2xl bg-sidebar-accent/70 p-4">
        <div className="flex items-center gap-2 text-sidebar-accent-foreground">
          <Sparkles className="size-4" />

          <span className="text-sm font-semibold">
            AI Assistant
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ask me anything about skills, roadmap or your progress!
        </p>

        <Button className="mt-4 w-full rounded-xl">
          Ask Now
        </Button>
      </div>
    </aside>
  )
}