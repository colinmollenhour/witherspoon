# Tests — Project 6: Live on Your Network

Five parsers. Each one reads the learner's filled-in `submission.txt`, prints `PASS` on
success, and on failure prints one line beginning `FAIL:` that says which shortcut or
mistake it found. Standard library only; no network access; the submission file is the
only input.

```
python3 tests/test_01_curl_is_your_own_server.py path/to/submission.txt
```

The path may also be given in the `SUBMISSION` environment variable; it defaults to
`submission.txt` in the working directory.

| Test | Weight | Expected output | Catches |
| --- | --- | --- | --- |
| `test_01_curl_is_your_own_server` | 20 | `PASS` | **Adversarial** — `curl_i_output` pasted from a tutorial or another web server: the response must start `HTTP/1.0 200`, never `HTTP/1.1`, and must carry a `Server: SimpleHTTP/<v> Python/<v>` header. Also catches the wrong serving directory via `Content-type: text/html; charset=utf-8`, which only a generated listing sends. |
| `test_02_second_device_is_not_loopback` | 30 | `PASS` | **Adversarial** — a `second_device_ip` inside `127.0.0.0/8` (a `curl` from the serving machine dressed up as a phone) and a `second_device_ip` equal to `lan_ip` (the learner's own address read back). Also validates `lan_ip` as RFC 1918, and handles the WSL Path B diagnostic record. |
| `test_03_access_log_carries_second_device` | 25 | `PASS` | A `second_device_ip` that appears nowhere in the submitted log, log lines not in the server's real output shape, and a submission with no loopback baseline line. |
| `test_04_phone_url_matches_lan_ip` | 15 | `PASS` | **Adversarial** — `http://localhost:8000` submitted as the phone URL, a missing `:8000`, a `file://` URL, and a host that disagrees with `lan_ip`. |
| `test_05_runbook_starts_stops_and_closes` | 10 | `PASS` | A runbook with no start command, no stop instruction, or no filled-in `## Teardown` section — and on WSL, a teardown that never names the `MyWebServer` rule it created. |
| | **100** | | |

## The submission format

`submission.txt` is plain text. A line of the form `=== field_name ===` opens a field;
everything up to the next such line is that field's value. Lines beginning with `;;` are
template comments and are stripped by every parser. Field values are stripped of leading
and trailing blank lines.

Fields, in order: `platform`, `lan_ip`, `phone_url`, `curl_i_output`, `access_log_lines`,
`second_device_ip`, `runbook`, `obstacles`.

## WSL Path B

`second_device_ip` may be the literal string `WSL-PATH-B`, and only when `platform` is
`WSL`. The WSL route to a phone is documented by Microsoft but was not verified end to end
by this course, so a learner who follows it and cannot get any second machine onto the
server is graded on the diagnosis instead, at full weight. Tests 02 and 03 branch on the
sentinel; tests 01, 04 and 05 apply unchanged. On macOS or Linux the sentinel is a failed
submission, not a shortcut.
