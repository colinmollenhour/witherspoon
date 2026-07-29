# Anatomy of a URL

**Unit:** 5 — HTTP: reading the conversation, and joining it
**Objectives (unit-numbered):**
1. Break `http://192.168.1.42:8000/about/index.html?v=2#top` into its scheme, host, port, path, query, and fragment.   [obj 1]
2. State which part of a URL the server never receives, and why the fragment is applied by the browser after the response arrives.   [obj 2]
3. Compare a `file:///home/you/projects/first-site/index.html` URL with an `http://` one and name the three things the `file://` form has no room for: a host, a port, and a server.   [obj 3]

## Topic generation prompt

The learner has an address bar full of `file:///home/you/projects/first-site/index.html` from Project 1
and has spent two units learning that machines have addresses and ports. This topic joins those two
facts. Take the URL apart piece by piece against MDN's structure, quoting the scheme [src 99] and
authority [src 100] passages. The two load-bearing quotes are MDN's — that an IP address may stand in
for a domain [src 101], which is what licenses `http://192.168.1.42:8000` in Unit 6, and the "technical
'gate'" passage explaining why a non-default port is mandatory [src 102]. Both were already met in
Topic 13; here they become part of a URL's grammar. Then the fragment: quote MDN's statement that it is
never sent to the server [src 104] — this is a genuine surprise and a strong quiz item, since the
fragment is visibly in the address bar. Then the comparison the whole course is built around. Put the
two URLs side by side and go field by field: the `http://` one has a host, a port, and a program
listening; the `file://` one has none of those, because nothing is being asked of anyone — the browser
is reading a disk directly. Use MDN's observation that a URL path was once a literal file path and is
now an abstraction [src 103] to show these two forms are historically the same idea diverging. Name,
without resolving it, why this matters: the `file://` URL is an instruction to read *the reader's own
disk*, which is why sending it to a friend does nothing [src 168].

Do NOT explain requests, responses, methods, or headers (Topic 16). Do NOT explain status codes
(Topic 17). Do NOT start a server (Topic 18).

## Grounded facts

- "A **URL** (Uniform Resource Locator) is the address of a unique resource on the internet." [src 98]
- Scheme: "The first part of the URL is the _scheme_, which indicates the protocol that the browser must use to request the resource" [src 99]
- Authority: "the _authority_, which is separated from the scheme by the character pattern `://`. If present the authority includes both the _domain_... and the _port_ (`80`), separated by a colon" [src 100]
- **An IP may replace the domain**: "Usually this is a domain name, but an IP address may also be used (but this is rare as it is much less convenient)." [src 101]
- **The port as a gate**: "The port indicates the technical \"gate\" used to access the resources on the web server. It is usually omitted if the web server uses the standard ports of the HTTP protocol (80 for HTTP and 443 for HTTPS)... Otherwise it is mandatory." [src 102]
- Path was once literal: "In the early days of the Web, a path like this represented a physical file location on the Web server. Nowadays, it is mostly an abstraction handled by Web servers without any physical reality." [src 103]
- **The fragment never reaches the server**: "It is worth noting that the part after the **#**, also known as the **fragment identifier**, is never sent to the server with the request." / "The fragment is not sent to the server when the URI is requested; it is processed by the client (e.g., the browser) after the resource is retrieved." [src 104]
- The address bar needs an absolute URL [src 105]
- A `file://` URL is not shareable: "If the address contains a drive letter (usually C://), you've accidentally linked to a file on your computer, not on the server" — "**Such a link will work only on your computer.**" [src 168]
- Teach from: MDN "What is a URL?" — the Scheme, Authority, Path, and Anchor sections [src 98–105]

## Requested activities

- READ: 900–1100 words. Dissect the example URL field by field. Quote [src 101] and [src 102] directly. The fragment surprise via [src 104]. Then the `file://` vs `http://` side-by-side, using [src 103] to show they are the same idea diverged. Name the sharing problem [src 168] without solving it. Ends with the learner able to read any URL as six labelled parts.
- FLASHCARDS: 10 cards. Scheme; host; port; path; query; fragment; the default port for `http://`; the default port for `https://`; what the server never receives; what `file://` lacks.
- QUIZ: 5 questions on labelling parts of a supplied URL, deciding whether a given URL needs an explicit port, identifying what the server receives from a URL containing `#`, and explaining what is missing from a `file://` URL. Use distractor [src 168] — that a `file://` URL can be sent to someone else — and [src 104]'s fragment surprise.

## Handoff

**Inherits:** The learner can list listening ports, knows their LAN IP, and can diagnose a closed port. `index.html` is generated by commands and opens as `file://`.
**Leaves:** The learner can read any URL as six labelled parts and can say precisely what a `file://` URL lacks.
**Do not cover:** Requests and responses (Topic 16). Status codes and headers (Topic 17). Running a server (Topic 18).
