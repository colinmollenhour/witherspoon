# Rubric — Project 1: Ground Zero

Four criteria. Integer weights summing to **100**. Graded against the five fields in
`starter/submission.txt`.

| # | Criterion | Weight |
| --- | --- | --- |
| 1 | The file exists where it was asked to exist, stated absolutely | 30 |
| 2 | The URL is the one the browser actually showed | 25 |
| 3 | The `ls -la` line is a real listing of the submitted file | 25 |
| 4 | The record is precise and the count is honest *(craft)* | 20 |
| | **Total** | **100** |

---

## 1 — The file exists where it was asked to exist, stated absolutely (30)

`absolute_path` begins with `/`, ends with the exact string `/projects/first-site/index.html`, and
contains no `~`, no backslash, no drive letter, and no `.` or `..` segment. Its home prefix agrees with
the declared `platform`: `/Users/` for macOS, `/home/` for Linux and for WSL. A WSL submission under
`/mnt/c` scores **0** on this criterion regardless of how well-formed the path is, because Microsoft's
own guidance is to "store your files in the WSL file system if you are working in a Linux command line".
A path under `Desktop`, `Documents`, or any location other than `<home>/projects/first-site` scores 0.
Filename case matters: `Index.html` is not `index.html`.

**Full credit (30):** absolute, platform-correct home prefix, exact tail, lowercase `index.html`.
**Partial (15):** correct location but abbreviated or malformed — a leading `~`, a trailing slash, or a
path with a `..` segment left unresolved.
**Zero:** relative path, Windows-style path, `/mnt/c`, or the wrong directory.

## 2 — The URL is the one the browser actually showed (25)

`file_url` begins with `file://` and ends with the value of `absolute_path`, so the URL and the path
name the **same file**. On macOS and Linux the two must line up exactly: `file://` + `absolute_path`.
On WSL the URL may carry additional prefix material before the Linux path, and that is accepted —
copied exactly, not cleaned up.

**Full credit (25):** a `file://` URL whose tail is the submitted path.
**Partial (12):** a `file://` URL that is well-formed but names a different file than `absolute_path`
(different folder, different case, `.txt` still attached) — evidence the URL was read, but of the wrong
thing.
**Zero:** an `http://` or `https://` URL, a `localhost` URL, a bare filesystem path pasted into the URL
field, or a URL identical to `absolute_path` with no scheme.

## 3 — The `ls -la` line is a real listing of the submitted file (25)

`ls_la_line` is one row of long-listing output, transcribed intact and describing a regular file:

- The first field is 10 or 11 characters. Character 1 is `-`, not `d` — a `d` means a directory was
  listed instead of the file. An eleventh character is accepted; on Fedora and RHEL a trailing `.` is
  an SELinux security-context marker, and plain Ubuntu prints ten characters and no dot.
- Characters 2–10 are three `rwx` triples: owner, group, other.
- The link count is a whole number and the size is a whole number greater than zero. A size of `0`
  means an empty file was saved and no HTML was typed.
- The final field is exactly `index.html`.

**Full credit (25):** all of the above, spacing preserved.
**Partial (12):** a genuine listing line that has been reformatted — spaces collapsed, trailing dot
stripped, fields reordered — but is still recognisably this file's row.
**Zero:** the directory's own row, the `total` line, the whole listing pasted, a line for a different
file, or a line invented rather than copied.

## 4 — The record is precise and the count is honest *(craft)* (20)

Everything in the submission is copied, not reconstructed, and every field is filled with a value rather
than a placeholder.

- `mouse_actions` reads `actions=<n> apps=<n>` with both numbers greater than zero, and the numbers are
  plausible against the work described: creating two folders, creating and naming one file, and opening
  it in a browser cannot be done in one action or in one application. A submission claiming `apps=1` for
  a task that required a file manager, an editor, and a browser is not honest.
- No template placeholder survives: no `<you>`, no `<your count>`, no empty value after a colon.
- No prompt character has been copied into a value. A leading `$` or `%` means the machine's prompt was
  selected along with the text — the `$` "is a command prompt. It is not meant to be typed in."
- Field names are unaltered and every one of the five lines is present.
- `platform` is one of the three permitted words, not a version string or a marketing name.

**Full credit (20):** all five fields present, no placeholders, no prompt characters, counts present and
plausible.
**Partial (10):** one field left as a placeholder, or a count given as a single number rather than the
`actions=<n> apps=<n>` pair.
**Zero:** fields renamed or missing, values obviously fabricated, or `mouse_actions` left blank.
