# Vercel publishing contract

Use Vercel as an **advanced / alternative** direct static host when the user chooses it over the default here.now path. Current official references:

- Vercel Drop (browser upload): <https://vercel.com/docs/drop>
- CLI overview: <https://vercel.com/docs/cli>
- `vercel deploy`: <https://vercel.com/docs/cli/deploy>
- Custom domains: <https://vercel.com/docs/domains/working-with-domains>
- Plan limits: <https://vercel.com/docs/limits>

Vercel remains available because it serves `index.html` at the root of a directory, so the shareable
URL is the bare hostname with no `/index.html` suffix, and because it takes a built directory straight
from the machine with no repository, no CI, and no Git connection. Prefer here.now for first-time and
typical publishes ([here-now.md](here-now.md)); use this reference when the user explicitly wants
Vercel, or when the harness cannot run shell commands and a browser drop is the only workable route.

There are two ways to get `dist/` there:

- **[Method A — Vercel Drop](#method-a--vercel-drop-drag-the-folder-into-the-browser).** The user
  drags the `dist` folder onto a web page. Nothing to install, nothing to log into from a terminal,
  no command to mistype. Use this when the user chose Vercel Drop, or when the harness cannot run
  commands on their machine at all.
- **[Method B — Vercel CLI](#method-b--vercel-cli-one-command-repeatable).** One command, repeatable,
  redeploys into the *same* project so the URL never changes. Better for a course that gets updated
  often on Vercel — and the fallback whenever Method A's project naming gets in the way.

Both publish to production and both produce the same kind of URL. Choose on who is doing the work:
Method A is the user's browser, Method B is your terminal.

## Plan limits — say this before the user signs in

Vercel's free **Hobby** plan is for non-commercial use. A course published for a business, sold, or
used to promote a paid offering needs a paid plan. State that in one sentence before the user logs
in — discovering it after publishing is worse — and let them decide. Do not characterise anyone's
specific situation as compliant or not; give them the rule and the link.

Signing in to Vercel *with* a GitHub account is not deploying through GitHub. No repository is
created, connected, or read. Say so if the user hesitates at the sign-in screen — it is the most
common reason someone stalls there.

## Method A — Vercel Drop (drag the folder into the browser)

`vercel.com/drop` takes a file, a folder, or a `.zip`, creates a project, uploads it, and publishes
straight to production. No Git, no CLI, no local install.

**You cannot do this step.** It happens in the user's browser, on their session. Your job is to
build the artifact, hand over an exact path and an exact project name, give the walkthrough, and then
wait. Do not narrate it as done, and do not guess the resulting URL — `<slug>.vercel.app` is a
prediction until the user pastes back what Vercel actually printed.

### Prepare, then hand over

1. Build and pass the gates first, so what gets uploaded is the verified artifact:

   ```bash
   bun run build         # or: npm run build
   bun run verify
   bun run test
   ```

2. Resolve `<course-dir>/dist` to an **absolute path** and give it to the user literally. "Your dist
   folder" is not an instruction someone can follow inside a file picker.
3. Derive the project name from the course slug — lowercase ASCII letters, digits and hyphens, no
   dots, no leading or trailing hyphen, 100 characters or fewer. It becomes the hostname, so give
   the user the exact string to type rather than letting them improvise one at the prompt.

### The walkthrough to give the user

Give these as steps, with the two substitutions already filled in:

1. Go to **<https://vercel.com/drop>** and sign in (GitHub, GitLab, Bitbucket or email). A free
   Hobby account is enough.
2. Drag the folder **`<absolute path>/dist`** onto the page — or select **folder** and pick it in the
   file dialog. Drop the `dist` folder itself; a `.zip` of its contents works too if the browser
   refuses a folder.
3. Choose the team to deploy to — a personal account shows exactly one — and type the project name:
   **`<project-name>`**.
4. Select **Deploy**, and leave the tab open while it uploads. Vercel creates the project, uploads
   the files, and publishes to production.
5. Copy the live URL it shows and paste it back.

Then verify it yourself against [Verification](#verification) below. A URL the user pasted is a
claim about where the site is, not evidence that it works.

### What can go wrong, and what it means

- **Vercel asks which page should load at the root (`/`).** It only asks that when the dropped folder
  has no `index.html` at its top — so the wrong folder was dropped, usually the course directory or
  the workspace above it. Have them drop `dist` itself rather than answering the question.
- **The deployment runs a build and fails.** Same cause. `dist/` has no `package.json`, so Vercel
  detects no framework and uploads it as-is; a course directory *does* have one, so Vercel tries to
  build it on its own builders where the site template is not installed. Delete the resulting project
  and re-drop `dist`. Do not "fix" it with a `vercel.json`, a build command, or an output-directory
  setting — the detection was already correct for the correct folder.
- **The upload is slow.** Files go up from the browser, so a large course on a poor connection takes
  a while. A `.zip` of `dist`'s contents is one request instead of thousands.

### Uploading again after a change

**Every drop creates a new project. Vercel Drop cannot redeploy into an existing one** — that is a
documented limitation, not a setting to find. So a second drop under a second name yields a second
URL, and the link already handed to learners keeps serving the old build.

To keep one stable link, free the name before reusing it:

1. Dashboard → the old project → **Settings** → **General** → rename it to `<project-name>-old`.
   Vercel stops guaranteeing the old auto-assigned URL after a rename, which is precisely what
   releases `<project-name>.vercel.app`.
2. Drop the fresh `dist` at `vercel.com/drop` under the original `<project-name>`.
3. Verify the URL again, *then* delete `<project-name>-old`.

The site is briefly unreachable between steps 1 and 2 — seconds to a minute, but say so rather than
letting a learner's refresh be the way it is discovered. Deleting the old project instead of renaming
it works too and skips a step; it also discards the deployment history, so it is the right move only
once the user is sure of the new build.

If the name does not come free, or the user is updating more than occasionally, stop working around
it and switch to **Method B** — one command, same project, no dashboard, no gap in service. A custom
hostname also removes the problem entirely: point `learn.example.com` at whichever project is
current, and the shared link never changes even when the project underneath it does.

Before either re-upload, the source must actually be rebuilt: `bun run build`, then the gates. A
re-drop of a stale `dist/` publishes the previous version and looks exactly like a successful update.

## Method B — Vercel CLI (one command, repeatable)

CLI flags move between major versions. Run `vercel deploy --help` before the first deploy of a
session and prefer what it reports over what is written here. `--name`, for instance, no longer
exists; project naming is `--project`.

### Authenticate

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

### Never run bare `vercel` from a course directory

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

### Destination

Derive the project name from the course slug: lowercase ASCII letters, digits and hyphens, no dots,
no leading or trailing hyphen, 100 characters or fewer. List what already exists first:

```bash
vercel projects ls
```

Reuse the project named in `.course-publish.json`. **A same-named project without that manifest is a
collision, not permission to deploy into it** — append a short stable suffix instead. One exception,
and only with the user confirming it: a project they created earlier by dropping this same course.
Record it in the manifest at that point, which is what makes every later deploy unambiguous.

**Create the project before the first deploy.** `--project` selects a project; it does not create
one, and `--yes` does not change that. Deploying to a name that does not exist yet fails with
`project_not_found`, naming the scope it searched:

```bash
vercel project add COURSE_PROJECT
```

If that reports the project is in another scope, the account has multiple teams — pass
`--scope <team-slug>` on both commands rather than switching the user's default scope.

### Deploy

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

### Repeat publishes

A production deploy replaces what the production URL serves; there is no stale-object problem to
clean up, because each deployment is a complete immutable snapshot rather than a mutable bucket.
This is the main operational difference from object-storage hosting, and it means **no delete step
is ever required**. Do not run `vercel remove` as part of publishing.

Confirm the deployment that is actually live before reporting:

```bash
vercel ls COURSE_PROJECT
```

## Verification

Both methods land in the same place, so verification is identical and mandatory for both.

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

After a drop in particular, check that the page you fetched is the build you just made — a heading or
a fixed string from the change the user just approved. A stale `dist/`, or a drop of the wrong
folder, otherwise verifies perfectly as the *previous* version of the course.

## Custom hostname

Custom domains do not require moving DNS hosting to Vercel, and they work the same whichever way the
files got uploaded.

1. Verify the `.vercel.app` URL first. DNS propagation must not obscure whether the deploy worked.
2. Add the domain to the project — in the dashboard under the project's **Settings → Domains**, or
   from the CLI:

   ```bash
   vercel domains add CUSTOM_HOSTNAME COURSE_PROJECT
   ```

3. Vercel prints the exact record to create. Show it to the user before they change anything. For a
   subdomain that is a `CNAME`; at a zone apex it is an `A` record, because many DNS providers do not
   permit a `CNAME` there. Prefer a subdomain such as `learn.example.com`.
4. Create the record at the user's existing DNS provider, in **DNS-only / unproxied** mode. A
   TLS-terminating proxy in front of Vercel prevents certificate validation.
5. Wait for issuance, then verify `https://CUSTOM_HOSTNAME` over HTTPS — the bare root this time, no
   `/index.html`. A DNS record alone is not proof.

Keep the `.vercel.app` URL as the fallback in the manifest until the custom hostname passes.

For a course published by dropping, a custom hostname is worth more than it looks: it is what makes
the shared link survive the project swap that every re-upload requires. Move the domain to the new
project after each drop and learners never see a URL change.
