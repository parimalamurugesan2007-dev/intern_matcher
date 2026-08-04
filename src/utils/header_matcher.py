from rapidfuzz import fuzz

SECTION_HEADERS = {

    "education": [
        "education",
        "academic",
        "academic background",
        "qualification",
        "academics",
        "education details",
    ],

    "projects": [
        "projects",
        "project",
        "academic projects",
        "project experience",
        "key projects",
    ],

    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "internship",
        "internship experience",
        "employment history",
    ],

    "skills": [
        "skills",
        "technical skills",
        "skill set",
        "core skills",
        "tech stack",
    ],

    "certifications": [
        "certifications",
        "certificates",
        "courses",
        "licenses",
    ],

    "achievements": [
        "achievements",
        "awards",
        "honors",
        "hackathons",
    ],
}


def detect_header(line):

    line = line.lower().strip()

    best = None

    score = 0

    for section, headers in SECTION_HEADERS.items():

        for header in headers:

            s = fuzz.ratio(line, header)

            if s > score:

                score = s

                best = section

    if score >= 80:

        return best

    return None