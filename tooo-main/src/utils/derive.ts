import type { Internship, LearningResource, Profile, Skill } from '@/types';

// ---------------------------------------------------------------------------
// Derive "skill gap" and a "learning roadmap" from the real /recommend
// response. The backend already returns `missing_skills` (array) and
// `learning_resources` (object keyed by skill -> {youtube, coursera, ...})
// per recommendation — we aggregate those across all recommendations.
// ---------------------------------------------------------------------------

export interface LearningResourceLink {
  title: string;
  type: 'youtube' | 'course' | 'article' | 'documentation' | 'freecodecamp';
  provider: string;
  url: string;
}

export interface MissingSkillInfo {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  demandCount: number; // how many recommendations flag it as missing
  progress: number;
  resources: LearningResourceLink[];
}

export interface DerivedSkillGap {
  currentSkills: Skill[];
  missingSkills: MissingSkillInfo[];
  overallGapScore: number;
}

export interface DerivedRoadmap {
  totalWeeks: number;
  targetRole: string;
  weeks: {
    week: number;
    title: string;
    topic: string;
    estimatedHours: number;
    completed: boolean;
    progress: number;
    resources: LearningResourceLink[];
  }[];
}

// Convert the backend's learning_resources object into link cards.
function resourcesToLinks(
  skill: string,
  res: LearningResource | undefined
): LearningResourceLink[] {
  if (!res) return [];
  const links: LearningResourceLink[] = [];
  if (res.youtube) {
    links.push({ title: `Learn ${skill} on YouTube`, type: 'youtube', provider: 'YouTube', url: res.youtube });
  }
  if (res.coursera) {
    links.push({ title: `${skill} course on Coursera`, type: 'course', provider: 'Coursera', url: res.coursera });
  }
  if (res.freecodecamp) {
    links.push({ title: `${skill} on freeCodeCamp`, type: 'article', provider: 'freeCodeCamp', url: res.freecodecamp });
  }
  return links;
}

// Aggregate missing skills across all recommendations.
function aggregateMissingSkills(recommendations: Internship[]): MissingSkillInfo[] {
  const map = new Map<string, { count: number; resources: LearningResource | undefined }>();

  for (const r of recommendations) {
    for (const skill of r.missingSkills) {
      const key = skill.toLowerCase();
      const existing = map.get(key);
      // Prefer the first non-empty learning_resources entry for this skill.
      const res = r.learningResources?.[skill] ?? r.learningResources?.[key];
      map.set(key, {
        count: (existing?.count ?? 0) + 1,
        resources: existing?.resources ?? res,
      });
    }
  }

  return Array.from(map.entries())
    .map(([key, { count, resources }]) => {
      // Use original-cased skill name from the first recommendation that has it.
      const originalName =
        recommendations.find((r) => r.missingSkills.some((s) => s.toLowerCase() === key))?.missingSkills.find((s) => s.toLowerCase() === key) ?? key;
      const priority: 'high' | 'medium' | 'low' = count >= 3 ? 'high' : count >= 2 ? 'medium' : 'low';
      return {
        skill: originalName,
        priority,
        demandCount: count,
        progress: 0,
        resources: resourcesToLinks(originalName, resources),
      };
    })
    .sort((a, b) => b.demandCount - a.demandCount);
}

export function deriveSkillGap(
  profile: Profile,
  recommendations: Internship[]
): DerivedSkillGap {
  const missing = aggregateMissingSkills(recommendations);

  // Gap score: weighted by how many recommendations flag each missing skill.
  const totalDemand = missing.reduce((s, m) => s + m.demandCount, 0);
  const gapScore =
    recommendations.length && missing.length
      ? Math.min(100, Math.round((totalDemand / (recommendations.length * 4)) * 100))
      : missing.length
        ? 35
        : 0;

  return { currentSkills: profile.skills, missingSkills: missing, overallGapScore: gapScore };
}

export function deriveRoadmap(
  profile: Profile,
  recommendations: Internship[],
  predictedDomain: string
): DerivedRoadmap {
  const gap = deriveSkillGap(profile, recommendations);
  const sorted = [...gap.missingSkills].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  const weeks = sorted.map((m, i) => ({
    week: i + 1,
    title: m.skill,
    topic: `Build foundational ${m.skill} skills for ${predictedDomain}`,
    estimatedHours: m.priority === 'high' ? 16 : m.priority === 'medium' ? 12 : 8,
    completed: false,
    progress: 0,
    resources: m.resources,
  }));

  return {
    totalWeeks: weeks.length || 1,
    targetRole: predictedDomain,
    weeks: weeks.length
      ? weeks
      : [
          {
            week: 1,
            title: 'Keep sharpening your skills',
            topic:
              'Your profile already covers the skills your recommendations demand. Focus on projects and interview prep.',
            estimatedHours: 10,
            completed: false,
            progress: 0,
            resources: [
              {
                title: 'Tech Interview Handbook',
                type: 'documentation',
                provider: 'GitHub',
                url: 'https://www.techinterviewhandbook.org/',
              },
            ],
          },
        ],
  };
}
