# Quiz — Anatomy of a URL

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

— MULTIPLE_CHOICE

You are handed `http://192.168.1.42:8000/about/index.html?v=2#top`. A classmate tells you the host is
`192.168.1.42:8000`. Who is right, and why?

- Your classmate — everything between `://` and the first `/` is the host, colon included.
- Nobody — a numeric address cannot be a host, so this URL has no host at all.
- `192.168.1.42:8000` is the *authority*. The host is `192.168.1.42` and the port is `8000`, separated by a colon.
- Your classmate — but only because the host here is an IP address; with a domain name the port would be part of the path.

**Correct option index:** 2

**Explanation:**

MDN describes "the _authority_, which is separated from the scheme by the character
pattern `://`. If present the authority includes both the _domain_ (e.g., `www.example.com`) and the
_port_ (`80`), separated by a colon" — so the chunk your classmate pointed at is the authority, which
contains two separate slots. A is the common merge: it names the right span of characters but collapses
two fields into one, and you cannot change the gate without knowing which half to edit. B contradicts
MDN directly — "an IP address may also be used" in place of a domain name, which is exactly what makes
`http://192.168.1.42:8000` legal. D invents a rule: the port is written the same way after a domain name
as after an IP address, and it is never part of the path — the path begins at the first `/` after the
authority (objective 1).

---

## Question 2

**Type:** MULTIPLE_CHOICE

— MULTIPLE_CHOICE

Each address below is paired with the gate its service is actually listening on. Which address will
**fail** to reach its service?

- `https://www.example.com/index.html` — service listening on 443
- `http://www.example.com/index.html` — service listening on 80
- `http://192.168.1.42/about/index.html` — service listening on 8000
- `http://192.168.1.42:8000/about/index.html` — service listening on 8000

**Correct option index:** 2

**Explanation:**

The port "is usually omitted if the web server uses the standard ports of the HTTP
protocol (80 for HTTP and 443 for HTTPS) to grant access to its resources. Otherwise it is mandatory."
A and B omit the port safely, because each one's service sits on exactly the standard gate its scheme
implies — 443 for `https`, 80 for `http`. D types the non-standard gate out in full, which is what the
rule demands. C omits a port that is *not* standard, so the browser does not guess 8000; it fills in the
`http` default of 80 and knocks on a gate where nothing is listening. Omitting a port never means "find
it for me" (objective 1).

---

## Question 3

**Type:** TRUE_FALSE

— TRUE_FALSE

You load `http://192.168.1.42:8000/about/index.html?v=2#top`. The `#top` is sent to the machine at
`192.168.1.42` so that it can send back just that section of the page.

**Correct answer:** false

**Explanation:**

The opposite is true — the fragment is the one visible part of the address that the far
machine never sees. "It is worth noting that the part after the **#**, also known as the **fragment
identifier**, is never sent to the server with the request." The reason it feels wrong is that `#top` is
sitting right there in the address bar, so it looks like it must travel with everything else. It does
not: "The fragment is not sent to the server when the URI is requested; it is processed by the client
(e.g., the browser) after the resource is retrieved." The whole page arrives first, and only then does
your browser jump to the piece named `top`. The `?v=2` in the same address *is* sent — the cut happens
at the `#`, not at the `?` (objective 2).

---

## Question 4

**Type:** MULTIPLE_CHOICE

— MULTIPLE_CHOICE

You message `file:///home/you/projects/first-site/index.html` to a friend who is sitting in another
building on another machine. They tap it. What happens?

- Their browser fetches your page across the network from your computer.
- Their browser tries to open that path on their own disk, finds nothing there, and shows an error.
- It works — the URL is absolute, and absolute URLs work from anywhere.
- Their browser prompts them for your machine's IP address, then fetches the page from it.

**Correct option index:** 1

**Explanation:**

A `file://` URL is an instruction to read a path on *the reader's own disk*, and your
friend has no `/home/you/projects/first-site/`, so there is nothing to open. This is a documented
student failure: a link like this "will work only on your computer." A is the belief the whole course
exists to correct — nothing in that URL names a machine, so there is no computer for the browser to
fetch from. C confuses two different ideas: the URL *is* absolute, which is what the address bar
requires, but absolute means "complete", not "reachable by anyone". D imagines a step no browser
performs; a URL has one host slot, it is empty here, and nothing prompts to fill it in (objective 3).

---

## Question 5

**Type:** SHORT_ANSWER

— SHORT_ANSWER

Put `http://192.168.1.42:8000/about/index.html?v=2#top` next to
`file:///home/you/projects/first-site/index.html` and go slot by slot. Name the three things the
`file://` form has no room for, and say why it has no room for them.

scheme and a path, but `file` means "open this off a disk" while `http` means "ask a machine over the
network", so the `file://` form leaves the authority slot — the part that would hold `192.168.1.42:8000`
— completely blank, which is why it shows three slashes in a row. There is no host because no machine is
being addressed, no port because there is no gate to knock on, and no program answering because the
browser reads the file itself. The `http://` form needs all three: an address for the machine, a gate on
it, and something listening behind that gate.

**A grader must see:**

**Sample answer:**

The `file://` URL has no host, no port, and nothing listening. Both URLs have a
scheme and a path, but `file` means "open this off a disk" while `http` means "ask a machine over the
network", so the `file://` form leaves the authority slot — the part that would hold `192.168.1.42:8000`
— completely blank, which is why it shows three slashes in a row. There is no host because no machine is
being addressed, no port because there is no gate to knock on, and no program answering because the
browser reads the file itself. The `http://` form needs all three: an address for the machine, a gate on
it, and something listening behind that gate.

**A full-credit answer shows:**

1. All three named — a host, a port, and a program listening / a server.
2. The reason, not just the list: nothing is being asked of anyone, because `file` tells the browser to read a disk rather than to request something over the network.
3. Recognition that the two URLs do share a scheme and a path — the `file://` form is not "a broken URL", it is a complete URL of a different shape.

**Explanation:**

Full credit needs the three empty slots *and* the reason they are empty. A learner who
answers "it's missing `http`" has spotted a difference but not understood it — swapping the scheme
changes nothing on its own, because there is still no machine named and no gate given. A learner who
answers "it's missing the internet" has the intuition without the parts. The point of the slot-by-slot
comparison is that these two addresses are the same idea diverged: the path in a `file://` URL still
literally is a disk location, while a path in an `http://` URL "is mostly an abstraction handled by Web
servers without any physical reality" (objectives 1, 3).
