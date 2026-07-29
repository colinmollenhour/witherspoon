# Runbook — serving first-site on my own network

Written for: someone who has never used this machine. Written by: me, six months ago.

Platform: <macOS | Linux | WSL>

## Start

<The commands, in order, one per line, with what you should see after each one.>

1. `cd ~/projects/first-site`
   — you should see: nothing. That is what success looks like for `cd`.
2. `python3 -m http.server 8000`
   — you should see: `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...`
3. <how you find the LAN IP on this machine — the exact command>
   — you should see: <the shape of the answer, and how to tell the wrong line from the right one>
4. On the second device: `http://<LAN IP>:8000`
   — you should see: <the page>, and a new line in the server terminal starting with the second
     device's address.

## Check

<How to tell, from the serving machine alone, that the server is up and serving the right folder.>

- `curl -I http://127.0.0.1:8000/index.html`
  — good: `HTTP/1.0 200 OK` and `Content-type: text/html`
  — bad: <what a 404 means here, and what a charset on that Content-type line means>
- <the command that shows what is listening on 8000 on this platform, and what its output looks like>

## When it fails

<At least two real symptoms, keyed to what you actually see. One row per symptom.>

| What I see | What it means | What I do |
| --- | --- | --- |
| `OSError: [Errno 98] Address already in use` (`[Errno 48]` on macOS) | | |
| `PermissionError: [Errno 13] Permission denied` | | |
| A list of file names instead of my page | | |
| The phone fails instantly | | |
| The phone hangs, then fails | | |
| The phone shows nothing and no new line appears in the log | | |

## Stop

<How to stop the server, and how to confirm it stopped.>

- `Ctrl-C` in the server's terminal — it prints `Keyboard interrupt received, exiting.`
- <the command that confirms nothing is listening on 8000 any more>

## Teardown

<Everything this procedure opened, and how to close it. Be specific: name the rule, the setting, or
the list entry. If nothing was opened, say exactly that.>

- Server stopped: <yes/no, how>
- Firewall change made: <what, exactly — the rule name or setting — and the command or click that
  reverses it. Or: `No firewall change was made.`>
- <WSL only: the Hyper-V rule named `MyWebServer`, and whether `networkingMode=mirrored` was left in
  `%UserProfile%\.wslconfig`. Note that undoing that file needs the subsystem to fully stop and
  restart — about 8 seconds after closing ALL instances of the distribution shell.>
