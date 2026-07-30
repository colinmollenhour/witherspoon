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

const PLATFORM_LEAD = {
  macos: `## Install on macOS — give the user this

\`\`\`bash
curl -fsSL https://bun.sh/install | bash
\`\`\`

Then open a new terminal so \`bun\` is on \`PATH\`. If they would rather use Node and have Homebrew:
\`brew install node\`.`,
  linux: `## Install on Linux — give the user this

\`\`\`bash
curl -fsSL https://bun.sh/install | bash
\`\`\`

Then open a new terminal, or \`source ~/.bashrc\`. Distribution Node packages are often several major
versions behind; if they prefer Node, check \`node --version\` reaches 20 and otherwise use the current
installer from https://nodejs.org/en/download.`,
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
        'syllabus, training program, or lesson sequence built. The server returns instructions; you ' +
        'carry them out with your own file, shell, and subagent tools, so you need a working ' +
        'filesystem and shell. Fetch one document per stage rather than all of them up front.',
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
      const framing = subject
        ? `The user wants a course on: **${subject}**. Hold that through the interview — do not ask ` +
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
    'witherspoon_reference',
    {
      title: 'Fetch a Witherspoon reference document',
      description:
        'Fetch one Witherspoon reference document by name, at the stage that calls for it. These are ' +
        'the per-stage contracts behind the pipeline: how to pick the running example, the topic ' +
        'generation contract, the grounding expedition, activity and project specs, the quality ' +
        'gates, the course.json schema, the site build gates, the widget catalogue, the visuals ' +
        'pipeline, the localStorage contract, and the Vercel publishing reference. Fetch one at a ' +
        'time, when you need it.',
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
        'site. Requires Node 20+ or Bun 1.1+ on the user machine.',
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
\`bunx witherspoon-course-template <command>\` are the forms that work everywhere.`,
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
        'Publish a built Witherspoon course site to a public URL by direct artifact upload — Vercel ' +
        'by default, or Netlify, Cloudflare Pages, or any host the user names. Handles ' +
        'authentication, optional custom domains, and verifies the live site from the public ' +
        'internet before reporting. Never deploys through GitHub. Use when the user asks to publish, ' +
        'deploy, host, upload, or share the course website.',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () =>
      text(
        envelope({
          title: 'Witherspoon — course-publish',
          body: skill.publish(),
          next: `Fetch \`witherspoon_reference\` with \`doc: "vercel"\` at Stage 3 if the user chose Vercel,
which is the default.

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
