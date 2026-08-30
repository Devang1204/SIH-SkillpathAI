import json
import os
from typing import Any

from dotenv import load_dotenv
from google import genai

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")


def build_resume_prompt(resume_text: str) -> str:
    return f"""
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


def extract_resume_data(resume_text: str) -> dict[str, Any]:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured in the backend .env file.")

    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = build_resume_prompt(resume_text)

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
    )

    text = getattr(response, "text", None)
    if not text:
        candidates = getattr(response, "candidates", None)
        if candidates and getattr(candidates[0], "content", None):
            parts = getattr(candidates[0].content, "parts", None)
            if parts and getattr(parts[0], "text", None):
                text = parts[0].text

    if not text:
        raise ValueError("Gemini returned no usable response content.")

    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("``")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()

    return json.loads(cleaned)
