"""
Resume Parser

Author: Internship Intelligence Platform

Description:
Parses PDF and DOCX resumes and extracts plain text.

Supported Formats
-----------------
- PDF
- DOCX

Output
------
Returns the complete resume text as a string.
"""

from __future__ import annotations

from pathlib import Path

import fitz  
from docx import Document


class ResumeParser:

    SUPPORTED_EXTENSIONS = {".pdf", ".docx"}

    def __init__(self, resume_path: str):

        self.resume_path = Path(resume_path)

        if not self.resume_path.exists():
            raise FileNotFoundError(
                f"Resume not found: {self.resume_path}"
            )

        if self.resume_path.suffix.lower() not in self.SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file format: {self.resume_path.suffix}"
            )

    # ---------------------------------------------------------

    def _parse_pdf(self) -> str:

        document = fitz.open(self.resume_path)

        pages = []

        for page in document:
            pages.append(page.get_text())

        document.close()

        return "\n".join(pages)

    # ---------------------------------------------------------

    def _parse_docx(self) -> str:

        document = Document(self.resume_path)

        paragraphs = []

        for paragraph in document.paragraphs:

            text = paragraph.text.strip()

            if text:
                paragraphs.append(text)

        return "\n".join(paragraphs)

    # ---------------------------------------------------------

    def parse(self) -> str:

        extension = self.resume_path.suffix.lower()

        if extension == ".pdf":
            return self._parse_pdf()

        if extension == ".docx":
            return self._parse_docx()

        raise ValueError("Unsupported Resume Format")
if __name__ == "__main__":

    parser = ResumeParser(
            "data/resumes/sample_resume.pdf"
        )

    text = parser.parse()

    print(text)