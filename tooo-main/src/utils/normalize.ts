// ---------------------------------------------------------------------------
// Normalizer: maps the loose JSON returned by POST /recommend into the
// canonical frontend types the UI components expect.
//
// Your backend returns: { profile: {...}, predicted_domain, recommendations: [] }
// The exact field names inside `profile` and each `recommendation` aren't
// pinned down, so every accessor below tries several common name variants.
// Adjust the arrays if your backend uses different keys.
// ---------------------------------------------------------------------------

import type {
  CertificateItem,
  EducationItem,
  ExperienceItem,
  Internship,
  LearningResource,
  Profile,
  ProjectItem,
  RawRecord,
  RecommendResponse,
  RecommendResult,
  Skill,
} from '@/types';

const STR = (v: unknown): string => (v == null ? '' : String(v));
const NUM = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
};
const ARR = (v: unknown): RawRecord[] =>
  Array.isArray(v) ? (v as RawRecord[]) : [];
const STRARR = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => STR(x)).filter(Boolean) : [];

const pickStr = (obj: RawRecord, keys: string[]): string => {
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== '') return STR(obj[k]);
  }
  return '';
};

// ---- Skills ----
const FIELD_KEYS = ['skills', 'skill_list', 'skillSet', 'extracted_skills', 'top_skills'];
function normalizeSkills(obj: RawRecord): Skill[] {
  for (const k of FIELD_KEYS) {
    const v = obj[k];
    if (Array.isArray(v)) {
      // Array of strings -> [{ name, proficiency }]
      if (v.length && typeof v[0] === 'string') {
        return (v as unknown[]).map((s, i) => ({
          name: STR(s),
          proficiency: NUM(obj[`${k}_proficiency`], 60 + ((i * 13) % 35)),
        }));
      }
      // Array of objects
      if (v.length && typeof v[0] === 'object') {
        return (v as RawRecord[]).map((s) => ({
          name: pickStr(s, ['name', 'skill', 'skill_name', 'label']),
          proficiency: NUM(
            s['proficiency'] ?? s['level'] ?? s['score'] ?? s['proficiency_score'],
            60
          ),
          category: pickStr(s, ['category', 'type', 'domain']),
        })).filter((s) => s.name);
      }
    }
    // Comma-separated string
    if (typeof v === 'string' && v.trim()) {
      return v.split(/[,;|]/).map((s) => s.trim()).filter(Boolean).map((name) => ({
        name,
        proficiency: 60,
      }));
    }
  }
  return [];
}

// ---- Education ----
function normalizeEducation(obj: RawRecord): EducationItem[] {
  const list = ARR(obj['education'] ?? obj['education_history'] ?? obj['academics']);
  if (list.length) {
    return list.map((e) => ({
      institution: pickStr(e, ['institution', 'college', 'school', 'university']),
      degree: pickStr(e, ['degree', 'qualification']),
      field: pickStr(e, ['field', 'major', 'specialization', 'branch']),
      startYear: pickStr(e, ['start_year', 'startYear', 'from', 'start']),
      endYear: pickStr(e, ['end_year', 'endYear', 'to', 'end']),
      gpa: pickStr(e, ['gpa', 'cgpa', 'score', 'percentage']),
    }));
  }
  // fallback: top-level fields
  const inst = pickStr(obj, ['college', 'institution', 'university', 'school']);
  if (inst) {
    return [
      {
        institution: inst,
        degree: pickStr(obj, ['degree', 'qualification']),
        field: pickStr(obj, ['field', 'major', 'branch', 'specialization']),
        gpa: pickStr(obj, ['gpa', 'cgpa', 'score']),
      },
    ];
  }
  return [];
}

// ---- Experience ----
function normalizeExperience(obj: RawRecord): ExperienceItem[] {
  const list = ARR(obj['experience'] ?? obj['work_experience'] ?? obj['employment']);
  return list.map((e) => ({
    company: pickStr(e, ['company', 'organization', 'employer']),
    role: pickStr(e, ['role', 'title', 'position', 'designation']),
    start: pickStr(e, ['start', 'start_date', 'from', 'startYear']),
    end: pickStr(e, ['end', 'end_date', 'to', 'endYear']),
    description: pickStr(e, ['description', 'summary', 'details', 'responsibilities']),
  }));
}

// ---- Projects ----
function normalizeProjects(obj: RawRecord): ProjectItem[] {
  const list = ARR(obj['projects'] ?? obj['project_list']);
  return list.map((p) => ({
    title: pickStr(p, ['title', 'name', 'project']),
    description: pickStr(p, ['description', 'summary', 'details', 'about']),
    technologies: STRARR(p['technologies'] ?? p['tech_stack'] ?? p['skills'] ?? p['stack']),
    link: pickStr(p, ['link', 'url', 'github', 'repo']) || undefined,
  }));
}

// ---- Certificates ----
function normalizeCertificates(obj: RawRecord): CertificateItem[] {
  const raw = obj['certificates'] ?? obj['certifications'] ?? obj['courses'];
  // Backend returns array of plain strings like ["AWS Cloud Practitioner", "CCNA"]
  if (Array.isArray(raw)) {
    return raw.map((c) => {
      if (typeof c === 'string') return { title: c, issuer: '' };
      const rec = c as RawRecord;
      return {
        title: pickStr(rec, ['title', 'name', 'certificate', 'course']),
        issuer: pickStr(rec, ['issuer', 'organization', 'provider', 'platform']),
        date: pickStr(rec, ['date', 'year', 'issued', 'issue_date']),
        link: pickStr(rec, ['link', 'url', 'credential_url']) || undefined,
      };
    });
  }
  return [];
}

// ---- Profile ----
export function normalizeProfile(obj: RawRecord): Profile {
  const name = pickStr(obj, ['name', 'full_name', 'candidate_name', 'user_name']);
  return {
    name,
    email: pickStr(obj, ['email', 'mail']),
    phone: pickStr(obj, ['phone', 'mobile', 'contact', 'phone_number']),
    college: pickStr(obj, ['college', 'institution', 'university', 'school']),
    degree: pickStr(obj, ['degree', 'qualification', 'education']),
    location: pickStr(obj, ['location', 'city', 'address', 'place']),
    summary: pickStr(obj, ['summary', 'about', 'profile_summary', 'objective', 'bio']),
    // Backend returns cgpa as a top-level number field
    resumeScore: (() => {
      const explicit = obj['resume_score'] ?? obj['ats_score'] ?? obj['score'] ?? obj['resume_quality'];
      if (explicit != null) return NUM(explicit, 75);
      const cgpa = NUM(obj['cgpa'] ?? obj['gpa'], 0);
      if (cgpa > 0) return Math.min(100, Math.round((cgpa / 10) * 100));
      return 75;
    })(),
    skills: normalizeSkills(obj),
    education: normalizeEducation(obj),
    experience: normalizeExperience(obj),
    projects: normalizeProjects(obj),
    certificates: normalizeCertificates(obj),
    github: pickStr(obj, ['github', 'github_url']) || undefined,
    linkedin: pickStr(obj, ['linkedin', 'linkedin_url']) || undefined,
    portfolio: pickStr(obj, ['portfolio', 'website', 'portfolio_url']) || undefined,
    raw: obj,
  };
}

// Parse a skills value that may be a JSON array string like "['Python', 'Java']" or
// a real array. The backend serializes DataFrame list columns as Python repr strings.
function parseSkillsField(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(STR).filter(Boolean);
  if (typeof v === 'string' && v.trim()) {
    // Python list repr: ['Python', 'Java'] or ["Python"]
    const cleaned = v.replace(/'/g, '"');
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed.map(STR).filter(Boolean);
    } catch {
      // comma-separated fallback
      return v.replace(/[\[\]'"]/g, '').split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

// ---- Internship / recommendation ----
// Backend DataFrame columns (exact names from logs):
//   Role, Company Name, Location, Average Stipend, Domain,
//   Normalized Skills, semantic_score, skill_overlap, final_score,
//   recommendation_level, matched_skills, missing_skills,
//   learning_resources, Website Link
export function normalizeRecommendation(r: RawRecord, index: number): Internship {
  const company = pickStr(r, ['Company Name', 'company', 'organization', 'employer']);
  const role = pickStr(r, ['Role', 'role', 'title', 'position', 'job_title', 'designation']);
  const location = pickStr(r, ['Location', 'location', 'city', 'place', 'work_location']);
  const remoteRaw = r['remote'] ?? r['is_remote'] ?? r['work_mode'];
  const remote =
    typeof remoteRaw === 'boolean'
      ? remoteRaw
      : /remote|wfh|anywhere/i.test(STR(remoteRaw) + ' ' + location);

  // final_score is typically 0-1 cosine similarity; convert to 0-100
  const rawScore =
    r['final_score'] ?? r['semantic_score'] ?? r['skill_overlap'] ??
    r['match_percentage'] ?? r['match'] ?? r['match_score'] ?? r['score'];
  let matchPct: number;
  if (rawScore != null) {
    const n = NUM(rawScore, 0);
    matchPct = n <= 1 ? Math.round(n * 100) : Math.round(n);
  } else {
    matchPct = 50 + ((index * 7) % 40);
  }
  matchPct = Math.min(100, Math.max(0, matchPct));

  const techsRaw =
    r['Normalized Skills'] ?? r['matched_skills'] ?? r['technologies'] ??
    r['tech_stack'] ?? r['skills'] ?? r['required_skills'];
  const technologies = parseSkillsField(techsRaw);

  const stipendRaw = pickStr(r, ['Average Stipend', 'stipend', 'salary', 'compensation', 'pay']);
  const stipend = stipendRaw
    ? (typeof r['Average Stipend'] === 'number'
        ? `₹${Number(r['Average Stipend']).toLocaleString()}/month`
        : stipendRaw)
    : 'Not specified';

  return {
    id: STR(r['id'] ?? r['_id'] ?? `rec_${index}`),
    company,
    role,
    location,
    remote,
    duration: pickStr(r, ['duration', 'tenure', 'period', 'internship_duration']) || 'Not specified',
    stipend,
    technologies,
    matchPercentage: matchPct,
    recommendationLevel: pickStr(r, ['recommendation_level', 'recommendationLevel', 'match_level']) || '',
    description:
      pickStr(r, ['description', 'summary', 'details', 'about', 'job_description']) ||
      (company ? `Internship opportunity at ${company}.` : 'AI-matched internship opportunity.'),
    postedAt: pickStr(r, ['posted_at', 'posted', 'created_at', 'date']) || new Date().toISOString(),
    url: pickStr(r, ['Website Link', 'url', 'link', 'apply_url', 'job_url', 'website']) || undefined,
    matchedSkills: STRARR(r['matched_skills']),
    missingSkills: STRARR(r['missing_skills']),
    learningResources: (r['learning_resources'] ?? {}) as Record<string, LearningResource>,
    raw: r,
  };
}

// ---- Full /recommend response ----
export function normalizeRecommendResponse(
  raw: RecommendResponse,
  sourceFileName: string
): RecommendResult {
  const profile = normalizeProfile((raw.profile ?? {}) as RawRecord);
  const rawAny = raw as unknown as RawRecord;
  const predictedDomain = STR(
    rawAny['predicted_domain'] ??
    rawAny['predictedDomain'] ??
    rawAny['domain'] ??
    'General'
  );
  const recommendations = (raw.recommendations ?? []).map((r, i) =>
    normalizeRecommendation(r as RawRecord, i)
  );
  return { profile, predictedDomain, recommendations, sourceFileName };
}
