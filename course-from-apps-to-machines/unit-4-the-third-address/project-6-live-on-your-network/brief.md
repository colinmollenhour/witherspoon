# Project 6 — Live on Your Network

**Type:** `interactive-form`
**Unit:** 4 — The third address

This is the last project. It finishes the file you started in Unit 1.

## Goal

Serve `~/projects/first-site/index.html`, load it on a second device on your Wi-Fi, prove it with the server's access log, and write a two-line runbook you could follow again in six months.

---

## How this works

Fill `starter/submission.txt`. Fields sit between `=== name ===` headers. Do not rename, reorder, or delete those headers. Paste captures; do not retype them.

| Field | What goes in it |
| --- | --- |
| `platform` | Exactly one of `macOS`, `Linux`, `WSL` |
| `lan_ip` | The serving machine's LAN IPv4 — one dotted quad |
| `phone_url` | The exact URL you typed on the second device |
| `curl_i_output` | Full output of `curl -I http://127.0.0.1:8000/index.html` on the serving machine |
| `access_log_lines` | At least two log lines: your curl (`127.0.0.1`) and the second device |
| `second_device_ip` | The address at the start of the second device's log line |
| `runbook` | The filled `runbook-skeleton.md` |
| `obstacles` | What broke, what it looked like, how you told which cause it was |

## Your tasks

1. Start `python3 -m http.server 8000` inside `~/projects/first-site`.
2. On the same machine: `curl -I http://127.0.0.1:8000/index.html`. Paste it.
3. Write your LAN IP. Type `http://<that-ip>:8000` on the phone (or a second computer on the same Wi-Fi).
4. Paste the access log. The second device must not be `127.0.0.1`.
5. Fill the runbook: start, stop, tear down.
6. Note what went wrong — or the checks that came back clean.

## On WSL

Reaching a WSL server from a phone is not the default, and this course has not verified the full mirrored-mode path end to end. If the phone cannot see it: try a second Windows browser via `localhost`, or write `WSL-PATH-B` in `second_device_ip` and say so in `obstacles`.

## What the scaffolding is for

A log line from your own laptop is not proof a phone connected. `phone_url` must use the LAN IP, not `localhost`.

## Expected output

`curl_i_output` starts `HTTP/1.0 200 OK`. `phone_url` is `http://<lan_ip>:8000`. The log has two different client addresses.

## Rules

- Serve `first-site`, not some other folder.
- Do not submit `127.0.0.1` as `lan_ip`.
- Do not edit `tests/`.

See `rubric.md` for how this is scored.
