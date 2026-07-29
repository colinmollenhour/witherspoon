# Loopback versus the network

Your phone is on the same Wi-Fi. Your laptop is serving `~/projects/first-site/index.html` — the file
you built by hand in Unit 1, rebuilt by keyboard in Unit 2, and generated from command output in
Unit 3. You typed `http://localhost:8000`
into the phone's browser and got nothing. Here is the part that is going to annoy you: **the server
was never misconfigured.** It has been reachable from your phone this whole time. Nothing on your
laptop needs to change. You handed the phone an address that told it not to look.

## What your phone actually did

You have already read the file that explains this. In Topic 12 you ran `cat /etc/hosts` and this line
was in it:

```
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
```

And you checked the resolution order, where `files` comes before `dns`:

```
hosts:          files mdns4_minimal [NOTFOUND=return] dns myhostname
```

Your phone resolves that name the same way, from its own local table. So when you typed `localhost`
on the phone, the phone did not send a question to the network — it answered itself, instantly, and
got `127.0.0.1`.

Now recall what `127.0.0.1` is. RFC 1122 lists it as address form:

> "(g)  { 127, <any> }" — "Internal host loopback address.  Addresses of this form MUST NOT appear
> outside a host."

RFC 6890 says the same thing in a table: block `127.0.0.0/8`, name `Loopback`, `Forwardable | False`,
`Global | False`. **Not forwardable** means no router will ever carry it anywhere. It is a loop back
into the machine that spoke it.

So `127.0.0.1` is not one address that several computers share. Your phone has one. Your laptop has
one. They are different machines. Your phone asked *itself* for port 8000, found nothing listening
there, and gave up. Not one packet left the phone, the laptop never heard the question, and the access
log on your laptop stayed silent — go check it. You are in good company: someone asking to reach their
server "using **localhost and not the servers IP**" sits in a cluster with 903,096 views.

## Three strings people mash together

`127.0.0.1`, `localhost`, and `0.0.0.0` get treated as three spellings of one idea. "What is the
difference between 0.0.0.0, 127.0.0.1 and localhost?" has been read 379,882 times. They are three
different kinds of thing.

| String | What kind of thing it is | What it means |
| --- | --- | --- |
| `127.0.0.1` | An **address** — a destination you can send to | *This machine*, on whichever machine is asking |
| `localhost` | A **name** for that address, defined in a plain text file you have read | The same thing, one `/etc/hosts` lookup later |
| `0.0.0.0` | **Not a destination at all** — a *bind instruction* | "Accept connections arriving on any interface" |

That third row resolves your problem. **Binding** is what a server does when it starts: it tells the
operating system which network interfaces it wants to receive connections on. An **interface** is one
of your machine's connections to a network — your Wi-Fi adapter is one; the loopback device `lo`,
which only ever talks to itself, is another. A server bound to `127.0.0.1` hears only the loopback.
A server bound to `0.0.0.0` hears all of them.

`0.0.0.0` answers "what should I listen on", never "who should I talk to". Typing it into a browser
was never the fix.

## Now go re-read your own banner

Scroll up in the terminal where your server is running. It printed this the second it started:

```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

There it is. `0.0.0.0`. Not `127.0.0.1`. Since Topic 18 it has been telling you it accepts connections
on every interface your laptop has, including the Wi-Fi one your phone is sitting on. The Python
documentation states it flatly:

> "By default, the server binds itself to all interfaces."

On Linux, `ss -ltn` lists listening sockets and confirms it from outside the server:

```
LISTEN 0      5            0.0.0.0:8000
```

Microsoft's networking guide gives the general rule that trips people up in other tools — "you may
need to bind your application to `0.0.0.0` instead of `127.0.0.1`" — and `python3 -m http.server`
already did it for you. Nothing to fix, no flag to add, no restart.

## WSL learners: this one is not yours yet

Stop here and go to Topic 21. Microsoft is direct about why:

> "This isn't the default case in WSL 2. WSL 2 has a virtualized ethernet adapter with its own unique
> IP address."

The address you are about to find belongs to a virtual adapter inside Windows, not to your laptop as
your phone sees it. No amount of retyping will make it work, and it is not your mistake. Topic 21 is
built for this. Do not grind on it here.

## Find the address the phone can actually reach

You did this in Topic 11. Same commands.

**Linux and WSL:**

```
ip addr
```

You will get one block per interface. Ignore the one called `lo` — that is loopback, and its line
reads exactly this, which you have seen before:

```
inet 127.0.0.1/8 scope host lo
```

The address you want is the `inet` line on your Wi-Fi interface.

**macOS** has no `ip` command at all, and it takes two steps because Wi-Fi is not reliably `en0` —
Apple Silicon Macs have been reported as `en2`. Find the interface first:

```
networksetup -listallhardwareports
```

Then ask that interface for its address:

```
ipconfig getifaddr en0
```

Apple's own description of `getifaddr` includes the failure mode: it "Prints to standard output the IP
address for the first network service associated with the given interface. The output will be empty if
no service is currently configured or active on the interface." **Empty output means you named the
wrong interface** — go back to the list and pick another.

Sanity-check whatever you got against RFC 1918's private blocks, quoted exactly:

```
     10.0.0.0        -   10.255.255.255  (10/8 prefix)
     172.16.0.0      -   172.31.255.255  (172.16/12 prefix)
     192.168.0.0     -   192.168.255.255 (192.168/16 prefix)
```

If your address falls in one of those three, it is a normal home-network address and you have the
right one. If it starts with `127.`, you grabbed the loopback line by mistake.

## Type it on the phone and watch the log

Put the phone on the same Wi-Fi. Then, in its browser:

```
http://<LAN-IP>:8000
```

`:8000` is not optional — a browser only omits the port when the server is on the standard one, and
yours is not.

Before you press go, put the laptop's terminal where you can see it, because the proof appears there.
Every request your server answers gets one line. This is a real one, from a request the laptop made to
itself:

```
127.0.0.1 - - [29/Jul/2026 04:26:16] "GET /nope HTTP/1.1" 404 -
```

The first field is **the address of whoever asked**. Every line you have generated so far says
`127.0.0.1`, because every request so far came from the laptop itself.

When the phone loads the page, a new line appears with the same shape — timestamp, request line,
status code, and a `-` where the size would go — but the first field is your *phone's* address, not
`127.0.0.1`. That line is the whole point of this unit. It is a packet that crossed your Wi-Fi, hit
your laptop's network interface, and was answered. And it is what Project 6 grades: not a screenshot
of the page, the log line.

## If it still will not load

You are on macOS or Linux, the address is in an RFC 1918 range, the banner says `0.0.0.0`, and the
phone still shows nothing — and critically, **no new line appeared in the log at all.** That means the
request never reached your server, so nothing you type at the server will help. Go to Topic 20, which
is a diagnostic order for exactly that situation. Do not start changing things at random here.

## Where this leaves you

Your page is loading on a device you are holding, served by a machine across the room, over an address
you found yourself — and you have the log line that proves the connection was real. The Unit 5 wall is
down.

That address works because your phone and your laptop are on the same network. Hand the same URL to a
friend across town and it will fail, and this time it will not be because you typed the wrong thing.
That is where the course finishes.
