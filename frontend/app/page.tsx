"use client"

import { useEffect, useRef, useState } from "react"

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8002"
import {
    CheckCircle2,
    FileText,
    Loader2,
    Sparkles,
    Target,
    UploadCloud,
} from "lucide-react"
import { useRouter } from "next/navigation"

type ResumeResult = {
    filename?: string
    student_id?: string
    ai_result?: {
        status?: string
        name?: string
        email?: string
        career_goal?: string
        skills?: Array<{
            name?: string
            level?: string
        }>
    }
    supabase_status?: string
    supabase_error?: string
}

type SkillMatch = {
    student_id: string
    target_role: string
    student_skills: string[]
    required_skills: string[]
    matched_skills: string[]
    missing_skills: string[]
    match_percentage: number
}

export default function LandingPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const roles = [
        "Software Development Engineer",
        "Machine Learning Engineer",
        "Data Scientist",
        "Data Analyst",
        "Cloud Engineer",
        "Cybersecurity Analyst",
        "DevOps Engineer",
        "Full Stack Developer",
    ]

    const [selectedRole, setSelectedRole] = useState(roles[0])

    const [fileName, setFileName] = useState("")
    const [studentId, setStudentId] = useState("")

    const [resumeData, setResumeData] = useState<
        ResumeResult["ai_result"] | null
    >(null)

    const [uploadLoading, setUploadLoading] = useState(false)
    const [matchLoading, setMatchLoading] = useState(false)

    const [error, setError] = useState("")

    /*
     * Upload resume
     */
    async function handleFile(file: File) {
        if (!file) return

        setError("")
        setFileName(file.name)
        setResumeData(null)
        setStudentId("")
        setUploadLoading(true)

        /*
         * Clear previous user's data
         */
        localStorage.removeItem("skillMatch")
        localStorage.removeItem("studentId")
        localStorage.removeItem("targetRole")
        localStorage.removeItem("resumeData")

        try {
            if (!file.name.toLowerCase().endsWith(".pdf")) {
                throw new Error("Please upload a PDF resume.")
            }

            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch(
                `${API_URL}/resume/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            )

            const result: ResumeResult = await response.json()

            if (!response.ok) {
                throw new Error(
                    typeof result === "object" &&
                        result &&
                        "detail" in result
                        ? String(
                            (result as unknown as { detail: string }).detail
                        )
                        : `Resume upload failed with status ${response.status}`
                )
            }

            if (!result.student_id) {
                throw new Error(
                    result.ai_result?.status === "ai_failed"
                        ? "AI resume analysis failed. Please check the backend/API key."
                        : "Resume was processed, but no student ID was returned."
                )
            }

            setStudentId(result.student_id)

            setResumeData(result.ai_result ?? null)

            /*
             * Save extracted resume information
             */
            localStorage.setItem(
                "studentId",
                result.student_id
            )

            if (result.ai_result) {
                localStorage.setItem(
                    "resumeData",
                    JSON.stringify(result.ai_result)
                )
            }

        } catch (err) {
            console.error("Resume upload failed:", err)

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to upload your resume."
            )

            setFileName("")
            setStudentId("")
            setResumeData(null)
        } finally {
            setUploadLoading(false)
        }
    }

    /*
     * File picker
     */
    function handleFileChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0]

        if (file) {
            handleFile(file)
        }
    }

    /*
     * Drag & drop
     */
    function handleDrop(
        event: React.DragEvent<HTMLDivElement>
    ) {
        event.preventDefault()

        const file = event.dataTransfer.files?.[0]

        if (file) {
            handleFile(file)
        }
    }

    /*
     * Skill matching
     */
    async function handleAnalyze() {
        if (!studentId) {
            setError("Please upload your resume first.")
            return
        }

        if (!selectedRole) {
            setError("Please select a target career role.")
            return
        }

        setError("")
        setMatchLoading(true)

        try {
            const response = await fetch(
                `${API_URL}/skill-match`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        student_id: studentId,
                        target_role: selectedRole,
                    }),
                }
            )

            const result: SkillMatch = await response.json()

            if (!response.ok) {
                throw new Error(
                    `Skill matching failed with status ${response.status}`
                )
            }

            /*
             * Save the complete skill-match result.
             * Dashboard reads this data.
             */
            localStorage.setItem(
                "skillMatch",
                JSON.stringify(result)
            )

            localStorage.setItem(
                "studentId",
                studentId
            )

            localStorage.setItem(
                "targetRole",
                selectedRole
            )

            /*
             * Go directly to Dashboard.
             *
             * NO /input page.
             */
            router.push("/dashboard")
        } catch (err) {
            console.error("Skill matching failed:", err)

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to analyze your skills."
            )
        } finally {
            setMatchLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-background">

            {/* Header */}
            <header className="border-b border-border">
                <div className="mx-auto flex max-w-6xl items-center px-6 py-5">

                    <div className="flex items-center gap-3">

                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Sparkles className="size-5" />
                        </div>

                        <div>
                            <h1 className="text-lg font-bold text-foreground">
                                SkillPath AI
                            </h1>

                            <p className="text-xs text-muted-foreground">
                                Personalized career intelligence
                            </p>
                        </div>

                    </div>

                </div>
            </header>

            {/* Main */}
            <section className="px-6 py-14 md:py-20">

                <div className="mx-auto max-w-5xl text-center">

                    {/* Hero icon */}
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Sparkles className="size-8" />
                    </div>

                    <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                        AI-powered career guidance
                    </p>

                    <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                        Turn your resume into a
                        <span className="text-primary">
                            {" "}personalized career roadmap.
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                        Upload your resume, choose your target career,
                        and discover the skills you need to reach your goal.
                    </p>

                    {/* Upload + analysis card */}
                    <div className="mx-auto mt-10 max-w-2xl">

                        <div
                            onDragOver={(event) => {
                                event.preventDefault()
                            }}
                            onDrop={handleDrop}
                            className="rounded-3xl border border-border bg-card p-8 md:p-10"
                        >

                            {/* Upload state */}
                            {!studentId ? (
                                <>
                                    {uploadLoading ? (
                                        <div className="flex flex-col items-center py-8">

                                            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                <Loader2 className="size-8 animate-spin" />
                                            </div>

                                            <h3 className="mt-5 text-xl font-bold text-foreground">
                                                Analyzing your resume
                                            </h3>

                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Extracting your skills and profile...
                                            </p>

                                            <p className="mt-3 text-xs text-muted-foreground">
                                                {fileName}
                                            </p>

                                        </div>
                                    ) : (
                                        <>
                                            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                <UploadCloud className="size-8" />
                                            </div>

                                            <h3 className="mt-5 text-xl font-bold text-foreground">
                                                Start with your resume
                                            </h3>

                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                Drag and drop your resume here
                                                <br />
                                                or choose a file from your computer.
                                            </p>

                                            <p className="mt-3 text-xs text-muted-foreground">
                                                PDF format supported
                                            </p>

                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                                            >
                                                <FileText className="size-4" />
                                                Upload Resume
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Uploaded successfully */}
                                    <div className="flex flex-col items-center">

                                        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <CheckCircle2 className="size-8" />
                                        </div>

                                        <h3 className="mt-5 text-xl font-bold text-foreground">
                                            Resume analyzed
                                        </h3>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {fileName}
                                        </p>

                                        {resumeData?.name && (
                                            <p className="mt-4 text-sm font-semibold text-foreground">
                                                Welcome, {resumeData.name}
                                            </p>
                                        )}

                                    </div>

                                    {/* Target role */}
                                    <div className="mt-8 text-left">

                                        <div className="mb-3 flex items-center gap-2">
                                            <Target className="size-4 text-primary" />

                                            <label className="text-sm font-semibold text-foreground">
                                                What career are you targeting?
                                            </label>
                                        </div>

                                        <select
                                            value={selectedRole}
                                            onChange={(event) =>
                                                setSelectedRole(event.target.value)
                                            }
                                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                                        >
                                            {roles.length === 0 ? (
                                                <option value="">
                                                    Loading roles...
                                                </option>
                                            ) : (
                                                roles.map((role) => (
                                                    <option
                                                        key={role}
                                                        value={role}
                                                    >
                                                        {role}
                                                    </option>
                                                ))
                                            )}
                                        </select>

                                    </div>

                                    {/* Analyze button */}
                                    <button
                                        type="button"
                                        disabled={
                                            matchLoading ||
                                            !studentId ||
                                            !selectedRole
                                        }
                                        onClick={handleAnalyze}
                                        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {matchLoading ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                Analyzing your skills...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="size-4" />
                                                Analyze My Skills
                                            </>
                                        )}
                                    </button>

                                    {/* Change resume */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStudentId("")
                                            setResumeData(null)
                                            setFileName("")
                                            setError("")

                                            localStorage.removeItem("skillMatch")
                                            localStorage.removeItem("studentId")
                                            localStorage.removeItem("targetRole")
                                            localStorage.removeItem("resumeData")

                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = ""
                                            }
                                        }}
                                        className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                    >
                                        Upload a different resume
                                    </button>
                                </>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* How it works */}
                    <div className="mx-auto mt-14 grid max-w-4xl gap-4 text-left md:grid-cols-3">

                        <div className="rounded-2xl border border-border bg-card p-5">
                            <p className="text-sm font-bold text-primary">
                                01 · Upload
                            </p>

                            <h3 className="mt-2 font-semibold text-foreground">
                                Understand your profile
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                AI extracts your experience, education, and
                                existing skills from your resume.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5">
                            <p className="text-sm font-bold text-primary">
                                02 · Analyze
                            </p>

                            <h3 className="mt-2 font-semibold text-foreground">
                                Find your skill gaps
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Compare your current skills with the requirements
                                of your chosen career.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5">
                            <p className="text-sm font-bold text-primary">
                                03 · Grow
                            </p>

                            <h3 className="mt-2 font-semibold text-foreground">
                                Follow your roadmap
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Get a personalized path to close your skill gaps
                                and move toward your target role.
                            </p>
                        </div>

                    </div>

                </div>
            </section>
        </main>
    )
}