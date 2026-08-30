"use client"

import { useRef, useState } from "react"
import {
  FileText,
  UploadCloud,
  X,
  Target,
  MessageSquareText,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Loader,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ExtractedResume = {
  status?: string
  name?: string
  email?: string
  education?: string
  branch?: string
  graduation_year?: string
  career_goal?: string
  target_timeline?: string
  skills?: Array<{
    name: string
    level: string
  }>
  projects?: Array<{
    name: string
    description: string
    technologies?: string[]
  }>
}

type SkillMatchResponse = {
  student_id: string
  target_role: string
  student_skills: string[]
  required_skills: string[]
  matched_skills: string[]
  missing_skills: string[]
  match_percentage: number
}

const roles = [
  "Data Scientist",
  "Machine Learning Engineer",
  "Data Analyst",
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "Product Manager",
  "UX Designer",
  "DevOps Engineer",
  "Cloud Architect",
]

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

          <h2 className="text-lg font-bold text-foreground">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-5">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

const fieldClass =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"

export function ProfileInputForm() {
  const [resumeName, setResumeName] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [extractedData, setExtractedData] =
    useState<ExtractedResume | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [targetRole, setTargetRole] =
    useState("Data Scientist")

  const [answers, setAnswers] =
    useState<Record<string, string>>({})

  const [submitted, setSubmitted] = useState(false)

  const [studentId, setStudentId] =
    useState<string | null>(null)

  const [skillMatch, setSkillMatch] =
    useState<SkillMatchResponse | null>(null)

  const [matchLoading, setMatchLoading] =
    useState(false)

  const [matchError, setMatchError] =
    useState<string | null>(null)

  /*
   * Upload a NEW resume.
   *
   * Important:
   * Clear all previous dashboard information first.
   */
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return
    }

    const file = files[0]

    // Clear previous student's dashboard data.
    if (typeof window !== "undefined") {
      localStorage.removeItem("skillMatch")
      localStorage.removeItem("targetRole")
      localStorage.removeItem("studentId")
    }

    setSkillMatch(null)
    setStudentId(null)
    setSubmitted(false)
    setMatchError(null)
    setUploadError(null)

    setExtractedData(null)
    setResumeName(file.name)

    setUploadLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(
        "http://127.0.0.1:8002/resume/upload",
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error(
          `Upload failed: ${response.statusText}`
        )
      }

      const result = await response.json()

      const aiResult: ExtractedResume =
        result.ai_result || {}

      setExtractedData(aiResult)

      /*
       * Store the NEW student ID.
       */
      if (result.student_id) {
        setStudentId(result.student_id)

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "studentId",
            result.student_id
          )
        }
      }

      /*
       * If Gemini extracted a career goal,
       * use it as the initial target role.
       */
      if (aiResult.career_goal) {
        const extractedRole =
          aiResult.career_goal.trim()

        if (extractedRole) {
          /*
           * Only automatically use it if it matches
           * one of our supported roles.
           */
          const matchingRole = roles.find(
            (role) =>
              role.toLowerCase() ===
              extractedRole.toLowerCase()
          )

          if (matchingRole) {
            setTargetRole(matchingRole)

            if (typeof window !== "undefined") {
              localStorage.setItem(
                "targetRole",
                matchingRole
              )
            }
          }
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to upload resume"

      setUploadError(message)

      setResumeName(null)
      setExtractedData(null)
      setStudentId(null)
      setSkillMatch(null)

      if (typeof window !== "undefined") {
        localStorage.removeItem("skillMatch")
        localStorage.removeItem("targetRole")
        localStorage.removeItem("studentId")
      }
    } finally {
      setUploadLoading(false)
    }
  }

  /*
   * Run skill-match analysis.
   */
  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    if (!studentId) {
      setMatchError(
        "Please upload your resume first."
      )
      return
    }

    if (!targetRole.trim()) {
      setMatchError(
        "Please select a target career role."
      )
      return
    }

    setMatchLoading(true)
    setMatchError(null)

    try {
      const response = await fetch(
        "http://127.0.0.1:8002/skill-match",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: studentId,
            target_role: targetRole,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Skill matching failed: ${response.statusText}`
        )
      }

      const result: SkillMatchResponse =
        await response.json()

      setSkillMatch(result)

      /*
       * Save ONLY the current student's
       * skill-match result.
       */
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "skillMatch",
          JSON.stringify(result)
        )

        localStorage.setItem(
          "targetRole",
          targetRole
        )

        localStorage.setItem(
          "studentId",
          studentId
        )
      }

      setSubmitted(true)

      if (typeof window !== "undefined") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
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

  function removeResume() {
    setResumeName(null)
    setExtractedData(null)
    setStudentId(null)
    setSkillMatch(null)

    setSubmitted(false)
    setMatchError(null)

    if (typeof window !== "undefined") {
      localStorage.removeItem("skillMatch")
      localStorage.removeItem("targetRole")
      localStorage.removeItem("studentId")
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      {/* Success */}
      {submitted && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-success/40 bg-success/10 p-4"
        >
          <CheckCircle2 className="mt-0.5 size-5 text-success-foreground" />

          <div>
            <p className="text-sm font-semibold text-success-foreground">
              Profile analyzed successfully
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Your skill gap analysis has been updated
              using the latest resume.
            </p>
          </div>
        </div>
      )}

      {/* Analysis error */}
      {matchError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4"
        >
          <AlertCircle className="mt-0.5 size-5 text-danger-foreground" />

          <div>
            <p className="text-sm font-semibold text-danger-foreground">
              Analysis failed
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {matchError}
            </p>
          </div>
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4"
        >
          <AlertCircle className="mt-0.5 size-5 text-danger-foreground" />

          <div>
            <p className="text-sm font-semibold text-danger-foreground">
              Upload failed
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {uploadError}
            </p>
          </div>
        </div>
      )}

      {/* Extracted resume information */}
      {extractedData &&
        extractedData.status === "ok" && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-success/40 bg-success/10 p-4"
          >
            <CheckCircle2 className="mt-0.5 size-5 text-success-foreground" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-success-foreground">
                Resume extracted successfully
              </p>

              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>
                  <strong>Name:</strong>{" "}
                  {extractedData.name || "N/A"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {extractedData.email || "N/A"}
                </p>

                <p>
                  <strong>Career:</strong>{" "}
                  {extractedData.career_goal ||
                    "Not specified"}
                </p>

                <p>
                  <strong>Timeline:</strong>{" "}
                  {extractedData.target_timeline ||
                    "Not specified"}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* ========================= */}
      {/* STEP 1 — RESUME */}
      {/* ========================= */}

      <SectionCard
        icon={FileText}
        step={1}
        title="Resume / CV"
        description="Upload your latest resume so we can extract your information and skills automatically."
      >
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() =>
            setDragging(false)
          }
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border bg-background"
          )}
        >
          {uploadLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader className="size-6 animate-spin text-primary" />

              <p className="text-sm font-medium text-foreground">
                Extracting resume data...
              </p>
            </div>
          ) : resumeName ? (
            <div className="flex items-center gap-3">
              <FileText className="size-6 text-primary" />

              <span className="text-sm font-medium text-foreground">
                {resumeName}
              </span>

              <button
                type="button"
                onClick={removeResume}
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

              <p className="mt-1 text-xs text-muted-foreground">
                PDF, DOC or DOCX up to 5MB
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={(e) =>
              handleFiles(e.target.files)
            }
            disabled={uploadLoading}
          />

          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-xl"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={uploadLoading}
          >
            {uploadLoading
              ? "Uploading..."
              : "Browse files"}
          </Button>
        </div>
      </SectionCard>

      {/* ========================= */}
      {/* STEP 2 — TARGET ROLE */}
      {/* ========================= */}

      <SectionCard
        icon={Target}
        step={2}
        title="Target Career Role"
        description="Choose the role you're working toward so we can map the right skills."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="target-role"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Role
            </label>

            <select
              id="target-role"
              value={targetRole}
              onChange={(e) => {
                const role = e.target.value

                setTargetRole(role)

                if (
                  typeof window !==
                  "undefined"
                ) {
                  localStorage.setItem(
                    "targetRole",
                    role
                  )
                }
              }}
              className={fieldClass}
            >
              {roles.map((role) => (
                <option
                  key={role}
                  value={role}
                >
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="timeline"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Target timeline
            </label>

            <select
              id="timeline"
              className={fieldClass}
              defaultValue={
                extractedData?.target_timeline ||
                "6 months"
              }
            >
              <option>3 months</option>
              <option>6 months</option>
              <option>1 year</option>
              <option>Flexible</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* ========================= */}
      {/* STEP 3 — KNOWLEDGE CHECK */}
      {/* ========================= */}

      <SectionCard
        icon={MessageSquareText}
        step={3}
        title="Knowledge Check"
        description="Answer a few quick questions so we can calibrate your skill levels."
      >
        <div className="flex flex-col gap-5">
          {knowledgeQuestions.map(
            (question, index) => (
              <fieldset
                key={question.id}
              >
                <legend className="text-sm font-medium text-foreground">
                  {index + 1}.{" "}
                  {question.question}
                </legend>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map(
                    (option) => {
                      const selected =
                        answers[
                          question.id
                        ] === option

                      return (
                        <label
                          key={option}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition-colors",
                            selected
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-primary/40"
                          )}
                        >
                          <input
                            type="radio"
                            name={
                              question.id
                            }
                            value={option}
                            checked={
                              selected
                            }
                            onChange={() =>
                              setAnswers(
                                (
                                  previous
                                ) => ({
                                  ...previous,
                                  [question.id]:
                                    option,
                                })
                              )
                            }
                            className="size-4 accent-primary"
                          />

                          {option}
                        </label>
                      )
                    }
                  )}
                </div>
              </fieldset>
            )
          )}

          <div>
            <label
              htmlFor="extra-notes"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Anything else we should know?
            </label>

            <textarea
              id="extra-notes"
              rows={3}
              placeholder="Share goals, constraints, or areas you want to focus on."
              className={cn(
                fieldClass,
                "resize-y"
              )}
            />
          </div>
        </div>
      </SectionCard>

      {/* ========================= */}
      {/* SUBMIT */}
      {/* ========================= */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Your resume and answers power a personalized skill gap analysis.
        </p>

        <Button
          type="submit"
          className="rounded-xl"
          disabled={
            matchLoading ||
            uploadLoading ||
            !studentId
          }
        >
          {matchLoading ? (
            <>
              <Loader className="size-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Analyze my profile
            </>
          )}
        </Button>
      </div>
    </form>
  )
}