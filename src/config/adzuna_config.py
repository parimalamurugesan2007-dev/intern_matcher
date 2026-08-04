"""
Adzuna Configuration
"""

import os
from dotenv import load_dotenv

load_dotenv()

APP_ID = os.getenv("ADZUNA_APP_ID")
APP_KEY = os.getenv("ADZUNA_APP_KEY")

COUNTRY = "in"

RESULTS_PER_PAGE = 100

TECHNICAL_KEYWORDS = [
    "Software Engineer Internship",
    "Backend Developer Internship",
    "Frontend Developer Internship",
    "Full Stack Internship",
    "Python Internship",
    "Java Internship",
    "Machine Learning Internship",
    "Artificial Intelligence Internship",
    "Data Science Internship",
    "Cloud Internship",
    "DevOps Internship",
    "Cyber Security Internship",
    "Android Internship",
    "Flutter Internship",
    "React Internship"
]