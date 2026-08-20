# here.now publishing contract

Use here.now as the default direct static host. Current official references:

- Docs: <https://here.now/docs>
- Hosted skill: <https://here.now/skill.md>
- Pricing and limits: <https://here.now/pricing.md>
- OpenAPI: <https://here.now/openapi.json>

here.now is the default because an agent can publish a built folder to a live
`https://{slug}.here.now` URL by API — create → upload → finalize — with no repository, no CI, and
no browser drag-and-drop. It serves `index.html` at the site root, so the shareable link is a bare
hostname. Anonymous publishes need no account and expire in 24 hours; an API key makes Sites
permanent.

Publish with the template command, not the here.now skill's `publish.sh`. The template already
requires a JavaScript runtime; the command implements the same three-step API without `curl`, `jq`,
or `file`, and it is what a portable `scripts.deploy` can name. Do not invent URLs: report only the
`siteUrl` (and, when present, `publish_result.*` lines) returned by the current run.

## Plan limits — say this before the first publish

- **Anonymous** (no API key): free, temporary Sites that **expire in 24 hours**, with lower limits.
  Fine for a quick preview. Say the expiry out loud before publishing, and share any claim URL the
  command returns so the user can keep the Site permanently.
- **Authenticated** (API key in `~/.herenow/credentials` or `$HERENOW_API_KEY`): free-tier account
  Sites are **permanent** (within the published plan limits). Limits and paid tiers change; read
  <https://here.now/pricing.md> and <https://here.now/docs#limits> rather than inventing numbers.

Do not hide the anonymous expiry. Discovering it after learners have been sent a link is worse than
hearing it before the upload.

## Prerequisites

- The same JavaScript runtime the site build already used (Node 20.19+ / 22.13+ / 24+, or Bun 1.1+).
- Optional: `$HERENOW_API_KEY`, or `~/.herenow/credentials` (mode `0600`).

Never ask the user to paste an API key into chat. For permanence, use the agent email-code flow
below and let the command write the returned key to `~/.herenow/credentials`.

Do not install the here.now skill, and do not fall back to hand-rolled `curl` against the API while
the template command is available. If no JavaScript runtime is available, this route is not
available — Stage 1's Vercel Drop (or another browser upload) is the workable method.

## File layout

Publish the **contents** of `dist/`. `index.html` must sit at the root of the directory you pass —
`--course <dir>` publishes `<dir>/dist`.

```text
dist/index.html          ← correct root
dist/assets/...
dist/unit-1/...
```

not a parent folder that merely contains `dist/`. The directory's contents become the site root.

The command refuses credential-like files (`.env*`, `*.pem`, `id_rsa`, …) and symlinks that escape
`dist/`. Name every rejected path. Do not “publish around” it silently.

## First publish

From a scaffolded course workspace (the directory that contains `course-<slug>/`):

```bash
bunx witherspoon-course-template publish --course ./course-slug
# or, once scripts.deploy exists:  bun run deploy
```

Always go through a package script, `bunx`, or `npx` — never `node_modules/.bin/witherspoon-course`,
whose `#!/usr/bin/env node` shebang exits 127 on a Bun-only machine.

Read stdout for the live URL and stderr for `publish_result.*`:

- `publish_result.auth_mode=anonymous` → Site **expires in 24 hours**. Share
  `publish_result.claim_url` when it is a non-empty `https://` URL. Claim tokens are returned once.
- `publish_result.auth_mode=authenticated` → Site is **permanent** on the user's account. No claim
  URL is needed.
- Always share `publish_result.site_url` from **this** run. Never invent `{slug}.here.now`, and never
  treat `.herenow/state.json` as something to show the user.

The command writes claim state to `<course-dir>/.herenow/state.json`. Record `provider: "here.now"`,
`method: "api"`, `destination` = the returned slug, and `entryUrl` = the returned site URL in
`.course-publish.json`. A later run without `--slug` reuses that destination when the manifest
provider is `here.now`.

## Permanent Sites — agent email-code flow

When the user wants a link that lasts (the usual case for a finished course), obtain an API key
before or immediately after the first anonymous publish:

1. Ask for their email address.
2. Request a one-time code:

   ```bash
   bunx witherspoon-course-template publish --request-code user@example.com
   ```

3. Ask them to paste the code from their inbox (that code is not an API key).
4. Verify and save the key — do not ask the user to run this:

   ```bash
   bunx witherspoon-course-template publish --verify-code ABCD-2345 --email user@example.com
   ```

   The command writes `~/.herenow/credentials` mode `0600` itself.

Never commit `~/.herenow/credentials`, `.herenow/state.json`, or any claim token. Add `.herenow/` to
the workspace `.gitignore` when you create local state and it is not already ignored.

## Republish / update

Reuse the manifest slug:

```bash
bunx witherspoon-course-template publish --course ./course-slug --slug COURSE_SLUG
```

`--slug` is optional when `.course-publish.json` already records this course's here.now destination;
passing it is still the proven form to persist in `scripts.deploy`.

- Authenticated updates need the saved API key.
- Anonymous updates need the claim token; the command loads it from
  `<course-dir>/.herenow/state.json` when present. Pass `--claim-token` only when overriding. If the
  claim token is lost and the Site has not been claimed, publish a new Site rather than guessing.
- Each successful finalize replaces the live Site. Stale remote files are not a separate cleanup
  step — the new version is a complete snapshot. A byte-identical republish still finalizes (uploads
  may all be skipped); do not treat “0 files to upload” as a failure.

## Deploy script

After a successful publish, persist `scripts.deploy` to the exact non-interactive form that
worked, with the manifest slug explicit and the course path relative to that package.json:

```json
{
  "scripts": {
    "deploy": "witherspoon-course publish --course ./course-slug --slug COURSE_SLUG"
  }
}
```

Do not embed login details, and do not point `deploy` at a harness-specific `publish.sh` path.

## Custom hostnames

Custom domains need an account. Verify the .here.now URL first, then follow
the current steps at https://here.now/docs. Keep the provider URL as fallback until HTTPS works.

## Failure modes

| Symptom | Likely cause | What to do |
| --- | --- | --- |
| Live URL 404s or directory listing | Published a parent of dist/, or index.html not at root | Re-publish with `--course <course-dir>` so dist/ is the root |
| finalize failed / Site never live | Uploads incomplete, or finalize skipped | Re-run the command; it creates, uploads, and finalizes in one go |
| Anonymous update rejected | Missing or wrong claim token | Use `<course-dir>/.herenow/state.json` or publish a new Site |
| Authenticated update 401/403 | Missing ownership for the slug | Confirm local login state; do not overwrite unknown slugs |
| Expected permanent link, got 24h | Anonymous publish | Share claim URL if any; use email-code flow; republish |
| refusing to publish credential-like files | `.env` / key material in dist/ | Remove it from the course source and rebuild; do not skip the file |
| Unknown command: publish | Template older than 1.2.0 | Upgrade `witherspoon-course-template` (the command ships in 1.2.0) |

## Verification reminders

Stage 5 still applies unchanged: fetch the public entry URL, check assets/MIME types, open the site
in a real browser, confirm navigation and one interactive control, and verify rights metadata in the
footer. Do not call the course published from a successful publish command exit code alone.

## What not to do

- Do not treat a Git remote or GitHub Actions as this command's publish path. A Pages workflow in
  the workspace is a separate, user-pushed republish path.
- Do not upload course source — only dist/ contents.
- Do not invent a {slug}.here.now URL before the API returns one.
- Do not present .herenow/state.json as a URL or as proof of auth mode.
- Do not commit local here.now state files or claim tokens.
- Do not install or invoke here.now's `publish.sh` while the template command is available.
