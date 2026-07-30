# Quiz — Names become addresses

<!-- Rendered from course.json by course-template/tools/render-views.mjs.
     Edit course.json, then re-render. Edits here are overwritten. -->

## Question 1

**Type:** MULTIPLE_CHOICE

On a Linux machine, `grep ^hosts /etc/nsswitch.conf` prints:

```
hosts:          files mdns4_minimal [NOTFOUND=return] dns myhostname
```

You add the line `127.0.0.1   first-site` to `/etc/hosts`. A program on that machine then looks up
`first-site`, and a moment later looks up `example.com`. What happens?

- Both lookups go to a DNS server first; `/etc/hosts` is only used as a fallback when DNS comes back empty.
- `first-site` is answered from `/etc/hosts` with no network request at all; `example.com` is not in the file, so the lookup falls through to `dns`.
- Both are answered from `/etc/hosts`, because once `files` is consulted the lookup stops there regardless of what it found.
- Neither name resolves until the machine is restarted, because `/etc/hosts` is only read at startup.

**Correct option index:** 1

**Explanation:**

The `hosts:` line lists sources in the order they are tried, and `files` — which
means `/etc/hosts` — comes before `dns` [src 69]. So `first-site` is found in the file and the lookup
ends there, on disk. `example.com` is not in the file, so the file simply has no answer and the next
source, `dns`, is asked. The first option reverses the order, which is the most common version of
this mistake: DNS is not the first stop, it is the fallback. The third option confuses "consulted
first" with "answers everything" — a source that has no entry for a name yields nothing and the
search continues. The fourth invents a restart requirement; the file is read when a lookup happens,
not cached from boot (objective 6).

---

## Question 2

**Type:** MULTIPLE_CHOICE

You run `dig +short example.com` and it prints something. What did it print?

- The full DNS report: the question asked, each section of the reply, the query time, and the server that answered.
- The address or addresses that the name resolves to, one per line, and nothing else.
- The HTML of the page that lives at that address.
- A round-trip time proving the machine at that address is switched on and responding.

**Correct option index:** 1

**Explanation:**

`+short` reduces `dig`'s output to the answer itself — one address per line, with
no surrounding report. The first option describes what bare `dig` prints, which is exactly what
`+short` suppresses. The third confuses resolving a name with fetching a document: `dig` converts a
name into a number and stops; it never asks the machine at that address for anything. The fourth
confuses resolution with a reachability test — an address that resolves may belong to a machine that
is switched off, unplugged, or refusing you (objective 4).

---

## Question 3

**Type:** MULTIPLE_CHOICE

You are on Ubuntu under WSL. `which dig` prints nothing. Which command installs it, naming the
package that actually provides `/usr/bin/dig`?

- `sudo apt install dig`
- `sudo apt install bind9-dnsutils`
- `sudo apt install dnsutils`
- `brew install bind9-dnsutils`

**Correct option index:** 1

**Explanation:**

`dpkg -S /usr/bin/dig` reports `bind9-dnsutils`, and `dig` is absent from the
Ubuntu WSL manifest, so it must be installed [src 73]. `sudo apt install dig` asks for the command's
name; `apt` wants the package's name, and those are not the same thing here. `dnsutils` is close
enough to be tempting and it is what most older tutorials say, but it is only a "Transitional package
for bind9-dnsutils" [src 73] — a redirect left behind by a rename, not the package itself. `brew` is
macOS's package manager, and it is the wrong answer twice over: it is not present on a stock Ubuntu
or WSL system, and macOS already ships `dig` so nothing needs installing there [src 71]
(objective 4).

---

## Question 4

**Type:** TRUE_FALSE

`localhost` works on every computer because a DNS server out on the internet holds a record saying
that the name `localhost` means `127.0.0.1`.

**Correct answer:** false

**Explanation:**

The opposite is true — no server is involved at all. `localhost` is defined locally,
by the line `127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4` in
`/etc/hosts` on that machine [src 68], and `files` is consulted before `dns` [src 69], so the lookup
never leaves the disk. This also matters for what `localhost` *means*: because the definition lives
on each machine separately, `localhost` is not one shared computer that everyone can reach — it names
whichever machine is doing the resolving (objective 5).

---

## Question 5

**Type:** SHORT_ANSWER

Your Wi-Fi is switched off and the Ethernet cable is unplugged. `dig +short example.com` gives you
nothing back, but `localhost` still resolves to `127.0.0.1` perfectly well. Explain the difference.

`dns`, which requires sending a query over the network — and there is no network, so no answer comes
back. `localhost` is different: it is written down in `/etc/hosts` on this machine, on the line
`127.0.0.1   localhost ...`. The `hosts:` line in `/etc/nsswitch.conf` puts `files` before `dns`, so
`/etc/hosts` is read first, the name is found there, and the lookup finishes on local disk without a
single packet being sent.

**A strong answer covers:**

**Sample answer:**

`example.com` is not listed in `/etc/hosts`, so resolving it falls through to
`dns`, which requires sending a query over the network — and there is no network, so no answer comes
back. `localhost` is different: it is written down in `/etc/hosts` on this machine, on the line
`127.0.0.1   localhost ...`. The `hosts:` line in `/etc/nsswitch.conf` puts `files` before `dns`, so
`/etc/hosts` is read first, the name is found there, and the lookup finishes on local disk without a
single packet being sent.

**A full-credit answer shows:**

1. `localhost` is defined in the local file `/etc/hosts`, mapped to `127.0.0.1`.
2. The resolution order puts `files` (`/etc/hosts`) before `dns`, so the local file is read first —
   configured in `/etc/nsswitch.conf`.
3. Therefore the `localhost` lookup produces no network request, while `example.com` needs one and
   cannot get an answer.

**Explanation:**

The distinction being tested is *where the answer comes from*, not whether the
network happens to be up. A name found in `/etc/hosts` is resolved from disk and is immune to the
network's state; a name that is not in the file falls through to `dns` and depends entirely on the
network. Answers that say only "localhost is your own computer" describe what the name means without
explaining why it resolves, and miss the file and the ordering that do the actual work
(objectives 5, 6).
