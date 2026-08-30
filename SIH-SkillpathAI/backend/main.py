import json
import os
import uuid
from typing import Any

import fitz
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel, Field
from supabase import create_client


# =========================
# 1. ENVIRONMENT
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

# Used to build an assessment even if role_skills.json has not been generated yet.
ASSESSMENT_ROLE_SKILLS: dict[str, list[str]] = {
    "Data Scientist": ["Python", "SQL", "Pandas", "Statistics", "Machine Learning"],
    "Machine Learning Engineer": ["Python", "Pandas", "Machine Learning", "TensorFlow", "MLOps"],
    "Data Analyst": ["SQL", "Excel", "Pandas", "Statistics", "Data Visualization"],
    "Web Developer": ["HTML", "CSS", "JavaScript", "React", "Accessibility"],
}

QUESTION_BANK: dict[str, dict[str, Any]] = {
    "python": {"question": "What does a Python list comprehension create?", "options": ["A new list from an iterable", "A database query", "A class definition", "A network request"], "correct_answer": 0},
    "sql": {"question": "Which SQL clause filters groups after an aggregate such as COUNT()?", "options": ["WHERE", "HAVING", "ORDER BY", "DISTINCT"], "correct_answer": 1},
    "pandas": {"question": "Which pandas method is commonly used to combine two DataFrames using a key?", "options": ["merge", "append", "plot", "describe"], "correct_answer": 0},
    "statistics": {"question": "Which measure is least affected by an extreme outlier?", "options": ["Mean", "Median", "Variance", "Standard deviation"], "correct_answer": 1},
    "machine learning": {"question": "Why is a validation set used during model development?", "options": ["To tune choices without touching the final test set", "To increase the training data", "To encrypt the model", "To remove all missing values"], "correct_answer": 0},
    "tensorflow": {"question": "What is a tensor in TensorFlow?", "options": ["A multidimensional array-like data structure", "A CSS layout", "A SQL transaction", "A deployment server"], "correct_answer": 0},
    "excel": {"question": "Which Excel feature summarizes and groups a large table interactively?", "options": ["PivotTable", "Spell Check", "Freeze Panes", "Find and Replace"], "correct_answer": 0},
    "data visualization": {"question": "Which chart is usually best for showing change over time?", "options": ["Line chart", "Pie chart", "Table only", "A chart with no time axis"], "correct_answer": 0},
    "html": {"question": "Which HTML element is most appropriate for the primary page heading?", "options": ["<h1>", "<div>", "<span>", "<br>"], "correct_answer": 0},
    "css": {"question": "Which CSS layout system is designed for one-dimensional row or column layouts?", "options": ["Flexbox", "SQL", "JSON", "HTTP"], "correct_answer": 0},
    "javascript": {"question": "Which JavaScript array method returns a new array after transforming every item?", "options": ["map", "find", "pop", "shift"], "correct_answer": 0},
    "react": {"question": "What React feature stores data that can trigger a component re-render?", "options": ["State", "A CSS class", "An HTML comment", "A URL fragment"], "correct_answer": 0},
    "accessibility": {"question": "Why should an image that conveys meaning have useful alt text?", "options": ["It gives screen-reader users equivalent information", "It makes images larger", "It replaces CSS", "It prevents all loading errors"], "correct_answer": 0},
}

ASSESSMENTS: dict[str, dict[str, Any]] = {}


# =========================
# 2. FASTAPI APP
# =========================

FRONTEND_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app = FastAPI(title="SkillPath AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# 3. SUPABASE CONNECTION
# =========================

supabase = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(
        SUPABASE_URL,
        SUPABASE_KEY
    )


# =========================
# 4. GEMINI CONNECTION
# =========================

gemini_client = None

if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(
            api_key=GEMINI_API_KEY
        )
    except Exception:
        gemini_client = None


# =========================
# 5. LOAD ROLE SKILLS
# =========================

ROLE_FILE = os.path.join(
    BASE_DIR,
    "role_skills.json"
)

roles = {}

try:
    with open(
        ROLE_FILE,
        "r",
        encoding="utf-8"
    ) as file:
        roles = json.load(file)

except FileNotFoundError:
    print(
        "Warning: role_skills.json was not found. "
        "Skill matching will not work until the file is created."
    )


# =========================
# 6. SKILL MATCH REQUEST
# =========================

class SkillMatchRequest(BaseModel):
    student_id: str
    target_role: str


class AssessmentGenerateRequest(BaseModel):
    target_role: str
    skills: list[str] = Field(default_factory=list)
    knowledge_answers: dict[str, str] = Field(default_factory=dict)
    project_descriptions: list[str] = Field(default_factory=list)


class AssessmentAnswer(BaseModel):
    question_id: str
    selected_option: int


class AssessmentSubmitRequest(BaseModel):
    assessment_id: str
    answers: list[AssessmentAnswer]


# =========================
# 7. PDF TEXT EXTRACTION
# =========================

def extract_text_from_pdf(
    file_bytes: bytes
) -> str:

    try:
        document = fitz.open(
            stream=file_bytes,
            filetype="pdf"
        )

    except Exception as exc:
        raise ValueError(
            "Failed to open the PDF. "
            "The file may be corrupted or not a valid PDF."
        ) from exc

    try:
        text_chunks = []

        for page in document:

            page_text = page.get_text("text")

            if page_text and page_text.strip():
                text_chunks.append(
                    page_text.strip()
                )

        full_text = "\n\n".join(
            text_chunks
        ).strip()

        if not full_text:
            raise ValueError(
                "The PDF is empty or no readable text could be extracted."
            )

        return full_text

    finally:
        document.close()


# =========================
# 8. GEMINI RESPONSE TEXT
# =========================

def _extract_text_from_response(
    response: Any
) -> str:

    if hasattr(response, "text") and response.text:
        return response.text

    candidates = getattr(
        response,
        "candidates",
        None
    )

    if candidates:

        first_candidate = candidates[0]

        content = getattr(
            first_candidate,
            "content",
            None
        )

        if content:

            parts = getattr(
                content,
                "parts",
                None
            )

            if parts:

                first_part = parts[0]

                if (
                    hasattr(first_part, "text")
                    and first_part.text
                ):
                    return first_part.text

    return str(response)


# =========================
# 9. GEMINI RESUME EXTRACTION
# =========================

def extract_resume_with_ai(
    resume_text: str
) -> dict[str, Any]:

    if not gemini_client:

        return {
            "status": "ai_not_configured",
            "message": (
                "GEMINI_API_KEY is not configured "
                "in the backend environment."
            ),
            "extracted_text": resume_text,
        }

    prompt = f"""
Analyze this resume and extract the student's information.

Extract:
- Name
- Email
- Education
- Branch
- Graduation year
- Career goal
- Target timeline
- Skills and proficiency level
- Projects and technologies used

Return ONLY valid JSON.

Use exactly this format:
{{
    "name": "",
    "email": "",
    "education": "",
    "branch": "",
    "graduation_year": "",
    "career_goal": "",
    "target_timeline": "",
    "skills": [
        {{
            "name": "",
            "level": ""
        }}
    ],
    "projects": [
        {{
            "name": "",
            "description": "",
            "technologies": []
        }}
    ]
}}

Resume:
{resume_text}
"""

    try:

        response = gemini_client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
        )

        response_text = _extract_text_from_response(
            response
        )

        cleaned = response_text.strip()

        if cleaned.startswith("```"):

            cleaned = cleaned.strip("`")

            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:].strip()

        parsed = json.loads(cleaned)

        return {
            "status": "ok",
            **parsed
        }

    except Exception as exc:

        return {
            "status": "ai_failed",
            "message": (
                f"AI extraction failed: {str(exc)}"
            ),
            "extracted_text": resume_text,
        }


# =========================
# 10. ROOT
# =========================

@app.get("/")
def read_root():

    return {
        "message": "SkillPath AI API is running"
    }


# =========================
# 11. API HEALTH
# =========================

@app.get("/api/health")
def api_health():

    return {
        "message": "SkillPath AI API is running"
    }


# =========================
# 12. DATABASE HEALTH
# =========================

@app.get("/health/db")
def db_health_check():

    if not supabase:

        return {
            "status": "not_configured",
            "message": (
                "Supabase is not configured yet. "
                "Set SUPABASE_URL and SUPABASE_KEY "
                "in your backend .env file."
            ),
        }

    try:

        response = (
            supabase
            .table("student")
            .select("student_id")
            .limit(1)
            .execute()
        )

        return {
            "status": "ok",
            "message": "Supabase connection is active",
            "count": (
                len(response.data)
                if response.data
                else 0
            ),
        }

    except Exception as exc:

        return {
            "status": "error",
            "message": (
                f"Supabase query failed: {str(exc)}"
            ),
        }


# =========================
# 13. GET ALL STUDENTS
# =========================

@app.get("/students")
def get_students():

    if not supabase:

        raise HTTPException(
            status_code=503,
            detail=(
                "Supabase is not configured yet."
            ),
        )

    try:

        response = (
            supabase
            .table("student")
            .select("*")
            .execute()
        )

        return response.data

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to fetch students: {str(exc)}"
            ),
        ) from exc


# =========================
# 14. RESUME UPLOAD
# =========================

@app.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...)
):

    filename = file.filename or ""

    if not filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    file_bytes = await file.read()

    if not file_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF is empty."
        )

    try:

        extracted_text = extract_text_from_pdf(
            file_bytes
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        ) from exc

    ai_result = extract_resume_with_ai(
        extracted_text
    )

    result = {
        "filename": filename,
        "extracted_text": extracted_text,
        "ai_result": ai_result,
    }

    if (
        supabase
        and isinstance(ai_result, dict)
        and ai_result.get("status") == "ok"
    ):

        try:

            student_id = str(
                uuid.uuid4()
            )

            student_payload = {
                "student_id": student_id,
                "name": ai_result.get("name"),
                "email": ai_result.get("email"),
                "education": ai_result.get("education"),
                "branch": ai_result.get("branch"),
                "graduation_year": ai_result.get(
                    "graduation_year"
                ),
                "career_goal": ai_result.get(
                    "career_goal"
                ),
                "target_timeline": ai_result.get(
                    "target_timeline"
                ),
            }

            (
                supabase
                .table("student")
                .insert(student_payload)
                .execute()
            )

            for skill in ai_result.get(
                "skills",
                []
            ):

                skill_payload = {
                    "id": str(uuid.uuid4()),
                    "student_id": student_id,
                    "skill": skill.get("name"),
                    "description": skill.get("level"),
                }

                (
                    supabase
                    .table("skills")
                    .insert(skill_payload)
                    .execute()
                )

            result["supabase_status"] = "stored"
            result["student_id"] = student_id

        except Exception as exc:

            result["supabase_status"] = "failed"
            result["supabase_error"] = str(exc)

    else:

        result["supabase_status"] = "skipped"

    return result


# =========================
# 15. AVAILABLE ROLES
# =========================

@app.get("/roles")
def get_roles():

    return {
        "roles": list(roles.keys())
    }


# =========================
# 16. SKILL MATCHING
# =========================

@app.post("/skill-match")
def skill_match(
    request: SkillMatchRequest
):

    if not supabase:

        raise HTTPException(
            status_code=503,
            detail="Supabase is not configured."
        )

    if not roles:

        raise HTTPException(
            status_code=500,
            detail="role_skills.json is missing or empty."
        )

    target_role = request.target_role

    if target_role not in roles:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Role '{target_role}' is not available. "
                f"Available roles: {list(roles.keys())}"
            ),
        )

    required_skills = roles[target_role]

    # -------------------------
    # Get student's skills
    # -------------------------

    try:

        skills_response = (
            supabase
            .table("skills")
            .select("skill")
            .eq(
                "student_id",
                request.student_id
            )
            .execute()
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to fetch student skills: {str(exc)}"
            ),
        ) from exc

    student_skills = []

    if skills_response.data:

        for row in skills_response.data:

            skill = row.get("skill")

            if skill:
                student_skills.append(
                    skill.strip()
                )

    # -------------------------
    # Normalize skills
    # -------------------------

    student_skills_normalized = {
        skill.lower()
        for skill in student_skills
    }

    matched_skills = []
    missing_skills = []

    for required_skill in required_skills:

        if (
            required_skill.strip().lower()
            in student_skills_normalized
        ):

            matched_skills.append(
                required_skill
            )

        else:

            missing_skills.append(
                required_skill
            )

    # -------------------------
    # Match percentage
    # -------------------------

    total_required = len(
        required_skills
    )

    if total_required == 0:

        match_percentage = 0

    else:

        match_percentage = round(
            (
                len(matched_skills)
                / total_required
            ) * 100,
            2
        )

    return {
        "student_id": request.student_id,
        "target_role": target_role,
        "student_skills": student_skills,
        "required_skills": required_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "match_percentage": match_percentage,
    }


# =========================
# 17. PERSONALIZED ASSESSMENTS
# =========================

def _question_for_skill(skill: str, question_id: str, difficulty: str) -> dict[str, Any]:
    bank_question = QUESTION_BANK.get(skill.lower())
    if bank_question:
        return {
            "id": question_id,
            "skill": skill,
            "difficulty": difficulty,
            "type": "multiple_choice",
            "question": bank_question["question"],
            "options": bank_question["options"],
            "correct_answer": bank_question["correct_answer"],
        }

    return {
        "id": question_id,
        "skill": skill,
        "difficulty": difficulty,
        "type": "multiple_choice",
        "question": f"Which approach best demonstrates practical {skill} ability?",
        "options": [
            f"Apply {skill} to a realistic problem and explain the result",
            "Memorize terminology without using it",
            "Avoid checking the outcome",
            "Use an unrelated tool instead",
        ],
        "correct_answer": 0,
    }


@app.post("/assessment/generate")
def generate_assessment(request: AssessmentGenerateRequest):
    required_skills = ASSESSMENT_ROLE_SKILLS.get(request.target_role)
    if not required_skills:
        raise HTTPException(status_code=400, detail="Unsupported target role.")

    known_skills = {skill.strip().lower() for skill in request.skills if skill.strip()}
    confidence = " ".join(request.knowledge_answers.values()).lower()
    advanced = "advanced" in confidence or "production" in confidence
    questions = []
    for index, skill in enumerate(required_skills):
        difficulty = "intermediate" if skill.lower() in known_skills or advanced else "foundation"
        questions.append(_question_for_skill(skill, f"q{index + 1}", difficulty))

    assessment_id = str(uuid.uuid4())
    ASSESSMENTS[assessment_id] = {"questions": questions}
    public_questions = [{k: v for k, v in question.items() if k != "correct_answer"} for question in questions]
    return {
        "assessment_id": assessment_id,
        "title": f"{request.target_role} skill assessment",
        "duration_minutes": len(public_questions) * 3,
        "required_skills": required_skills,
        "questions": public_questions,
    }


@app.post("/assessment/submit")
def submit_assessment(request: AssessmentSubmitRequest):
    assessment = ASSESSMENTS.get(request.assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found. Generate a new assessment and try again.")

    answers_by_id = {answer.question_id: answer.selected_option for answer in request.answers}
    skill_results: dict[str, dict[str, int]] = {}
    correct_count = 0
    for question in assessment["questions"]:
        skill = question["skill"]
        result = skill_results.setdefault(skill, {"correct": 0, "total": 0})
        result["total"] += 1
        if answers_by_id.get(question["id"]) == question["correct_answer"]:
            result["correct"] += 1
            correct_count += 1

    total = len(assessment["questions"])
    percentage = round((correct_count / total) * 100) if total else 0
    skill_scores = [
        {"skill": skill, "score": round((result["correct"] / result["total"]) * 100)}
        for skill, result in skill_results.items()
    ]
    return {
        "score": percentage,
        "correct_answers": correct_count,
        "total_questions": total,
        "skill_scores": skill_scores,
        "strengths": [item["skill"] for item in skill_scores if item["score"] >= 70],
        "focus_areas": [item["skill"] for item in skill_scores if item["score"] < 70],
    }


# =========================
# 18. LOCAL DEVELOPMENT
# =========================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
