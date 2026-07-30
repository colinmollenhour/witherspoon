# Vercel publishing contract

Use Vercel as a direct static host. Current official references:

- CLI overview: <https://vercel.com/docs/cli>
- `vercel deploy`: <https://vercel.com/docs/cli/deploy>
- Custom domains: <https://vercel.com/docs/domains/working-with-domains>
- Plan limits: <https://vercel.com/docs/limits>

Vercel is the default because it serves `index.html` at the root of a directory, so the shareable URL
is the bare hostname with no `/index.html` suffix, and because `vercel deploy` uploads a built
directory straight from the machine with no repository, no CI, and no Git connection.

CLI flags move between major versions. Run `vercel deploy --help` before the first deploy of a
session and prefer what it reports over what is written here. `--name`, for instance, no longer
exists; project naming is `--project`.

## Plan limits — say this before authenticating

Vercel's free **Hobby** plan is for non-commercial use. A course published for a business, sold, or
used to promote a paid offering needs a paid plan. State that in one sentence before the user logs
in — discovering it after publishing is worse — and let them decide. Do not characterise anyone's
specific situation as compliant or not; give them the rule and the link.

## Authenticate

```bash
vercel login
vercel whoami
```

`vercel login` opens a browser or emails a code. Let the user complete it. Never ask for a token in
chat. If the CLI is absent, install it with the first available package manager:

```bash
npm install -g vercel
```

`npx vercel` works for a one-off publish without a global install, but a saved `deploy` script should
use whichever form is actually installed and proven.

## Never run bare `vercel` from a course directory

`vercel` with no arguments deploys **and builds** the current directory. Run from a course directory
it uploads the course *source*, sees a `build` script in `package.json`, and runs that script on
Vercel's builders — where the site template is not installed and any sibling path the script reaches
for does not exist. The failure is remote and unhelpful:

```text
Error: Command "npm run build" exited with 254
npm error enoent Could not read package.json: .../course-template/package.json
```

It also auto-creates a randomly named project such as `project-qmmxg` and writes a `.vercel/`
directory pointing at it, so the *next* bare `vercel` silently redeploys to that junk project. Delete
any stray `.vercel/` before deploying properly, and add `.vercel/` to the course's `.gitignore`.

Witherspoon builds locally and uploads the finished artifact. Vercel must run no build at all — which
is exactly what happens when the deployed path is `dist/`, because `dist/` carries no `package.json`
and so triggers no framework detection. Do not add a `vercel.json`, a build command, or an
output-directory setting to "fix" a detection that is already correct. If a deploy unexpectedly tries
to build, the wrong path was given; check that before changing any setting.

## Destination

Derive the project name from the course slug: lowercase ASCII letters, digits and hyphens, no dots,
no leading or trailing hyphen, 100 characters or fewer. List what already exists first:

```bash
vercel projects ls
```

Reuse the project named in `.course-publish.json`. **A same-named project without that manifest is a
collision, not permission to deploy into it** — append a short stable suffix instead.

**Create the project before the first deploy.** `--project` selects a project; it does not create
one, and `--yes` does not change that. Deploying to a name that does not exist yet fails with
`project_not_found`, naming the scope it searched:

```bash
vercel project add COURSE_PROJECT
```

If that reports the project is in another scope, the account has multiple teams — pass
`--scope <team-slug>` on both commands rather than switching the user's default scope.

## Deploy

Deploy the built directory itself, so nothing above it is uploaded:

```bash
vercel deploy /absolute/path/to/course/dist --prod --yes --project COURSE_PROJECT
```

Three parts of that line are load-bearing:

- **`--project COURSE_PROJECT`**, or Vercel names the project after the directory it was given —
  which is `dist`. It must already exist; see above.
- **`--prod`** creates a production deployment, which is what gets the stable
  `https://COURSE_PROJECT.vercel.app` alias. Without it the result is a preview URL carrying a
  generated hash that changes every deploy, which is not a link anyone can share.
- **`--yes`** skips the interactive project-setup prompts. Only use it with `--project` set.

The command prints both a hashed deployment URL and the stable production alias. Report the alias.

For a large course, `--archive=tgz` compresses the upload into a single request, which is more
reliable over a poor connection than several thousand individual file uploads.

After the first deploy passes public HTTP and browser verification, persist that exact command:

```json
{
  "scripts": {
    "deploy": "vercel deploy ./course-slug/dist --prod --yes --project COURSE_PROJECT"
  }
}
```

Write the `dist` path relative to the `package.json` being edited — from a scaffolded workspace that
is `./course-slug/dist`, not `./dist`. Preserve every other field and script. Never put `vercel
login`, a token, or `vercel remove` in the script.

## Repeat publishes

A production deploy replaces what the production URL serves; there is no stale-object problem to
clean up, because each deployment is a complete immutable snapshot rather than a mutable bucket.
This is the main operational difference from object-storage hosting, and it means **no delete step
is ever required**. Do not run `vercel remove` as part of publishing.

Confirm the deployment that is actually live before reporting:

```bash
vercel ls COURSE_PROJECT
```

## Verification

Vercel serves `index.html` at the root, so the entry URL is the bare hostname:

```text
https://COURSE_PROJECT.vercel.app
```

Fetch it and require a successful response with `Content-Type: text/html`. Parse the returned HTML
and fetch representative CSS, JavaScript, SVG or font, and raster-image assets that exist in the
build; require correct MIME types and successful responses. Vercel infers content types from file
extensions, so a wrong type here means the upload lost an extension, not that a header needs setting.

Then open the URL in a real browser, confirm the course title renders, follow a relative internal
link to a deep page such as `/unit-1/topic-1.html`, and exercise one interactive control. Confirm the
footer carries the course's copyright and licence. HTTP checks alone are not sufficient.

Astro's file-style routes are retained, so deep links end in `.html`. That is expected and needs no
rewrite rules.

## Custom hostname

Custom domains do not require moving DNS hosting to Vercel.

1. Verify the `.vercel.app` URL first. DNS propagation must not obscure whether the deploy worked.
2. Add the domain to the project:

   ```bash
   vercel domains add CUSTOM_HOSTNAME COURSE_PROJECT
   ```

3. The CLI prints the exact record to create. Show it to the user before they change anything. For a
   subdomain that is a `CNAME`; at a zone apex it is an `A` record, because many DNS providers do not
   permit a `CNAME` there. Prefer a subdomain such as `learn.example.com`.
4. Create the record at the user's existing DNS provider, in **DNS-only / unproxied** mode. A
   TLS-terminating proxy in front of Vercel prevents certificate validation.
5. Wait for issuance, then verify `https://CUSTOM_HOSTNAME` over HTTPS — the bare root this time, no
   `/index.html`. A DNS record alone is not proof.

Keep the `.vercel.app` URL as the fallback in the manifest until the custom hostname passes.
