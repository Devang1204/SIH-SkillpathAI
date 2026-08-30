import json
import os
import uuid
from typing import Any

import fitz
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from supabase import create_client

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
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

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

gemini_client = None
if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception:
        gemini_client = None


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        document = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:  # pragma: no cover - exercised through API tests
        raise ValueError("Failed to open the PDF. The file may be corrupted or not a valid PDF.") from exc

    try:
        text_chunks: list[str] = []
        for page in document:
            page_text = page.get_text("text")
            if page_text and page_text.strip():
                text_chunks.append(page_text.strip())

        full_text = "\n\n".join(text_chunks).strip()
        if not full_text:
            raise ValueError("The PDF is empty or no readable text could be extracted.")
        return full_text
    finally:
        document.close()


def _extract_text_from_response(response: Any) -> str:
    if hasattr(response, "text") and response.text:
        return response.text

    candidates = getattr(response, "candidates", None)
    if candidates:
        first_candidate = candidates[0]
        content = getattr(first_candidate, "content", None)
        if content:
            parts = getattr(content, "parts", None)
            if parts:
                first_part = parts[0]
                if hasattr(first_part, "text") and first_part.text:
                    return first_part.text

    return str(response)


def extract_resume_with_ai(resume_text: str) -> dict[str, Any]:
    if not gemini_client:
        return {
            "status": "ai_not_configured",
            "message": "GEMINI_API_KEY is not configured in the backend environment.",
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
        response_text = _extract_text_from_response(response)
        cleaned = response_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:].strip()
        parsed = json.loads(cleaned)
        return {"status": "ok", **parsed}
    except Exception as exc:
        return {
            "status": "ai_failed",
            "message": f"AI extraction failed: {str(exc)}",
            "extracted_text": resume_text,
        }


@app.get("/")
def read_root():
    return {"message": "SkillPath AI API is running"}


@app.get("/api/health")
def api_health():
    return {"message": "SkillPath AI API is running"}


@app.get("/health/db")
def db_health_check():
    if not supabase:
        return {
            "status": "not_configured",
            "message": "Supabase is not configured yet. Set SUPABASE_URL and SUPABASE_KEY in your backend .env file.",
        }

    try:
        response = supabase.table("student").select("student_id").limit(1).execute()
        return {
            "status": "ok",
            "message": "Supabase connection is active",
            "count": len(response.data) if response.data else 0,
        }
    except Exception as exc:
        return {
            "status": "error",
            "message": f"Supabase query failed: {str(exc)}",
        }


@app.get("/students")
def get_students():
    if not supabase:
        raise HTTPException(
            status_code=503,
            detail="Supabase is not configured yet. Set SUPABASE_URL and SUPABASE_KEY in your backend .env file.",
        )

    try:
        response = supabase.table("student").select("*").execute()
        return response.data
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch students: {str(exc)}") from exc


@app.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded PDF is empty.")

    try:
        extracted_text = extract_text_from_pdf(file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    ai_result = extract_resume_with_ai(extracted_text)
    result: dict[str, Any] = {
        "filename": filename,
        "extracted_text": extracted_text,
        "ai_result": ai_result,
    }

    if supabase and isinstance(ai_result, dict) and ai_result.get("status") == "ok":
        try:
            student_id = str(uuid.uuid4())
            student_payload = {
                "student_id": student_id,
                "name": ai_result.get("name"),
                "email": ai_result.get("email"),
                "education": ai_result.get("education"),
                "branch": ai_result.get("branch"),
                "graduation_year": ai_result.get("graduation_year"),
                "career_goal": ai_result.get("career_goal"),
                "target_timeline": ai_result.get("target_timeline"),
            }
            supabase.table("student").insert(student_payload).execute()

            for skill in ai_result.get("skills", []):
                skill_payload = {
                    "id": str(uuid.uuid4()),
                    "student_id": student_id,
                    "skill": skill.get("name"),
                    "description": skill.get("level"),
                }
                supabase.table("skills").insert(skill_payload).execute()

            result["supabase_status"] = "stored"
            result["student_id"] = student_id
        except Exception as exc:
            result["supabase_status"] = "failed"
            result["supabase_error"] = str(exc)
    else:
        result["supabase_status"] = "skipped"

    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
