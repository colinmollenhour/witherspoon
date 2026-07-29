# Rubric — Project 6: Live on Your Network

Four criteria. Integer weights summing to **100**.

| # | Criterion | Weight |
| --- | --- | --- |
| 1 | The log line proves a second machine | 35 |
| 2 | The runbook a stranger could follow | 25 |
| 3 | Obstacles are specific and honest | 20 |
| 4 | The evidence is internally consistent and self-produced | 20 |
| | **Total** | **100** |

---

### 1. The log line proves a second machine (35)

`access_log_lines` contains at least two lines in the server's real log shape — `<client> - - [<timestamp>]
"<request>" <status> <size>` — of which at least one has `127.0.0.1` (or another `127.0.0.0/8`
address) in the client field and at least one has the address submitted as `second_device_ip`. That
address parses as an IPv4 dotted quad, falls in one of RFC 1918's three private ranges, is not
inside `127.0.0.0/8`, and is not equal to `lan_ip`.

- **Full credit:** both lines present, `second_device_ip` non-loopback, RFC 1918, distinct from
  `lan_ip`, and the same address appears verbatim at the start of one submitted log line.
- **Zero:** every submitted line has a loopback client address; or `second_device_ip` equals
  `lan_ip`; or `second_device_ip` appears nowhere in `access_log_lines`. A loopback line is a
  request the serving machine made to itself and carries no evidence about a second machine at all.
- **WSL Path B substitution** (only when `platform` is `WSL` and `second_device_ip` is
  `WSL-PATH-B`): grade the diagnosis instead, at the same weight. Full credit requires all of — a
  `WSL-IP-ADDR:` line and a `WSL-IPCONFIG:` line giving the two different addresses the same shell
  reported; a line showing `networkingMode=mirrored` was set; the Hyper-V rule reproduced as it was
  run, carrying `{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}` and `-LocalPorts 8000`; a `STOPPED AT:`
  line naming the step it stopped at and what was observed there; and at least two well-formed log
  lines from the serving machine's own requests, proving a server really ran. Missing either address
  reading scores zero on this criterion — the two-command comparison is the diagnosis.

### 2. The runbook a stranger could follow (25) — *craft*

The `runbook` field is judged as an operational document, not as a list of correct commands. Ask:
could someone who has never touched this machine follow it in six months, on a bad day?

- **Full credit (21–25):** the commands appear in order and are runnable as written; each step says
  what you should see when it worked, so the reader can tell where they are; the **When it fails**
  section names at least two concrete failure symptoms and what to do about each — by their real
  strings or symptoms, e.g. `Address already in use` → find the owner with `ss -tlnp` or
  `lsof -i :8000`; a directory listing instead of the page → started in the wrong folder; a hang
  rather than an instant failure → something is dropping packets, not "nothing is listening"; the
  **Stop** section gives `Ctrl-C`; the **Teardown** section names the specific thing that was opened
  and how it was closed, or states plainly that nothing was opened.
- **Partial (11–20):** the commands are right and ordered, but the reader is given no way to tell a
  working step from a broken one, or the failure section is generic ("if it doesn't work, check the
  firewall") rather than symptom-keyed.
- **Low (1–10):** a transcript. Commands with no expected output, no failure branch, no teardown.
- **Zero:** missing, or does not include starting and stopping the server.

Do not award craft credit for length. A tight runbook that branches on symptoms beats a long one
that does not.

### 3. Obstacles are specific and honest (20)

`obstacles` is graded on specificity and truthfulness, not on drama. What is wanted is: what went
wrong, what it looked like on screen, what you checked, and how you knew which cause it was.

- **Full credit (17–20):** at least one obstacle described with the evidence that identified it —
  the exact error string, the command that produced it, and the reasoning that ruled out the other
  causes. "The phone hung rather than failing instantly, which meant something was swallowing the
  packets rather than nothing listening, so I checked the firewall before re-checking the address"
  is full credit. A learner who genuinely hit nothing gets full credit for saying so and naming the
  checks they ran that came back clean — including the `Outside:` line from step 8.
- **Partial (8–16):** an obstacle is named but not diagnosed ("the firewall was blocking it") with
  no account of how that was established rather than guessed.
- **Low (1–7):** vague, or contradicts the other fields.
- **Zero:** empty, or a generic obstacle that could have been written without touching a machine.

The `Outside:` line from step 8 must be present and must correctly attribute the failure to private
addressing rather than to a typo, a firewall, or the server being off. Missing it costs 5 of the 20.

### 4. The evidence is internally consistent and self-produced (20)

The submitted fields agree with each other and bear the fingerprints of this learner's own server.

- `curl_i_output` starts `HTTP/1.0 200` — not `HTTP/1.1`, which `python3 -m http.server` does not
  answer with by default — and carries a `Server: SimpleHTTP/<version> Python/<version>` line.
- `Content-type: text/html` appears with no charset parameter, which is what a stored file gets; a
  `charset=utf-8` there is the generated directory listing and means the server was started in the
  wrong directory.
- `phone_url` is `http://` + the submitted `lan_ip` + `:8000`. A `phone_url` of
  `http://localhost:8000` is the misconception Unit 6 exists to remove and scores zero here.
- `lan_ip` is a bare dotted quad in RFC 1918 space.
- `platform` matches the commands and paths quoted elsewhere in the submission.

**Zero** if the captures cannot be the learner's own — an `HTTP/1.1` response line, a missing or
malformed `Server:` header, or headers that contradict the platform or the log.
