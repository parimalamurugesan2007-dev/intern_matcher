import api from '@/api/api';
import type {
  HealthResponse,
  InternshipListResponse,
  InternshipSearchFilters,
  RawRecord,
  RecommendResponse,
  ResumeUploadResponse,
} from '@/types';

// The backend endpoints this frontend talks to:
//   GET  /health                    -> HealthResponse
//   POST /resume/upload             -> ResumeUploadResponse (skills + top-5 domains only)
//   POST /recommend                 -> RecommendResponse (profile + domains + recommendations)
//   GET  /recommend/domain/{domain} -> InternshipListResponse
//   GET  /internships/search        -> InternshipListResponse
export const backendService = {
  // GET /health -> artifact/service availability detail
  health: () => api.get<HealthResponse>('/health').then((r) => r.data),

  // POST /resume/upload (multipart/form-data, field: "file")
  // Lighter-weight than /recommend: extracted skills + Top-5 domains only,
  // no internship recommendations. Used right after upload, before the
  // user has picked a domain to browse.
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

  // GET /recommend/domain/{domain} — domain is normalized server-side
  // ("ai", "AI/ML", "Artificial Intelligence" all resolve the same way).
  recommendByDomain: (domain: string, topK = 10) =>
    api
      .get<InternshipListResponse>(`/recommend/domain/${encodeURIComponent(domain)}`, {
        params: { top_k: topK },
      })
      .then((r) => r.data),

  // GET /internships/search — all provided filters are combined with AND logic.
  searchInternships: (filters: InternshipSearchFilters) =>
    api
      .get<InternshipListResponse>('/internships/search', { params: filters })
      .then((r) => r.data),
};

// Re-export the raw type for convenience.
export type { RawRecord };
