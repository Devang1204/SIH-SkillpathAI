from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import json
import os


# =========================
# 1. LOAD ENVIRONMENT
# =========================

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


# =========================
# 2. SUPABASE CONNECTION
# =========================

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_KEY must be set in backend/.env"
    )

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# =========================
# 3. FASTAPI APP
# =========================

app = FastAPI(title="SkillPath AI - Skill Matcher API")


# =========================
# 4. REQUEST MODEL
# =========================

class SkillMatchRequest(BaseModel):
    student_id: str
    target_role: str


# =========================
# 5. LOAD ROLE REQUIREMENTS
# =========================

ROLE_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "role_skills.json"
)

try:
    with open(ROLE_FILE, "r", encoding="utf-8") as file:
        roles = json.load(file)
except FileNotFoundError:
    raise RuntimeError(
        "role_skills.json was not found in the backend folder."
    )


# =========================
# 6. SKILL MATCHING FUNCTION
# =========================

def match_student_skills(student_id: str, target_role: str):
    # Check whether role exists
    if target_role not in roles:
        raise HTTPException(
            status_code=404,
            detail=f"Role '{target_role}' is not available."
        )

    required_skills = roles[target_role]

    # Get student's skills from Supabase
    try:
        skills_response = (
            supabase
            .table("skills")
            .select("skill")
            .eq("student_id", student_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch student skills: {str(exc)}"
        )

    student_skills = []

    if skills_response.data:
        for row in skills_response.data:
            skill = row.get("skill")

            if skill:
                student_skills.append(skill)

    # Normalize skills for comparison
    student_skills_normalized = {
        skill.strip().lower()
        for skill in student_skills
    }

    matched_skills = []
    missing_skills = []

    for required_skill in required_skills:
        if required_skill.strip().lower() in student_skills_normalized:
            matched_skills.append(required_skill)
        else:
            missing_skills.append(required_skill)

    # Calculate match percentage
    total_required = len(required_skills)

    if total_required == 0:
        match_percentage = 0
    else:
        match_percentage = round(
            (len(matched_skills) / total_required) * 100,
            2
        )

    return {
        "student_id": student_id,
        "target_role": target_role,
        "student_skills": student_skills,
        "required_skills": required_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "match_percentage": match_percentage
    }


# =========================
# 7. HEALTH CHECK
# =========================

@app.get("/")
def read_root():
    return {
        "message": "SkillPath AI Skill Matcher API is running"
    }


# =========================
# 8. AVAILABLE ROLES
# =========================

@app.get("/roles")
def get_roles():
    return {
        "roles": list(roles.keys())
    }


# =========================
# 9. SKILL MATCH API
# =========================

@app.post("/skill-match")
def skill_match(request: SkillMatchRequest):
    return match_student_skills(
        request.student_id,
        request.target_role
    )