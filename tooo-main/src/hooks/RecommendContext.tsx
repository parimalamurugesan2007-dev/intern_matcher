import { createContext, useContext, useState, type ReactNode } from 'react';
import type { RecommendResult } from '@/types';

// Single source of truth for the whole app: the normalized /recommend result.
// After a resume upload we store it here, and every dashboard page reads from it.
interface RecommendContextValue {
  result: RecommendResult | null;
  setResult: (r: RecommendResult | null) => void;
}

const RecommendContext = createContext<RecommendContextValue | undefined>(undefined);

export function RecommendProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<RecommendResult | null>(null);
  return (
    <RecommendContext.Provider value={{ result, setResult }}>
      {children}
    </RecommendContext.Provider>
  );
}

export function useRecommendResult() {
  const ctx = useContext(RecommendContext);
  if (!ctx) throw new Error('useRecommendResult must be used within RecommendProvider');
  return ctx;
}
