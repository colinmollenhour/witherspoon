# Names become addresses

You can print your machine's LAN IPv4 address, and you know `127.0.0.1` means *this machine*. But
you have never typed an IP address into a browser on purpose. You type `example.com`. You type
`localhost`. Names — and the network underneath carries nothing but numbers.

So something converts one into the other before a single packet moves. That conversion is called
**resolution**, and nothing new happens at the network level: names are a convenience layer on top
of the addresses from Topic 11. A **hostname** is a label for a machine — `example.com`,
`localhost` — and it must be turned into an address to be of any use. What is new here is that on
your own machine, one of these lookups is answered by a plain text file you can open and read.

## Check for the tool before you reach for it

The tool that shows you a resolution is `dig` — "dig - DNS lookup utility" [src 71]. Use the habit
you built with `nano` in Topic 8: check before you assume.

```
which dig
```

A path means you have it. Silence means you do not, and what you do next depends on your machine.

| Platform | Situation |
| --- | --- |
| macOS | `dig` ships with the system, alongside `host` and `nslookup`. It was rumoured to have been removed in recent macOS releases; it was not [src 71]. |
| Debian, Ubuntu, WSL | Not preinstalled. `/usr/bin/dig` comes from the package `bind9-dnsutils` [src 73]. |

On Debian, Ubuntu, or WSL, install it with:

```
sudo apt install bind9-dnsutils
```

Older tutorials say `dnsutils` instead. That name still works, but it is only a "Transitional
package for bind9-dnsutils" [src 73] — a signpost left behind after a rename.

One warning for macOS learners, in Apple's own words: "The dig command does not use the host name
and address resolution or the DNS query routing mechanisms used by other processes running on
macOS." [src 72] So `dig` goes its own way there, and its answer can differ from the address your
browser actually uses. That is a real macOS difference, not a bug in your typing.

## `dig +short` — the answer with nothing attached

```
dig +short example.com
```

Run bare, `dig` prints a full diagnostic report: the question it asked, the sections of the reply,
timings, the server it talked to. `+short` throws all of that away and prints the answer itself —
one address per line, nothing else. Several addresses give several lines; a name that resolves to
nothing gives no output at all.

**This course will not show you the result.** Every other command output in these units is a real
capture; DNS was blocked where this material was captured, and an invented IP address would read
exactly like a true one. Run it yourself. The shape is the lesson: you asked with a name, you got
back an address.

Note what `dig +short` does *not* do. It does not fetch a page, download anything, or check whether
the machine at that address is switched on. It turns a name into a number and stops.

## The file that makes `localhost` work

Now the other kind of lookup. Read this file — it is plain text, and you already know how:

```
cat /etc/hosts
```

On the machine these units were captured from, the whole file is seven lines [src 27]. Two of them
are the ones that matter [src 68]:

```
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
```

The format is as simple as it looks: **an address, then every name that means that address.** The
first line hands the loopback address `127.0.0.1` five aliases, the first being `localhost`. The
second maps the same names for IPv6, written in that colon-shaped form because IPv6 is 128 bits
rather than 32 [src 53].

Stop on that first line and let it land, because it collapses two things you already own into one:

> **`127.0.0.1   localhost`** — Topic 11's loopback address on the left, and on the right a name you
> have typed a hundred times. There is no server involved. `localhost` is a nickname for "this
> machine", written down in a text file, on your disk, that you can open with `cat`.

macOS keeps the same file at the same path — hosts(5), "hosts — host name data base" [src 70].

`~/projects/first-site/index.html` is still nothing but a file on your disk — but the address you
will eventually use to open it in a browser begins with the word `localhost`, and you now know
exactly where that word is defined.

## Which one gets asked first

Two mechanisms, one question: which wins? On Linux the order is configured in `/etc/nsswitch.conf`,
the name service switch file, and you can read it:

```
grep ^hosts /etc/nsswitch.conf
```

The real captured line [src 69]:

```
hosts:          files mdns4_minimal [NOTFOUND=return] dns myhostname
```

Read it left to right: those are the sources to try, in order. `files` means `/etc/hosts`. `dns`
means ask a DNS server over the network. **`files` comes before `dns`** — the local file is
consulted first, every time. That one ordering explains both halves of this topic:

- **`localhost` needs no network.** The name is found on the first source tried, so the lookup
  finishes on your own disk. Unplug the Ethernet cable, switch off Wi-Fi, sit in a tunnel —
  `localhost` still resolves to `127.0.0.1`, because nothing was ever asked of anyone.
- **`/etc/hosts` outranks the entire internet, for one name.** Any name listed there is answered
  from the file and DNS is never consulted for it. That is real power in a seven-line text file.

```widget
{
  "type": "flow",
  "direction": "column",
  "title": "Where a name goes looking for its number",
  "steps": [
    {
      "label": "You type a name",
      "sub": "`localhost`, or `example.com`",
      "detail": "Nothing has moved on the network yet. The network carries only numbers, so this name has to become one before a single packet is sent."
    },
    {
      "label": "`files` — `/etc/hosts` is read",
      "sub": "first source in `nsswitch.conf`",
      "detail": "A plain text file on your own disk, consulted **every time**, before anything else. `localhost` is found here, on the line `127.0.0.1   localhost`, and the lookup ends — which is why `localhost` resolves in a tunnel with the Wi-Fi off."
    },
    {
      "label": "`dns` — a DNS server is asked",
      "sub": "only if the file had no answer",
      "detail": "This is the step `dig +short example.com` performs on its own. It goes out over the network, comes back with one address per line, and stops. It does not fetch a page or check whether the machine is switched on."
    },
    {
      "label": "An address comes back",
      "sub": "`127.0.0.1`, or a public IP",
      "detail": "Now a connection can be attempted. Everything from Topic 11 onwards operates on this number; the name has done its job and is gone — which is exactly why HTTP has to carry it again in a `Host:` header."
    }
  ],
  "caption": "`files` before `dns` is the whole of it: the local file outranks the entire internet, for any name it lists."
}
```

## Where this leaves you

You can turn a hostname into an IP address with `dig +short`, and you know the most familiar
hostname you own is not on the internet at all: `localhost` is a line in `/etc/hosts`, resolved from
disk, in the `files`-before-`dns` order set in `/etc/nsswitch.conf`.

So `localhost` is defined *per machine*. Your laptop's `localhost` is your laptop; the `localhost`
on any other device in the room is that device. Hold on to that — it is the hinge the course turns
on later.

An address still is not enough to reach anything. One machine runs many programs at once, and an
address names the machine, not the program. Topic 13 supplies the missing half.
