# Anatomy of a URL

Your `index.html` sits in `~/projects/first-site/`. Double-click it and the browser opens it, and the
address bar fills with this:

```
file:///home/you/projects/first-site/index.html
```

You have spent two units learning that machines have addresses and that addresses have numbered ports.
That address bar is where those two facts meet the file you made — and reading it correctly already
tells you what your page is missing.

## Six parts, in a fixed order

"A **URL** (Uniform Resource Locator) is the address of a unique resource on the internet." [src 98]

Here is the address you will type into a phone in Unit 6, taken apart:

```
http://192.168.1.42:8000/about/index.html?v=2#top
└┬─┘   └────┬─────┘ └┬─┘└───────┬───────┘└┬─┘└─┬┘
scheme    host     port       path      query fragment
```

Every URL you have ever seen is some subset of those six slots, always in that order.

### Scheme — how to go get it

"The first part of the URL is the _scheme_, which indicates the protocol that the browser must use to
request the resource" [src 99].

A **protocol** is an agreed set of rules for an exchange. `http` means *talk to a machine over the
network using HTTP*. `file` means *open something on this disk*. The scheme decides how every character
after it gets interpreted.

### Host — which machine

"Next follows the _authority_, which is separated from the scheme by the character pattern `://`. If
present the authority includes both the _domain_ (e.g., `www.example.com`) and the _port_ (`80`),
separated by a colon" [src 100].

The **authority** is the *who* — the machine you are addressing and the gate on it. And here is the
sentence that makes the rest of this course possible:

> "The domain indicates which Web server is being requested. Usually this is a domain name, but an IP
> address may also be used (but this is rare as it is much less convenient)." [src 101]

Rare, less convenient, and entirely legal. You do not own a domain name and you do not need one. The
LAN IP you found in Unit 4 goes straight into the host slot, and `http://192.168.1.42:8000` is an
ordinary URL — not a hack, not a shortcut.

### Port — which gate on that machine

The second sentence you should memorise:

> "The port indicates the technical \"gate\" used to access the resources on the web server. It is
> usually omitted if the web server uses the standard ports of the HTTP protocol (80 for HTTP and 443
> for HTTPS) to grant access to its resources. Otherwise it is mandatory." [src 102]

Read the last three words again. Not *helpful*. **Mandatory.** You never type a port on a normal website
because the browser fills in the default gate for the scheme — 80 for `http`, 443 for `https`. Port 8000
is not a default for anything, so leaving `:8000` off does not mean "guess": the browser knocks on gate
80 instead, where nobody is listening.

### Path — which thing on that machine

`/about/index.html`. It looks exactly like a folder path from Unit 1, and that is not an accident:

> "`/path/to/myfile.html` is the path to the resource on the Web server. In the early days of the Web,
> a path like this represented a physical file location on the Web server. Nowadays, it is mostly an
> abstraction handled by Web servers without any physical reality." [src 103]

Hold on to that. A path *used to be* a disk location and now merely *resembles* one. That resemblance is
the hinge of this entire topic.

### Query — extra input carried along

`?v=2` — everything after the first `?`, written as `name=value` pairs. It rides along with the path as
part of what you are asking for. What `v=2` *means* is up to the machine at the other end; your browser
carries it there unread.

### Fragment — the part nobody else ever sees

`#top`. And here is the genuine surprise:

> "It is worth noting that the part after the **#**, also known as the **fragment identifier**, is never
> sent to the server with the request." [src 104]

MDN says it a second way, in case you thought you misread: "The fragment is not sent to the server when
the URI is requested; it is processed by the client (e.g., the browser) after the resource is
retrieved." [src 104]

Sit with how strange that is. `#top` is visibly in your address bar — you can copy it, mail it, bookmark
it — and the machine at `192.168.1.42` will never hear about it. Your browser cuts the URL at the `#`,
asks for everything to the left of it, waits for the whole page to arrive, and *only then* jumps to the
piece named `top`. The fragment is an instruction to your own browser about a page it already holds. Two
URLs differing only after the `#` are, to the far machine, the same URL.

## The comparison this whole course is built on

Now put your two addresses side by side and go slot by slot.

| Slot | `http://192.168.1.42:8000/about/index.html?v=2#top` | `file:///home/you/projects/first-site/index.html` |
|---|---|---|
| Scheme | `http` — fetch it over the network | `file` — read it off a disk |
| Host | `192.168.1.42` | **none** — empty between `//` and `/` |
| Port | `8000` | **none** — there is no gate to knock on |
| Path | `/about/index.html` | `/home/you/projects/first-site/index.html` |
| Query | `v=2` | none |
| Fragment | `top` — applied by your browser | possible, and also applied by your browser |
| Who answers | **a program listening on gate 8000** | **nobody** — the browser opens the file itself |

Three cells are empty, and they are the three that matter: a host, a port, and a program listening. They
are not *omitted* from the `file://` form — there is no room for them, because nothing is being asked of
anyone. That is why the URL carries three slashes in a row: the authority slot exists and is blank.
Nobody is being addressed. Your browser is reading your disk directly, the way a photo app reads a photo.

[src 103] tells you these two forms are one idea that diverged. A path once *was* a file location; on
`file://` it still literally is, while on `http://` it has become a request handed to a machine that
decides for itself what to do with it.

## What you cannot do with it yet

Message that `file://` line to a friend and watch nothing happen. It is not an address *of your page* —
it is an instruction to open `/home/you/projects/first-site/index.html` **on the reader's own disk**,
where no such file exists. This is a documented, ordinary student failure: "If the address contains a
drive letter (usually C://), you've accidentally linked to a file on your computer, not on the server" —
"**Such a link will work only on your computer.**" [src 168]

It is also why the address bar demands the whole thing: "In your browser's address bar, a URL doesn't
have any context, so you must provide a full (or _absolute_) URL" [src 105]. There is nothing for a
partial address to be relative *to*.

You can now read any address bar as six labelled parts and say precisely what your page's current URL
lacks: a host, a port, and something listening. Next you will look at what actually crosses between two
machines — the message a browser sends, and the message that comes back.
