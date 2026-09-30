import { useMutation, useQuery } from '@tanstack/react-query';
import { backendService } from '@/services';
import { normalizeRecommendResponse, normalizeInternshipList } from '@/utils/normalize';
import { useRecommendResult } from './RecommendContext';
import { getErrorMessage } from '@/api/api';
import type { InternshipSearchFilters, RecommendResult, TopDomain } from '@/types';

export { useRecommendResult } from './RecommendContext';
export { useAuth, AuthProvider } from './AuthContext';
export { getErrorMessage } from '@/api/api';

// The main data mutation in the app: POST /recommend with a resume file.
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

// Lighter alternative to useRecommend: POST /resume/upload, returns just
// extracted skills + Top-5 domains (no recommendations yet). Useful for a
// quick "here's what we found in your resume" step before the user
// commits to browsing a domain.
export function useResumeUpload() {
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      backendService.uploadResume(file, onProgress),
  });
}

// GET /recommend/domain/{domain} — internships for one domain. Disabled
// until a domain is actually selected (enabled: !!domain).
export function useDomainInternships(domain: string | null, topK = 10) {
  return useQuery({
    queryKey: ['recommendByDomain', domain, topK],
    queryFn: () => backendService.recommendByDomain(domain as string, topK),
    enabled: !!domain,
    select: (data) => ({
      domain: data.domain,
      count: data.count,
      internships: normalizeInternshipList(data.internships),
    }),
    retry: false, // a 404 (no internships for this domain) is an expected outcome, not a transient error
  });
}

// GET /internships/search — manual multi-filter search.
export function useInternshipSearch(filters: InternshipSearchFilters, enabled: boolean) {
  return useQuery({
    queryKey: ['searchInternships', filters],
    queryFn: () => backendService.searchInternships(filters),
    enabled,
    select: (data) => ({
      count: data.count,
      filters: data.filters,
      internships: normalizeInternshipList(data.internships),
    }),
  });
}

// ---- Auth hooks ----
export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      backendService.login(email, password),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      backendService.register(name, email, password),
  });
}

// ---- User profile ----
export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: () => backendService.getProfile(),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      backendService.changePassword(currentPassword, newPassword),
  });
}

// ---- Saved internships ----
export function useSavedInternships() {
  return useQuery({
    queryKey: ['savedInternships'],
    queryFn: () => backendService.getSavedInternships(),
  });
}

export function useSaveInternship() {
  return useMutation({
    mutationFn: backendService.saveInternship,
  });
}

export function useDeleteSavedInternship() {
  return useMutation({
    mutationFn: (id: number) => backendService.deleteSavedInternship(id),
  });
}

// ---- Applied internships ----
export function useAppliedInternships() {
  return useQuery({
    queryKey: ['appliedInternships'],
    queryFn: () => backendService.getAppliedInternships(),
  });
}

export function useApplyInternship() {
  return useMutation({
    mutationFn: backendService.applyInternship,
  });
}

export type { TopDomain };
