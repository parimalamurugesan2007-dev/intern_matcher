import api from '@/api/api';
import type {
  AppliedInternshipItem,
  AuthResponse,
  HealthResponse,
  InternshipListResponse,
  InternshipSearchFilters,
  RawRecord,
  RecommendResponse,
  ResumeUploadResponse,
  SavedInternshipItem,
  UserProfile,
} from '@/types';

// The backend endpoints this frontend talks to:
//   GET  /health                    -> HealthResponse
//   POST /resume/upload             -> ResumeUploadResponse (skills + top-5 domains only)
//   POST /recommend                 -> RecommendResponse (profile + domains + recommendations)
//   GET  /recommend/domain/{domain} -> InternshipListResponse
//   GET  /internships/search        -> InternshipListResponse
//   POST /auth/register             -> AuthResponse
//   POST /auth/login                -> AuthResponse
//   GET  /user/profile              -> UserProfile
//   PUT  /user/password             -> { message }
//   POST /saved                     -> SavedInternshipItem
//   GET  /saved                     -> SavedInternshipItem[]
//   DELETE /saved/{id}              -> { message }
//   POST /applied                   -> AppliedInternshipItem
//   GET  /applied                   -> AppliedInternshipItem[]
export const backendService = {
  // GET /health -> artifact/service availability detail
  health: () => api.get<HealthResponse>('/health').then((r) => r.data),

  // POST /resume/upload (multipart/form-data, field: "file")
  uploadResume: (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<ResumeUploadResponse>('/resume/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      })
      .then((r) => r.data);
  },

  // POST /recommend (multipart/form-data, field: "file")
  recommend: (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<RecommendResponse>('/recommend', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      })
      .then((r) => r.data);
  },

  // GET /recommend/domain/{domain}
  recommendByDomain: (domain: string, topK = 10) =>
    api
      .get<InternshipListResponse>(`/recommend/domain/${encodeURIComponent(domain)}`, {
        params: { top_k: topK },
      })
      .then((r) => r.data),

  // GET /internships/search
  searchInternships: (filters: InternshipSearchFilters) =>
    api
      .get<InternshipListResponse>('/internships/search', { params: filters })
      .then((r) => r.data),

  // ---- Auth ----
  register: (name: string, email: string, password: string) =>
    api
      .post<AuthResponse>('/auth/register', { name, email, password })
      .then((r) => r.data),

  login: (email: string, password: string) =>
    api
      .post<AuthResponse>('/auth/login', { email, password })
      .then((r) => r.data),

  // ---- User ----
  getProfile: () =>
    api.get<UserProfile>('/user/profile').then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api
      .put('/user/password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      .then((r) => r.data),

  // ---- Saved ----
  saveInternship: (data: {
    internship_id: string;
    role: string;
    company: string;
    location?: string;
    stipend?: string;
    domain?: string;
    website_link?: string;
  }) => api.post<SavedInternshipItem>('/saved', data).then((r) => r.data),

  getSavedInternships: () =>
    api.get<SavedInternshipItem[]>('/saved').then((r) => r.data),

  deleteSavedInternship: (id: number) =>
    api.delete(`/saved/${id}`).then((r) => r.data),

  // ---- Applied ----
  applyInternship: (data: {
    internship_id: string;
    role: string;
    company: string;
  }) => api.post<AppliedInternshipItem>('/applied', data).then((r) => r.data),

  getAppliedInternships: () =>
    api.get<AppliedInternshipItem[]>('/applied').then((r) => r.data),
};

// Re-export the raw type for convenience.
export type { RawRecord };
