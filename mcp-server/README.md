# Witherspoon MCP server

Serves the three Witherspoon skills to any agent that can connect to an MCP URL. The user installs
nothing: they add the server, say *"build me a course on photosynthesis for my 3rd grade class"*, and
their agent fetches the pipeline one stage at a time.

```bash
npm install
npm run sync        # copy .claude/skills → content/
npm start           # http://localhost:8787/mcp
npm run smoke       # protocol-level end-to-end check against a running server
```

## What it does and does not do

It ships **instructions**. A server behind a URL has no filesystem and no shell on the user's
machine, so every tool returns a document and the connected agent does the work with its own tools.
That means a client without file and shell access can run the interview and nothing else — say so
plainly rather than half-building a course.

The site builder is not served from here. It is a separate npm package,
`witherspoon-course-template`, installed on the user's machine at the site stage by
`bun create witherspoon-course`. This server only tells the agent to run that.

## Tools

| Tool | Returns |
| --- | --- |
| `witherspoon_start_course` | the entry point — course-builder's nine stages, plus the reference index |
| `witherspoon_reference` | one of 14 reference documents, by name |
| `witherspoon_build_site` | course-site, plus the runtime gate and the scaffold command |
| `witherspoon_publish` | course-publish |
| `witherspoon_prereqs` | Node/Bun install commands for a given platform |

**One document per call.** The skills total ~150 KB; returned together they would spend most of a
context window before any work began, and would defeat the per-stage split the `references/`
directories exist to provide. Tool descriptions cost ~1.1k tokens and are always in context; a stage
costs 2.7–4.4k when fetched.

Two things in the response format are load-bearing:

- **Imperative framing.** A skill loaded by a harness arrives as instructions; the same text arriving
  as a tool result is, to the model, just data. The common failure is an agent that reads the
  pipeline and narrates it back to the user instead of executing it.
- **An explicit next-call pointer.** Without one, an agent that finishes a stage has no way to know
  another call exists, and the pipeline stops halfway with the user none the wiser.

## `content/` is generated

`tools/sync-content.mjs` copies the skills in so the server is deployable with no checkout around it.
`npm run check` fails if it has drifted — run it in CI, because editing a `SKILL.md` and forgetting
to sync ships a server that quietly serves last month's pipeline.

## Deploying

Live at **https://mcp-production-f93d.up.railway.app/mcp** (Railway project `witherspoon`, service
`mcp`). Redeploy from this directory:

```bash
railway up --service mcp --ci
```

`railway.json` points the healthcheck at `/health`, so a broken build fails the deploy instead of
taking the URL down. `.railwayignore` keeps `node_modules/` out of the upload.

Stateless: a fresh server and transport per request, no session store, no affinity. Replicate it,
restart it, or run it as a function. `PORT`, `HOST` and `MCP_PATH` are the only configuration.

There is no authentication, by design — every tool is a pure read of bundled markdown. There is also
no rate limiting; put it behind whatever your host provides.

Be straight with users about what connecting means: the documents this server returns instruct their
agent to write files and run shell commands, including `npm`/`bun` installs, on their machine.
