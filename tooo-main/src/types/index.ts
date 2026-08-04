// ---------------------------------------------------------------------------
// Types — aligned to the ONLY two real backend endpoints:
//   GET  /            -> { message, status }
//   POST /recommend   -> { profile, predicted_domain, recommendations }
//
// Because the backend's `profile` and `recommendations` field names are not
// pinned down here, the raw shapes are kept loose and a normalizer
// (utils/normalize.ts) maps common field-name variants to the canonical
// frontend types below. This lets the UI render whatever your API returns.
// ---------------------------------------------------------------------------

// Raw (loose) shapes straight from the backend
export type RawRecord = Record<string, unknown>;

export interface HealthResponse {
  message: string;
  status: string;
}

export interface RecommendResponse {
  profile: RawRecord;
  predicted_domain: string;
  recommendations: RawRecord[];
}

// Canonical frontend types (produced by the normalizer)
export interface Skill {
  name: string;
  proficiency: number; // 0-100
  category?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  startYear?: string;
  endYear?: string;
  gpa?: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface CertificateItem {
  title: string;
  issuer: string;
  date?: string;
  link?: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  start: string;
  end?: string;
  description?: string;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  location: string;
  summary: string;
  resumeScore: number;
  skills: Skill[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  raw: RawRecord;
}

export interface LearningResource {
  youtube?: string;
  coursera?: string;
  freecodecamp?: string;
  [key: string]: string | undefined;
}

export interface Internship {
  id: string;
  company: string;
  role: string;
  location: string;
  remote: boolean;
  duration: string;
  stipend: string;
  technologies: string[];
  matchPercentage: number;
  recommendationLevel: string;
  description: string;
  postedAt: string;
  url?: string;
  matchedSkills: string[];
  missingSkills: string[];
  learningResources: Record<string, LearningResource>;
  raw: RawRecord;
}

// The normalized package stored in React state after a /recommend call
export interface RecommendResult {
  profile: Profile;
  predictedDomain: string;
  recommendations: Internship[];
  sourceFileName: string;
}
