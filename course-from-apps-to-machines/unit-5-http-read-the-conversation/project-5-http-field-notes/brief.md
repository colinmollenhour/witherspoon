# Project 5 — HTTP Field Notes

**Type:** `interactive-form`
**Unit:** 5 — HTTP: reading the conversation, and joining it

## Goal

Capture and annotate three real HTTP exchanges — a public site, a redirect, and your own local server — then show what a `file://` load has that none of them do, and what it lacks that all of them have.

---

## How this works

There is no code to write. You run four or five commands, **copy what comes back exactly as it came
back**, and write down what each line does.

Your work is submitted as one file, `submission.json`, copied from `starter/submission.json`. Every
field in it is a string. The graders read that file:

- **Six automated tests** parse your captures and print `PASS` or a specific failure line. They check
  that the text you pasted has the shape a real capture has. Two of them are built to catch a capture
  that did not come from your machine.
- **A rubric** (see `rubric.md`) is scored by a human or a model, mostly on your annotations.

Paste raw text. Do not clean it up, do not re-indent it, do not delete the `>` and `<` markers, and
do not retype a line from memory — retyping is how the automated tests catch you.

Two commands you will lean on, both from Topic 16:

| Command | Sends | You get |
| --- | --- | --- |
| `curl -v <url>` | a `GET` | the whole conversation, with `>` for lines sent and `<` for lines received |
| `curl -I <url>` | a `HEAD` | the status line and the response headers, no body |

---

## Your tasks

Fill in the seven `TODO` markers in `starter/field-notes.md`, then copy each one into the matching
field of `submission.json`.

**TODO A — `curl_v_public`.**
Run `curl -v https://example.com` and paste the entire output. Keep every `>` line and every `<`
line. The `>` lines are your request. The `<` lines are the answer.

**TODO B — `curl_i_redirect`.**
Find a URL that does **not** answer `200`, but answers with a code in the `300`–`399` range — a
redirection. Topic 17: the first digit does the work, and `3xx` means "look somewhere else, or use
the copy you already have." Hunt for one with the status-code idiom from Unit 4:

```
curl -s -o /dev/null -w '%{http_code}\n' https://example.com
```

That prints just the number, one per URL, so you can try several quickly. When you find a `3xx`, run
`curl -I` against that URL and paste the whole response head. Do not paste a redirect you found in a
blog post. Find one yourself.

**TODO C — `curl_i_local`.**
Start your own server and capture its answer:

```
cd ~/projects/first-site
python3 -m http.server 8000
```

Leave it running. In a **second terminal**:

```
curl -I http://localhost:8000/index.html
```

Paste the whole response head. Note the path: `/index.html`, not `/`. This matters, and the tests
know why.

**TODO D — `status_line_local`.**
Copy the first line of that response, on its own, exactly as it appeared. Topic 16's grammar:
`<protocol> <status-code> <reason-phrase>`.

**TODO E — `content_type_local`.**
Copy the **value** of the `Content-Type` header from that same response — just the value, not the
header name, not the colon. Character for character.

**TODO F — `annotations`.**
Pick **at least six distinct lines** from the three captures above and annotate each one in the
format the template shows. Every annotated line must appear verbatim in one of your three captures.
Spread them out — do not annotate six headers from the same response.

Each annotation has two halves, and the second one is what is actually being marked:

- **WHAT IT IS** — the line's job in the message. A request line. A response header. A status line.
- **WHAT IT DOES** — what changes because that line is there. Not a restatement.

> Restating: *"`Content-Length: 31` is the content length, which is 31."*
> Annotating: *"`Content-Length: 31` promises 31 bytes of body after the empty line, so the receiver
> knows exactly where this message stops and does not sit waiting for more."*

**TODO G — `file_url_comparison`.**
Open the same page the old way — double-click `index.html`, so the address bar reads
`file:///home/you/projects/first-site/index.html`. Open DevTools, go to the **Network** panel, and
reload. Write down what you see in the Status column and in the response headers, and compare it
against what `curl -I http://localhost:8000/index.html` gave you. Name both absences explicitly.

**TODO H — `phone_result`** *(do this last)*.
Pick up your phone, make sure it is on the same Wi-Fi as your laptop, and type
`http://localhost:8000` into its browser. Write down what actually happened — what the phone showed,
and whether a new line appeared in the terminal where your server is running. Report the
observation. Do not go looking for a fix.

---

## What the scaffolding is for

`starter/field-notes.md` contains one **READ ONLY** worked annotation, using a line from a real
`curl -I` capture against `python3 -m http.server`. It is there as the standard, not as an answer —
read what its WHAT IT DOES half does, then do that six times with your own lines.

The starter also carries forward the artifact this whole course has been building:
`~/projects/first-site/index.html`, the file you created with commands in Unit 1 and have been
opening by double-clicking ever since. In TODO C it stops being a file you open and becomes a
resource something else serves to you.

Three things to notice while you work, because the rubric asks about all three:

1. **The public capture and the local capture have the same shape.** Four parts, twice, in the order
   Topic 16 promised. The far machine is enormous and yours is one command, and the grammar is
   identical.
2. **The `file://` load is missing something the other three all have.** Not "fewer headers" —
   a different category of thing entirely.
3. **The phone fails, and your laptop, sitting next to it on the same Wi-Fi, does not.** That is the
   note the next unit starts from. Write it down honestly.

---

## Expected output

When you run the server, the terminal prints this and then stops, with no new prompt:

```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

That is not frozen. It is running. `Ctrl-C` prints `Keyboard interrupt received, exiting.` and gives
your prompt back when you are done.

Your `curl -I http://localhost:8000/index.html` capture will have this shape — six lines:

```
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.14.6
Date: Wed, 29 Jul 2026 04:26:16 GMT
Content-type: text/html
Content-Length: 31
Last-Modified: Wed, 29 Jul 2026 04:23:59 GMT
```

Four of those values will be different on your machine and two will not:

| Line | Yours |
| --- | --- |
| `HTTP/1.0 200 OK` | **identical** — this server hard-codes `protocol_version = "HTTP/1.0"` |
| `Server: SimpleHTTP/0.6 Python/...` | `SimpleHTTP/0.6` identical; the Python version is whichever you have |
| `Date:` | the moment you ran the command |
| `Content-type: text/html` | **identical** — for a real `.html` file read off your disk |
| `Content-Length:` | the size of *your* file in bytes |
| `Last-Modified:` | the moment you last saved your file |

If your status line reads `HTTP/1.1`, the capture did not come from this server.

If your `Content-type` reads `text/html; charset=utf-8`, you captured a page the server *generated*
rather than your file — see the rules below.

---

## Rules

- **Paste, do not retype.** Every automated test is a parser reading real capture text.
- **Do not edit a capture after pasting it.** Not to fix spacing, not to shorten it, not to remove a
  header you did not understand. An unexplained header is a fine thing to annotate.
- **`curl -I http://localhost:8000/index.html`, not `curl -I http://localhost:8000/`.** Ask for the
  file. Asking for `/` gets you the file too *if `index.html` exists* — and if it does not, the server
  generates a directory listing instead and hands you a different `Content-Type`. One of the tests is
  built entirely around that difference.
- **Do not touch the running server between the capture and the copy.** Same server, same file.
- **`python3`, not `python`.** Python 2's server module is gone —
  `ModuleNotFoundError: No module named 'SimpleHTTPServer'`.
- **Do not resolve the phone problem.** Report what happened. Unit 6 is the fix, and going looking
  for it now costs you the rubric criterion that asks you to state the observation cleanly.

---

## Steps

- [ ] **1. Capture a public conversation.**
      Run `curl -v https://example.com` and paste the complete output into `curl_v_public`.
      *You are done when:* `curl_v_public` contains at least one line whose first non-whitespace
      character is `>` and at least one line whose first non-whitespace character is `<`.

- [ ] **2. Capture a redirect.**
      Find a URL that answers with a `3xx` code and paste its `curl -I` response head into
      `curl_i_redirect`.
      *You are done when:* the first line of `curl_i_redirect` begins with `HTTP/` and its second
      whitespace-separated field is a three-digit integer in the range `300`–`399`.

- [ ] **3. Serve your own page and capture the response.**
      Run `python3 -m http.server 8000` from inside `~/projects/first-site`, then
      `curl -I http://localhost:8000/index.html`, and paste the response head into `curl_i_local`.
      *You are done when:* `curl_i_local` contains a line beginning `HTTP/1.0 200` **and** a line
      beginning `Server: SimpleHTTP/`.

- [ ] **4. Copy the status line.**
      *You are done when:* `status_line_local`, stripped of surrounding whitespace, equals
      `HTTP/1.0 200 OK`, and the same string is the first non-empty line of `curl_i_local`.

- [ ] **5. Copy the `Content-Type` value.**
      *You are done when:* `content_type_local`, stripped of surrounding whitespace and lowercased,
      equals `text/html`, and `curl_i_local` contains no occurrence of the substring `charset`.

- [ ] **6. Annotate at least six lines.**
      *You are done when:* `annotations` contains at least 6 entries, each with a distinct `LINE:`
      value that appears verbatim as a substring of `curl_v_public`, `curl_i_redirect`, or
      `curl_i_local`, and each with a non-empty `WHAT IT IS:` and a `WHAT IT DOES:` of at least 8
      words.

- [ ] **7. Compare against `file://`.**
      *You are done when:* `file_url_comparison` is at least 30 words and contains both the
      substring `status` and the substring `header` (case-insensitive).

- [ ] **8. Notice what your phone does.** *(Do this last. It is the note Unit 6 starts from.)*
      Type `http://localhost:8000` into your phone's browser on the same Wi-Fi and record what
      happened, including whether a new line appeared in your server's terminal.
      *You are done when:* `phone_result` is at least 20 words and is non-identical to
      `file_url_comparison`.

---

## Rubric

See [`rubric.md`](rubric.md). Four criteria, weights summing to 100. The largest single block after
the captures themselves is the quality of your annotations.

## Tests

See [`tests/`](tests/). Six parsers, weights summing to 100. Run them all with:

```
python3 tests/run_all.py submission.json
```

Each prints `PASS` or a line beginning `FAIL:` naming exactly what is wrong.

---

## Environment

```json
{
  "image": "python:3.14.6-slim",
  "gpu": null,
  "packages": [],
  "compileFlags": [],
  "timeoutMs": 60000
}
```

The tests are pure-stdlib Python parsers and run in that pinned image. Nothing is installed.

**On your own machine, before you start:**

| Requirement | Check | If it is missing |
| --- | --- | --- |
| `python3` | `python3 --version` | Current stable Python is 3.14.6. Any `python3` that runs `-m http.server` is fine — the `Server:` header will name your version. |
| **macOS only:** the command line developer tools | typing `python3` pops a dialog reading *"The "python3" command requires the command line developer tools. Would you like to install the tools now?"* | Run `xcode-select --install` first, which "Opens a user interface dialog to request automatic installation of the command line developer tools." macOS ships no Python runtime of its own — until you do this, `python3` does not exist. |
| `curl` | `curl --version` | Ships with Ubuntu and with WSL's default Ubuntu install. |
| A browser with DevTools | open it, find the **Network** panel | Any current desktop browser. |
| `~/projects/first-site/index.html` | `ls ~/projects/first-site` | Recreate it from Project 1. The server needs a file to serve, and one of the tests exists to catch a submission where it was never created. |
| A phone on the same Wi-Fi as the laptop | — | Needed only for step 8. |
