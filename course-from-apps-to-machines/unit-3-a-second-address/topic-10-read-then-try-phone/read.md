The server is still running. On the laptop, open a browser.

Type `http://localhost:8000` and press Enter.

Your `~/projects/first-site/index.html` should load. That string in the address bar is a **URL**.

A **URL** is the address of a unique resource.

You are looking at your own page, served by the process you started. Next you will read the conversation that produced it. Then you will type the same address on your phone.

## Take the address apart

Read `http://localhost:8000/` from the left.

The first piece is the **scheme**. The scheme is the protocol the browser must use. Here it is `http`.

`://` only joins the scheme to what follows. It is not a name.

Next comes the **host**. The host is which machine is being asked. Here it is `localhost`.

Then a colon and a **port**. A port is the gate on that machine. Here the gate is `8000`.

You have to type `:8000`. Browsers hide the usual HTTP gate, which is port 80. They also hide 443 for `https`. 8000 is neither, so the number stays in the address.

The last `/` is the **path**. The path names the resource on the server. A lone `/` is the default page — your `index.html`.

```widget
{
  "type": "anatomy",
  "title": "The address on your laptop",
  "subject": "Click any piece of `http://localhost:8000/` to name it.",
  "parts": [
    { "text": "http", "label": "scheme", "note": "The protocol the browser must use." },
    { "text": "://" },
    { "text": "localhost", "label": "host", "note": "Which machine is being asked. An IP address may replace a name here." },
    { "text": ":" },
    { "text": "8000", "label": "port", "note": "The gate. You type it because 8000 is not port 80." },
    { "text": "/", "label": "path", "note": "Which resource. A lone `/` is the default page — your `index.html`." }
  ],
  "caption": "Four named pieces. The punctuation only joins them."
}
```

Cover the address with your hand. Uncover one piece at a time and name it. Scheme. Host. Port. Path.

The host is usually a name. An IP address may replace that name.

Split `http://192.168.1.42:8000/` the same way, piece by piece.

- scheme: `http`
- host: `192.168.1.42`
- port: `8000`
- path: `/`

Same four pieces. The host is written as numbers this time.

A piece after `#` is a **fragment**. Add a `#` and some letters on the end if you want to see one. The fragment never reaches the server. The browser keeps it after the page arrives.

## Print the conversation

**HTTP** is a protocol for fetching resources such as HTML documents. It is a client-server protocol. The client starts every exchange.

Your browser is a client. `curl` is a client too. The process on port 8000 is the server.

Clients and servers swap discrete messages, not a stream. The client sends a **request**. The server answers with a **response**.

HTTP is meant to be human-readable. You can print the words and follow them.

Every message has the same four parts.

1. A **start-line**.
2. Optional **headers** — one per line.
3. A blank line, which ends the headers.
4. An optional **body**.

A request's start-line is the **request-line**: method, then the path, then the protocol.

A response's start-line is the **status-line**: protocol, then a three-digit status, then a short phrase.

The server is occupying one terminal. Open a second one.

Against *your* server — the one serving `~/projects/first-site` — run:

```bash
curl -v http://localhost:8000
```

`-v` means verbose. curl prints the conversation around the page.

Scan the output for two marks.

Lines that start with `>` are the request. You sent those.

Lines that start with `<` are the response. The server sent those.

Ignore anything else for now. Find the first `<` line. That is the status-line.

On this server it reads `HTTP/1.0 200 OK`.

The body that follows is `index.html`. Same file you opened as `file://` in Unit 1. This time it arrived as an HTTP response.

```widget
{
  "type": "sequence",
  "title": "One request, one response",
  "actors": ["curl (client)", "your server"],
  "messages": [
    {
      "from": 0,
      "to": 1,
      "label": "a request for `/`",
      "note": "`curl -v` prints this block with `>` — you sent it."
    },
    {
      "from": 1,
      "to": 0,
      "label": "`HTTP/1.0 200 OK`",
      "note": "The status-line. `curl -v` prints it with `<` — the server sent it."
    }
  ],
  "caption": "Two discrete messages. `>` is the request. `<` is the response."
}
```

Below the status-line sit the headers.

**`Content-Type`** names the media type of the body. Yours should show `Content-type: text/html`. That is the HTML of `index.html`.

**`Content-Length`** names how many bytes follow. It is a count, not a grade.

Then a blank line. Then the body — the same markup the browser painted.

Scroll back up the verbose output. Find a `>` line that names a method and a path. That is the request-line. Find the `<` status-line again. One went out. One came back.

If nothing is listening, there is no status-line. curl never starts an HTTP conversation. It prints `curl: (7) Failed to connect… Could not connect to server` and stops. That is a closed gate. It is not a 404.

## Three numbers, two owners

The status is a three-digit code. The first digit is the class.

| First digit | Class | Who has the problem |
| --- | --- | --- |
| `2` (`2xx`) | success | nobody — it worked |
| `4` (`4xx`) | client error | you, the client |
| `5` (`5xx`) | server error | the server |

**200** means the request succeeded. That is the page already in the laptop browser.

Now ask for a path that is not a file in `~/projects/first-site`. Keep `-v` so you can see the marks. Read the first `<` line.

**404** means you asked for a missing path. The server answered. It is working. It does not have that resource.

**500** means the server broke. An unexpected condition stopped it. The path may be fine. The machine on the other end failed.

A 404 is your miss. A 500 is the server's miss.

Reload `http://localhost:8000` in the laptop browser. That request is still 200. A 404 on a missing path does not take the real page down.

## Type it on the phone

Keep the server running. Do not change the URL on the laptop.

Pick up your phone. Open its browser.

Type `http://localhost:8000` exactly. Go.

Wait until it fails. Do not edit the address. Do not switch apps to "fix" it.

It fails.

> **Wait — the laptop shows the page, and the phone cannot open the same address?**
>
> That feels like a typing error, or a broken phone. It is neither. You copied the working address. **localhost means the machine that is asking.** Unit 4 will get this file onto the phone.

Do not change the URL yet. Do not stop the server.

You have read the HTTP conversation for this file. The phone cannot load `http://localhost:8000`. That is the wall.
