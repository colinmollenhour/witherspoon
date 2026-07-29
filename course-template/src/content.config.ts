import { defineCollection, z } from 'astro:content';
import { courseLoader, projectsLoader, topicsLoader, unitsLoader } from './lib/loaders';

/**
 * Four collections, all derived from one course directory.
 *
 * course.json is the single source of truth for every structured thing — units,
 * topics, objectives, flashcards, quizzes, unit tests, projects. Markdown supplies
 * prose only: `read.md` for a topic, `brief.md` and `rubric.md` for a project.
 *
 * The schemas below are the contract from course-builder/references/schema.md,
 * expressed so a violation fails the build naming the offending entry — rather
 * than being papered over by a parser guessing at intent.
 */

const question = z
  .object({
    question: z.string().min(1),
    type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']),
    orderIndex: z.number().int(),
    options: z.array(z.string()).optional(),
    correctOptionIndex: z.number().int().optional(),
    correctAnswer: z.boolean().optional(),
    sampleAnswer: z.string().optional(),
    /** What a full-credit answer must contain — shown when self-marking. */
    graderNotes: z.string().optional(),
    explanation: z.string().min(1),
    // Extracted from the explanation's (objective N) citation at load time.
    objectives: z.array(z.number().int()).min(1),
  })
  .superRefine((q, ctx) => {
    if (q.type === 'MULTIPLE_CHOICE') {
      if (!q.options || q.options.length !== 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `MULTIPLE_CHOICE needs exactly 4 options, got ${q.options?.length ?? 0}`,
        });
      }
      const i = q.correctOptionIndex;
      if (i === undefined || i < 0 || i >= (q.options?.length ?? 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `correctOptionIndex ${i} is out of range`,
        });
      }
    }
    if (q.type === 'TRUE_FALSE' && typeof q.correctAnswer !== 'boolean') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'TRUE_FALSE needs correctAnswer' });
    }
    if (q.type === 'SHORT_ANSWER' && !q.sampleAnswer) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'SHORT_ANSWER needs sampleAnswer' });
    }
  });

const objective = z.object({
  title: z.string(),
  number: z.number().int(),
});

const course = defineCollection({
  loader: courseLoader(),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    subtitle: z.string(),
    about: z.string(),
    accent: z.string(),
    accentInk: z.string(),
    categories: z.array(z.string()).default([]),
    hero: z
      .object({
        image: z.string().min(1),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        // Mandatory, and long enough to actually describe the picture — an image
        // this prominent with "hero image" as its alt text helps nobody.
        alt: z.string().min(20),
      })
      .nullable()
      .default(null),
    skills: z.array(z.object({ title: z.string(), description: z.string() })).default([]),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
    spine: z
      .object({
        runningExample: z.string(),
        transformation: z.object({ before: z.string(), after: z.string() }),
        failureMoment: z
          .object({ unit: z.number(), wall: z.string(), resolvedInUnit: z.number() })
          .optional(),
      })
      .optional(),
    sources: z
      .array(
        z.object({
          id: z.number(),
          claim: z.string(),
          value: z.string(),
          source: z.string(),
          angle: z.string(),
        }),
      )
      .default([]),
    ungrounded: z
      .array(
        z.object({
          claim: z.string(),
          resolution: z.string(),
          topic: z.string().nullable(),
        }),
      )
      .default([]),
    totalTopics: z.number().int(),
    totalQuizzes: z.number().int(),
    passingScore: z.number().int(),
  }),
});

const units = defineCollection({
  loader: unitsLoader(),
  schema: z.object({
    unitId: z.string(),
    slug: z.string(),
    index: z.number().int(),
    title: z.string(),
    description: z.string(),
    objectiveNames: z.record(z.string(), z.string()),
    topics: z.array(
      z.object({
        id: z.string(),
        slug: z.string(),
        title: z.string(),
        description: z.string(),
      }),
    ),
    projects: z.array(
      z.object({ id: z.string(), slug: z.string(), title: z.string(), goal: z.string() }),
    ),
    test: z
      .object({
        title: z.string(),
        description: z.string(),
        passingScore: z.number().int(),
        questions: z.array(question).min(1),
      })
      .nullable(),
  }),
});

const topics = defineCollection({
  loader: topicsLoader(),
  schema: z.object({
    topicId: z.string(),
    unitId: z.string(),
    unitSlug: z.string(),
    unitTitle: z.string(),
    slug: z.string(),
    index: z.number().int(),
    title: z.string(),
    description: z.string(),
    objectives: z.array(objective),
    objectiveNames: z.record(z.string(), z.string()),
    flashcards: z.array(z.object({ front: z.string(), back: z.string() })).min(1),
    questions: z.array(question).min(1),
  }),
});

const projects = defineCollection({
  loader: projectsLoader(),
  schema: z.object({
    projectId: z.string(),
    unitId: z.string(),
    unitSlug: z.string(),
    unitTitle: z.string(),
    slug: z.string(),
    title: z.string(),
    goal: z.string(),
    type: z.string(),
    steps: z.array(
      z.object({ title: z.string(), description: z.string(), completionCriteria: z.string() }),
    ),
    rubric: z
      .array(z.object({ criterion: z.string(), weight: z.number(), description: z.string() }))
      .refine(
        (r) => r.length === 0 || Math.round(r.reduce((s, x) => s + x.weight, 0)) === 100,
        'rubric weights must sum to 100',
      ),
    testCases: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        weight: z.number(),
        expectedOutput: z.string(),
        source: z.string().nullable(),
        path: z.string(),
      }),
    ),
    starterFiles: z.array(z.object({ name: z.string(), content: z.string() })),
    environment: z.record(z.string(), z.unknown()).nullable(),
  }),
});

export const collections = { course, units, topics, projects };
