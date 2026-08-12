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

Prefer the official `publish.sh` helper from the here.now skill. It implements the three-step flow
and writes local state. Do not invent URLs: report only the `siteUrl` (and, when present,
`publish_result.*` lines) returned by the current run.

## Plan limits — say this before the first publish

- **Anonymous** (no API key): free, temporary Sites that **expire in 24 hours**, with lower limits.
  Fine for a quick preview. Say the expiry out loud before publishing, and share any claim URL the
  script returns so the user can keep the Site permanently.
- **Authenticated** (API key in `~/.herenow/credentials` or `$HERENOW_API_KEY`): free-tier account
  Sites are **permanent** (within the published plan limits). Limits and paid tiers change; read
  <https://here.now/pricing.md> and <https://here.now/docs#limits> rather than inventing numbers.

Do not hide the anonymous expiry. Discovering it after learners have been sent a link is worse than
hearing it before the upload.

## Prerequisites

- `curl`, `file`, and `jq` on the machine that will upload.
- Optional: `$HERENOW_API_KEY`, or `~/.herenow/credentials` (mode `0600`).
- Optional: the here.now skill / `publish.sh` helper.

Install the helper when it is missing (use your harness’s skill installer; for example):

    npx skills add heredotnow/skill --skill here-now

Locate `scripts/publish.sh` under the installed skill directory (the exact parent path is harness-dependent). If the helper cannot be installed, follow the create → upload → finalize API in <https://here.now/docs> / <https://here.now/skill.md> — same contract, more typing.

Required binaries only. Never ask the user to paste an API key into chat. For permanence, use the
agent email-code flow below and write the returned key to `~/.herenow/credentials` yourself.

## File layout

Publish the **contents** of `dist/`. `index.html` must sit at the root of the directory you pass —

```text
dist/index.html          ← correct root
dist/_astro/...
dist/unit-1/...
```

not a parent folder that merely contains `dist/`. The directory's contents become the site root.

## First publish

From a verified absolute `dist/` path:

```bash
/absolute/path/to/publish.sh /absolute/path/to/course/dist --client witherspoon
```

Read stdout for the live URL and stderr for `publish_result.*`:

- `publish_result.auth_mode=anonymous` → Site **expires in 24 hours**. Share
  `publish_result.claim_url` when it is a non-empty `https://` URL. Claim tokens are returned once.
- `publish_result.auth_mode=authenticated` → Site is **permanent** on the user's account. No claim
  URL is needed.
- Always share `publish_result.site_url` from **this** run. Never invent `{slug}.here.now`, and never
  treat `.herenow/state.json` as something to show the user.

Record `provider: "here.now"`, `method: "api"`, `destination` = the returned slug, and `entryUrl` =
the returned site URL in `.course-publish.json`.

## Permanent Sites — agent email-code flow

When the user wants a link that lasts (the usual case for a finished course), obtain an API key
before or immediately after the first anonymous publish:

1. Ask for their email address.
2. Request a one-time code:

   ```bash
   curl -sS https://here.now/api/auth/agent/request-code \
     -H "content-type: application/json" \
     -d '{"email":"user@example.com"}'
   ```

3. Ask them to paste the code from their inbox (that code is not an API key).
4. Verify and capture the key:

   ```bash
   curl -sS https://here.now/api/auth/agent/verify-code \
     -H "content-type: application/json" \
     -d '{"email":"user@example.com","code":"ABCD-2345"}'
   ```

5. Save it yourself — do not ask the user to run this:

   ```bash
   mkdir -p ~/.herenow && printf '%s\n' "API_KEY_VALUE" > ~/.herenow/credentials && chmod 600 ~/.herenow/credentials
   ```

Never commit `~/.herenow/credentials`, `.herenow/state.json`, or any claim token. Add `.herenow/` to
the course `.gitignore` when you create local state inside the workspace.

## Republish / update

Reuse the manifest slug:

```bash
/absolute/path/to/publish.sh /absolute/path/to/course/dist \
  --slug COURSE_SLUG --client witherspoon
```

- Authenticated updates need the saved API key.
- Anonymous updates need the claim token; `publish.sh` loads it from `.herenow/state.json` when
  present. Pass `--claim-token` only when overriding. If the claim token is lost and the Site has
  not been claimed, publish a new Site rather than guessing.
- Each successful finalize replaces the live Site. Stale remote files are not a separate cleanup
  step — the new version is a complete snapshot.

## Deploy script

After a successful publish, persist `scripts.deploy` to the exact non-interactive form that
worked, with the manifest slug explicit and the `dist/` path relative to that package.json:

```json
{
  "scripts": {
    "deploy": "/absolute/path/to/publish.sh ./course-slug/dist --slug COURSE_SLUG --client witherspoon"
  }
}
```

Prefer a stable path to publish.sh on this machine.
Do not embed login details in the deploy script.

## Custom hostnames

Custom domains need an account. Verify the .here.now URL first, then follow
the current steps at https://here.now/docs. Keep the provider URL as fallback until HTTPS works.

## Failure modes

| Symptom | Likely cause | What to do |
| --- | --- | --- |
| Live URL 404s or directory listing | Published a parent of dist/, or index.html not at root | Re-publish the dist/ directory itself |
| finalize failed / Site never live | Uploads incomplete, or finalize skipped | Re-run create/update, upload every file, finalize |
| Anonymous update rejected | Missing or wrong claim token | Use .herenow/state.json or publish a new Site |
| Authenticated update 401/403 | Missing ownership for the slug | Confirm local login state; do not overwrite unknown slugs |
| Expected permanent link, got 24h | Anonymous publish | Share claim URL if any; use email-code flow; republish |
| requires jq / requires curl | Helper prerequisites missing | Install jq, curl, and file, or use the docs API by hand |

## Verification reminders

Stage 5 still applies unchanged: fetch the public entry URL, check assets/MIME types, open the site
in a real browser, confirm navigation and one interactive control, and verify rights metadata in the
footer. Do not call the course published from a successful publish.sh exit code alone.

## What not to do

- Do not deploy through GitHub, Git remotes, or CI.
- Do not upload course source — only dist/ contents.
- Do not invent a {slug}.here.now URL before the API returns one.
- Do not present .herenow/state.json as a URL or as proof of auth mode.
- Do not commit local here.now state files or claim tokens.

