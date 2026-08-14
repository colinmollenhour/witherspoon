The page is still at `~/projects/first-site/index.html`. Open a terminal. Stand in that folder.

```bash
cd ~/projects/first-site
```

You already know 8000 is the door. Nothing is listening there yet.

Start a server. A **server** is a program that answers when a browser asks for a page.

```bash
python3 -m http.server 8000
```

`python3` is the Python program. `-m http.server` runs the HTTP server that ships with it. `8000` is the door.

> **On a Mac.** If a dialog asks to install command line tools, run `xcode-select --install`, then try again.
>
> **On Windows / WSL.** `python3` is already there. Type the same command.

The prompt does not come back. That is correct. The program is running, not finished.

The first line it prints is the **banner**. The banner is the server announcing it is up:

```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

**HTTP** is the conversation a browser and a server use. Read the port on that line. The rest of the line can wait.

Leave this terminal open. Open a browser. Type this in the address bar, then press Enter:

`http://localhost:8000`

**localhost** is this machine, talking to itself. Your page should load. Same `index.html`. New address. This is the first time that file has an `http://` URL.

Look at the bar. There is no `/home/you/projects/first-site` in it. The disk path is gone. The server is the one that still knows the folder.

Keep the old `file://` tab if you still have it. Do not close the server. Do not try a phone.

## The folder is the site

The server serves the **current working directory**. That is the folder you stood in when you started it. Not the folder named in the URL. The folder you stood in.

The URL path maps onto a file in that folder. `/` means the folder itself.

When the request is a folder, the server looks for an index page. The names it tries are `index.html` and `index.htm`. That is why `http://localhost:8000` shows your page, not a list of names. You asked for `/`. The server found `index.html` and sent those bytes.

Type `http://localhost:8000/index.html` if you want the file named. The log path becomes `/index.html`. Same page. The slash alone was enough because of that index name.

Start the same command from home and you serve home. The banner still looks fine. The door is still 8000. The page is wrong, because `index.html` in `first-site` is not in home. Stand in `~/projects/first-site` first. Then start it.

A double-click never started this conversation. That is why the local server is not optional for an `http://` address. The file on disk is the same. The way it is reached is not.

## The log line

Look back at the server terminal. A new line appeared when the browser loaded the page. That line is an **access log**. An access log is a record of one request.

Yours will have this shape:

```
127.0.0.1 - - [29/Jul/2026 04:26:16] "GET / HTTP/1.1" 200 -
```

Your clock prints a different stamp. The rest should match. `200` is the status this load got.

```widget
{
  "type": "anatomy",
  "title": "One access-log line",
  "subject": "Click any piece of the line.",
  "parts": [
    { "text": "127.0.0.1", "label": "who asked", "note": "This laptop. The request came from here." },
    { "text": " - - [" },
    { "text": "29/Jul/2026 04:26:16", "label": "when", "note": "Local time, with no timezone. Your clock will print a different stamp." },
    { "text": "] \"" },
    { "text": "GET", "label": "method", "note": "The kind of ask. GET means give me this." },
    { "text": " " },
    { "text": "/", "label": "path", "note": "The folder. The server maps this onto a file in the folder you started in." },
    { "text": " " },
    { "text": "HTTP/1.1", "label": "what the browser asked", "note": "The log copies the client's version of the conversation." },
    { "text": "\" " },
    { "text": "200", "label": "status", "note": "The server's short answer. This is the status you got for this load." },
    { "text": " " },
    { "text": "-", "label": "size", "note": "This field is always a dash on this server." }
  ],
  "caption": "Method, path, status — the three tokens that match what you just did."
}
```

**GET** is the **method**. A method is the kind of ask. GET means give me this.

`/` is the **path**. A path is the file or folder that was asked for.

`200` is the **status**. A status is the server's short answer to that ask.

The quoted request is what the browser sent. The number after it is what the server answered. Read those three tokens against what you just did. You asked to GET `/`. The server answered `200`.

Reload the `http://` tab. Another line appears. Same shape. One request, one line. If you see no line, the load did not reach this server. Check you typed `http://`, not `file://`.

The banner went to **stdout**. Stdout is the stream a program prints to, unless you send it somewhere else. Each log line went to **stderr**. Stderr is the stream programs use for logs and errors. Both still land in this terminal.

## The other tab

Switch to the old tab. The address starts `file://`. It still names the file on disk. Reload it.

The server terminal prints no new line. There is no status on that tab. The browser opened a file on disk. Nothing answered. No method. No path asked of a server. No `200`.

```widget
{
  "type": "compare",
  "title": "Same page, two tabs",
  "columns": [
    { "label": "`file://` tab" },
    { "label": "`http://localhost:8000`" }
  ],
  "rows": [
    { "aspect": "What opened", "cells": ["A file on this disk", "A request to the server"] },
    { "aspect": "Status", "cells": ["None", "`200` in the log"] },
    { "aspect": "Access log", "cells": ["No new line", "One line for this load"] }
  ],
  "caption": "Same `index.html`. Only the `http://` load has a status."
}
```

A `file://` address names a file on this computer. Sending that address to someone else does nothing useful. Their machine does not have your path. The `http://` tab has a conversation. Same bytes. Only one of them has a status.

That is why a double-click is not a server. The file opened. Nobody answered.

Leave the server running. The page is live at `http://localhost:8000` on this laptop. Stay on this machine. The phone comes later.

To stop the server later, click the server terminal and press Ctrl-C. You should see:

```
Keyboard interrupt received, exiting.
```

The prompt comes back. Port 8000 is a door with no program behind it again. For now, start it if you stopped it. Leave `http://localhost:8000` showing the page.
