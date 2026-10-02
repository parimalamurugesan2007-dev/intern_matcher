// ---------------------------------------------------------------------------
// Types — aligned to the real backend endpoints:
//   GET  /                          -> { message, status }
//   GET  /health                    -> artifact/service health detail
//   POST /recommend                 -> { profile, predicted_domain, predicted_domains, recommendations }
//   GET  /recommend/domain/{domain} -> { domain, count, internships }
//   GET  /internships/search        -> { filters, count, internships }
//
// Because the backend's `profile` and `recommendations` field names are not
// pinned down here, the raw shapes are kept loose and a normalizer
// (utils/normalize.ts) maps common field-name variants to the canonical
// frontend types below. This lets the UI render whatever your API returns.
// ---------------------------------------------------------------------------

// Raw (loose) shapes straight from the backend
export type RawRecord = Record<string, unknown>;

export interface HealthResponse {
  status: 'healthy' | 'degraded' | string;
  artifacts: {
    best_model: boolean;
    vectorizer: boolean;
    label_encoder: boolean;
    dataset: boolean;
    embeddings: boolean;
  };
  services: {
    profile_extractor: boolean;
    domain_predictor: boolean;
    recommendation_engine: boolean;
  };
  errors: {
    domain_predictor: string | null;
    recommendation_engine: string | null;
  };
}

// One entry of the Top-K domain prediction list.
export interface TopDomain {
  domain: string;
  confidence: number; // 0-1
}

export interface RecommendResponse {
  profile: RawRecord;
  predicted_domain: string;
  predicted_domains?: TopDomain[];
  recommendations: RawRecord[];
}

// POST /resume/upload -> { filename, extracted_skills, predicted_domains }
// Skills-only + Top-5 domains, no recommendations (lighter than /recommend).
export interface ResumeUploadResponse {
  filename: string;
  extracted_skills: string[];
  predicted_domains: TopDomain[];
}

// GET /recommend/domain/{domain} and GET /internships/search share this shape.
export interface InternshipListResponse {
  count: number;
  internships: RawRecord[];
  domain?: string;
  filters?: Record<string, string | number | null | undefined>;
}

export interface InternshipSearchFilters {
  location?: string;
  domain?: string;
  mode?: string;
  duration?: string;
  stipend?: string;
  min_stipend?: number;
  company?: string;
  skills?: string; // comma-separated
  keyword?: string;
  top_k?: number;
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
export interface AchievementItem {
  title: string;
  organization?: string;
  date?: string;
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
  achievements: AchievementItem[];
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
  predictedDomains: TopDomain[];
  recommendations: Internship[];
  sourceFileName: string;
}

// ---------------------------------------------------------------------------
// Auth & user types (new backend endpoints)
// ---------------------------------------------------------------------------
export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface SavedInternshipItem {
  id: number;
  internship_id: string;
  role: string;
  company: string;
  location: string;
  stipend: string;
  domain: string;
  website_link: string;
  saved_at: string;
}

export interface AppliedInternshipItem {
  id: number;
  internship_id: string;
  role: string;
  company: string;
  applied_at: string;
  status: string;
}
