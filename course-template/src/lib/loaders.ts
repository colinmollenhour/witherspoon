import fs from 'node:fs';
import path from 'node:path';
import type { Loader, LoaderContext } from 'astro/loaders';
import {
  COURSE_DIR,
  courseFile,
  objectiveNames,
  objectivesOf,
  projectId,
  projectSlug,
  readCourseJson,
  readIfPresent,
  stripTitle,
  topicId,
  topicSlug,
  unitId,
  unitSlug,
  type RawQuestion,
  type RawUnit,
} from './course';
import { compileWidgets } from './widgets';

const DEFAULT_ACCENT = '#3f7ac4';
const DEFAULT_ACCENT_INK = '#ffffff';
const DEFAULT_PASSING_SCORE = 70;

/** Attach the objective citations a question's explanation carries. */
function withObjectives(q: RawQuestion): RawQuestion & { objectives: number[] } {
  return { ...q, objectives: objectivesOf(q.explanation) };
}

/** Order by `orderIndex` where present; a stable no-op where it is not. */
function sorted<T>(list: T[] | undefined): T[] {
  const key = (x: T): number => (x as { orderIndex?: number }).orderIndex ?? 0;
  return [...(list ?? [])].sort((a, b) => key(a) - key(b));
}

function activityPath(topic: RawUnit['topics'][number], type: string): string | null {
  return topic.activities?.find((a) => a.type === type)?.path ?? null;
}

/**
 * `about` is prose written against the course *directory*, so it links to
 * `SOURCES.md` — a file that is not published. The ledger is a page, so point at it.
 *
 * This only surfaced once `about` started being rendered as markdown rather than
 * dropped in as plain text: as text the link was invisible, and gate S3 had nothing
 * to resolve.
 */
function rewriteCourseLinks(md: string): string {
  return md.replace(/\]\(\.?\/?SOURCES\.md[^)]*\)/g, '](sources.html)');
}

/**
 * Project briefs link to their siblings on disk — `rubric.md`, `tests/`, `starter/`.
 * Those files are not published as pages; their content is rendered into sections
 * of the project page instead, so the links are repointed at those sections.
 *
 * The anchors are prefixed `project-` because briefs carry their own `## Rubric`
 * headings, whose auto-generated ids would otherwise collide.
 *
 * Anything else relative is left alone and reported by gate S3 as a broken link,
 * which is the correct outcome — better a named failure than a dead link.
 */
function rewriteBriefLinks(md: string): string {
  return md
    .replace(/\]\(\.?\/?rubric\.md[^)]*\)/g, '](#project-rubric)')
    .replace(/\]\(\.?\/?tests\/[^)]*\)/g, '](#project-test-cases)')
    .replace(/\]\(\.?\/?tests\/?\)/g, '](#project-test-cases)')
    .replace(/\]\(\.?\/?starter\/[^)]*\)/g, '](#project-starter)')
    .replace(/\]\(\.?\/?starter\/?\)/g, '](#project-starter)');
}

export function courseLoader(): Loader {
  return {
    name: 'course-json',
    async load({ store, parseData, generateDigest }: LoaderContext) {
      const c = readCourseJson();
      store.clear();

      let totalTopics = 0;
      let totalQuizzes = 0;
      for (const u of c.units) {
        totalTopics += u.topics.length;
        totalQuizzes += u.topics.filter((t) => t.quiz?.questions?.length).length;
        if (u.test?.questions?.length) totalQuizzes += 1;
      }

      const raw = {
        title: c.title,
        slug: c.slug,
        subtitle: c.subtitle,
        about: rewriteCourseLinks(c.about),
        license: c.license,
        // Stated in the build report when the course does not specify one.
        accent: c.brandColors?.primary ?? DEFAULT_ACCENT,
        accentInk: c.brandColors?.ink ?? DEFAULT_ACCENT_INK,
        categories: c.categories ?? [],
        // Declared, not discovered by convention: the alt text has to be authored,
        // and a hero that silently disappears because a file was renamed is worse
        // than a build that stops. Checked here so the failure names the field.
        hero: c.hero
          ? (() => {
              if (!fs.existsSync(courseFile(c.hero.image))) {
                throw new Error(
                  `course.json declares hero.image "${c.hero.image}" but that file does not exist`,
                );
              }
              return c.hero;
            })()
          : null,
        skills: sorted(c.skills).map((s) => ({ title: s.title, description: s.description })),
        faqs: sorted(c.faqs).map((f) => ({ question: f.question, answer: f.answer })),
        spine: c.spine,
        sources: c.sources ?? [],
        ungrounded: c.ungrounded ?? [],
        totalTopics,
        totalQuizzes,
        passingScore: c.units[0]?.test?.passingScore ?? DEFAULT_PASSING_SCORE,
      };

      const data = await parseData({ id: c.slug, data: raw });
      store.set({ id: c.slug, data, digest: generateDigest(data) });
    },
  };
}

export function unitsLoader(): Loader {
  return {
    name: 'course-units',
    async load({ store, parseData, generateDigest }: LoaderContext) {
      const c = readCourseJson();
      store.clear();

      for (const [ui, u] of c.units.entries()) {
        const names = objectiveNames(u);
        const raw = {
          unitId: unitId(ui),
          slug: unitSlug(ui),
          index: ui + 1,
          title: u.title,
          description: u.description,
          objectiveNames: names,
          topics: u.topics.map((t, ti) => ({
            id: topicId(ui, ti),
            slug: topicSlug(ti),
            title: t.title,
            description: t.description,
          })),
          projects: sorted(u.projects).map((p, pi) => ({
            id: projectId(ui, pi),
            slug: projectSlug(pi),
            title: p.title,
            goal: p.goal,
          })),
          test: u.test
            ? {
                title: u.test.title,
                description: u.test.description,
                passingScore: u.test.passingScore ?? DEFAULT_PASSING_SCORE,
                questions: sorted(u.test.questions).map(withObjectives),
              }
            : null,
        };

        const id = unitSlug(ui);
        const data = await parseData({ id, data: raw });
        store.set({ id, data, digest: generateDigest(data) });
      }
    },
  };
}

export function topicsLoader(): Loader {
  return {
    name: 'course-topics',
    async load({ store, parseData, generateDigest, renderMarkdown, logger }: LoaderContext) {
      const c = readCourseJson();
      store.clear();

      for (const [ui, u] of c.units.entries()) {
        const names = objectiveNames(u);
        for (const [ti, t] of u.topics.entries()) {
          const readPath = activityPath(t, 'READ');
          if (!readPath) {
            throw new Error(`${unitSlug(ui)}/${topicSlug(ti)} has no READ activity in course.json`);
          }
          const abs = courseFile(readPath);
          if (!fs.existsSync(abs)) {
            throw new Error(`${readPath} is referenced by course.json but does not exist on disk`);
          }
          const body = stripTitle(fs.readFileSync(abs, 'utf8'));

          const raw = {
            topicId: topicId(ui, ti),
            unitId: unitId(ui),
            unitSlug: unitSlug(ui),
            unitTitle: u.title,
            slug: topicSlug(ti),
            index: ti + 1,
            title: t.title,
            description: t.description,
            objectives: sorted(t.learningGoals).map((g, gi) => ({
              title: g.title,
              number: g.unitObjectiveNumber ?? gi + 1,
            })),
            objectiveNames: names,
            flashcards: sorted(t.flashcards).map((f) => ({ front: f.front, back: f.back })),
            questions: sorted(t.quiz?.questions).map(withObjectives),
          };

          if (!raw.flashcards.length || !raw.questions.length) {
            logger.warn(`${raw.topicId} is missing flashcards or quiz questions in course.json`);
          }

          const id = `${unitSlug(ui)}/${topicSlug(ti)}`;
          const data = await parseData({ id, data: raw });
          // Widget fences are lifted out before the markdown is rendered and their
          // compiled HTML put back after, so a widget is never at the mercy of the
          // markdown processor's opinion about the JSON inside it.
          const w = await compileWidgets(body, readPath);
          const rendered = await renderMarkdown(w.markdown);
          store.set({
            id,
            data,
            rendered: { ...rendered, html: w.inject(rendered.html) },
            digest: generateDigest(data),
          });
        }
      }
    },
  };
}

export function projectsLoader(): Loader {
  return {
    name: 'course-projects',
    async load({ store, parseData, generateDigest, renderMarkdown }: LoaderContext) {
      const c = readCourseJson();
      store.clear();

      for (const [ui, u] of c.units.entries()) {
        for (const [pi, p] of sorted(u.projects).entries()) {
          // projects[].path was added so the brief could be found at all — without
          // it the previous builder silently shipped project pages with no brief.
          if (!p.path) {
            throw new Error(
              `${unitSlug(ui)} project "${p.title}" has no \`path\` in course.json — ` +
                'it is required so brief.md, rubric.md, starter/ and tests/ can be found.',
            );
          }
          const briefMd = readIfPresent(path.join(p.path, 'brief.md'));
          if (briefMd === null) {
            throw new Error(`${p.path}/brief.md is missing`);
          }

          const starterDir = courseFile(p.path, 'starter');
          const starterFiles = fs.existsSync(starterDir)
            ? fs
                .readdirSync(starterDir)
                .filter((f) => fs.statSync(path.join(starterDir, f)).isFile())
                .sort()
                .map((f) => ({
                  name: f,
                  content: fs.readFileSync(path.join(starterDir, f), 'utf8'),
                }))
            : [];

          const raw = {
            projectId: projectId(ui, pi),
            unitId: unitId(ui),
            unitSlug: unitSlug(ui),
            unitTitle: u.title,
            slug: projectSlug(pi),
            title: p.title,
            goal: p.goal,
            type: p.type,
            steps: sorted(p.steps).map((s) => ({
              title: s.title,
              description: s.description,
              completionCriteria: s.completionCriteria,
            })),
            rubric: (p.rubric ?? []).map((r) => ({
              criterion: r.criterion,
              weight: r.weight,
              description: r.description,
            })),
            testCases: (p.testCases ?? []).map((tc) => ({
              name: tc.name,
              description: tc.description,
              weight: tc.weight,
              expectedOutput: tc.expectedOutput,
              // `code` holds a path to the grader, not inline source.
              path: tc.code,
              source: readIfPresent(path.join(p.path!, tc.code)),
            })),
            starterFiles,
            environment: (p.environment ?? null) as Record<string, unknown> | null,
          };

          const id = `${unitSlug(ui)}/${projectSlug(pi)}`;
          const data = await parseData({ id, data: raw });
          const w = await compileWidgets(
            rewriteBriefLinks(stripTitle(briefMd)),
            `${p.path}/brief.md`,
          );
          const rendered = await renderMarkdown(w.markdown);
          store.set({
            id,
            data,
            rendered: { ...rendered, html: w.inject(rendered.html) },
            digest: generateDigest(data),
          });
        }
      }
    },
  };
}

export { COURSE_DIR };
