/**
 * The Witherspoon MCP server.
 *
 * It ships instructions, nothing else. A server reached over a URL has no filesystem
 * and no shell on the user's machine, so every tool here returns a document and the
 * connected agent does the work with its own tools. That is the whole design: the
 * skills stop being something to install and become something to fetch per stage.
 *
 * Tool *descriptions* are the only part of this an agent sees before deciding to call
 * anything, so they carry the trigger vocabulary the skill frontmatter carries — that
 * is what routes "help me make a course for my 3rd grade science class" to the right
 * door without the user naming a tool.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  REFERENCES,
  TEMPLATE_VERSION,
  VERSION,
  envelope,
  reference,
  skill,
} from './content.mjs';

const referenceNames = Object.keys(REFERENCES);

const referenceIndex = referenceNames
  .map((name) => `- \`${name}\` — ${REFERENCES[name].blurb}`)
  .join('\n');

/** Kept identical everywhere it appears; a stale probe is worse than none. */
const PROBE = 'node --version 2>/dev/null || bun --version 2>/dev/null || echo MISSING';

const text = (value) => ({ content: [{ type: 'text', text: value }] });

/**
 * User-supplied framing (subject, concern) is interpolated into a markdown
 * envelope. Collapse whitespace, drop fence/emphasis characters, and cap length
 * so a caller cannot break the surrounding instructions or smuggle a second
 * heading. The words still get through; the markup does not.
 */
function framingPlain(value) {
  return String(value)
    .replace(/[`*_#<>[\]\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

/**
 * Returned by witherspoon_review_course. Written for an agent whose user only knows
 * how to add an MCP server. The coding-agent skill (course-review) is more terse;
 * this is the same pipeline in ordinary words. The checklist itself is `learner-pass`.
 */
const REVIEW_FOR_NOVICES = `The user already has a course. They find it hard to follow, too long,
too dense, or they asked you to review or refine it.

**Do not build a new course.** Do not interview them for a subject. Do not start the nine-stage
authoring pipeline.

## How to talk to them

They connected a plugin and they have a folder of lessons. They do not know what a contract or a
gate is. Tell them what you found in ordinary sentences. Never ask them to run a named tool.

> I have not changed any files. Tell me what to apply — all of it, only the first item, or
> something else — and I will make those edits.

That is the only pause. Wait for a real yes.

## Find the course

Look for a file named \`course.json\`. That file is the course. Search the folder you are in and
one folder down.

- One match: use it. Tell them the course title you found, in one sentence.
- Several matches: show the titles in plain language and ask which one.
- No match: ask where their course folder is. Stop until they point at one.

## What to do

1. Fetch the review checklist — one document, named \`learner-pass\`.
2. Follow it. Two phases:
   - **Look first.** Read the home copy, every Unit 1 lesson in order, every project brief, and
     the start-and-end state of every topic. Sample one later lesson. Do not edit.
   - **Tell them.** What is already strong, what to change first, what to leave alone. Then
     **stop and wait** (the quoted line above). End the turn by printing the
     "Second pair of eyes" prompt from that checklist — a block they can paste into a
     new chat with a different assistant. Do not answer that prompt yourself.
   - **Fix only after they say to go.** You may cut, move, or rephrase. You may not invent new
     facts. You may not add or delete a lesson unless they asked to change the outline.
3. After edits, if they already have a website built from this course, offer to rebuild it so
   the pages match. Do not rebuild unless they ask.

If something in the checklist and something on the page disagree, believe the page in front of
the learner and say so.`;

/**
 * Only reached when the probe found nothing. If the machine already has npm, none of
 * this applies — npm is as well supported as bun, and installing a second runtime
 * over a working one is pure friction.
 */
const PLATFORM_LEAD = {
  macos: `## Install on macOS — give the user this

\`\`\`bash
curl -fsSL https://bun.sh/install | bash
\`\`\`

Then open a new terminal so \`bun\` is on \`PATH\`. If they would rather have Node and use Homebrew:
\`brew install node\`. Either is fine; bun is suggested only because it is one download.`,
  linux: `## Install on Linux — give the user this

\`\`\`bash
curl -fsSL https://bun.sh/install | bash
\`\`\`

Then open a new terminal, or \`source ~/.bashrc\`. Distribution Node packages are often several major
versions behind; if they prefer Node, check \`node --version\` reaches **20.19, 22.13 or 24** and
otherwise use the current installer from https://nodejs.org/en/download.`,
  windows: `## Install on Windows — give the user this

The most reliable path is WSL:

1. Open PowerShell as Administrator and run \`wsl --install\`.
2. Install **Ubuntu** from the Microsoft Store.
3. Open Ubuntu and run: \`curl -fsSL https://bun.sh/install | bash\`

Without WSL, directly in PowerShell: \`powershell -c "irm bun.sh/install.ps1 | iex"\` for Bun, or
\`winget install OpenJS.NodeJS.LTS\` for Node.

A reboot is sometimes needed after \`wsl --install\` — which is exactly why this is raised at the
approval gate rather than at the end.`,
  wsl: `## Install inside WSL — give the user this

\`\`\`bash
curl -fsSL https://bun.sh/install | bash
\`\`\`

Then open a new Ubuntu terminal. Run it inside the WSL shell, not in PowerShell.`,
};

export function createServer() {
  const server = new McpServer(
    { name: 'witherspoon', version: VERSION },
    {
      instructions:
        'Witherspoon builds complete, source-grounded courses and turns them into self-contained ' +
        'static websites. Call witherspoon_start_course when the user wants a course, curriculum, ' +
        'syllabus, training program, or lesson sequence built. Call witherspoon_review_course when ' +
        'they already have a course and it is hard to follow, too long, too dense, or they want it ' +
        'reviewed or refined — do not start a new course in that case. The server returns ' +
        'instructions; you carry them out with your own file, shell, and subagent tools, so you ' +
        'need a working filesystem and shell. Fetch one document per stage rather than all of them ' +
        'up front.',
    },
  );

  server.registerTool(
    'witherspoon_start_course',
    {
      title: 'Start a course',
      description:
        'START HERE to build a course with Witherspoon. Returns the full course-authoring pipeline: ' +
        'interview, running example, outline, one approval gate, source-grounded research, then ' +
        'generation of readings, flashcards, quizzes, unit tests and graded hands-on projects into a ' +
        'reviewable markdown tree plus course.json. Use whenever the user asks to build, create, ' +
        'generate, design, write, or plan a course, curriculum, syllabus, training program, lesson ' +
        'plan, teaching material, class, workshop, onboarding track, or study guide — any subject, ' +
        'any age group, technical or not. Call this before doing any course work yourself.',
      inputSchema: {
        subject: z
          .string()
          .optional()
          .describe('What the course is about, if the user has said. Free text; used only for framing.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ subject }) => {
      const subjectPlain = subject ? framingPlain(subject) : '';
      const framing = subjectPlain
        ? `The user wants a course on: **${subjectPlain}**. Hold that through the interview — do not ask ` +
          `again for anything they have already told you.\n\n`
        : '';
      return text(
        envelope({
          title: 'Witherspoon — course-builder',
          body: `${framing}${skill.builder()}

---

## Fetching the reference documents

Each stage above names a reference. Fetch it with \`witherspoon_reference\` at the moment the stage
calls for it — one per call, never all at once. Available \`doc\` values:

${referenceIndex}

## Runtime

Stage 0 includes a silent runtime probe:

\`\`\`bash
${PROBE}
\`\`\`

Only the *website* needs Node or Bun; the course material does not. If it prints MISSING, do not
raise it now — call \`witherspoon_prereqs\` and fold the install commands into the Stage 4 approval
message, so the user installs while the course generates.`,
          next: `Begin at Stage 0. Your first fetch is \`witherspoon_reference\` with
\`doc: "spine"\` when you reach Stage 2 — do not fetch it before the interview.

When the material is written and the user has approved it, call \`witherspoon_build_site\`.`,
        }),
      );
    },
  );

  server.registerTool(
    'witherspoon_review_course',
    {
      title: 'Review an existing course',
      description:
        'Review and refine a course the user already has, so a first-hour learner can finish it. ' +
        'Use when they say the course is hard to follow, hard to grok, too long, too dense, too ' +
        'much like a lecture, or they ask to review, refine, clean up, or improve existing ' +
        'lessons. Also use when they have a course.json folder and want a first-hour pass, not a ' +
        'rebuild. Do NOT use this to generate a new course — that is witherspoon_start_course. ' +
        'Returns a two-phase pipeline: look first, tell them, wait, then edit only after they say go.',
      inputSchema: {
        concern: z
          .string()
          .optional()
          .describe(
            'What they said is hard, if they said it. Free text; used only for framing. Do not invent a concern.',
          ),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ concern }) => {
      const concernPlain = concern ? framingPlain(concern) : '';
      const framing = concernPlain
        ? `The user said this is hard: **${concernPlain}**. Hold that. Do not ask them to restate it.\n\n`
        : '';
      return text(
        envelope({
          title: 'Witherspoon — review an existing course',
          body: `${framing}${REVIEW_FOR_NOVICES}`,
          next: `Find the course folder first (a file named \`course.json\`). Then fetch
\`witherspoon_reference\` with \`doc: "learner-pass"\` and follow it as an **invoked review**:
diagnose, tell the user, **stop and wait**. Apply only after they say to go.

Do not call \`witherspoon_start_course\`. Do not interview them for a new subject.

If they later want the website rebuilt so the pages match the edits, call \`witherspoon_build_site\`
— only when they ask.`,
        }),
      );
    },
  );

  server.registerTool(
    'witherspoon_reference',
    {
      title: 'Fetch a Witherspoon reference document',
      description:
        'Fetch one Witherspoon reference document by name, at the stage that calls for it. These are ' +
        'the per-stage contracts behind the pipeline: how to pick the running example, the topic ' +
        'generation contract, the outline critic, the learner-pass review rubric, the grounding ' +
        'expedition, activity and project specs, the quality gates, the course.json schema, the ' +
        'site build gates, the widget catalogue, the visuals pipeline, the localStorage contract, ' +
        'and the here.now / Vercel publishing references. Fetch one at a time, when you need it.',
      inputSchema: {
        doc: z.enum(referenceNames).describe('Which reference document to fetch.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ doc }) =>
      text(
        envelope({
          title: `Witherspoon reference — ${doc}`,
          body: reference(doc),
          next: `Return to the stage you were working on and apply this. Fetch the next reference only
when its stage calls for it.`,
        }),
      ),
  );

  server.registerTool(
    'witherspoon_build_site',
    {
      title: 'Build the course website',
      description:
        'Turn an approved Witherspoon course directory into a self-contained interactive static ' +
        'website — reading pages, flashcards, auto-graded quizzes, interactive widgets, progress ' +
        'tracking, client-side search and a printable certificate, output to dist/. No backend, no ' +
        'authentication, no external requests. Use after the course material has been generated and ' +
        'the user has reviewed it, or when the user asks to build, render, or preview the course ' +
        'site. Requires Node 20.19+ (or 22.13+, or 24+) or Bun 1.1+ on the user machine; npm and bun ' +
        'are equally supported.',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () =>
      text(
        envelope({
          title: 'Witherspoon — course-site',
          body: `${skill.site()}

---

## Before Stage 1 — confirm the runtime

\`\`\`bash
${PROBE}
\`\`\`

If this prints MISSING, stop and call \`witherspoon_prereqs\`. Report it as a **paused site build,
not a failed course**: the material is finished and on disk, and one command builds the site once a
runtime exists.

## The build command

Run from the directory that *contains* \`course-<slug>/\`, not from inside it:

\`\`\`bash
bun create witherspoon-course        # or: npm create witherspoon-course
\`\`\`

That installs \`witherspoon-course-template@${TEMPLATE_VERSION}\`, writes the build scripts, and runs
the first build. Afterwards \`bun run build\`, \`bun run verify\`, \`bun run test\`, \`bun run dev\`.

Never tell the user to run \`node_modules/.bin/witherspoon-course\` directly — on a machine with Bun
and no Node that shim cannot execute, and the shell exits 127. Package scripts and
\`bunx witherspoon-course-template <command>\` are the forms that work everywhere.

## Previewing, and when the dev server will not start

\`npm run dev\` (or \`bun run dev\`) is the preview: Astro with hot reload. **Verify it before handing
over a URL** — a 200 on \`/\` proves almost nothing, because the page can render unstyled and inert
while its assets 404:

\`\`\`text
GET /                                    -> 200
GET /unit-1/topic-1.html                 -> 200
GET the CSS URL that HTML actually emits -> 200
GET the JS URL that HTML actually emits  -> 200
\`\`\`

Read the listening port off the startup log rather than assuming the one you asked for, and confirm
the HTML carries no Astro error overlay.

**A sandboxed filesystem commonly cannot run the dev server at all.** It keeps esbuild resolving and
watching dependencies, and a sandbox that allows the first read still denies the traversal that
watching needs. The signature is an Astro \`UnhandledRejection\` naming *directories*:
\`Cannot read directory "../../../..": Access is denied\`. Those are permission results, not missing
packages — reinstalling will not help. The production build needs no watcher, so build and serve
\`dist/\` statically instead, and say that is what you did rather than reporting a broken template.

On Windows, invoke \`npm.cmd\` rather than \`npm\`, which may resolve to a \`npm.ps1\` blocked by the
machine's execution policy.`,
          next: `Fetch \`witherspoon_reference\` with \`doc: "widgets"\` then \`"visuals"\` when you reach
Stage 2, and \`"build-gates"\` at Stage 5.

When the gates pass, call \`witherspoon_publish\`.`,
        }),
      ),
  );

  server.registerTool(
    'witherspoon_publish',
    {
      title: 'Publish the course website',
      description:
        'Publish a built Witherspoon course site to a public URL by direct artifact upload — ' +
        'here.now by default (witherspoon-course publish to https://{slug}.here.now; anonymous 24h ' +
        'or permanent with an API key), with Vercel Drop/CLI as advanced alternatives, or Netlify, ' +
        'Cloudflare Pages, or any host the user names. Handles authentication, optional custom ' +
        'domains, and verifies the live site from the public internet before reporting. Never ' +
        'deploys through GitHub. Use when the user asks to publish, deploy, host, upload, or share ' +
        'the course website.',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () =>
      text(
        envelope({
          title: 'Witherspoon — course-publish',
          body: skill.publish(),
          next: `Fetch \`witherspoon_reference\` with \`doc: "here-now"\` at Stage 3 for the default host.
That reference covers \`witherspoon-course publish\`, anonymous 24h vs permanent Sites, and republish with --slug.
If the user chose Vercel instead, fetch \`doc: "vercel"\` — Drop and CLI remain advanced alternatives.

On a browser-drop route the upload happens in the user's browser, so Stage 3 ends by handing over the
folder path and project name and waiting for them to return a URL — never report that step as done.

Publication is not complete until the public browser check in Stage 5 passes.`,
        }),
      ),
  );

  server.registerTool(
    'witherspoon_prereqs',
    {
      title: 'Runtime install instructions',
      description:
        'Get exact copy-paste commands for installing a JavaScript runtime (Bun or Node) on the ' +
        "user's platform, plus guidance on when to raise it. Needed only to build the course " +
        'website — the course material itself needs no runtime. Call this when the runtime probe ' +
        'reports MISSING, or when a build fails because node or bun is not found.',
      inputSchema: {
        platform: z
          .enum(['macos', 'linux', 'windows', 'wsl', 'unknown'])
          .default('unknown')
          .describe("The user's operating system, if known."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ platform }) => {
      const lead = PLATFORM_LEAD[platform];
      return text(
        envelope({
          title: 'Witherspoon — runtime setup',
          body: `${lead ? `${lead}\n\n---\n\n` : ''}${reference('runtime-setup')}`,
          next: `Return to the stage you were on. **Do not block on the install.** If you are at the
course-builder approval gate, fold these commands into that message and carry on generating. If you
are at the site build, report a paused build and stop — the course material is already complete.`,
        }),
      );
    },
  );

  return server;
}
