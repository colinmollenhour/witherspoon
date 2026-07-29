# WSL, and the shape of real hosting

Topic 19 ended with a phone loading `http://<LAN-IP>:8000` and the phone's address appearing in the
access log. If you are on WSL, that almost certainly did not happen, and not because you typed
something wrong. It is that "what is this machine's IP address?" has two correct answers on your
computer, and you were handed the wrong one.

## WSL 2 is a virtual machine, and that changes the question

WSL — the Windows Subsystem for Linux — runs Linux inside a virtual machine: a computer simulated in
software, with its own filesystem and, the part that matters here, its own network adapter. Microsoft
states the consequence directly:

> "This isn't the default case in WSL 2. WSL 2 has a virtualized ethernet adapter with its own unique
> IP address. Currently, to enable this workflow you will need to go through the same steps as you
> would for a regular virtual machine. (We are looking into ways to improve this experience.)"
> [src 136]

So there are two machines in your laptop. Windows has an address on your Wi-Fi; the Linux machine
inside it has a different one, on a private network that exists only between the two. WSL joins them
with NAT — Network Address Translation, the trick your home router plays on the whole house: many
machines behind one address, connections working outward but not inward. `networkingMode` still
defaults to `NAT` in 2026 [src 137].

That is why two of your three checks passed. Windows forwards `localhost` into WSL, so a Windows
browser reaches it "using `localhost` (just like you normally would)" [src 138], and `curl` inside WSL
works. Only the phone fails, because it has to come *inward*. The server is not at fault:
`python3 -m http.server` already "binds itself to all interfaces" [src 107].

## Make the ambiguity visible: two commands, one shell

Run both of these in your WSL shell, one after the other.

```
ip addr
ipconfig.exe
```

`ip addr` is the Linux command from Topic 11. Inside WSL it reports the *virtual machine's* address,
typically in the `172.16.0.0 - 172.31.255.255` private block [src 137, 47] — real, but on the
invisible network between Windows and WSL.

`ipconfig.exe` is a Windows program, and you just ran it from a Linux shell, because "WSL can run
Windows tools directly from the WSL command line using `[tool-name].exe`" [src 147] — a feature called
interop. It prints the *Windows* addresses, including the Wi-Fi one, usually a `192.168.x.x`. Two
commands, one shell, two answers, both true. Your phone needs the second — but pointing it there is
not enough, because nothing is listening over there yet.

## The fix, in order

**1. Turn on mirrored networking.** Create `.wslconfig` — it "does not exist by default. It must be
created and stored in your `%UserProfile%` directory" [src 148] — containing:

```
[wsl2]
networkingMode=mirrored
```

Microsoft: "On machines running Windows 11 22H2 and higher you can set `networkingMode=mirrored` under
`[wsl2]` in the `.wslconfig` file to enable mirrored mode networking", and the listed benefits include
"Connect to WSL directly from your local area network (LAN)" [src 140]. Mirrored mode is generally
available and sits in the main `[wsl2]` settings table; it is simply not the default [src 141].

**2. Restart the subsystem.** In PowerShell, run `wsl --shutdown`, then wait: "This typically takes
about 8 seconds after closing ALL instances of the distribution shell." [src 148] Reopen WSL and run
`ip addr` again — under mirrored mode it should now report the same address `ipconfig.exe` does.

**3. Open the Hyper-V firewall.** A second firewall sits in front of the virtual machine, and "on
machines running Windows 11 22H2 and higher, with WSL 2.0.9 and higher, the Hyper-V firewall feature
will be turned on by default" [src 144]. Microsoft's rule, run "in PowerShell window with admin
privileges", is:

```
New-NetFirewallHyperVRule -Name "MyWebServer" -DisplayName "My Web Server" -Direction Inbound -VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -Protocol TCP -LocalPorts 80
```

[src 142] The string in braces is the WSL VMCreatorId, `{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}`
[src 143] — it names WSL among the virtual machines on the box. Copy it character for character; a
mistyped GUID makes a rule that silently matches nothing. Change one thing: Microsoft's example opens
`80`, your server is on `8000`, so end the command `-LocalPorts 8000`. The ordinary Windows Firewall
from Topic 20 still applies too — it blocks "all incoming traffic, unless solicited or matching a
*rule*" [src 149], and unidentified Wi-Fi gets the stricter public profile [src 150].

**Windows 10 fallback only.** Mirrored mode needs Windows 11 22H2 or higher. On Windows 10 the
documented route is a port forward:

```
netsh interface portproxy add v4tov4 listenport=<yourPortToForward> listenaddress=0.0.0.0 connectport=<yourPortToConnectToInWSL> connectaddress=(wsl hostname -I)
```

[src 145] Note the capital `I`: "`wsl hostname -i` is your local machine (127.0.1.1 is a placeholder
diagnostic address), whereas `wsl hostname -I` will return your local machine's IP address as seen by
other machines" [src 146]. Lowercase gives you a placeholder and a forward that goes nowhere. This
rule also goes stale — the WSL machine's address can change on restart, leaving the forward pointing
at an address nobody has.

> **Before you start: this path is documented, not verified.**
> Every step above comes from Microsoft's own documentation. The *combination* — mirrored mode, plus a
> Hyper-V firewall rule on port 8000, plus a phone on Wi-Fi — appears as a worked example nowhere in
> those docs, no Windows machine was available to test it while this course was built, and Microsoft's
> issue tracker still has an open report (microsoft/WSL issue #10769) on exactly this friction. The
> Stack Overflow question "Connecting to WSL2 server via local network" — "None of the above have
> worked" — has 364,943 views [src 157]. So this is a documented procedure and a way to see where you
> are in it, not a promise. After each step, run `ip addr` and `ipconfig.exe` and compare, then reload
> the phone. If the two commands agree and the phone still fails, the suspect is a firewall, not the
> address.

## Now text the URL to a friend

Say your working address is `192.168.1.42`. Send `http://192.168.1.42:8000` to a friend across town
and ask them to open it. It fails.

Nothing broke. You already know why. RFC 1918 sets aside three blocks for private use:

```
     10.0.0.0        -   10.255.255.255  (10/8 prefix)
     172.16.0.0      -   172.31.255.255  (172.16/12 prefix)
     192.168.0.0     -   192.168.255.255 (192.168/16 prefix)
```

[src 47] And anyone may use them: "An enterprise that decides to use IP addresses out of the address
space defined in this document can do so without any coordination with IANA or an Internet registry."
[src 48] No coordination means no uniqueness. Your friend's network almost certainly has a
`192.168.1.42` of its own — their TV, maybe. Their phone asked their own network and got an honest
answer about a completely different machine. `192.168.1.42` is not a weak address; it is a *local*
address, meaningless outside the network you are standing in. NAT is what lets a house full of them
reach outward anyway: the router swaps in its own public address on the way out and remembers who to
hand the reply back to. Inbound, there is nothing to remember, and nobody outside can name you in the
first place.

## What a hosting provider actually sells

So name what would close that gap. A hosting provider sells three things:

| What you get | What it replaces |
| --- | --- |
| A publicly routable IP address | `192.168.1.42`, which every network on Earth also has |
| A persistent name pointing at that address | Typing an address by hand and retyping it when it changes |
| A machine that stays running | Your laptop, whose server dies when the lid closes |

That is the whole product: an address that is yours alone, a name that keeps pointing at it, and a
computer somebody else keeps powered on.

One straight warning about what you would put there. Python's own documentation says "http.server is
not recommended for production. It only implements basic security checks." [src 122] The reason is
concrete: "SimpleHTTPRequestHandler will follow symbolic links when handling requests which makes it
possible for files outside of the specified directory to be served." [src 123] A symlink is a file
that points at another file; on a public server, one pointing outside your project turns a teaching
tool into a way to read files you never meant to share.

## Where this leaves you

Twenty-one topics ago, `index.html` was something that appeared when you double-clicked it, from a
place you could not name. You can now name that place, write the file with a keyboard, build and
inspect it with commands, serve it over HTTP, read the request and response that carry it, and load it
on a second device by its address on your own network — and when it fails, you have an ordered way to
find out why instead of guessing.

Build a file. Find it. Serve it. Reach it. That is the machine, and you can work it.
