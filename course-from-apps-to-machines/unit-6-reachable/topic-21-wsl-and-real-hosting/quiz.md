# Quiz — WSL, and the shape of real hosting

---

## Question 1

**Type:** MULTIPLE_CHOICE

You are on WSL. `python3 -m http.server` prints `Serving HTTP on 0.0.0.0 port 8000`, a Windows browser
loads `http://localhost:8000` perfectly, and `curl http://localhost:8000` inside WSL returns the page.
Your phone, on the same Wi-Fi, cannot load the address `ip addr` reported. What is the actual cause?

- The server is bound to `127.0.0.1`, so it refuses connections from other machines
- Port 8000 is not a registered HTTP port, so phones will not open it
- `ip addr` reported the WSL virtual machine's own address, which exists only between Windows and WSL, and nothing routes inbound to it
- The phone is on a different Wi-Fi network from the laptop

**Correct option index:** 2

**Explanation:** WSL 2 "has a virtualized ethernet adapter with its own unique IP address", so `ip
addr` inside WSL answers a different question than "what address does my Wi-Fi know this laptop by?"
The NAT between Windows and WSL carries connections outward but routes nothing inward, which is
exactly why the two local checks pass and the phone fails. The server is not bound to `127.0.0.1` —
the banner says `0.0.0.0`, and Python's docs confirm it "binds itself to all interfaces", so option
one contradicts evidence already on screen. Port 8000's registry status has no effect on whether a
browser will connect to it. And "wrong Wi-Fi" is a real failure but would not produce this exact
pattern of two passes and one failure on a machine where WSL's own address was used (objective 7).

---

## Question 2

**Type:** MULTIPLE_CHOICE

You are sitting in a WSL shell and you need the address your phone should type. Which command prints
the Windows machine's LAN address?

- `ip addr`
- `hostname -i`
- `hostname -I`
- `ipconfig.exe`

**Correct option index:** 3

**Explanation:** `ipconfig.exe` is a Windows program, and WSL's interop feature means "WSL can run
Windows tools directly from the WSL command line using `[tool-name].exe`" — so it reports the Windows
side, including the Wi-Fi address. `ip addr` is the Linux command and reports the WSL virtual
machine's address, typically a `172.x` one, which is the address that got you stuck. `hostname -i` is
worse than useless here: Microsoft notes "`wsl hostname -i` is your local machine (127.0.1.1 is a
placeholder diagnostic address)". `hostname -I` does return "your local machine's IP address as seen
by other machines", but the local machine in a WSL shell is the WSL virtual machine — that is why the
Windows 10 `netsh portproxy` fallback uses it as the *destination* of a forward, not as the address
you hand to a phone (objective 8).

---

## Question 3

**Type:** TRUE_FALSE

Once `http://192.168.1.42:8000` loads on your phone, you can text that same URL to a friend across
town and they will reach your server, because `192.168.1.42` is a real address that works everywhere.

**Correct answer:** false

**Explanation:** The opposite is true, and "real address" is exactly the misreading. `192.168.1.42`
comes from an RFC 1918 private block, and anyone may use those blocks "without any coordination with
IANA or an Internet registry" — so millions of networks contain that address, including, very likely,
your friend's. Their phone asks their own network and gets an honest answer about somebody else's TV.
The address is not weak or partial; it is local, and it identifies a machine only inside the one
network you are standing in (objective 9).

---

## Question 4

**Type:** MULTIPLE_CHOICE

Your friend across town still cannot load your page. Which of these is the thing a hosting provider
would actually give you that your laptop cannot?

- A faster HTTP server than `python3 -m http.server`
- A publicly routable address, a persistent name pointing at it, and a machine that stays running
- A stronger Wi-Fi signal so devices further away can connect
- Permission to use port 80 instead of port 8000

**Correct option index:** 1

**Explanation:** Those three things are the product: an address that is yours alone rather than one
every home network on Earth also has, a name that keeps pointing at it, and a computer somebody else
keeps powered on when your lid closes. Server software is a separate question — you would indeed swap
`python3 -m http.server` out, since Python's docs say it "is not recommended for production", but a
faster server on a private address is still unreachable. Wi-Fi range is irrelevant: your friend's
problem is that the address means something else on their network, not that they are too far from your
router. And port 80 changes only whether the `:8000` must be typed; a private address on port 80 is
just as unreachable (objective 9).

---

## Question 5

**Type:** SHORT_ANSWER

A WSL learner runs `ip addr` and gets an address inside `172.16.0.0 - 172.31.255.255`, then runs
`ipconfig.exe` in the same shell and gets `192.168.1.42`. They say "none of these work" and are ready
to give up. Explain which address their phone should use, why the other one appeared, and what still
has to change before the phone can connect.

**Sample answer:** The phone should use `192.168.1.42`, the Windows address from `ipconfig.exe`,
because that is the address the Wi-Fi network knows the laptop by. The `172.` address came from `ip
addr` because WSL 2 is a virtual machine with its own ethernet adapter, so it has a separate NAT'd
address on a private network that exists only between Windows and WSL. Typing the Windows address
alone is not enough: WSL still defaults to `NAT`, so `networkingMode=mirrored` has to go under
`[wsl2]` in `%UserProfile%\.wslconfig`, followed by `wsl --shutdown` and about eight seconds; then a
Hyper-V firewall rule has to allow inbound TCP on port 8000, because that firewall is on by default.

**Explanation:** A grader must see three things: that `ipconfig.exe`'s address is the one the phone
needs, that the `172.` address is the WSL virtual machine's own NAT'd address rather than a wrong
answer, and that at least one further change is required — mirrored mode, the restart, or the Hyper-V
firewall rule. The trap is treating this as a choice between two addresses only, which is where the
364,943-view "Connecting to WSL2 server via local network" thread lives: the learner tries both
addresses, both fail, and concludes the machine is broken. Both commands are telling the truth; the
address is only half the problem, and nothing inbound is routed until the networking mode and the
firewall are changed (objectives 7, 8).

---
