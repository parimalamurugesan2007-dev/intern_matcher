import { useMutation } from '@tanstack/react-query';
import { backendService } from '@/services';
import { normalizeRecommendResponse } from '@/utils/normalize';
import { useRecommendResult } from './RecommendContext';
import { getErrorMessage } from '@/api/api';
import type { RecommendResult } from '@/types';

export { useRecommendResult } from './RecommendContext';
export { getErrorMessage } from '@/api/api';

// The only data mutation in the app: POST /recommend with a resume file.
// On success the normalized result is stored in the RecommendContext so
// every dashboard page can read it.
export function useRecommend() {
  const { setResult } = useRecommendResult();
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      backendService.recommend(file, onProgress),
    onSuccess: (data, vars) => {
      const normalized: RecommendResult = normalizeRecommendResponse(data, vars.file.name);
      setResult(normalized);
    },
  });
}
