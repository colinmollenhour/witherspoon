# Your first server

Every time you have opened `~/projects/first-site/index.html` so far, you double-clicked it or pasted
`file:///home/you/projects/first-site/index.html` into the address bar. Nobody answered. The browser
walked to that spot on your disk and read the bytes itself — no request, no status code, no headers,
because there was no second party in the conversation. You have spent this unit reading other
people's HTTP. One command puts your own file on the other end of it.

## Start it

Two lines. The first one is the load-bearing one:

```
cd ~/projects/first-site
python3 -m http.server 8000
```

The terminal answers:

```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

Then it stops. No new prompt appears, and nothing you type does anything useful. That is correct —
the program has not finished, it is *running*, sitting there waiting to be asked something. When you
want it to stop, press `Ctrl-C` and it prints `Keyboard interrupt received, exiting.` and gives your
prompt back.

Type `python3`, not `python`. Python 2's server module is gone: asking for it gets you
`ModuleNotFoundError: No module named 'SimpleHTTPServer'`. On a Mac, `python3` may pop a dialog
reading *"The "python3" command requires the command line developer tools. Would you like to install
the tools now?"* — macOS ships no Python runtime of its own. Say yes, or run `xcode-select --install`
first.

The `8000` is optional: "The server listens to port 8000 by default." Type it anyway — you have to put
that number into a browser in a moment.

## Load it

In your browser: `http://localhost:8000`

Your page appears. Same file, same bytes, same pixels — but this is the first time that file has ever
had a **URL** rather than a location. Something asked for it, something answered, and this time there
was a status code involved.

That `cd` you did first is the entire reason it worked. The documentation: "By default, the server
uses the current directory," and "The request is mapped to a local file by interpreting the request as
a path relative to the current working directory." The server has no configuration file and no notion
of a website. It serves the folder it was standing in when you started it, and every path in every URL
is measured from there.

One honest warning while you have it running: "http.server is not recommended for production. It only
implements basic security checks." The concrete reason is that it "will follow symbolic links when
handling requests which makes it possible for files outside of the specified directory to be served."
This is a teaching and development tool. It is not what runs a real site.

## Read the log

Now ask it for something that does not exist. Visit `http://localhost:8000/nope`, and watch the
terminal where the server is running:

```
127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -
```

That is one line per request, and every field is something you already know how to read:

| Field | Value here | What it is |
| --- | --- | --- |
| Client address | `127.0.0.1` | Who asked. Loopback — the request came from this machine |
| Identity | `-` | Two obsolete fields, always blank on this server |
| Timestamp | `[29/Jul/2026 04:26:16]` | Local time, with no timezone marker at all |
| Request line | `"GET /nope HTTP/1.1"` | The method, the path, and the version the *client* spoke |
| Status | `404` | What the server sent back |
| Size | `-` | Always `-` on this server. Never a byte count |

You caused that line. You typed a path, the browser turned it into a `GET`, and the server wrote down
what it did about it. Reload the page you actually have and a new line appears with `200` in the same
column.

Two details in that line are worth stopping on.

**The log goes to stderr; the banner went to stdout.** They are different output streams from the same
program, which is why redirecting one of them to a file leaves the other one still scrolling on your
screen. This is the first time that distinction has paid for itself: the startup message is output,
the request log is diagnostics, and Python treats them as separate channels.

**The log says `HTTP/1.1` but the server does not speak it.** That version in quotes is copied out of
the request — it is your browser's version, echoed back. Python's server answers in HTTP/1.0, which is
hard-coded as `protocol_version = "HTTP/1.0"`, and the docs are blunt about why: "For backwards
compatibility, the setting defaults to `'HTTP/1.0'`." Two versions, one line of output, and neither is
a mistake.

## See the response

The log shows what the server *did*. To see what it actually *said*, ask it yourself:

```
curl -I http://localhost:8000/index.html
```

```
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.14.6
Date: Wed, 29 Jul 2026 04:26:16 GMT
Content-type: text/html
Content-Length: 31
Last-Modified: Wed, 29 Jul 2026 04:23:59 GMT
```

There it is: `HTTP/1.0 200 OK`, exactly as promised. `Server:` names the software and quietly leaks
the Python version. `Content-Length` is the size of the served file in bytes — this capture is from a
reference machine, so your own number will differ; what matters is that it matches your file, not that
it reads 31. `Last-Modified` is the
moment you last saved it — the filesystem timestamp, handed to the browser as HTTP metadata.

And be precise about this line, because it is not what most people expect:

```
Content-type: text/html
```

No charset. A real `.html` file on disk gets `Content-type: text/html` and nothing more. The
`; charset=utf-8` you may have seen appears only on pages this server *generates* itself — the
directory listing and the 404 page — not on files it reads off your disk.

## Now do it the old way

Open the same file by double-clicking it, so the address bar reads
`file:///home/you/projects/first-site/index.html`. The page looks identical. Open DevTools, go to the
Network tab, and reload.

| | `file://` | `http://localhost:8000` |
| --- | --- | --- |
| Status code | none | `200` |
| Response headers | none | `Server`, `Date`, `Content-type`, `Content-Length`, `Last-Modified` |
| Server log line | none | `127.0.0.1 - - [...] "GET / HTTP/1.1" 200 -` |
| Who read the disk | your browser | the server |

There is no status code over `file://` because there is no *status* — nothing was asked, so nothing
answered. A status code is a server's verdict on a request. With no server there is no request, no
verdict, and no headers to describe a response that never existed. The browser opened a file, the way
a text editor opens a file.

## Why `index.html` and not something else

You typed `http://localhost:8000` with no filename, and got your page. That is a rule, not luck:

> "If the request was mapped to a directory, the directory is checked for an index page as specified
> by `index_pages`. If found, the file's contents are returned; otherwise a directory listing is
> generated"

`index_pages` "Defaults to `("index.html", "index.htm")`." So `/` means "the folder I was started in",
the server looks inside it for `index.html`, and finds yours. Rename your file to `home.html` and
reload: you get a clickable list of filenames instead — and *that* page is the generated one carrying
`Content-type: text/html; charset=utf-8`. `index.html` is not a magic filename in HTML. It is a
default that servers agree to look for.

## Take out your phone

Your page is live. Prove it to someone. Pick up your phone, make sure it is on the same Wi-Fi as your
laptop, and type into its browser:

`http://localhost:8000`

It fails. Not slowly, not partially — it will not load at all, while the laptop sitting next to it
loads the same URL instantly.

> **Wait — the laptop loads it. Why doesn't the phone?**
> You did everything right. The server is running, it is bound to every interface, and your laptop
> loads the page perfectly. But `localhost` does not mean "the computer running the server" — it means
> **"the computer that is asking."** Your phone typed `localhost`, so your phone asked *itself*, found
> nothing listening, and gave up. It never sent a single packet to your laptop. Unit 6 gives your
> laptop an address your phone can actually reach.
