/** Shapes shared between the build-time templates and the browser runtime.
 *  The storage blob is the contract documented in course-site/references/state.md. */

export interface QuizRecord {
  score: number;
  total: number;
  at: number;
  missed?: number[];
}

export interface TopicRecord {
  read?: boolean;
  readAt?: number;
  quiz?: QuizRecord;
}

export interface ProjectRecord {
  steps: boolean[];
}

export type ThemePref = 'system' | 'light' | 'dark';

export interface State {
  v: number;
  name: string | null;
  theme: ThemePref;
  lastVisited: string | null;
  topics: Record<string, TopicRecord>;
  tests: Record<string, QuizRecord>;
  projects: Record<string, ProjectRecord>;
}

export interface UnitConfig {
  id: string;
  title: string;
  topics: string[];
}

export interface CourseConfig {
  slug: string;
  passingScore: number;
  totalTopics: number;
  /** This page's relative prefix to the site root ('' or '../'). */
  rel: string;
  units: UnitConfig[];
}

export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

/** Only what grading needs. The prose lives in the HTML, not here. */
export interface QuizQuestion {
  type: QuestionType;
  correctOptionIndex?: number;
  correctAnswer?: boolean;
  objectives: number[];
}

export interface QuizData {
  id: string;
  kind: 'quiz' | 'test';
  objectiveNames: Record<string, string>;
  questions: QuizQuestion[];
}

export interface SearchEntry {
  title: string;
  unit?: string;
  href: string;
  text?: string;
}
