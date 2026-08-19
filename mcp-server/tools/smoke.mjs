#!/usr/bin/env node
/**
 * End-to-end check against a running server, over real HTTP with a real MCP client.
 *
 * Hand-rolled JSON-RPC curl would pass while the server was still unusable — the
 * parts that actually break are protocol-level (accept headers, initialize handshake,
 * stateless transport refusing a follow-up), and only a client that performs the
 * handshake exercises them.
 *
 *   node index.mjs &            # or npm start
 *   node tools/smoke.mjs [url]
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const url = new URL(process.argv[2] ?? 'http://127.0.0.1:8787/mcp');

let failures = 0;
const ok = (label, detail = '') => console.log(`  ok   ${label}${detail ? ` — ${detail}` : ''}`);
const bad = (label, detail) => {
  failures += 1;
  console.log(`  FAIL ${label} — ${detail}`);
};
const check = (cond, label, detail) => (cond ? ok(label, detail) : bad(label, detail));

const client = new Client({ name: 'witherspoon-smoke', version: '1.0.0' });
const transport = new StreamableHTTPClientTransport(url);
await client.connect(transport);
console.log(`\nConnected to ${url}`);

const info = client.getServerVersion();
check(info?.name === 'witherspoon', 'initialize', `${info?.name} ${info?.version}`);
check(
  (client.getInstructions() ?? '').includes('witherspoon_start_course'),
  'server instructions point at the entry tool',
);
check(
  (client.getInstructions() ?? '').includes('witherspoon_review_course'),
  'server instructions point at the review tool',
);

const { tools } = await client.listTools();
const names = tools.map((t) => t.name).sort();
const expected = [
  'witherspoon_build_site',
  'witherspoon_prereqs',
  'witherspoon_publish',
  'witherspoon_reference',
  'witherspoon_review_course',
  'witherspoon_start_course',
].sort();
check(
  JSON.stringify(names) === JSON.stringify(expected),
  'tools/list',
  `${names.length} tools: ${names.join(', ')}`,
);

// The description is the only thing an agent sees before deciding to call, so the
// routing vocabulary in it is a functional requirement, not documentation.
const start = tools.find((t) => t.name === 'witherspoon_start_course');
for (const word of ['course', 'curriculum', 'syllabus', 'lesson', 'training']) {
  check(start?.description?.toLowerCase().includes(word), `entry description mentions "${word}"`);
}

const review = tools.find((t) => t.name === 'witherspoon_review_course');
for (const word of ['review', 'refine', 'dense', 'follow', 'existing']) {
  check(review?.description?.toLowerCase().includes(word), `review description mentions "${word}"`);
}

async function callText(name, args = {}) {
  const res = await client.callTool({ name, arguments: args });
  return res.content.map((c) => c.text ?? '').join('');
}

const started = await callText('witherspoon_start_course', { subject: '3rd grade science' });
check(started.includes('3rd grade science'), 'start_course threads the subject through');
check(started.includes('Stage 0'), 'start_course returns the pipeline');
check(started.includes('operating instructions'), 'start_course carries the imperative framing');
check(started.includes('## Next call'), 'start_course ends with a next-call pointer');
check(!started.startsWith('---\nname:'), 'frontmatter stripped');

const site = await callText('witherspoon_build_site');
check(site.includes('bun create witherspoon-course'), 'build_site gives the scaffold command');
check(site.includes('exits 127'), 'build_site warns about the bare bin on Bun-only machines');

// Every `> ` block in a skill is a line addressed to the user. Naming a skill or a
// tool in one hands them an instruction they cannot act on — over MCP there is no
// `course-site` to run — so those lines must describe the action, not the mechanism.
// Scoped to the quoted blocks deliberately: the surrounding prose *explains* the rule
// and quotes the bad phrasing as an example, which a whole-document grep trips over.
const quoted = started
  .split('\n')
  .filter((line) => line.trimStart().startsWith('> '))
  .join('\n');
const leaked = quoted.match(/course-site|course-publish|course-builder|witherspoon_\w+/)?.[0];
check(
  quoted.length > 0 && !leaked,
  'no user-facing handoff names a skill or a tool',
  leaked ?? `${quoted.split('\n').length} quoted lines clean`,
);
check(
  started.includes('Address the user, not the machinery'),
  'start_course carries the channel-neutral handoff rule',
);

const publish = await callText('witherspoon_publish');
check(publish.includes('No GitHub'), 'publish keeps the no-GitHub rule');
check(publish.includes('here.now'), 'publish defaults to here.now');
check(publish.includes('witherspoon-course publish'), 'publish names the template command');
check(!publish.includes('publish.sh'), 'publish no longer shells out to publish.sh');
check(publish.includes('Vercel'), 'publish still documents Vercel as an alternative');
check(!/tigris/i.test(publish), 'publish no longer references Tigris');
check(!/tigris/i.test(site), 'build_site no longer references Tigris');

const herenow = await callText('witherspoon_reference', { doc: 'here-now' });
check(herenow.includes('witherspoon-course-template publish'), 'here-now reference names the template command');
check(!herenow.includes('/absolute/path/to/publish.sh'), 'here-now reference has no harness-absolute helper path');

const prereqs = await callText('witherspoon_prereqs', { platform: 'windows' });
check(prereqs.includes('Microsoft Store'), 'prereqs leads with the platform block');
check(prereqs.includes('bun.sh/install'), 'prereqs includes the install command');

const reviewed = await callText('witherspoon_review_course', { concern: 'too dense' });
check(reviewed.includes('too dense'), 'review_course threads the concern through');
const injected = await callText('witherspoon_review_course', {
  concern: 'too dense\n```\n# smuggled\n`code`',
});
check(injected.includes('too dense'), 'review_course keeps the concern words after sanitise');
check(!injected.includes('```'), 'review_course strips fences from concern');
check(!injected.includes('# smuggled'), 'review_course strips a smuggled heading from concern');
check(reviewed.includes('Do not build a new course'), 'review_course refuses a rebuild');
check(reviewed.includes('operating instructions'), 'review_course carries the imperative framing');
check(reviewed.includes('## Next call'), 'review_course ends with a next-call pointer');
check(reviewed.includes('learner-pass'), 'review_course points at the rubric');
const reviewQuoted = reviewed
  .split('\n')
  .filter((line) => line.trimStart().startsWith('> '))
  .join('\n');
const reviewLeaked = reviewQuoted.match(/course-site|course-publish|course-builder|course-review|witherspoon_\w+/)?.[0];
check(
  reviewQuoted.length > 0 && !reviewLeaked,
  'review user-facing handoff names no skill or tool',
  reviewLeaked ?? `${reviewQuoted.split('\n').length} quoted lines clean`,
);

const spine = await callText('witherspoon_reference', { doc: 'spine' });
check(spine.includes('running example'), 'reference: spine');
const pass = await callText('witherspoon_reference', { doc: 'learner-pass' });
check(pass.includes('first-hour learner'), 'reference: learner-pass');
const critic = await callText('witherspoon_reference', { doc: 'outline-critic' });
check(critic.includes('Leaves'), 'reference: outline-critic');

const listed = start ? tools.find((t) => t.name === 'witherspoon_reference') : null;
const enumValues = listed?.inputSchema?.properties?.doc?.enum ?? [];
check(enumValues.length >= 14, 'reference enum is populated', `${enumValues.length} docs`);

// Every advertised reference must actually resolve; a typo'd path in the index would
// otherwise only surface when some future course reached that stage.
let broken = 0;
for (const doc of enumValues) {
  const body = await callText('witherspoon_reference', { doc });
  if (body.length < 400) broken += 1;
}
check(broken === 0, 'every reference in the enum returns content', `${enumValues.length} checked`);

await client.close();

console.log(
  failures ? `\n${failures} check(s) FAILED.\n` : `\nAll checks passed.\n`,
);
process.exit(failures ? 1 : 0);
