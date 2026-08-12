# create-witherspoon-course

Makes a generated Witherspoon course buildable: installs the site template, writes the build scripts,
and runs the first build.

```bash
bun create witherspoon-course        # or: npm create witherspoon-course
```

Run it from the directory that **contains** `course-<slug>/`, not from inside it.

It adopts a course that already exists — it does not scaffold course content. That is
[`course-builder`](https://github.com/colinmollenhour/witherspoon)'s job, and a starter course
generated here would be a second, ungrounded source of truth for a project whose whole premise is
that `course.json` is the only one.

## What it writes

A `package.json` in the workspace, carrying a dependency on `witherspoon-course-template` and:

```json
{
  "scripts": {
    "build": "witherspoon-course build --course ./course-slug",
    "dev": "witherspoon-course dev --course ./course-slug",
    "verify": "witherspoon-course verify --course ./course-slug",
    "test": "witherspoon-course test --course ./course-slug",
    "check-widgets": "witherspoon-course check-widgets --course ./course-slug",
    "render-views": "witherspoon-course render-views --course ./course-slug"
  }
}
```

An existing `package.json` is preserved: unrelated scripts and dependencies are kept, and a `deploy`
script written by `course-publish` survives. A `.gitignore` is written only if there is not one
already. A workspace-root `README.md` is written only when missing, naming who created the
course, when, why, and that [Witherspoon](https://github.com/colinmollenhour/witherspoon) built
it — it never overwrites an existing README, and it is separate from the learner-facing
`README.md` inside `course-<slug>/`.


## Options

| Flag | Effect |
| --- | --- |
| `--course <dir>` | which course to wire up; auto-detected when there is exactly one |
| `--skip-install` | write `package.json`, install nothing |
| `--skip-build` | install, but do not run the first build |

## Always use the scripts

```bash
bun run build      # or: npm run build
```

Not `node_modules/.bin/witherspoon-course`. On a machine with Bun and no Node that shim cannot
execute — its `#!/usr/bin/env node` line has nothing to resolve and the shell exits 127. Package
scripts work because the manager substitutes its own runtime for that shebang, and
`bunx witherspoon-course-template <command>` works for the same reason.

Node 20.19+ (or 22.13+, or 24+) or Bun 1.1+. Either alone runs the whole build, gates and jsdom tests
included — npm and bun are equally supported, so use whichever the machine already has.
