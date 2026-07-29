import fs from 'node:fs';
import path from 'node:path';
import type { CourseLicense } from './license';

/**
 * Reading and deriving from course.json. This is the only module that knows the
 * on-disk shape; the loaders in loaders.ts turn it into content collections and
 * everything downstream works from validated collection entries.
 */

export const COURSE_DIR = process.env.COURSE_DIR ?? '';

export function courseFile(...parts: string[]): string {
  return path.join(COURSE_DIR, ...parts);
}

export function readCourseJson(): RawCourse {
  const raw = fs.readFileSync(courseFile('course.json'), 'utf8');
  return JSON.parse(raw) as RawCourse;
}

export function readIfPresent(rel: string): string | null {
  const p = courseFile(rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

/** Ids are positional and must stay stable: they key localStorage progress. */
export const unitId = (ui: number): string => `u${ui + 1}`;
export const topicId = (ui: number, ti: number): string => `u${ui + 1}t${ti + 1}`;
export const projectId = (ui: number, pi: number): string => `u${ui + 1}p${pi + 1}`;

/** URL segments. Topics are numbered per unit in the URL even though the source
 *  tree numbers them globally across the course. */
export const unitSlug = (ui: number): string => `unit-${ui + 1}`;
export const topicSlug = (ti: number): string => `topic-${ti + 1}`;
export const projectSlug = (pi: number): string => `project-${pi + 1}`;

/** The inverse of `unitSlug`, for pages that hold a slug but need the number to
 *  index the per-unit accent palette. */
export const unitNumber = (slug: string): number => Number(slug.replace(/^unit-/, '')) || 1;

const OBJECTIVE_RE = /\(objectives?\s+([\d,\s]+(?:and\s*\d+)?)\)/gi;

/**
 * Pull the `(objective N)` / `(objectives N, M)` citations out of an explanation.
 * Done here, at build time — the browser should never parse prose. An empty result
 * means the per-objective review list would silently show nothing, which is the
 * whole feature the citation contract exists to enable, so gate S7 fails on it.
 */
export function objectivesOf(explanation: string): number[] {
  const nums = new Set<number>();
  for (const m of (explanation || '').matchAll(OBJECTIVE_RE)) {
    for (const d of (m[1] ?? '').match(/\d+/g) ?? []) nums.add(Number(d));
  }
  return [...nums].sort((a, b) => a - b);
}

/** Drops a leading `# Title` line so the page's own <h1> is the only one. */
export function stripTitle(md: string): string {
  return md.replace(/^\s*#\s+.+?\n/, '');
}

/** Plain-ish text for the search index. */
export function toPlainText(md: string, limit = 400): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_`>|-]/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}

/** Objective titles for a unit, keyed by their unit-scoped number. */
export function objectiveNames(unit: RawUnit): Record<string, string> {
  const out: Record<string, string> = {};
  let n = 0;
  for (const topic of unit.topics ?? []) {
    for (const goal of topic.learningGoals ?? []) {
      n += 1;
      out[String(goal.unitObjectiveNumber ?? n)] = goal.title;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// The raw on-disk shapes. Deliberately loose — content.config.ts is where these
// are validated, so a malformed course fails with a schema error naming the entry.
// ---------------------------------------------------------------------------

export interface RawQuestion {
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  orderIndex: number;
  options?: string[];
  correctOptionIndex?: number;
  correctAnswer?: boolean;
  sampleAnswer?: string;
  explanation: string;
}

export interface RawGoal {
  title: string;
  description: string | null;
  orderIndex: number;
  unitObjectiveNumber: number;
}

export interface RawTopic {
  title: string;
  description: string;
  orderIndex: number;
  learningGoals?: RawGoal[];
  activities?: Array<{ type: string; path: string }>;
  flashcards?: Array<{ front: string; back: string; orderIndex: number }>;
  quiz?: { questions: RawQuestion[] };
}

export interface RawProject {
  title: string;
  goal: string;
  type: string;
  orderIndex: number;
  path?: string;
  config?: { instructions?: string; starterCells?: Array<{ id: string; content: string }> };
  steps?: Array<{ id: string; title: string; description: string; completionCriteria: string }>;
  rubric?: Array<{ criterion: string; weight: number; description: string }>;
  testCases?: Array<{ name: string; code: string; expectedOutput: string; weight: number; description: string }>;
  environment?: Record<string, unknown>;
}

export interface RawUnit {
  title: string;
  description: string;
  orderIndex: number;
  topics: RawTopic[];
  test?: { title: string; description: string; passingScore: number; questions: RawQuestion[] };
  projects?: RawProject[];
}

export interface RawCourse {
  title: string;
  slug: string;
  subtitle: string;
  about: string;
  license: CourseLicense;
  categories?: string[];
  brandColors?: { primary?: string; ink?: string };
  /** Optional home-page artwork. `image` is relative to the course directory. */
  hero?: { image: string; width: number; height: number; alt: string };
  skills?: Array<{ title: string; description: string; orderIndex: number }>;
  faqs?: Array<{ question: string; answer: string; orderIndex: number }>;
  spine?: {
    runningExample: string;
    transformation: { before: string; after: string };
    failureMoment?: { unit: number; wall: string; resolvedInUnit: number };
  };
  sources?: Array<{ id: number; claim: string; value: string; source: string; angle: string }>;
  ungrounded?: Array<{ claim: string; resolution: string; topic: string | null }>;
  units: RawUnit[];
}
