# HTTP Field Notes — worksheet

Fill in every `TODO`. Then copy each block into the matching field of `submission.json`.

---

## READ ONLY — do not edit

### The artifact this course has been building

```
~/projects/first-site/index.html
```

You made that file with commands in Unit 1 and have opened it by double-clicking ever since, which
fills the address bar with:

```
file:///home/you/projects/first-site/index.html
```

Three slots in that URL are empty and cannot be filled: a host, a port, and a program listening.
This project is where that file gets a real URL instead of a location.

### The worked annotation — this is the standard

This is one entry, in the exact format the parser expects. Read what the WHAT IT DOES half is doing.

```
- LINE: `Server: SimpleHTTP/0.6 Python/3.14.6`
  SOURCE: curl_i_local
  WHAT IT IS: a response header, sent by the server, part of the head
  WHAT IT DOES: names the software that answered me. It is how I can tell this response came from
    my own machine and not from a site on the internet — and it quietly hands anyone who asks the
    Python version I am running, which I did not choose to publish and cannot switch off.
```

Four rules the parser enforces on every entry:

1. `LINE:` is wrapped in backticks and appears **verbatim** somewhere in one of your three captures.
2. `SOURCE:` is one of `curl_v_public`, `curl_i_redirect`, `curl_i_local`.
3. `WHAT IT IS:` is not empty.
4. `WHAT IT DOES:` is at least 8 words.

The parser cannot tell whether your WHAT IT DOES half is any good. The rubric can. Do not restate
the line.

---

## TODO A — `curl_v_public`

Run `curl -v https://example.com` and paste **all** of the output below, `>` and `<` markers intact.

```
TODO A: paste here
```

## TODO B — `curl_i_redirect`

Find a URL that answers with a status code between `300` and `399`. Screen candidates fast:

```
curl -s -o /dev/null -w '%{http_code}\n' https://example.com
```

Then run `curl -I` against the one you found and paste the whole response head.

```
TODO B: paste here
```

**Which URL did you use?**

```
TODO B (url): write it here
```

## TODO C — `curl_i_local`

```
cd ~/projects/first-site
python3 -m http.server 8000
```

Leave it running. In a second terminal:

```
curl -I http://localhost:8000/index.html
```

Paste the whole response head.

```
TODO C: paste here
```

## TODO D — `status_line_local`

The first line of TODO C, on its own. Its grammar is `<protocol> <status-code> <reason-phrase>`.

```
TODO D: paste here
```

## TODO E — `content_type_local`

The **value** of the `Content-Type` header from TODO C. Value only — no header name, no colon, no
trailing spaces. Character for character.

```
TODO E: paste here
```

## TODO F — `annotations`

At least six entries, in the format of the READ ONLY worked example above. Every `LINE:` must appear
verbatim in TODO A, TODO B, or TODO C. Spread them across all three captures.

```
- LINE: `TODO F1`
  SOURCE:
  WHAT IT IS:
  WHAT IT DOES:

- LINE: `TODO F2`
  SOURCE:
  WHAT IT IS:
  WHAT IT DOES:

- LINE: `TODO F3`
  SOURCE:
  WHAT IT IS:
  WHAT IT DOES:

- LINE: `TODO F4`
  SOURCE:
  WHAT IT IS:
  WHAT IT DOES:

- LINE: `TODO F5`
  SOURCE:
  WHAT IT IS:
  WHAT IT DOES:

- LINE: `TODO F6`
  SOURCE:
  WHAT IT IS:
  WHAT IT DOES:
```

Lines worth considering, if you are stuck on where to look:

- the first `>` line of TODO A — the request line, three slots
- the `>` line beginning `Host:` — the one header HTTP/1.1 makes compulsory
- the first `<` line of TODO A — the status line, with the code in the middle slot
- the status line of TODO B — a first digit that is not `2`
- any line of TODO C you did not expect to be there

## TODO G — `file_url_comparison`

Double-click `index.html` so the address bar reads
`file:///home/you/projects/first-site/index.html`. Open DevTools, go to the **Network** panel,
reload, and look at the Status column and the response headers.

Then compare against your TODO C capture. Name **both** things `file://` does not have, name at
least one header from your own capture as the contrast, and say *why* — what would have had to
happen for a status code to exist at all.

```
TODO G: write here (at least 30 words)
```

## TODO H — `phone_result`

Do this last, after everything above is filled in and your server is still running.

Pick up your phone. Same Wi-Fi as the laptop. Type into its browser:

```
http://localhost:8000
```

Write down what actually happened: what the phone's screen showed, what the laptop showed at the
same URL, and whether a new line appeared in the terminal where your server is running.

Report it. Do not fix it.

```
TODO H: write here (at least 20 words)
```
