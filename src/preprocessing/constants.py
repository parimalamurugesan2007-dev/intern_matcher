"""
Project Constants
"""

REQUIRED_COLUMNS = [
    "Internship Id",
    "Role",
    "Company Name",
    "Location",
    "Duration",
    "Stipend",
    "Intern Type",
    "Skills",
    "Perks",
    "Hiring Since",
    "Opportunity Date",
    "Opening",
    "Hired Candidate",
    "Number of Applications",
    "Website Link",
]

TEXT_COLUMNS = [
    "Role",
    "Company Name",
    "Location",
    "Skills",
    "Perks",
]

CRITICAL_COLUMNS = [
    "Internship Id",
    "Role",
    "Company Name",
    "Skills",
]

OUTPUT_FOLDER = "data/processed"

LOG_FOLDER = "logs"