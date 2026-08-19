---
name: course-publish
description: Publish a built course site's dist/ to a public URL using the user's preferred static host. Defaults to here.now — witherspoon-course publish (create → upload → finalize) to a {slug}.here.now URL, with optional anonymous 24h Sites or permanent Sites via saved login. Vercel Drop and the Vercel CLI remain available as advanced alternatives. Handles authentication, optional custom domains, and end-to-end verification. Use when the user asks to publish, deploy, host, upload, or share a course website. Never uses GitHub.
---

# Course Publish

Publish a built course and return a link that has been opened and verified. The user chooses the
provider; **here.now is the default** because an agent can publish `dist/` straight to a live
`https://{slug}.here.now` URL by API — create → upload → finalize — with no repository, no CI, and
no browser drag-and-drop. It serves `index.html` at the root, so the shared link is a bare hostname.
Anonymous publishes need no account and expire in 24 hours; a saved account login makes Sites permanent.

- **here.now (Recommended)** — run `witherspoon-course publish` from the published template. Works
  from the agent's shell; first publish can be anonymous for a quick preview, or authenticated for a
  permanent learner link. **Recommend this first** for first-time and typical users.
- **Vercel Drop / Vercel CLI (advanced alternatives)** — keep these when the user asks for Vercel, or
  when the harness cannot run shell commands at all and a browser drop is the only workable route.
  Details live in [references/vercel.md](references/vercel.md).

Every route lands the same kind of static artifact on a bare hostname, and every route is verified
here before anything is reported.

This skill publishes build artifacts. It does not create repositories, pull requests, or CI
pipelines, and it never publishes through a Git remote. Committing the course source locally is a
separate matter — see [Stage 7](#stage-7--iterate-after-publishing) — and is never a deployment path.

## Non-negotiables

- **No GitHub.** Never use GitHub Pages, Actions, Releases, repository deployment, or a Git remote.
- Upload only the **contents** of `<course-dir>/dist/`, never the course source and never `dist/` as
  an extra path segment.
- Never request an access key or long-lived secret in chat. Use the provider's browser login, OAuth
  connector, OS credential prompt, documented local credential command, or here.now's email one-time
  code flow (save the returned key to the documented local credentials file yourself; never ask the
  user to paste the key).
- Never report success from an upload command alone. Open the public site and exercise it.
- Never report a browser upload as something you performed, and never state its URL before the user
  has come back with one. That upload runs in their session; until they report it, nothing happened.
- Never overwrite an existing destination unless `.course-publish.json` identifies it as belonging
  to this course or the user explicitly identifies it as the destination.
- Never delete unknown remote objects. A stale-file cleanup is allowed only for a destination that
  the manifest marks as dedicated to this course — and on here.now and Vercel there are no stale
  files to clean, because each production deployment/version is a complete immutable snapshot rather
  than a mutable directory.
- Never tell the user to delete or rename a Vercel project unless the manifest records it as this
  course's, or they identify it as theirs and confirm it. Freeing a project name is the one
  destructive step the Vercel drop route needs; it is theirs to authorise, and a rename with the old
  name kept until the new upload verifies is the safer of the two.
- Do not hide provider limitations or costs. For here.now, say before publishing that anonymous Sites
  expire in 24 hours and authenticated Sites are permanent (see https://here.now/pricing.md). For
  Vercel, the free Hobby plan is for non-commercial use; say so before the user authenticates.
- Never commit here.now local state (`.herenow/`), claim tokens, or credentials files.

## Pipeline

### Stage 0 — Discover silently

1. Resolve the course directory from the user's request, the current directory, and directories
   containing `course.json`.
2. Find `<course-dir>/dist/index.html`. If there is one unambiguous built course, use it. If several
   are plausible, include the course choice in Stage 1.
3. Read `<course-dir>/.course-publish.json` when present. It is the deployment identity for a repeat
   publish; it is not authority to operate on any other destination.
4. If `course.json` exists but `dist/index.html` does not, run the site-build stage — a skill named
   `course-site`, or the `witherspoon_build_site` tool — to build and verify the approved course,
   then resume here. If neither that stage nor a JavaScript runtime is available,
   state that exact prerequisite — `course-builder/references/runtime-setup.md` has the install
   commands — and ask the user to install it or provide the built `dist/`; never upload course source
   as a substitute. If there is neither a build nor buildable course source, stop with the exact
   missing path.
5. Inspect available provider tools without triggering authentication. The here.now route is the
   template command `witherspoon-course publish` — it needs the same JavaScript runtime as the site
   build, not `curl`/`jq`/`file` and not the here.now skill. Note whether a provider's official CLI
   is installed for a non-default host, and whether any connected MCP server can perform a *complete*
   deployment — recursive upload preserving bytes, relative keys and MIME types, plus a returned
   public URL. Merely having a connector for a provider is not enough.
6. Note what this harness can and cannot do on the user's machine. If you cannot run commands there,
   here.now's API route is unavailable from this harness — present Vercel Drop (or another browser
   upload) as the workable route rather than offering a shell publish the user would have to drive
   themselves.

Do not ask the user for facts the workspace or provider manifest already establishes.

### Stage 1 — One short interview

Use one batched multiple-choice turn — `AskUserQuestion`, or your harness's equivalent; if it has
none, ask as one numbered list in a single message. Omit questions already answered. Every question
has a recommended choice so accepting defaults is one interaction.

**Publish method**

| Option | Meaning |
| --- | --- |
| **here.now — agent publish (Recommended)** | I publish `dist/` to `https://{slug}.here.now` with `witherspoon-course publish`. Nothing goes through GitHub. Anonymous Sites expire in 24 hours; a saved account login makes them permanent. Best for first-time and typical users. |
| Vercel Drop — drag the folder into your browser (advanced) | You open `vercel.com/drop`, drag `dist/` on, name the project, and it is live. Nothing installed. Use when you want Vercel, or when this harness cannot run shell commands. |
| Vercel CLI — one command, repeatable (advanced) | `vercel deploy <dist> --prod` from this machine, into the same project every time, so the URL never changes. Needs the Vercel CLI and a terminal login. |
| Netlify direct deploy | Upload `dist/` with Netlify's CLI/API/drop flow; no Git integration. |
| Cloudflare Pages direct upload | Upload `dist/` with Wrangler/direct upload; no Git integration. |

here.now and either Vercel route give a bare hostname, because each serves `index.html` at the root.
For here.now, say in the same breath that anonymous Sites expire in 24 hours and authenticated Sites
are permanent (link https://here.now/pricing.md). For Vercel, say the free Hobby plan is
non-commercial before the user signs in.

**Recommend here.now** unless the user asks for Vercel/Netlify/Cloudflare/Other, or this harness
cannot run shell commands — in that case present Vercel Drop as the method rather than as a choice.
If the user wants a permanent here.now link, use the email one-time-code flow in
[references/here-now.md](references/here-now.md) before or right after the first publish.

To use any other static host, the user enters its exact provider plus destination/upload mechanism
under **Other** on this same question (for example, “SFTP to `learn.example.com:/var/www/course`”).
That response is the Stage 3 target; never ask a vague follow-up such as “which host?”

**Public URL**

Ask: “Use the provider URL now, configure a custom hostname later, or enter the exact custom
hostname under Other?” Recommend the provider URL now. Do not make DNS a prerequisite for the
first successful publication.

**Course**

Ask only when Stage 0 found multiple plausible builds. Show their course titles and paths; recommend
the build nearest the current directory.

Provider selection authorizes installation of that provider's official CLI when the chosen method
needs one and no suitable installed or connected tool exists. State the exact install command before
running it. A browser upload needs no install at all, so do not offer one as preparation for it.
Authentication or destructive-operation confirmations are safety gates, not a second general
interview.

### Stage 2 — Preflight the artifact

Before authenticating or creating remote resources:

1. Resolve `dist/` to an absolute path and confirm `index.html` is a regular file.
2. Reject symlinks that escape `dist/` and files that look like credentials (`.env*`, private keys,
   access-key dumps). Name every rejected path. Do not “publish around” it silently.
3. If a JavaScript runtime is available, run the template's current build gates against this exact
   `dist/`. From a scaffolded course workspace:

   ```bash
   bun run verify        # or: npm run verify
   bun run test          # or: npm run test
   ```

   Without a workspace, the same two are
   `bunx witherspoon-course-template verify /absolute/path/to/course/dist` and `… test <dist>`.

   Fix a real build issue through `course-site`; do not mutate generated files in `dist/` by hand.
   If no runtime is available but `dist/index.html` already exists, continue with the static
   artifact checks and mandatory public browser smoke test; state that the template gates were not
   rerun. Do not force a runtime installation merely to upload an existing verified artifact.
4. Record the relative file keys and total byte size. These become the upload and verification
   inventory.

### Stage 3 — Publish

For here.now (the default), read and follow [references/here-now.md](references/here-now.md). That
reference is the command and provider-behaviour contract; do not invent URLs, skip finalize, or hide
the anonymous 24-hour expiry.

For Vercel, read and follow [references/vercel.md](references/vercel.md). That reference is the
command and provider-behaviour contract for both Vercel routes; do not improvise around its
project-naming, `--prod`, MIME, or custom-domain constraints.

**When the method is a browser upload, the publish stage is a hand-off, not a command.** You prepare
and the user acts, so:

1. Build and pass the gates first. What the user drags must be the artifact you verified, not
   whatever `dist/` happened to contain from an earlier run.
2. Give the **absolute** path of the folder and the **exact** project name to type. Neither "your
   dist folder" nor "name it after the course" survives contact with a file dialog.
3. Give the numbered walkthrough from the reference, then stop and wait. Do not report a publish, do
   not predict the URL, and do not fill the silence with the next stage.
4. When the user returns a URL, treat it as a claim about where the site is and verify it in full at
   Stage 5. If they report a symptom instead of a URL, match it against the failure list in the
   reference — most of them mean the wrong folder was dropped, which is a re-drop rather than a
   settings change.
5. If the user asks you to do the upload for them, say plainly that this route runs in their browser
   session, and offer the CLI route as the version you can run end to end.

For another provider:

1. Before changing remote state, inspect the selected MCP tool schemas or the provider's current
   official CLI help. Require: production/direct artifact deployment, byte-preserving recursive
   upload, correct MIME metadata, destination identity, and a returned public URL. Do not assume a
   connector supports these because it can upload one file.
2. Use an already-connected MCP integration when it satisfies those requirements; otherwise use the
   provider's official CLI/API/direct-upload UI. Complete browser/OAuth login only when requested.
   Let the user handle passwords, MFA, consent, payment verification, and DNS registrar login;
   resume automatically afterward.
3. For Netlify, ignore ambient local linkage unless its site ID matches the manifest. List the
   account's sites first. For a new site, choose a candidate name absent from that list and use the
   current direct-create flag:
   `netlify deploy --site-name <new-name> --dir <dist> --prod --no-build --json`. For a repeat, pass
   the manifest-owned ID explicitly with `--site <site-id>`. Persist the returned site ID; never let
   `.netlify/state.json` silently choose a production destination. If the installed CLI no longer
   supports `--site-name`, create the site through its official site-creation command/API/UI, capture
   the returned site ID, then deploy with explicit `--site <site-id>`. Do not run `netlify init`.
4. For Cloudflare Pages, run `wrangler whoami` and `wrangler pages project list` before deployment.
   Store the selected non-secret account ID in the manifest. On a repeat, require both that account
   ID and the project name to match before upload; otherwise switch to the recorded account or ask
   one targeted ownership question. If a candidate project exists without manifest ownership,
   append a suffix rather than reusing it. Create a Direct Upload project when needed, then deploy
   with `wrangler pages deploy <dist> --project-name <manifest-owned-or-new-name>`. Do not connect
   Git.
5. For either standard host, check current command help before execution because CLI flags can
   change. If no CLI runtime is available, use the provider's authenticated folder-upload UI and
   perform the same explicit destination-ownership check before upload.
6. For a host supplied through **Other**, use the exact provider and destination/mechanism in that
   answer. Inspect it before upload and require explicit manifest or user ownership of an existing
   destination. If the answer names only a provider, ask one targeted safety question for the exact
   destination; do not guess where to write.
7. Create or reuse a destination derived from the course slug. On a global-name collision, append a
   short stable suffix rather than taking over an existing destination.
8. Upload the **contents** of `dist/` directly in production mode, not a preview or Git-backed mode.
9. When republishing a manifest-owned destination, overwrite matching keys. Remove stale keys only
   after comparing a complete remote inventory with the local inventory and only inside that
   dedicated destination. If complete inventory is unavailable, leave unknown keys rather than
   risking deletion.
10. If a requested host only supports Git-based deployment, do not use it. Offer its direct-upload
    mode or return to Stage 1's other choices.

For an existing/custom host, follow the user's stated mechanism and preserve the same invariants:
public artifact URL, correct MIME types, clean scope, no source upload, no GitHub, and end-to-end
verification.

### Stage 4 — Custom hostname, when requested

First publish and verify the provider URL. Then configure the custom hostname; DNS propagation must
not obscure whether the upload itself worked.

- Prefer a subdomain such as `learn.example.com`; it works with a plain CNAME at most DNS providers.
- Show the exact DNS record before changing it. Do not ask the user to move nameservers.
- Use DNS-only mode when the storage provider terminates TLS and requires direct validation.
- Keep the provider URL as a fallback until the custom hostname passes HTTPS verification.
- If the user chose “later,” return the exact future DNS target and provider settings path without
  treating the optional domain as unfinished publication.

here.now custom-domain steps are in [references/here-now.md](references/here-now.md) and the live
docs. Vercel-specific custom-domain steps are in [references/vercel.md](references/vercel.md).

### Stage 5 — Verify from the public internet

Verification is part of publishing:

1. Fetch the exact public entry URL. Require a successful HTTP response and `text/html` content type.
2. Parse the returned HTML and fetch at least one referenced stylesheet/script/image when present.
   Require successful responses and browser-appropriate MIME types.
3. Use the available browser automation by invoking the `agent-browser` skill, then open the entry
   URL in a real browser. Confirm the course title renders, styles load, a link to a course page
   works, and there are no failed same-origin asset requests. Exercise one interactive control when
   the site has one (for example a flashcard or quiz control). If the runtime genuinely has no
   browser-control capability, ask the user to perform those exact checks and report this as
   **user-confirmed**, not agent-verified; HTTP-only checks are not equivalent.
4. Confirm the visible footer contains the copyright holder/year when supplied and the selected
   license. For a Creative Commons choice, require the canonical URL in both the footer and a
   `<link rel="license">` in `<head>`. This proves the rights metadata reached the deployed build,
   not only local `dist/`.
5. For a custom hostname, repeat the checks over HTTPS after certificate issuance. A DNS record alone
   is not proof.
6. Compare the provider's remote object/deployment inventory with the local file count when the API
   exposes a reliable inventory. At minimum, verify `index.html` and every asset used in the browser
   smoke test.

Fix upload paths, access, or MIME metadata and rerun the failed checks. Do not weaken a check to make
publication pass.

### Stage 6 — Record and report

After verification, create or update `<course-dir>/.course-publish.json`:

```json
{
  "version": 1,
  "provider": "here.now",
  "method": "api",
  "accountScope": null,
  "destination": "course-slug",
  "entryUrl": "https://course-slug.here.now",
  "customHostname": null
}
```

Use the actual provider and destination. `provider` is `"here.now"` for the default host, or
`"vercel"` / another host when chosen. `method` records how the files got there — `"api"` for
here.now's template publish command, `"drop"` for a browser upload, `"cli"` for a provider CLI — because
the repeat-publish loop differs between them and the next session should not have to ask. Set
`accountScope` to the provider's non-secret team, account, or organization identifier when
destination names are account-scoped; leave it `null` when the destination ID is globally
unambiguous. Store no token, access key, secret, claim token, or DNS credential. This file makes
repeat publication safe and stable.

**After a browser upload, the workspace step is the build, not a deploy script.** There is no command
to persist: the upload happened in a browser, and writing a `deploy` script for a CLI that has never
run here would be a command you have not proven. Confirm `bun run build` (or `npm run build`) works
from the workspace so the next update is one command plus one drag, note the project name in the
manifest, and stop there. Add a `deploy` script only if the user later chooses an agent/CLI route and it
succeeds.

**After a here.now API publish, write `scripts.deploy`** to the proven
`witherspoon-course publish --course … --slug …` command (see
[references/here-now.md](references/here-now.md)) and run it once before reporting.

For a CLI publish, the final workspace step is to make the build and verified deployment repeatable
from the course directory:

1. **Locate the package.json that already carries the build scripts.** `create-witherspoon-course`
   writes one into the *workspace* — the directory containing `course-<slug>/` — with `build`, `dev`,
   `verify`, `test`, `check-widgets` and `render-views` scripts and a `witherspoon-course-template`
   dependency. In a checkout of the Witherspoon repo the equivalent wrappers live in the course's own
   `package.json` instead. Walk up from `dist/` and use whichever you find; do not create a second
   one alongside it.

2. If there is none — the site was built some other way — create a minimal private package next to
   the course and wire it to the published template:

   ```json
   {
     "name": "course-slug-site",
     "private": true,
     "scripts": {
       "build": "witherspoon-course build --course ./course-slug",
       "verify": "witherspoon-course verify --course ./course-slug",
       "test": "witherspoon-course test --course ./course-slug"
     },
     "dependencies": { "witherspoon-course-template": "^1.0.0" }
   }
   ```

   Preserve any existing name, dependencies, unrelated scripts, and formatting. Never invoke
   `node_modules/.bin/witherspoon-course` directly in a script or in instructions to the user: on a
   machine with Bun and no Node that shim cannot execute at all. Package scripts and `bunx`/`npx` are
   the only forms that work everywhere.

3. Set `scripts.deploy` to the exact non-interactive form of the method that just succeeded, with the
   manifest-owned destination explicit. For hosts that take a folder, write the `dist/` path relative
   to the package.json you are editing — from a scaffolded workspace that is `./course-slug/dist/`,
   not `./dist/`. For here.now, pass `--course ./course-slug` (the command appends `/dist`). Getting
   either path wrong uploads nothing or uploads the wrong tree. Examples, shown from a workspace:

   ```json
   {
     "scripts": {
       "deploy": "witherspoon-course publish --course ./course-slug --slug course-slug"
     }
   }
   ```

   - here.now: `witherspoon-course publish --course <course-dir> --slug <slug>`
   - Vercel: `vercel deploy <dist> --prod --yes --project <project-name>`
   - Netlify: `netlify deploy --site <site-id> --dir <dist> --prod --no-build`
   - Cloudflare Pages: `wrangler pages deploy <dist> --project-name <project-name>`
   - Other hosts: the exact proven CLI command with an explicit destination.

4. Never put tokens, access keys, secrets, temporary URLs, interactive login commands, or destructive
   stale-file cleanup in `scripts.deploy`. The provider CLI must use its normal authenticated local
   session. Do not add a command that has not run successfully. If the upload happened through MCP or
   a web UI, either prove the CLI equivalent end to end first or write no `deploy` script at all —
   after a browser upload the second is usually right, because switching the user to a CLI they did
   not choose, purely so a script exists, is a worse loop than build-then-drag.
5. Run `bun run deploy` (or `npm run deploy`) once from the directory holding that package.json, then
   repeat Stage 5 against the public URL. The package edit is not complete until this exact command
   successfully republishes the site.
6. Make this package update the last workspace mutation. After it passes, report without changing
   course files again.

Preserve an existing wrapper when it already delegates to the current shared template with the
correct course path. Preserve an existing `deploy` script only when it targets the same
manifest-owned destination through the method that just passed. Otherwise replace it; the current
template contract and verified publication are the sources of truth.

Report only after the public browser check passes:

```text
Published: <absolute dist path> → <provider>/<destination> (<browser upload | CLI>)
Site: <verified clickable entry URL>
Custom domain: <verified URL | not requested | exact remaining optional step>
Upload: <file count> files · <bytes>
Rights: <verified copyright/license notice>
Checks: entry HTML · assets/MIME · internal navigation · interaction
Republish: <cd <workspace> && bun run deploy | say the word and I'll rebuild, then you re-drop
           <dist> as <project-name> — I'll walk you through freeing the name so the link stays>
```

For here.now and Vercel, print the bare production URL as the primary link — no `/index.html` suffix,
since both serve the index at the root. Never invent a `{slug}.here.now` URL; use the `siteUrl` from
the current publish. On Vercel, a preview URL carrying a generated hash is not the link to report: if
what came back looks like one, `--prod` was missing and the deploy must be repeated. For anonymous
here.now publishes, state the 24-hour expiry and share any claim URL.

### Stage 7 — Iterate after publishing

Publishing is rarely the last thing that happens. The user reads the live site, wants a wording
change, and the loop from here has to be cheap — especially on a browser-drop route, where every
re-upload costs the user a trip; here.now and CLI routes should stay one-command republishes.

Run edits against the dev server, not against repeated production uploads:

```bash
bun run dev           # or: npm run dev — hot reload, edits appear on save
```

Change course source only — `course.json`, `read.md`, `brief.md`, or the template. Never edit
`dist/`; the next build deletes it. Small copy fixes are visible on save, so batch them and let the
user look before anything is rebuilt.

**Treat the user's affirmation as the signal to commit and rebuild.** When they say the change looks
good — "looks good", "perfect", "ship it", "yes, that's right", any plain approval of what they just
saw — do these in order, without asking again:

1. **Commit the course source**, when the workspace is a git repository. Stage the course files you
   actually changed, write a message naming the change, and stop there. Never `git push`, never
   `git init` a workspace that is not already a repository, and never commit `dist/`,
   `node_modules/`, `.vercel/`, or `.herenow/` — if `dist/` is untracked and unignored, leave it untracked and say
   so once. Outside a repository, skip this step silently; it is a convenience, not a gate.
2. **Rebuild and re-run the gates** — `bun run build`, then `bun run verify` and `bun run test`. The
   dev server proves nothing about the artifact that gets uploaded.
3. **Hand back the absolute `dist/` path** with the re-upload instruction for the recorded method:
   `bun run deploy` for here.now/API or a CLI publish; the drop walkthrough plus the name-reclaiming
   step from [references/vercel.md](references/vercel.md) for a Vercel browser upload; see
   [references/here-now.md](references/here-now.md) for `--slug` updates on here.now.

An approval of a change is not an instruction to publish it. Build, commit, and offer — then wait.
The user decides when learners see the new version, and on the drop route they are the only one who
can perform the upload anyway.

After any re-upload, verify again at Stage 5, and confirm the live page carries the change that was
just approved. A stale `dist/` republishes cleanly and passes every check as the previous version.
