---
name: course-publish
description: Publish a built course site's dist/ to a public URL using the user's preferred static host. Defaults to Tigris Object Storage through a capable connected MCP server or the Tigris CLI, handles authentication, direct artifact upload, optional custom domains, and end-to-end verification. Use when the user asks to publish, deploy, host, upload, or share a course website. Never uses GitHub.
---

# Course Publish

Publish a built course and return a link that has been opened and verified. The user chooses the
provider; Tigris is the default because its direct-upload flow is small, its free allowance is
useful for course sites, it charges no egress, and a custom domain can remain at the user's current
DNS provider.

This skill publishes build artifacts. It does not create repositories, commits, pull requests, or
CI pipelines.

## Non-negotiables

- **No GitHub.** Never use GitHub Pages, Actions, Releases, repository deployment, or a Git remote.
- Upload only the **contents** of `<course-dir>/dist/`, never the course source and never `dist/` as
  an extra path segment.
- Never request an access key or secret in chat. Use the provider's browser login, OAuth connector,
  OS credential prompt, or documented local credential command.
- Never report success from an upload command alone. Open the public site and exercise it.
- Never overwrite an existing destination unless `.course-publish.json` identifies it as belonging
  to this course or the user explicitly identifies it as the destination.
- Never delete unknown remote objects. A stale-file cleanup is allowed only for a destination that
  the manifest marks as dedicated to this course.
- Do not hide provider limitations. In particular, Tigris does not serve a default index document;
  its working URL ends in `/index.html`, including on a custom domain.

## Pipeline

### Stage 0 — Discover silently

1. Resolve the course directory from the user's request, the current directory, and directories
   containing `course.json`.
2. Find `<course-dir>/dist/index.html`. If there is one unambiguous built course, use it. If several
   are plausible, include the course choice in Stage 1.
3. Read `<course-dir>/.course-publish.json` when present. It is the deployment identity for a repeat
   publish; it is not authority to operate on any other destination.
4. If `course.json` exists but `dist/index.html` does not, invoke `course-site` to build and verify
   the approved course, then resume here. If `course-site` or its build runtime is unavailable, state
   that exact prerequisite and ask the user to install it or provide the built `dist/`; never upload
   course source as a substitute. If there is neither a build nor buildable course source, stop with
   the exact missing path.
5. Inspect available provider tools without triggering authentication. For Tigris, note whether a
   connected MCP server can create a public bucket and recursively upload every file while
   preserving bytes, object keys, and MIME types. Merely having a Tigris MCP connector is not enough.

Do not ask the user for facts the workspace or provider manifest already establishes.

### Stage 1 — One short interview

Use one batched multiple-choice turn — `AskUserQuestion`, or your harness's equivalent; if it has
none, ask as one numbered list in a single message. Omit questions already answered. Every question
has a recommended choice so accepting defaults is one interaction.

**Publish method**

| Option | Meaning |
| --- | --- |
| **Tigris direct upload (Recommended)** | Use an already-connected, capable Tigris MCP server; otherwise use the official Tigris CLI. No repository. Tell new Tigris users up front that a public bucket requires adding a verified payment method; the verification is a short Link flow. |
| Netlify direct deploy | Upload `dist/` with Netlify's CLI/API/drop flow; no Git integration. |
| Cloudflare Pages direct upload | Upload `dist/` with Wrangler/direct upload; no Git integration. |

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

Provider selection authorizes installation of that provider's official CLI when no suitable
installed or connected tool exists. State the exact install command before running it. Authentication
or destructive-operation confirmations are safety gates, not a second general interview.

### Stage 2 — Preflight the artifact

Before authenticating or creating remote resources:

1. Resolve `dist/` to an absolute path and confirm `index.html` is a regular file.
2. Reject symlinks that escape `dist/` and files that look like credentials (`.env*`, private keys,
   access-key dumps). Name every rejected path. Do not “publish around” it silently.
3. If this repository's `course-template/` and Node/npm are available, run its current build gates
   against this exact `dist/`:

   ```bash
   cd course-template
   npm run verify -- /absolute/path/to/course/dist
   npm run test -- /absolute/path/to/course/dist
   ```

   Fix a real build issue through `course-site`; do not mutate generated files in `dist/` by hand.
   If Node/npm is unavailable but `dist/index.html` already exists, continue with the static
   artifact checks and mandatory public browser smoke test; state that the template gates were not
   rerun. Do not force a build-tool installation merely to upload an existing verified artifact.
4. Record the relative file keys and total byte size. These become the upload and verification
   inventory.

### Stage 3 — Publish

For Tigris, read and follow [references/tigris.md](references/tigris.md). That reference is the
command and provider-behavior contract; do not improvise around its `/index.html`, MIME, public
access, or custom-domain constraints.

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

Tigris-specific custom-domain steps and limitations are in
[references/tigris.md](references/tigris.md).

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
  "provider": "tigris",
  "accountScope": null,
  "destination": "course-slug",
  "entryUrl": "https://course-slug.t3.tigrisfiles.io/index.html",
  "customHostname": null
}
```

Use the actual provider and destination. Set `accountScope` to the provider's non-secret team,
account, or organization identifier when destination names are account-scoped; leave it `null` when
the destination ID is globally unambiguous. Store no token, access key, secret, or DNS credential.
This file makes repeat publication safe and stable.

The final workspace step is to make the build and verified deployment repeatable from the course
directory:

1. Read `<course-dir>/package.json` when it exists and preserve its name, dependencies, unrelated
   scripts, and formatting conventions. If it is absent, create a minimal private package using the
   course slug:

   ```json
   {
     "name": "course-slug",
     "private": true,
     "scripts": {}
   }
   ```

2. When the shared `course-template/package.json` is available, expose its course operations as
   wrappers in the course package. Compute relative paths from the course and template directories;
   do not assume they are siblings. For the normal sibling layout, add:

   ```json
   {
     "scripts": {
       "build": "npm --prefix ../course-template run build -- --course ../course-slug",
       "dev": "npm --prefix ../course-template run dev -- --course ../course-slug",
       "verify": "npm --prefix ../course-template run verify -- ../course-slug/dist",
       "check-widgets": "npm --prefix ../course-template run check-widgets -- --course ../course-slug",
       "typecheck": "npm --prefix ../course-template run typecheck",
       "test": "npm --prefix ../course-template run test -- ../course-slug/dist"
     }
   }
   ```

   Read the template's current `scripts` before editing. Mirror every course-facing operation it
   exposes, adapting required course or `dist/` arguments exactly as the template documents. A new
   template command is not copied blindly: inspect its usage first so it runs with the correct
   working directory and arguments. The wrappers reuse `course-template/node_modules`; do not add or
   duplicate template dependencies in the course package.

3. Set `scripts.deploy` to the exact non-interactive form of the method that just succeeded, with
   `./dist/` as the source and the manifest-owned destination explicit. Examples:

   ```json
   {
     "scripts": {
       "deploy": "tigris cp ./dist/ t3://course-slug/ --recursive"
     }
   }
   ```

   - Tigris: `tigris cp ./dist/ t3://<bucket>/ --recursive`
   - Netlify: `netlify deploy --site <site-id> --dir ./dist --prod --no-build`
   - Cloudflare Pages: `wrangler pages deploy ./dist --project-name <project-name>`
   - Other hosts: the exact proven CLI command with an explicit destination.

4. Never put tokens, access keys, secrets, temporary URLs, interactive login commands, or destructive
   stale-file cleanup in `scripts.deploy`. The provider CLI must use its normal authenticated local
   session. If the first upload used MCP or a web UI, configure and prove the provider's official CLI
   equivalent before writing the script; do not add a command that has not run successfully.
5. Run `npm run deploy` from `<course-dir>` once, then repeat Stage 5 against the public URL. The
   package edit is not complete until this exact command successfully republishes the site.
6. Make this package update the last workspace mutation. After it passes, report without changing
   course files again.

Preserve an existing wrapper when it already delegates to the current shared template with the
correct course path. Preserve an existing `deploy` script only when it targets the same
manifest-owned destination through the method that just passed. Otherwise replace it; the current
template contract and verified publication are the sources of truth.

Report only after the public browser check passes:

```text
Published: <absolute dist path> → <provider>/<destination>
Site: <verified clickable entry URL>
Custom domain: <verified URL | not requested | exact remaining optional step>
Upload: <file count> files · <bytes>
Rights: <verified copyright/license notice>
Checks: entry HTML · assets/MIME · internal navigation · interaction
Republish: cd <course-dir> && npm run deploy
```

For Tigris, print the `/index.html` URL as the primary link and state in one sentence that the bare
bucket/custom-domain root is not an entry URL. Do not call a Tigris bare-domain `403` a deployment
failure; do call a failing `/index.html` URL a deployment failure.
