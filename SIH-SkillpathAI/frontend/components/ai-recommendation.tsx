import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AiRecommendation() {
  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-6">
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="size-5" />
        <h3 className="text-base font-bold">AI Recommendation</h3>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground">
        Focus on improving <span className="font-semibold">Machine Learning</span> skills. It will
        increase your role match by <span className="font-semibold">18%</span>.
      </p>

      <Button className="mt-4 rounded-xl">Start Learning</Button>
    </section>
  )
}
