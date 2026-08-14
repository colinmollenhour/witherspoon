The page already loads on the phone.
`http://192.168.x.x:8000` works.
Keep that.

Open a terminal and type these two commands:

```bash
cd ~/projects/first-site
python3 -m http.server 8000
```

That is how you start.
A **runbook** is a short list of commands you keep, so you do not have to invent them again.

When you are done, press Ctrl-C in that same terminal.
The server prints `Keyboard interrupt received, exiting.`
That is how you stop.

Write both lines down. That is the whole runbook.

Start from `~/projects/first-site`, on port 8000.
Stop with Ctrl-C.

If start prints `OSError: [Errno 98] Address already in use`, a leftover server still holds the door.
Skip to the next heading. You will free it, then come back.

If it started, open the phone again at `http://192.168.x.x:8000`.
The page is still there.
Press Ctrl-C.
Start from the runbook again.
The page comes back.
That is what repeatable means.

## When start fails

Two errors look fatal. Neither one is.

Start the server a second time, in a new terminal, while the first one is still up.
Linux prints:

```
OSError: [Errno 98] Address already in use
```

On a Mac the number is 48, not 98.
The wording is the same.

This is not a broken machine.
The door is already taken.
A leftover `python3` from last time is the usual owner.

Find the owner. Then stop it.

```bash
ss -tlnp
```

Look for `:8000`.
The process column names what holds the door.

> **On a Mac.** There is no `ss`. Use `lsof -iTCP -sTCP:LISTEN -P -n` and look for `:8000`.

If the owner is your leftover server, go to its terminal and press Ctrl-C.
Then start again from `~/projects/first-site`.

The other error is a different door.

```bash
python3 -m http.server 80
```

That prints:

```
PermissionError: [Errno 13] Permission denied
```

Ports below 1024 are **privileged**.
Only a privileged process may claim them.
80 sits below that line.
8000 does not.
That is why 8000 works and 80 does not.
Stay on 8000.

> **On a Mac.** Treat privileged ports as a Unix convention. Linux documents the line at 1024. Do not look for a Linux setting on macOS.

## The phone still cannot reach it

Work the three usual causes in order.
Each check kills a whole class of failure.

```widget
{
  "type": "order",
  "title": "The phone cannot reach the page",
  "prompt": "Put the checks in the order that eliminates a class of failure each time.",
  "items": [
    "Is the server running?",
    "Is it serving the right directory?",
    "Is the phone using the LAN IP, not localhost?",
    "Is a firewall blocking the door?"
  ],
  "caption": "Three usual causes first. The firewall is next, not first."
}
```

**Is the server running?**
If the terminal is gone, the server is gone.
Start it from the runbook.

**Is it serving the right directory?**
The server serves the folder you stood in when you started it.
Start from anywhere else and the phone sees that folder instead.
If you started from `~`, it will not see `~/projects/first-site/index.html`.
Stop with Ctrl-C.
Start again from `~/projects/first-site`.

**Is the phone using the LAN IP, not localhost?**
`localhost` means the machine that is asking.
On the phone, that is the phone.
The URL is `http://192.168.x.x:8000`, the same one that already worked.

Then the firewall.
A **firewall** is software that can block a door even when a program is listening.
Check it. Do not assume it is off.

> **On a Mac.** An alert may ask if you want to allow or deny the connection over the network or internet. Allow it. Open the firewall settings and look. This course does not claim a default.

If the laptop browser works and the phone still fails, the firewall is the next suspect.

## On Windows / WSL

WSL 2 does not share the LAN by default.
**NAT** is that default layout.
NAT is still the default in 2026.
**Mirrored mode** lets the LAN reach WSL.
It is recommended, not default.

The documented fix is two steps.

Create `%UserProfile%\.wslconfig` if it is missing.
It lives in your Windows user folder, not inside Ubuntu.
Put this in it:

```
[wsl2]
networkingMode=mirrored
```

Close every Ubuntu window.
Wait about 8 seconds.
Then open one again.

On Windows 11 22H2 and higher, with WSL 2.0.9 and higher, the Hyper-V firewall is on by default.
You also need a Hyper-V firewall rule for inbound TCP.
Microsoft's documented example:

```
New-NetFirewallHyperVRule -Name "MyWebServer" -DisplayName "My Web Server" -Direction Inbound -VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -Protocol TCP -LocalPorts 80
```

The string in braces is the WSL VMCreatorId.
Copy it character for character.

This combination — mirrored mode, a Hyper-V rule, and a phone on Wi-Fi — is documented.
It is **not verified end-to-end by this course**.

If the phone still fails, do not grind.
Use a second device that is not a phone.
Or open the page in the Windows browser via localhost.
That forwarding works even when the LAN path does not.

## What a host sells

A `192.168` address is private: unique on your LAN, not on the internet.
A friend across town cannot load `http://192.168.x.x:8000`.
Their packets never find your network.
A host sells you a public address; your private one stops at your router.
You do not need that yet.

You have a two-line runbook.
You can start the server, stop it, and work the three usual breaks.
The same file is at its third address: `http://192.168.x.x:8000`.
