"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  UploadCloud,
  Plus,
  X,
  Award,
  Target,
  Wrench,
  MessageSquareText,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Loader,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Project = {
  id: number
  title: string
  type: "Project" | "Certification"
  description: string
}

type ExtractedResume = {
  status?: string
  name?: string
  email?: string
  education?: string
  branch?: string
  graduation_year?: string
  career_goal?: string
  target_timeline?: string
  skills?: Array<{ name: string; level: string }>
  projects?: Array<{ name: string; description: string; technologies?: string[] }>
}

const roles = [
  "Data Scientist",
  "Machine Learning Engineer",
  "Data Analyst",
  "Web Developer",
]
const suggestedSkills = ["Python", "SQL", "Excel", "Pandas", "TensorFlow", "Tableau", "Statistics"]

const knowledgeQuestions = [
  {
    id: "q1",
    question: "How comfortable are you writing SQL joins and aggregations?",
    options: ["No experience", "Beginner", "Intermediate", "Advanced"],
  },
  {
    id: "q2",
    question: "Have you built or deployed a machine learning model end to end?",
    options: ["Never", "In a course", "Personal project", "In production"],
  },
  {
    id: "q3",
    question: "How would you rate your data visualization and storytelling skills?",
    options: ["No experience", "Beginner", "Intermediate", "Advanced"],
  },
]

function SectionCard({
  icon: Icon,
  step,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  step: number
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Step {step}
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </section>
  )
}

const fieldClass =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

export function ProfileInputForm() {
  const router = useRouter()
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeName, setResumeName] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedResume | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [skills, setSkills] = useState<string[]>(["Python", "Data Analysis", "Excel"])
  const [skillDraft, setSkillDraft] = useState("")

  const [projects, setProjects] = useState<Project[]>([
    { id: 1, title: "", type: "Project", description: "" },
  ])
  const [projectSeq, setProjectSeq] = useState(2)

  const [targetRole, setTargetRole] = useState("Data Scientist")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [skillMatch, setSkillMatch] = useState<any>(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchError, setMatchError] = useState<string | null>(null)
  const [assessmentLoading, setAssessmentLoading] = useState(false)
  const [assessmentError, setAssessmentError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    const file = files[0]
    setResumeFile(file)
    setResumeName(file.name)
    setUploadError(null)
    setUploadLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_URL}/resume/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      setExtractedData(result.ai_result)
      if (result.student_id) {
        setStudentId(result.student_id)
      }

      // Populate form fields with extracted data
      if (result.ai_result?.skills && Array.isArray(result.ai_result.skills)) {
        const extractedSkills = result.ai_result.skills.map(
          (s: { name: string; level: string }) => s.name
        )
        setSkills((prev) => [
          ...new Set([...prev, ...extractedSkills].map((s) => s.toLowerCase())),
        ].map((s) => s.charAt(0).toUpperCase() + s.slice(1)))
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload resume"
      setUploadError(message)
      setResumeFile(null)
      setResumeName(null)
    } finally {
      setUploadLoading(false)
    }
  }

  function addSkill(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillDraft("")
      return
    }
    setSkills((prev) => [...prev, trimmed])
    setSkillDraft("")
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  function updateProject(id: number, patch: Partial<Project>) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function addProject() {
    setProjects((prev) => [...prev, { id: projectSeq, title: "", type: "Project", description: "" }])
    setProjectSeq((n) => n + 1)
  }

  function removeProject(id: number) {
    setProjects((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!studentId) {
      setMatchError("Please upload your resume first.")
      return
    }

    setMatchLoading(true)
    setMatchError(null)

    try {
      const response = await fetch(`${API_URL}/skill-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          target_role: targetRole,
        }),
      })

      if (!response.ok) {
        throw new Error(`Skill matching failed: ${response.statusText}`)
      }

      const result = await response.json()

      setSkillMatch(result)

      localStorage.setItem("skillMatch", JSON.stringify(result))
      localStorage.setItem("targetRole", targetRole)

      setSubmitted(true)
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to analyze your skills."

      setMatchError(message)
    } finally {
      setMatchLoading(false)
    }
  }

  async function createAssessment() {
    setAssessmentError(null)
    setAssessmentLoading(true)

    try {
      const response = await fetch(`${API_URL}/assessment/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_role: targetRole,
          skills,
          knowledge_answers: answers,
          project_descriptions: projects
            .filter((project) => project.title || project.description)
            .map((project) => `${project.title}: ${project.description}`),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || "Unable to create your assessment.")

      window.sessionStorage.setItem("skillpath-assessment", JSON.stringify(result))
      router.push("/assessment")
    } catch (error) {
      setAssessmentError(error instanceof Error ? error.message : "Unable to create your assessment.")
    } finally {
      setAssessmentLoading(false)
    }
  }

  function skipAssessment() {
    router.push("/")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {submitted && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-success/40 bg-success/10 p-4"
        >
          <CheckCircle2 className="mt-0.5 size-5 text-success-foreground" />
          <div>
            <p className="text-sm font-semibold text-success-foreground">Profile submitted</p>
            <p className="text-sm text-muted-foreground">
              We&apos;ll analyze your inputs and refresh your skill gap report shortly.
            </p>
          </div>
        </div>
      )}

      {uploadError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4"
        >
          <AlertCircle className="mt-0.5 size-5 text-danger-foreground" />
          <div>
            <p className="text-sm font-semibold text-danger-foreground">Upload failed</p>
            <p className="text-sm text-muted-foreground">{uploadError}</p>
          </div>
        </div>
      )}

      {assessmentError && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4">
          <AlertCircle className="mt-0.5 size-5 text-danger-foreground" />
          <div>
            <p className="text-sm font-semibold text-danger-foreground">Assessment could not be created</p>
            <p className="text-sm text-muted-foreground">{assessmentError}</p>
          </div>
        </div>
      )}

      {extractedData && extractedData.status === "ok" && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-success/40 bg-success/10 p-4"
        >
          <CheckCircle2 className="mt-0.5 size-5 text-success-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-success-foreground">Resume extracted successfully</p>
            <div className="mt-2 text-xs text-muted-foreground">
              <p>
                <strong>Name:</strong> {extractedData.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {extractedData.email || "N/A"}
              </p>
              <p>
                <strong>Role:</strong> {extractedData.career_goal || "Not specified"}
              </p>
              <p>
                <strong>Timeline:</strong> {extractedData.target_timeline || "Not specified"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resume / CV */}
      <SectionCard
        icon={FileText}
        step={1}
        title="Resume / CV"
        description="Upload your latest resume so we can extract your experience automatically."
      >
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border bg-background",
          )}
        >
          {uploadLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader className="size-6 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Extracting resume data...</p>
            </div>
          ) : resumeName ? (
            <div className="flex items-center gap-3">
              <FileText className="size-6 text-primary" />
              <span className="text-sm font-medium text-foreground">{resumeName}</span>
              <button
                type="button"
                onClick={() => {
                  setResumeFile(null)
                  setResumeName(null)
                  setExtractedData(null)
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Remove file"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UploadCloud className="size-6" />
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">
                Drag &amp; drop your file here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PDF, DOC or DOCX up to 5MB</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploadLoading}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-xl"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadLoading}
          >
            {uploadLoading ? "Uploading..." : "Browse files"}
          </Button>
        </div>
      </SectionCard>

      {/* Projects & certifications */}
      <SectionCard
        icon={Award}
        step={2}
        title="Projects & Certifications"
        description="Showcase what you've built and the credentials you've earned."
      >
        <div className="flex flex-col gap-4">
          {projects.map((project, index) => (
            <div key={project.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Entry {index + 1}</p>
                {projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProject(project.id)}
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-danger"
                  >
                    <X className="size-3.5" />
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => updateProject(project.id, { title: e.target.value })}
                  placeholder="e.g. Sales Data Analysis Dashboard"
                  className={fieldClass}
                />
                <select
                  value={project.type}
                  onChange={(e) =>
                    updateProject(project.id, { type: e.target.value as Project["type"] })
                  }
                  className={cn(fieldClass, "sm:w-44")}
                >
                  <option value="Project">Project</option>
                  <option value="Certification">Certification</option>
                </select>
              </div>
              <textarea
                value={project.description}
                onChange={(e) => updateProject(project.id, { description: e.target.value })}
                placeholder="Briefly describe the outcome, tools used, and your role."
                rows={2}
                className={cn(fieldClass, "mt-3 resize-y")}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addProject}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
          >
            <Plus className="size-4" />
            Add another entry
          </button>
        </div>
      </SectionCard>

      {/* Existing skills */}
      <SectionCard
        icon={Wrench}
        step={3}
        title="Existing Skills"
        description="Add the skills you already have. Press Enter to add each one."
      >
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                aria-label={`Remove ${skill}`}
                className="text-primary/70 hover:text-primary"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={skillDraft}
          onChange={(e) => setSkillDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              addSkill(skillDraft)
            }
          }}
          placeholder="Type a skill and press Enter"
          className={cn(fieldClass, "mt-3")}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Suggestions:</span>
          {suggestedSkills
            .filter((s) => !skills.some((sk) => sk.toLowerCase() === s.toLowerCase()))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
                className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Plus className="size-3" />
                {s}
              </button>
            ))}
        </div>
      </SectionCard>

      {/* Target career role */}
      <SectionCard
        icon={Target}
        step={4}
        title="Target Career Role"
        description="Choose the role you're working toward so we can map the right skills."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="target-role" className="mb-1.5 block text-sm font-medium text-foreground">
              Role
            </label>
            <select
              id="target-role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className={fieldClass}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="timeline" className="mb-1.5 block text-sm font-medium text-foreground">
              Target timeline
            </label>
            <select id="timeline" className={fieldClass} defaultValue="6 months">
              <option>3 months</option>
              <option>6 months</option>
              <option>1 year</option>
              <option>Flexible</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Knowledge-check questions */}
      <SectionCard
        icon={MessageSquareText}
        step={5}
        title="Knowledge Check"
        description="Answer a few quick questions so we can calibrate your skill levels."
      >
        <div className="flex flex-col gap-5">
          {knowledgeQuestions.map((q, index) => (
            <fieldset key={q.id}>
              <legend className="text-sm font-medium text-foreground">
                {index + 1}. {q.question}
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.options.map((option) => {
                  const selected = answers[q.id] === option
                  return (
                    <label
                      key={option}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        checked={selected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))}
                        className="size-4 accent-primary"
                      />
                      {option}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}
          <div>
            <label htmlFor="extra-notes" className="mb-1.5 block text-sm font-medium text-foreground">
              Anything else we should know?
            </label>
            <textarea
              id="extra-notes"
              rows={3}
              placeholder="Share goals, constraints, or areas you want to focus on."
              className={cn(fieldClass, "resize-y")}
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Your inputs power a personalized skill gap analysis. The assessment is optional.
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="rounded-xl" onClick={skipAssessment} disabled={assessmentLoading}>
            Skip assessment for now
          </Button>
          <Button type="submit" variant="outline" className="rounded-xl" disabled={matchLoading || assessmentLoading}>
            {matchLoading ? "Analyzing..." : "Analyze my profile"}
          </Button>
          <Button type="button" className="rounded-xl" onClick={createAssessment} disabled={assessmentLoading}>
            <Sparkles className="size-4" />
            {assessmentLoading ? "Creating assessment..." : "Create my assessment"}
          </Button>
        </div>
      </div>
    </form>
  )
}
