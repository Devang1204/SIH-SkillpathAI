from supabase import create_client
from dotenv import load_dotenv
import json
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

git status
supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

print("Connected to Supabase!")


# =========================
# 2. CHOOSE STUDENT
# =========================

# Put the student's UUID here
student_id = "aa01af3b-4e48-4295-97d1-971a1dab9b5e"


# =========================
# 3. GET STUDENT FROM DATABASE
# =========================

student_response = supabase.table("student") \
    .select("*") \
    .eq("student_id", student_id) \
    .single() \
    .execute()

student = student_response.data

print("\nStudent:")
print(student)


# =========================
# 4. GET STUDENT'S SKILLS
# =========================

skills_response = supabase.table("skills") \
    .select("skill") \
    .eq("student_id", student_id) \
    .execute()

student_skills = []

for row in skills_response.data:
    student_skills.append(row["skill"])


print("\nStudent skills:")
print(student_skills)


# =========================
# 5. LOAD ALL ROLE REQUIREMENTS
# =========================

with open("role_skills.json", "r") as file:
    roles = json.load(file)


# =========================
# 6. CHOOSE TARGET ROLE
# =========================

target_role = "Data Scientist"

required_skills = roles[target_role]


# =========================
# 7. FIND MISSING SKILLS
# =========================

missing_skills = []

for skill in required_skills:

    if skill not in student_skills:
        missing_skills.append(skill)


# =========================
# 8. DISPLAY RESULTS
# =========================

print("\nTarget role:")
print(target_role)

print("\nRequired skills:")
print(required_skills)

print("\nMissing skills:")
print(missing_skills)