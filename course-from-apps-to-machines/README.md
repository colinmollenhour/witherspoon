# Out of the Sandbox

Start with a file you can only open by double-clicking. Finish with that same page loading on your phone across the room — no coding required.

---

## About

You already know how to open a file: you tap it. A computer does not tap. It needs an address. That mismatch is why a terminal feels impossible, and why `it works on my laptop` is not the same as `it works on my phone`.

You make one page at `~/projects/first-site/index.html` and carry it the whole way. Unit 1: create it with a mouse and read its `file://` URL. Unit 2: delete it, rebuild it from the keyboard, then generate it with `>` and `|`. Unit 3: find the machine's LAN IP, start `python3 -m http.server 8000`, load `http://localhost:8000` — then type that same URL on your phone. Unit 4 is why it failed, the third address, and a two-line runbook.

You need a Mac, a Linux machine, or Windows with WSL; a phone on the same Wi-Fi; and no prior experience. You do not need to code, and this course does not teach coding — HTML is a text file a browser happens to render. Every number and error message traces to a primary source in [`SOURCES.md`](SOURCES.md). Where something could not be checked, the course says so.

---

## What you'll be able to do

**Open any file** — Write the path to a file on your machine and open it — from the file manager or from a terminal.

**Drive the folder** — Create, move, and delete files from the shell without reaching for the mouse.

**Generate a page** — Catch command output with `>` and `|` so `index.html` is printed, not typed.

**Find the machine** — Print your LAN IP, place it in a private block, and say what is listening on which port.

**Serve the page** — Run a server on port 8000, read the HTTP conversation, and load the same file on a second device.

---

## Syllabus

### Unit 1 — One file, one address
You already know how to tap something open. This unit makes one page on the laptop and shows you the address the computer actually uses. You leave holding `~/projects/first-site/index.html` and its `file://` URL. Next you throw the mouse away.

1. **Make the page** — Create `index.html` with the file manager, double-click it, read the `file://` URL.
2. **The address of a file** — Absolute vs relative, `~` `.` `..`, and why `Index.html` is a trap.
3. **What's actually in the file** — Bytes, the extension is a hint, one `ls -la` line, editor vs browser.

**Project: Ground Zero** — build the file with the mouse; capture path, `file://` URL, click count.

### Unit 2 — No mouse
The shell always stands in one folder. Once you feel that, you rebuild the page from the keyboard, then stop typing it and generate it. You leave holding the same folder, rebuilt, then generated. Next the file stays put and you look at the machine.

4. **The shell stands somewhere** — `pwd`, `ls`, `cd` — the same command, two folders, two listings.
5. **Build it without a mouse** — `mkdir -p`, `touch`, `cp`, `mv`, `rm` — and `rm` has no trash.
6. **Generate the page** — `>`, `>>`, and `|` — the file is printed, not typed.

**Projects: Cold Start** — delete and rebuild, eight commands or fewer. **Generated Page** — `index.html` and a manifest from command output.

### Unit 3 — A second address
Files have addresses. So do machines. You find your LAN IP, see what is listening, start a real server, and load the page at `http://localhost:8000`. Then you type that same URL on your phone. You leave holding a working laptop URL and a phone that cannot see it.

7. **Your machine has an address** — Print the LAN IP. Place it in an RFC 1918 block. `127.0.0.1` is this computer.
8. **Ports are doors** — `host:port`, why 8000, what is listening.
9. **Start a server** — `python3 -m http.server 8000` in `first-site`. Open `http://localhost:8000`.
10. **Read the conversation — then try your phone** — Take the URL apart, `curl -v` your server, then open it on the phone.

**Projects: Network Self-Portrait · HTTP Field Notes**

### Unit 4 — The third address
The phone failed because it asked itself. You put the LAN IP you already have into the phone, read the access log, and write a two-line runbook. You leave holding the same file at its third address.

11. **The phone's address is not yours** — `0.0.0.0` vs `127.0.0.1`. `http://192.168.x.x:8000` on a second device.
12. **A two-line runbook** — Start, stop, the three usual breaks, and what hosting actually sells you.

**Project: Live on Your Network**

---

## FAQ

**What makes this different from the free tutorials?**
Most treatments start one step past where you are and stop one step short of the payoff. MIT's Missing Semester assumes a computer-science course already in progress and never covers networking. CS50 puts you in a browser container so you never touch your own machine. Codecademy teaches `pwd` inside an in-browser terminal, so you never learn that the shell has a real location. MDN's local-server page is the closest — and it opens with "You need to first know how the Internet works" and never mentions reaching your server from another device. Nobody walks the bridge: a file on disk as `file://`, then `http://localhost:8000`, then your phone at `http://192.168.x.x:8000`. Same file, three addresses.

**Do I need to know how to code?**
No — and you will not learn to here. `index.html` is a text file a browser happens to render. You never learn HTML as a language. What you learn is everything a developer picks up around the code in their first couple of years and almost never teaches out loud.

**What hardware and software do I need?**
A Mac, a Linux machine, or Windows 10 build 19041+ / Windows 11 with WSL. A phone or second computer on the same Wi-Fi for the last project. On a Mac, `python3` will ask you to install the command-line developer tools — run `xcode-select --install` when the dialog appears, before you reach the server topic. Topic 1 has a short "on your machine" box; the rest of the course is written in the Linux dialect.

**Is the Windows path as good as the Mac and Linux paths?**
Honestly, no — and the course says so where it matters. WSL 2 has its own virtual network adapter. Microsoft's docs say reaching a WSL server from your LAN "isn't the default case in WSL 2." The last topic gives the documented fix (mirrored networking plus a Hyper-V firewall rule) and says plainly that combination was not verified end to end on a Windows machine here. There is a defined fallback instead of a promised outcome we cannot stand behind.

**Why does the course make me fail on purpose?**
Because the failure is the lesson. At the end of Unit 3 your server works on the laptop and your phone cannot load it — after you did everything right. Meeting that on purpose, with the reason named in the next unit, beats meeting it alone at 1am and deciding you broke something.

**How is this graded?**
Six projects. Each one is checked by scripts that read real evidence from your own machine — your actual `curl` output, your actual access log. The tests catch the shortcuts people try: submitting `127.0.0.1` as a LAN IP, pasting a generic `HTTP/1.1 200 OK` from a tutorial, or offering a log line from your laptop as proof your phone connected.

---

## Grounding

Every load-bearing claim traces to [`SOURCES.md`](SOURCES.md). The **Ungrounded** section at the end of that file lists what could not be verified and what was done about each item.
