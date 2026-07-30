# Runtime setup — Node or Bun

The course **material** needs no runtime. Markdown and `course.json` are written by the agent, and a
learner can read the whole course as files. A runtime is needed only to build the **website**.

That split is why this is not a prerequisite check at the start. Gating the interview on a toolchain
the first three-quarters of the pipeline never touches turns a five-minute conversation into an
install session, and if the install fails the user is left with nothing. Ordered as below, a failed
install costs the website and still leaves a complete, readable course on disk.

## Three touchpoints, one interruption

**1 · Probe silently, at Stage 0.** One command, no output to the user:

```bash
node --version 2>/dev/null || bun --version 2>/dev/null || echo MISSING
```

**Node 20.19+, 22.13+ or 24+**, or **Bun 1.1+**, is sufficient. Either alone is enough: the whole
build, gates and jsdom runtime tests included, runs under Bun with no Node present, and equally under
Node with no Bun. Those Node versions are not arbitrary — they are what `jsdom` requires, and a
machine below the floor installs with an `EBADENGINE` warning and may fail the runtime tests.

**If the machine already has Node and npm, use them.** Most machines with any JavaScript tooling do,
and npm is the universal option — every command in this project has an `npm` form that is equally
supported and equally tested. Bun is preferred only where it is already present, or when installing
from scratch, because it is one download and a much faster install. It is not a requirement, and it
is never worth installing over a working Node.

If the probe finds a usable runtime, say nothing about any of this, ever. Do not make a user who
already has Node 22 read an install guide.

**2 · Surface it at the approval gate, Stage 4 — not before, not after.** Append the install block for
the user's platform to the message you are already sending. Two reasons this is the moment:

- It is the one point in the pipeline where the user is guaranteed present, reading, and about to
  reply. After Stage 4 the work is autonomous and any new demand is an interruption.
- Grounding plus one agent per topic and per project runs long — a six-unit course is well over
  twenty-five agents. That is time the user can spend installing rather than watching. A Windows user
  heading for WSL may need a reboot, and you want that discovered with slack, not at the end.

Frame it as something to do *while* the course builds, and make clear it is not blocking:

> While that runs, install a runtime so the website can be built at the end — it takes about a minute
> and nothing here waits on it.

**3 · Re-probe before the site build.** If a runtime is present, continue. If not, stop and say so
plainly: the material is finished and on disk, the site is the only thing missing, and the build can
be run later with one command. Do not treat this as a failed course.

At Stage 7 the same probe decides whether `render-views` can run. If no runtime is available yet,
write `course.json` as normal and note that the markdown views for quizzes, flashcards and unit tests
will be generated at the site stage — never hand-write them, and never let their absence block
generation.

## Install commands

These are for a machine with **neither** runtime. Bun is the suggestion there — one command, no
version manager — but Node is equally supported end to end, and anyone who already has npm should
simply use it rather than install anything.

### macOS / Linux / WSL

```bash
curl -fsSL https://bun.sh/install | bash
```

Then open a new terminal, or `source ~/.bashrc` (`~/.zshrc` on macOS), so `bun` is on `PATH`.

Node instead, on macOS with Homebrew:

```bash
brew install node
```

On Debian or Ubuntu, distribution packages are often several major versions behind; check
`node --version` against the floor above, and prefer the current installer from
<https://nodejs.org/en/download> if it falls short.

### Windows

The most reliable path is WSL, which also matches how most of the tooling is documented:

1. Open PowerShell as Administrator and run `wsl --install`.
2. Install **Ubuntu** from the Microsoft Store.
3. Open Ubuntu and run the macOS/Linux command above inside it.

Bun directly in PowerShell, without WSL:

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Node directly in PowerShell:

```powershell
winget install OpenJS.NodeJS.LTS
```

Both `bun.sh/install` and `install.ps1` are the vendor's official installers. A user who would rather
read a script before running it can open the URL in a browser first; say so if they hesitate rather
than talking them past the concern.

## Confirming it worked

```bash
bun --version || node --version
```

A version number means done. `command not found` in a terminal that was already open usually means
only that the shell has not picked up the new `PATH` — open a new one before diagnosing anything else.

## When the dev server will not start

The **production build is the resilient path**; the long-running dev server is the fragile one. If
`build` works and `dev` does not, nothing is wrong with the course.

**A sandboxed filesystem is the usual cause.** A dev server keeps esbuild resolving and watching
dependencies for as long as it runs, and a sandbox that permits the initial read can still deny the
directory traversal that watching needs. The signature is an Astro `UnhandledRejection` naming
directories rather than code:

```text
Error: Build failed with 10 errors:
error: Cannot read directory "../../../..": Access is denied.
../aria-query/lib/index.js:7:51: ERROR: Could not resolve "./ariaPropsMap"
```

Every one of those is a *permission* result, not a missing package — reinstalling will not fix it.
Either run the dev server outside the managed sandbox, or skip it: build, then serve `dist/`
statically, which needs no watcher. Say which you did rather than reporting a broken template.

**On Windows, invoke `npm.cmd`, not `npm`.** A bare `npm` may resolve to `npm.ps1`, which a machine's
PowerShell execution policy can block outright. The same applies to `npx.cmd`.

**Confirm the port that is actually listening.** Ask for one explicitly — `--port 4321` — and read the
startup log. A server told to take an occupied port used to walk forward to the next free one, so a
browser kept talking to an older process and every fix looked like it did nothing; the template now
fails to start instead, but only when the port was requested by name.

**Check the assets, not just the page.** A dev server can return 200 for `/` while the stylesheet and
runtime 404, which renders an unstyled, inert page that looks like a broken build. Fetch the CSS and
JS URLs the HTML actually emits, and confirm the returned HTML carries no Astro error overlay.

## What gets installed later

Nothing else is a prerequisite. At the site stage, one command pulls the site builder and builds the
course:

```bash
bun create witherspoon-course        # or: npm create witherspoon-course
```

Run from the directory that *contains* `course-<slug>/`, not from inside it. It detects the course,
writes a `package.json` with the build scripts, installs `witherspoon-course-template`, and runs the
first build. After that, `bun run build`, `bun run verify`, `bun run test` and `bun run dev`.

Always invoke through `bun run <script>` or `npm run <script>`. On a machine with Bun and no Node the
bare `node_modules/.bin/witherspoon-course` shim cannot execute at all — its `#!/usr/bin/env node`
line has nothing to resolve and the shell exits 127. Package scripts work because the manager
substitutes its own runtime for that shebang; `bunx witherspoon-course-template <command>` works for
the same reason.
