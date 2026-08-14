# Project 1 — Ground Zero

**Type:** `interactive-form`
**Unit:** 1 — One file, one address

## Goal

Build `~/projects/first-site/index.html` with the file manager and a text editor. Capture its absolute path, the `file://` URL the browser shows when you double-click it, and how many clicks it cost — you will want that number in Unit 2.

---

## How this works

You do this on **your own machine**. What you hand in is five named fields in `starter/submission.txt`. Open that file and fill each field as you finish the step that produces it.

- Field names to the left of the colon stay as they are.
- Values may contain colons — `file:///…` and a timestamp's `04:25` are both fine.
- A line starting with `#` is ignored.

| Field | What goes in it |
| --- | --- |
| `platform` | Exactly one of `macOS`, `Linux`, `WSL` |
| `absolute_path` | The full path of your `index.html`, starting with `/` |
| `file_url` | The exact text in the browser's address bar after you double-click the file |
| `mouse_actions` | `actions=<n> apps=<n>` — distinct clicks/drags/typed names, and how many apps |
| `ls_la_line` | The single `ls -la` line for your `index.html`, copied as-is |

## Your tasks

1. **Name home.** Mac: `/Users/<you>`. Linux and WSL: `/home/<you>`. Write your platform into `platform`.
2. **Make two folders** in the file manager, inside home: `projects`, then `first-site`. Not on the Desktop. Type both names.
3. **Make the file.** In a text editor, type one `<h1>` line, save it into `first-site` as `index.html`. Lowercase `i`. Watch that the editor does not add `.txt`.
4. **Write the full path** into `absolute_path`. From `/` to `index.html`. No `~`, no `C:\`.
5. **Double-click the file.** Copy the address bar into `file_url`. Copy it; do not rebuild it from memory.
6. **One command:** `ls -la ~/projects/first-site`. Copy the `index.html` row into `ls_la_line`.
7. **Count the cost.** `actions=<n> apps=<n>` into `mouse_actions`.

## On WSL

Put the project on the Linux side: `/home/<you>/projects/first-site/index.html`. A path under `/mnt/c` fails. Count every app you had to use to get a file manager onto that side.

## What the scaffolding is for

`mouse_actions` is the number Unit 2 will beat. Count honestly.

`file_url` is the first of three addresses this file will have. It works on your machine only.

## Expected output

```
platform: Linux
absolute_path: /home/you/projects/first-site/index.html
file_url: file:///home/you/projects/first-site/index.html
mouse_actions: actions=<your count> apps=<your count>
ls_la_line: -rw-r--r--    1 you  you    12 Jul 29 04:25 index.html
```

A Mac submission uses `/Users/you/…`. An extra character after the permissions (a `.` on Fedora) is fine — leave it in.

## Rules

- File manager and editor only for tasks 1–5. `ls -la` is the one terminal step.
- Do not paste a `$` or `%` prompt into a field.
- Do not tidy `ls_la_line`. One line, spaces intact.
- Do not edit `tests/`.

See `rubric.md` for how this is scored.
