import api from '@/api/api';
import type { HealthResponse, RawRecord, RecommendResponse } from '@/types';

// The ONLY two backend endpoints this frontend talks to.
export const backendService = {
  // GET / -> { message, status }
  health: () => api.get<HealthResponse>('/').then((r) => r.data),

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
};

// Re-export the raw type for convenience.
export type { RawRecord };
