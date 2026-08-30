import json

roles = {
    "Data Scientist": [
        "Python",
        "SQL",
        "Pandas",
        "NumPy",
        "Machine Learning",
        "Statistics",
        "scikit-learn"
    ],

    "Web Developer": [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Node.js"
    ],

    "Data Analyst": [
        "Python",
        "SQL",
        "Excel",
        "Pandas",
        "Statistics",
        "Power BI"
    ],

    "Machine Learning Engineer": [
        "Python",
        "NumPy",
        "Pandas",
        "Machine Learning",
        "scikit-learn",
        "TensorFlow",
        "PyTorch"
    ]
}

with open("role_skills.json", "w") as file:
    json.dump(roles, file, indent=4)

print("role_skills.json created successfully!")